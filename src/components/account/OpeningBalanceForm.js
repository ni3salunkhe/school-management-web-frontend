// src/components/account/Masters/OpeningBalanceForm.js
import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, DollarSign } from 'lucide-react';
// import { getSubHeadMasters, getOpeningBalances, saveOpeningBalances } from '../../../services/accountApi';
// import { getFinancialYears } from '../../../utils/financialYear'; // Helper to get FY list
import { Link } from 'react-router-dom';


const initialEntry = { accountId: '', accountName: '', debit: '', credit: '', balanceType: 'Debit' };

const OpeningBalanceForm = () => {
  const [financialYear, setFinancialYear] = useState('2024-2025'); // Default or fetched current FY
  const [entries, setEntries] = useState([{ ...initialEntry, tempId: Date.now() }]);
  const [allAccounts, setAllAccounts] = useState([]); // All SubHeadMasters for dropdown
  const [financialYearsList, setFinancialYearsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // const years = getFinancialYears(); // e.g., ["2023-2024", "2024-2025", "2025-2026"]
    // set// src/components/account/Masters/OpeningBalanceForm.js (Continued)
    // setFinancialYearsList(years);
    // if (years.length > 0 && !financialYear) {
    //     setFinancialYear(years.find(y => y.includes(new Date().getFullYear())) || years[0]); // Default to current FY
    // }
    // --- MOCK DATA for Financial Years ---
     const currentYear = new Date().getFullYear();
     const mockYears = [
        `${currentYear - 1}-${currentYear}`,
        `${currentYear}-${currentYear + 1}`,
        `${currentYear + 1}-${currentYear + 2}`,
     ];
     setFinancialYearsList(mockYears);
     if (!financialYear) setFinancialYear(mockYears[1]); // Default
    // --- END MOCK DATA ---

    fetchAccounts();
  }, []); // Removed financialYear from dependency to avoid re-fetching accounts on FY change initially

  useEffect(() => {
    if (financialYear && allAccounts.length > 0) {
      fetchOpeningBalancesForYear(financialYear);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialYear, allAccounts.length]); // Fetch OB when FY changes or accounts are loaded

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // const accountsData = await getSubHeadMasters({ status: 'Active', type: 'BalanceSheet' }); // Fetch only Balance Sheet accounts
      // --- MOCK DATA ---
      const accountsData = [
        { id: 'SH001', subHeadName: 'Cash In Hand', isBalanceSheetItem: true, defaultBalanceType: 'Debit' },
        { id: 'SH002', subHeadName: 'SBI Bank A/C - 1234', isBalanceSheetItem: true, defaultBalanceType: 'Debit' },
        { id: 'SH003', subHeadName: 'Tuition Fees Receivable', isBalanceSheetItem: true, defaultBalanceType: 'Debit' }, // Example Asset
        { id: 'SH005', subHeadName: 'Creditors for Goods', isBalanceSheetItem: true, defaultBalanceType: 'Credit' }, // Example Liability
        { id: 'SH006', subHeadName: 'Computer Equipment', isBalanceSheetItem: true, defaultBalanceType: 'Debit' },
        { id: 'CAP001', subHeadName: 'Owner\'s Capital', isBalanceSheetItem: true, defaultBalanceType: 'Credit' }, // Example Capital
        { id: 'INC001', subHeadName: 'Tuition Fees Income (P&L)', isBalanceSheetItem: false }, // Should not appear for OB
      ];
      // Filter for Balance Sheet items only for Opening Balances
      setAllAccounts(accountsData.filter(acc => acc.isBalanceSheetItem) || []);
      // --- END MOCK DATA ---
    } catch (err) {
      setError(`Failed to fetch accounts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpeningBalancesForYear = async (fy) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // const obData = await getOpeningBalances(fy);
      // --- MOCK DATA ---
      let obData = [];
      if (fy === "2024-2025") { // Example existing data for a specific year
          obData = [
            { accountId: 'SH001', accountName: 'Cash In Hand', amount: 50000, balanceType: 'Debit' },
            { accountId: 'SH002', accountName: 'SBI Bank A/C - 1234', amount: 250000, balanceType: 'Debit' },
            { accountId: 'SH005', accountName: 'Creditors for Goods', amount: 75000, balanceType: 'Credit' },
            { accountId: 'CAP001', accountName: 'Owner\'s Capital', amount: 225000, balanceType: 'Credit' }, // (50+250) - 75
          ];
      }
      // --- END MOCK DATA ---

      if (obData && obData.length > 0) {
        const formattedEntries = obData.map(ob => ({
          tempId: Date.now() + Math.random(),
          accountId: ob.accountId,
          accountName: allAccounts.find(acc => acc.id === ob.accountId)?.subHeadName || ob.accountName || 'Unknown Account',
          debit: ob.balanceType === 'Debit' ? ob.amount : '',
          credit: ob.balanceType === 'Credit' ? ob.amount : '',
          balanceType: ob.balanceType,
        }));
        setEntries(formattedEntries);
      } else {
        setEntries([{ ...initialEntry, tempId: Date.now() }]); // Start with one blank row if no data
      }
    } catch (err) {
      setError(`Failed to fetch opening balances for ${fy}: ${err.message}`);
      setEntries([{ ...initialEntry, tempId: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };


  const handleEntryChange = (tempId, field, value) => {
    setEntries(entries.map(entry => {
      if (entry.tempId === tempId) {
        let updatedEntry = { ...entry, [field]: value };
        if (field === 'accountId') {
          const selectedAccount = allAccounts.find(acc => acc.id === value);
          updatedEntry.accountName = selectedAccount ? selectedAccount.subHeadName : '';
          // Auto-set balanceType based on typical nature of account, but allow override
          updatedEntry.balanceType = selectedAccount?.defaultBalanceType || 'Debit';
          if (updatedEntry.balanceType === 'Debit' && updatedEntry.credit) {
              updatedEntry.debit = updatedEntry.credit;
              updatedEntry.credit = '';
          } else if (updatedEntry.balanceType === 'Credit' && updatedEntry.debit) {
              updatedEntry.credit = updatedEntry.debit;
              updatedEntry.debit = '';
          }
        }
        // Ensure only one of debit/credit has a value
        if (field === 'debit' && value) updatedEntry.credit = '';
        if (field === 'credit' && value) updatedEntry.debit = '';

        // If balanceType changes, move value if necessary
        if (field === 'balanceType') {
            const amount = updatedEntry.debit || updatedEntry.credit;
            if (value === 'Debit') {
                updatedEntry.debit = amount;
                updatedEntry.credit = '';
            } else { // Credit
                updatedEntry.credit = amount;
                updatedEntry.debit = '';
            }
        }
        return updatedEntry;
      }
      return entry;
    }));
    setError(null);
    setSuccess(null);
  };

  const addNewEntry = () => {
    if (entries.length > 0 && !entries[entries.length -1].accountId) {
        setError("Please select an account for the last entry before adding a new one.");
        return;
    }
    setEntries([...entries, { ...initialEntry, tempId: Date.now() + Math.random() }]);
  };

  const removeEntry = (tempId) => {
    if (entries.length === 1) {
        setError("Cannot remove the last entry. Clear it instead.");
        return;
    }
    setEntries(entries.filter(entry => entry.tempId !== tempId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validEntries = entries.filter(e => e.accountId && (e.debit || e.credit))
                                .map(e => ({
                                  accountId: e.accountId,
                                  amount: parseFloat(e.debit || e.credit),
                                  balanceType: (e.debit && !e.credit) ? 'Debit' : 'Credit'
                                }));

    if (validEntries.length === 0) {
      setError("Please add at least one valid opening balance entry.");
      return;
    }

    const totalDebit = validEntries.reduce((sum, entry) => sum + (entry.balanceType === 'Debit' ? entry.amount : 0), 0);
    const totalCredit = validEntries.reduce((sum, entry) => sum + (entry.balanceType === 'Credit' ? entry.amount : 0), 0);

    if (totalDebit !== totalCredit) {
      setError(`Totals do not match! Debit: ₹${totalDebit.toLocaleString('en-IN')}, Credit: ₹${totalCredit.toLocaleString('en-IN')}. Difference: ₹${Math.abs(totalDebit-totalCredit).toLocaleString('en-IN')}`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        financialYear: financialYear,
        balances: validEntries
      };
      // await saveOpeningBalances(payload);
      console.log('Saving Opening Balances (Mock):', payload);
      setSuccess(`Opening Balances for ${financialYear} saved successfully!`);
      // Optionally, refetch after save if backend modifies data (e.g. adds IDs)
      // fetchOpeningBalancesForYear(financialYear);
    } catch (err) {
      setError(`Failed to save opening balances: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    setEntries([{...initialEntry, tempId: Date.now()}]);
    setError(null);
    setSuccess(null);
  }

  const calculateTotal = (type) => {
    return entries.reduce((sum, entry) => {
      const amount = parseFloat(entry[type]) || 0;
      return sum + amount;
    }, 0);
  };

  const totalDebit = calculateTotal('debit');
  const totalCredit = calculateTotal('credit');
  const difference = totalDebit - totalCredit;


  return (
    <div className="container-fluid py-3">
      <div className="row mb-3">
        <div className="col-12">
          <h3>Opening Balance Entry</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account/dashboard">Masters</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Opening Balance</li>
            </ol>
          </nav>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0"><DollarSign size={20} className="me-2"/>Set Opening Balances</h5>
            <div>
              <label htmlFor="financialYearSelect" className="form-label visually-hidden">Financial Year:</label>
              <select
                id="financialYearSelect"
                className="form-select form-select-sm d-inline-block w-auto"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                disabled={loading || saving}
              >
                {financialYearsList.map(fy => <option key={fy} value={fy}>{fy}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="card-body">
          {loading ? <div className="text-center p-5"><div className="spinner-border"></div><p>Loading data for {financialYear}...</p></div> :
            (
            <form onSubmit={handleSubmit}>
                <div className="table-responsive">
                <table className="table table-bordered table-sm">
                    <thead className="table-light">
                    <tr>
                        <th style={{ width: '40%' }}>Account Name *</th>
                        <th style={{ width: '20%' }}>Debit Amount (₹)</th>
                        <th style={{ width: '20%' }}>Credit Amount (₹)</th>
                        {/* <th style={{ width: '15%' }}>Balance Type</th> */}
                        <th style={{ width: '5%' }}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {entries.map((entry, index) => (
                        <tr key={entry.tempId}>
                        <td>
                            <select
                            className="form-select form-select-sm"
                            value={entry.accountId}
                            onChange={(e) => handleEntryChange(entry.tempId, 'accountId', e.target.value)}
                            required
                            >
                            <option value="">Select Account</option>
                            {allAccounts
                                .filter(acc => acc.isBalanceSheetItem) // Ensure only B/S items are shown
                                .map(acc => (
                                <option key={acc.id} value={acc.id} disabled={entries.some(e => e.accountId === acc.id && e.tempId !== entry.tempId)}>
                                    {acc.subHeadName}
                                </option>
                            ))}
                            </select>
                        </td>
                        <td>
                            <input
                            type="number"
                            className="form-control form-control-sm text-end"
                            value={entry.debit}
                            onChange={(e) => handleEntryChange(entry.tempId, 'debit', e.target.value)}
                            placeholder="0.00" step="0.01"
                            disabled={!entry.accountId || entry.balanceType === 'Credit'}
                            />
                        </td>
                        <td>
                            <input
                            type="number"
                            className="form-control form-control-sm text-end"
                            value={entry.credit}
                            onChange={(e) => handleEntryChange(entry.tempId, 'credit', e.target.value)}
                            placeholder="0.00" step="0.01"
                            disabled={!entry.accountId || entry.balanceType === 'Debit'}
                            />
                        </td>
                        {/* Balance Type column can be complex to manage manually, usually derived
                        <td>
                            <select
                                className="form-select form-select-sm"
                                value={entry.balanceType}
                                onChange={(e) => handleEntryChange(entry.tempId, 'balanceType', e.target.value)}
                                disabled={!entry.accountId}
                            >
                                <option value="Debit">Debit</option>
                                <option value="Credit">Credit</option>
                            </select>
                        </td>
                        */}
                        <td>
                            <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeEntry(entry.tempId)}
                            disabled={entries.length === 1 && !entry.accountId}
                            title="Remove Row"
                            >
                            <Trash2 size={14} />
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot>
                        <tr className="table-light fw-bold">
                            <td className="text-end">Total</td>
                            <td className="text-end">₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="text-end">₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            {/* <td></td> */}
                            <td></td>
                        </tr>
                        {difference !== 0 && (
                             <tr className="table-warning fw-bold">
                                <td className="text-end">Difference</td>
                                <td colSpan="2" className={`text-end ${difference > 0 ? 'text-danger' : 'text-success'}`}>
                                     ₹{Math.abs(difference).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({difference > 0 ? 'Debit Excess' : 'Credit Excess'})
                                </td>
                                {/* <td></td> */}
                                <td></td>
                            </tr>
                        )}
                    </tfoot>
                </table>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        <button type="button" className="btn btn-outline-primary me-2" onClick={addNewEntry} disabled={saving}>
                            <Plus size={16} className="me-1" /> Add Row
                        </button>
                         <button type="button" className="btn btn-outline-secondary" onClick={handleClearAll} disabled={saving}>
                            Clear All Entries
                        </button>
                    </div>
                    <button type="submit" className="btn btn-success" disabled={saving || difference !== 0}>
                        <Save size={16} className="me-1" />
                        {saving ? 'Saving...' : 'Save Opening Balances'}
                    </button>
                </div>
            </form>
            )}
        </div>
        <div className="card-footer">
            <small className="text-muted">
                Opening balances are the financial starting point for the selected year. Ensure Debits equal Credits.
                These are typically carried forward from the previous year's closing balances. Only Balance Sheet accounts (Assets, Liabilities, Capital) have opening balances.
            </small>
        </div>
      </div>
    </div>
  );
};

export default OpeningBalanceForm;