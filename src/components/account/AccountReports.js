import React, { useEffect, useState } from 'react';

const AccountReports = () => {
    const [activeReport, setActiveReport] = useState('balance-sheet');
    const [dateRange, setDateRange] = useState({ from: '2024-01-01', to: '2024-12-31' });


    useEffect(() => {

    })

    const fetchInitiealData= async() =>{
        
    }


    // Sample data for demonstration
    const balanceSheetData = {
        assets: {
            current: [
                { account: 'Cash and Bank', amount: 50000 },
                { account: 'Accounts Receivable', amount: 35000 },
                { account: 'Inventory', amount: 25000 },
                { account: 'Prepaid Expenses', amount: 5000 }
            ],
            fixed: [
                { account: 'Property, Plant & Equipment', amount: 200000 },
                { account: 'Less: Accumulated Depreciation', amount: -50000 },
                { account: 'Intangible Assets', amount: 15000 }
            ]
        },
        liabilities: {
            current: [
                { account: 'Accounts Payable', amount: 20000 },
                { account: 'Short-term Loans', amount: 15000 },
                { account: 'Accrued Expenses', amount: 8000 }
            ],
            longTerm: [
                { account: 'Long-term Debt', amount: 80000 },
                { account: 'Mortgage Payable', amount: 120000 }
            ]
        },
        equity: [
            { account: 'Share Capital', amount: 100000 },
            { account: 'Retained Earnings', amount: 32000 }
        ]
    };

    const trialBalanceData = [
        { account: 'Cash', debit: 50000, credit: 0 },
        { account: 'Accounts Receivable', debit: 35000, credit: 0 },
        { account: 'Inventory', debit: 25000, credit: 0 },
        { account: 'Accounts Payable', debit: 0, credit: 20000 },
        { account: 'Sales Revenue', debit: 0, credit: 150000 },
        { account: 'Cost of Goods Sold', debit: 90000, credit: 0 },
        { account: 'Operating Expenses', debit: 35000, credit: 0 },
        { account: 'Share Capital', debit: 0, credit: 100000 }
    ];

    const profitLossData = {
        revenue: [
            { account: 'Sales Revenue', amount: 150000 },
            { account: 'Service Revenue', amount: 25000 },
            { account: 'Other Income', amount: 5000 }
        ],
        expenses: [
            { account: 'Cost of Goods Sold', amount: 90000 },
            { account: 'Salaries & Wages', amount: 25000 },
            { account: 'Rent Expense', amount: 12000 },
            { account: 'Utilities', amount: 3000 },
            { account: 'Depreciation', amount: 8000 },
            { account: 'Other Expenses', amount: 7000 }
        ]
    };

    const ledgerData = [
        { date: '2024-01-15', particular: 'Opening Balance', debit: 45000, credit: 0, balance: 45000 },
        { date: '2024-02-10', particular: 'Cash Sale', debit: 15000, credit: 0, balance: 60000 },
        { date: '2024-02-20', particular: 'Supplier Payment', debit: 0, credit: 10000, balance: 50000 },
        { date: '2024-03-05', particular: 'Bank Transfer', debit: 25000, credit: 0, balance: 75000 },
        { date: '2024-03-15', particular: 'Office Rent', debit: 0, credit: 5000, balance: 70000 }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const calculateTotal = (items) => {
        return items.reduce((sum, item) => sum + item.amount, 0);
    };

    const renderBalanceSheet = () => (
        <div className="row">
            <div className="col-md-6">
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Assets</h5>
                    </div>
                    <div className="card-body">
                        <h6 className="text-primary">Current Assets</h6>
                        {balanceSheetData.assets.current.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between py-2 border-bottom">
                                <span className="small">{item.account}</span>
                                <span className="fw-bold small">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}
                        <div className="d-flex justify-content-between py-2 fw-bold text-primary">
                            <span className="small">Total Current Assets</span>
                            <span className="small">{formatCurrency(calculateTotal(balanceSheetData.assets.current))}</span>
                        </div>

                        <h6 className="text-primary mt-4">Fixed Assets</h6>
                        {balanceSheetData.assets.fixed.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between py-2 border-bottom">
                                <span className="small">{item.account}</span>
                                <span className="fw-bold small">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}
                        <div className="d-flex justify-content-between py-2 fw-bold text-primary">
                            <span className="small">Net Fixed Assets</span>
                            <span className="small">{formatCurrency(calculateTotal(balanceSheetData.assets.fixed))}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-6">
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">Liabilities & Equity</h5>
                    </div>
                    <div className="card-body">
                        <h6 className="text-success">Current Liabilities</h6>
                        {balanceSheetData.liabilities.current.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between py-2 border-bottom">
                                <span>{item.account}</span>
                                <span className="fw-bold">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}

                        <h6 className="text-success mt-4">Long-term Liabilities</h6>
                        {balanceSheetData.liabilities.longTerm.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between py-2 border-bottom">
                                <span>{item.account}</span>
                                <span className="fw-bold">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}

                        <h6 className="text-success mt-4">Equity</h6>
                        {balanceSheetData.equity.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between py-2 border-bottom">
                                <span>{item.account}</span>
                                <span className="fw-bold">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTrialBalance = () => (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white">
                <h5 className="mb-0">Trial Balance</h5>
            </div>
            <div className="card-body">
                <div style={{ overflowX: 'auto' }}>
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Account Name</th>
                                <th className="text-end">Debit</th>
                                <th className="text-end">Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trialBalanceData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.account}</td>
                                    <td className="text-end">{item.debit ? formatCurrency(item.debit) : '-'}</td>
                                    <td className="text-end">{item.credit ? formatCurrency(item.credit) : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="table-dark">
                            <tr>
                                <th>Total</th>
                                <th className="text-end">
                                    {formatCurrency(trialBalanceData.reduce((sum, item) => sum + item.debit, 0))}
                                </th>
                                <th className="text-end">
                                    {formatCurrency(trialBalanceData.reduce((sum, item) => sum + item.credit, 0))}
                                </th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderProfitLoss = () => (
        <div className="row">
            <div className="col-md-6">
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-success text-white">
                        <h5 className="mb-0">Revenue</h5>
                    </div>
                    <div className="card-body">
                        {profitLossData.revenue.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between py-2 border-bottom">
                                <span>{item.account}</span>
                                <span className="fw-bold text-success">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}
                        <div className="d-flex justify-content-between py-3 fw-bold text-success bg-light mt-3">
                            <span>Total Revenue</span>
                            <span>{formatCurrency(calculateTotal(profitLossData.revenue))}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-md-6">
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-danger text-white">
                        <h5 className="mb-0">Expenses</h5>
                    </div>
                    <div className="card-body">
                        {profitLossData.expenses.map((item, index) => (
                            <div key={index} className="d-flex justify-content-between py-2 border-bottom">
                                <span>{item.account}</span>
                                <span className="fw-bold text-danger">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}
                        <div className="d-flex justify-content-between py-3 fw-bold text-danger bg-light mt-3">
                            <span>Total Expenses</span>
                            <span>{formatCurrency(calculateTotal(profitLossData.expenses))}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-body bg-primary text-white text-center">
                        <h4>Net Profit</h4>
                        <h2 className="fw-bold">
                            {formatCurrency(calculateTotal(profitLossData.revenue) - calculateTotal(profitLossData.expenses))}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLedger = () => (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Cash Ledger</h5>
                <select className="form-select w-auto">
                    <option>Cash Account</option>
                    <option>Bank Account</option>
                    <option>Accounts Receivable</option>
                    <option>Accounts Payable</option>
                </select>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Particulars</th>
                                <th className="text-end">Debit</th>
                                <th className="text-end">Credit</th>
                                <th className="text-end">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledgerData.map((item, index) => (
                                <tr key={index}>
                                    <td>{new Date(item.date).toLocaleDateString('en-IN')}</td>
                                    <td>{item.particular}</td>
                                    <td className="text-end">{item.debit ? formatCurrency(item.debit) : '-'}</td>
                                    <td className="text-end">{item.credit ? formatCurrency(item.credit) : '-'}</td>
                                    <td className="text-end fw-bold">{formatCurrency(item.balance)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderActiveReport = () => {
        switch (activeReport) {
            case 'balance-sheet':
                return renderBalanceSheet();
            case 'trial-balance':
                return renderTrialBalance();
            case 'profit-loss':
                return renderProfitLoss();
            case 'ledger':
                return renderLedger();
            default:
                return renderBalanceSheet();
        }
    };

    return (
        <div className="min-vh-100" style={{ background: 'linear-gradient(135deg,rgb(190, 198, 236) 0%, #764ba2 100%)' }}>
            <div className="container  py-4">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-lg">
                            <div className="card-body bg-dark text-white text-center py-4">
                                <h1 className="display-4 fw-bold mb-2">Financial Reports Dashboard</h1>
                                <p className="lead mb-0">Comprehensive Financial Analysis & Reporting</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-lg-6 col-12 mb-3 mb-lg-0">
                                        <div className="btn-group btn-group w-100 d-block d-sm-flex" role="group">
                                            <input
                                                type="radio"
                                                className="btn-check"
                                                name="report"
                                                id="balance-sheet"
                                                checked={activeReport === 'balance-sheet'}
                                                onChange={() => setActiveReport('balance-sheet')}
                                            />
                                            <label className="btn btn-outline-primary mb-1 mb-sm-0" htmlFor="balance-sheet">
                                                Balance Sheet
                                            </label>

                                            <input
                                                type="radio"
                                                className="btn-check"
                                                name="report"
                                                id="trial-balance"
                                                checked={activeReport === 'trial-balance'}
                                                onChange={() => setActiveReport('trial-balance')}
                                            />
                                            <label className="btn btn-outline-primary mb-1 mb-sm-0" htmlFor="trial-balance">
                                                Trial Balance
                                            </label>

                                            <input
                                                type="radio"
                                                className="btn-check"
                                                name="report"
                                                id="profit-loss"
                                                checked={activeReport === 'profit-loss'}
                                                onChange={() => setActiveReport('profit-loss')}
                                            />
                                            <label className="btn btn-outline-primary mb-1 mb-sm-0" htmlFor="profit-loss">
                                                P&L Statement
                                            </label>

                                            <input
                                                type="radio"
                                                className="btn-check"
                                                name="report"
                                                id="ledger"
                                                checked={activeReport === 'ledger'}
                                                onChange={() => setActiveReport('ledger')}
                                            />
                                            <label className="btn btn-outline-primary" htmlFor="ledger">
                                                Ledger
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-12">
                                        <div className="row">
                                            <div className="col-sm-5 col-12 mb-2 mb-sm-0">
                                                <label className="form-label small">From Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={dateRange.from}
                                                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-sm-5 col-12 mb-2 mb-sm-0">
                                                <label className="form-label small">To Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={dateRange.to}
                                                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                                />
                                            </div>
                                            <div className="col-sm-2 col-12">
                                                <label className="form-label small d-none d-sm-block">&nbsp;</label>
                                                <button className="btn btn-success w-100">
                                                    <i className="bi bi-download me-1"></i>
                                                    <span className="d-sm-none">Export Report</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="row">
                    <div className="col-12">
                        {renderActiveReport()}
                    </div>
                </div>

                {/* Footer */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-2">
                                <small className="text-muted">
                                    Generated on {new Date().toLocaleDateString('en-IN')} |
                                    Financial Year: {dateRange.from} to {dateRange.to}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bootstrap CSS */}
            <link
                href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
                rel="stylesheet"
            />
            <link
                href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
                rel="stylesheet"
            />
        </div>
    );
};

export default AccountReports;