// Bank Master Component
import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

const BankMasterForm = () => {
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountType: '',
    branchName: '',
    ifscCode: '',
    openingBalance: '',
    status: 'Active'
  });

  const handleSubmit = () => {
    // API call to save bank master
    console.log('Bank Master Data:', formData);
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h3>Bank Master</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">Masters</li>
              <li className="breadcrumb-item active">Bank Master</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Bank Details</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Bank Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    placeholder="Enter bank name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Account Number *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    placeholder="Enter account number"
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Account Type</label>
                  <select 
                    className="form-control"
                    value={formData.accountType}
                    onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                  >
                    <option value="">Select Account Type</option>
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="Fixed Deposit">Fixed Deposit</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Branch Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.branchName}
                    onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                    placeholder="Enter branch name"
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">IFSC Code</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
                    placeholder="Enter IFSC code"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Opening Balance</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({...formData, openingBalance: e.target.value})}
                    placeholder="Enter opening balance"
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" onClick={handleSubmit}>
                  <Plus size={16} className="me-1" />
                  Save Bank
                </button>
                <button className="btn btn-secondary">
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Bank List</h6>
            </div>
            <div className="card-body">
              <div className="list-group">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">SBI Main Branch</h6>
                    <small>A/c: ****1234</small>
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary"><Edit size={14} /></button>
                    <button className="btn btn-outline-danger"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};