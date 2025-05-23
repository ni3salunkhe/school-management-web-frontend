// src/components/account/Masters/SubHeadMasterForm.js
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, XCircle, ListPlus, Search as SearchIcon } from 'lucide-react';
// import { getHeadMasters, getSubHeadMasters, saveSubHeadMaster, updateSubHeadMaster, deleteSubHeadMaster } from '../../../services/accountApi';
import { Link } from 'react-router-dom';

const initialFormData = {
  id: null,
  subHeadName: '',
  subHeadCode: '', // Optional unique code
  parentHeadId: '', // ID of the HeadMaster it belongs to
  isProfitLossItem: false, // Does it appear in P&L? (Income/Expense heads usually)
  isBalanceSheetItem: false, // Does it appear in Balance Sheet? (Asset/Liability/Capital heads usually)
  status: 'Active'
};

const SubHeadMasterForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [subHeadList, setSubHeadList] = useState([]);
  const [parentHeads, setParentHeads] = useState([]); // Main HeadMasters for dropdown
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParentHead, setFilterParentHead] = useState('');


  useEffect(() => {
    fetchParentHeads();
    fetchSubHeads();
  }, []);

  const fetchParentHeads = async () => {
    // const data = await getHeadMasters();
    // setParentHeads(data || []);
    // --- MOCK DATA ---
    setParentHeads([
      { id: 'H001', headName: 'Assets', headType: 'Assets' },
      { id: 'H002', headName: 'Liabilities', headType: 'Liabilities' },
      { id: 'H003', headName: 'Income', headType: 'Income' },
      { id: 'H004', headName: 'Expenses', headType: 'Expenses' },
      { id: 'H005', headName: 'Capital', headType: 'Capital' },
    ]);
    // --- END MOCK DATA ---
  };

  const fetchSubHeads = async () => {
    setLoading(true);
    setError(null);
    try {
      // const data = await getSubHeadMasters();
      // setSubHeadList(data || []);
      // --- MOCK DATA ---
      const mockSubHeads = [
        { id: 'SH001', subHeadName: 'Cash In Hand', subHeadCode: 'CSH', parentHeadId: 'H001', parentHeadName: 'Assets', isBalanceSheetItem: true, isProfitLossItem: false, status: 'Active' },
        { id: 'SH002', subHeadName: 'SBI Bank A/C - 1234', subHeadCode: 'SBI1234', parentHeadId: 'H001', parentHeadName: 'Assets', isBalanceSheetItem: true, isProfitLossItem: false, status: 'Active' },
        { id: 'SH003', subHeadName: 'Tuition Fees Received', subHeadCode: 'FEE-TUIT', parentHeadId: 'H003', parentHeadName: 'Income', isBalanceSheetItem: false, isProfitLossItem: true, status: 'Active' },
        { id: 'SH004', subHeadName: 'Salaries Paid', subHeadCode: 'SAL-PAID', parentHeadId: 'H004', parentHeadName: 'Expenses', isBalanceSheetItem: false, isProfitLossItem: true, status: 'Active' },
        { id: 'SH005', subHeadName: 'Creditors for Goods', subHeadCode: 'CRD-GDS', parentHeadId: 'H002', parentHeadName: 'Liabilities', isBalanceSheetItem: true, isProfitLossItem: false, status: 'Active' },
        { id: 'SH006', subHeadName: 'Computer Equipment', subHeadCode: 'AST-COMP', parentHeadId: 'H001', parentHeadName: 'Assets', isBalanceSheetItem: true, isProfitLossItem: false, status: 'Inactive' },
      ];
      setSubHeadList(mockSubHeads.map(sh => ({...sh, parentHeadName: parentHeads.find(ph => ph.id === sh.parentHeadId)?.headName || 'N/A'}))); // Add parentHeadName for display
      // --- END MOCK DATA ---
    } catch (err) {
      setError(`Failed to fetch sub-account heads: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };

    if (name === "parentHeadId" && value) {
        const selectedParent = parentHeads.find(p => p.id === value);
        if (selectedParent) {
            if (selectedParent.headType === "Income" || selectedParent.headType === "Expenses") {
                newFormData.isProfitLossItem = true;
                newFormData.isBalanceSheetItem = false;
            } else if (selectedParent.headType === "Assets" || selectedParent.headType === "Liabilities" || selectedParent.headType === "Capital") {
                newFormData.isProfitLossItem = false;
                newFormData.isBalanceSheetItem = true;
            } else {
                newFormData.isProfitLossItem = false;
                newFormData.isBalanceSheetItem = false;
            }
        }
    }
    setFormData(newFormData);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subHeadName || !formData.parentHeadId) {
      setError("Sub-Head Name and Parent Head are required.");
      return;
    }
    if (!formData.isProfitLossItem && !formData.isBalanceSheetItem) {
        setError("Account head must affect either Profit & Loss or Balance Sheet (or both, rarely).");
        return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      let response;
      const payload = { ...formData };
      if (isEditing && formData.id) {
        // response = await updateSubHeadMaster(formData.id, payload);
        console.log('Updating Sub-Head Master (Mock):', payload);
        response = {...payload, id: formData.id};
        setSuccess(`Sub-Head "${formData.subHeadName}" updated successfully!`);
      } else {
        // response = await saveSubHeadMaster(payload);
        console.log('Saving New Sub-Head Master (Mock):', payload);
        response = {...payload, id: `SH00${subHeadList.length + 1}`};
        setSuccess(`Sub-Head "${formData.subHeadName}" saved successfully!`);
      }
      handleClear();
      fetchSubHeads();
    } catch (err) {
      setError(`Operation Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subHead) => {
    setIsEditing(true);
    setFormData({ ...subHead });
    setError(null);
    setSuccess(null);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (subHeadId, subHeadName) => {
    if (subHeadName === 'Cash In Hand') { // Example of a protected sub-head
        alert('"Cash In Hand" is a critical system account and cannot be deleted.');
        return;
    }
    if (window.confirm(`Are you sure you want to delete sub-head "${subHeadName}"? This may affect existing transactions.`)) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        // await deleteSubHeadMaster(subHeadId);
        console.log('Deleting sub-head ID (Mock):', subHeadId);
        setSuccess(`Sub-Head "${subHeadName}" deleted successfully!`);
        fetchSubHeads();
      } catch (err) {
        setError(`Failed to delete sub-head: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const filteredSubHeadList = subHeadList.filter(sh =>
    (sh.subHeadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (sh.subHeadCode && sh.subHeadCode.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (filterParentHead === '' || sh.parentHeadId === filterParentHead)
  );

  return (
    <div className="container-fluid py-3">
      <div className="row mb-3">
        <div className="col-12">
          <h3>Sub-Account Head Master (Ledger Accounts)</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account/dashboard">Masters</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Sub-Account Head Master</li>
            </ol>
          </nav>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {isEditing ? 'Edit Sub-Account Head' : <><ListPlus size={20} className="me-2"/> Add New Sub-Account Head</>}
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-5">
                <label htmlFor="subHeadName" className="form-label">Sub-Account Head Name *</label>
                <input type="text" id="subHeadName" name="subHeadName" className="form-control" value={formData.subHeadName} onChange={handleInputChange} placeholder="e.g., Tuition Fees, Salaries, SBI Bank A/C" required />
              </div>
              <div className="col-md-3">
                <label htmlFor="parentHeadId" className="form-label">Parent Main Head *</label>
                <select id="parentHeadId" name="parentHeadId" className="form-select" value={formData.parentHeadId} onChange={handleInputChange} required>
                  <option value="">Select Parent Head</option>
                  {parentHeads.map(head => (
                    <option key={head.id} value={head.id}>{head.headName} ({head.headType})</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="subHeadCode" className="form-label">Sub-Head Code (Optional)</label>
                <input type="text" id="subHeadCode" name="subHeadCode" className="form-control" value={formData.subHeadCode} onChange={handleInputChange} placeholder="Unique code e.g., INC-TUIT" />
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Financial Statement Impact *</label>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="isProfitLossItem" id="isProfitLossItem"
                         checked={formData.isProfitLossItem} onChange={handleInputChange} />
                  <label className="form-check-label" htmlFor="isProfitLossItem">
                    Affects Profit & Loss A/c
                  </label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="isBalanceSheetItem" id="isBalanceSheetItem"
                         checked={formData.isBalanceSheetItem} onChange={handleInputChange} />
                  <label className="form-check-label" htmlFor="isBalanceSheetItem">
                    Affects Balance Sheet
                  </label>
                </div>
                 <small className="form-text text-muted">Typically, Income/Expense heads affect P&L. Asset/Liability/Capital heads affect Balance Sheet.</small>
              </div>
              <div className="col-md-4">
                <label htmlFor="status" className="form-label">Status</label>
                <select id="status" name="status" className="form-select" value={formData.status} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={16} className="me-1" />
                {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Sub-Head' : 'Save Sub-Head')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
                <XCircle size={16} className="me-1" />
                {isEditing ? 'Cancel Edit' : 'Clear Form'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Existing Sub-Account Heads</h5>
                <div className="d-flex gap-2">
                     <select
                        className="form-select form-select-sm w-auto"
                        value={filterParentHead}
                        onChange={(e) => setFilterParentHead(e.target.value)}
                        aria-label="Filter by parent head"
                    >
                        <option value="">All Parent Heads</option>
                        {parentHeads.map(head => (
                            <option key={head.id} value={head.id}>{head.headName}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        className="form-control form-control-sm w-auto"
                        placeholder="Search sub-heads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>
        <div className="card-body p-0">
          {loading && subHeadList.length === 0 ? <div className="text-center p-3"><div className="spinner-border spinner-border-sm"></div> Loading...</div> :
            filteredSubHeadList.length === 0 ? <p className="p-3 text-center text-muted">No sub-account heads found.</p> :
              (
                <div className="table-responsive">
                  <table className="table table-hover table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Sub-Head Name</th>
                        <th>Code</th>
                        <th>Parent Head</th>
                        <th>Impacts P&L</th>
                        <th>Impacts B/S</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubHeadList.map(sh => (
                        <tr key={sh.id}>
                          <td>{sh.subHeadName}</td>
                          <td>{sh.subHeadCode || '-'}</td>
                          <td>{sh.parentHeadName || parentHeads.find(ph => ph.id === sh.parentHeadId)?.headName || 'N/A'}</td>
                          <td>{sh.isProfitLossItem ? 'Yes' : 'No'}</td>
                          <td>{sh.isBalanceSheetItem ? 'Yes' : 'No'}</td>
                          <td>
                            <span className={`badge ${sh.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                              {sh.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" onClick={() => handleEdit(sh)} title="Edit"><Edit size={14} /></button>
                              <button className="btn btn-outline-danger" onClick={() => handleDelete(sh.id, sh.subHeadName)} title="Delete"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        </div>
         {filteredSubHeadList.length > 0 && <div className="card-footer text-muted small">
            Showing {filteredSubHeadList.length} of {subHeadList.length} sub-account heads.
        </div>}
      </div>
    </div>
  );
};

export default SubHeadMasterForm;