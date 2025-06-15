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

    export default renderBalanceSheet