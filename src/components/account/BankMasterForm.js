import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, XCircle, PlusCircle } from 'lucide-react';
// import { Link } from 'react-router-dom'; // Not used, can be removed if not planned
import { jwtDecode } from 'jwt-decode';
import apiService from '../../services/api.service';
import showAlert from '../../services/alert';
import mandatoryFields from '../../services/mandatoryField';
import numberService from '../../services/number.validation';

const initialFormData = {
  id: null,
  bankName: '',
  accountNumber: '',
  headId:'',
  accounttype: '',
  branchName: '',
  ifscCode: '',
  address: ''
};

const isMarathi = (text) => /^[\u0900-\u097F\s]+$/.test(text || '');

const BankMasterForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [bankList, setBankList] = useState([]);
  const [accountType, setAccountType] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // For general component errors
  const [formError, setFormError] = useState(null); // For form submission errors
  const [formSuccess, setFormSuccess] = useState(null); // For form submission success
  const [searchTerm, setSearchTerm] = useState('');
  const [heads, setHeads] = useState([]);
  const udiseNo = sessionStorage.getItem('token') ? jwtDecode(sessionStorage.getItem('token'))?.udiseNo : null;

  useEffect(() => {
    if (udiseNo) {
      fetchBanks();
      fetchAccountType();
      fetchHeads();
    } else {
      setError("Udise No. not found. Cannot fetch data.");
    }
  }, [udiseNo]); // Add udiseNo as a dependency

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const response = await apiService.getdata(`bank/byudiseno/${udiseNo}`);
      setBankList(response.data || []); // Ensure it's an array
    } catch (err) {
      setError(`बँक माहिती आणण्यात अडचण आली: ${err.message}`);
      setBankList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeads = async () => {
    if (!udiseNo) {
      setHeads([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const heads = await apiService.getdata("headmaster/");
      const filter = (heads.data || []).filter(
        e => e.headName === "Bank OCC A/c" || e.headName === 'Bank OD A/c.' || e.headName === "Bank Accounts"
      )
      setHeads(filter);

    }
    catch (err) {
      setError(`Failed to fetch customers: ${err.message}`);
      setHeads([]);
    }
    finally {
      setLoading(false);
    }
  }

  const fetchAccountType = async () => {
    try {
      const data = await apiService.getdata(`accounttype/byudiseno/${udiseNo}`);
      setAccountType(data.data || []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching account types:", error);
      setAccountType([]);
    }
  };

  const validateField = (name, value) => {
    let message = '';
    if (name === 'bankName') {
      if (!value.trim()) message = 'बँकेचे नाव आवश्यक आहे.';
      else if (!isMarathi(value)) message = 'बँकेचे नाव फक्त मराठीत असावे.';
      else if (bankList.some(b => b.bankname === value && (!isEditing || b.id !== formData.id))) {
        message = 'हे बँक नाव आधीपासून अस्तित्वात आहे.';
      }
    }
    if (name === 'accountNumber') {
      const numberRegex = /^[0-9]+$/;
      if (!value.trim()) message = 'खाते क्रमांक आवश्यक आहे.';
      else if (bankList.some(b => b.accountno === value && (!isEditing || b.id !== formData.id))) {
        message = 'हा खाते क्रमांक आधीपासून अस्तित्वात आहे.';
      }
      else if (!numberService.validateByPattern(value, numberRegex, 16)) {
        message = 'खाते नंबर बरोबर नाही (16 अंक). (उदा. 1234567890001234)';
      }
    }

    if(name==='headId' && !value)
    {
      message ='हेड आवश्यक आहे.';
    }

    if (name === 'accounttype' && !value) {
      message = 'खात्याचा प्रकार आवश्यक आहे.';
    }
    if (name === 'branchName') {
      if (!value.trim()) message = 'शाखेचे नाव आवश्यक आहे.';
      else if (value && !isMarathi(value)) message = 'हे क्षेत्र फक्त मराठीत असावे.';
    }
    if (name === 'address') {
      if (!value.trim()) message = 'पत्ता आवश्यक आहे.';
      else if (value && !isMarathi(value)) message = 'हे क्षेत्र फक्त मराठीत असावे.';
    }
    if (name === 'ifscCode') {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!value.trim()) message = 'IFSC कोड आवश्यक आहे.';
      else if (!numberService.validateByPattern(value.toUpperCase(), ifscRegex, 11)) {
        message = 'IFSC कोड बरोबर नाही. (उदा. SBIN0001234)';
      }
      else if (bankList.some(b => b.ifsccode === value.toUpperCase() && (!isEditing || b.id !== formData.id))) {
        message = 'हा IFSC कोड आधीपासून अस्तित्वात आहे.';
      }
    }
    return message;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'ifscCode') {
      processedValue = value.toUpperCase();
    }
    const fieldError = validateField(name, processedValue);
    setErrors({ ...errors, [name]: fieldError });
    setFormData({ ...formData, [name]: processedValue });
    setFormError(null);
    setFormSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    let formIsValid = true;
    const newErrors = {};
    const fieldsToValidate = ['bankName', 'accountNumber', 'accounttype', 'branchName', 'ifscCode', 'address'];

    fieldsToValidate.forEach(field => {
      const message = validateField(field, formData[field]);
      if (message) {
        newErrors[field] = message;
        formIsValid = false;
      }
    });

    setErrors(newErrors);

    if (!formIsValid) {
      showAlert.sweetAlert("त्रुटि!", "कृपया फॉर्ममधील त्रुटी तपासा आणि दुरुस्त करा.", "error");
      return;
    }

    const bankDto = {
      id: formData.id,
      bankname: formData.bankName.trim(),
      accountno: formData.accountNumber.trim(),
      accounttype: formData.accounttype, // This should be the ID
      headId:formData.headId,
      branch: formData.branchName.trim(),
      ifsccode: formData.ifscCode.trim().toUpperCase(),
      address: formData.address.trim(),
      udiseNo
    };

    try {
      setLoading(true);
      if (isEditing) {
        await apiService.put(`bank/${bankDto.id}`, bankDto);
        setFormSuccess("बँक माहिती यशस्वीरित्या अद्ययावत झाली.");
        showAlert.sweetAlert("यशस्वी", "बँक माहिती अद्ययावत झाली.", "success");
      } else {
        const result = await showAlert.confirmBox("माहिती जतन करायची आहे का?");
        if (result.isConfirmed) {
          await apiService.postdata("bank/", bankDto);
          setFormSuccess("बँक माहिती यशस्वीरित्या जतन झाली.");
          showAlert.sweetAlert("यशस्वी", "बँक माहिती जतन झाली.", "success");
        } else {
          setLoading(false);
          return; // User cancelled
        }
      }
      handleClear(); // Clear form and errors
      fetchBanks();   // Refresh the list
    } catch (err) {
      const apiErrorMessage = err.response?.data?.message || err.message;
      setFormError(`त्रुटी: ${apiErrorMessage}`);
      showAlert.sweetAlert("त्रुटि!", `त्रुटी: ${apiErrorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bank) => {
    setIsEditing(true);
    setFormData({
      id: bank.id,
      bankName: bank.bankname || '',
      accountNumber: bank.accountno || '',
      accounttype: bank.accounttype?.accountTypeId || '',
      branchName: bank.branch || '',
      ifscCode: bank.ifsccode || '',
      address: bank.address || ''
    });
    setErrors({}); // Clear previous validation errors
    setFormError(null);
    setFormSuccess(null);
    window.scrollTo(0, 0); // Scroll to top to see the form
  };

  const handleDelete = async (id, name) => {
    const result = await showAlert.confirmBox(`"${name}" बँक हटवायची आहे का?`);
    if (result.isConfirmed) {
      try {
        setLoading(true);
        setFormError(null); setFormSuccess(null); // Clear any form messages
        await apiService.deletedata(`bank/${id}`);
        showAlert.sweetAlert("हटवले", `"${name}" बँक यशस्वीरित्या हटवली गेली.`, "success");
        fetchBanks(); // Refresh list
        if (formData.id === id) { // If deleting the bank currently in form
          handleClear();
        }
      } catch (err) {
        const apiErrorMessage = err.response?.data?.message || err.message;
        setError(`बँक हटवता आली नाही: ${apiErrorMessage}`); // Use general error for list operations
        showAlert.sweetAlert("त्रुटि!", `बँक हटवता आली नाही: ${apiErrorMessage}`, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setErrors({});
    setFormError(null);
    setFormSuccess(null);
  };

  const filteredBankList = bankList.filter(bank =>
    (bank.bankname && bank.bankname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (bank.accountno && bank.accountno.includes(searchTerm)) ||
    (bank.ifsccode && bank.ifsccode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!udiseNo && !error) {
    return (
      <div className="container py-4" style={{ maxWidth: '1000px' }}>
        <div className="alert alert-warning text-center">
          युडीएस क्रमांक लोड होत आहे किंवा उपलब्ध नाही.
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: '1000px' }}>
      <h3 className="text-center mb-4 fw-bold text-primary">बँक मास्टर</h3>

      {/* General Error Display (e.g., for fetch issues) */}
      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
        {error}
        <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
      </div>}

      {/* Form Card */}
      <div className="card shadow-sm mb-4 border-light rounded-3">
        <div className="card-header bg-light py-3">
          <h5 className="mb-0 d-flex align-items-center">
            {isEditing ? (
              <>
                <Edit size={20} className="me-2 text-primary" /> बँक संपादन
              </>
            ) : (
              <>
                <PlusCircle size={20} className="me-2 text-primary" /> नवीन बँक
              </>
            )}
          </h5>
        </div>
        <div className="card-body p-lg-4 p-3">
          {/* Form-specific success/error messages */}
          {formError && <div className="alert alert-danger small py-2">{formError}</div>}
          {formSuccess && <div className="alert alert-success small py-2">{formSuccess}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-5">
                <label htmlFor="bankName" className="form-label fw-medium">बँकेचे नाव{mandatoryFields()}</label>
                <input
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className={`form-control ${errors.bankName ? 'is-invalid' : ''}`}
                  placeholder='उदा. स्टेट बँक ऑफ इंडिया'
                />
                {errors.bankName && <div className="invalid-feedback">{errors.bankName}</div>}
              </div>
              <div className="col-md-4">
                <label htmlFor="accountNumber" className="form-label fw-medium">खाते क्रमांक{mandatoryFields()}</label>
                <input
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className={`form-control ${errors.accountNumber ? 'is-invalid' : ''}`}
                  maxLength="16"
                  placeholder='उदा. 1234567890001234'
                  type="text" // Keep as text to allow leading zeros, validation is manual
                  inputMode="numeric" // Hint for mobile keyboards
                />
                {errors.accountNumber && <div className="invalid-feedback">{errors.accountNumber}</div>}
              </div>
              <div className='col-12 col-md-3'>
                <label htmlFor='headId' className="form-label small fw-bold mb-1">हेड</label>
                <select
                  className={`form-select ${errors.headId ? 'is-invalid' : ''}`}
                  id='headId'
                  name="headId"
                  value={formData.headId}
                  onChange={handleInputChange}
                  disabled={loading || heads.length === 0}
                >
                  <option value="">-- हेड निवडा --</option>
                  {heads.map(head => (
                    <option key={head.headId} value={head.headId}>
                      {head.headName}
                    </option>
                  ))}
                </select>
                {errors.headId && <div className="invalid-feedback small">{errors.headId}</div>}
              </div>
              <div className="col-md-4">
                <label htmlFor="accounttype" className="form-label fw-medium">खात्याचा प्रकार{mandatoryFields()}</label>
                <select
                  id="accounttype"
                  name="accounttype"
                  value={formData.accounttype}
                  onChange={handleInputChange}
                  className={`form-select ${errors.accounttype ? 'is-invalid' : ''}`}
                >
                  <option value="">प्रकार निवडा</option>
                  {Array.isArray(accountType) && accountType.map(type => (
                    <option key={type.accountTypeId} value={type.accountTypeId}>{type.name}</option>
                  ))}
                </select>
                {errors.accounttype && <div className="invalid-feedback d-block">{errors.accounttype}</div>}
              </div>
              <div className="col-md-4">
                <label htmlFor="branchName" className="form-label fw-medium">शाखा{mandatoryFields()}</label>
                <input
                  id="branchName"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  className={`form-control ${errors.branchName ? 'is-invalid' : ''}`}
                  placeholder='उदा. पुणे'
                />
                {errors.branchName && <div className="invalid-feedback">{errors.branchName}</div>}
              </div>
              <div className="col-md-4">
                <label htmlFor="ifscCode" className="form-label fw-medium">IFSC कोड{mandatoryFields()}</label>
                <input
                  id="ifscCode"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  className={`form-control text-uppercase ${errors.ifscCode ? 'is-invalid' : ''}`}
                  maxLength="11"
                  placeholder='उदा. SBIN0001234'
                />
                {errors.ifscCode && <div className="invalid-feedback">{errors.ifscCode}</div>}
              </div>
              <div className="col-md-12"> {/* Changed to full width for address */}
                <label htmlFor="address" className="form-label fw-medium">पत्ता{mandatoryFields()}</label>
                <textarea // Using textarea for address
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                  placeholder='उदा. शिवाजी नगर, पुणे, महाराष्ट्र'
                  rows="2"
                />
                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
              </div>
            </div>
            <div className="d-flex mt-4 pt-3 gap-2 border-top">
              <button type="submit" className="btn btn-primary px-3" disabled={loading}>
                <Save size={18} className="me-2" />
                {loading ? 'जतन करत आहे...' : isEditing ? 'अद्ययावत करा' : 'जतन करा'}
              </button>
              <button type="button" className="btn btn-outline-secondary px-3" onClick={handleClear} disabled={loading}>
                <XCircle size={18} className="me-2" />
                {isEditing ? 'रद्द करा' : 'साफ करा'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bank List Card */}
      <div className="card shadow-sm border-light rounded-3">
        <div className="card-header bg-light py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">नोंदवलेल्या बँका</h5>
          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="शोधा (नाव, खाते क्र., IFSC)"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setError(null); }} // Clear general error on search
            style={{ maxWidth: '280px' }}
          />
        </div>
        <div className="card-body p-0">
          {loading && bankList.length === 0 ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              लोड करत आहे...
            </div>
          ) : !loading && bankList.length === 0 && !error ? (
            <p className="p-4 text-center text-muted mb-0">
              अद्याप कोणतीही बँक नोंदवलेली नाही. कृपया <a href="#bankName" onClick={() => document.getElementById('bankName')?.focus()} className="text-decoration-none">नवीन बँक जोडा</a>.
            </p>
          ) : !loading && filteredBankList.length === 0 && bankList.length > 0 ? (
            <p className="p-4 text-center text-muted mb-0">
              तुमच्या शोधाशी जुळणारी कोणतीही बँक सापडली नाही.
            </p>
          ) : filteredBankList.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover table-striped table-bordered mb-0 align-middle">
                <thead className="table-light small">
                  <tr>
                    <th scope="col">बँकेचे नाव</th>
                    <th scope="col">खाते क्र.</th>
                    <th scope="col">खात्याचा प्रकार</th>
                    <th scope="col">शाखा</th>
                    <th scope="col">IFSC कोड</th>
                    <th scope="col" style={{ minWidth: '150px' }}>पत्ता</th>
                    <th scope="col" className="text-center" style={{ width: '100px' }}>कृती</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {filteredBankList.map((bank) => (
                    <tr key={bank.id}>
                      <td>{bank.bankname}</td>
                      <td>{bank.accountno}</td>
                      <td>{bank.accounttype?.name || <span className="text-muted">N/A</span>}</td>
                      <td>{bank.branch}</td>
                      <td>{bank.ifsccode}</td>
                      <td>{bank.address}</td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-primary border-end-0" // Removed right border for seamless group
                            onClick={() => handleEdit(bank)}
                            title="संपादन करा"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(bank.id, bank.bankname)}
                            title="हटवा"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null /* Fallback for other states, e.g. initial load or error state handled above */}
        </div>
        {bankList.length > 0 && (
          <div className="card-footer text-muted small bg-light border-top py-2">
            {filteredBankList.length === bankList.length ?
              `एकूण ${bankList.length} बँका नोंदवलेल्या आहेत.` :
              `एकूण ${bankList.length} बँकांपैकी ${filteredBankList.length} बँका दाखवल्या आहेत.`
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default BankMasterForm;