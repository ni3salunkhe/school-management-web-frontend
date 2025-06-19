import React, { useEffect, useState } from "react";
import renderBalanceSheet from "./accountRenderFunctions/renderBalanceSheet";
import ReportDashboard from "./accountRenderFunctions/ReportDashboard";
import apiService from "../../services/api.service";
import { jwtDecode } from "jwt-decode";

const AccountReports = () => {
  const [activeReport, setActiveReport] = useState("balance-sheet");
  const [dateRange, setDateRange] = useState({
    from: "2024-01-01",
    to: "2024-12-31",
  });
  const udise = jwtDecode(sessionStorage.getItem("token"))?.udiseNo;
  const [assteData, setAssetData] = useState([]);
  const [liabilityData, setLiabilityData] = useState([]);
  const [profitnLossData, setProfitnLossData] = useState([]);
  const [isConsolidated, setIsConsolidated] = useState(false);

  const sampleLiabilities = [
    {
      name: "Capital Account",
      amount: 0,
      subItems: [],
    },
    {
      name: "Loans (Liability)",
      amount: 32611.0,
      subItems: [
        { name: "Andhra Pratap Rao/Trustee", amount: 22611.0 },
        { name: "Student Fee Advance", amount: 10000.0 },
      ],
    },
    {
      name: "Current Liabilities",
      amount: 2409553.0,
      subItems: [
        { name: "Sundry Creditors", amount: 6800.0 },
        { name: "Provisions", amount: 2371753.0 },
        { name: "Salary Payable", amount: 30000.0 },
      ],
    },
    {
      name: "Branch / Divisions",
      amount: 154829.0,
      subItems: [{ name: "SCHOOL", amount: 154829.0 }],
    },
    {
      name: "Misc Expenses (ASSET)",
      amount: 1484136.34,
      subItems: [{ name: "Loss For Previous Year", amount: 1484136.34 }],
    },
    {
      name: "Net Profit",
      amount: 0,
      subItems: [
        { name: "Opening Balance", amount: 0 },
        { name: "Current Period", amount: 0 },
      ],
    },
  ];

  const sampleAssets = [
    {
      name: "Fixed Assets",
      amount: 697013.0,
      subItems: [
        { name: "CCTV", amount: 19051.0 },
        { name: "COMPUTER", amount: 2333.0 },
        { name: "DTP", amount: 5357.0 },
        { name: "ELECTRIC EQUIPMENTS", amount: 96332.0 },
        { name: "FURNITURE AND DEAD STOCK", amount: 547365.0 },
        { name: "LAB EQUIPMENT", amount: 24579.0 },
        { name: "LAPTOP", amount: 7996.0 },
        { name: "SOUND SPEAKER SYSTEM", amount: 6156.0 },
        { name: "SOFTWARE", amount: 13283.0 },
      ],
    },
    {
      name: "Current Assets",
      amount: 3384116.34,
      subItems: [
        { name: "Loans & Advances (Asset)", amount: 268153.0 },
        { name: "Sundry Debtors", amount: 3616172.0 },
        { name: "Cash-in-hand", amount: 1802.0 },
        { name: "Bank Accounts", amount: 236431.34 },
      ],
    },
  ];

  useEffect(() => {
    fetchInitiealData();
  }, []);

  const fetchInitiealData = async () => {
    const asset = await apiService.getdata(
      `generalledger/getvalue/Asset/shop/${udise}`
    );
    const liabilities = await apiService.getdata(
      `generalledger/getvalue/Liabilities/shop/${udise}`
    );
    const profitnloss = await apiService.getdata(
      `generalledger/getvalue/Profit%20And%20Loss/shop/${udise}`
    );
    console.log(asset.data);
    const formattedAsset = convertToDisplayFormat(asset.data, "Assets");
    const formattedLiability = convertToDisplayFormat(
      liabilities.data,
      "Liabilities"
    );
    const formattedProfitnloss = convertToDisplayFormat(
      profitnloss.data,
      "ProfitnLoss"
    );
    setAssetData(formattedAsset);
    setLiabilityData(formattedLiability);
    setProfitnLossData(formattedProfitnloss);
    console.log(asset.data);
  };

  const convertToDisplayFormat = (rawData, mainHead) => {
    const result = [];

    // Define head-specific priority orders
    const priorityOrders = {
      Assets: [
        "Cash In Hand",
        "Bank Accounts",
        "Sundry Debtors",
        "Loans & Advances (Asset)",
        "Deposits (Asset)",
        "Fixed Assets",
        "Investments",
        "Misc. Expenses (ASSET)",
        "Branch / Divisions",
      ],
      Liabilities: [
        "Capital Account",
        "Sundry Creditors",
        "Loans (Liability)",
        "Secured Loans",
        "Unsecured Loans",
        "Current Liabilities",
        "Provisions",
        "Reserves & Surplus",
        "Duties & Taxes",
        "Suspence A/C",
      ],
      ProfitnLoss: [
        "Income (Direct)",
        "Income (Indirect)",
        "Direct Incomes",
        "Indirect Incomes",
        "Expenses (Direct)",
        "Expenses (Indirect)",
        "Direct Expenses",
        "Indirect Expenses",
        "Purchase Accounts",
        "Sales Accounts",
        "Retained Earnings",
      ],
    };

    const priorityOrder = priorityOrders[mainHead] || [];

    // Sort keys: priority items first, then remaining alphabetically
    const sortedKeys = [
      ...priorityOrder,
      ...Object.keys(rawData)
        .filter((key) => !priorityOrder.includes(key))
        .sort(),
    ];

    for (const categoryName of sortedKeys) {
      const subItemsData = rawData[categoryName];
      if (!subItemsData) continue;

      const subItems = [];
      let total = 0;

      for (const subItemName in subItemsData) {
        const amount = subItemsData[subItemName];
        if (amount && amount !== 0) {
          subItems.push({ name: subItemName, amount });
          total += amount;
        }
      }

      if (subItems.length > 0 && total > 0) {
        result.push({
          name: categoryName,
          amount: total,
          subItems,
        });
      }
    }

    return result;
  };

  const convertPLToDisplayFormat = (rawData) => {
    const result = [];

    for (const categoryName in rawData) {
      const entries = rawData[categoryName];

      const subItems = [];
      let total = 0;

      for (const item of entries) {
        const { account, amount } = item;

        if (amount && amount !== 0) {
          subItems.push({ name: account, amount });
          total += amount;
        }
      }

      if (subItems.length > 0 && total > 0) {
        result.push({
          name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1), // Capitalize
          amount: total,
          subItems,
        });
      }
    }

    return result;
  };

  // Sample data for demonstration

  const trialBalanceData = [
    { account: "Cash", debit: 50000, credit: 0 },
    { account: "Accounts Receivable", debit: 35000, credit: 0 },
    { account: "Inventory", debit: 25000, credit: 0 },
    { account: "Accounts Payable", debit: 0, credit: 20000 },
    { account: "Sales Revenue", debit: 0, credit: 150000 },
    { account: "Cost of Goods Sold", debit: 90000, credit: 0 },
    { account: "Operating Expenses", debit: 35000, credit: 0 },
    { account: "Share Capital", debit: 0, credit: 100000 },
  ];

  const profitLossData = {
    revenue: [
      { account: "Sales Revenue", amount: 150000 },
      { account: "Service Revenue", amount: 25000 },
      { account: "Other Income", amount: 5000 },
    ],
    expenses: [
      { account: "Cost of Goods Sold", amount: 90000 },
      { account: "Salaries & Wages", amount: 25000 },
      { account: "Rent Expense", amount: 12000 },
      { account: "Utilities", amount: 3000 },
      { account: "Depreciation", amount: 8000 },
      { account: "Other Expenses", amount: 7000 },
    ],
  };

  const ledgerData = [
    {
      date: "2024-01-15",
      particular: "Opening Balance",
      debit: 45000,
      credit: 0,
      balance: 45000,
    },
    {
      date: "2024-02-10",
      particular: "Cash Sale",
      debit: 15000,
      credit: 0,
      balance: 60000,
    },
    {
      date: "2024-02-20",
      particular: "Supplier Payment",
      debit: 0,
      credit: 10000,
      balance: 50000,
    },
    {
      date: "2024-03-05",
      particular: "Bank Transfer",
      debit: 25000,
      credit: 0,
      balance: 75000,
    },
    {
      date: "2024-03-15",
      particular: "Office Rent",
      debit: 0,
      credit: 5000,
      balance: 70000,
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const renderTrialBalance = () => (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">Trial Balance</h5>
      </div>
      <div className="card-body">
        <div style={{ overflowX: "auto" }}>
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
                  <td className="text-end">
                    {item.debit ? formatCurrency(item.debit) : "-"}
                  </td>
                  <td className="text-end">
                    {item.credit ? formatCurrency(item.credit) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-dark">
              <tr>
                <th>Total</th>
                <th className="text-end">
                  {formatCurrency(
                    trialBalanceData.reduce((sum, item) => sum + item.debit, 0)
                  )}
                </th>
                <th className="text-end">
                  {formatCurrency(
                    trialBalanceData.reduce((sum, item) => sum + item.credit, 0)
                  )}
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
              <div
                key={index}
                className="d-flex justify-content-between py-2 border-bottom"
              >
                <span>{item.account}</span>
                <span className="fw-bold text-success">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
            <div className="d-flex justify-content-between py-3 fw-bold text-success bg-light mt-3">
              <span>Total Revenue</span>
              <span>
                {formatCurrency(calculateTotal(profitLossData.revenue))}
              </span>
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
              <div
                key={index}
                className="d-flex justify-content-between py-2 border-bottom"
              >
                <span>{item.account}</span>
                <span className="fw-bold text-danger">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
            <div className="d-flex justify-content-between py-3 fw-bold text-danger bg-light mt-3">
              <span>Total Expenses</span>
              <span>
                {formatCurrency(calculateTotal(profitLossData.expenses))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-body bg-primary text-white text-center">
            <h4>Net Profit</h4>
            <h2 className="fw-bold">
              {formatCurrency(
                calculateTotal(profitLossData.revenue) -
                  calculateTotal(profitLossData.expenses)
              )}
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
                  <td>{new Date(item.date).toLocaleDateString("en-IN")}</td>
                  <td>{item.particular}</td>
                  <td className="text-end">
                    {item.debit ? formatCurrency(item.debit) : "-"}
                  </td>
                  <td className="text-end">
                    {item.credit ? formatCurrency(item.credit) : "-"}
                  </td>
                  <td className="text-end fw-bold">
                    {formatCurrency(item.balance)}
                  </td>
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
      case "balance-sheet":
        return (
          <ReportDashboard
            reportType="balance-sheet"
            liabilities={liabilityData}
            assets={assteData}
            totalAmount={4081129.34}
            firstHead="Assets"
            secondHead="Liabilities"
            isConsolidated={isConsolidated}
          />
        );

      case "profit-loss":
        return (
          <ReportDashboard
            companyName="Pulses Technology"
            asAtDate="31-Mar-2026"
            liabilities={profitnLossData}
            assets={profitnLossData}
            totalAmount={4081129.34}
            firstHead={"Profit"}
            secondHead={"Loss"}
            isConsolidated={isConsolidated}
          />
        );
      case "trial-balance":
      return (
        <ReportDashboard
          reportType="trial-balance"
          debitData={assteData}
          creditData={liabilityData}
          firstHead="Debit"
          secondHead="Credit"
          isConsolidated={isConsolidated}
        />
      );
      case "ledger":
        return renderLedger();
      default:
        return renderBalanceSheet();
    }
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background:
          "linear-gradient(135deg,rgb(190, 198, 236) 0%, #764ba2 100%)",
      }}
    >
      <div className="container  py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg">
              <div className="card-body bg-dark text-white text-center py-4">
                <h1 className="display-4 fw-bold mb-2">
                  Financial Reports Dashboard
                </h1>
                <p className="lead mb-0">
                  Comprehensive Financial Analysis & Reporting
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="row align-items-center gy-3">
                  {/* Report Type Toggle */}
                  <div className="col-lg-6 col-12">
                    <div
                      className="btn-group w-100 d-block d-sm-flex"
                      role="group"
                    >
                      {[
                        { id: "balance-sheet", label: "Balance Sheet" },
                        { id: "trial-balance", label: "Trial Balance" },
                        { id: "profit-loss", label: "P&L Statement" },
                        { id: "ledger", label: "Ledger" },
                      ].map((item) => (
                        <React.Fragment key={item.id}>
                          <input
                            type="radio"
                            className="btn-check"
                            name="report"
                            id={item.id}
                            checked={activeReport === item.id}
                            onChange={() => setActiveReport(item.id)}
                          />
                          <label
                            className="btn btn-outline-primary mb-1 mb-sm-0"
                            htmlFor={item.id}
                          >
                            {item.label}
                          </label>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="col-lg-6 col-12">
                    <div className="row align-items-end g-2">
                      {/* <div className="col-sm-4 col-12">
                        <label className="form-label small mb-1">
                          From Date
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={dateRange.from}
                          onChange={(e) =>
                            setDateRange({ ...dateRange, from: e.target.value })
                          }
                        />
                      </div> */}
                      <div className="col-sm-4 col-12">
                        <label className="form-label small mb-1">To Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={dateRange.to}
                          onChange={(e) =>
                            setDateRange({ ...dateRange, to: e.target.value })
                          }
                        />
                      </div>

                      <div className="col-sm-4 col-12 d-flex align-items-center justify-content-between gap-5">
                        <div className="form-check m-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="consolidatedToggle"
                            checked={isConsolidated}
                            // onChange={handleToggle}
                            onChange={() => setIsConsolidated(!isConsolidated)}
                          />
                          <label
                            className="form-check-label large"
                            htmlFor="consolidatedToggle"
                          >
                            Consolidated
                          </label>
                        </div>

                        <button
                          onClick={() => window.print()}
                          className="btn btn-success shadow"
                          title="Print"
                        >
                          🖨️ Print
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
          <div className="col-12">{renderActiveReport()}</div>
        </div>

        {/* Footer */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-2">
                <small className="text-muted">
                  Generated on {new Date().toLocaleDateString("en-IN")} |
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
