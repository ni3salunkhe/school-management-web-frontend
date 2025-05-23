// src/components/account/Transactions/Forms/BankReceiptForm.js
import React, { useState, useEffect } from 'react';
import { Plus, FileText, XCircle, Landmark } from 'lucide-react';
// import { getBankMasters, getSubHeadMasters, getCustomers, saveBankReceipt, getNextVoucherNumber } from '../../../../services/accountApi';
import { Link } from 'react-router-dom';

const initialFormData = {
  voucherNo: '',
  date: new Date().toISOString().split('T')[0],
  bankAccountId: '', // ID of the BankMaster
  receivedFromId: '',
  receivedFromName: '',
  amount: '',
  transactionType: 'Cheque', // Cheque, NEFT, RTGS, UPI, DirectDeposit
  referenceNo: '', // Cheque No, UTR No, etc.
  referenceDate: '', // Cheque Date
  narration: '',
  creditAccountId: '', // User selects Income/Liability/Asset account
  remarks: '',
};

const BankReceiptForm = ({ isEditMode = false, transactionId = null }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [bankAccounts, setBankAccounts] = useState([]); // From BankMaster
  const [creditAccounts, setCreditAccounts] = useState([]); // SubHeadMasters
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const transactionTypes = ["Cheque", "NEFT", "RTGS", "IMPS", "UPI", "Direct Deposit", "Card Swipe", "Other"];


  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // const banks = await getBankMasters({ status: 'Active' });
        // const accounts = await getSubHeadMasters({ types: ['Income', 'Liability', 'Asset'] });
        // const partiesData = await getCustomers();
        // const nextVoucher = await getNextVoucherNumber('BR');

        // --- MOCK DATA ---
        const banks = [ { id: 'bk001', bankName: 'State Bank of India - Main (Savings)', accountNumber: '...8901' }, { id: 'bk002', bankName: 'HDFC Bank - Corporate (Current)', accountNumber: '...2109' }];
        const accounts = [ { id: 'TUITION_FEES', name: 'Tuition Fees Income' }, { id: 'DONATION_REC', name: 'Donations Received' }, { id: 'LOAN_RECEIVED', name: 'Loan from Bank XYZ' }];
        const partiesData = [ { id: 'CUST001', name: 'Aarav Sharma' }, { id: 'ORG001', name: 'Ministry of Education (Grant)' }, { id: 'PARTY000', name: 'Other Depositor'}];
        const nextVoucher = `BR-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-00${Math.floor(Math.random() * 100) + 1}`;
        // --- END MOCK DATA ---

        setBankAccounts(banks || []);
        setCreditAccounts(accounts || []);
        setParties(partiesData || []);

        if (isEditMode && transactionId) {
          // const existingTx = await getBankReceiptById(transactionId);
          // setFormData(prev => ({...prev, ...existingTx, voucherNo: existingTx.voucherNo || prev.voucherNo}));
           console.log("Edit BR ID:", transactionId);
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
  }, [isEditMode, transactionId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
    setSuccess(null);
  };

   const handlePartyChange = (e) => {
    const partyId = e.target.value;
    const selectedParty = parties.find(p => p.id === partyId);
    setFormData(prev => ({
      ...prev,
      receivedFromId: partyId,
      receivedFromName: selectedParty ? selectedParty.name : (partyId === "OTHER_DEPOSITOR" ? prev.receivedFromName : "")
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.bankAccountId || !formData.creditAccountId || !formData.amount || (!formData.receivedFromName && !formData.receivedFromId) || !formData.narration.trim() || (formData.transactionType !== 'Direct Deposit' && formData.transactionType !== 'Card Swipe' && !formData.referenceNo)) {
      setError("Please fill all required fields: Bank A/C, Received From, Amount, Narration, Credit A/C, and Reference No (if applicable).");
      return;
    }
     if (parseFloat(formData.amount) <= 0) {
        setError("Amount must be greater than zero.");
        return;
    }


    setLoading(true);
    try {
      const payload = { ...formData, amount: parseFloat(formData.amount), debitAccountId: formData.bankAccountId }; // Bank account is debited
      // if (isEditMode) { await updateBankReceipt(transactionId, payload); }
      // else { await saveBankReceipt(payload); }
      console.log('Submitting Bank Receipt (Mock):', payload);
      setSuccess(`Bank Receipt ${isEditMode ? 'Updated' : 'Saved'} Successfully! Voucher No: ${formData.voucherNo}`);
      if (!isEditMode) {
        // const nextVoucher = await getNextVoucherNumber('BR');
        const nextVoucher = `BR-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-00${Math.floor(Math.random() * 100) + 1}`;
        setFormData({...initialFormData, voucherNo: nextVoucher, date: new Date().toISOString().split('T')[0]});
      }
    } catch (err) {
      setError(`Operation Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData(prev => ({...initialFormData, voucherNo: isEditMode ? prev.voucherNo : prev.voucherNo, date: new Date().toISOString().split('T')[0]}));
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
          <h3>{isEditMode ? 'Edit Bank Receipt' : 'New Bank Receipt'}</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account/transactions/bank-receipts">Transactions</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{isEditMode ? 'Edit' : 'New'} Bank Receipt</li>
            </ol>
          </nav>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card">
        <div className="card-header"><h5 className="mb-0"><Landmark size={20} className="me-2"/>Enter Bank Receipt Details</h5></div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label htmlFor="voucherNo" className="form-label">Voucher No.</label>
                <input type="text" id="voucherNo" name="voucherNo" className="form-control" value={formData.voucherNo} onChange={handleInputChange} readOnly={!isEditMode}/>
              </div>
              <div className="col-md-3">
                <label htmlFor="date" className="form-label">Date *</label>
                <input type="date" id="date" name="date" className="form-control" value={formData.date} onChange={handleInputChange} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="bankAccountId" className="form-label">Bank Account (Debit) *</label>
                <select id="bankAccountId" name="bankAccountId" className="form-select" value={formData.bankAccountId} onChange={handleInputChange} required>
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map(bank => <option key={bank.id} value={bank.id}>{bank.bankName} ({bank.accountNumber})</option>)}
                </select>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="amount" className="form-label">Amount *</label>
                <input type="number" id="amount" name="amount" className="form-control" value={formData.amount} onChange={handleInputChange} placeholder="0.00" step="0.01" min="0.01" required />
              </div>
              <div className="col-md-4">
                <label htmlFor="transactionType" className="form-label">Transaction Type *</label>
                <select id="transactionType" name="transactionType" className="form-select" value={formData.transactionType} onChange={handleInputChange} required>
                    {transactionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              {formData.transactionType !== 'Direct Deposit' && formData.transactionType !== 'Card Swipe' && formData.transactionType !== 'Other' && (
                  <>
                    <div className="col-md-4">
                        <label htmlFor="referenceNo" className="form-label">{formData.transactionType === 'Cheque' ? 'Cheque No.' : 'Ref/UTR No.'} *</label>
                        <input type="text" id="referenceNo" name="referenceNo" className="form-control" value={formData.referenceNo} onChange={handleInputChange} placeholder="Enter reference number" required />
                    </div>
                    {formData.transactionType === 'Cheque' && (
                        <div className="col-md-4">
                            <label htmlFor="referenceDate" className="form-label">Cheque Date</label>
                            <input type="date" id="referenceDate" name="referenceDate" className="form-control" value={formData.referenceDate} onChange={handleInputChange} />
                        </div>
                    )}
                  </>
              )}
               {(formData.transactionType === 'Other' || formData.transactionType === 'Direct Deposit' || formData.transactionType === 'Card Swipe') && (
                 <div className="col-md-4">
                    <label htmlFor="referenceNo" className="form-label">Reference/Details (Optional)</label>
                    <input type="text" id="referenceNo" name="referenceNo" className="form-control" value={formData.referenceNo} onChange={handleInputChange} placeholder="e.g., Depositor name, Card Type" />
                </div>
               )}


            </div>


            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="receivedFromId" className="form-label">Received From (Party) *</label>
                 <select id="receivedFromId" name="receivedFromId" className="form-select" value={formData.receivedFromId} onChange={handlePartyChange} required>
                    <option value="">Select Party/Depositor</option>
                    {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    <option value="OTHER_DEPOSITOR">Other (Specify Below)</option>
                 </select>
              </div>
              {formData.receivedFromId === 'OTHER_DEPOSITOR' && (
                <div className="col-md-6">
                    <label htmlFor="receivedFromName" className="form-label">Specify Depositor Name *</label>
                    <input type="text" id="receivedFromName" name="receivedFromName" className="form-control" value={formData.receivedFromName} onChange={handleInputChange} placeholder="Enter depositor's name" required={formData.receivedFromId === 'OTHER_DEPOSITOR'}/>
                </div>
              )}
              {formData.receivedFromId && formData.receivedFromId !== 'OTHER_DEPOSITOR' && (
                <div className="col-md-6">
                    <label className="form-label">Depositor Name (Selected)</label>
                    <input type="text" className="form-control" value={formData.receivedFromName} readOnly disabled />
                </div>
              )}
            </div>

            <div className="row g-3 mb-3">
                 <div className="col-md-6">
                    <label htmlFor="narration" className="form-label">Narration/Purpose *</label>
                    <input type="text" id="narration" name="narration" className="form-control" value={formData.narration} onChange={handleInputChange} placeholder="e.g., Online fees transfer, Grant received" required/>
                </div>
                <div className="col-md-6">
                    <label htmlFor="creditAccountId" className="form-label">Credit Account * (Income/Liability/Asset)</label>
                    <select id="creditAccountId" name="creditAccountId" className="form-select" value={formData.creditAccountId} onChange={handleInputChange} required>
                    <option value="">Select Credit Account Head</option>
                    {creditAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                </div>
            </div>


            <div className="row g-3 mb-3">
              <div className="col-12">
                <label htmlFor="remarks" className="form-label">Remarks</label>
                <textarea id="remarks" name="remarks" className="form-control" rows="2" value={formData.remarks} onChange={handleInputChange} placeholder="Any additional notes (optional)"></textarea>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-success" disabled={loading}>
                <Plus size={16} className="me-1" />
                {loading ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Receipt' : 'Save Receipt')}
              </button>
              <button type="button" className="btn btn-info" disabled={loading || !formData.amount}>
                <FileText size={16} className="me-1" /> Print Receipt
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

export default BankReceiptForm;