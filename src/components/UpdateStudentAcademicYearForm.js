
import React from 'react'
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/api.service';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function UpdateStudentAcademicYearForm() {
  const { id } = useParams();

  // console.log(id);
  const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    }
  });

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    division: '',
    standardId: '',
    academicYear: '',
    status: ''
  });

  const [divisions, setDivisions] = useState([]);
  const [standards, setStandards] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [singleTeacher, setSingleTeacher] = useState();
  const [classTeacherData, setClassTeacherData] = useState([]);
  const [academicdata, setAcademicData] = useState('');
  const [warning, setWarning] = useState(false);
  const [errors, setErrors] = useState({});
  const location = useLocation();

  const { selectedStudents } = location.state || { selectedStudents: [] }


  const schoolUdiseNo = jwtDecode(sessionStorage.getItem('token')).udiseNo;
  const studentId = id;

  useEffect(() => {
    apiService.getbyid("Division/getbyudise/", schoolUdiseNo).then((response) => {
      setDivisions(response.data);
    });
    apiService.getbyid("standardmaster/getbyudise/", schoolUdiseNo).then((response) => {
      setStandards(response.data);
    });
    apiService.getbyid("staff/getbyudise/", schoolUdiseNo).then((response) => {
      setTeachers(response.data);
    });
    apiService.getbyid("classteacher/getbyudise/", schoolUdiseNo).then((response) => {
      // console.log(response.data);
      setClassTeacherData(response.data);
    });
    api.get("http://localhost:8080/academic/student-school", {
      params: {
        studentId: studentId,
        schoolUdiseNo: schoolUdiseNo
      }
    }).then((response) => {
      // console.log(response.data);
      setAcademicData(response.data);
    })
  }, []);
  
  console.log(academicdata);
  

  useEffect(() => {
    if (formData.division && formData.standardId) {
      const filter = classTeacherData.find(ct =>
        ct?.division?.id === parseInt(formData.division) &&
        ct?.standardMaster?.id === parseInt(formData.standardId)
      );
      setSingleTeacher(filter);
      setWarning(!filter)
    } else {
      setSingleTeacher(null);
    }
  }, [formData.division, formData.standardId, classTeacherData]);

  function handleChange(event) {
    const { name, value } = event.target;
    const newValue = name === "status" ? value.toLowerCase() : value;
    setFormData({
      ...formData,
      [name]: newValue
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

  }

  function validateForm() {
    const newErrors = {};

    if (!formData.division) {
      newErrors.division = "कृपया तुकडी निवडा";
    }
    if (!formData.standardId) {
      newErrors.standardId = "कृपया इयत्ता निवडा";
    }
    if (!formData.academicYear) {
      newErrors.academicYear = "कृपया शैक्षणिक वर्ष प्रविष्ट करा";
    } else if (!/^\d{4}-\d{2}$/.test(formData.academicYear)) {
      newErrors.academicYear = "कृपया योग्य स्वरूपात शैक्षणिक वर्ष प्रविष्ट करा (उदा. 2024-25)";
    }
    if (!formData.status) {
      newErrors.status = "कृपया status निवडा";
    } else if (!['pass', 'fail', 'promoted', 'demoted'].includes(formData.status.toLowerCase())) {
      newErrors.status = "कृपया valid status निवडा (pass, fail, promoted, demoted)";
    }

    return newErrors;
  }


  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (formData.standardId == academicdata?.standard?.id) {
      alert("इयत्ता बदला (Please change the standard)");
      return;
    }
    else {
      const payload = {
        ...formData,
        studentId: id,
        schoolUdiseNo,
        classTeacher: singleTeacher?.id
      };
      setFormData({
        division: '',
        standardId: '',
        academicYear: ''
      })
      // console.log(payload);

      apiService.putdata('academic/update-status/', payload, academicdata.id).then((response) => {
        alert("Data Added Succesfully");
      });

      navigate(`teacher/Updateyear`);
    }
  }
  return (
    <div className="container py-3">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-primary bg-gradient text-white p-3 text-center">
              <h3 className="mb-0 fw-bold fs-4 heading-font">विद्यार्थी शैक्षणिक माहिती अपडेट करा</h3>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} className="fs-6">
                {/* Division Select */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">तुकडी</label>
                  <select
                    className={`form-control ${errors.division ? 'is-invalid' : ''}`}
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                  >
                    <option value="">-- तुकडी निवडा --</option>
                    {divisions.map(division => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                  {errors.division && (
                    <div className="invalid-feedback">{errors.division}</div>
                  )}

                </div>

                {/* Standard Select */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">इयत्ता</label>
                  <select
                    className={`form-control ${errors.standardId ? 'is-invalid' : ''}`}
                    name="standardId"
                    value={formData.standardId}
                    onChange={handleChange}
                  >
                    <option value="">-- इयत्ता निवडा --</option>
                    {standards.map(standard => (
                      <option key={standard.id} value={standard.id}>
                        {standard.standard}
                      </option>
                    ))}
                  </select>
                  {errors.standardId && (
                    <div className="invalid-feedback">{errors.standardId}</div>
                  )}

                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">शिक्षक</label>
                  <div className="form-control form-control-sm">
                    {singleTeacher ? `${singleTeacher.staff.fname} ${singleTeacher.staff.lname}` : 'शिक्षक निवडले नाहीत'}
                  </div>
                  {warning == true && <div className='mt-3 text-danger'>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    या वर्गासाठी कोणताही शिक्षक नियुक्त केला नाही</div>}
                </div>

                {/* Academic Year Input */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">शैक्षणिक वर्ष</label>
                  <input
                    className={`form-control ${errors.academicYear ? 'is-invalid' : ''}`}
                    name='academicYear'
                    value={formData.academicYear}
                    placeholder='उदा. 2024-25'
                    onChange={handleChange}
                  />
                  {errors.academicYear && (
                    <div className="invalid-feedback">{errors.academicYear}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    className={`form-control ${errors.status ? 'is-invalid' : ''}`}
                    name='status'
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="">-- Status निवडा --</option>
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                   
                  </select>
                  {errors.status && (
                    <div className="invalid-feedback">{errors.status}</div>
                  )}
                </div>

                <div className="text-center mt-4">
                  <button type="submit" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
                    जतन करा
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateStudentAcademicYearForm
