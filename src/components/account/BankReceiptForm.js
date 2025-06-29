// src/components/account/Transactions/Forms/BankReceiptForm.js
import React, { useState, useEffect } from 'react';
import { Plus, FileText, XCircle, Landmark } from 'lucide-react';
import { data, Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import { BiIdCard } from 'react-icons/bi';

const initialFormData = {
  createDate: new Date().toISOString().split('T')[0],
  entryDate: new Date().toISOString().split('T')[0],
  custId: '',
  tranType: 'Bank Receipt',
  amount: '',
  narr: '',
  bankId: '',
  schoolUdise: null,
  year: '',
  paymentType: '',
  img: null,
  billNo: '',
  headId: '',
  subheadId: ''
};

const BankReceiptForm = ({ isEditMode = false, transactionId = null }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [customerCurrentBalence, setCustomerCurrentBalence] = useState(null);
  const [bankCurrentBalance, setBankCurrentBalance] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [generalledgerData, setGeneralledgerData] = useState(null);

  const udiseNo = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

  const navigate = useNavigate();

  // Payment types in Marathi
  const paymentTypes = ["Cheque", "NEFT", "RTGS", "IMPS", "UPI", "Direct Deposit", "Card Swipe"];

  useEffect(() => {
    fetchInitialData();
  }, [isEditMode, transactionId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      if (!udiseNo) {
        return;
      }

      setFormData(prev => ({
        ...prev,
        schoolUdise: udiseNo,
      }));

      const banks = await apiService.getbyid("bank/byudiseno/", udiseNo);

      const headname = "Sundry Debtors"
      const partiesData = await apiService.getdata(`customermaster/getcustomerbyheadname/${headname}/${udiseNo}`);
      // setCustomers(customersData.data || []);
      console.log(partiesData.data);


      const leadgerDatas = await apiService.getbyid("generalledger/", udiseNo);

      console.log(leadgerDatas.data);


      let selectedOpn = [];
      for (let i = 0; i < leadgerDatas.data.length; i++) {
        selectedOpn.push(leadgerDatas.data[i].subhead && leadgerDatas.data[i].subhead.subheadId)
      }

      // console.log(selectedOpn);


      const filtered = (partiesData.data || []).filter(party => selectedOpn.includes(party.subheadId.subheadId))

      const filteredBank = (banks.data || []).filter(bank => selectedOpn.includes(bank.custId.custId))

      setBankAccounts(filteredBank || []);
      setParties(filtered || []);
      setGeneralledgerData(leadgerDatas.data || []);

      // if (bankAccounts.length === 0 || parties.length === 0) {

      // }

      const calculatefinancialYear = () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)

        // If current month is June (5) or later, academic year is currentYear-nextYear
        if (currentMonth >= 3) {
          return `${currentYear}-${currentYear + 1}`;
        }
        return `${currentYear - 1}-${currentYear}`;
      };

      if (calculatefinancialYear()) {
        setFormData((prev) => ({ ...prev, year: calculatefinancialYear() }))
      }

      if (!bankAccounts || !parties) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "जनरल लेजर मध्ये ताळेबंद मधील एंट्री भरा!",
        });

        navigate("/clerk/dashboard")
      }

      if (isEditMode && transactionId) {
        console.log("Edit BR ID:", transactionId);
      } else {
        setFormData(prev => ({ ...prev }));
      }
    } catch (err) {
      setError(`प्रारंभिक डेटा लोड करण्यात अयशस्वी: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "bankId") {
      const bankAccount = bankAccounts.find(b => Number(b.id) === Number(value));
      const bankHead = bankAccount.headId?.bookSideMaster?.booksideName;
      const openBalence = generalledgerData.find(b => b.entryType === "Opening Balance" && (b.custId && Number(b.custId.custId) === bankAccount.custId.custId));

      const transactionBalance = generalledgerData.filter(b => (b.entryType === "Bank Receipt" || b.entryType === "Bank Payment" || b.entryType === "Contra Payment") && (b.custId && Number(b.custId.custId) === bankAccount.custId.custId))
      let drTransAmt = 0;
      let crTransAmt = 0;
      transactionBalance.forEach(a => {
        drTransAmt += a.drAmt || 0;
        crTransAmt += a.crAmt || 0;
      });

      let openAmount = 0;
      let balance = 0;

      if (bankHead === "Liabilities") {
        openAmount = openBalence?.crAmt || 0;
        balance = (openAmount + crTransAmt) - drTransAmt;
      } else {
        openAmount = openBalence?.drAmt || 0;
        balance = (openAmount + drTransAmt) - crTransAmt;
      }

      setBankCurrentBalance(balance);
    }

    setError(null);
    setSuccess(null);
  };

  const handlePartyChange = async (e) => {
    const partyId = e.target.value;
    const selectedParty = parties.find(p => p.custId === parseInt(partyId));


    if (selectedParty) {
      setSelectedCustomer(selectedParty);
      setFormData(prev => ({
        ...prev,
        custId: partyId,
        headId: selectedParty.headId?.headId || '',
        subheadId: selectedParty.subheadId?.subheadId || ''
      }));
    } else {
      setSelectedCustomer(null);
      setFormData(prev => ({
        ...prev,
        custId: partyId,
        headId: '',
        subheadId: ''
      }));
    }

    // const datas = await apiService.getbyid("generalledger/", udiseNo);
    // console.log(datas.data);

    const openBalence = (generalledgerData || []).find(b => b.entryType === "Opening Balance" && b.custId && Number(b.custId.custId) === Number(selectedParty.custId));

    const openingAmt = openBalence?.drAmt || 0;

    console.log(selectedParty.custId);
    console.log(generalledgerData[2]);


    const transBalence = (generalledgerData || []).filter(b => (b.entryType === "Bank Receipt" || b.entryType === "Cash Receipt" || b.entryType === "Journal Payment") && Number(b.subhead.subheadId) === Number(selectedParty.subheadId.subheadId));

    console.log(transBalence);


    let crtransactionAmt = 0;
    transBalence.forEach(a => crtransactionAmt += a.crAmt);

    let drtransactionAmt = 0;
    transBalence.forEach(a => drtransactionAmt += a.drAmt);

    const balance = (openingAmt - crtransactionAmt) + drtransactionAmt;

    setCustomerCurrentBalence(balance);

  };

  const validateForm = () => {
    const requiredFields = {
      bankId: 'बँक खाते',
      custId: 'ग्राहक/पक्ष',
      amount: 'रक्कम',
      narr: 'वर्णन',
      paymentType: 'पेमेंट प्रकार'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field] === '') {
        setError(`${label} आवश्यक आहे`);
        return false;
      }
    }

    if (parseFloat(formData.amount) <= 0) {
      setError("रक्कम शून्यापेक्षा जास्त असणे आवश्यक आहे");
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, img: e.target.files[0] }));
    }
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
      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (key !== 'img' && formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (formData.img) {
        formDataToSend.append('img', formData.img);
      }

      formDataToSend.set('Amount', formData.amount);

      let response;
      if (isEditMode && transactionId) {
        response = await apiService.put(`bankreceipt/${transactionId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire('यशस्वी', 'बँक पावती यशस्वीरीत्या संपादित केली!', 'success');
      } else {

        if (formData.amount > customerCurrentBalence) {
          const result = await Swal.fire({
            title: "रक्कम उपलब्ध शिल्लकीपेक्षा जास्त आहे. तरीही स्वीकारायची आहे का?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "होय, जतन करा",
            denyButtonText: "नको, बदल जतन करू नका"
          });

          if (result.isConfirmed) {
            response = await apiService.post("bankreceipt/", formDataToSend, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            Swal.fire("जतन झाले!", "", "success");
            handleClear();
            fetchInitialData();
          }
          else {
            Swal.fire("बदल जतन केले गेले नाहीत.", "", "info");
            handleClear();
          }

          return;
        }

        response = await apiService.post("bankreceipt/", formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        handleClear();
        fetchInitialData();
        Swal.fire('यशस्वी', 'बँक पावती यशस्वीरीत्या जतन केली!', 'success');
      }

      // setSuccess(`बँक पावती ${isEditMode ? 'अपडेट' : 'जतन'} यशस्वीरीत्या झाली!`);

      handleClear();
      fetchInitialData();
      if (!isEditMode) {
        setFormData(prev => ({
          ...initialFormData,
          createDate: new Date().toISOString().split('T')[0],
          entryDate: new Date().toISOString().split('T')[0],
          schoolUdise: prev.schoolUdise
        }));
        setSelectedCustomer(null);
      }
    } catch (err) {
      console.error('सबमिट त्रुटी:', err);
      setError(`ऑपरेशन अयशस्वी: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const currentUdise = formData.schoolUdise;
    setFormData({
      ...initialFormData,
      createDate: new Date().toISOString().split('T')[0],
      entryDate: new Date().toISOString().split('T')[0],
      schoolUdise: currentUdise,
      img: null
    });
    setBankCurrentBalance(null);
    setCustomerCurrentBalence(null);
    setSelectedCustomer(null);
    setError(null);
    setSuccess(null);
  };

  if (loading && !formData.voucherNo && !isEditMode) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border"></div>
        <p>फॉर्म लोड होत आहे...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div className="row mb-3">
        <div className="col-12">
          <h3>{isEditMode ? 'बँक पावती संपादित करा' : 'नवीन बँक पावती'}</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/account/transactions/bank-receipts">व्यवहार</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {isEditMode ? 'संपादित' : 'नवीन'} बँक पावती
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <Landmark size={20} className="me-2" />
            बँक पावती तपशील प्रविष्ट करा
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 bg-light p-3 rounded">
              <div className='row g-3 mb-3'>
                <div className="col-md-3">
                  <label htmlFor="createDate" className="form-label">दिनांक *</label>
                  <input
                    type="date"
                    id="createDate"
                    name="createDate"
                    className="form-control"
                    value={formData.createDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 bg-light p-3 rounded">
              <h5 className="border-bottom pb-2 mb-3 fw-bold">
                <BiIdCard className="me-2" />
                देयकर्ता खाते माहिती
              </h5>
              <div className="row g-3 mb-3">
                <div className="col-md-5">
                  <label htmlFor="custId" className="form-label">यांच्याकडून प्राप्त (पक्ष) *</label>
                  <select
                    id="custId"
                    name="custId"
                    className="form-select"
                    value={formData.custId}
                    onChange={handlePartyChange}
                    required
                  >
                    <option value="">पक्ष/जमाकर्ता निवडा</option>
                    {parties.map(p => (
                      <option key={p.custId} value={p.custId}>
                        {p.custName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='col-md-3'>
                  <label className="form-label">खाते क्र.</label>
                  <input type="text" className="form-control" value={formData.custId || ''} name='headId' readOnly disabled />
                </div>
                <div className="col-md-4">
                  <label className="form-label">वर्तमान शिल्लक</label>
                  <input type="text" className="form-control" value={customerCurrentBalence || ''} readOnly disabled />
                </div>
              </div>
            </div>


            <div className="mb-4 bg-light p-3 rounded">
              <h5 className="border-bottom pb-2 mb-3 fw-bold">
                <BiIdCard className="me-2" />
                प्राप्तकर्ता खाते माहिती
              </h5>
              <div className='row g-3 mb-3'>
                <div className="col-md-5">
                  <label htmlFor="bankId" className="form-label">बँक खाते (डेबिट) *</label>
                  <select
                    id="bankId"
                    name="bankId"
                    className="form-select"
                    value={formData.bankId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">बँक खाते निवडा</option>
                    {bankAccounts.map(bank => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bankname} ({bank.accountno})
                      </option>
                    ))}
                  </select>
                </div>
                <div className='col-md-3'>
                  <label className="form-label">खाते क्र.</label>
                  <input type="text" className="form-control" value={formData.bankId || ''} name='headId' readOnly disabled />
                </div>
                <div className="col-md-4">
                  <label className="form-label">वर्तमान शिल्लक</label>
                  <input type="text" className="form-control" value={bankCurrentBalance || ''} readOnly disabled />
                </div>
              </div>
            </div>


            <div className="mb-4 bg-light p-3 rounded">
              <h5 className="border-bottom pb-2 mb-3 fw-bold">
                <BiIdCard className="me-2" />
                देय रक्कम व इतर माहिती
              </h5>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label htmlFor="amount" className="form-label">रक्कम *</label>
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
                  <label htmlFor="narr" className="form-label">वर्णन/हेतू *</label>
                  <input
                    type="text"
                    id="narr"
                    name="narr"
                    className="form-control"
                    value={formData.narr}
                    onChange={handleInputChange}
                    placeholder="उदा., ऑनलाइन फी ट्रान्सफर, अनुदान प्राप्त"
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">

                <div className="col-md-5">
                  <label htmlFor="paymentType" className="form-label">पेमेंट प्रकार *</label>
                  <select
                    id="paymentType"
                    name="paymentType"
                    className="form-select"
                    value={formData.paymentType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">पेमेंट प्रकार निवडा</option>
                    {paymentTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-7">
                  <label htmlFor="img" className="form-label">चेक/स्लीप/पावती प्रत</label>
                  <input
                    type="file"
                    id="img"
                    name="img"
                    className="form-control"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  {formData.img && (
                    <small className="text-muted">निवडले: {formData.img.name}</small>
                  )}
                </div>
              </div>
            </div>

            <div className="row g-3 mb-3">


            </div>





            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-success" disabled={loading}>
                <Plus size={16} className="me-1" />
                {loading ?
                  (isEditMode ? 'अपडेट करत आहे...' : 'जतन करत आहे...') :
                  (isEditMode ? 'पावती अपडेट करा' : 'पावती जतन करा')
                }
              </button>
              <button type="button" className="btn btn-info" disabled={loading || !formData.amount}>
                <FileText size={16} className="me-1" />
                पावती प्रिंट करा
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
                <XCircle size={16} className="me-1" />
                साफ करा
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BankReceiptForm;