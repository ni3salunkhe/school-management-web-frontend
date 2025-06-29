import React, { useEffect, useState } from "react";
import renderBalanceSheet from "./accountRenderFunctions/renderBalanceSheet";
import ReportDashboard from "./accountRenderFunctions/ReportDashboard";
import apiService from "../../services/api.service";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { setDate } from "date-fns";

const AccountReports = () => {

  const date = new Date();
  console.log(date);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();

  const formattedDate = `${year}-${month}-${day}`;

  const calculateDate = () => {
    if (date.getMonth() >= 3) {
      return `${year}-04-01`;
    }
    return `${year - 1}-04-01`;
  }

  const [activeReport, setActiveReport] = useState("balance-sheet");
  const [dateRange, setDateRange] = useState({
    from: "2024-01-01",
    to: formattedDate,
  });
  const [profitnlossDiff, setProfitnLossDiff] = useState(0);
  const udise = jwtDecode(sessionStorage.getItem("token"))?.udiseNo;
  const [assteData, setAssetData] = useState([]);
  const [liabilityData, setLiabilityData] = useState([]);
  const [profitnLossData, setProfitnLossData] = useState({
    expense: [],
    income: [],
  });
  const [isConsolidated, setIsConsolidated] = useState(false);
  const [sampleLedgerData, setSampleLedgerData] = useState([]);
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [subhead, setSubhead] = useState([]);
  const [ledgSubhead, setLedgSubhead] = useState("");
  const [companyName1, setCompanyName] = useState("");
  const [plDiff, setPlDiff] = useState(0);
  const [selectedSubhead, setSelectedSubhead] = useState("");

  useEffect(() => {
    fetchInitiealData();
    fetchSubheadsData();
  }, [dateRange.to]);
  useEffect(() => {
    if (activeReport === "ledger") {
      setDateRange(prev => ({ ...prev, from: calculateDate() }))
      setIsDropdownActive(true);
    } else {
      setDateRange(prev => ({ ...prev, from: "2024-01-01" }))
      setIsDropdownActive(false);
    }
  }, [activeReport]);

  useEffect(() => {
    const fetchLedgerData = async () => {
      if (activeReport === "ledger" && selectedSubhead) {
        try {
          const ledger = await apiService.getdata(
            `generalledger/balances/shop/${udise}/bydate/${dateRange.from}/${dateRange.to}/${selectedSubhead}`
          );
          setSampleLedgerData(ledger.data);
          if (ledger.data.length > 0) {
            setLedgSubhead(ledger.data[0].subhead?.subheadName || "No data found");
          }
        } catch (error) {
          console.error("Error fetching ledger data:", error);
        }
      }
    };

    fetchLedgerData();
  }, [dateRange.from, dateRange.to, selectedSubhead, activeReport]);

  function convertToHeadBasedFormat(data) {
    if (!Array.isArray(data)) return [];

    const result = {};

    data.forEach((entry) => {
      const headName = entry.headId.headName || "Unknown Head";
      const subheadName = entry.subHeadId.subheadName || "Unknown Subhead";
      const amount = Math.abs((entry.drAmt || 0) - (entry.crAmt || 0));

      if (!result[headName]) {
        result[headName] = {
          name: headName,
          amount: 0,
          subItems: [],
        };
      }

      // Check if subhead already exists
      const existingSubhead = result[headName].subItems.find(
        (item) => item.name === subheadName
      );

      if (existingSubhead) {
        existingSubhead.amount += amount;
        existingSubhead.subItems.push({ name: subheadName, amount });
      } else {
        result[headName].subItems.push({
          name: subheadName,
          amount,
          subItems: [{ name: subheadName, amount }],
        });
      }

      result[headName].amount += amount;
    });

    return Object.values(result);
  }

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
    const expense = convertToDisplayFormat(
      extractPLHeads(profitnloss.data, "expense"),
      "ProfitnLoss"
    );
    const income = convertToDisplayFormat(
      extractPLHeads(profitnloss.data, "income"),
      "ProfitnLoss"
    );
    const diff = calculateTotal(income) + calculateTotal(expense);
    setPlDiff(diff);
    const udpdatePl = async (diff) => {
      const plDiffNew = Math.abs(diff);
      let payload = {
        Cr_Amt: 0,
        Dr_Amt: 0,
      };
      if (diff > 0) {
        payload = {
          Cr_Amt: 0,
          Dr_Amt: plDiffNew,
        };
      } else if (diff < 0) {
        payload = {
          Cr_Amt: plDiffNew,
          Dr_Amt: 0,
        };
      }
      await apiService.put(
        `generalledger/profit-loss/Current%20Period/${udise}`,
        payload
      );
      const response = await apiService.getdata(
        `generalledger/get-profit-loss/Profit%20&%20Loss/${udise}`
      );
      console.log(convertToHeadBasedFormat(response.data));
      return convertToHeadBasedFormat(response.data);
    };
    const formattedData = await udpdatePl(diff);
    console.log(formattedData);

    const formattedAsset = convertToDisplayFormat(
      asset.data,
      "Assets",
      diff,
      formattedData
    );
    const formattedLiability = convertToDisplayFormat(
      liabilities.data,
      "Liabilities",
      diff,
      formattedData
    );

    if (diff > 0) {
      expense.push(...formattedData); // show loss in expense
    } else if (diff < 0) {
      income.push(...formattedData); // show profit in income
    }


    setAssetData(formattedAsset);
    setLiabilityData(formattedLiability);
    setProfitnLossData({
      expense: expense,
      income: income,
    });

    console.log(formattedAsset);
  };

  const calculateTotal = (items) => {
    if (!items || items.length === 0) return 0;
    let base = 0;
    items.map((item) => {
      base += parseFloat(item.amount) || 0;
    });
    return base;
  };
  console.log(profitnlossDiff);

  const handleSubheadChange = async (e) => {
    setSelectedSubhead(e);
    if (e) {
      const ledger = await apiService.getdata(`generalledger/balances/shop/${udise}/bydate/${dateRange.from}/${dateRange.to}/${e}`);
      setSampleLedgerData(ledger.data);
      ledger.data.map((item) => {
        setLedgSubhead(item.subhead?.subheadName || "No data found");
      });
    }

  };

  const convertToDisplayFormat = (rawData, mainHead, diff, formattedData) => {
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
        "Manual Head",
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
    console.log(diff);

    if (diff > 0 && mainHead === "Assets") {
      console.log(formattedData);

      result.push(...formattedData);
    } else if (diff < 0 && mainHead === "Liabilities") {
      console.log(formattedData);
      result.push(...formattedData);
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
              <div className="card-body bg-dark text-white text-center">
                <h1 className="display-4 fw-bold mb-2">
                  Financial Reports Dashboard
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body " style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                <div className="row align-items-center gy-4">

                  {/* Report Type Toggle Section */}
                  <div className="col-lg-6 col-12">
                    <div className="mb-2">
                      <h6 className="text-muted fw-semibold mb-0 small fw-bold text-uppercase tracking-wide" style={{ fontSize: '0.75rem' }}>
                        📊 Report Type
                      </h6>
                    </div>
                    <div className="btn-group w-100 d-block d-sm-flex shadow-sm rounded-3 overflow-hidden" role="group" style={{ height: 'fit-content' }}>
                      {[
                        { id: "balance-sheet", label: "Balance Sheet", icon: "📊" },
                        { id: "trial-balance", label: "Trial Balance", icon: "⚖️" },
                        { id: "profit-loss", label: "P&L Statement", icon: "📈" },
                        { id: "ledger", label: "Ledger", icon: "📚" },
                      ].map((item, index) => (
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
                            className={`btn ${activeReport === item.id
                              ? 'btn-primary text-white fw-semibold shadow-sm'
                              : 'btn-outline-primary hover-lift'
                              } mb-1 mb-sm-0 border-0 py-2 px-2 transition-all`}
                            htmlFor={item.id}
                            style={{
                              transition: 'all 0.3s ease',
                              fontSize: '0.8rem',
                              fontWeight: activeReport === item.id ? '600' : '500',
                              height: '38px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <span className="me-1">{item.icon}</span>
                            {item.label}
                          </label>
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Account Selector - Conditional */}
                    {isDropdownActive && (
                      <div className="mt-3">
                        <div className="bg-white rounded-3 p-3 shadow-sm border border-light" style={{ height: 'fit-content' }}>
                          <div className="mb-2">
                            <h6 className="text-muted fw-semibold mb-0 small text-uppercase tracking-wide" style={{ fontSize: '0.75rem' }}>
                              🏦 Account Selection
                            </h6>
                          </div>
                          <div className="row">
                            <div className="col-12">
                              <label htmlFor="paidToId" className="form-label fw-medium text-dark mb-1" style={{ fontSize: '0.8rem' }}>
                                <span className="me-1">📋</span>
                                खाते
                              </label>
                              <select
                                id="paidToId"
                                name="paidToId"
                                className="form-select border-0 shadow-sm rounded-3 py-2 px-2"
                                style={{
                                  backgroundColor: '#f8f9fa',
                                  fontSize: '0.8rem',
                                  transition: 'all 0.2s ease',
                                  cursor: 'pointer',
                                  height: '38px'
                                }}
                                onChange={(e) => {
                                  handleSubheadChange(e.target.value);
                                }}
                                onFocus={(e) => {
                                  e.target.style.backgroundColor = '#ffffff';
                                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(13, 110, 253, 0.15)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.backgroundColor = '#f8f9fa';
                                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                              >
                                <option value="" style={{ color: '#6c757d' }}>
                                  खाते निवडा
                                </option>
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
                    )}
                  </div>

                  {/* Filters Section */}
                  <div className="col-lg-6 col-12">
                    <div className="bg-white rounded-3 p-4 shadow-sm border border-light">
                      <div className="mb-2">
                        <h6 className="text-muted fw-bold mb-0 small text-uppercase tracking-wide" style={{ fontSize: '0.75rem' }}>
                          🗓️ Filters & Actions
                        </h6>
                      </div>

                      <div className="row align-items-end g-3">
                        {/* Date Range */}
                        <div className="col-12">
                          <div className="row g-3">
                            {isDropdownActive && (
                              <div className="col-6">
                                <label className="form-label small mb-2 text-muted fw-medium">
                                  <span className="me-1">📅</span>
                                  From Date
                                </label>
                                <input
                                  type="date"
                                  className="form-control border-0 shadow-sm rounded-3 py-2 px-3"
                                  style={{
                                    backgroundColor: '#f8f9fa',
                                    fontSize: '0.875rem',
                                    transition: 'all 0.2s ease'
                                  }}
                                  value={dateRange.from}
                                  onChange={(e) => {
                                    setDateRange({ ...dateRange, from: e.target.value })
                                  }}
                                  onFocus={(e) => {
                                    e.target.style.backgroundColor = '#ffffff';
                                    e.target.style.boxShadow = '0 0 0 0.2rem rgba(13, 110, 253, 0.15)';
                                  }}
                                  onBlur={(e) => {
                                    e.target.style.backgroundColor = '#f8f9fa';
                                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                  }}
                                />
                              </div>
                            )}
                            <div className={isDropdownActive ? "col-6" : "col-12"}>
                              <label className="form-label small mb-2 text-muted fw-medium">
                                <span className="me-1">📅</span>
                                To Date
                              </label>
                              <input
                                type="date"
                                className="form-control border-0 shadow-sm rounded-3 py-2 px-3"
                                style={{
                                  backgroundColor: '#f8f9fa',
                                  fontSize: '0.875rem',
                                  transition: 'all 0.2s ease'
                                }}
                                value={dateRange.to}
                                onChange={(e) => {
                                  if (e.target.value > dateRange.to) {
                                    Swal.fire({
                                      icon: 'warning',
                                      title: 'तपशील तपासा',
                                      text: 'उद्याची  तारीख स्वीकारली जाणार नाही. कृपया आज किंवा याआधीची तारीख निवडा.',
                                    });
                                    return;
                                  }
                                  setDateRange({ ...dateRange, to: e.target.value })
                                }}
                                onFocus={(e) => {
                                  e.target.style.backgroundColor = '#ffffff';
                                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(13, 110, 253, 0.15)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.backgroundColor = '#f8f9fa';
                                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Controls Row */}
                        <div className="col-12 mt-4">
                          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">

                            {/* Consolidated Toggle */}
                            <div className="form-check form-switch m-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="consolidatedToggle"
                                checked={isConsolidated}
                                onChange={() => setIsConsolidated(!isConsolidated)}
                              />
                              <label className="form-check-label" htmlFor="consolidatedToggle">
                                Consolidated
                              </label>
                            </div>

                            {/* Print Button */}
                            <button
                              onClick={() => window.print()}
                              className="btn btn-success shadow-sm rounded-3 px-4 py-3 fw-semibold hover-lift flex-shrink-0"
                              title="Print Report"
                              style={{
                                background: 'linear-gradient(45deg, #198754, #20c997)',
                                border: 'none',
                                fontSize: '0.9rem',
                                transition: 'all 0.3s ease',
                                minWidth: '120px'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(25, 135, 84, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                              }}
                            >
                              <span className="me-2">🖨️</span>
                              Print
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
  .tracking-wide {
    letter-spacing: 0.05em;
  }
  
  .hover-lift:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  }
  
  .transition-all {
    transition: all 0.3s ease !important;
  }
  
  .user-select-none {
    user-select: none;
  }
  
  .btn-outline-primary:hover {
    background: linear-gradient(45deg, #0d6efd, #6610f2) !important;
    border-color: transparent !important;
    color: white !important;
  }
  
  .form-control:focus, .form-select:focus {
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15) !important;
    border-color: #86b7fe !important;
  }
  
  .form-select option {
    padding: 8px 12px;
  }
  
  @media (max-width: 576px) {
    .d-flex.justify-content-between {
      flex-direction: column !important;
      gap: 1rem !important;
    }
    
    .form-check {
      align-self: stretch !important;
      text-align: center !important;
    }
  }
`}</style>



        {/* Report Content */}
        <div className="row">
          <div className="col-12">{renderActiveReport()}</div>
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
