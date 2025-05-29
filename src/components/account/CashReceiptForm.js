// src/components/account/Transactions/Forms/CashReceiptForm.js
import React, { useState, useEffect } from 'react';
import { Plus, FileText, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { getSubHeadMasters, getCustomers, saveCashReceipt, getNextVoucherNumber } from '../../../../services/accountApi'; // Your API service
// import { getCurrentFinancialYear } from '../../../../utils/financialYear'; // Your helper

const initialFormData = {
  voucherNo: '',
  date: new Date().toISOString().split('T')[0],
  receivedFromId: '', // For customer ID if selected from a list
  receivedFromName: '', // For manual entry or display name of selected customer
  amount: '',
  narration: '', // This is the main description of the transaction
  debitAccountId: 'CASH_IN_HAND', // Pre-selected SubHeadMaster ID for Cash In Hand
  creditAccountId: '', // User selects the income/liability/asset SubHeadMaster ID
  // financialYear: getCurrentFinancialYear(), // You might get this from context or backend
  remarks: '',
  purpose: '', // This can be a dropdown for common purposes if needed
};

const CashReceiptForm = ({ isEditMode = false, transactionId = null }) => { // Props for edit mode
  const [formData, setFormData] = useState(initialFormData);
  const [creditAccounts, setCreditAccounts] = useState([]); // SubHeadMasters for credit side
  const [customers, setCustomers] = useState([]); // For 'Received From' dropdown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // const accountsData = await getSubHeadMasters({ types: ['Income', 'Liability', 'Asset'] }); // Fetch relevant accounts
        // const customersData = await getCustomers();
        // const nextVoucher = await getNextVoucherNumber('CR'); // CR for Cash Receipt

        // --- MOCK DATA (Remove when API is ready) ---
        const accountsData = [
          { id: 'TUITION_FEES', name: 'Tuition Fees Income (Income)' },
          { id: 'ADMISSION_FEES', name: 'Admission Fees (Income)' },
          { id: 'OTHER_INCOME', name: 'Miscellaneous Income (Income)' },
          { id: 'STUDENT_DEPOSIT', name: 'Student Security Deposit (Liability)' },
          { id: 'LOAN_RECEIVED', name: 'Loan Received (Liability)' },
          { id: 'SALE_OF_OLD_ASSET', name: 'Sale of Old Asset (Asset)' },
        ];
        const customersData = [
          { id: 'CUST001', name: 'Aarav Sharma (S/O Ramesh Sharma)' },
          { id: 'CUST002', name: 'Priya Patel (D/O Suresh Patel)' },
          { id: 'CUST000', name: 'Walk-in/Other' } // For generic receipts
        ];
        const nextVoucher = `CR-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-00${Math.floor(Math.random() * 100) + 1}`;
        // --- END MOCK DATA ---

        setCreditAccounts(accountsData || []);
        setCustomers(customersData || []);

        if (isEditMode && transactionId) {
          // const existingTx = await getCashReceiptById(transactionId); // API call
          // setFormData(prev => ({...prev, ...existingTx, voucherNo: existingTx.voucherNo || prev.voucherNo }));
          console.log("Edit mode for transaction ID:", transactionId); // Placeholder
        } else {
          setFormData(prev => ({ ...prev, voucherNo: nextVoucher }));
        }

      } catch (err) {
        setError(`Failed to load initial data: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [isEditMode, transactionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null); // Clear error on input change
    setSuccess(null);
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = customers.find(c => c.id === customerId);
    setFormData(prev => ({
      ...prev,
      receivedFromId: customerId,
      receivedFromName: selectedCustomer ? selectedCustomer.name : (customerId === "OTHER" ? prev.receivedFromName : "")
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.creditAccountId) {
      setError("Please select a credit account.");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    if (!formData.receivedFromName && !formData.receivedFromId) {
      setError("Please specify who the amount was received from.");
      return;
    }
    if (!formData.narration.trim()) {
        setError("Narration/Purpose is required.");
        return;
    }


    setLoading(true);
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount) };
      // if (isEditMode) {
      //   await updateCashReceipt(transactionId, payload);
      //   setSuccess('Cash Receipt Updated Successfully!');
      // } else {
      //   await saveCashReceipt(payload);
      //   setSuccess('Cash Receipt Saved Successfully! Voucher No: ' + payload.voucherNo);
      //   // const nextVoucher = await getNextVoucherNumber('CR'); // Fetch next voucher number
      //   const nextVoucher = `CR-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-00${Math.floor(Math.random() * 100) + 1}`;
      //   setFormData({...initialFormData, voucherNo: nextVoucher, date: new Date().toISOString().split('T')[0]}); // Reset form
      // }
      console.log('Submitting Data:', payload); // API Call placeholder
      setSuccess(`Mock: ${isEditMode ? 'Updated' : 'Saved'} Successfully! Vch No: ${formData.voucherNo}`);
       if (!isEditMode) {
        const nextVoucher = `CR-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-00${Math.floor(Math.random() * 100) + 1}`;
        setFormData({...initialFormData, voucherNo: nextVoucher, date: new Date().toISOString().split('T')[0]}); // Reset form
      }

    } catch (err) {
      setError(`Operation Failed: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    // const currentVoucherNo = formData.voucherNo; // Keep voucher no if it's auto-generated for new entry
    // setFormData({...initialFormData, voucherNo: isEditMode ? formData.voucherNo : currentVoucherNo, date: new Date().toISOString().split('T')[0]});
    setFormData(prev => ({...initialFormData, voucherNo: isEditMode ? prev.voucherNo : prev.voucherNo, date: new Date().toISOString().split('T')[0]}));
    setError(null);
    setSuccess(null);
  };


  if (loading && !formData.voucherNo && !isEditMode) { // Initial loading state
    return <div className="text-center p-5"><div className="spinner-border"></div><p>Loading form...</p></div>;
  }


  return (
    <div className="container-fluid py-3"> {/* Or remove if AccountModulePage.js <Container> is sufficient */}
      <div className="row mb-3">
        <div className="col-12">
          <h3>{isEditMode ? 'Edit Cash Receipt' : 'New Cash Receipt'}</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account/transactions/cash-receipts">Transactions</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{isEditMode ? 'Edit' : 'New'} Cash Receipt</li>
            </ol>
          </nav>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Enter Cash Receipt Details</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="voucherNo" className="form-label">Voucher No.</label>
                <input
                  type="text" id="voucherNo" name="voucherNo" className="form-control"
                  value={formData.voucherNo} onChange={handleInputChange}
                  readOnly={!isEditMode} // Usually auto-generated for new, editable for existing if allowed
                  placeholder="Auto/Manual"
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="date" className="form-label">Date *</label>
                <input
                  type="date" id="date" name="date" className="form-control"
                  value={formData.date} onChange={handleInputChange} required
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="amount" className="form-label">Amount *</label>
                <input
                  type="number" id="amount" name="amount" className="form-control"
                  value={formData.amount} onChange={handleInputChange}
                  placeholder="0.00" step="0.01" min="0.01" required
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="receivedFromId" className="form-label">Received From (Party) *</label>
                <select
                  id="receivedFromId" name="receivedFromId" className="form-select"
                  value={formData.receivedFromId} onChange={handleCustomerChange} required
                >
                  <option value="">Select Party/Customer</option>
                  {customers.map(cust => <option key={cust.id} value={cust.id}>{cust.name}</option>)}
                  <option value="OTHER">Other (Specify Below)</option>
                </select>
              </div>
               {formData.receivedFromId === 'OTHER' && (
                <div className="col-md-6">
                    <label htmlFor="receivedFromName" className="form-label">Specify Payer Name *</label>
                    <input
                    type="text" id="receivedFromName" name="receivedFromName" className="form-control"
                    value={formData.receivedFromName} onChange={handleInputChange}
                    placeholder="Enter payer's name" required={formData.receivedFromId === 'OTHER'}
                    />
                </div>
                )}
                 {formData.receivedFromId !== 'OTHER' && formData.receivedFromId !== '' && (
                     <div className="col-md-6">
                        <label className="form-label">Payer Name (Selected)</label>
                        <input type="text" className="form-control" value={formData.receivedFromName} readOnly disabled />
                    </div>
                 )}

            </div>

            <div className="row g-3 mb-3">
                <div className="col-md-12">
                    <label htmlFor="narration" className="form-label">Narration/Purpose *</label>
                    <input
                    type="text" id="narration" name="narration" className="form-control"
                    value={formData.narration} onChange={handleInputChange}
                    placeholder="e.g., Tuition fees for Class X - July, Advance for sports event" required
                    />
              </div>
            </div>


            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Debit Account</label>
                <input type="text" className="form-control" value="Cash In Hand (Default)" readOnly disabled />
              </div>
              <div className="col-md-6">
                <label htmlFor="creditAccountId" className="form-label">Credit Account *</label>
                <select
                  id="creditAccountId" name="creditAccountId" className="form-select"
                  value={formData.creditAccountId} onChange={handleInputChange} required
                >
                  <option value="">Select Credit Account Head</option>
                  {creditAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12">
                <label htmlFor="remarks" className="form-label">Remarks</label>
                <textarea
                  id="remarks" name="remarks" className="form-control" rows="2"
                  value={formData.remarks} onChange={handleInputChange}
                  placeholder="Any additional notes (optional)"
                ></textarea>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Plus size={16} className="me-1" />
                {loading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Receipt' : 'Save Receipt')}
              </button>
              <button type="button" className="btn btn-info" disabled={loading || !formData.amount}>
                <FileText size={16} className="me-1" />
                Print Receipt
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

export default CashReceiptForm;