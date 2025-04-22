import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import { AiOutlineMobile } from 'react-icons/ai';
import { BiUpload,BiPhone ,BiInfoCircle,BiGlobeAlt, BiMap, BiListUl, BiMobile, BiImageAdd} from 'react-icons/bi';
import '../styling/formstyle.css'



function AddSchoolInfo() {
  const udiseNo = 42534565235;
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
    state: '',
    district: '',
    tehsil: '',
    village: '',
    pincode: '',
    medium: '',
    headMasterMobileNo: '',
    board: '',
    boardDivision: '',
    boardIndexNo: '',
    schoolApprovalNo: '',
    logo: null,
  });

  function handleChange(e) {
    const { id, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [id]: files[0] });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  }

  useEffect(() => {
    if (formData.state) {
      const filtered = districts.filter(d => d.state.id === parseInt(formData.state));
      setFilterDistrict(filtered);
    } else {
      setFilterDistrict([]);
    }
  }, [formData.state, districts]);

  useEffect(() => {
    if (formData.district) {
      const filtered = tehsils.filter(t => t.district.id === parseInt(formData.district));
      setFilteredTehsils(filtered);
    } else {
      setFilteredTehsils([]);
    }
  }, [formData.district, tehsils]);

  useEffect(() => {
    if (formData.tehsil) {
      const filtered = villages.filter(v => v.tehsil.id === parseInt(formData.tehsil));
      setFilteredVillages(filtered);
    } else {
      setFilteredVillages([]);
    }
  }, [formData.tehsil, villages]);

  function handleSubmit(e) {
    e.preventDefault();
  
    const userData = new FormData();
  
    // Prepare the schoolDto object
    const schoolDto = {
      udiseNo: udiseNo, // or formData.udiseNo if editable
      schoolName: formData.schoolName,
      schoolSlogan: formData.schoolSlogan,
      sansthaName: formData.sansthaName,
      medium: formData.medium,
      state: formData.state,
      district: formData.district,
      tehsil: formData.tehsil,
      village: formData.village,
      pinCode: formData.pincode,
      board: formData.board,
      boardDivision: formData.boardDivision,
      boardIndexNo: formData.boardIndexNo,
      schoolApprovalNo: formData.schoolApprovalNo,
      headMasterMobileNo: formData.headMasterMobileNo,
    };
  
    // Append the JSON string of schoolDto
    userData.append('schoolDto', JSON.stringify(schoolDto));
  
    // Append the file if it exists
    if (formData.logo) {
      userData.append('logo', formData.logo);
    }
  
    // Send data to backend
    apiService
      .putdata("school/", userData, udiseNo)
      .then(() => {
        alert('School info saved successfully!');
      })
      .catch((err) => {
        console.error('Error submitting form:', err);
      });

      setFormData({
        schoolName: '',
        schoolSlogan: '',
        sansthaName: '',
        state: '',
        district: '',
        tehsil: '',
        village: '',
        pincode: '',
        medium: '',
        headMasterMobileNo: '',
        board: '',
        boardDivision: '',
        boardIndexNo: '',
        schoolApprovalNo: '',
        logo: null,
      })
  }
  

  useEffect(() => {
    apiService.getbyid('school/', udiseNo).then((response) => {
      const data = response.data;
      setFormData((prevData) => ({
        ...prevData,
        schoolName: data.schoolName || '',
        sansthaName: data.sansthaName || '',
      }));
    });

    apiService.getdata('state/').then((response) => {
      setStates(response.data);
    });
    apiService.getdata('district/').then((response) => {
      setDistricts(response.data);
    });
    apiService.getdata('tehsil/').then((response) => {
      setTehsils(response.data);
    });
    apiService.getdata('village/').then((response) => {
      setVillages(response.data);
    });
  }, []);

  return (
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
              <p className="text-center mb-0 small text-white-50 fs-5">UDISE: {udiseNo}</p>
            </div>

            {/* Form Body */}
            <div className="card-body p-3">
              <form onSubmit={handleSubmit} className="fs-5">
                {/* Basic Information Section */}
                <div className="card mb-3 border-0 bg-light">
                  <div className="card-body p-3">
                    <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                      <BiInfoCircle/>
                      मूलभूत माहिती
                    </h5>
                    <div className="row g-2">
                      <div className="col-md-6 mb-2">
                        <label htmlFor="schoolName" className="form-label fw-semibold small">शाळेचे नाव</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm bg-white bg-opacity-50" 
                          id="schoolName" 
                          value={formData.schoolName} 
                          onChange={handleChange} 
                          readOnly 
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label htmlFor="schoolSlogan" className="form-label fw-semibold small">शाळेची घोषणा</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          id="schoolSlogan" 
                          value={formData.schoolSlogan} 
                          onChange={handleChange} 
                          placeholder="शाळेची घोषणा प्रविष्ट करा"
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label htmlFor="sansthaName" className="form-label fw-semibold small">संस्थेचे नाव</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm bg-white bg-opacity-50" 
                          id="sansthaName" 
                          value={formData.sansthaName} 
                          onChange={handleChange} 
                          readOnly 
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label htmlFor="medium" className="form-label fw-semibold small">माध्यम</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          id="medium" 
                          value={formData.medium} 
                          onChange={handleChange} 
                          placeholder="माध्यम प्रविष्ट करा"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information Section */}
                <div className="card mb-3 border-0 bg-light">
                  <div className="card-body p-3">
                    <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                      <BiMap/>
                      स्थान माहिती
                    </h5>
                    <div className="row g-2">
                      <div className="col-md-6 mb-2">
                        <label htmlFor="state" className="form-label fw-semibold small">राज्य</label>
                        <select 
                          className="form-select form-select-sm" 
                          id="state" 
                          value={formData.state} 
                          onChange={handleChange}
                        >
                          <option value="">-- राज्य निवडा --</option>
                          {states.map(state => (
                            <option key={state.id} value={state.id}>{state.stateName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-2">
                        <label htmlFor="district" className="form-label fw-semibold small">जिल्हा</label>
                        <select 
                          className="form-select form-select-sm" 
                          id="district" 
                          value={formData.district} 
                          onChange={handleChange}
                          disabled={!formData.state}
                        >
                          <option value="">-- जिल्हा निवडा --</option>
                          {filterdistrict.map(district => (
                            <option key={district.id} value={district.id}>{district.districtName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-2">
                        <label htmlFor="tehsil" className="form-label fw-semibold small">तालुका</label>
                        <select 
                          className="form-select form-select-sm" 
                          id="tehsil" 
                          value={formData.tehsil} 
                          onChange={handleChange}
                          disabled={!formData.district}
                        >
                          <option value="">-- तालुका निवडा --</option>
                          {filteredTehsils.map(tehsil => (
                            <option key={tehsil.id} value={tehsil.id}>{tehsil.tehsilName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-2">
                        <label htmlFor="village" className="form-label fw-semibold small">गाव</label>
                        <select 
                          className="form-select form-select-sm" 
                          id="village" 
                          value={formData.village} 
                          onChange={handleChange}
                          disabled={!formData.tehsil}
                        >
                          <option value="">-- गाव निवडा --</option>
                          {filteredVillages.map(village => (
                            <option key={village.id} value={village.id}>{village.villageName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6 mb-2">
                        <label htmlFor="pincode" className="form-label fw-semibold small">पिनकोड</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          id="pincode" 
                          value={formData.pincode} 
                          onChange={handleChange} 
                          placeholder="पिनकोड प्रविष्ट करा"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Board Information Section */}
                <div className="card mb-3 border-0 bg-light">
                  <div className="card-body p-3">
                    <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                      <BiListUl/>
                      बोर्ड आणि मान्यता माहिती
                    </h5>
                    <div className="row g-2">
                      <div className="col-md-6 mb-2">
                        <label htmlFor="board" className="form-label fw-semibold small">बोर्ड</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          id="board" 
                          value={formData.board} 
                          onChange={handleChange} 
                          placeholder="बोर्ड प्रविष्ट करा"
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label htmlFor="boardDivision" className="form-label fw-semibold small">बोर्डविभाग</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          id="boardDivision" 
                          value={formData.boardDivision} 
                          onChange={handleChange} 
                          placeholder="बोर्डविभाग प्रविष्ट करा"
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label htmlFor="boardIndexNo" className="form-label fw-semibold small">बोर्ड निर्देशांक क्र</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          id="boardIndexNo" 
                          value={formData.boardIndexNo} 
                          onChange={handleChange} 
                          placeholder="बोर्ड निर्देशांक क्र प्रविष्ट करा"
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label htmlFor="schoolApprovalNo" className="form-label fw-semibold small">शाळेची मान्यता क्रमांक</label>
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          id="schoolApprovalNo" 
                          value={formData.schoolApprovalNo} 
                          onChange={handleChange} 
                          placeholder="शाळेची मान्यता क्रमांक प्रविष्ट करा"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="card mb-3 border-0 bg-light">
                  <div className="card-body p-3">
                    <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                      <BiMobile/>

                      संपर्क माहिती
                    </h5>
                    <div className="row g-2">
                      <div className="col-md-6 mb-2">
                        <label htmlFor="headMasterMobileNo" className="form-label fw-semibold small">मुख्यध्यापकांचा मोबाईल नं</label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-primary text-white">
                            <BiPhone/>
                          </span>
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            id="headMasterMobileNo" 
                            value={formData.headMasterMobileNo} 
                            onChange={handleChange} 
                            placeholder="मुख्यध्यापकांचा मोबाईल नंबर"
                            maxLength={10}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* School Logo Section */}
                <div className="card mb-3 border-0 bg-light">
                  <div className="card-body p-3">
                    <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                      <i className="bi bi-image me-2"></i>
                      <BiImageAdd/>
                      शाळेचे छायाचित्र
                    </h5>
                    <div className="row g-2">
                      <div className="col-md-6 mb-2">
                        <label htmlFor="logo" className="form-label fw-semibold small">शाळेचे लोगो</label>
                        <div className="input-group input-group-sm mb-2">
                          <input 
                            type="file" 
                            className="form-control form-control-sm" 
                            id="logo" 
                            onChange={handleChange} 
                          />
                          <label className="input-group-text" htmlFor="logo">
                            <BiUpload/>
                          </label>
                        </div>
                        {formData.logo && (
                          <div className="form-text small">
                            निवडलेली फाइल: {formData.logo.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-flex justify-content-center mt-4">
                  <button type="submit" className="btn btn-primary btn-md px-4 py-2 rounded-pill shadow-sm">
                    <i className="bi bi-check-circle me-2"></i>
                    जतन करा
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddSchoolInfo;