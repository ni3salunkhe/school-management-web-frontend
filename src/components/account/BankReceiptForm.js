// src/components/account/Transactions/Forms/BankReceiptForm.js
import React, { useState, useEffect } from 'react';
import { Plus, FileText, XCircle, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const initialFormData = {
  createDate: new Date().toISOString().split('T')[0],
  entryDate: new Date().toISOString().split('T')[0],
  custId: '',
  tranType: 'Bank Payment',
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
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const udiseNo = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

  // Payment types in Marathi
  const paymentTypes = ["Cheque", "NEFT", "RTGS", "IMPS", "UPI", "Direct Deposit", "Card Swipe"];

  useEffect(() => {
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
        console.log(banks);

        const partiesData = await apiService.getbyid("customermaster/getcustomersbyudise/", udiseNo)
        console.log(parties);

        const nextVoucher = `BR-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-00${Math.floor(Math.random() * 100) + 1}`;

        setBankAccounts(banks.data || []);
        setParties(partiesData.data || []);



        if (isEditMode && transactionId) {
          console.log("Edit BR ID:", transactionId);
        } else {
          setFormData(prev => ({ ...prev, voucherNo: nextVoucher }));
        }
      } catch (err) {
        setError(`प्रारंभिक डेटा लोड करण्यात अयशस्वी: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [isEditMode, transactionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
    setSuccess(null);
  };

  const handlePartyChange = (e) => {
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
        response = await apiService.post("bankreceipt/", formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log(response.data);
        console.log(formData);

        Swal.fire('यशस्वी', 'बँक पावती यशस्वीरीत्या जतन केली!', 'success');
      }

      setSuccess(`बँक पावती ${isEditMode ? 'अपडेट' : 'जतन'} यशस्वीरीत्या झाली!`);

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
            <div className="row g-3 mb-3">
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
              <div className="col-md-6">
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
            </div>

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
              <div className="col-md-4">
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
              <div className="col-md-4">
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

            <div className="row g-3 mb-3">
              <div className="col-md-6">
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
              <div className="col-md-6">
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