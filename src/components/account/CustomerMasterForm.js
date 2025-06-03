// src/components/account/Masters/CustomerMasterForm.js
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Save, XCircle, UserPlus, Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom'; // Link is imported but not used. Consider removing if not planned for use.
import apiService from '../../services/api.service';
import Swal from 'sweetalert2';
import CombinedDropdownInput from '../CombinedDropdownInput';
import { jwtDecode } from 'jwt-decode';
import showAlert from '../../services/alert';

const initialFormData = {
  custName: '',
  customerType: '',
  contactPerson: '',
  custMob1: '',
  custMob2: '',
  email: '',
  schoolUdise: '',
  custAddress: '',
  city: '',
  pinCode: '',
  gstin: '',
  panNo: '',
  headId: '',
  subheadId: ''
  // openingBalance: '', // Fields not in the form currently
  // balanceType: 'Debit', 
  // status: 'Active'
};

const CustomerMasterForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [partyType, setPartyType] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [heads, setHeads] = useState([]);
  const [subHeads, setSubHeads] = useState([]);
  const [filteredSubHead, setFilteredSubHead] = useState([]);
  // const [showMobileTable, setShowMobileTable] = useState(false); // Unused state

  const schoolUdise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

  useEffect(() => {
    fetchCustomers();
    fetchHeads();
    fetchSubHeads();
    if (schoolUdise) {
      setFormData(prev => ({
        ...prev,
        schoolUdise: schoolUdise
      }));
    }
  }, [schoolUdise]); // fetchCustomers will be called if schoolUdise changes, which is rare after init.

  console.log(customers);

  useEffect(() => {
    const fetchCustomerType = async () => {
      setLoading(true);
      try {
        const response = await apiService.getdata("customertype/");
        // console.log(response.data);

        if (response && response.data) {
          setPartyType(response.data || [])
        }
        else {
          setPartyType([{ id: null, customerTypeName: "कोणतीही माहिती मिळाली नाही" }]);
        }
      }
      catch (Error) {
        console.error("Error fetching reasons:", Error);
        Swal.fire('Error', 'Failed to load predefined reasons.', 'error');
      }
      finally {
        setLoading(false);
      }
    }

    fetchCustomerType();
  }, [])

  const fetchHeads = async () => {
    if (!schoolUdise) {
      setHeads([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const heads = await apiService.getdata("headmaster/");
      console.log(heads.data);
      setHeads(heads.data);

    }
    catch (err) {
      setError(`Failed to fetch customers: ${err.message}`);
      setHeads([]);
    }
    finally {
      setLoading(false);
    }
  }

  const fetchSubHeads = async () => {
    if (!schoolUdise) {
      setHeads([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const subHeads = await apiService.getbyid("subheadmaster/getbyudise/", schoolUdise);
      console.log(subHeads.data);
      setSubHeads(subHeads.data);

    }
    catch (err) {
      setError(`Failed to fetch customers: ${err.message}`);
      setSubHeads([]);
    }
    finally {
      setLoading(false);
    }
  }

  const fetchCustomers = async () => {
    if (!schoolUdise) {
      // console.warn("School UDise number not available, cannot fetch customers.");
      // setError("School UDise number not available."); // Optional: inform user
      setCustomers([]); // Ensure customers is empty if no udise
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const customerData = await apiService.getbyid("customermaster/getbyudise/", schoolUdise);
      // console.log(customerData.data);
      setCustomers(customerData.data || []); // Ensure customers is an array
    } catch (err) {
      setError(`Failed to fetch customers: ${err.message}`);
      setCustomers([]); // Ensure customers is an array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.headId) {
      const filteredData = subHeads.filter(s =>
        s.headId && (typeof s.headId === 'object' ?
          s.headId.headId === parseInt(formData.headId) :
          s.headId === parseInt(formData.headId))
      );
      setFilteredSubHead(filteredData);
    } else {
      setFilteredSubHead([]);
      setFormData(prev => ({ ...prev, subheadId: '' }));
    }
  }, [formData.headId, subHeads]);

  // Validation function
  const validateField = (name, value) => {
    const newErrors = {};
    const trimmedValue = typeof value === 'string' ? value.trim() : value; // Value might be number for IDs

    switch (name) {
      case "custName":
        if (!trimmedValue) newErrors.custName = "ग्राहक नाव आवश्यक आहे.";
        else if (!/^[\u0900-\u097F\s.,!?'"-]+$/.test(trimmedValue)) newErrors.custName = "कृपया नाव मराठी भाषेत प्रविष्ट करा.";
        break;
      case "customerType":
        if (!trimmedValue) newErrors.customerType = "ग्राहक प्रकार आवश्यक आहे.";
        else if (!/^[\u0900-\u097F\s.,!?'"-]+$/.test(trimmedValue)) newErrors.customerType = "कृपया ग्राहक प्रकार मराठी भाषेत प्रविष्ट करा.";
        break;
      case "contactPerson":
        if (trimmedValue && !/^[\u0900-\u097F\s.,!?'"-]+$/.test(trimmedValue)) newErrors.contactPerson = "कृपया संपर्क व्यक्ती मराठी भाषेत प्रविष्ट करा.";
        break;
      case "custMob1":
        if (!trimmedValue) newErrors.custMob1 = "मोबाईल नंबर आवश्यक आहे.";
        else if (!/^[0-9]{10}$/.test(trimmedValue)) newErrors.custMob1 = "कृपया 10-अंकी इंग्रजी मोबाईल नंबर प्रविष्ट करा.";
        else if (!/^[6-9]\d{9}$/.test(trimmedValue)) newErrors.custMob1 = "कृपया 10 अंकांचा वैध मोबाईल नंबर प्रविष्ट करा (6,7,8,9 ने सुरू होणारा).";
        else if (customers.some(cust => cust.custMob1 && cust.custMob1.trim() === trimmedValue && (isEditing ? cust.custId !== formData.custId : true))) newErrors.custMob1 = "हा मोबाईल नंबर आधीपासून अस्तित्वात आहे.";
        break;
      case "custMob2":
        if (trimmedValue) {
          if (!/^[0-9]{10}$/.test(trimmedValue)) newErrors.custMob2 = "कृपया 10-अंकी इंग्रजी मोबाईल नंबर प्रविष्ट करा.";
          else if (!/^[6-9]\d{9}$/.test(trimmedValue)) newErrors.custMob2 = "कृपया 10 अंकांचा वैध मोबाईल नंबर प्रविष्ट करा (6,7,8,9 ने सुरू होणारा).";
          else if (customers.some(cust => cust.custMob2 && cust.custMob2.trim() === trimmedValue && (isEditing ? cust.custId !== formData.custId : true))) newErrors.custMob2 = "हा मोबाईल नंबर आधीपासून अस्तित्वात आहे.";
        }
        break;
      case "email":
        if (trimmedValue) {
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedValue)) newErrors.email = "कृपया वैध ईमेल प्रविष्ट करा.";
          else if (customers.some(cust => cust.email && cust.email.trim().toLowerCase() === trimmedValue.toLowerCase() && (isEditing ? cust.custId !== formData.custId : true))) newErrors.email = "हा ईमेल आधीपासून अस्तित्वात आहे.";
        }
        break;
      case "custAddress":
        if (trimmedValue && !/^[\u0900-\u097F0-9\s.,!?'"/-]+$/.test(trimmedValue)) newErrors.custAddress = "कृपया पत्ता मराठी भाषेत प्रविष्ट करा.";
        break;
      case "pinCode":
        if (trimmedValue && !/^\d{6}$/.test(trimmedValue)) newErrors.pinCode = "कृपया 6 अंकांचा पिनकोड प्रविष्ट करा.";
        break;
      case "gstin":
        if (trimmedValue) {
          const upperGstin = trimmedValue.toUpperCase();
          if (!/^[0-9A-Z]{15}$/.test(upperGstin)) newErrors.gstin = "कृपया 15-अक्षरी GSTIN प्रविष्ट करा.";
          else if (customers.some(cust => cust.gstin && cust.gstin.trim().toUpperCase() === upperGstin && (isEditing ? cust.custId !== formData.custId : true))) newErrors.gstin = "हा GSTIN आधीपासून अस्तित्वात आहे.";
        }
        break;
      case "panNo":
        if (trimmedValue) {
          const upperPan = trimmedValue.toUpperCase();
          if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(upperPan)) newErrors.panNo = "कृपया वैध PAN प्रविष्ट करा (उदा. ABCDE1234F).";
          else if (customers.some(cust => cust.panNo && cust.panNo.trim().toUpperCase() === upperPan && (isEditing ? cust.custId !== formData.custId : true))) newErrors.panNo = "हा पॅन नंबर आधीपासून अस्तित्वात आहे.";
        }
        break;
      case "headId":
        if (!value) newErrors.headId = "कृपया हेड निवडा"; // Value here is the ID (number or string)
        break;
      // case "subheadId":
      //   // Subhead is only required if a head is selected.
      //   // If head is not selected, subhead cannot be selected, so it shouldn't be an error yet.
      //   // This validation will be triggered when headId *is* selected.
      //   if (formData.headId && !value) newErrors.subheadId = "कृपया सबहेड निवडा";
      //   break;
      default: break;
    }
    return newErrors;
  };

  const handleInputChange = (eOrId, val) => {
    let name, value;

    if (typeof eOrId === 'string') {
      name = eOrId;
      value = val;
    } else {
      name = eOrId.target.name;
      value = eOrId.target.value;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    const fieldErrors = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldErrors[name] || null })); // Clear error if valid, or set new
    setError(null);
    setSuccess(null);
  };

  const validateAllFields = () => {
    const allErrors = {};
    Object.keys(initialFormData).forEach(fieldName => { // Validate against initialFormData keys to cover all
      const fieldErrors = validateField(fieldName, formData[fieldName]);
      if (Object.keys(fieldErrors).length > 0) {
        Object.assign(allErrors, fieldErrors);
      }
    });
    return allErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateAllFields();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError("कृपया सर्व आवश्यक फील्ड योग्यरित्या भरा आणि त्रुटी दुरुस्त करा.");
      return;
    }

    if (!formData.custName || !formData.custMob1 || !formData.customerType) {
      setError("ग्राहक नाव, मोबाईल नंबर आणि ग्राहक प्रकार आवश्यक आहेत.");
      // Set errors for these fields if not already set by validateAllFields
      setErrors(prev => ({
        ...prev,
        custName: prev.custName || (!formData.custName ? "ग्राहक नाव आवश्यक आहे." : null),
        custMob1: prev.custMob1 || (!formData.custMob1 ? "मोबाईल नंबर आवश्यक आहे." : null),
        customerType: prev.customerType || (!formData.customerType ? "ग्राहक प्रकार आवश्यक आहे." : null),
      }));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const trimmedCustomerType = formData.customerType.trim();
      let selectedPartyTypeId = null;

      const existingType = partyType.find(
        type =>
          type.customerTypeName &&
          type.customerTypeName.toLowerCase() === trimmedCustomerType.toLowerCase()
      );

      if (existingType) {
        selectedPartyTypeId = existingType.id;
      } else {
        const payload = { customerTypeName: trimmedCustomerType };
        const customerTypeResponse = await apiService.post("customertype/", payload);
        // console.log("New customer type added:", customerTypeResponse);
        selectedPartyTypeId = customerTypeResponse.data.id;
        // Fetch updated party types to include the new one in dropdown
        const updatedPartyTypes = await apiService.getdata("customertype/");
        if (updatedPartyTypes && updatedPartyTypes.data) {
          setPartyType(updatedPartyTypes.data);
        }
      }

      const customerPayload = {
        custId: isEditing ? formData.custId : 0,
        custName: formData.custName,
        custAddress: formData.custAddress,
        contactPerson: formData.contactPerson,
        email: formData.email || null,
        custMob1: formData.custMob1,
        custMob2: formData.custMob2,
        crAmt: 0,
        drAmt: 0,
        custTypeID: selectedPartyTypeId,
        schoolUdise: formData.schoolUdise?.udiseNo || schoolUdise,
        status: "Active",
        pinCode: formData.pinCode ? parseInt(formData.pinCode) : 0,
        gstin: formData.gstin || null,
        panNo: formData.panNo || null,
        headId: formData.headId,
        subheadId: formData.subheadId
      };

      // console.log("Customer Payload:", customerPayload);
      console.log(customerPayload);


      let response;
      if (isEditing && formData.custId) {
        response = await apiService.put(`customermaster/${formData.custId}`, customerPayload);
        setSuccess(`ग्राहक "${formData.custName}" यशस्वीरित्या अपडेट झाला!`);
        showAlert.sweetAlert(`ग्राहक "${formData.custName}" यशस्वीरित्या अपडेट झाला!`, "success");


      } else {
        response = await apiService.post("customermaster/", customerPayload);
        setSuccess(`ग्राहक "${formData.custName}" यशस्वीरित्या जतन झाला!`);
        showAlert.sweetAlert(`ग्राहक "${formData.custName}" यशस्वीरित्या जतन झाला!`, "success");

      }

      console.log("Customer saved/updated:", response);
      handleClear(); // Clears form and resets editing state
      fetchCustomers(); // Refresh customer list

    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMsg = err.response?.data?.message || err.message;
      setError(`कार्य अयशस्वी झाले: ${errorMsg}`);
      if (err.response?.data?.errors) { // If backend sends specific field errors
        setErrors(prev => ({ ...prev, ...err.response.data.errors }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setIsEditing(true);
    setFormData(prevFormData => ({
      ...initialFormData, // Start with all form fields having their initial default values (like '')
      schoolUdise: prevFormData.schoolUdise,
      custName: customer.custName || '',
      customerType: customer.custTypeID?.customerTypeName || '', // Already good
      contactPerson: customer.contactPerson || '',
      custMob1: customer.custMob1 || '',
      custMob2: customer.custMob2 || '',
      email: customer.email || '',
      custAddress: customer.custAddress || '',
      pinCode: customer.pinCode ? String(customer.pinCode) : '', // Already good
      gstin: customer.gstin || '',
      panNo: customer.panNo || '',
      headId: customer.headId?.headId || customer.headId || '',
      subheadId: customer.subheadId?.subheadId || customer.subheadId || '',

      // Don't forget to set fields required for logic, like custId
      custId: customer.custId,
    }));
    if (customer.headId?.headId || customer.headId) {
      const headIdValue = customer.headId?.headId || customer.headId;
      const filteredData = subHeads.filter(s =>
        s.headId && s.headId.headId === parseInt(headIdValue)
      );
      setFilteredSubHead(filteredData);
    }
    setError(null);
    setSuccess(null);
    setErrors({});
    window.scrollTo(0, 0);
  };

  // const handleDelete = async (customerId, customerName) => {
  //   const result = await Swal.fire({
  //     title: 'तुम्ही नक्की आहात का?',
  //     text: `ग्राहक "${customerName}" हटवायचा आहे का? हे लिंक केलेल्या व्यवहारांवर परिणाम करू शकते.`,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#d33',
  //     cancelButtonColor: '#3085d6',
  //     confirmButtonText: 'होय, हटवा!',
  //     cancelButtonText: 'रद्द करा'
  //   });

  //   if (result.isConfirmed) {
  //     setLoading(true);
  //     setError(null);
  //     setSuccess(null);
  //     try {
  //       // Assuming your API uses customerId directly, not customer.id
  //       await apiService.delete(`customermaster/${customerId}/`);
  //       setSuccess(`ग्राहक "${customerName}" यशस्वीरित्या हटवला!`);
  //       fetchCustomers(); // Refresh list
  //       Swal.fire('हटवले!', 'ग्राहक हटवण्यात आला आहे.', 'success');
  //     } catch (err) {
  //       setError(`ग्राहक हटवण्यात अयशस्वी: ${err.message}`);
  //       Swal.fire('त्रुटी!', 'ग्राहक हटवण्यात अयशस्वी.', 'error');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };

  const handleClear = () => {
    setFormData({ ...initialFormData, schoolUdise: schoolUdise }); // Preserve schoolUdise
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    setErrors({});
  };

  const filteredCustomerList = (customers || []).filter(cust => // Ensure customers is an array
    (cust.custName && cust.custName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cust.custMob1 && cust.custMob1.includes(searchTerm)) ||
    (cust.email && cust.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const partyTypeOptions = partyType.map(type => type.customerTypeName).filter(Boolean);

  // const MobileCustomerCard = ({ customer }) => (
  //   <div className="card mobile-customer-card mb-2 border-0 shadow-sm rounded-3">
  //     <div className="card-body p-3">
  //       <div className="d-flex justify-content-between align-items-start mb-2">
  //         <h6 className="card-title mb-1 text-primary fw-bold">{customer.custName}</h6>
  //         <div className="btn-group btn-group-sm">
  //           <button
  //             className="btn btn-outline-primary btn-sm"
  //             onClick={() => handleEdit(customer)}
  //             title="संपादित करा"
  //           >
  //             <Edit size={12} />
  //           </button>
  //         </div>
  //       </div>
  //       <div className="row g-2 small text-muted">
  //         <div className="col-6">
  //           <strong>प्रकार:</strong> {customer.custTypeID?.customerTypeName || '-'}
  //         </div>
  //         <div className="col-6">
  //           <strong>मोबाईल:</strong> {customer.custMob1}
  //         </div>
  //         {customer.email && (
  //           <div className="col-12">
  //             <strong>ईमेल:</strong> {customer.email}
  //           </div>
  //         )}
  //         {customer.gstin && (
  //           <div className="col-12">
  //             <strong>GSTIN:</strong> {customer.gstin}
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="container-fluid py-3 px-2 px-md-3">
      <div className="row mb-3 mb-md-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between p-3 p-md-4 rounded-3"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)'
            }}>
            <div className="d-flex align-items-center">
              <div className="me-2 me-md-3 p-2 p-md-3 rounded-circle bg-white bg-opacity-20">
                <UserPlus size={24} className="text-dark d-md-none" />
                <UserPlus size={32} className="text-dark d-none d-md-inline" />
              </div>
              <div>
                <h2 className="mb-1 text-white fw-bold fs-md-4" style={{
                  fontFamily: '"Noto Serif Devanagari", serif',
                  fontOpticalSizing: 'auto',
                  fontStyle: 'normal',
                }}>
                  ग्राहक नोंद व्यवस्थापन
                </h2>
              </div>
            </div>
            <div className="text-end">
              <div className="bg-white bg-opacity-20 rounded-pill px-2 px-md-3 py-1 py-md-2">
                <small className="text-dark">
                  <strong className="d-none d-sm-inline">एकूण ग्राहक: </strong>
                  <span className="d-sm-none">{customers.length}</span>
                  <span className="d-none d-sm-inline">{customers.length}</span>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card mb-3 mb-md-4 shadow-sm rounded-3">
        <div className="card-header bg-primary text-white p-3">
          <h5 className="mb-0 fs-6 fs-md-5">
            {isEditing ? 'ग्राहक माहिती संपादित करा' :
              <>
                <UserPlus size={16} className="me-2 d-none d-md-inline" />
                नवीन ग्राहक नोंद करा
              </>}
          </h5>
        </div>
        <div className="card-body p-3">
          <form onSubmit={handleSubmit}>
            <div className="row g-2 g-md-3 mb-3">
              <div className="col-12 col-md-5">
                <label htmlFor="custName" className="form-label small fw-bold mb-1">ग्राहक नाव *</label>
                <input
                  type="text"
                  id="custName"
                  name="custName"
                  className={`form-control form-control-sm ${errors.custName ? 'is-invalid' : ''}`}
                  value={formData.custName}
                  onChange={handleInputChange}
                  placeholder="कृपया पूर्ण नाव भरा"
                  required
                />
                {errors.custName && <div className="invalid-feedback small">{errors.custName}</div>}
              </div>
              <div className="col-12 col-md-3">
                <CombinedDropdownInput
                  id="customerType"
                  label="ग्राहक प्रकार" // Label handled externally now
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  required={true}
                  options={partyTypeOptions}
                  classNameTarget={`form-control-sm ${errors.customerType ? 'is-invalid' : ''}`} // Pass class to underlying input
                  placeholder="ग्राहक प्रकार निवडा/टाईप करा"
                />
                {errors.customerType && <div className="text-danger small mt-1">{errors.customerType}</div>} {/* Custom error display for CombinedDropdownInput */}
              </div>
              <div className="col-12 col-md-4">
                <label htmlFor="contactPerson" className="form-label small fw-bold mb-1">संपर्क व्यक्ती</label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  className={`form-control form-control-sm ${errors.contactPerson ? 'is-invalid' : ''}`}
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="उदा., खाते विभाग"
                />
                {errors.contactPerson && <div className="invalid-feedback small">{errors.contactPerson}</div>}
              </div>
            </div>

            <div className="row g-2 g-md-3 mb-3">
              <div className="col-12 col-md-4">
                <label htmlFor="custMob1" className="form-label small fw-bold mb-1">मोबाईल नंबर 1 *</label>
                <input
                  type="tel"
                  id="custMob1"
                  name="custMob1"
                  className={`form-control form-control-sm ${errors.custMob1 ? 'is-invalid' : ''}`}
                  value={formData.custMob1}
                  onChange={handleInputChange}
                  placeholder="कृपया मोबाईल नंबर भरा"
                  required
                  maxLength="10"
                />
                {errors.custMob1 && <div className="invalid-feedback small">{errors.custMob1}</div>}
              </div>
              <div className="col-12 col-md-4">
                <label htmlFor="custMob2" className="form-label small fw-bold mb-1">मोबाईल नंबर 2</label>
                <input
                  type="tel"
                  id="custMob2"
                  name="custMob2"
                  className={`form-control form-control-sm ${errors.custMob2 ? 'is-invalid' : ''}`}
                  value={formData.custMob2}
                  onChange={handleInputChange}
                  placeholder="कृपया मोबाईल नंबर भरा"
                  maxLength="10"
                />
                {errors.custMob2 && <div className="invalid-feedback small">{errors.custMob2}</div>}
              </div>
              <div className="col-12 col-md-4">
                <label htmlFor="email" className="form-label small fw-bold mb-1">ई-मेल</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="कृपया ईमेल भरा"
                />
                {errors.email && <div className="invalid-feedback small">{errors.email}</div>}
              </div>
            </div>

            <div className="row g-2 g-md-3 mb-3">
              <div className="col-12">
                <label htmlFor="custAddress" className="form-label small fw-bold mb-1">पूर्ण पत्ता</label>
                <textarea
                  id="custAddress"
                  name="custAddress"
                  className={`form-control form-control-sm ${errors.custAddress ? 'is-invalid' : ''}`}
                  rows="2"
                  value={formData.custAddress}
                  onChange={handleInputChange}
                  placeholder="कृपया पूर्ण पत्ता भरा"
                ></textarea>
                {errors.custAddress && <div className="invalid-feedback small">{errors.custAddress}</div>}
              </div>
            </div>

            <div className='row g-2 g-md-3 mb-3'>
              <div className='col-12 col-md-6'>
                <label htmlFor='headId' className="form-label small fw-bold mb-1">हेड</label>
                <select
                  className={`form-select form-select-sm ${errors.headId ? 'is-invalid' : ''}`}
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
                      {head.headName}
                    </option>
                  ))}
                </select>
                {errors.headId && <div className="invalid-feedback small">{errors.headId}</div>}
              </div>

              {/* <div className='col-12 col-md-6'>
                <label htmlFor='subheadId' className="form-label small fw-bold mb-1">सबहेड</label>
                <select
                  className={`form-select form-select-sm ${errors.subheadId ? 'is-invalid' : ''}`}
                  id='subheadId'
                  name="subheadId"
                  value={formData.subheadId}
                  onChange={handleInputChange}
                  disabled={!formData.headId || loading}
                >
                  <option value="">-- सबहेड निवडा --</option>
                  {filteredSubHead.map(subhead => (
                    <option key={subhead.subheadId} value={subhead.subheadId}>
                      {subhead.subheadName}
                    </option>
                  ))}
                </select>
                {errors.subheadId && <div className="invalid-feedback small">{errors.subheadId}</div>}
              </div> */}
            </div>

            <div className="row g-2 g-md-3 mb-3">
              <div className="col-6 col-md-2">
                <label htmlFor="pinCode" className="form-label small fw-bold mb-1">पिनकोड</label>
                <input
                  type="text"
                  id="pinCode"
                  name="pinCode"
                  className={`form-control form-control-sm ${errors.pinCode ? 'is-invalid' : ''}`}
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  placeholder="उदा. 110001"
                  maxLength="6"
                />
                {errors.pinCode && <div className="invalid-feedback small">{errors.pinCode}</div>}
              </div>
              <div className="col-12 col-md-5">
                <label htmlFor="gstin" className="form-label small fw-bold mb-1">GSTIN (जर लागू असेल तर)</label>
                <input
                  type="text"
                  id="gstin"
                  name="gstin"
                  className={`form-control form-control-sm text-uppercase ${errors.gstin ? 'is-invalid' : ''}`}
                  value={formData.gstin}
                  onChange={handleInputChange}
                  placeholder="15-अंकी GSTIN"
                  maxLength="15"
                />
                {errors.gstin && <div className="invalid-feedback small">{errors.gstin}</div>}
              </div>
              <div className="col-12 col-md-5">
                <label htmlFor="panNo" className="form-label small fw-bold mb-1">PAN No. (जर लागू असेल तर)</label>
                <input
                  type="text"
                  id="panNo"
                  name="panNo"
                  className={`form-control form-control-sm text-uppercase ${errors.panNo ? 'is-invalid' : ''}`}
                  value={formData.panNo}
                  onChange={handleInputChange}
                  placeholder="10-अंकी PAN"
                  maxLength="10"
                />
                {errors.panNo && <div className="invalid-feedback small">{errors.panNo}</div>}
              </div>
            </div>

            <div className="d-flex flex-column flex-md-row gap-2">
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                <Save size={14} className="me-1" />
                {loading ? (isEditing ? 'अपडेट करत आहे...' : 'जतन करत आहे...') : (isEditing ? 'ग्राहक अपडेट करा' : 'ग्राहक जतन करा')}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleClear} disabled={loading}>
                <XCircle size={14} className="me-1" />
                {isEditing ? 'संपादन रद्द करा' : 'फॉर्म साफ करा'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm rounded-3">
        <div className="card-header bg-light p-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
            <h5 className="mb-0 fs-6 fs-md-5">विद्यमान ग्राहक</h5>
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="नाव, मोबाईल, ईमेल द्वारे शोधा..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-secondary btn-sm" type="button">
                <SearchIcon size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-2 p-md-3">
          {loading && customers.length === 0 && !error ? ( // Show loading only if no error and initial load
            <div className="text-center p-3">
              <div className="spinner-border spinner-border-sm text-primary me-2"></div> लोड करत आहे...
            </div>
          ) : filteredCustomerList.length === 0 ? (
            <p className="p-3 text-center text-muted">
              {searchTerm ? `"${searchTerm}" साठी कोणताही ग्राहक आढळला नाही.` : 'कोणतेही ग्राहक आढळले नाहीत. कृपया नवीन ग्राहक जोडा.'}
            </p>
          ) : (
            <>
              <div className="">
                <div className="table-responsive">
                  <table className="table table-hover table-striped mb-0 small">
                    <thead>
                      <tr>
                        <th>ग्राहक नाव</th>
                        <th>प्रकार</th>
                        <th>मोबाईल नं.</th>
                        <th>ईमेल</th>
                        <th>GSTIN</th>
                        <th>क्रिया</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomerList.map(cust => (
                        <tr key={cust.custId}>
                          <td>{cust.custName}</td>
                          <td>{cust.custTypeID?.customerTypeName || '-'}</td>
                          <td>{cust.custMob1}</td>
                          <td>{cust.email || '-'}</td>
                          <td>{cust.gstin || '-'}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary" onClick={() => handleEdit(cust)} title="संपादित करा">
                                <Edit size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
        {filteredCustomerList.length > 0 && (
          <div className="card-footer text-muted small text-center text-md-start py-2 px-3">
            {customers.length} पैकी {filteredCustomerList.length} ग्राहक दाखवत आहे.
          </div>
        )}
      </div>


    </div>
  );
};

export default CustomerMasterForm;