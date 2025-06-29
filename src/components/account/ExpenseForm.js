import React, { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  XCircle,
  Landmark,
  Calendar,
  DollarSign,
  Receipt,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import apiService from "../../services/api.service";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { BiIdCard } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const initialFormData = {
  createDate: new Date().toISOString().split("T")[0],
  entryDate: new Date().toISOString().split("T")[0],
  custId: "", // This will be for expense head (P&L subhead)
  tranType: "Expense",
  amount: "",
  narr: "",
  paymentSource: "", // 'bank' or 'cash'
  bankId: "", // Only used if paymentSource is 'bank'
  schoolUdise: "",
  year: "",
  billNo: "",
  headId: "",
  subheadId: "",
  expenseCategory: "", // Additional field for expense categorization
};

const ExpenseForm = ({ isEditMode = false, transactionId = null }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [expenseHeads, setExpenseHeads] = useState([]); // P&L subheads
  const [cashAccount, setCashAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedExpenseHead, setSelectedExpenseHead] = useState(null);
  const [sourceAccountBalance, setSourceAccountBalance] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("प्रमाणीकरण टोकन सापडले नाही");
          return;
        }

        const decodedToken = jwtDecode(token);
        const udiseNo = decodedToken?.udiseNo;

        if (!udiseNo) {
          setError("टोकन मध्ये UDISE क्रमांक सापडला नाही");
          return;
        }

        // प्रारंभिक शाळा UDISE सेट करा
        setFormData((prev) => ({
          ...prev,
          schoolUdise: udiseNo,
        }));

        // बँक खाती, कॅश खाते आणि खर्च मुख्य आणा
        const [banksResponse, partiesResponse] = await Promise.all([
          apiService.getbyid("bank/byudiseno/", udiseNo),
          apiService.getbyid("customermaster/getcustomersbyudise/", udiseNo),
        ]);
        setBankAccounts(banksResponse.data || []);

        // Cash In Hand खाते शोधा
        const cashInHand = (partiesResponse.data || []).find(
          (party) => party.custName === "Cash In Hand"
        );
        setCashAccount(cashInHand);

        // Opening balance तपासा
        let selectedOpn = [];
        try {
          const opnBal = await apiService.getdata(`generalledger/${udiseNo}`);

          if (opnBal?.data?.length) {
            for (let i = 0; i < opnBal.data.length; i++) {
              const subheadId = opnBal.data[i]?.subhead?.subheadId;
              if (subheadId) {
                selectedOpn.push(subheadId);
              }
            }
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "जनरल लेजर मध्ये ताळेबंद मधील एंट्री भरा किंवा Cash In Hand हा ग्राहक आपल्या सिस्टम मध्ये असल्याची खात्री करा!",
            });
            navigate("/clerk/dashboard");
            return;
          }
        } catch (error) {
          console.error(
            "Error fetching opening balances:",
            error.message || error
          );
        }

        const partyHeads = await apiService.getdata(
          `subheadmaster/getbyudise/${udiseNo}`
        );
        // फक्त Profit & Loss (Expenses) subheads फिल्टर करा
        const expenseSubheads = (partyHeads.data || []).filter(
          (party) =>
            selectedOpn.includes(party.subheadId) &&
            party.headId?.bookSideMaster?.booksideName === "Profit And Loss" // Assuming P&L expenses have this classification
        );
        setExpenseHeads(expenseSubheads || []);

        if (isEditMode && transactionId) {
          // विद्यमान व्यवहार डेटा आणा
          const existingData = await apiService.getbyid(
            "expense/",
            transactionId
          );
          if (existingData.data) {
            setFormData((prev) => ({
              ...prev,
              ...existingData.data,
              entryDate: existingData.data.entryDate || prev.entryDate,
              createDate: existingData.data.createDate || prev.createDate,
            }));
          }
        }
      } catch (err) {
        console.error("प्रारंभिक डेटा आणण्यात त्रुटी:", err);
        setError(`प्रारंभिक डेटा लोड करण्यात अयशस्वी: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [isEditMode, transactionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);

    // जेव्हा payment source बदलतो
    if (name === "paymentSource") {
      setFormData((prev) => ({ ...prev, bankId: "" })); // Reset bank selection
      setSourceAccountBalance(0);
    }

    // जेव्हा बँक निवडतात
    if (name === "bankId" && formData.paymentSource === "bank") {
      const bank = bankAccounts.find((f) => f.id === Number(value));
      if (bank) {
        calculateSourceBalance(bank.custId?.custId, "bank");
      }
    }
  };

  const calculateSourceBalance = async (custId, sourceType) => {
    try {
      const datas = await apiService.getdata("generalledger/");

      const opnBalance = (datas.data || []).find(
        (b) =>
          b.entryType === "Opening Balance" &&
          (b.custId && Number(b.custId.custId)) === Number(custId)
      );

      if (!opnBalance) {
        setSourceAccountBalance(0);
        return;
      }

      // Credit transactions (money coming in)
      const creditTransactions = (datas.data || []).filter(
        (b) =>
          (b.entryType === "Bank Receipt" ||
            b.entryType === "Cash Receipt" ||
            b.entryType === "Contra Payment" ||
            b.entryType === "Expense Payment") &&
          (b.custId && Number(b.custId.custId)) === Number(custId)
      );

      // Debit transactions (money going out)
      const debitTransactions = (datas.data || []).filter(
        (b) =>
          (b.entryType === "Bank Payment" ||
            b.entryType === "Cash Payment" ||
            b.entryType === "Expense Payment" ||
            b.entryType === "Contra Payment") &&
          (b.custId && Number(b.custId.custId)) === Number(custId)
      );

      let creditAmount = 0;
      let debitAmount = 0;

      creditTransactions.forEach((t) => (creditAmount += t.drAmt || 0));
      debitTransactions.forEach((t) => (debitAmount += t.crAmt || 0));

      // For assets (Bank/Cash), balance = Opening + Credits - Debits
      const balance = (opnBalance.drAmt || 0) + creditAmount - debitAmount;
      setSourceAccountBalance(balance);
    } catch (error) {
      console.error("Error calculating source balance:", error);
      setSourceAccountBalance(0);
    }
  };

  const handleExpenseHeadChange = (e) => {
    const expenseId = e.target.value;
    const selectedExpense = expenseHeads.find(
      (p) => p.custId === parseInt(expenseId)
    );

    if (selectedExpense) {
      setSelectedExpenseHead(selectedExpense);
      setFormData((prev) => ({
        ...prev,
        custId: expenseId,
        headId: selectedExpense.headId?.headId || "",
        subheadId: selectedExpense.subheadId?.subheadId || "",
      }));
    } else {
      setSelectedExpenseHead(null);
      setFormData((prev) => ({
        ...prev,
        custId: expenseId,
        headId: "",
        subheadId: "",
      }));
    }
  };
  const handlePaymentSourceChange = (e) => {
    const source = e.target.value;
    setFormData((prev) => ({
      ...prev,
      paymentSource: source,
      bankId: "",
    }));

    if (source === "cash" && cashAccount) {
      calculateSourceBalance(cashAccount.custId, "cash");
    } else {
      setSourceAccountBalance(0);
    }
  };

  const validateForm = () => {
    const requiredFields = {
      paymentSource: "पेमेंट स्रोत",
      custId: "खर्च मुख्य",
      amount: "रक्कम",
      narr: "वर्णन",
    };

    // If bank is selected, bankId is required
    if (formData.paymentSource === "bank") {
      requiredFields.bankId = "बँक खाते";
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field] === "") {
        setError(`${label} आवश्यक आहे`);
        return false;
      }
    }

    if (parseFloat(formData.amount) <= 0) {
      setError("रक्कम शून्यापेक्षा जास्त असणे आवश्यक आहे");
      return false;
    }

    // Check if sufficient balance
    if (parseFloat(formData.amount) > sourceAccountBalance) {
      // setError("अपुरी शिल्लक! रक्कम उपलब्ध शिल्लकपेक्षा जास्त आहे");
      Swal.fire({
        icon: "error",
        title: "पेमेंट अयशस्वी...",
        text: "अपुरी शिल्लक! रक्कम उपलब्ध शिल्लकपेक्षा जास्त आहे",
      });
      handleClear();
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare JSON data object
      const jsonData = {
        amount: formData.amount,
        entryDate: formData.entryDate,
        subheadId: parseInt(formData.custId),
        narr: formData.narr,
        billNo: formData.billNo || "",
        schoolUdise: formData.schoolUdise,
      };

      // Find head ID
      const head = expenseHeads.find(
        (party) => party.subheadId === Number(formData.custId)
      );

      if (head) {
        jsonData.headId = head.headId.headId;
      }

      // Set source account details based on payment source
      if (formData.paymentSource === "cash" && cashAccount) {
        jsonData.custId = cashAccount.custId;
        jsonData.tranType = "Expense Payment";
      } else if (formData.paymentSource === "bank") {
        const selectedBank = bankAccounts.find(
          (b) => b.id === Number(formData.bankId)
        );
        // return console.log(selectedBank);

        if (selectedBank && selectedBank.custId) {
          jsonData.custId = selectedBank.custId.custId;
          jsonData.tranType = "Expense Payment";
        }
      }

      let response;
      if (isEditMode && transactionId) {
        response = await apiService.put(`expense/${transactionId}`, jsonData);
        Swal.fire("यशस्वी", "खर्च यशस्वीरीत्या संपादित केला!", "success");
      } else {
        response = await apiService.post("expensesvouchar/", jsonData);
        Swal.fire("यशस्वी", "खर्च यशस्वीरीत्या नोंदवला!", "success");
      }

      setSuccess(`खर्च ${isEditMode ? "अपडेट" : "नोंदवला"} यशस्वीरीत्या झाला!`);

      if (!isEditMode) {
        setFormData((prev) => ({
          ...initialFormData,
          createDate: new Date().toISOString().split("T")[0],
          entryDate: new Date().toISOString().split("T")[0],
          schoolUdise: prev.schoolUdise,
        }));
        setSelectedExpenseHead(null);
        setSourceAccountBalance(0);
      }
    } catch (err) {
      console.error("सबमिट त्रुटी:", err);
      setError(`ऑपरेशन अयशस्वी: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const currentUdise = formData.schoolUdise;
    setFormData({
      ...initialFormData,
      createDate: new Date().toISOString().split("T")[0],
      entryDate: new Date().toISOString().split("T")[0],
      schoolUdise: currentUdise,
    });
    setSelectedExpenseHead(null);
    setSourceAccountBalance(0);
    setError(null);
    setSuccess(null);
  };

  if (loading && !isEditMode) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border"></div>
        <p>फॉर्म लोड करत आहे...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-3">
        <div className="col-12">
          <h3>{isEditMode ? "खर्च संपादित करा" : "नवीन खर्च नोंदवा"}</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/account/transactions/expenses">व्यवहार</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {isEditMode ? "संपादित करा" : "नवीन"} खर्च
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {success && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {success}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccess(null)}
          ></button>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <Receipt size={20} className="me-2" />
            खर्च तपशील प्रविष्ट करा
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Date and Payment Source Section */}
            <div className="mb-4 bg-light p-3 rounded">
              <h5 className="border-bottom pb-2 mb-3 fw-bold">
                <Calendar size={16} className="me-2" />
                दिनांक आणि पेमेंट स्रोत
              </h5>
              <div className="row g-3 mb-3">
                <div className="col-md-3">
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
                <div className="col-md-4">
                  <label htmlFor="paymentSource" className="form-label">
                    पेमेंट स्रोत *
                  </label>
                  <select
                    id="paymentSource"
                    name="paymentSource"
                    className="form-select"
                    value={formData.paymentSource}
                    onChange={handlePaymentSourceChange}
                    required
                  >
                    <option value="">स्रोत निवडा</option>
                    <option value="cash">कॅश इन हॅन्ड</option>
                    <option value="bank">बँक खाते</option>
                  </select>
                </div>
                {formData.paymentSource === "bank" && (
                  <div className="col-md-5">
                    <label htmlFor="bankId" className="form-label">
                      बँक खाते *
                    </label>
                    <select
                      id="bankId"
                      name="bankId"
                      className="form-select"
                      value={formData.bankId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">बँक खाते निवडा</option>
                      {bankAccounts.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.bankname} - {bank.accountno}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="col-md-3">
                  <label className="form-label">उपलब्ध शिल्लक</label>
                  <input
                    type="number"
                    className="form-control bg-light"
                    value={sourceAccountBalance}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Expense Details Section */}
            <div className="mb-4 bg-light p-3 rounded">
              <h5 className="border-bottom pb-2 mb-3 fw-bold">
                <Tag size={16} className="me-2" />
                खर्च तपशील
              </h5>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label htmlFor="custId" className="form-label">
                    खर्च मुख्य *
                  </label>
                  <select
                    id="custId"
                    name="custId"
                    className="form-select"
                    value={formData.custId}
                    onChange={handleExpenseHeadChange}
                    required
                  >
                    <option value="">खर्च मुख्य निवडा</option>
                    {expenseHeads.map((expense) => (
                      <option key={expense.subheadId} value={expense.subheadId}>
                        {expense.subheadName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Amount and Details Section */}
            <div className="mb-4 bg-light p-3 rounded">
              <h5 className="border-bottom pb-2 mb-3 fw-bold">
                <DollarSign size={16} className="me-2" />
                रक्कम आणि तपशील
              </h5>
              <div className="row g-3 mb-3">
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
                <div className="col-md-4">
                  <label htmlFor="billNo" className="form-label">
                    बिल/व्हाउचर नंबर
                  </label>
                  <input
                    type="text"
                    id="billNo"
                    name="billNo"
                    className="form-control"
                    value={formData.billNo}
                    onChange={handleInputChange}
                    placeholder="उदा., INV-001"
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
                    placeholder="उदा., ऑफिस स्टेशनरी खरेदी"
                    required
                  />
                </div>
              </div>
            </div>

            {selectedExpenseHead && (
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <div className="alert alert-info">
                    <strong>निवडलेल्या खर्च मुख्याचे तपशील:</strong>
                    <br />
                    नाव: {selectedExpenseHead.custName}
                    <br />
                    {selectedExpenseHead.headId &&
                      `मुख्य: ${selectedExpenseHead.headId.headName}`}
                    <br />
                    {selectedExpenseHead.subheadId &&
                      `उपमुख्य: ${selectedExpenseHead.subheadId.subheadName}`}
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-danger"
                disabled={loading}
              >
                <Plus size={16} className="me-1" />
                {loading
                  ? isEditMode
                    ? "अपडेट करत आहे..."
                    : "नोंदवत आहे..."
                  : isEditMode
                  ? "खर्च अपडेट करा"
                  : "खर्च नोंदवा"}
              </button>
              <button
                type="button"
                className="btn btn-info"
                disabled={loading || !formData.amount}
              >
                <FileText size={16} className="me-1" /> व्हाउचर प्रिंट करा
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

export default ExpenseForm;
