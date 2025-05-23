// Reports Component
import React, { useState } from 'react';
import { Eye, FileText, Download, Calendar } from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h3>Reports</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active">Reports</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Date Range Filter</h6>
              <div className="row">
                <div className="col-6">
                  <label className="form-label">From Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={dateRange.fromDate}
                    onChange={(e) => setDateRange({...dateRange, fromDate: e.target.value})}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">To Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={dateRange.toDate}
                    onChange={(e) => setDateRange({...dateRange, toDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Financial Reports</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Cash Book</h6>
                    <p className="mb-1 text-muted">Daily cash transactions report</p>
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary"><Eye size={16} /></button>
                    <button className="btn btn-outline-success"><Download size={16} /></button>
                  </div>
                </div>
                <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Bank Book</h6>
                    <p className="mb-1 text-muted">Bank transaction summary</p>
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary"><Eye size={16} /></button>
                    <button className="btn btn-outline-success"><Download size={16} /></button>
                  </div>
                </div>
                <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Trial Balance</h6>
                    <p className="mb-1 text-muted">All account balances summary</p>
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary"><Eye size={16} /></button>
                    <button className="btn btn-outline-success"><Download size={16} /></button>
                  </div>
                </div>
                <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">General Ledger</h6>
                    <p className="mb-1 text-muted">Account wise transaction details</p>
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary"><Eye size={16} /></button>
                    <button className="btn btn-outline-success"><Download size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">School Reports</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Fee Collection Report</h6>
                    <p className="mb-1 text-muted">Student fee collection summary</p>
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary"><Eye size={16} /></button>
                    <button className="btn btn-outline-success"><Download size={16} /></button>
                  </div>
                </div>
                <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Outstanding Fees</h6>
                    <p className="mb-1 text-muted">Pending fee payments</p>
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary"><Eye size={16} /></button>
                    <button className="btn btn-outline-success"><Download size={16} /></button>
                  </div>
                </div>
                <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Expense Report</h6>
                    <p className="mb-1 text-muted">Monthly expense breakdown</p>
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary"><Eye size={16} /></button>
                    <button className="btn btn-outline-success"><Download size={16} /></button>
                  </div>
                </div>
                <div className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Income Statement</h6>
                    <p className="mb-1 text-muted">Profit & Loss statement</p>
                  </div>
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-primary"><Eye size={16} /></button>
                    <button className="btn btn-outline-success"><Download size={16} /></button>
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