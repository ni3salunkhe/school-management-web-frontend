// src/pages/Account.js (This is your 'Account.js')
import React from 'react';
import { Container } from 'react-bootstrap'; // You are using this
import { Route, Routes, useMatch } from 'react-router-dom'; // useMatch might be helpful

// Assuming components are in ../components/account/
import Dashboard from '../components/account/Dashboard';
import CashReceiptForm from '../components/account/CashReceiptForm';
// Import other components you'll add to the switch case
import BankMasterForm from '../components/account/BankMasterForm';
import CustomerMasterForm from '../components/account/CustomerMasterForm';
import HeadMasterForm from '../components/account/HeadMasterForm';
import SubHeadMasterForm from '../components/account/SubHeadMasterForm';
import OpeningBalanceForm from '../components/account/OpeningBalanceForm';
import CashPaymentForm from '../components/account/CashPaymentForm';
import BankReceiptForm from '../components/account/BankReceiptForm';
import BankPaymentForm from '../components/account/BankPaymentForm';
import TransactionList from '../components/account/TransactionList';
import AccountTypeMasterForm from '../components/account/AccountTypeMasterForm';
// import ReportsDashboard from '../components/account/Reports/ReportsDashboard'; // The overview page for reports
// import GeneralLedgerReport from '../components/account/Reports/GeneralLedgerReport';
// import DayBookReport from '../components/account/Reports/DayBookReport';


function Account({ role }) {
  // The `path` prop for <Routes> will be implicitly "/account/*"
  // because this AccountModulePage component is rendered under that path in App.js.
  // So, <Route path="dashboard" ...> will match "/account/dashboard".

  const renderRoutes = () => {
    // You can expand this switch case as you add more roles or refine access
    switch (role) {
      case 'CLERK':
        return (
          <Routes> {/* This Routes block handles sub-routes of /account/* */}
            {/* Default for /account is /account/dashboard */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Masters */}
            <Route path="bank" element={<BankMasterForm />} />
            <Route path="customer" element={<CustomerMasterForm />} />
            <Route path="head" element={<HeadMasterForm />} />
            <Route path="subhead" element={<SubHeadMasterForm />} />
            <Route path="openingbalance" element={<OpeningBalanceForm />} />
            <Route path="accounttype" element={<AccountTypeMasterForm />} />

            {/* Transactions - Entry Forms */}
            <Route path="dashboard/cash-receipt" element={<CashReceiptForm />} />
            <Route path="dashboard/cash-payment" element={<CashPaymentForm />} />
            <Route path="dashboard/bank-receipt" element={<BankReceiptForm />} />
            <Route path="dashboard/bank-payment" element={<BankPaymentForm />} />
            {/* Example for editing a specific transaction */}
            {/* <Route path="transactions/cash-receipt/:id/edit" element={<CashReceiptForm isEditMode={true} />} /> */}


            {/* Transactions - List Views */}
            <Route path="transactionslist" element={<TransactionList transactionType="cash-receipt" title="Cash Receipts List" />} />
            {/* <Route path="transactions/cash-payments" element={<TransactionList transactionType="cash-payment" title="Cash Payments List" />} /> */}
            {/* <Route path="transactions/bank-receipts" element={<TransactionList transactionType="bank-receipt" title="Bank Receipts List" />} />
            <Route path="transactions/bank-payments" element={<TransactionList transactionType="bank-payment" title="Bank Payments List" />} /> */}

            {/* Reports */}
            {/* <Route path="reports/dashboard" element={<ReportsDashboard />} />
            <Route path="reports/general-ledger" element={<GeneralLedgerReport />} />
            <Route path="reports/day-book" element={<DayBookReport />} /> */}
            {/* <Route path="reports/trial-balance" element={<TrialBalanceReport />} /> */}

            {/* Fallback for any unknown /account/... CLERK routes */}
            {/* <Route path="*" element={<div>Module Page Not Found within Clerk Access</div>} /> */}
          </Routes>
        );
      // case 'ACCOUNT_ADMIN':
      //   return (
      //     <Routes>
      //       {/* Admin might have access to all clerk routes + more */}
      //       <Route path="dashboard" element={<Dashboard />} />
      //       {/* ... more admin specific routes ... */}
      //       <Route path="*" element={<div>Admin Module Page Not Found</div>} />
      //     </Routes>
      //   );
      default:
        // This case should ideally not be hit if role checks are done before rendering AccountModulePage
        return null;
    }
  };

  return (
    // This Container is from your original code. It will wrap all content
    // rendered by the <Routes> above.
    <Container fluid> {/* Or just <Container> depending on your layout preference */}
      {renderRoutes()}
    </Container>
  );
}

export default Account;