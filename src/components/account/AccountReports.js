import React, { useEffect, useState } from "react";
import renderBalanceSheet from "./accountRenderFunctions/renderBalanceSheet";
import ReportDashboard from "./accountRenderFunctions/ReportDashboard";
import apiService from "../../services/api.service";
import { jwtDecode } from "jwt-decode";

const AccountReports = () => {
  const [activeReport, setActiveReport] = useState("balance-sheet");
  const [dateRange, setDateRange] = useState({
    from: "2024-01-01",
    to: "2025-12-31",
  });
  const [profitnlossDiff, setProfitnLossDiff] = useState(0)
  const udise = jwtDecode(sessionStorage.getItem("token"))?.udiseNo;
  const [assteData, setAssetData] = useState([]);
  const [liabilityData, setLiabilityData] = useState([]);
  const [profitnLossData, setProfitnLossData] = useState({
    expense:[],
    income:[]
  });
  const [isConsolidated, setIsConsolidated] = useState(false);
  const [sampleLedgerData, setSampleLedgerData] = useState([]);
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [subhead, setSubhead] = useState([]);
  const [ledgSubhead, setLedgSubhead] = useState("");
  const [companyName1, setCompanyName] = useState("");
  useEffect(() => {
    fetchInitiealData();
    fetchSubheadsData();
  }, [dateRange.to]);
  useEffect(() => {
    if (activeReport === "ledger") {
      setIsDropdownActive(true);
    } else {
      setIsDropdownActive(false);
    }
  }, [activeReport]);

  const fetchSubheadsData = async () => {
    const response = await apiService.getdata(
      `subheadmaster/getbyudise/${udise}`
    );
    setSubhead(response.data);
    if (response.data.length > 0) {
      setCompanyName(response.data[0]?.schoolUdise?.schoolName);
    }
  };
  console.log(companyName1);

  const fetchInitiealData = async () => {
    const asset = await apiService.getdata(
      `generalledger/getvalue/Asset/shop/${udise}/date/${dateRange.to}`
    );

    const liabilities = await apiService.getdata(
      `generalledger/getvalue/Liabilities/shop/${udise}/date/${dateRange.to}`
    );
    console.log(liabilities.data);
    const profitnloss = await apiService.getdata(
      `generalledger/getvalue/Profit%20And%20Loss/shop/${udise}/date/${dateRange.to}`
    );
    console.log(profitnloss.data);
    const formattedAsset = convertToDisplayFormat(asset.data, "Assets");
    const formattedLiability = convertToDisplayFormat(
      liabilities.data,
      "Liabilities"
    );
    const expense = convertToDisplayFormat(
      extractPLHeads(profitnloss.data, "expense"),
      "ProfitnLoss"
    );
    const income = convertToDisplayFormat(
      extractPLHeads(profitnloss.data, "income"),
      "ProfitnLoss"
    );
    setAssetData(formattedAsset);
    setLiabilityData(formattedLiability);
    setProfitnLossData({
      expense:expense,
      income:income
    });
    setProfitnLossDiff(calculateTotal(income)-calculateTotal(expense))
  };

  const calculateTotal = (items) => {
    if (!items || items.length === 0) return 0;
    let base=0;
    items.map((item) => {
      base += parseFloat(item.amount) || 0;
    });
    return base;
  };
  console.log(profitnlossDiff);

  const handleSubheadChange = async (e) => {
    const ledger = await apiService.getdata(`generalledger/balances/${e}`);
    setSampleLedgerData(ledger.data);
    ledger.data.map((item) => {
      setLedgSubhead(item.subhead?.subheadName || "No data found");
    });
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

      if (subItems.length > 0 && total !== 0) {
        result.push({
          name: categoryName,
          amount: total,
          subItems,
        });
      }
    }

    return result;
  };

  const extractPLHeads = (rawData, type) => {
    const headMap = {
      expense: [
        "Direct Expenses",
        "Indirect Expenses",
        "Expenses (Direct)",
        "Expenses (Indirect)",
        "Purchase Accounts",
      ],
      income: [
        "Direct Incomes",
        "Indirect Incomes",
        "Income (Direct)",
        "Income (Indirect)",
        "Sales Accounts",
        "Retained Earnings",
      ],
    };

    const selectedHeads = headMap[type.toLowerCase()] || [];
    const result = {};

    for (const head of selectedHeads) {
      if (rawData[head] && Object.keys(rawData[head]).length > 0) {
        result[head] = rawData[head];
      }
    }

    return result;
  };

  const renderActiveReport = () => {
    switch (activeReport) {
      case "balance-sheet":
        return (
          <ReportDashboard
            reportType="balance-sheet"
            liabilities={liabilityData}
            assets={assteData}
            asAtDate={dateRange.to}
            companyName={companyName1}
            firstHead="Assets"
            secondHead="Liabilities"
            isConsolidated={isConsolidated}
          />
        );

      case "profit-loss":
        return (
          <ReportDashboard
            reportType="profit-loss"
            asAtDate={dateRange.to}
            companyName={companyName1}
            liabilities={profitnLossData.expense}
            assets={profitnLossData.income}
            firstHead="Income"
            secondHead="Expenses"
            isConsolidated={isConsolidated}
          />
        );

      case "trial-balance":
        return (
          <ReportDashboard
            reportType="trial-balance"
            debitData={assteData}
            creditData={liabilityData}
            asAtDate={dateRange.to}
            companyName={companyName1}
            firstHead="Debit"
            secondHead="Credit"
            isConsolidated={isConsolidated}
          />
        );

      case "ledger":
        return (
          <ReportDashboard
            reportType="ledger"
            ledgerData={sampleLedgerData} // Pass your ledger data here
            ledgerSubhead={ledgSubhead} // Name of the ledger account
            isConsolidated={isConsolidated}
            dateRange={dateRange}
            asAtDate={dateRange.to}
            companyName={companyName1}
          />
        );

      default:
        return <ReportDashboard reportType="balance-sheet" />;
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

        {isDropdownActive && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="row align-items-center gy-3">
                    <div className="col-md-4">
                      <label htmlFor="paidToId" className="form-label">
                        खाते
                      </label>
                      <select
                        id="paidToId"
                        name="paidToId"
                        className={`form-select `}
                        // value={formData.paidToId || ""}
                        onChange={(e) => {
                          handleSubheadChange(e.target.value);
                        }}
                      >
                        <option value="">खाते निवडा</option>
                        {subhead.map((p) => (
                          <option key={p.subheadId} value={p.subheadId || ""}>
                            {p.subheadName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
