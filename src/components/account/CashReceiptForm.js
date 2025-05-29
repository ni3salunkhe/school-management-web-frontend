// src/components/account/Transactions/Forms/CashReceiptForm.js
import React, { useState, useEffect } from 'react';
import { Plus, FileText, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';
import { jwtDecode } from 'jwt-decode';
// import { getSubHeadMasters, getCustomers, saveCashReceipt, getNextVoucherNumber } from '../../../../services/accountApi'; // Your API service
// import { getCurrentFinancialYear } from '../../../../utils/financialYear'; // Your helper

const initialFormData = {
  createDate: new Date().toISOString().split('T')[0],
  custId: '',
  amount: '',
  narr: '',
  debitAccountId: 'CASH_IN_HAND',
  tranType: 'Cash_Receipt'
};

const CashReceiptForm = ({ isEditMode = false, transactionId = null }) => { // Props for edit mode
  const [formData, setFormData] = useState(initialFormData);
  const [creditAccounts, setCreditAccounts] = useState([]); // SubHeadMasters for credit side
  const [customers, setCustomers] = useState([]); // For 'Received From' dropdown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const schoolUdise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        if (!schoolUdise) {
          setCustomers([]); // Ensure customers is empty if no udise
          return;
        }

        const customersData = await apiService.getbyid("customermaster/getbyudise/", schoolUdise);

        setCustomers(customersData.data || []);

        if (isEditMode && transactionId) {
          // const existingTx = await getCashReceiptById(transactionId); // API call
          // setFormData(prev => ({...prev, ...existingTx, voucherNo: existingTx.voucherNo || prev.voucherNo }));
          console.log("Edit mode for transaction ID:", transactionId); // Placeholder
        } else {
          setFormData(prev => ({ ...prev }));
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

  console.log(customers);
  

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
      custId: customerId    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    if (!formData.receivedFromName && !formData.custId) {
      setError("Please specify who the amount was received from.");
      return;
    }
    if (!formData.narr.trim()) {
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
    setFormData(prev => ({ ...initialFormData, voucherNo: isEditMode ? prev.voucherNo : prev.voucherNo, date: new Date().toISOString().split('T')[0] }));
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
                <label htmlFor="createDate" className="form-label">Date *</label>
                <input
                  type="date" id="createDate" name="createDate" className="form-control"
                  value={(formData.createDate)} onChange={handleInputChange} required
                />
              </div>

            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="custId" className="form-label">Received From (Party) *</label>
                <select
                  id="custId" name="custId" className="form-select"
                  value={formData.custId} onChange={handleCustomerChange} required
                >
                  <option value="">Select Party/Customer</option>
                  {customers.map(cust => <option key={cust.custId} value={cust.custId}>{cust.custName}</option>)}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Debit Account</label>
                <input type="text" className="form-control" value="Cash In Hand (Default)" readOnly disabled />
              </div>

              {/* {formData.custId === 'OTHER' && (
                <div className="col-md-6">
                  <label htmlFor="receivedFromName" className="form-label">Specify Payer Name *</label>
                  <input
                    type="text" id="receivedFromName" name="receivedFromName" className="form-control"
                    value={formData.receivedFromName} onChange={handleInputChange}
                    placeholder="Enter payer's name" required={formData.receivedFromId === 'OTHER'}
                  />
                </div>
              )} */}
              {/* {formData.receivedFromId !== 'OTHER' && formData.receivedFromId !== '' && (
                <div className="col-md-6">
                  <label className="form-label">Payer Name (Selected)</label>
                  <input type="text" className="form-control" value={formData.receivedFromName} readOnly disabled />
                </div>
              )} */}

            </div>

            <div className="row g-3 mb-3">

            </div>


            <h5 className='fw-bold border-top pt-4'>नगद तपशील</h5>
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label htmlFor="amount" className="form-label">Amount *</label>
                <input
                  type="number" id="amount" name="amount" className="form-control"
                  value={formData.amount} onChange={handleInputChange}
                  placeholder="0.00" step="0.01" min="0.01" required
                />
              </div>

              <div className="col-md-9">
                <label htmlFor="narr" className="form-label">Narration/Purpose *</label>
                <input
                  type="text" id="narr" name="narr" className="form-control"
                  value={formData.narr} onChange={handleInputChange}
                  placeholder="e.g., Tuition fees for Class X - July, Advance for sports event" required
                />
              </div>
            </div>

            {/* <div className="row g-3 mb-3">
              <div className="col-12">
                <label htmlFor="remarks" className="form-label">Remarks</label>
                <textarea
                  id="remarks" name="remarks" className="form-control" rows="2"
                  value={formData.remarks} onChange={handleInputChange}
                  placeholder="Any additional notes (optional)"
                ></textarea>
              </div>
            </div> */}

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