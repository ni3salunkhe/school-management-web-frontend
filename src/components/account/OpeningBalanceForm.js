import React, { useState, useEffect } from 'react';
import { Save, DollarSign } from 'lucide-react';
import apiService from '../../services/api.service';

const OpeningBalanceForm = () => {
  const [financialYear, setFinancialYear] = useState('2024-2025');
  const [selectedHeadId, setSelectedHeadId] = useState('');
  const [subheadEntries, setSubheadEntries] = useState([]);
  const [allHeads, setAllHeads] = useState([]);
  const [allSubHeads, setAllSubHeads] = useState([]);
  const [financialYearsList, setFinancialYearsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const mockYears = [
      `${currentYear - 1}-${currentYear}`,
      `${currentYear}-${currentYear + 1}`,
      `${currentYear + 1}-${currentYear + 2}`,
    ];
    setFinancialYearsList(mockYears);
    fetchAccounts();
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
      setSubheadEntries(entries); // initial
    } catch (err) {
      setError(`Failed to fetch accounts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpeningBalancesForYear = async (fy) => {
    setLoading(true);
    try {
      let obData = [];

      if (fy === '2024-2025') {
        obData = [
          { headId: 5, subHeadId: 1, amount: 50000, balanceType: 'Debit' },
          { headId: 5, subHeadId: 2, amount: 10000, balanceType: 'Credit' },
        ];
      }

      const updatedEntries = allSubHeads.map((entry) => {
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
    }
  };

  const filteredEntries = selectedHeadId
    ? subheadEntries.filter((entry) => entry.headId === parseInt(selectedHeadId))
    : [];

  const totalDebit = calculateTotal('debit');
  const totalCredit = calculateTotal('credit');
  const difference = totalDebit - totalCredit;

  return (
    <div className="container-fluid py-3">
      <h3>Opening Balance Entry</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
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

        <div className="card-footer">
          <small className="text-muted">
            Only balance sheet accounts can have opening balances. Ensure totals are equal.
          </small>
        </div>
      </div>
    </div>
  );
};

export default OpeningBalanceForm;
