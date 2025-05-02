import React, { useEffect, useState, useCallback } from 'react';
import apiService from '../services/api.service';
import { AiOutlineMobile } from 'react-icons/ai'; // Unused, but kept if needed elsewhere
import { BiUpload, BiPhone, BiInfoCircle, BiGlobeAlt, BiMap, BiListUl, BiMobile, BiImageAdd, BiIdCard } from 'react-icons/bi';
import '../styling/formstyle.css';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import Next from './Next';


// --- Helper Function to check if form data is complete ---
// Customize this based on which fields *absolutely* must be filled
// to consider the profile complete and hide the form.
const isSchoolDataComplete = (data) => {
  if (!data) return false;
  return ![
    data.schoolSlogan,
    data.state, // Check the object itself, not just the name
    data.district,
    data.tehsil,
    data.village,
    data.pinCode, // Check the correct property name from API
    data.medium,
    data.headMasterMobileNo,
    data.board,
    data.boardDivision,
    data.boardIndexNo,
    data.schoolApprovalNo,
    // data.logo // Logo might be optional for completion? Decide this.
    // If logo *must* exist to hide the form, uncomment the line above.
  ].some(value => value === null || value === undefined || value === ''); // Check for null, undefined, or empty string
};

function AddSchoolInfo() {
  // --- State Declarations ---
  const [udiseNo, setUdiseNo] = useState(null);
  const [schoolData, setSchoolData] = useState(null); // Store the fetched school data object
  const [isShowsForm, setIsShowsForm] = useState(true); // Default to showing form until data is checked
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [errorFetching, setErrorFetching] = useState(null); // Error state

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [villages, setVillages] = useState([]);

  const [filterdistrict, setFilterDistrict] = useState([]);
  const [filteredTehsils, setFilteredTehsils] = useState([]);
  const [filteredVillages, setFilteredVillages] = useState([]);

  const [formData, setFormData] = useState({
    schoolName: '',
    schoolSlogan: '',
    sansthaName: '',
    state: '', // Store IDs for selects
    district: '',
    tehsil: '',
    village: '',
    pincode: '', // Keep as pincode for form, map to pinCode on submit
    medium: '',
    headMasterMobileNo: '',
    board: '',
    boardDivision: '',
    boardIndexNo: '',
    schoolApprovalNo: '',
    logo: null, // Store the File object
    password: '',
  });
  const [errors, setErrors] = useState({});

  // --- Decode Token ---
  useEffect(() => {
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setUdiseNo(decoded?.udiseNo);
      } else {
        setErrorFetching("Token not found in session storage.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      setErrorFetching("Invalid token.");
      setIsLoading(false);
    }
  }, []);

  // --- Fetch Initial School Data and Dropdown Data ---
  useEffect(() => {
    if (!udiseNo) return; // Don't fetch if udiseNo is not yet set

    setIsLoading(true);
    setErrorFetching(null);

    const fetchSchoolData = apiService.getbyid("school/", udiseNo);
    const fetchStates = apiService.getdata('state/');
    const fetchDistricts = apiService.getdata('district/');
    const fetchTehsils = apiService.getdata('tehsil/');
    const fetchVillages = apiService.getdata('village/');

    Promise.all([fetchSchoolData, fetchStates, fetchDistricts, fetchTehsils, fetchVillages])
      .then(([schoolResponse, statesResponse, districtsResponse, tehsilsResponse, villagesResponse]) => {
        const fetchedSchoolData = schoolResponse.data;
        setSchoolData(fetchedSchoolData); // Store raw fetched data

        // Set dropdown options
        setStates(statesResponse.data);
        setDistricts(districtsResponse.data);
        setTehsils(tehsilsResponse.data);
        setVillages(villagesResponse.data);

        // Decide whether to show the form
        const isComplete = isSchoolDataComplete(fetchedSchoolData);
        setIsShowsForm(!isComplete);

        // Populate formData with existing data IF the form is shown or for initial values
        // Use || '' to avoid null/undefined values in controlled inputs
        setFormData(prev => ({
          ...prev, // Keep existing state (like logo if user selected one before fetch finished)
          schoolName: fetchedSchoolData?.schoolName || '',
          schoolSlogan: fetchedSchoolData?.schoolSlogan || '',
          sansthaName: fetchedSchoolData?.sansthaName || '',
          state: fetchedSchoolData?.state?.id || '', // Use ID for select
          district: fetchedSchoolData?.district?.id || '',
          tehsil: fetchedSchoolData?.tehsil?.id || '',
          village: fetchedSchoolData?.village?.id || '',
          pincode: fetchedSchoolData?.pinCode || '', // Use pinCode from API
          medium: fetchedSchoolData?.medium || '',
          headMasterMobileNo: fetchedSchoolData?.headMasterMobileNo || '',
          board: fetchedSchoolData?.board || '',
          boardDivision: fetchedSchoolData?.boardDivision || '',
          boardIndexNo: fetchedSchoolData?.boardIndexNo || '',
          schoolApprovalNo: fetchedSchoolData?.schoolApprovalNo || '',
          headMasterPassword: fetchedSchoolData.headMasterPassword || ''
          // Don't reset logo here if already selected by user
        }));

        // Trigger initial filtering if data exists
        if (fetchedSchoolData?.state?.id) {
          const filteredD = districtsResponse.data.filter(d => d.state.id === fetchedSchoolData.state.id);
          setFilterDistrict(filteredD);
        }
        if (fetchedSchoolData?.district?.id) {
          const filteredT = tehsilsResponse.data.filter(t => t.district.id === fetchedSchoolData.district.id);
          setFilteredTehsils(filteredT);
        }
        if (fetchedSchoolData?.tehsil?.id) {
          const filteredV = villagesResponse.data.filter(v => v.tehsil.id === fetchedSchoolData.tehsil.id);
          setFilteredVillages(filteredV);
        }


      })
      .catch(err => {
        console.error("Error fetching initial data:", err);
        setErrorFetching("Failed to load school or location data.");
        // Decide how to handle: show form anyway? Show error message?
        // setIsShowsForm(true); // Maybe force form show on error?
      })
      .finally(() => {
        setIsLoading(false);
      });

  }, [udiseNo]); // Re-run only if udiseNo changes

  // --- Handle Cascading Dropdowns ---
  useEffect(() => {
    if (formData.state) {
      const filtered = districts.filter(d => d.state.id === parseInt(formData.state));
      setFilterDistrict(filtered);
      // Reset lower dropdowns if state changes
      if (formData.district) setFormData(prev => ({ ...prev, district: '', tehsil: '', village: '' }));
      setFilteredTehsils([]);
      setFilteredVillages([]);
    } else {
      setFilterDistrict([]);
    }
  }, [formData.state, districts]); // Removed formData.district dependency here

  useEffect(() => {
    if (formData.district) {
      const filtered = tehsils.filter(t => t.district.id === parseInt(formData.district));
      setFilteredTehsils(filtered);
      // Reset lower dropdowns if district changes
      if (formData.tehsil) setFormData(prev => ({ ...prev, tehsil: '', village: '' }));
      setFilteredVillages([]);
    } else {
      setFilteredTehsils([]);
    }
  }, [formData.district, tehsils]); // Removed formData.tehsil dependency here

  useEffect(() => {
    if (formData.tehsil) {
      const filtered = villages.filter(v => v.tehsil.id === parseInt(formData.tehsil));
      setFilteredVillages(filtered);
      // Reset lower dropdowns if tehsil changes
      if (formData.village) setFormData(prev => ({ ...prev, village: '' }));
    } else {
      setFilteredVillages([]);
    }
  }, [formData.tehsil, villages]); // Removed formData.village dependency here


  // --- Handle Form Input Change ---
  const handleChange = useCallback((e) => {
    const { id, value, type, files } = e.target;
    let newValue = value;
    let fieldErrors = { ...errors };

    // Clear the specific field error when user starts typing/changing
    if (fieldErrors[id]) {
      delete fieldErrors[id];
    }

    // --- Input Specific Validation/Formatting ---
    if (id === 'headMasterMobileNo') {
      const numericValue = value.replace(/[^0-9]/g, '');
      newValue = numericValue.slice(0, 10); // Limit to 10 digits

      // Add validation message immediately if invalid pattern starts
      if (newValue.length > 0 && !/^[6-9]/.test(newValue)) {
        fieldErrors.headMasterMobileNo = 'मोबाईल नंबर ६, ७, ८ किंवा ९ पासून सुरू व्हावा';
      } else if (newValue.length > 0 && newValue.length < 10) {
        fieldErrors.headMasterMobileNo = 'मोबाईल नंबर १० अंकी असावा';
      }
      // The final validation happens in validateForm
    }
    else if (id === 'pincode') {
      const numericValue = value.replace(/[^0-9]/g, '');
      newValue = numericValue.slice(0, 6); // Limit to 6 digits

      if (newValue.length > 0 && newValue.length < 6) {
        fieldErrors.pincode = 'पिनकोड ६ अंकी असावा';
      }
    }

    setErrors(fieldErrors); // Update errors immediately for feedback

    if (type === 'file') {
      setFormData(prev => ({ ...prev, [id]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [id]: newValue }));
    }
  }, [errors]); // Include errors in dependency array for clearing logic


  // --- Validate Form ---
  const validateForm = () => {
    const newErrors = {};
    const data = formData; // Use current formData state

    // Basic Information
    if (!data.schoolSlogan?.trim()) newErrors.schoolSlogan = 'शाळेची घोषणा प्रविष्ट करणे आवश्यक आहे';
    if (!data.medium?.trim()) newErrors.medium = 'माध्यम प्रविष्ट करणे आवश्यक आहे';

    // Location Information
    if (!data.state) newErrors.state = 'राज्य निवडणे आवश्यक आहे';
    if (!data.district) newErrors.district = 'जिल्हा निवडणे आवश्यक आहे';
    if (!data.tehsil) newErrors.tehsil = 'तालुका निवडणे आवश्यक आहे';
    if (!data.village) newErrors.village = 'गाव निवडणे आवश्यक आहे';
    if (!data.pincode) {
      newErrors.pincode = 'पिनकोड प्रविष्ट करणे आवश्यक आहे';
    } else if (data.pincode.length !== 6) {
      newErrors.pincode = 'पिनकोड ६ अंकी असावा';
    }

    // Board Information
    if (!data.board?.trim()) newErrors.board = 'बोर्ड प्रविष्ट करणे आवश्यक आहे';
    if (!data.boardDivision?.trim()) newErrors.boardDivision = 'बोर्डविभाग प्रविष्ट करणे आवश्यक आहे';
    if (!data.boardIndexNo?.trim()) newErrors.boardIndexNo = 'बोर्ड निर्देशांक क्र प्रविष्ट करणे आवश्यक आहे';
    if (!data.schoolApprovalNo?.trim()) newErrors.schoolApprovalNo = 'शाळेची मान्यता क्रमांक प्रविष्ट करणे आवश्यक आहे';

    // Contact Information
    if (!data.headMasterMobileNo) {
      newErrors.headMasterMobileNo = 'मुख्यध्यापकांचा मोबाईल नंबर प्रविष्ट करणे आवश्यक आहे';
    } else if (data.headMasterMobileNo.length !== 10) {
      newErrors.headMasterMobileNo = 'मोबाईल नंबर १० अंकी असावा';
    } else if (!/^[6-9]/.test(data.headMasterMobileNo)) {
      newErrors.headMasterMobileNo = 'मोबाईल नंबर ६, ७, ८ किंवा ९ पासून सुरू व्हावा';
    }

    // Logo (Optional? Decide if validation is needed)
    // if (!data.logo && !schoolData?.logo) { // Example: Required if no logo exists yet
    //   newErrors.logo = 'शाळेचे लोगो अपलोड करणे आवश्यक आहे';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // --- Handle Form Submission ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true); // Show loading indicator during submission
      const submissionData = new FormData(); // Use FormData for file upload

      const schoolDto = {
        udiseNo: udiseNo,
        schoolName: formData.schoolName, // Include read-only fields if backend expects them
        schoolSlogan: formData.schoolSlogan,
        sansthaName: formData.sansthaName, // Include read-only fields if backend expects them
        medium: formData.medium,
        state: formData.state, // Send object if backend expects it
        district: formData.district,
        tehsil: formData.tehsil,
        village: formData.village,
        pinCode: formData.pincode, // Map form 'pincode' to 'pinCode' for DTO
        board: formData.board,
        boardDivision: formData.boardDivision,
        boardIndexNo: formData.boardIndexNo,
        schoolApprovalNo: formData.schoolApprovalNo,
        headMasterMobileNo: formData.headMasterMobileNo,
        headMasterPassword: formData.password,
       
      };
      // Append the JSON string of schoolDto
      submissionData.append('schoolDto', JSON.stringify(schoolDto));

      // Append the file *only* if a new one was selected
      if (formData.logo instanceof File) {
        submissionData.append('logo', formData.logo);
      }

      console.log(formData);

      apiService
        .put(`school/${udiseNo}`, submissionData)
        .then((response) => {
          // alert('School info saved successfully!');
          setSchoolData(response.data);
          setIsShowsForm(true);
          const isComplete = isSchoolDataComplete(response.data);
          setIsShowsForm(!isComplete);
          Swal.fire({
            title: "शाळेची माहिती यशस्वीरीत्या संपादित केली आहे ..!",
            icon: "success",
            draggable: true
          });
        })
        .catch((err) => {
          console.error('Error submitting form:', err);
          // Display more specific error if possible (e.g., from err.response.data)
          alert('Error saving school info. Please check console for details.');
        })
        .finally(() => {
          setIsLoading(false); // Hide loading indicator
        });
    } else {
      console.log("Validation Errors:", errors);
      alert("कृपया फॉर्ममधील त्रुटी तपासा."); // Please check errors in the form.
    }
  };

  // --- Render Logic ---
  if (isLoading && !schoolData) { // Show loading only on initial load
    return <div className="container py-5 text-center"><h4><i className="bi bi-hourglass-split me-2"></i>Loading School Information...</h4></div>;
  }

  if (errorFetching) {
    return <div className="container py-5 text-center text-danger"><h4><i className="bi bi-exclamation-triangle me-2"></i>Error: {errorFetching}</h4></div>;
  }

  return (
    <>
      {/* Conditional Rendering based on isShowsForm */}
      {isShowsForm ? (
        // --- FORM VIEW ---
        <div className="container py-3">
          <div className="container py-3">
            <div className="row justify-content-center">
              <div className="col-lg-11">
                {/* Main Card */}
                <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                  {/* Header */}
                  <div className="card-header bg-primary bg-gradient text-white p-3">
                    <div className="d-flex justify-content-center align-items-center">
                      <i className="bi bi-building fs-4 me-2"></i>
                      <h3 className="mb-0 text-center fw-bold fs-3 heading-font">शाळेची माहिती</h3>
                    </div>
                    {udiseNo && <p className="text-center mb-0 small text-white-50 fs-5">UDISE: {udiseNo}</p>}
                  </div>

                  {/* Form Body */}
                  <div className="card-body p-3">
                    <form onSubmit={handleSubmit} className="fs-5">
                      {/* Basic Information Section */}
                      <div className="card mb-3 border-0 bg-light">
                        <div className="card-body p-3">
                          <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                            <BiInfoCircle /> मूलभूत माहिती
                          </h5>
                          <div className="row g-2">
                            <div className="col-md-6 mb-2">
                              <label htmlFor="schoolName" className="form-label fw-semibold small">शाळेचे नाव</label>
                              <input
                                type="text"
                                className="form-control form-control-sm bg-white bg-opacity-50"
                                id="schoolName"
                                value={formData.schoolName} // Use formData
                                // onChange={handleChange} // Keep if you allow editing
                                readOnly // Usually read-only
                              />
                            </div>
                            <div className="col-md-6 mb-2">
                              <label htmlFor="schoolSlogan" className="form-label fw-semibold small">शाळेची घोषणा</label>
                              <input
                                type="text"
                                className={`form-control form-control-sm ${errors.schoolSlogan ? 'is-invalid' : ''}`}
                                id="schoolSlogan"
                                value={formData.schoolSlogan} // Use formData
                                onChange={handleChange}      // Use handleChange
                                placeholder="शाळेची घोषणा प्रविष्ट करा"
                              />
                              {errors.schoolSlogan && <div className="invalid-feedback">{errors.schoolSlogan}</div>}
                            </div>
                            <div className="col-md-6 mb-2">
                              <label htmlFor="sansthaName" className="form-label fw-semibold small">संस्थेचे नाव</label>
                              <input
                                type="text"
                                className="form-control form-control-sm bg-white bg-opacity-50"
                                id="sansthaName"
                                value={formData.sansthaName} // Use formData
                                // onChange={handleChange} // Keep if you allow editing
                                readOnly // Usually read-only
                              />
                            </div>
                            <div className="col-md-6 mb-2">
                              <label htmlFor="medium" className="form-label fw-semibold small">माध्यम</label>
                              <input
                                type="text"
                                className={`form-control form-control-sm ${errors.medium ? 'is-invalid' : ''}`}
                                id="medium"
                                value={formData.medium}     // Use formData
                                onChange={handleChange}     // Use handleChange
                                placeholder="माध्यम प्रविष्ट करा"
                              />
                              {errors.medium && <div className="invalid-feedback">{errors.medium}</div>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Location Information Section */}
                      <div className="card mb-3 border-0 bg-light">
                        <div className="card-body p-3">
                          <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold"><BiMap /> स्थान माहिती</h5>
                          <div className="row g-2">
                            <div className="col-md-6 mb-2">
                              <label htmlFor="state" className="form-label fw-semibold small">राज्य</label>
                              <select
                                className={`form-select form-select-sm ${errors.state ? 'is-invalid' : ''}`}
                                id="state"
                                value={formData.state} // Use formData.state (ID)
                                onChange={handleChange}
                              >
                                <option value="">-- राज्य निवडा --</option>
                                {states.map(state => (
                                  <option key={state.id} value={state.id}>{state.stateName}</option>
                                ))}
                              </select>
                              {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                            </div>
                            <div className="col-md-6 mb-2">
                              <label htmlFor="district" className="form-label fw-semibold small">जिल्हा</label>
                              <select
                                className={`form-select form-select-sm ${errors.district ? 'is-invalid' : ''}`}
                                id="district"
                                value={formData.district} // Use formData.district (ID)
                                onChange={handleChange}
                                disabled={!formData.state || filterdistrict.length === 0} // Disable if no state or no filtered districts
                              >
                                <option value="">-- जिल्हा निवडा --</option>
                                {filterdistrict.map(district => (
                                  <option key={district.id} value={district.id}>{district.districtName}</option>
                                ))}
                              </select>
                              {errors.district && <div className="invalid-feedback">{errors.district}</div>}
                            </div>
                            <div className="col-md-6 mb-2">
                              <label htmlFor="tehsil" className="form-label fw-semibold small">तालुका</label>
                              <select
                                className={`form-select form-select-sm ${errors.tehsil ? 'is-invalid' : ''}`}
                                id="tehsil"
                                value={formData.tehsil} // Use formData.tehsil (ID)
                                onChange={handleChange}
                                disabled={!formData.district || filteredTehsils.length === 0} // Disable if no district or no filtered tehsils
                              >
                                <option value="">-- तालुका निवडा --</option>
                                {filteredTehsils.map(tehsil => (
                                  <option key={tehsil.id} value={tehsil.id}>{tehsil.tehsilName}</option>
                                ))}
                              </select>
                              {errors.tehsil && <div className="invalid-feedback">{errors.tehsil}</div>}
                            </div>
                            <div className="col-md-6 mb-2">
                              <label htmlFor="village" className="form-label fw-semibold small">गाव</label>
                              <select
                                className={`form-select form-select-sm ${errors.village ? 'is-invalid' : ''}`}
                                id="village"
                                value={formData.village} // Use formData.village (ID)
                                onChange={handleChange}
                                disabled={!formData.tehsil || filteredVillages.length === 0} // Disable if no tehsil or no filtered villages
                              >
                                <option value="">-- गाव निवडा --</option>
                                {filteredVillages.map(village => (
                                  <option key={village.id} value={village.id}>{village.villageName}</option>
                                ))}
                              </select>
                              {errors.village && <div className="invalid-feedback">{errors.village}</div>}
                            </div>
                            <div className="col-md-6 mb-2">
                              <label htmlFor="pincode" className="form-label fw-semibold small">पिनकोड</label>
                              <input
                                type="text" // Keep text to allow formatting/maxLength
                                inputMode="numeric" // Hint for mobile keyboards
                                className={`form-control form-control-sm ${errors.pincode ? 'is-invalid' : ''}`}
                                id="pincode"
                                value={formData.pincode} // Use formData
                                onChange={handleChange}  // Use handleChange
                                placeholder="पिनकोड प्रविष्ट करा"
                                maxLength={6}
                              />
                              {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Board Information Section */}
                      <div className="card mb-3 border-0 bg-light">
                        <div className="card-body p-3">
                          <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold"><BiListUl /> बोर्ड आणि मान्यता माहिती</h5>
                          <div className="row g-2">
                            <div className="col-md-6 mb-2">
                              <label htmlFor="board" className="form-label fw-semibold small">बोर्ड</label>
                              <input
                                type="text"
                                className={`form-control form-control-sm ${errors.board ? 'is-invalid' : ''}`}
                                id="board"
                                value={formData.board} // Use formData
                                onChange={handleChange} // Use handleChange
                                placeholder="बोर्ड प्रविष्ट करा"
                              />
                              {errors.board && <div className="invalid-feedback">{errors.board}</div>}
                            </div>
                            <div className="col-md-6 mb-2">
                              <label htmlFor="boardDivision" className="form-label fw-semibold small">बोर्डविभाग</label>
                              <input
                                type="text"
                                className={`form-control form-control-sm ${errors.boardDivision ? 'is-invalid' : ''}`}
                                id="boardDivision"
                                value={formData.boardDivision} // Use formData
                                onChange={handleChange}        // Use handleChange
                                placeholder="बोर्डविभाग प्रविष्ट करा"
                              />
                              {errors.boardDivision && <div className="invalid-feedback">{errors.boardDivision}</div>}
                            </div>
                            <div className="col-md-6 mb-2">
                              <label htmlFor="boardIndexNo" className="form-label fw-semibold small">बोर्ड निर्देशांक क्र</label>
                              <input
                                type="text"
                                className={`form-control form-control-sm ${errors.boardIndexNo ? 'is-invalid' : ''}`}
                                id="boardIndexNo"
                                value={formData.boardIndexNo} // Use formData
                                onChange={handleChange}       // Use handleChange
                                placeholder="बोर्ड निर्देशांक क्र प्रविष्ट करा"
                              />
                              {errors.boardIndexNo && <div className="invalid-feedback">{errors.boardIndexNo}</div>}
                            </div>
                            <div className="col-md-6 mb-2">
                              <label htmlFor="schoolApprovalNo" className="form-label fw-semibold small">शाळेची मान्यता क्रमांक</label>
                              <input
                                type="text"
                                className={`form-control form-control-sm ${errors.schoolApprovalNo ? 'is-invalid' : ''}`}
                                id="schoolApprovalNo"
                                value={formData.schoolApprovalNo} // Use formData
                                onChange={handleChange}           // Use handleChange
                                placeholder="शाळेची मान्यता क्रमांक प्रविष्ट करा"
                              />
                              {errors.schoolApprovalNo && <div className="invalid-feedback">{errors.schoolApprovalNo}</div>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information Section */}
                      <div className="card mb-3 border-0 bg-light">
                        <div className="card-body p-3">
                          <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold"><BiMobile /> संपर्क माहिती</h5>
                          <div className="row g-2">
                            <div className="col-md-6 mb-2">
                              <label htmlFor="headMasterMobileNo" className="form-label fw-semibold small">मुख्यध्यापकांचा मोबाईल नं</label>
                              <div className="input-group input-group-sm">
                                <span className="input-group-text bg-primary text-white"><BiPhone /></span>
                                <input
                                  type="text" // Keep text for formatting/maxLength
                                  inputMode="tel" // Hint for mobile keyboards
                                  className={`form-control form-control-sm ${errors.headMasterMobileNo ? 'is-invalid' : ''}`}
                                  id="headMasterMobileNo"
                                  value={formData.headMasterMobileNo} // Use formData
                                  onChange={handleChange}             // Use handleChange
                                  placeholder="मुख्यध्यापकांचा मोबाईल नंबर"
                                  maxLength={10}
                                  readOnly
                                />
                                {/* Display error inside or outside input-group based on styling */}
                                {errors.headMasterMobileNo && <div className="invalid-feedback d-block">{errors.headMasterMobileNo}</div>}
                              </div>
                              {/* Or display error outside */}
                              {/* {errors.headMasterMobileNo && <div className="invalid-feedback d-block">{errors.headMasterMobileNo}</div>} */}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4 bg-light p-3 rounded">
                        <h5 className="border-bottom pb-2 mb-3 fw-bold">
                          <BiIdCard className="me-2" />
                          पासवर्ड बदला
                        </h5>
                        <div className="row g-3"></div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold small">पासवर्ड / password</label>
                          <input id='password' type="password" name="password" className={`form-control form-control-sm ${errors.password ? 'is-invalid' : ''}`} value={formData.password} onChange={handleChange} placeholder='password' />
                          {errors.password && <div className="invalid-feedback">
                            {errors.password}
                          </div>}
                        </div>
                      </div>

                      {/* School Logo Section */}
                      <div className="card mb-3 border-0 bg-light">
                        <div className="card-body p-3">
                          <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold"><BiImageAdd /> शाळेचे छायाचित्र</h5>
                          <div className="row g-2">
                            <div className="col-md-6 mb-2">
                              <label htmlFor="logo" className="form-label fw-semibold small">शाळेचे लोगो</label>
                              {/* Display existing logo if available */}

                              <div className="input-group input-group-sm mb-2">
                                <input
                                  type="file"
                                  className={`form-control form-control-sm ${errors.logo ? 'is-invalid' : ''}`} // Add error class if needed
                                  id="logo"
                                  onChange={handleChange} // Use handleChange
                                  accept="image/png, image/jpeg, image/gif" // Specify accepted types
                                />
                                <label className="input-group-text" htmlFor="logo"><BiUpload /></label>
                              </div>
                              {/* Display selected file name */}
                              {formData.logo instanceof File && (
                                <div className="form-text small">निवडलेली फाइल: {formData.logo.name}</div>
                              )}
                              {errors.logo && <div className="invalid-feedback">{errors.logo}</div>}
                            </div>
                          </div>
                        </div>
                      </div>


                      {/* Submit Button */}
                      <div className="d-flex justify-content-center mt-4">
                        <button type="submit" className="btn btn-primary btn-md px-4 py-2 rounded-pill shadow-sm" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i> जतन करा
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ---- END OF FORM JSX ---- */}

        </div>
      ) : (
        // --- DISPLAY VIEW ---
        <div className='container-fluid py-4'>
          <div className="card shadow-lg border-0 rounded-lg overflow-hidden">
            {/* Header with gradient blue background */}
             <div className="position-absolute top-0 end-0 m-2">
                                <Next classname={'btn bg-danger text-white btn-sm'} path={'/headmaster'} placeholder={'X'}></Next>
                            </div>
            <div className="card-header text-white py-3" style={{ background: 'linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%)' }}>
              <div className="d-flex align-items-center">
                {schoolData?.logo && (
                  <div className="bg-white p-2 rounded me-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={`data:image/jpeg;base64,${schoolData.logo}`} alt={`${schoolData?.schoolName ?? 'School'} Logo`}
                      style={{ height: '100px', maxWidth: '120px', objectFit: 'contain' }}
                    />
                  </div>
                )}
                <div>
                  <h2 className="mb-0 fw-bold">{schoolData?.schoolName ?? 'N/A'}</h2>
                  <div className="d-flex align-items-center">
                    <span className="badge bg-white text-primary me-2">UDISE:</span>
                    <span>{schoolData?.udiseNo ?? 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              <div className="row g-4">
                {/* Basic Information */}
                <div className="col-lg-4">
                  <div className="p-3 h-100 border-start border-primary border-3">
                    <h5 className="text-primary mb-3"><i className="bi bi-building me-2"></i>मूलभूत माहिती</h5>
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td className="text-primary fw-bold ps-0" style={{ width: '40%' }}>शाळेचा ईमेल</td>
                          <td>{schoolData?.schoolEmailId ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-primary fw-bold ps-0">संस्था नाव</td>
                          <td>{schoolData?.sansthaName ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-primary fw-bold ps-0">शाळेचा घोषवाक्य</td>
                          <td>{schoolData?.schoolSlogan ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-primary fw-bold ps-0">मान्यता क्रमांक</td>
                          <td>{schoolData?.schoolApprovalNo ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-primary fw-bold ps-0">मुख्याध्यापक मोबाइल</td>
                          <td>{schoolData?.headMasterMobileNo ?? 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Location Information */}
                <div className="col-lg-4">
                  <div className="p-3 h-100 border-start border-primary border-3">
                    <h5 className="text-primary mb-3"><i className="bi bi-geo-alt me-2"></i>स्थानिक माहिती</h5>
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td className="text-primary fw-bold ps-0" style={{ width: '40%' }}>राज्य</td>
                          <td>{schoolData?.state?.stateName ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-primary fw-bold ps-0">जिल्हा</td>
                          <td>{schoolData?.district?.districtName ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-primary fw-bold ps-0">तालुका</td>
                          <td>{schoolData?.tehsil?.tehsilName ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-primary fw-bold ps-0">गाव / शहर</td>
                          <td>{schoolData?.village?.villageName ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-primary fw-bold ps-0">पिनकोड</td>
                          <td>{schoolData?.pinCode ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-primary fw-bold ps-0">शाळेचे ठिकाण</td>
                          <td>{schoolData?.schoolPlace ?? 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="col-lg-4">
                  <div className="p-3 h-100 border-start border-primary border-3">
                    <h5 className="text-primary mb-3"><i className="bi bi-book me-2"></i>शैक्षणिक माहिती</h5>
                    <table className="table table-borderless">
                      <tbody>
                        <tr>
                          <td className="text-primary fw-bold ps-0" style={{ width: '40%' }}>मंडळ</td>
                          <td>{schoolData?.board ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-primary fw-bold ps-0">मंडळ विभाग</td>
                          <td>{schoolData?.boardDivision ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-primary fw-bold ps-0">मंडळ अनुक्रमांक</td>
                          <td>{schoolData?.boardIndexNo ?? 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="text-primary fw-bold ps-0">माध्यम</td>
                          <td>{schoolData?.medium ?? 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <button className='btn btn-secondary' onClick={()=>{setIsShowsForm(true)}}>शाळेची माहिती बदला</button>
                </div>
              </div>
              <Next classname={'btn btn-primary float-end'} path={'/headmaster/class'} placeholder={'पुढे चला'}></Next>
            </div>
          </div>
        </div>

      )}
    </>
  );
}

export default AddSchoolInfo;