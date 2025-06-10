import React, { useState, useEffect } from 'react';
import { Save, DollarSign, Pencil, Trash2, Group } from 'lucide-react';
import apiService from '../../services/api.service';
import { jwtDecode } from 'jwt-decode';

const OpeningBalanceForm = () => {
  const [financialYear, setFinancialYear] = useState('2024-2025');
  const [selectedHeadId, setSelectedHeadId] = useState('');
  const [subheadEntries, setSubheadEntries] = useState([]);
  const [allHeads, setAllHeads] = useState([]);
  const [allSubHeads, setAllSubHeads] = useState([]);
  const [financialYearsList, setFinancialYearsList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [creditAmount, setCreditAmount] = useState(1500.00);
  const [debitAmount, setDebitAmount] = useState(1200.00);
  const [filteredSubheads, setFilterdSubheads] = useState([])
  const isBalanced = creditAmount === debitAmount;
  const [balances, setBalances] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flag, setFlag] = useState(false)
  const udiseNo= jwtDecode(sessionStorage.getItem('token')).udiseNo
  useEffect(() => {
    fetchOpeningBalances();
  }, []);

  const fetchOpeningBalances = async () => {
    try {
      setLoading(true);
      const response = await apiService.getdata('openingbal/');
      setBalances(response.data || []);
    } catch (err) {
      setError(`Failed to fetch opening balances: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await apiService.deletedata(`openingbal/${id}`);
      fetchOpeningBalances();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
    console.log(selectedRows)
  };

  const selectedLedger = async () => {
    if (selectedRows.length === 0) {
      alert('No rows selected');
      return;
    }

    try {
      const selectedEntries = balances.filter((b) => selectedRows.includes(b.id));
      console.log(selectedEntries)
      const ledgerPayload = selectedEntries.map((entry) => ({
        entryType: 'Opening Balance',
        headid: entry.headId?.headId,
        subhead: entry.subHeadId?.subheadId,
        Dr_Amt: entry.drAmt,
        Cr_Amt: entry.crAmt,
        narr: 'Opening balance',
        udiseNo
        // date: `${entry.year.split('-')[0]}-04-01`, // assumes 1st April of start year
        // year: entry.year
      }));

      console.log(ledgerPayload)
      console.log("Submitting to General Ledger:", ledgerPayload);

      await apiService.postdata('generalledger/bulk', ledgerPayload);

      alert('Successfully added to General Ledger!');
      setSelectedRows([]); // Reset selection
    } catch (error) {
      console.error('Ledger submission failed:', error);
      alert(`Failed to submit to General Ledger: ${error.message}`);
    }
  };

  const deleteSelected = async () => {
    if (!window.confirm('Delete selected records?')) return;
    try {
      await Promise.all(selectedRows.map((id) => apiService.deletedata(`openingbal/${id}`)));
      setSelectedRows([]);
      fetchOpeningBalances();
    } catch (err) {
      alert('Batch delete failed: ' + err.message);
    }
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const mockYears = [
      `${currentYear - 1}-${currentYear}`,
      `${currentYear}-${currentYear + 1}`,
      `${currentYear + 1}-${currentYear + 2}`,
    ];
    setFinancialYearsList(mockYears);
    fetchAccounts();
    fetchSumofCrDr();
  }, []);

  useEffect(() => {
    if (financialYear && allSubHeads.length > 0) {
      fetchOpeningBalancesForYear(financialYear);
    }
  }, [financialYear, allSubHeads]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const subHeadsRes = await apiService.getdata('subheadmaster/');
      const headsRes = await apiService.getdata('headmaster/');

      const heads = headsRes.data;
      const subHeads = subHeadsRes.data;

      const headMap = heads.reduce((acc, h) => {
        acc[h.headId] = h.headName;
        return acc;
      }, {});

      const entries = subHeads.map((sh) => ({
        subHeadId: sh.subheadId,
        subHeadName: sh.subheadName,
        headId: sh.headId.headId,
        headName: headMap[sh.headId.headId],
        debit: '',
        credit: '',
      }));

      setAllHeads(heads);
      setAllSubHeads(entries);
      setSubheadEntries(entries);
    } catch (err) {
      setError(`Failed to fetch accounts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSumofCrDr = async () => {
    const response = await apiService.getdata(`openingbal/sum`).catch((e)=>console.log(e));
    setCreditAmount(response.data.totalCr)
    setDebitAmount(response.data.totalDr)
  }

  const fetchOpeningBalancesForYear = async (fy) => {
    setLoading(true);
    try {
      let obData = [];
      const response = await apiService.getdata(`openingbal/`);
      const existingSubHeadIds = (response.data || []).map(item => item.subHeadId.subheadId); // Get IDs from nested object

      const filteredData = allSubHeads.filter(h => !existingSubHeadIds.includes(h.subHeadId)); // Exclude existing ones
      console.log(response.data);

      setSubheadEntries(filteredData);



      if (fy === '2024-2025') {
        obData = [
          { headId: 5, subHeadId: 1, amount: 50000, balanceType: 'Debit' },
          { headId: 5, subHeadId: 2, amount: 10000, balanceType: 'Credit' },
        ];
      }

      const updatedEntries = filteredData.map((entry) => {
        const match = obData.find((ob) => ob.subHeadId === entry.subHeadId);
        return {
          ...entry,
          debit: match?.balanceType === 'Debit' ? match.amount : '',
          credit: match?.balanceType === 'Credit' ? match.amount : '',
        };
      });

      setSubheadEntries(updatedEntries);
    } catch (err) {
      setError(`Failed to load opening balances: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubheadChange = (subHeadId, field, value) => {
    setSubheadEntries((prev) =>
      prev.map((entry) =>
        entry.subHeadId === subHeadId
          ? {
            ...entry,
            [field]: value,
            ...(field === 'debit' ? { credit: '' } : {}),
            ...(field === 'credit' ? { debit: '' } : {}),
          }
          : entry
      )
    );
    setError(null);
    setSuccess(null);
  };

  const calculateTotal = (type) =>
    filteredEntries.reduce((sum, entry) => sum + (parseFloat(entry[type]) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validEntries = filteredEntries
      .filter((e) => e.debit || e.credit)
      .map((e) => ({
        headId: e.headId,
        subHeadId: e.subHeadId,
        amount: parseFloat(e.debit || e.credit),
        balanceType: e.debit ? 'Debit' : 'Credit',
      }));

    if (validEntries.length === 0) {
      setError('Enter at least one valid amount.');
      return;
    }

    const totalDebit = calculateTotal('debit');
    const totalCredit = calculateTotal('credit');

    // if (totalDebit !== totalCredit) {
    //   setError(`Mismatch: Debit ₹${totalDebit} ≠ Credit ₹${totalCredit}`);
    //   return;
    // }

    try {
      setSaving(true);
      const payload = { financialYear, balances: validEntries };
      console.log('Saving:', payload);
      await apiService.postdata('openingbal/bulk', payload);
      setTimeout(() => {
        setSuccess('Opening balances saved successfully!');
      }, 1000);
    } catch (err) {
      setError(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
      setSelectedHeadId('')
      fetchSumofCrDr()
      fetchOpeningBalances();

    }


  };
  if (flag === true) {
    console.log(selectedRows)
  }

  const filteredEntries = selectedHeadId
    ? subheadEntries.filter((entry) => entry.headId === parseInt(selectedHeadId))
    : [];

  const totalDebit = calculateTotal('debit');
  const totalCredit = calculateTotal('credit');
  const difference = creditAmount - debitAmount;

  return (
    <div className="container-fluid py-3">
      <h3>Opening Balance Entry</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="row justify-content-center py-2">
        <div className="col-md-8 col-lg-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Account Balance Summary</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-6">
                  <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                    <h6 className="text-success mb-2">Credit Amount</h6>
                    <h4 className="text-success fw-bold">₹{creditAmount.toFixed(2)}</h4>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-3 bg-danger bg-opacity-10 rounded">
                    <h6 className="text-danger mb-2">Debit Amount</h6>
                    <h4 className="text-danger fw-bold">₹{debitAmount.toFixed(2)}</h4>
                  </div>
                </div>
              </div>

              <div className="text-center">
                {isBalanced ? (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <strong>Balanced!</strong> Credit and Debit amounts are equal.
                  </div>
                ) : (
                  <div className="alert alert-warning" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Imbalance Detected!</strong>
                    <br />
                    Difference: ₹{difference.toFixed(2)}
                    <br />
                    {creditAmount > debitAmount ? 'Credit exceeds Debit' : 'Debit exceeds Credit'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card ">
        <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
          <div className="d-flex align-items-center gap-2">
            <DollarSign size={20} />
            <strong> Set Opening Balances</strong>
          </div>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              disabled={loading || saving}
            >
              {financialYearsList.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>

            <select
              className="form-select form-select-sm"
              value={selectedHeadId}
              onChange={(e) => setSelectedHeadId(e.target.value)}
              disabled={loading}
            >
              <option value="">Select Head</option>
              {allHeads.map((h) => (
                <option key={h.headId} value={h.headId}>
                  {h.headName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card-body">
          {selectedHeadId && (
            <form onSubmit={handleSubmit}>
              <div className="table-responsive">
                <table className="table table-bordered table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Subhead Name</th>
                      <th>Debit (₹)</th>
                      <th>Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.subHeadId}>
                        <td>{entry.subHeadName}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm text-end"
                            value={entry.debit}
                            onChange={(e) =>
                              handleSubheadChange(entry.subHeadId, 'debit', e.target.value)
                            }
                            step="0.01"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm text-end"
                            value={entry.credit}
                            onChange={(e) =>
                              handleSubheadChange(entry.subHeadId, 'credit', e.target.value)
                            }
                            step="0.01"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light fw-bold">
                    <tr>
                      <td className="text-end">Total</td>
                      <td className="text-end">₹{totalDebit.toFixed(2)}</td>
                      <td className="text-end">₹{totalCredit.toFixed(2)}</td>
                    </tr>
                    {difference !== 0 && (
                      <tr className="table-warning">
                        <td className="text-end">Difference</td>
                        <td colSpan="2" className="text-end text-danger">
                          ₹{Math.abs(difference).toFixed(2)} ({difference > 0 ? 'Debit Excess' : 'Credit Excess'})
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  className="btn btn-success"
                // disabled={saving || difference !== 0}
                >
                  <Save size={16} className="me-1" />
                  {saving ? 'Saving...' : 'Save Opening Balances'}
                </button>
              </div>
            </form>
          )}
          {!selectedHeadId && (
            <div className="text-muted">Please select a head to view subheads.</div>
          )}
        </div>

        <div className="card-footer bg-success bg-opacity-10">
          <small className="text-muted">
            Only balance sheet accounts can have opening balances. Ensure totals are equal.
          </small>
        </div>
      </div>
      <div className="card mt-4">
        <div className="card-header d-flex justify-content-between bg-primary text-white">
          <h5 className="mb-0">Opening Balance Records</h5>
          {selectedRows.length > 0 && (
            <button className="btn btn-danger btn-sm float-end" onClick={deleteSelected}>
              Delete Selected ({selectedRows.length})
            </button>
          )}
          {selectedRows.length > 0 && (
            <button className="btn btn-success btn-sm " onClick={selectedLedger}>
              Add to general ledger ({selectedRows.length})
            </button>
          )}
        </div>

        <div className="card-body table-responsive">
          {error && <div className="alert alert-danger">{error}</div>}
          <table className="table table-sm table-bordered">
            <thead className="table-light">
              <tr>
                <th><input type="checkbox" onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRows(balances.map((b) => b.id));
                  } else {
                    setSelectedRows([]);
                  }
                }} /></th>
                <th>Subhead</th>
                <th>Head</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => {
                const type = b.drAmt > 0 ? 'Debit' : 'Credit';
                const amount = b.drAmt > 0 ? b.drAmt : b.crAmt;
                return (
                  <tr key={b.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(b.id)}
                        onChange={() => toggleSelectRow(b.id)}
                      />
                    </td>
                    <td>{b.subHeadId?.subheadName}</td>
                    <td>{b.headId?.headName}</td>
                    <td>{type}</td>
                    <td>₹{amount.toLocaleString()}</td>
                    <td>{b.year}</td>
                    <td>
                      <button className="btn btn-outline-primary btn-sm me-1" onClick={() => alert('Edit not implemented')}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(b.id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OpeningBalanceForm;
