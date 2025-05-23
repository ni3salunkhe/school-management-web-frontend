// src/components/account/Masters/HeadMasterForm.js
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, XCircle, Layers } from 'lucide-react';
// import { getHeadMasters, saveHeadMaster, updateHeadMaster, deleteHeadMaster } from '../../../services/accountApi';
import { Link } from 'react-router-dom';

const initialFormData = {
  id: null,
  headName: '', // e.g., Assets, Liabilities, Income, Expenses, Capital
  headCode: '', // Optional unique code
  headType: 'Assets', // This defines the fundamental nature
  isSystemDefined: false, // To protect core heads
  status: 'Active'
};

const HeadMasterForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [headList, setHeadList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Core accounting head types
  const coreHeadTypes = ["Assets", "Liabilities", "Income", "Expenses", "Capital"];

  useEffect(() => {
    fetchHeads();
  }, []);

  const fetchHeads = async () => {
    setLoading(true);
    setError(null);
    try {
      // const data = await getHeadMasters();
      // setHeadList(data || []);
      // --- MOCK DATA ---
      const mockHeads = [
        { id: 'H001', headName: 'Assets', headCode: 'ASST', headType: 'Assets', isSystemDefined: true, status: 'Active' },
        { id: 'H002', headName: 'Liabilities', headCode: 'LIAB', headType: 'Liabilities', isSystemDefined: true, status: 'Active' },
        { id: 'H003', headName: 'Income', headCode: 'INCM', headType: 'Income', isSystemDefined: true, status: 'Active' },
        { id: 'H004', headName: 'Expenses', headCode: 'EXPN', headType: 'Expenses', isSystemDefined: true, status: 'Active' },
        { id: 'H005', headName: 'Capital', headCode: 'CAPL', headType: 'Capital', isSystemDefined: true, status: 'Active' },
        // Example of a user-defined head, though less common for main heads
        // { id: 'H006', headName: 'Suspense Accounts', headCode: 'SUSP', headType: 'Assets', isSystemDefined: false, status: 'Active' },
      ];
      setHeadList(mockHeads);
      // --- END MOCK DATA ---
    } catch (err) {
      setError(`Failed to fetch account heads: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.headName || !formData.headType) {
      setError("Head Name and Head Type are required.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      let response;
      const payload = { ...formData, isSystemDefined: formData.isSystemDefined || false }; // Ensure boolean

      if (isEditing && formData.id) {
        if (formData.isSystemDefined) {
            setError("System defined heads cannot be modified extensively. Contact administrator.");
            setLoading(false);
            return;
        }
        // response = await updateHeadMaster(formData.id, payload);
        console.log('Updating Head Master (Mock):', payload);
        response = {...payload, id: formData.id};
        setSuccess(`Head "${formData.headName}" updated successfully!`);
      } else {
        // response = await saveHeadMaster(payload);
        console.log('Saving New Head Master (Mock):', payload);
        response = {...payload, id: `H00${headList.length + 1}`};
        setSuccess(`Head "${formData.headName}" saved successfully!`);
      }
      handleClear();
      fetchHeads();
    } catch (err) {
      setError(`Operation Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (head) => {
    setIsEditing(true);
    setFormData({ ...head });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (headId, headName, isSystem) => {
    if (isSystem) {
      alert(`"${headName}" is a system-defined head and cannot be deleted.`);
      return;
    }
    if (window.confirm(`Are you sure you want to delete head "${headName}"? This will affect all sub-heads under it.`)) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        // await deleteHeadMaster(headId);
        console.log('Deleting head ID (Mock):', headId);
        setSuccess(`Head "${headName}" deleted successfully!`);
        fetchHeads();
      } catch (err) {
        setError(`Failed to delete head: ${err.message}`);
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

  return (
    <div className="container-fluid py-3">
      <div className="row mb-3">
        <div className="col-12">
          <h3>Main Account Head Master</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account/dashboard">Masters</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Main Head Master</li>
            </ol>
          </nav>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {isEditing ? 'Edit Main Head' : <><Layers size={20} className="me-2" /> Add New Main Head</>}
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-5">
                <label htmlFor="headName" className="form-label">Main Head Name *</label>
                <input type="text" id="headName" name="headName" className="form-control" value={formData.headName} onChange={handleInputChange} placeholder="e.g., Fixed Assets, Current Liabilities" required disabled={isEditing && formData.isSystemDefined}/>
              </div>
              <div className="col-md-3">
                <label htmlFor="headType" className="form-label">Fundamental Head Type *</label>
                <select id="headType" name="headType" className="form-select" value={formData.headType} onChange={handleInputChange} required disabled={isEditing && formData.isSystemDefined}>
                  {coreHeadTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
               <div className="col-md-4">
                <label htmlFor="headCode" className="form-label">Head Code (Optional)</label>
                <input type="text" id="headCode" name="headCode" className="form-control" value={formData.headCode} onChange={handleInputChange} placeholder="Unique code e.g., ASST-FXD" disabled={isEditing && formData.isSystemDefined}/>
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="status" className="form-label">Status</label>
                <select id="status" name="status" className="form-select" value={formData.status} onChange={handleInputChange} disabled={isEditing && formData.isSystemDefined && formData.status === 'Active'}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
               <div className="col-md-4 d-flex align-items-center pt-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" name="isSystemDefined" id="isSystemDefined"
                         checked={formData.isSystemDefined}
                         onChange={handleInputChange}
                         disabled // This should ideally be set by backend only
                  />
                  <label className="form-check-label" htmlFor="isSystemDefined">
                    Is System Defined (Cannot be deleted/majorly altered)
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              {!(isEditing && formData.isSystemDefined) && ( // Hide save if system defined and editing
                 <button type="submit" className="btn btn-primary" disabled={loading}>
                    <Save size={16} className="me-1" />
                    {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Head' : 'Save Head')}
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
                <XCircle size={16} className="me-1" />
                {isEditing ? 'Cancel Edit' : 'Clear Form'}
              </button>
            </div>
             {isEditing && formData.isSystemDefined && <p className="mt-2 text-muted"><small>System defined heads have restricted editing.</small></p>}
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h5 className="mb-0">Existing Main Account Heads</h5></div>
        <div className="card-body p-0">
          {loading && headList.length === 0 ? <div className="text-center p-3"><div className="spinner-border spinner-border-sm"></div> Loading...</div> :
            headList.length === 0 ? <p className="p-3 text-center text-muted">No main account heads found.</p> :
              (
                <div className="table-responsive">
                  <table className="table table-hover table-striped mb-0">
                    <thead>
                      <tr>
                        <th>Head Name</th>
                        <th>Head Type</th>
                        <th>Head Code</th>
                        <th>System Defined</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {headList.map(head => (
                        <tr key={head.id}>
                          <td>{head.headName}</td>
                          <td>{head.headType}</td>
                          <td>{head.headCode || '-'}</td>
                          <td>{head.isSystemDefined ? 'Yes' : 'No'}</td>
                          <td>
                            <span className={`badge ${head.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                              {head.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" onClick={() => handleEdit(head)} title="Edit"><Edit size={14} /></button>
                              {!head.isSystemDefined && (
                                <button className="btn btn-outline-danger" onClick={() => handleDelete(head.id, head.headName, head.isSystemDefined)} title="Delete"><Trash2 size={14} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        </div>
      </div>
      <div className="alert alert-info mt-3 small">
        <strong>Note:</strong> Main Account Heads are broad categories (Assets, Liabilities, Income, Expenses, Capital).
        Specific accounts (like 'Cash in Hand', 'Tuition Fees') are created under 'Sub-Account Head Master'.
        It's generally not recommended to add new Main Heads beyond the standard five unless for very specific accounting structures.
      </div>
    </div>
  );
};

export default HeadMasterForm;