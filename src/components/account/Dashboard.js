// src/components/account/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { DollarSign, Building2, Users, CreditCard, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api.service';
// import { getDashboardSummary } from '../../../services/accountApi'; // Your API service

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalCash: 0,
    bankBalance: 0,
    receivables: 0,
    payables: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creditAmount, setCreditAmount] = useState(null)
  const [debitAmount, setDebitAmount] = useState(null)

  useEffect(() => {

    const fetchSumofCrDr = async () => {
      const response = await apiService.getdata(`openingbal/sum`);
      setCreditAmount(response.data.totalCr)
      setDebitAmount(response.data.totalDr)
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // const data = await getDashboardSummary();
        // setSummary(data.summary);
        // setRecentTransactions(data.recentTransactions);

        // --- MOCK DATA (Remove when API is ready) ---
        setSummary({
          totalCash: 245000,
          bankBalance: 567890,
          receivables: 123450,
          payables: 89750,
        });
        setRecentTransactions([
          { id: 1, date: '2024-07-28', type: 'Fee Collection', amount: 15000, status: 'Completed' },
          { id: 2, date: '2024-07-27', type: 'Salary Payment', amount: 45000, status: 'Pending' },
          { id: 3, date: '2024-07-26', type: 'Utility Bill', amount: 8500, status: 'Completed' },
        ]);
        // --- END MOCK DATA ---
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // You might want to set an error state here to display to the user
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
    fetchSumofCrDr()
  }, []);

  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 200px)' }}> {/* Adjust minHeight as needed */}
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    // The container-fluid can stay if you want this component to manage its own fluid width
    // or remove it if the parent <Container> in AccountModulePage.js handles it.
    // p-0 could be added if AccountModulePage's Container has padding you want to negate here.
    <div className="container-fluid py-3">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-0">Accounting Dashboard</h2>
          <p className="text-muted">School Management System</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <DollarSign size={40} className="me-3" />
                <div>
                  <h5 className="card-title mb-0">Total Cash</h5>
                  <h3 className="mb-0">{formatCurrency(summary.totalCash)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <Building2 size={40} className="me-3" />
                <div>
                  <h5 className="card-title mb-0">Bank Balance</h5>
                  <h3 className="mb-0">{formatCurrency(summary.bankBalance)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card bg-warning text-dark h-100"> {/* Ensure text contrast */}
            <div className="card-body">
              <div className="d-flex align-items-center">
                <Users size={40} className="me-3" />
                <div>
                  <h5 className="card-title mb-0">Receivables</h5>
                  <h3 className="mb-0">{formatCurrency(summary.receivables)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3 mb-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <CreditCard size={40} className="me-3" />
                <div>
                  <h5 className="card-title mb-0">Payables</h5>
                  <h3 className="mb-0">{formatCurrency(summary.payables)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-7 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Recent Transactions</h5>
            </div>
            <div className="card-body">
              {recentTransactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th className="text-end">Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{new Date(tx.date).toLocaleDateString()}</td>
                          <td>{tx.type}</td>
                          <td className="text-end">{formatCurrency(tx.amount)}</td>
                          <td>
                            <span className={`badge ${tx.status === 'Completed' ? 'bg-success' : tx.status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center mt-3">No recent transactions found.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-5 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              {
                creditAmount === debitAmount ? <div className="list-group">
                  <Link to="cash-receipt" className="list-group-item list-group-item-action d-flex align-items-center">
                    <Plus size={20} className="me-3 text-primary" /> Create Cash Receipt
                  </Link>
                  <Link to="cash-payment" className="list-group-item list-group-item-action d-flex align-items-center">
                    <Plus size={20} className="me-3 text-success" /> Create Cash Payment
                  </Link>
                  <Link to="bank-receipt" className="list-group-item list-group-item-action d-flex align-items-center">
                    <Plus size={20} className="me-3 text-info" /> Create Bank Receipt
                  </Link>
                  <Link to="bank-payment" className="list-group-item list-group-item-action d-flex align-items-center">
                    <Plus size={20} className="me-3 text-warning" /> Create Bank Payment
                  </Link>
                  <Link to="contra-payment" className="list-group-item list-group-item-action d-flex align-items-center">
                    <Plus size={20} className="me-3 text-danger" /> Create Contra Payment
                  </Link>
                  <Link to="Journal" className="list-group-item list-group-item-action d-flex align-items-center">
                    <Plus size={20} className="me-3 text-info" /> Create Journal Payment
                  </Link>
                  <Link to="expense" className="list-group-item list-group-item-action d-flex align-items-center">
                    <Plus size={20} className="me-3 text-info" /> Create Expenses Payment
                  </Link>
                  <Link to="/account/masters/sub-head" className="list-group-item list-group-item-action d-flex align-items-center mt-2 border-top pt-3">
                    <Plus size={20} className="me-3 text-secondary" /> Manage Account Heads
                  </Link>
                </div> : <div>First Balance the credit amount and debit amount</div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;