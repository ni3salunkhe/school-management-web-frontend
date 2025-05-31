import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, XCircle, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import mandatoryFields from '../../services/mandatoryField';
import apiService from '../../services/api.service';
import { jwtDecode } from 'jwt-decode';
import showAlert from '../../services/alert';

const initialFormData = {
  id: null,
  headName: '',
  headCode: '',
  headType: 'Assets',
  isSystemDefined: false,
  status: 'Active'
};

const isMarathi = (text) => /^[\u0900-\u097F\s]+$/.test(text);
const isNumeric = (text) => /^[0-9]+$/.test(text);

const HeadMasterForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [headList, setHeadList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    headName: '',
    headCode: ''
  });
  const [options, setOptions] = useState();
  const [selectedOption, setSelectedOption] = useState('');
  const [bookTypeId, setBookTypeId] = useState(null)

  const udiseNo = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

  const fetchBooksides = async () => {
    try {
      const response = await apiService.getdata('booksidemaster/');

      // Check if response.data is a valid array
      if (Array.isArray(response.data)) {
        setOptions(response.data);
      } else {
        setOptions([]); // Fallback to empty array if data is not valid
        console.warn("Expected an array, but got:", response.data);
      }

    } catch (error) {
      console.error("Failed to fetch book sides:", error);
      setOptions([]); // Optional: set empty array on error
    }
  };

  useEffect(() => {
    fetchHeads();
    fetchBooksides()
  }, []);

  const fetchHeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getdata(`headmaster/getbyudise/${udiseNo}`);
      setHeadList(response.data);
    } catch (err) {
      setError(`माहिती मिळवण्यात अडचण: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setSelectedOption(parseInt(event.target.value));

  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let errors = { ...fieldErrors };

    if (name === 'headName') {
      if (!value.trim()) {
        errors.headName = 'हेड नाव आवश्यक आहे.';
      } else if (isMarathi(value)) {
        errors.headName = 'Plese enter Head Name in English.';
      } else if (headList.some(h => h.headName.trim().toLowerCase() === value.trim().toLowerCase() && h.headId !== formData.headCode)) {
        errors.headName = 'हेड नाव आधीच अस्तित्वात आहे.';
      } else {
        errors.headName = '';
      }
    }

    if (name === 'headCode') {
      console.log(headList)

      if (!value.trim()) {
        errors.headCode = 'हेड कोड आवश्यक आहे.';
      } else if (!isNumeric(value)) {
        errors.headCode = 'हेड कोड फक्त अंक असावा.';
      } else if (headList.some(h => h.headId === Number(value))) {
        errors.headCode = 'हेड कोड आधीच अस्तित्वात आहे.';
      } else {
        errors.headCode = '';
      }
    }

    setFormData({ ...formData, [name]: value });
    setFieldErrors(errors);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.headName || !formData.headCode) {
      setError("सर्व आवश्यक फील्ड भरावीत.");
      return;
    }

    if (fieldErrors.headCode || fieldErrors.headName) {
      setError("कृपया चुकीची माहिती दुरुस्त करा.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let selectedObject = [];
      selectedObject = options.find(d => d.booksideId === selectedOption)
      selectedObject = Number(selectedObject.booktypeId.booktypeId)

      const payload = {
        headId: formData.headCode,
        headName: formData.headName,
        schoolUdise: udiseNo,
        bookTypeMaster: selectedObject,
        bookSideMaster: selectedOption
      };

      if (isEditing && formData.headCode) {
        if (formData.isSystemDefined) {
          setError("सिस्टम डिफाइन्ड हेड बदलता येत नाही.");
          setLoading(false);
          return;
        }

        await apiService.put(`headmaster/${payload.headId}`, payload);
        setSuccess(`"${formData.headName}" यशस्वीरित्या अपडेट झाला.`);
        showAlert.sweetAlert("यशस्वी", "हेड माहिती अपडेट झाली.", "success");
      } else {
        const result = await showAlert.confirmBox("माहिती जतन करायची आहे का?");
        if (result.isConfirmed) {
          await apiService.postdata('headmaster/', payload);
          setSuccess(`"${formData.headName}" यशस्वीरित्या जतन झाला.`);
          showAlert.sweetAlert("यशस्वी", "हेड माहिती जतन झाली.", "success");
        } else {
          setLoading(false);
          return;
        }
      }

      handleClear();
      fetchHeads();
    } catch (err) {
      setError(`त्रुटी: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (head) => {
    setIsEditing(true);
    setFormData({
      id: head.id,
      headName: head.headName,
      headCode: head.headId,
      isSystemDefined: head.isSystemDefined
    });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (headId, headName) => {
    if (window.confirm(`"${headName}" हेड काढायचा आहे का? याचा इतर डेटावर परिणाम होऊ शकतो.`)) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await apiService.deleteById(`headmaster/${headId}`);
        setSuccess(`"${headName}" यशस्वीरित्या हटविला.`);
        fetchHeads();
      } catch (err) {
        setError(`हटवता आले नाही: ${err.message}`);
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
    setFieldErrors({ headName: '', headCode: '' });
  };

  return (
    <div className="container-fluid py-3">
      <div className="row mb-3">
        <div className="col-12">
          <h3>मुख्य लेखा हेड मास्टर</h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/account/dashboard">मास्टर्स</Link></li>
              <li className="breadcrumb-item active" aria-current="page">मुख्य हेड मास्टर</li>
            </ol>
          </nav>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card mb-4">
        <div className="card-header">
          <h5>{isEditing ? 'हेड संपादन करा' : <><Layers size={20} className="me-2" /> नवीन हेड जोडा</>}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-5">
                <label htmlFor="headCode" className="form-label">हेड कोड {mandatoryFields()}</label>
                <input
                  type="text"
                  id="headCode"
                  name="headCode"
                  className={`form-control ${fieldErrors.headCode ? 'is-invalid' : ''}`}
                  value={formData.headCode}
                  onChange={handleInputChange}
                  placeholder="उदा. 1001"
                  required
                  disabled={isEditing && formData.isSystemDefined}
                />
                {fieldErrors.headCode && <div className="invalid-feedback">{fieldErrors.headCode}</div>}
              </div>
              <div className="col-md-5">
                <label htmlFor="headName" className="form-label">मुख्य हेडचे नाव {mandatoryFields()}</label>
                <input
                  type="text"
                  id="headName"
                  name="headName"
                  className={`form-control ${fieldErrors.headName ? 'is-invalid' : ''}`}
                  value={formData.headName}
                  onChange={handleInputChange}
                  placeholder="उदा. मालमत्ता, जबाबदाऱ्या"
                  required
                  disabled={isEditing && formData.isSystemDefined}
                />
                {fieldErrors.headName && <div className="invalid-feedback">{fieldErrors.headName}</div>}
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div >
                <div className="d-flex flex-wrap gap-3">
                  {Array.isArray(options) && options.map((option) => (
                    <div key={option.booksideId} className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="radioGroup"
                        id={`radio-${option.booksideId}`}
                        value={option.booksideId}
                        checked={selectedOption === option.booksideId}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor={`radio-${option.booksideId}`}>
                        {option.booksideName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="d-flex gap-2">
              {!(isEditing && formData.isSystemDefined) && (
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Save size={16} className="me-1" />
                  {loading ? (isEditing ? 'अपडेट करत आहे...' : 'जतन करत आहे...') : (isEditing ? 'अपडेट करा' : 'जतन करा')}
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={handleClear} disabled={loading}>
                <XCircle size={16} className="me-1" />
                {isEditing ? 'संपादन रद्द करा' : 'फॉर्म रिकामा करा'}
              </button>
            </div>
            {isEditing && formData.isSystemDefined && <p className="mt-2 text-muted"><small>सिस्टम डिफाइन्ड हेड बदलता येत नाही.</small></p>}
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h5>माहितीचे हेड</h5></div>
        <div className="card-body p-0">
          {loading && headList.length === 0 ? <div className="text-center p-3"><div className="spinner-border spinner-border-sm"></div> लोड करत आहे...</div> :
            headList.length === 0 ? <p className="p-3 text-center text-muted">हेड सापडले नाहीत.</p> :
              (
                <div className="table-responsive">
                  <table className="table table-hover table-striped mb-0">
                    <thead>
                      <tr>
                        <th>हेड नाव</th>
                        <th>हेड कोड</th>
                        <th>कारवाई</th>
                      </tr>
                    </thead>
                    <tbody>
                      {headList.map(head => (
                        <tr key={head.id}>
                          <td>{head.headName}</td>
                          <td>{head.headId || '-'}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" onClick={() => handleEdit(head)} title="संपादन"><Edit size={14} /></button>
                              {!head.isSystemDefined && (
                                <button className="btn btn-outline-danger" onClick={() => handleDelete(head.headId, head.headName)} title="हटवा"><Trash2 size={14} /></button>
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
        <strong>टीप:</strong> मुख्य लेखा हेड म्हणजे विस्तृत श्रेणी. उप-हेड नंतर तयार करावेत (उदा. 'Cash', 'Tuition Fees').
      </div>
    </div>
  );
};

export default HeadMasterForm;
