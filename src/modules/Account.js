import React from "react";
import { Container } from "react-bootstrap";
import { Route, Routes, useMatch } from "react-router-dom";
import Dashboard from "../components/account/Dashboard";
import CashReceiptForm from "../components/account/CashReceiptForm";
import BankMasterForm from "../components/account/BankMasterForm";
import CustomerMasterForm from "../components/account/CustomerMasterForm";
import HeadMasterForm from "../components/account/HeadMasterForm";
import SubHeadMasterForm from "../components/account/SubHeadMasterForm";
import OpeningBalanceForm from "../components/account/OpeningBalanceForm";
import CashPaymentForm from "../components/account/CashPaymentForm";
import BankReceiptForm from "../components/account/BankReceiptForm";
import BankPaymentForm from "../components/account/BankPaymentForm";
import TransactionList from "../components/account/TransactionList";
import AccountTypeMasterForm from "../components/account/AccountTypeMasterForm";
import ContraMasterForm from "../components/account/ContraMasterForm";
import JournalForm from "../components/account/JournalForm";
import AccountReports from "../components/account/AccountReports";
import ExpenseForm from "../components/account/ExpenseForm";

function Account({ role }) {
  const renderRoutes = () => {
    switch (role) {
      case "CLERK":
        return (
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Masters */}
            <Route path="bank" element={<BankMasterForm />} />
            <Route path="customer" element={<CustomerMasterForm />} />
            <Route path="head" element={<HeadMasterForm />} />
            <Route path="subhead" element={<SubHeadMasterForm />} />
            <Route path="openingbalance" element={<OpeningBalanceForm />} />
            <Route path="accounttype" element={<AccountTypeMasterForm />} />
            <Route path="accountreports" element={<AccountReports />} />
            <Route
              path="dashboard/cash-receipt"
              element={<CashReceiptForm />}
            />
            <Route
              path="dashboard/cash-payment"
              element={<CashPaymentForm />}
            />
            <Route
              path="dashboard/bank-receipt"
              element={<BankReceiptForm />}
            />
            <Route
              path="dashboard/bank-payment"
              element={<BankPaymentForm />}
            />
            <Route
              path="dashboard/contra-payment"
              element={<ContraMasterForm />}
            />
            <Route path="dashboard/journal" element={<JournalForm />} />
            <Route path="dashboard/expense" element={<ExpenseForm />} />

            <Route
              path="transactionslist"
              element={
                <TransactionList
                  transactionType="cash-receipt"
                  title="Cash Receipts List"
                />
              }
            />
          </Routes>
        );

      default:
        return null;
    }
  };

  return <Container fluid> {renderRoutes()}</Container>;
}

export default Account;
