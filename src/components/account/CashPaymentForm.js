// src/components/account/Transactions/Forms/CashPaymentForm.js
import React, { useState, useEffect } from 'react';
import { Plus, FileText, XCircle } from 'lucide-react';
// import { getSubHeadMasters, getCustomers, saveCashPayment, getNextVoucherNumber } from '../../../../services/accountApi';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';
import { jwtDecode } from 'jwt-decode'

const initialFormData = {
  voucherNo: '',
  date: new Date().toISOString().split('T')[0],
  paidToId: '',
  paidToName: '',
  amount: '',
  narration: '',
  creditAccountId: 'CASH_IN_HAND', // Default credit account for cash payment
  debitAccountId: '', // User selects the expense/asset/liability SubHeadMaster ID
  remarks: '',
};

const CashPaymentForm = ({ isEditMode = false, transactionId = null }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [debitAccounts, setDebitAccounts] = useState([]);
  const [parties, setParties] = useState([]); // Customers/Vendors/Staff
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const staffId = jwtDecode(sessionStorage.getItem('token'))?.id;
  const schoolUdise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

  const fetchCustomers = async () => {
    const response = await apiService.getdata(`customermaster/getbyudise/${schoolUdise}`);
    setParties(response.data);
    console.log(response.data);
  }
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const accountsData = [
          { id: 'EXP_SAL', name: 'Salaries Expense (Expense)' },
          { id: 'EXP_RENT', name: 'Rent Expense (Expense)' },
          { id: 'EXP_STAT', name: 'Printing & Stationery (Expense)' },
          { id: 'AST_FURN', name: 'Furniture Purchase (Asset)' },
          { id: 'LIAB_LOAN_REP', name: 'Loan Repayment (Liability)' },
        ];
        const partiesData = [
          { id: 'VEND001', name: 'Alpha Stationers (Vendor)' },
          { id: 'STAFF001', name: 'Mr. Suresh Kumar (Staff - Salary)' },
          { id: 'PARTY000', name: 'Cash Purchase/Other' }
        ];
        const nextVoucher = `CP-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-00${Math.floor(Math.random() * 100) + 1}`;
        // --- END MOCK DATA ---

        setDebitAccounts(accountsData || []);
        setParties(partiesData || []);

        if (isEditMode && transactionId) {
          console.log("Edit mode for CP ID:", transactionId);
        } else {
          setFormData(prev => ({ ...prev, voucherNo: nextVoucher }));
        }
      } catch (err) {
        setError(`Failed to load initial data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
    fetchCustomers();
  }, [isEditMode, transactionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
    setSuccess(null);
  };

  const handlePartyChange = (e) => {
    const partyId = e.target.value;
    const selectedParty = parties.find(p => p.custId === Number(partyId));
    console.log(parties);
    
    setFormData(prev => ({
      ...prev,
      paidToId: partyId,
      paidToName: selectedParty ? selectedParty.custName : (partyId === "OTHER_PAYEE" ? prev.paidToName : "")
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.debitAccountId || !formData.amount || (!formData.paidToName && !formData.paidToId) || !formData.narration.trim()) {
      setError("Please fill all required fields: Paid To, Amount, Debit Account, and Narration.");
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData, entryNo: formData.voucherNo, schoolUdise, staffId, custId: formData.paidToId, amount: parseFloat(formData.amount), };
      // if (isEditMode) { await updateCashPayment(transactionId, payload); }
      // else { await saveCashPayment(payload); }
      await apiService.postdata("cashpayment/", payload);
      console.log('Submitting Cash Payment (Mock):', payload);
      setSuccess(`Cash Payment ${isEditMode ? 'Updated' : 'Saved'} Successfully! Voucher No: ${formData.voucherNo}`);
      if (!isEditMode) {
        // const nextVoucher = await getNextVoucherNumber('CP');
        const nextVoucher = `CP-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-00${Math.floor(Math.random() * 100) + 1}`;
        setFormData({ ...initialFormData, voucherNo: nextVoucher, date: new Date().toISOString().split('T')[0] });
      }
    } catch (err) {
      setError(`Operation Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData(prev => ({ ...initialFormData, voucherNo: isEditMode ? prev.voucherNo : prev.voucherNo, date: new Date().toISOString().split('T')[0] }));
    setError(null);
    setSuccess(null);
  };

  if (loading && !formData.voucherNo && !isEditMode) {
    return <div className="text-center p-5"><div className="spinner-border"></div><p>Loading form...</p></div>;
  }

  return (
    <div className="container-fluid py-3">
      <div className="row mb-3">
        <div className="col-12">
          <h3>{isEditMode ? 'Edit Cash Payment' : 'New Cash Payment'}</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account/transactions/cash-payments">Transactions</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{isEditMode ? 'Edit' : 'New'} Cash Payment</li>
            </ol>
          </nav>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card">
        <div className="card-header"><h5 className="mb-0">Enter Cash Payment Details</h5></div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="voucherNo" className="form-label">Voucher No.</label>
                <input type="text" id="voucherNo" name="voucherNo" className="form-control" value={formData.voucherNo} onChange={handleInputChange} readOnly={!isEditMode} />
              </div>
              <div className="col-md-4">
                <label htmlFor="date" className="form-label">Date *</label>
                <input type="date" id="date" name="date" className="form-control" value={formData.date} onChange={handleInputChange} required />
              </div>
              <div className="col-md-4">
                <label htmlFor="amount" className="form-label">Amount *</label>
                <input type="number" id="amount" name="amount" className="form-control" value={formData.amount} onChange={handleInputChange} placeholder="0.00" step="0.01" min="0.01" required />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="paidToId" className="form-label">Paid To (Party) *</label>
                <select id="paidToId" name="paidToId" className="form-select" value={formData.paidToId} onChange={handlePartyChange} required>
                  <option value="">Select Party/Payee</option>
                  {parties.map(p => <option key={p.custId} value={p.custId}>{p.custName}</option>)}
                </select>
              </div>
              {formData.paidToId === 'OTHER_PAYEE' && (
                <div className="col-md-6">
                  <label htmlFor="paidToName" className="form-label">Specify Payee Name *</label>
                  <input type="text" id="paidToName" name="paidToName" className="form-control" value={formData.paidToName} onChange={handleInputChange} placeholder="Enter payee's name" required={formData.paidToId === 'OTHER_PAYEE'} />
                </div>
              )}
              {formData.paidToId && formData.paidToId !== 'OTHER_PAYEE' && (
                <div className="col-md-6">
                  <label className="form-label">Payee Name (Selected)</label>
                  <input type="text" className="form-control" value={formData.paidToName} readOnly disabled />
                </div>
              )}
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-12">
                <label htmlFor="narration" className="form-label">Narration/Purpose *</label>
                <input type="text" id="narration" name="narration" className="form-control" value={formData.narration} onChange={handleInputChange} placeholder="e.g., Office rent for July, Advance salary to staff" required />
              </div>
            </div>


            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="debitAccountId" className="form-label">Debit Account * (Expense/Asset/Liability)</label>
                <select id="debitAccountId" name="debitAccountId" className="form-select" value={formData.debitAccountId} onChange={handleInputChange} required>
                  <option value="">Select Debit Account Head</option>
                  {debitAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Credit Account</label>
                <input type="text" className="form-control" value="Cash In Hand (Default)" readOnly disabled />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12">
                <label htmlFor="remarks" className="form-label">Remarks</label>
                <textarea id="remarks" name="remarks" className="form-control" rows="2" value={formData.remarks} onChange={handleInputChange} placeholder="Any additional notes (optional)"></textarea>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-danger" disabled={loading}> {/* Changed to btn-danger for payment */}
                <Plus size={16} className="me-1" />
                {loading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Payment' : 'Save Payment')}
              </button>
              <button type="button" className="btn btn-info" disabled={loading || !formData.amount}>
                <FileText size={16} className="me-1" /> Print Voucher
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
                <XCircle size={16} className="me-1" /> Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CashPaymentForm;