import React, { useState, useEffect } from 'react';
import { Plus, FileText, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';
import { jwtDecode } from 'jwt-decode';

const initialFormData = {
  voucherNo: '',
  date: new Date().toISOString().split('T')[0],
  paidToId: '',
  paidToHead: '',
  paidToSubHead: '',
  amount: '',
  narration: '',
  creditAccountId: 'CASH_IN_HAND',
  debitAccountId: '',
  remarks: '',
};

const CashPaymentForm = ({ isEditMode = false, transactionId = null }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [debitAccounts, setDebitAccounts] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const staffId = jwtDecode(sessionStorage.getItem('token'))?.id;
  const schoolUdise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

  const fetchCustomers = async () => {
    const response = await apiService.getdata(`customermaster/getbyudise/${schoolUdise}`);
    setParties(response.data || []);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const accountsData = [
          { id: 'EXP_SAL', name: 'वेतन खर्च' },
          { id: 'EXP_RENT', name: 'भाडे खर्च' },
          { id: 'EXP_STAT', name: 'स्टेशनरी खर्च' },
          { id: 'AST_FURN', name: 'फर्निचर खरेदी' },
          { id: 'LIAB_LOAN_REP', name: 'कर्ज परतफेड' },
        ];
        setDebitAccounts(accountsData);

        const nextVoucher = `CP-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-00${Math.floor(Math.random() * 100) + 1}`;
        if (!isEditMode) {
          setFormData(prev => ({ ...prev, voucherNo: nextVoucher }));
        }
      } catch (err) {
        setError(`डेटा लोड करण्यात अडचण: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
    fetchCustomers();
  }, [isEditMode, transactionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: null }));
    setError(null);
    setSuccess(null);
  };

  const handlePartyChange = (e) => {
    const partyId = e.target.value;
    const selectedParty = parties.find(p => p.custId === Number(partyId));
    setFormData(prev => ({
      ...prev,
      paidToId: partyId,
      paidToHead: selectedParty ? selectedParty.headId.headId : '',
      paidToSubHead: selectedParty ? selectedParty.subheadId.subheadId : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setValidationErrors({});

    const errors = {};
    if (!formData.paidToId) errors.paidToId = 'कृपया पक्षकार निवडा.';
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'रक्कम 0 पेक्षा जास्त असावी.';
    if (!formData.narration.trim()) errors.narration = 'कृपया खर्चाचा तपशील लिहा.';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        narr: formData.narration,
        headId: formData.paidToHead,
        subheadId: formData.paidToSubHead,
        schoolUdise,
        staffId,
        custId: formData.paidToId,
        amount: parseFloat(formData.amount),
        tranType: "Cash Payment",
        billType: "Cash Payment",
        entryDate: formData.date,
        createDate: formData.date,
        modifieDate: formData.date,
        status: "dr"
      };

      await apiService.postdata("cashpayment/", payload);
      setSuccess(`रोख पेमेंट यशस्वीरित्या जतन झाले! व्हाउचर नं.: ${formData.voucherNo}`);
      const nextVoucher = `CP-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-00${Math.floor(Math.random() * 100) + 1}`;
      setFormData({ ...initialFormData, voucherNo: nextVoucher, date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      setError(`ऑपरेशन अयशस्वी: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData(prev => ({ ...initialFormData, voucherNo: prev.voucherNo, date: new Date().toISOString().split('T')[0] }));
    setError(null);
    setSuccess(null);
    setValidationErrors({});
  };

  return (
    <div className="container-fluid py-3">
      <h3>{isEditMode ? 'रोख पेमेंट संपादन करा' : 'नवीन रोख पेमेंट'}</h3>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/account/transactions/cash-payments">व्यवहार</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{isEditMode ? 'संपादन' : 'नवीन'} रोख पेमेंट</li>
        </ol>
      </nav>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header"><h5 className="mb-0">रोख पेमेंट तपशील</h5></div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="date" className="form-label">दिनांक *</label>
                <input type="date" id="date" name="date" className="form-control" value={formData.date} onChange={handleInputChange} required />
              </div>

              <div className="col-md-4">
                <label htmlFor="paidToId" className="form-label">पक्षकार *</label>
                <select id="paidToId" name="paidToId" className={`form-select ${validationErrors.paidToId ? 'is-invalid' : ''}`} value={formData.paidToId} onChange={handlePartyChange}>
                  <option value="">पक्षकार निवडा</option>
                  {parties.map(p => <option key={p.custId} value={p.custId}>{p.custName}</option>)}
                </select>
                {validationErrors.paidToId && <div className="invalid-feedback">{validationErrors.paidToId}</div>}
              </div>

              <div className="col-md-4">
                <label className="form-label">जमा खाते</label>
                <input type="text" className="form-control" value="हातातील रोकड (Cash In Hand)" readOnly disabled />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="amount" className="form-label">रक्कम *</label>
                <input type="number" id="amount" name="amount" className={`form-control ${validationErrors.amount ? 'is-invalid' : ''}`} value={formData.amount} onChange={handleInputChange} required />
                {validationErrors.amount && <div className="invalid-feedback">{validationErrors.amount}</div>}
              </div>

              <div className="col-md-8">
                <label htmlFor="narration" className="form-label">खर्चाचा तपशील *</label>
                <input type="text" id="narration" name="narration" className={`form-control ${validationErrors.narration ? 'is-invalid' : ''}`} value={formData.narration} onChange={handleInputChange} />
                {validationErrors.narration && <div className="invalid-feedback">{validationErrors.narration}</div>}
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-danger" disabled={loading}>
                <Plus size={16} className="me-1" />
                {loading ? (isEditMode ? 'अपडेट करत आहे...' : 'सेव्ह करत आहे...') : (isEditMode ? 'अपडेट करा' : 'सेव्ह करा')}
              </button>
              <button type="button" className="btn btn-info" disabled={loading || !formData.amount}>
                <FileText size={16} className="me-1" /> व्हाउचर प्रिंट करा
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
                <XCircle size={16} className="me-1" /> क्लिअर
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CashPaymentForm;
