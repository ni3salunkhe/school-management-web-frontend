import React, { useState, useEffect } from "react";
import {
  Save,
  DollarSign,
  Pencil,
  Trash2,
  Group,
  X,
  Check,
} from "lucide-react";
import apiService from "../../services/api.service";
import { jwtDecode } from "jwt-decode";

const OpeningBalanceForm = () => {
  const [financialYear, setFinancialYear] = useState();
  const [selectedHeadId, setSelectedHeadId] = useState("");
  const [subheadEntries, setSubheadEntries] = useState([]);
  const [allHeads, setAllHeads] = useState([]);
  const [allSubHeads, setAllSubHeads] = useState([]);
  const [financialYearsList, setFinancialYearsList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [creditAmount, setCreditAmount] = useState(1500.0);
  const [debitAmount, setDebitAmount] = useState(1200.0);
  const [filteredSubheads, setFilterdSubheads] = useState([]);
  const isBalanced = creditAmount === debitAmount;
  const [balances, setBalances] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flag, setFlag] = useState(false);

  // Edit functionality states
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    drAmt: "",
    crAmt: "",
    year: "",
  });

  const udiseNo = jwtDecode(sessionStorage.getItem("token")).udiseNo;
  const today = new Date();
  const entrydate = today.toISOString().split("T")[0];

  useEffect(() => {
    fetchOpeningBalances();
  }, []);

  const fetchOpeningBalances = async () => {
    try {
      setLoading(true);
      const response = await apiService.getdata(`openingbal/byudise/${udiseNo}`);
      setBalances(response.data || []);
      console.log(response.data);
      
      const calculatefinancialYear = () => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)

        // If current month is June (5) or later, academic year is currentYear-nextYear
        if (currentMonth >= 3) {
          return `${currentYear}-${currentYear + 1}`;
        }
        return `${currentYear - 1}-${currentYear}`;
      };

      setFinancialYear(calculatefinancialYear());
    } catch (err) {
      setError(`Failed to fetch opening balances: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await apiService.deleteById(`openingbal/${id}`);
      fetchOpeningBalances();
      fetchSumofCrDr();

    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // Edit functionality functions
  const handleEdit = (balance) => {
    setEditingId(balance.id);
    setEditForm({
      drAmt: balance.drAmt || "",
      crAmt: balance.crAmt || "",
      year: balance.year || "",
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({
      drAmt: "",
      crAmt: "",
      year: "",
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
      // Clear the opposite field when one is entered (like in your original logic)
      ...(field === "drAmt" ? { crAmt: "" } : {}),
      ...(field === "crAmt" ? { drAmt: "" } : {}),
    }));
  };

  const handleEditSave = async () => {
    try {
      const updateData = {
        ...editForm,
        drAmt: parseFloat(editForm.drAmt) || 0,
        crAmt: parseFloat(editForm.crAmt) || 0,
        year: editForm.year,
      };

      // Validate that at least one amount is provided
      if (updateData.drAmt === 0 && updateData.crAmt === 0) {
        alert("Please enter either a debit or credit amount");
        return;
      }

      await apiService.put(`openingbal/${editingId}`, updateData);

      setEditingId(null);
      setEditForm({ drAmt: "", crAmt: "", year: "" });
      fetchOpeningBalances();
      fetchSumofCrDr();
      setSuccess("Record updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Update failed: ${err.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
    console.log(selectedRows);
  };

  const selectedLedger = async () => {
    if (selectedRows.length === 0) {
      alert("No rows selected");
      return;
    }

    try {
      const selectedEntries = balances.filter((b) =>
        selectedRows.includes(b.id)
      );
      console.log(selectedEntries);
      const ledgerPayload = selectedEntries.map((entry) => ({
        entryType: "Opening Balance",
        headid: entry.headId?.headId,
        subhead: entry.subHeadId?.subheadId,
        Dr_Amt: entry.drAmt,
        Cr_Amt: entry.crAmt,
        narr: "Opening balance",
        year: financialYear,
        udiseNo,
        entrydate,
      }));

      console.log("Submitting to General Ledger:", ledgerPayload);

      await apiService.postdata("generalledger/bulk", ledgerPayload);

      alert("Successfully added to General Ledger!");
      setSelectedRows([]);
    } catch (error) {
      console.error("Ledger submission failed:", error);
      alert(`Failed to submit to General Ledger: ${error.message}`);
    }
  };

  const deleteSelected = async () => {
    if (!window.confirm("Delete selected records?")) return;
    try {
      await Promise.all(
        selectedRows.map((id) => apiService.deleteById(`openingbal/${id}`))
      );
      setSelectedRows([]);
      fetchOpeningBalances();
      fetchSumofCrDr();
    } catch (err) {
      alert("Batch delete failed: " + err.message);
    }
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    // const mockYears = [
    //   `${currentYear - 1}-${currentYear}`,
    //   `${currentYear}-${currentYear + 1}`,
    //   `${currentYear + 1}-${currentYear + 2}`,
    // ];
    // setFinancialYearsList(mockYears);
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
      const subHeadsRes = await apiService.getdata(`subheadmaster/getbyudise/${udiseNo}`);
      const headsRes = await apiService.getdata("headmaster/");

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
        debit: "",
        credit: "",
        bookType: sh.headId.bookSideMaster.booksideName,
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
    const response = await apiService
      .getdata(`openingbal/sum/${udiseNo}`)
      .catch((e) => console.log(e));
    setCreditAmount(response.data.totalCr);
    setDebitAmount(response.data.totalDr);
  };

  const fetchOpeningBalancesForYear = async (fy) => {
    setLoading(true);
    try {
      let obData = [];
      const response = await apiService.getdata(`openingbal/byudise/${udiseNo}`);
      const existingSubHeadIds = (response.data || []).map(
        (item) => item.subHeadId.subheadId
      );

      const filteredData = allSubHeads.filter(
        (h) => !existingSubHeadIds.includes(h.subHeadId)
      );
      console.log(response.data);

      setSubheadEntries(filteredData);

      if (fy === "2024-2025") {
        obData = [
          { headId: 5, subHeadId: 1, amount: 50000, balanceType: "Debit" },
          { headId: 5, subHeadId: 2, amount: 10000, balanceType: "Credit" },
        ];
      }

      const updatedEntries = filteredData.map((entry) => {
        const match = obData.find((ob) => ob.subHeadId === entry.subHeadId);
        return {
          ...entry,
          debit: match?.balanceType === "Debit" ? match.amount : "",
          credit: match?.balanceType === "Credit" ? match.amount : "",
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
            ...(field === "debit" ? { credit: "" } : {}),
            ...(field === "credit" ? { debit: "" } : {}),
          }
          : entry
      )
    );
    setError(null);
    setSuccess(null);
  };


  const calculateTotal = (type) =>
    filteredEntries.reduce(
      (sum, entry) => sum + (parseFloat(entry[type]) || 0),
      0
    );

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
        balanceType: e.debit ? "Debit" : "Credit",
        udiseNo
      }));

    if (validEntries.length === 0) {
      setError("Enter at least one valid amount.");
      return;
    }

    const totalDebit = calculateTotal("debit");
    const totalCredit = calculateTotal("credit");

    try {
      setSaving(true);
      const payload = { financialYear, balances: validEntries };
      console.log("Saving:", payload);
      await apiService.postdata("openingbal/bulk", payload);
      setTimeout(() => {
        setSuccess("Opening balances saved successfully!");
      }, 1000);
    } catch (err) {
      setError(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
      setSelectedHeadId("");
      fetchSumofCrDr();
      fetchOpeningBalances();
    }
  };

  if (flag === true) {
    console.log(selectedRows);
  }

  const filteredEntries = selectedHeadId
    ? subheadEntries.filter(
      (entry) => entry.headId === parseInt(selectedHeadId)
    )
    : [];

  const totalDebit = calculateTotal("debit");
  const totalCredit = calculateTotal("credit");
  const difference = creditAmount - debitAmount;

  return (
    <div className="container-fluid py-3">
      <h3>प्रारंभिक शिल्लक नोंद</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row justify-content-center py-2">
        <div className="col-md-8 col-lg-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">खाते शिल्लक सारांश</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-6">
                  <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                    <h6 className="text-success mb-2">क्रेडिट रक्कम</h6>
                    <h4 className="text-success fw-bold">
                      ₹{creditAmount.toFixed(2)}
                    </h4>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center p-3 bg-danger bg-opacity-10 rounded">
                    <h6 className="text-danger mb-2">डेबिट रक्कम</h6>
                    <h4 className="text-danger fw-bold">
                      ₹{debitAmount.toFixed(2)}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="text-center">
                {isBalanced ? (
                  <div className="alert alert-success" role="alert">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    <strong>समतोल!</strong> क्रेडिट आणि डेबिट रक्कम समान आहेत.
                  </div>
                ) : (
                  <div className="alert alert-warning" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>असमतोल आढळला!</strong>
                    <br />
                    फरक: ₹{difference.toFixed(2)}
                    <br />
                    {creditAmount > debitAmount
                      ? "क्रेडिट डेबिटपेक्षा जास्त"
                      : "डेबिट क्रेडिटपेक्षा जास्त"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
          <div className="d-flex align-items-center gap-2">
            <DollarSign size={20} />
            <strong>प्रारंभिक शिल्लक सेट करा</strong>
          </div>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={selectedHeadId}
              onChange={(e) => setSelectedHeadId(e.target.value)}
              disabled={loading}
            >
              <option value="">मुख्य शीर्ष निवडा</option>
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
                      <th>उपशीर्ष नाव</th>
                      <th>डेबिट (₹)</th>
                      <th>क्रेडिट (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => {
                      const bookType = entry.bookType?.toLowerCase();
                      const isDebitEditable =
                        bookType === "asset" || bookType === "profit and loss";
                      const isCreditEditable = bookType === "liabilities";

                      return (
                        <tr key={entry.subHeadId}>
                          <td>{entry.subHeadName}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm text-end"
                              value={entry.debit}
                              onChange={(e) =>
                                handleSubheadChange(
                                  entry.subHeadId,
                                  "debit",
                                  e.target.value
                                )
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
                                handleSubheadChange(
                                  entry.subHeadId,
                                  "credit",
                                  e.target.value
                                )
                              }
                              step="0.01"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-light fw-bold">
                    <tr>
                      <td className="text-end">एकूण</td>
                      <td className="text-end">₹{totalDebit.toFixed(2)}</td>
                      <td className="text-end">₹{totalCredit.toFixed(2)}</td>
                    </tr>
                    {difference !== 0 && (
                      <tr className="table-warning">
                        <td className="text-end">फरक</td>
                        <td colSpan="2" className="text-end text-danger">
                          ₹{Math.abs(difference).toFixed(2)} (
                          {difference > 0 ? "डेबिट जास्त" : "क्रेडिट जास्त"})
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>

              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-success">
                  <Save size={16} className="me-1" />
                  {saving ? "सेव होत आहे..." : "प्रारंभिक शिल्लक जतन करा"}
                </button>
              </div>
            </form>
          )}
          {!selectedHeadId && (
            <div className="text-muted">
              कृपया उपशीर्ष पाहण्यासाठी मुख्य शीर्ष निवडा.
            </div>
          )}
        </div>

        <div className="card-footer bg-success bg-opacity-10">
          <small className="text-muted">
            फक्त बॅलन्स शीट खात्यांमध्ये प्रारंभिक शिल्लक असू शकते. एकूण रक्कम समान असल्याची खात्री करा.
          </small>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header d-flex justify-content-between bg-primary text-white">
          <h5 className="mb-0">प्रारंभिक शिल्लक नोंदी</h5>
          <div className="d-flex gap-2">
            {selectedRows.length > 0 && (
              <button
                className="btn btn-success btn-sm"
                onClick={selectedLedger}
              >
                जनरल लेजरमध्ये जोडा ({selectedRows.length})
              </button>
            )}
            {selectedRows.length > 0 && (
              <button
                className="btn btn-danger btn-sm"
                onClick={deleteSelected}
              >
                निवडलेले हटवा ({selectedRows.length})
              </button>
            )}
          </div>
        </div>

        <div className="card-body table-responsive">
          {error && <div className="alert alert-danger">{error}</div>}
          <table className="table table-sm table-bordered">
            <thead className="table-light">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(balances.map((b) => b.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </th>
                <th>उपशीर्ष</th>
                <th>मुख्य शीर्ष</th>
                <th>डेबिट रक्कम</th>
                <th>क्रेडिट रक्कम</th>
                <th>वर्ष</th>
                <th>क्रिया</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => {
                const isEditing = editingId === b.id;

                return (
                  <tr key={b.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(b.id)}
                        onChange={() => toggleSelectRow(b.id)}
                        disabled={isEditing}
                      />
                    </td>
                    <td>{b.subHeadId?.subheadName}</td>
                    <td>{b.headId?.headName}</td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={editForm.drAmt}
                          onChange={(e) =>
                            handleEditChange("drAmt", e.target.value)
                          }
                          step="0.01"
                          placeholder="0.00"
                        />
                      ) : (
                        `₹${(b.drAmt || 0).toLocaleString()}`
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={editForm.crAmt}
                          onChange={(e) =>
                            handleEditChange("crAmt", e.target.value)
                          }
                          step="0.01"
                          placeholder="0.00"
                        />
                      ) : (
                        `₹${(b.crAmt || 0).toLocaleString()}`
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editForm.year}
                          onChange={(e) =>
                            handleEditChange("year", e.target.value)
                          }
                          placeholder="2024-2025"
                        />
                      ) : (
                        b.year
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={handleEditSave}
                            title="बदल जतन करा"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={handleEditCancel}
                            title="रद्द करा"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleEdit(b)}
                            title="नोंद संपादित करा"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(b.id)}
                            title="नोंद हटवा"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
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
