// src/components/account/Masters/BankMasterForm.js
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, XCircle, PlusCircle } from 'lucide-react';
// import { getBankMasters, saveBankMaster, updateBankMaster, deleteBankMaster } from '../../../services/accountApi';
import { Link } from 'react-router-dom';


const initialFormData = {
  id: null,
  bankName: '',
  accountNumber: '',
  accountType: '',
  branchName: '',
  ifscCode: '',
  openingBalance: '',
  status: 'Active'
};

const BankMasterForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [bankList, setBankList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    setLoading(true);
    setError(null);
    try {
      // const data = await getBankMasters();
      // setBankList(data || []);
      // --- MOCK DATA ---
      const mockBanks = [
        { id: 'bk001', bankName: 'State Bank of India - Main', accountNumber: '12345678901', accountType: 'Savings', branchName: 'City Center', ifscCode: 'SBIN000123', openingBalance: 500000, status: 'Active' },
        { id: 'bk002', bankName: 'HDFC Bank - Corporate', accountNumber: '98765432109', accountType: 'Current', branchName: 'Business Park', ifscCode: 'HDFC000567', openingBalance: 1200000, status: 'Active' },
        { id: 'bk003', bankName: 'ICICI Bank - Personal', accountNumber: '11223344556', accountType: 'Savings', branchName: 'Residential Area', ifscCode: 'ICIC000789', openingBalance: 250000, status: 'Inactive' },
      ];
      setBankList(mockBanks);
      // --- END MOCK DATA ---
    } catch (err) {
      setError(`Failed to fetch banks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bankName || !formData.accountNumber) {
      setError("Bank Name and Account Number are required.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      let response;
      if (isEditing && formData.id) {
        // response = await updateBankMaster(formData.id, formData);
        console.log('Updating Bank Master (Mock):', formData);
        response = {...formData, id: formData.id}; // Mock response
        setSuccess(`Bank "${formData.bankName}" updated successfully!`);
      } else {
        // response = await saveBankMaster(formData);
        console.log('Saving New Bank Master (Mock):', formData);
        response = {...formData, id: `bk00${bankList.length + 1}`}; // Mock response with new ID
        setSuccess(`Bank "${formData.bankName}" saved successfully!`);
      }
      handleClear();
      fetchBanks(); // Refresh list
    } catch (err) {
      setError(`Operation Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bank) => {
    setIsEditing(true);
    setFormData({ ...bank, openingBalance: bank.openingBalance || '' }); // Ensure openingBalance is not null/undefined for input
    setError(null);
    setSuccess(null);
    window.scrollTo(0, 0); // Scroll to top to see the form
  };

  const handleDelete = async (bankId, bankName) => {
    if (window.confirm(`Are you sure you want to delete bank "${bankName}"? This action cannot be undone.`)) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        // await deleteBankMaster(bankId);
        console.log('Deleting bank ID (Mock):', bankId);
        setSuccess(`Bank "${bankName}" deleted successfully!`);
        fetchBanks(); // Refresh list
      } catch (err) {
        setError(`Failed to delete bank: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const filteredBankList = bankList.filter(bank =>
    bank.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.accountNumber.includes(searchTerm)
  );

  return (
    <div className="container-fluid py-3">
      <div className="row mb-3">
        <div className="col-12">
          <h3>Bank Master</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account/dashboard">Masters</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Bank Master</li>
            </ol>
          </nav>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {isEditing ? 'Edit Bank Details' : <><PlusCircle size={20} className="me-2" /> Add New Bank</>}
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="bankName" className="form-label">Bank Name *</label>
                <input type="text" id="bankName" name="bankName" className="form-control" value={formData.bankName} onChange={handleInputChange} placeholder="e.g., State Bank of India" required />
              </div>
              <div className="col-md-6">
                <label htmlFor="accountNumber" className="form-label">Account Number *</label>
                <input type="text" id="accountNumber" name="accountNumber" className="form-control" value={formData.accountNumber} onChange={handleInputChange} placeholder="Enter account number" required />
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="accountType" className="form-label">Account Type</label>
                <select id="accountType" name="accountType" className="form-select" value={formData.accountType} onChange={handleInputChange}>
                  <option value="">Select Account Type</option>
                  <option value="Savings">Savings Account</option>
                  <option value="Current">Current Account</option>
                  <option value="OD">Overdraft Account</option>
                  <option value="CC">Cash Credit Account</option>
                  <option value="Fixed Deposit">Fixed Deposit</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="branchName" className="form-label">Branch Name</label>
                <input type="text" id="branchName" name="branchName" className="form-control" value={formData.branchName} onChange={handleInputChange} placeholder="e.g., Main Branch, City Center" />
              </div>
              <div className="col-md-4">
                <label htmlFor="ifscCode" className="form-label">IFSC Code</label>
                <input type="text" id="ifscCode" name="ifscCode" className="form-control" value={formData.ifscCode} onChange={handleInputChange} placeholder="Enter IFSC code" />
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6"> {/* Reduced width, as opening balance usually set in Opening Balance screen */}
                <label htmlFor="openingBalance" className="form-label">Book Opening Balance (Optional)</label>
                <input type="number" id="openingBalance" name="openingBalance" className="form-control" value={formData.openingBalance} onChange={handleInputChange} placeholder="0.00" step="0.01" />
                 <small className="form-text text-muted">This is for record. Actual financial opening balance is set in 'Opening Balance' screen.</small>
              </div>
              <div className="col-md-6">
                <label htmlFor="status" className="form-label">Status</label>
                <select id="status" name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={16} className="me-1" />
                {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Bank' : 'Save Bank')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
                <XCircle size={16} className="me-1" />
                {isEditing ? 'Cancel Edit' : 'Clear Form'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Existing Banks</h5>
                <input
                    type="text"
                    className="form-control w-auto"
                    placeholder="Search banks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <div className="card-body p-0">
          {loading && bankList.length === 0 ? <div className="text-center p-3"><div className="spinner-border spinner-border-sm"></div> Loading...</div> :
            filteredBankList.length === 0 ? <p className="p-3 text-center text-muted">No banks found matching your criteria or no banks added yet.</p> :
              (
                <div className="table-responsive">
                  <table className="table table-hover table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Bank Name</th>
                        <th>A/C Number</th>
                        <th>A/C Type</th>
                        <th>Branch</th>
                        <th>IFSC</th>
                        <th className="text-end">Opening Balance</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBankList.map(bank => (
                        <tr key={bank.id}>
                          <td>{bank.bankName}</td>
                          <td>{bank.accountNumber}</td>
                          <td>{bank.accountType}</td>
                          <td>{bank.branchName}</td>
                          <td>{bank.ifscCode}</td>
                          <td className="text-end">{bank.openingBalance ? `₹${Number(bank.openingBalance).toLocaleString('en-IN')}` : '-'}</td>
                          <td>
                            <span className={`badge ${bank.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                              {bank.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" onClick={() => handleEdit(bank)} title="Edit"><Edit size={14} /></button>
                              <button className="btn btn-outline-danger" onClick={() => handleDelete(bank.id, bank.bankName)} title="Delete"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        </div>
         {filteredBankList.length > 0 && <div className="card-footer text-muted small">
            Showing {filteredBankList.length} of {bankList.length} banks.
        </div>}
      </div>
    </div>
  );
};

export default BankMasterForm;