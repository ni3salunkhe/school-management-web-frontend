import React, { useState } from "react";

const ReportDashboard = ({
  companyName = "Pulses Technology",
  asAtDate = "31-Mar-2026",
  reportType = "balance-sheet", // New prop to determine report type
  liabilities = [],
  assets = [],
  debitData = [], // For trial balance
  creditData = [], // For trial balance
  totalAmount = 0,
  firstHead = "",
  secondHead = "",
  isConsolidated={isConsolidated},
  dateRange = null, // For P&L and Trial Balance
}) => {
  const calculateTotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => {
      const base = parseFloat(item.amount) || 0;
      const subTotal =
        item.subItems?.reduce(
          (sum, sub) => sum + (parseFloat(sub.amount) || 0),
          0
        ) || 0;
      return total + base + subTotal;
    }, 0);
  };

  const getReportTitle = () => {
    switch (reportType) {
      case "balance-sheet":
        return "Balance Sheet";
      case "trial-balance":
        return "Trial Balance";
      case "profit-loss":
        return "Profit & Loss Statement";
      case "ledger":
        return "General Ledger";
      default:
        return "Financial Report";
    }
  };

  const getDateLabel = () => {
    switch (reportType) {
      case "balance-sheet":
        return `as at ${asAtDate}`;
      case "trial-balance":
        return dateRange ? `From ${dateRange.from} to ${dateRange.to}` : `as at ${asAtDate}`;
      case "profit-loss":
        return dateRange ? `For the period ${dateRange.from} to ${dateRange.to}` : `as at ${asAtDate}`;
      default:
        return `as at ${asAtDate}`;
    }
  };

  // Determine which data to use based on report type
  const leftData = reportType === "trial-balance" ? debitData : (reportType === "balance-sheet" ? liabilities : liabilities);
  const rightData = reportType === "trial-balance" ? creditData : assets;

  const leftTotal = calculateTotal(leftData);
  const rightTotal = calculateTotal(rightData);
  const finalTotal = totalAmount || Math.max(leftTotal, rightTotal);

  const formatAmount = (amount) => {
    if (!amount || amount === 0) return "";
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const renderItems = (items, consolidated = false) => {
    if (!items || items.length === 0) {
      return (
        <div className="p-3 text-center opacity-75">
          <small>No data available</small>
        </div>
      );
    }

    return items.map((item, index) => {
      const totalAmount = consolidated
        ? (parseFloat(item.amount) || 0) +
          (item.subItems?.reduce(
            (sum, sub) => sum + (parseFloat(sub.amount) || 0),
            0
          ) || 0)
        : parseFloat(item.amount) || 0;

      return (
        <div key={index} className="print-item">
          <div className="d-flex justify-content-between align-items-center py-1 px-3 border-bottom border-light border-opacity-25">
            <span className="fw-medium text-dark">
              {item.accountCode && reportType === "trial-balance" ? `${item.accountCode} - ${item.name}` : item.name}
            </span>
            <span className="text-end font-monospace" style={{ minWidth: "120px" }}>
              {formatAmount(item.amount)}
            </span>
          </div>
          {!consolidated &&
            item.subItems?.map((subItem, subIndex) => (
              <div
                key={subIndex}
                className="d-flex justify-content-between align-items-center py-1 px-4 ps-5 border-bottom border-light border-opacity-10"
              >
                <span className="text-dark opacity-75 small">
                  {subItem.accountCode && reportType === "trial-balance" ? `${subItem.accountCode} - ${subItem.name}` : subItem.name}
                </span>
                <span className="text-end small font-monospace" style={{ minWidth: "120px" }}>
                  {formatAmount(subItem.amount)}
                </span>
              </div>
            ))}
        </div>
      );
    });
  };

  // Enhanced Trial Balance rendering with consolidated and detailed support
  const renderTrialBalanceItems = (debitItems, creditItems, consolidated = false) => {
    const allAccounts = [];
    
    // Process debit items
    debitItems.forEach(item => {
      if (consolidated) {
        // Show consolidated view - parent account with total amount
        const totalAmount = (parseFloat(item.amount) || 0) +
          (item.subItems?.reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0) || 0);
        
        allAccounts.push({
          name: item.name,
          accountCode: item.accountCode,
          debit: item.amount,
          credit: 0,
          isParent: true
        });
      } else {
        // Show detailed view - parent account and sub-items separately
        allAccounts.push({
          name: item.name,
          accountCode: item.accountCode,
          debit: parseFloat(item.amount) || 0,
          credit: 0,
          isParent: true
        });
        
        // Add sub-items
        if (item.subItems && item.subItems.length > 0) {
          item.subItems.forEach(subItem => {
            allAccounts.push({
              name: subItem.name,
              accountCode: subItem.accountCode,
              debit: parseFloat(subItem.amount) || 0,
              credit: 0,
              isParent: false,
              isSubItem: true
            });
          });
        }
      }
    });
    
    // Process credit items
    creditItems.forEach(item => {
      if (consolidated) {
        // Show consolidated view
        const totalAmount = (parseFloat(item.amount) || 0) +
          (item.subItems?.reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0) || 0);
        
        // Check if account already exists in debit side
        const existingAccount = allAccounts.find(acc => acc.name === item.name);
        if (existingAccount) {
          existingAccount.credit = totalAmount;
        } else {
          allAccounts.push({
            name: item.name,
            accountCode: item.accountCode,
            debit: 0,
            credit: item.amount,
            isParent: true
          });
        }
      } else {
        // Show detailed view
        const existingAccount = allAccounts.find(acc => acc.name === item.name && acc.isParent);
        if (existingAccount) {
          existingAccount.credit = parseFloat(item.amount) || 0;
        } else {
          allAccounts.push({
            name: item.name,
            accountCode: item.accountCode,
            debit: 0,
            credit: parseFloat(item.amount) || 0,
            isParent: true
          });
        }
        
        // Add sub-items
        if (item.subItems && item.subItems.length > 0) {
          item.subItems.forEach(subItem => {
            const existingSubAccount = allAccounts.find(acc => acc.name === subItem.name && acc.isSubItem);
            if (existingSubAccount) {
              existingSubAccount.credit = parseFloat(subItem.amount) || 0;
            } else {
              allAccounts.push({
                name: subItem.name,
                accountCode: subItem.accountCode,
                debit: 0,
                credit: parseFloat(subItem.amount) || 0,
                isParent: false,
                isSubItem: true
              });
            }
          });
        }
      }
    });

    return allAccounts.map((account, index) => (
      <div 
        key={index} 
        className={`d-flex justify-content-between align-items-center py-1 border-bottom border-light border-opacity-25 ${
          account.isSubItem ? 'px-4 ps-5' : 'px-3'
        }`}
      >
        <span 
          className={`text-dark ${account.isSubItem ? 'opacity-75 small' : 'fw-medium'}`} 
          style={{ flex: "1" }}
        >
          {account.accountCode ? `${account.accountCode} - ${account.name}` : account.name}
        </span>
        <span 
          className={`text-end font-monospace ${account.isSubItem ? 'small' : ''}`} 
          style={{ minWidth: "120px" }}
        >
          {formatAmount(account.debit)}
        </span>
        <span 
          className={`text-end font-monospace ${account.isSubItem ? 'small' : ''}`} 
          style={{ minWidth: "120px" }}
        >
          {formatAmount(account.credit)}
        </span>
      </div>
    ));
  };

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              margin: 5mm 5mm;
            }

            body {
              margin: 0;
              padding: 0;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            body * {
              visibility: hidden;
            }

            .printable-area, .printable-area * {
              visibility: visible;
            }

            .printable-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: white;
            }

            .report-container {
              background-color: #4a9b4a;
              color: white;
              page-break-after: avoid;
              page-break-inside: avoid;
            }

            .no-print {
              display: none !important;
            }

            .card-header {
              background: #3d8b3d;
              padding: 8px;
            }

            .print-section-header {
              background: rgb(200, 207, 200);
              padding: 4px;
              color: #333;
            }

            .card-footer {
              background: #1a4a1a;
              position: relative;
              bottom: auto;
            }

            .row {
              display: flex;
              width: 100%;
              margin: 0;
            }

            .col-md-6 {
              flex: 1;
              width: 50%;
              padding: 0;
            }

            .col-12 {
              width: 100%;
              padding: 0;
            }

            .card-body {
              padding: 0;
              margin: 0;
            }

            h4 {
              font-size: 18pt;
              margin: 4px 0;
            }

            h5 {
              font-size: 14pt;
              margin: 2px 0;
            }

            small {
              font-size: 10pt;
            }

            .small {
              font-size: 9pt;
            }

            .font-monospace {
              font-family: 'Courier New', monospace;
            }
          }
        `}
      </style>

      <div className="container-fluid p-0 printable-area">
        <div className="row justify-content-center m-0">
          <div className="col-12 p-0" style={{ width: "210mm" }}>
            <div className="card border-0 report-container">
              {/* Header */}
              <div className="card-header text-center border-0">
                <h4 className="mb-1 fw-bold">
                  {getReportTitle()}
                  {reportType === "trial-balance" && (
                    <small className="ms-2 opacity-75">
                      ({isConsolidated ? "Consolidated" : "Detailed"})
                    </small>
                  )}
                </h4>
                <h5 className="mb-1">{companyName}</h5>
                <small className="opacity-75">{getDateLabel()}</small>
              </div>

              {/* Body */}
              <div className="card-body p-0 d-flex flex-column">
                {reportType === "trial-balance" ? (
                  // Trial Balance Layout - Single column with Debit/Credit
                  <div className="w-100">
                    <div className="d-flex justify-content-between align-items-center py-2 px-3 fw-bold border-bottom border-light border-opacity-25 print-section-header">
                      <span style={{ flex: "1" }}>Account Name</span>
                      <span className="text-center" style={{ minWidth: "120px" }}>Debit</span>
                      <span className="text-center" style={{ minWidth: "120px" }}>Credit</span>
                    </div>
                    <div className="print-content">
                      {renderTrialBalanceItems(debitData, creditData, isConsolidated)}
                    </div>
                  </div>
                ) : (
                  // Balance Sheet / P&L Layout - Two columns
                  <div className="row g-0 m-0 flex-grow-1">
                    <div className="col-md-6 border-end border-light border-opacity-25 d-flex flex-column">
                      <div className="text-center py-1 fw-bold border-bottom border-light border-opacity-25 print-section-header">
                        {secondHead}
                      </div>
                      <div className="print-content">
                        {renderItems(leftData, isConsolidated)}
                      </div>
                    </div>
                    <div className="col-md-6 d-flex flex-column">
                      <div className="text-center py-1 fw-bold border-bottom border-light border-opacity-25 print-section-header">
                        {firstHead}
                      </div>
                      <div className="print-content">
                        {renderItems(rightData, isConsolidated)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="card-footer text-center border-0">
                {reportType === "trial-balance" ? (
                  <div className="d-flex justify-content-between align-items-center px-3">
                    <span className="fw-bold" style={{ flex: "1" }}>Total:</span>
                    <span className="fw-bold font-monospace" style={{ minWidth: "120px" }}>
                      {formatAmount(leftTotal)}
                    </span>
                    <span className="fw-bold font-monospace" style={{ minWidth: "120px" }}>
                      {formatAmount(rightTotal)}
                    </span>
                  </div>
                ) : (
                  <div className="row m-0">
                    <div className="col-6 border-end border-light border-opacity-25">
                      <strong>Total: {formatAmount(finalTotal)}</strong>
                    </div>
                    <div className="col-6">
                      <strong>Total: {formatAmount(finalTotal)}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportDashboard;