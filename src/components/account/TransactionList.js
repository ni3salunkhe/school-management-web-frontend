// src/components/account/Transactions/Lists/TransactionList.js
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Edit, Trash2, Eye, PlusCircle, Download, Printer } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate for programmatic navigation
// import { getTransactionsList, deleteTransaction } from '../../../../services/accountApi'; // Example API

const TransactionList = ({ transactionType, title }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    fromDate: '',
    toDate: '',
    status: 'all', // e.g., 'Posted', 'Pending', 'Cancelled'
    minAmount: '',
    maxAmount: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Or make this configurable

  const apiEndpointMap = {
    'cash-receipt': '/cash-receipts',
    'cash-payment': '/cash-payments',
    'bank-receipt': '/bank-receipts',
    'bank-payment': '/bank-payments',
    // 'journal-voucher': '/journal-vouchers', // If you add JVs
  };

  const newEntryPathMap = {
    'cash-receipt': '/account/transactions/cash-receipt/new',
    'cash-payment': '/account/transactions/cash-payment/new',
    'bank-receipt': '/account/transactions/bank-receipt/new',
    'bank-payment': '/account/transactions/bank-payment/new',
  };
  const editEntryPathBaseMap = {
    'cash-receipt': '/account/transactions/cash-receipt', // Will append /:id/edit
    'cash-payment': '/account/transactions/cash-payment',
    'bank-receipt': '/account/transactions/bank-receipt',
    'bank-payment': '/account/transactions/bank-payment',
  };


  useEffect(() => {
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionType, currentPage]); // Refetch if type changes or page changes

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      // const endpoint = apiEndpointMap[transactionType];
      // if (!endpoint) throw new Error("Invalid transaction type for API");
      // const params = { ...filters, page: currentPage, limit: itemsPerPage };
      // const data = await getTransactionsList(endpoint, params); // API Call
      // setTransactions(data.transactions || []);
      // setFilteredTransactions(data.transactions || []); // Initially show all fetched
      // setTotalPages(data.totalPages || 1);

      // --- MOCK DATA ---
      let mockData = [];
      const baseVoucher = transactionType.split('-')[0].toUpperCase().slice(0,1) + transactionType.split('-')[1].toUpperCase().slice(0,1); // CR, CP, BR, BP

      for (let i = 1; i <= 25; i++) {
        const day = String( (i % 28) + 1).padStart(2,'0');
        const month = String( (i % 12) + 1).padStart(2,'0');
        mockData.push({
          id: `${baseVoucher}${100 + i}`,
          voucherNo: `${baseVoucher}V00${100 + i}`,
          date: `2024-${month}-${day}`,
          partyName: `Party Name ${String.fromCharCode(65 + (i % 26))}`, // A, B, C...
          narration: `${title} for various school activities ${i}`,
          amount: (Math.random() * 50000) + 1000,
          status: i % 3 === 0 ? 'Pending' : (i % 5 === 0 ? 'Cancelled' : 'Posted'),
          bankName: transactionType.includes('bank') ? (i%2 === 0 ? 'SBI Main' : 'HDFC Corp') : null,
        });
      }
      setTransactions(mockData);
      // setFilteredTransactions(mockData); // Filtering logic will handle this
      // --- END MOCK DATA ---
    } catch (err) {
      setError(`Failed to fetch transactions: ${err.message}`);
      setTransactions([]);
      // setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    // This function would ideally trigger a new API call with filters.
    // For client-side filtering (if data set is small):
    let filtered = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
        const toDate = filters.toDate ? new Date(filters.toDate) : null;

        return (
            (tx.voucherNo.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
             tx.partyName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
             tx.narration.toLowerCase().includes(filters.searchTerm.toLowerCase())) &&
            (filters.status === 'all' || tx.status.toLowerCase() === filters.status.toLowerCase()) &&
            (!fromDate || txDate >= fromDate) &&
            (!toDate || txDate <= toDate) &&
            (filters.minAmount === '' || tx.amount >= parseFloat(filters.minAmount)) &&
            (filters.maxAmount === '' || tx.amount <= parseFloat(filters.maxAmount))
        );
    });
    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  };

  // Memoized pagination logic
  const paginatedTransactions = useMemo(() => {
    const dataToPaginate = filteredTransactions.length > 0 || filters.searchTerm || filters.status !== 'all' || filters.fromDate || filters.toDate || filters.minAmount || filters.maxAmount ? filteredTransactions : transactions;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return dataToPaginate.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, transactions, currentPage, itemsPerPage, filters]);

  const totalPages = useMemo(() => {
    const dataToPaginate = filteredTransactions.length > 0 || filters.searchTerm || filters.status !== 'all' || filters.fromDate || filters.toDate || filters.minAmount || filters.maxAmount ? filteredTransactions : transactions;
    return Math.ceil(dataToPaginate.length / itemsPerPage);
  }, [filteredTransactions, transactions, itemsPerPage, filters]);


  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDelete = async (txId, voucherNo) => {
    if (window.confirm(`Are you sure you want to delete transaction ${voucherNo}?`)) {
      setLoading(true); // Or a specific deleting state
      try {
        // const endpoint = apiEndpointMap[transactionType];
        // await deleteTransaction(endpoint, txId); // API Call
        console.log(`Mock Deleting ${transactionType} ID: ${txId}`);
        fetchTransactions(); // Refresh list
      } catch (err) {
        setError(`Failed to delete transaction: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = (txId) => {
    console.log(`View transaction ${txId}`);
    // Navigate to a detailed view page: navigate(`${editEntryPathBaseMap[transactionType]}/${txId}/view`)
    // Or show a modal with details
  };

  const handleEdit = (txId) => {
    const path = `${editEntryPathBaseMap[transactionType]}/${txId}/edit`;
    console.log("Navigating to edit:", path);
    // navigate(path); // Uncomment when edit routes are set up
    alert(`Would navigate to edit for ${txId}. Path: ${path}`);
  };


  const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB'); // DD/MM/YYYY

  return (
    <div className="container-fluid py-3">
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h3>{title || 'Transaction List'}</h3>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/account/dashboard">Transactions</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{title || 'List'}</li>
              </ol>
            </nav>
          </div>
          {newEntryPathMap[transactionType] && (
            <Link to={newEntryPathMap[transactionType]} className="btn btn-primary">
              <PlusCircle size={18} className="me-2" /> New {transactionType.replace('-', ' ')}
            </Link>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0"><Filter size={18} className="me-2"/>Search & Filter</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="searchTerm" className="form-label">Search Term</label>
              <input type="text" id="searchTerm" name="searchTerm" className="form-control form-control-sm" placeholder="Voucher No, Party, Narration..." value={filters.searchTerm} onChange={handleFilterChange}/>
            </div>
            <div className="col-md-2">
              <label htmlFor="fromDate" className="form-label">From Date</label>
              <input type="date" id="fromDate" name="fromDate" className="form-control form-control-sm" value={filters.fromDate} onChange={handleFilterChange}/>
            </div>
            <div className="col-md-2">
              <label htmlFor="toDate" className="form-label">To Date</label>
              <input type="date" id="toDate" name="toDate" className="form-control form-control-sm" value={filters.toDate} onChange={handleFilterChange}/>
            </div>
            <div className="col-md-2">
              <label htmlFor="status" className="form-label">Status</label>
              <select id="status" name="status" className="form-select form-select-sm" value={filters.status} onChange={handleFilterChange}>
                <option value="all">All Status</option>
                <option value="Posted">Posted</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-2">
                <label htmlFor="minAmount" className="form-label">Min Amount</label>
                <input type="number" id="minAmount" name="minAmount" className="form-control form-control-sm" value={filters.minAmount} onChange={handleFilterChange} placeholder="e.g. 1000"/>
            </div>
             <div className="col-md-2">
                <label htmlFor="maxAmount" className="form-label">Max Amount</label>
                <input type="number" id="maxAmount" name="maxAmount" className="form-control form-control-sm" value={filters.maxAmount} onChange={handleFilterChange} placeholder="e.g. 50000"/>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary btn-sm w-100" onClick={applyFilters} disabled={loading}>
                <Search size={16} className="me-1"/> Apply Filters
              </button>
            </div>
             <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => { setFilters({searchTerm: '', fromDate: '', toDate: '', status: 'all', minAmount:'', maxAmount:''}); setFilteredTransactions([]); setCurrentPage(1); fetchTransactions(); }} disabled={loading}>
                 Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Transactions ({filteredTransactions.length > 0 || filters.searchTerm || filters.status !== 'all' || filters.fromDate || filters.toDate || filters.minAmount || filters.maxAmount ? filteredTransactions.length : transactions.length})</h5>
          <div>
            <button className="btn btn-sm btn-outline-success me-2" disabled={paginatedTransactions.length === 0}><Download size={16} className="me-1"/>Export Excel</button>
            <button className="btn btn-sm btn-outline-info" disabled={paginatedTransactions.length === 0}><Printer size={16} className="me-1"/>Print List</button>
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? <div className="text-center p-5"><div className="spinner-border"></div></div> :
            paginatedTransactions.length === 0 ? <p className="p-3 text-center text-muted">No transactions found matching your criteria.</p> :
            (
              <div className="table-responsive">
                <table className="table table-hover table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Voucher No.</th>
                      <th>Date</th>
                      {transactionType.includes('bank') && <th>Bank Name</th>}
                      <th>Party Name</th>
                      <th>Narration</th>
                      <th className="text-end">Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.map(tx => (
                      <tr key={tx.id}>
                        <td>{tx.voucherNo}</td>
                        <td>{formatDate(tx.date)}</td>
                        {transactionType.includes('bank') && <td>{tx.bankName || '-'}</td>}
                        <td>{tx.partyName}</td>
                        <td title={tx.narration} style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{tx.narration}</td>
                        <td className="text-end">{formatCurrency(tx.amount)}</td>
                        <td>
                          <span className={`badge ${
                            tx.status === 'Posted' ? 'bg-success' :
                            tx.status === 'Pending' ? 'bg-warning text-dark' :
                            tx.status === 'Cancelled' ? 'bg-danger' : 'bg-secondary'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-info" onClick={() => handleView(tx.id)} title="View Details"><Eye size={14} /></button>
                            {tx.status !== 'Cancelled' && tx.status !== 'Posted' && /* Allow edit only if not Posted/Cancelled */
                                <button className="btn btn-outline-primary" onClick={() => handleEdit(tx.id)} title="Edit"><Edit size={14} /></button>
                            }
                            {tx.status !== 'Posted' && /* Allow delete only if not Posted */
                                <button className="btn btn-outline-danger" onClick={() => handleDelete(tx.id, tx.voucherNo)} title="Delete"><Trash2 size={14} /></button>
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
        {totalPages > 1 && !loading && paginatedTransactions.length > 0 && (
            <div className="card-footer d-flex justify-content-center">
                <nav aria-label="Page navigation">
                    <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                        </li>
                        {[...Array(totalPages).keys()].map(num => (
                             (num < 3 || num > totalPages - 4 || Math.abs(num - (currentPage -1) ) < 2) && // Smart pagination display
                            <li key={num + 1} className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(num + 1)}>{num + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                        </li>
                    </ul>
                </nav>
            </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;