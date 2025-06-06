// src/components/account/Masters/SubHeadMasterForm.js
import React, { useState, useEffect, use } from 'react';
import { Edit, Save, XCircle, ListPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import mandatoryFields from '../../services/mandatoryField';
import apiService from '../../services/api.service';
import { jwtDecode } from 'jwt-decode';
import showAlert from '../../services/alert';

const initialFormData = {
  id: null,
  subheadName: '',
  subHeadCode: '', // Unique numeric code
  parentHeadId: '', // ID of the HeadMaster it belongs to
  isProfitLossItem: false,
  isBalanceSheetItem: false,
  status: 'Active'
};

const SubHeadMasterForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [subHeadList, setSubHeadList] = useState([]);
  const [parentHeads, setParentHeads] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParentHead, setFilterParentHead] = useState('');
  const udiseNo = jwtDecode(sessionStorage.getItem('token')).udiseNo;
  const [nextId, setNextId] = useState(null)
  const isMarathi = (text) => /^[\u0900-\u097F\s]+$/.test(text);
  useEffect(() => {
    fetchParentHeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSubHeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentHeads]);

  const fetchParentHeads = async () => {
    try {
      const response = await apiService.getdata(`headmaster/`);
      setParentHeads(response.data || []);
    } catch (err) {
      setError('मुख्य हेड मिळवताना त्रुटी: ' + err.message);
    }
  };

  const idIncrement = async () => {
    await apiService.getdata("subheadmaster/next-id")
      .then(res => setNextId(res.data)
      )

  }
  useEffect(() => {
    idIncrement()
  }, []);

  console.log(nextId);


  const fetchSubHeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getdata(`subheadmaster/`);
      console.log(response.data)
      const subHeads = (response.data || []).map(sh => ({
        ...sh,
        id: sh.subheadId,
        subHeadCode: sh.subheadId,
        parentHeadId: sh.headId.headId,
        parentHeadName: parentHeads.find(ph => ph.headId === sh.headId.headId)?.headName || 'N/A'
      }));
      console.log(subHeads)
      setSubHeadList(subHeads);
    } catch (err) {
      setError('उप-हेड मिळवताना त्रुटी: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newFormData = { ...formData, [name]: type === 'checkbox' ? checked : value };

    // Numeric validation for subHeadCode
    if (name === "subHeadCode") {
      if (value && !/^\d*$/.test(value)) {
        setError("उप-हेड कोड फक्त अंक असावा.");
        setFormData(newFormData);
        return;
      }
    }
    // Duplicate check for subheadName
    if (name === "subheadName") {
      const duplicateName = subHeadList.some(sh =>
        sh.subheadName && sh.subheadName.toLowerCase() === value.toLowerCase() &&
        sh.id !== formData.id
      );

      if (isMarathi(value)) {
        setError("कृपया केवळ इंग्रजी भाषा वापरा. भाषा बदलण्यासाठी windows key + स्पेसबार दाबा");
        setFormData(newFormData);
        return;
      }
      if (duplicateName) {
        setError("हे उप-हेड नाव आधीच अस्तित्वात आहे.");
        setFormData(newFormData);
        return;
      }
    }

    // Duplicate check for subHeadCode
    if (name === "subHeadCode") {
      const duplicateCode = subHeadList.some(sh =>
        sh.subHeadCode === Number(value) &&
        sh.id !== Number(formData.id)
      );
      if (duplicateCode) {
        setError("हे उप-हेड कोड आधीच अस्तित्वात आहे.");
        setFormData(newFormData);
        return;
      }
    }

    // Handle isProfitLossItem & isBalanceSheetItem based on parentHeadId's headType
    if (name === "parentHeadId" && value) {
      const selectedParent = parentHeads.find(p => p.headId === value);
      if (selectedParent) {
        if (selectedParent.headType === "Income" || selectedParent.headType === "Expenses") {
          newFormData.isProfitLossItem = true;
          newFormData.isBalanceSheetItem = false;
        } else if (
          selectedParent.headType === "Assets" ||
          selectedParent.headType === "Liabilities" ||
          selectedParent.headType === "Capital"
        ) {
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

    if (error) return;

    if (!formData.subheadName || !formData.parentHeadId) {
      setError("उप-हेड नाव, कोड आणि मुख्य हेड आवश्यक आहे.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let id = nextId
      const payload = {
        ...formData,
        subheadName: formData.subheadName,
        subheadId: id++,
        headId: formData.parentHeadId,
        schoolUdise: udiseNo
      };

      if (isEditing && formData.subHeadCode) {
        await apiService.put(`subheadmaster/${payload.subheadId}`, payload);
        await apiService.put(`subheadmaster/${payload.subheadId}`, payload);
        showAlert.sweetAlert("यशस्वी", "सब हेड माहिती अपडेट झाली.", "success");
        setSuccess(`उप-हेड "${formData.subheadName}" यशस्वीरीत्या अपडेट झाले!`);
      } else {
        const result = await showAlert.confirmBox("माहिती जतन करायची आहे का?");
        if (!result.isConfirmed) {
          setLoading(false);
          return;
        }
        await apiService.postdata(`subheadmaster/`, payload);
        setSuccess(`उप-हेड "${formData.subheadName}" यशस्वीरीत्या जतन झाले!`);
        showAlert.sweetAlert("यशस्वी", "सब हेड माहिती जतन झाली.", "success");
      }
      handleClear();
      fetchSubHeads();
    } catch (err) {
      setError(`ऑपरेशन अयशस्वी: ${err.message}`);
    } finally {
      setLoading(false);
      idIncrement()

    }
  };

  const handleEdit = (subHead) => {
    setIsEditing(true);
    setFormData({
      ...subHead,
      subheadName: subHead.subheadName,
      subheadId: subHead.subHeadCode,
      parentHeadId: subHead.parentHeadId
    });
    setError(null);
    setSuccess(null);
    window.scrollTo(0, 0);
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  console.log(subHeadList);

  // const filteredSubHeadList = subHeadList.filter(sh =>
  //   (sh.subheadName && sh.subheadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     (sh.subHeadCode && String(sh.subHeadCode).includes(searchTerm.toLowerCase()))) &&
  //   (filterParentHead === '' || sh.parentHeadId === filterParentHead)
  // );

  const filteredSubHeadList = subHeadList.filter(sh => {
    const matchesSearch =
      (sh.subheadName && sh.subheadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sh.subHeadCode && String(sh.subHeadCode).includes(searchTerm));

    const matchesParentHead =
      !filterParentHead || String(sh.parentHeadId) === filterParentHead;

    return matchesSearch && matchesParentHead;
  });


  return (
    <div className="container-fluid py-3">
      <div className="row mb-3">
        <div className="col-12">
          <h3>उप-हेड मास्टर (लेजर हेड)</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account/dashboard">मास्टर्स</Link></li>
              <li className="breadcrumb-item active" aria-current="page">उप-हेड मास्टर</li>
            </ol>
          </nav>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            {isEditing ? 'उप-हेड संपादित करा' : <><ListPlus size={20} className="me-2" /> नवीन उप-हेड जोडा</>}
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="parentHeadId" className="form-label">
                  मुख्य हेड {mandatoryFields()}
                </label>
                <select
                  id="parentHeadId"
                  name="parentHeadId"
                  className={`form-select ${error && error.includes('मुख्य') ? 'is-invalid' : ''}`}
                  value={formData.parentHeadId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- मुख्य हेड निवडा --</option>
                  {parentHeads.map(ph => (
                    <option key={ph.headId} value={ph.headId}>{ph.headName}</option>
                  ))}
                </select>
                {error && error.includes('मुख्य') && <div className="invalid-feedback">{error}</div>}
              </div>
              <div className="col-md-4">
                <label htmlFor="subheadName" className="form-label">
                  उप-हेड नाव {mandatoryFields()}
                </label>
                <input
                  type="text"
                  id="subheadName"
                  name="subheadName"
                  className={`form-control ${error && error.includes('नाव') ? 'is-invalid' : ''}`}
                  placeholder="उप-हेड नाव लिहा"
                  value={formData.subheadName}
                  onChange={handleInputChange}
                  maxLength={100}
                  autoFocus
                  required
                />
                {error && error.includes('नाव') && <div className="invalid-feedback">{error}</div>}
              </div>

              {/* <div className="col-md-4">
                <label htmlFor="subHeadCode" className="form-label">
                  उप-हेड कोड {mandatoryFields()}
                </label>
                <input
                  type="text"
                  id="subHeadCode"
                  name="subHeadCode"
                  className={`form-control ${error && error.includes('कोड') ? 'is-invalid' : ''}`}
                  placeholder="उदाहरणार्थ, 1000"
                  value={formData.subHeadCode}
                  onChange={handleInputChange}
                  maxLength={10}
                  required
                />
                {error && error.includes('कोड') && <div className="invalid-feedback">{error}</div>}
              </div> */}
            </div>
            <div className="row mt-4">
              <div className="col-md-12">
                <button type="submit" disabled={loading} className="btn btn-primary me-2">
                  {loading ? 'जतन करत आहे...' : (isEditing ? <><Edit size={20} className="me-1" /> अपडेट करा</> : <><Save size={20} className="me-1" /> जतन करा</>)}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleClear}>
                  <XCircle size={20} className="me-1" /> रद्द करा
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Search & filter */}
      <div className="card">
        <div className="card-header">
          <h5>उप-हेड यादी</h5>
          <div className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="उप-हेड नाव किंवा कोड शोधा..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterParentHead}
                onChange={e => setFilterParentHead(e.target.value)}
              >
                <option value="">-- मुख्य हेड द्वारे फिल्टर करा --</option>
                {parentHeads.map(ph => (
                  <option key={ph.headId} value={ph.headId}>{ph.headName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <table className="table table-striped mb-0">
            <thead>
              <tr>
                <th>उप-हेड नाव</th>
                <th>उप-हेड कोड</th>
                <th>मुख्य हेड</th>
                <th>आर्थिक विवरण</th>
                <th>स्थिती</th>
                <th>क्रिया</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubHeadList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">कोणतेही उप-हेड आढळले नाहीत.</td>
                </tr>
              ) : (
                filteredSubHeadList.map(sh => (
                  <tr key={sh.id}>
                    <td>{sh.subheadName}</td>
                    <td>{sh.subHeadCode}</td>
                    <td>{sh.parentHeadName}</td>
                    <td>
                      {sh.isProfitLossItem && <span className="badge bg-success me-1">लाभ-तोटा</span>}
                      {sh.isBalanceSheetItem && <span className="badge bg-primary">बॅलन्स शीट</span>}
                    </td>
                    <td>{sh.status}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        title="संपादित करा"
                        onClick={() => handleEdit(sh)}
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubHeadMasterForm;
