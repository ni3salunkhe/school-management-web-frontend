// src/components/account/Transactions/Forms/ContraPaymentForm.js

import React, { useState, useEffect } from "react";
import { Plus, FileText, XCircle, Landmark, Repeat } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../services/api.service";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { BiIdCard } from "react-icons/bi";

// Initial form state for Contra Entry
const initialFormData = {
  createDate: new Date().toISOString().split("T")[0],
  entryDate: new Date().toISOString().split("T")[0],
  tranType: "Contra",
  amount: "",
  narr: "",
  schoolUdise: "",
  img: null,
  billNo: "",
  payerAccountId: "", // From Account
  receiverAccountId: "", // To Account
};

const ContraPaymentForm = ({ isEditMode = false, transactionId = null }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [contraAccounts, setContraAccounts] = useState([]); // Unified list for Cash & Bank accounts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payerBalance, setPayerBalance] = useState(0);
  const [receiverBalance, setReceiverBalance] = useState(0);
  const staffId = jwtDecode(sessionStorage.getItem("token"))?.id;
  const navigate = useNavigate();

  const fetchAccountBalance = async (
    subheadId,
    head,
    isBankAccount = false
  ) => {
    const datas = await apiService.getdata("generalledger/");

    const opnNBalance = (datas.data || []).find(
      (b) =>
        b.entryType === "Opening Balance" &&
        (b.custId && Number(b.custId.custId)) === Number(subheadId)
    );
    const transBalance = (datas.data || []).filter(
      (b) =>
        (b.entryType === "Cash Receipt" ||
          b.entryType === "Bank Reciept" ||
          b.entryType === "Contra Payment" ||
          b.entryType === "Expense Payment") &&
        (b.custId && Number(b.custId.custId)) === Number(subheadId)
    );
    console.log("transaction balance 2", transBalance);

    const transBalance2 = (datas.data || []).filter(
      (b) =>
        (b.entryType === "Cash Payment" ||
          b.entryType === "Bank Payment" ||
          b.entryType === "Contra Payment" ||
          b.entryType === "Expense Payment") &&
        (b.custId && Number(b.custId.custId)) === Number(subheadId)
    );
    console.log("transaction balance 2", transBalance2);

    if (head === "Liabilities") {
      const transBalance = (datas.data || []).filter(
        (b) =>
          (b.entryType === "Contra Payment" ||
            b.entryType === "Expense Payment" ||
            b.entryType === "Bank Payment" ||
            b.entryType === "Bank Reciept") &&
          (b.custId && Number(b.custId.custId)) === Number(subheadId)
      );
      console.log("transaction balance 2", transBalance);

      const transBalance2 = (datas.data || []).filter(
        (b) =>
          (b.entryType === "Contra Payment" ||
            b.entryType === "Expense Payment" ||
            b.entryType === "Bank Payment" ||
            b.entryType === "Bank Reciept") &&
          (b.custId && Number(b.custId.custId)) === Number(subheadId)
      );

      let trans = 0;
      transBalance2.map((a) => (trans += a.crAmt));
      console.log(trans);
      let transactionAmt = 0;
      transBalance.map((a) => (transactionAmt += a.drAmt));

      const amt = opnNBalance.crAmt + trans - transactionAmt;
      return amt;
    }
    let trans = 0;
    transBalance2.map((a) => (trans += a.crAmt));
    console.log(trans);
    let transactionAmt = 0;
    transBalance.map((a) => (transactionAmt += a.drAmt));
    const amt = opnNBalance.drAmt + transactionAmt - trans;
    return amt;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        const decodedToken = jwtDecode(token);
        const udiseNo = decodedToken?.udiseNo;
        if (!udiseNo) throw new Error("UDISE number not found in token");

        setFormData((prev) => ({ ...prev, schoolUdise: udiseNo }));

        const [banksResponse, partiesResponse] = await Promise.all([
          apiService.getbyid("bank/byudiseno/", udiseNo),
          apiService.getbyid("customermaster/getcustomersbyudise/", udiseNo),
        ]);

        const allParties = partiesResponse.data || [];
        const allBanks = banksResponse.data || [];

        const unifiedAccounts = [];

        // Add Cash In Hand account
        const cashAccount = allParties.find(
          (p) => p.custName.toLowerCase() === "cash in hand"
        );
        if (cashAccount) {
          unifiedAccounts.push({
            id: cashAccount.custId,
            name: "Cash In Hand",
            subheadId: cashAccount.subheadId?.subheadId,
            type: "cash",
            headId: cashAccount.headId.headId,
            headName: cashAccount.headId.bookSideMaster.booksideName,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "जनरल लेजर मध्ये ताळेबंद मधील एंट्री भरा किंवा Cash In Hand हा ग्राहक आपल्या सिस्टम मध्ये असल्याची खात्री करा!",
          });
          navigate("/clerk/dashboard");
          return; 
        }
        console.log(cashAccount);

        // Add Bank accounts
        allBanks.forEach((bank) => {
          if (bank.custId && bank.custId.custId) {
            unifiedAccounts.push({
              id: bank.custId.custId,
              name: `${bank.bankname} - ${bank.accountno}`,
              subheadId: bank.custId.custId,
              type: "bank",
              headId: bank.headId.headId,
              headName: bank.headId.bookSideMaster.booksideName,
            });
          }
        });

        setContraAccounts(unifiedAccounts);

        if (isEditMode && transactionId) {
          console.log("Edit mode for contra is not fully implemented yet.");
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(`Failed to load initial data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [isEditMode, transactionId]);

  const handleAccountChange = async (e) => {
    const { name, value } = e.target;
    setError(null);

    const selectedAccount = contraAccounts.find(
      (acc) => acc.id === parseInt(value)
    );

    if (name === "payerAccountId") {
      setFormData((prev) => ({
        ...prev,
        payerAccountId: value,
        receiverAccountId: "",
      }));
      setReceiverBalance(0);

      if (selectedAccount) {
        const balance = await fetchAccountBalance(
          selectedAccount.subheadId,
          selectedAccount.headName,
          selectedAccount.type === "bank"
        );
        setPayerBalance(balance);
      } else {
        setPayerBalance(0);
      }
    } else if (name === "receiverAccountId") {
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (selectedAccount) {
        const balance = await fetchAccountBalance(
          selectedAccount.subheadId,
          selectedAccount.headName,
          selectedAccount.type === "bank"
        );
        setReceiverBalance(balance);
      } else {
        setReceiverBalance(0);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, img: e.target.files[0] }));
    }
  };

  const validateForm = () => {
    if (!formData.payerAccountId) {
      setError("देनार खाते (From Account) आवश्यक आहे");
      return false;
    }
    if (!formData.receiverAccountId) {
      setError("घेणार खाते (To Account) आवश्यक आहे");
      return false;
    }
    if (formData.payerAccountId === formData.receiverAccountId) {
      setError("देनार आणि घेणार खाते वेगळे असणे आवश्यक आहे");
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("रक्कम शून्यापेक्षा जास्त असणे आवश्यक आहे");
      return false;
    }
    if (!formData.narr) {
      setError("वर्णन/हेतू आवश्यक आहे");
      return false;
    }

    // Check if both accounts are of same type (cash-to-cash not allowed)
    const payer = contraAccounts.find(
      (acc) => acc.id === parseInt(formData.payerAccountId)
    );
    const receiver = contraAccounts.find(
      (acc) => acc.id === parseInt(formData.receiverAccountId)
    );

    if (
      payer &&
      receiver &&
      payer.type === "cash" &&
      receiver.type === "cash"
    ) {
      setError("रोख ते रोख व्यवहार करता येत नाही");
      return false;
    }

    if (payerBalance < parseFloat(formData.amount)) {
      Swal.fire(
        "Warning",
        "Transaction amount exceeds the available balance in the payer account.",
        "warning"
      );
      // return false; // Uncomment to block submission
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      const payerAccount = contraAccounts.find(
        (acc) => acc.id === parseInt(formData.payerAccountId)
      );
      const receiverAccount = contraAccounts.find(
        (acc) => acc.id === parseInt(formData.receiverAccountId)
      );

      if (!payerAccount || !receiverAccount) {
        throw new Error("Invalid payer or receiver account selected.");
      }

      // Add all form data except files and account IDs
      Object.keys(formData).forEach((key) => {
        if (
          !["img", "payerAccountId", "receiverAccountId"].includes(key) &&
          formData[key]
        ) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add account-specific fields
      formDataToSend.append("subhead", receiverAccount.subheadId); // Debit Receiver
      formDataToSend.append("mainSubHead", payerAccount.subheadId); // Credit Payer
      formDataToSend.append("entryType", "Contra Payment");
      formDataToSend.append("udiseNo", formData.schoolUdise);
      formDataToSend.append("headid", receiverAccount.headId);
      formDataToSend.append("mainHeadId", payerAccount.headId);
      formDataToSend.append("amount", formData.amount);
      formDataToSend.append("staffId", staffId);
      formDataToSend.append("entrydate", formData.entryDate);
      formDataToSend.append("mainBookside", payerAccount.headName);
      formDataToSend.append("subBookside", receiverAccount.headName);
      if (formData.img) {
        formDataToSend.append("img", formData.img);
      }

      const balance = await fetchAccountBalance(
        payerAccount.subheadId,
        payerAccount.headId
      );

      if (formData.amount > balance) {
        Swal.fire({
          icon: "error",
          title: "पेमेंट अयशस्वी...",
          text: "निवडलेल्या पक्षासाठी पुरेशी शिल्लक उपलब्ध नाही. कृपया रक्कम तपासा!",
        });
        handleClear();
        return;
      }

      await apiService.post("contrapayment/", formDataToSend);
      Swal.fire("यशस्वी", "परस्पर व्यवहार यशस्वीरीत्या जतन केले!", "success");
      handleClear();
    } catch (err) {
      console.error("Submission Error:", err);
      setError(
        `Operation Failed: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const currentUdise = formData.schoolUdise;
    setFormData({ ...initialFormData, schoolUdise: currentUdise });
    setPayerBalance(0);
    setReceiverBalance(0);
    setError(null);
  };

  // Get filtered receiver accounts (exclude payer account and cash if payer is cash)
  const getReceiverAccounts = () => {
    if (!formData.payerAccountId) return contraAccounts;

    const payer = contraAccounts.find(
      (acc) => acc.id === parseInt(formData.payerAccountId)
    );
    if (!payer) return contraAccounts;

    return contraAccounts.filter(
      (acc) =>
        acc.id !== parseInt(formData.payerAccountId) &&
        (payer.type === "bank" || acc.type === "bank") // Allow cash-to-bank or bank-to-anything
    );
  };

  return (
    <div className="container-fluid py-3">
      <div className="row mb-3">
        <div className="col-12">
          <h3>
            {isEditMode
              ? "परस्पर व्यवहार संपादित करा"
              : "नवीन परस्पर व्यवहार (Contra Entry)"}
          </h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/account/transactions">व्यवहार</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {isEditMode ? "संपादित करा" : "नवीन"} परस्पर व्यवहार
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <Repeat size={20} className="me-2" /> परस्पर व्यवहार तपशील प्रविष्ट
            करा
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="entryDate" className="form-label">
                  एंट्री दिनांक *
                </label>
                <input
                  type="date"
                  id="entryDate"
                  name="entryDate"
                  className="form-control"
                  value={formData.entryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="mb-4 bg-light p-3 rounded border">
              <div className="row g-3">
                <div className="col-md-6">
                  <label
                    htmlFor="payerAccountId"
                    className="form-label fw-bold"
                  >
                    From Account (देनार खाते) *
                  </label>
                  <select
                    id="payerAccountId"
                    name="payerAccountId"
                    className="form-select"
                    value={formData.payerAccountId}
                    onChange={handleAccountChange}
                    required
                  >
                    <option value="">खाते निवडा</option>
                    {contraAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                  <label className="form-label mt-2">Current Balance</label>
                  <input
                    type="number"
                    className="form-control"
                    value={payerBalance}
                    readOnly
                    disabled
                  />
                </div>

                <div className="col-md-6">
                  <label
                    htmlFor="receiverAccountId"
                    className="form-label fw-bold"
                  >
                    To Account (घेणार खाते) *
                  </label>
                  <select
                    id="receiverAccountId"
                    name="receiverAccountId"
                    className="form-select"
                    value={formData.receiverAccountId}
                    onChange={handleAccountChange}
                    required
                    disabled={!formData.payerAccountId}
                  >
                    <option value="">खाते निवडा</option>
                    {getReceiverAccounts().map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                  <label className="form-label mt-2">Current Balance</label>
                  <input
                    type="number"
                    className="form-control"
                    value={receiverBalance}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 bg-light p-3 rounded border">
              <h5 className="border-bottom pb-2 mb-3 fw-bold">
                <BiIdCard className="me-2" /> देय रक्कम व इतर माहिती
              </h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="amount" className="form-label">
                    रक्कम *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    className="form-control"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
                <div className="col-md-8">
                  <label htmlFor="narr" className="form-label">
                    वर्णन/हेतू *
                  </label>
                  <input
                    type="text"
                    id="narr"
                    name="narr"
                    className="form-control"
                    value={formData.narr}
                    onChange={handleInputChange}
                    placeholder="उदा., बँकेतून रोख रक्कम काढली"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="img" className="form-label">
                    डिपॉझिट स्लिप/पावती प्रत
                  </label>
                  <input
                    type="file"
                    id="img"
                    name="img"
                    className="form-control"
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                  />
                  {formData.img && typeof formData.img === "object" && (
                    <small className="text-muted">
                      निवडले: {formData.img.name}
                    </small>
                  )}
                </div>
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-danger"
                disabled={loading}
              >
                <Plus size={16} className="me-1" />
                {loading ? "जतन करत आहे..." : "व्यवहार जतन करा"}
              </button>
              <button
                type="button"
                className="btn btn-info"
                disabled={loading || !formData.amount}
              >
                <FileText size={16} className="me-1" /> व्हाउचर्स प्रिंट करा
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClear}
                disabled={loading}
              >
                <XCircle size={16} className="me-1" /> साफ करा
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContraPaymentForm;
