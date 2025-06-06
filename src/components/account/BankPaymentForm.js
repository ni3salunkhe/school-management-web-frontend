// src/components/account/Transactions/Forms/BankPaymentForm.js
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
  schoolUdise: '',
  year: '',
  paymentType: '',
  img: null,
  billNo: '',
  headId: '',
  subheadId: ''
};

const BankPaymentForm = ({ isEditMode = false, transactionId = null }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const paymentTypes = ["Cheque", "NEFT", "RTGS", "IMPS", "UPI", "Direct Deposit", "Card Swipe"];

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          setError('प्रमाणीकरण टोकन सापडले नाही');
          return;
        }

        const decodedToken = jwtDecode(token);
        const udiseNo = decodedToken?.udiseNo;

        if (!udiseNo) {
          setError('टोकन मध्ये UDISE क्रमांक सापडला नाही');
          return;
        }

        // प्रारंभिक शाळा UDISE सेट करा
        setFormData(prev => ({
          ...prev,
          schoolUdise: udiseNo,
        }));

        // बँक आणि ग्राहक आणा
        const [banksResponse, partiesResponse] = await Promise.all([
          apiService.getbyid("bank/byudiseno/", udiseNo),
          apiService.getbyid("customermaster/getcustomersbyudise/", udiseNo)
        ]);

        setBankAccounts(banksResponse.data || []);
        setParties(partiesResponse.data || []);

        console.log(partiesResponse.data);

        if (isEditMode && transactionId) {
          // विद्यमान व्यवहार डेटा आणा
          const existingData = await apiService.getbyid("bankpayment/", transactionId);
          if (existingData.data) {
            setFormData(prev => ({
              ...prev,
              ...existingData.data,
              entryDate: existingData.data.entryDate || prev.entryDate,
              createDate: existingData.data.createDate || prev.createDate
            }));
          }
        }
      } catch (err) {
        console.error('प्रारंभिक डेटा आणण्यात त्रुटी:', err);
        setError(`प्रारंभिक डेटा लोड करण्यात अयशस्वी: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [isEditMode, transactionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, img: e.target.files[0] }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // मल्टिपार्ट फॉर्म सबमिशनसाठी FormData तयार करा
      const formDataToSend = new FormData();

      // img वगळून सर्व फॉर्म फील्ड जोडा
      Object.keys(formData).forEach(key => {
        if (key !== 'img' && formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // उपस्थित असल्यास इमेज फाइल जोडा
      if (formData.img) {
        formDataToSend.append('img', formData.img);
      }

      // रक्कम फील्ड बॅकएंड अपेक्षेशी जुळवा (कॅपिटल A)
      formDataToSend.set('Amount', formData.amount);

      let response;
      if (isEditMode && transactionId) {
        response = await apiService.put(`bankpayment/${transactionId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire('यशस्वी', 'बँक पेमेंट यशस्वीरीत्या संपादित केले!', 'success');

      } else {
        response = await apiService.post("bankpayment/", formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log(response.data);
        Swal.fire('यशस्वी', 'बँक पेमेंट यशस्वीरीत्या जतन केले!', 'success');
      }

      setSuccess(`बँक पेमेंट ${isEditMode ? 'अपडेट' : 'जतन'} यशस्वीरीत्या झाले!`);

      if (!isEditMode) {
        // नवीन एंट्रीसाठी फॉर्म रीसेट करा
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
    // const nextVoucher = `BP-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-00${Math.floor(Math.random() * 100) + 1}`;

    setFormData({
      ...initialFormData,
      // voucherNo: isEditMode ? formData.voucherNo : nextVoucher,
      createDate: new Date().toISOString().split('T')[0],
      entryDate: new Date().toISOString().split('T')[0],
      schoolUdise: currentUdise
    });
    setSelectedCustomer(null);
    setError(null);
    setSuccess(null);
  };

  if (loading && !formData.voucherNo && !isEditMode) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border"></div>
        <p>फॉर्म लोड करत आहे...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3">
      <div className="row mb-3">
        <div className="col-12">
          <h3>{isEditMode ? 'बँक पेमेंट संपादित करा' : 'नवीन बँक पेमेंट'}</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/account/transactions/bank-payments">व्यवहार</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {isEditMode ? 'संपादित करा' : 'नवीन'} बँक पेमेंट
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>} */}

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <Landmark size={20} className="me-2" />
            बँक पेमेंट तपशील प्रविष्ट करा
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label htmlFor="entryDate" className="form-label">एंट्री दिनांक *</label>
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
              <div className="col-md-6">
                <label htmlFor="bankId" className="form-label">बँक खाते *</label>
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
                      {bank.bankname} - {bank.accountno}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="custId" className="form-label">यांना पेमेंट (पक्ष) *</label>
                <select
                  id="custId"
                  name="custId"
                  className="form-select"
                  value={formData.custId}
                  onChange={handlePartyChange}
                  required
                >
                  <option value="">पक्ष/पेयी निवडा</option>
                  {parties.map(party => (
                    <option key={party.custId} value={party.custId}>
                      {party.custName}
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
                  placeholder="उदा., पुरवठ्यासाठी विक्रेता पेमेंट"
                  required
                />
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
                    <option key={type} value={type}>{type}</option>
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

            {selectedCustomer && (
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <div className="alert alert-info">
                    <strong>निवडलेल्या ग्राहकाचे तपशील:</strong><br />
                    नाव: {selectedCustomer.custName}<br />
                    {selectedCustomer.headId && `मुख्य: ${selectedCustomer.headId.headName}`}<br />
                    {selectedCustomer.subheadId && `उपमुख्य: ${selectedCustomer.subheadId.subheadName}`}
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-danger" disabled={loading}>
                <Plus size={16} className="me-1" />
                {loading ? (isEditMode ? 'अपडेट करत आहे...' : 'जतन करत आहे...') : (isEditMode ? 'पेमेंट अपडेट करा' : 'पेमेंट जतन करा')}
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

export default BankPaymentForm;