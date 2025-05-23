// src/components/account/Reports/ReportsDashboard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, BarChart2, TrendingUp, Layers, Users, CalendarDays, Download } from 'lucide-react';

const ReportItem = ({ title, description, link, icon }) => (
  <Link to={link} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center text-decoration-none">
    <div className="d-flex align-items-center">
      {icon || <FileText size={24} className="me-3 text-primary" />}
      <div>
        <h6 className="mb-1">{title}</h6>
        <p className="mb-0 text-muted small">{description}</p>
      </div>
    </div>
    <Download size={18} className="text-secondary report-download-icon" title="Quick Download Options (if available)" onClick={(e) => { e.preventDefault(); alert(`Download options for ${title}`);}}/>
  </Link>
);


const ReportsDashboard = () => {
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    toDate: new Date().toISOString().split('T')[0], // Today
  });
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("2024-2025"); // Example

  const handleDateChange = (e) => {
    setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleFyChange = (e) => {
    setSelectedFinancialYear(e.target.value);
  };

  const commonReportParams = `?fromDate=${dateRange.fromDate}&toDate=${dateRange.toDate}&fy=${selectedFinancialYear}`;


  const financialReports = [
    { title: "General Ledger", description: "Detailed view of transactions for any account.", link: `/account/reports/general-ledger`, icon: <Layers size={24} className="me-3 text-info"/> },
    { title: "Day Book", description: "Summary of daily cash and bank transactions.", link: `/account/reports/day-book`, icon: <CalendarDays size={24} className="me-3 text-success"/> },
    { title: "Cash Book", description: "All cash receipts and payments.", link: `/account/reports/cash-book${commonReportParams}`, icon: <FileText size={24} className="me-3 text-primary"/> },
    { title: "Bank Book", description: "Transactions for selected bank accounts.", link: `/account/reports/bank-book${commonReportParams}`, icon: <FileText size={24} className="me-3 text-primary"/> },
    { title: "Trial Balance", description: "Summary of all ledger balances.", link: `/account/reports/trial-balance${commonReportParams}`, icon: <BarChart2 size={24} className="me-3 text-warning"/> },
    { title: "Profit & Loss Account", description: "Income and expenses statement.", link: `/account/reports/profit-loss${commonReportParams}`, icon: <TrendingUp size={24} className="me-3 text-danger"/> },
    { title: "Balance Sheet", description: "Assets, Liabilities, and Capital statement.", link: `/account/reports/balance-sheet${commonReportParams}`, icon: <Layers size={24} className="me-3 text-purple"/> }, // You'd need a .text-purple CSS class
  ];

  const schoolSpecificReports = [
    { title: "Fee Collection Report", description: "Summary of fees collected from students.", link: `/account/reports/fee-collection${commonReportParams}`, icon: <Users size={24} className="me-3 text-primary"/> },
    { title: "Outstanding Fees", description: "List of students with pending fee payments.", link: `/account/reports/outstanding-fees${commonReportParams}`, icon: <Users size={24} className="me-3 text-danger"/> },
    { title: "Expense Analysis", description: "Breakdown of expenses by category.", link: `/account/reports/expense-analysis${commonReportParams}`, icon: <BarChart2 size={24} className="me-3 text-warning"/> },
    // Add more as needed
  ];


  return (
    <div className="container-fluid">
      <div className="row mb-3">
        <div className="col-12">
          <h3>Accounting Reports</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account/dashboard">Reports</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Reports Overview</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
            <h5 className="mb-0">Common Report Filters</h5>
        </div>
        <div className="card-body">
            <div className="row g-3">
                <div className="col-md-3">
                    <label htmlFor="fromDate" className="form-label">From Date</label>
                    <input type="date" id="fromDate" name="fromDate" className="form-control form-control-sm" value={dateRange.fromDate} onChange={handleDateChange} />
                </div>
                <div className="col-md-3">
                    <label htmlFor="toDate" className="form-label">To Date</label>
                    <input type="date" id="toDate" name="toDate" className="form-control form-control-sm" value={dateRange.toDate} onChange={handleDateChange} />
                </div>
                <div className="col-md-3">
                    <label htmlFor="financialYearReport" className="form-label">Financial Year</label>
                    <select id="financialYearReport" name="financialYearReport" className="form-select form-select-sm" value={selectedFinancialYear} onChange={handleFyChange}>
                        <option value="2023-2024">2023-2024</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2025-2026">2025-2026</option>
                    </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                    <button className="btn btn-sm btn-outline-primary w-100" onClick={() => alert(`Filters set: ${dateRange.fromDate} to ${dateRange.toDate}, FY: ${selectedFinancialYear}. Apply these to individual reports.`)}>
                        Set Date Range (Informational)
                    </button>
                </div>
            </div>
            <small className="form-text text-muted mt-2">
                Set a common date range here. Individual reports might have more specific filters.
                The links below will navigate to the respective report pages. Date range parameters will be passed via URL for some reports if they support it directly.
            </small>
        </div>
      </div>


      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">Standard Financial Reports</h5>
            </div>
            <div className="list-group list-group-flush">
              {financialReports.map(report => <ReportItem key={report.title} {...report} />)}
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-light">
              <h5 className="mb-0">School Specific & Management Reports</h5>
            </div>
            <div className="list-group list-group-flush">
              {schoolSpecificReports.map(report => <ReportItem key={report.title} {...report} />)}
               <div className="list-group-item">
                <p className="text-muted small fst-italic mt-2">More reports can be added here based on school requirements (e.g., Budget vs Actual, Departmental Expenses, etc.)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ReportsDashboard;