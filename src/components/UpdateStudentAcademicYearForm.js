import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/api.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';
import axios from 'axios';

function UpdateStudentAcademicYearForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedStudents } = location.state || { selectedStudents: [] };
  const schoolUdiseNo = jwtDecode(sessionStorage.getItem('token')).udiseNo;
  const studentId = id;

  const [formData, setFormData] = useState({
    division: '',
    standardId: '',
    academicYear: '',
    status: ''
  });

  const [divisions, setDivisions] = useState([]);
  const [standards, setStandards] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classTeacherData, setClassTeacherData] = useState([]);
  const [singleTeacher, setSingleTeacher] = useState(null);
  const [academicdata, setAcademicData] = useState('');
  const [statusForFormLoad, setStatusForFormLoad] = useState();
  const [promotedStandard, setPromotedStandard] = useState();
  const [showPassAndLeftButton, setShowPassAndLeftButton] = useState(false);

  const [warning, setWarning] = useState(false);
  const [errors, setErrors] = useState({});

  const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    }
  });

  const calculateAcademicYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)

    // If current month is June (5) or later, academic year is currentYear-nextYear
    if (currentMonth >= 4) {
      return `${currentYear}-${String(currentYear + 1).slice(-2)}`;
    }
    return `${currentYear - 1}-${String(currentYear).slice(-2)}`;
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      academicYear: calculateAcademicYear()
    }));
  }, []);

  useEffect(() => {
    apiService.getbyid("Division/getbyudise/", schoolUdiseNo).then((res) => setDivisions(res.data));
    apiService.getbyid("standardmaster/getbyudise/", schoolUdiseNo).then((res) => setStandards(res.data));
    apiService.getbyid("staff/getbyudise/", schoolUdiseNo).then((res) => setTeachers(res.data));
    apiService.getbyid("classteacher/getbyudise/", schoolUdiseNo).then((res) => setClassTeacherData(res.data));

    api.get("/academic/student-school", {
      params: { studentId, schoolUdiseNo }
    }).then((res) => setAcademicData(res.data));
  }, [schoolUdiseNo, studentId]);

  useEffect(() => {
    if (formData?.status === "Pass") {
      if (standards.length > 0 && academicdata?.standard) {
        const nextStandard = standards.find(st => st.standard === academicdata.standard.standard + 1);
        setPromotedStandard(nextStandard);
        if (nextStandard) {
          setFormData(prev => ({ ...prev, standardId: nextStandard.id }));
        }
      }
    } else if (formData.status === "Fail") {
      setFormData(prev => ({ ...prev, standardId: academicdata?.standard?.id }));
    }
  }, [standards, academicdata, formData.status]);

  useEffect(() => {
    if (formData.division && formData.standardId) {
      const match = classTeacherData.find(ct =>
        ct?.division?.id === parseInt(formData.division) &&
        ct?.standardMaster?.id === parseInt(formData.standardId)
      );
      setSingleTeacher(match);
      setWarning(!match);
    } else {
      setSingleTeacher(null);
    }
  }, [formData.division, formData.standardId, classTeacherData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'status' ? value : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (name === 'status') {
      setStatusForFormLoad(value);
      setShowPassAndLeftButton(value === "PassAndLeft");
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.division && formData.status !== "Pass") {
      newErrors.division = "कृपया तुकडी निवडा";
    }
    if (statusForFormLoad === 'Pass' && !formData.standardId) {
      newErrors.standardId = "कृपया इयत्ता निवडा";
    }
    if (!formData.academicYear) {
      newErrors.academicYear = "कृपया शैक्षणिक वर्ष प्रविष्ट करा";
    } else if (!/^\d{4}-\d{2}$/.test(formData.academicYear)) {
      newErrors.academicYear = "योग्य स्वरूपात शैक्षणिक वर्ष प्रविष्ट करा (उदा. 2024-25)";
    }
    if (!formData.status) {
      newErrors.status = "कृपया status निवडा";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (statusForFormLoad === 'Pass' &&
      academicdata?.standard?.id &&
      parseInt(formData.standardId) <= academicdata.standard.id) {
      alert("इयत्ता बदला (Please change the standard)");
      return;
    }

    const payload = {
      ...formData,
      studentId,
      schoolUdiseNo,
      classTeacher: singleTeacher?.id
    };

    apiService.putdata('academic/update-status/', payload, academicdata.id)
      .then(() => {
        Swal.fire({
          title: "विद्यार्थ्याची शैक्षणीक माहिती अपडेट केली आहे..!",
          icon: "success"
        });
        navigate(`/teacher/Updateyear`);
      }).catch(() => {
        Swal.fire({
          title: "Error",
          text: "माहिती अपडेट करताना त्रुटी आली",
          icon: "error"
        });
      });
  };

  return (
    <div className="container py-3">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-primary bg-gradient text-white text-center p-3">
              <h3 className="mb-0 fw-bold fs-4">विद्यार्थी शैक्षणिक माहिती अपडेट करा</h3>
              <p className='mb-0 small'>Student: {academicdata?.studentId?.studentName || '...'} | सध्याची : इयत्ता {academicdata?.standard?.standard} / तुकडी  {academicdata?.division?.name || 'N/A'}</p>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label">विद्यार्थी पास आहे का नापास ? </label>
                  <select
                    className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                    name='status'
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="">-- निकाल निवडा --</option>
                    <option value="Pass">Pass (उत्तीर्ण)</option>
                    <option value="Fail">Fail (अनुत्तीर्ण)</option>
                    <option value="PassAndLeft">Pass & Left (उत्तीर्ण आणि शाळा सोडली)</option>
                  </select>
                  {errors.status && <div className="invalid-feedback">{errors.status}</div>}
                </div>

                {(statusForFormLoad === 'Pass' || statusForFormLoad === 'Fail') && (
                  <>
                    {statusForFormLoad === 'Pass' && (
                      <div className="mb-3">
                        <label className="form-label">इयत्ता</label>
                        <input
                          className='form-control'
                          value={promotedStandard?.standard || ''}
                          readOnly
                        />
                        {errors.standardId && <div className="invalid-feedback">{errors.standardId}</div>}
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label">तुकडी</label>
                      <select
                        className={`form-control ${errors.division ? 'is-invalid' : ''}`}
                        name="division"
                        value={formData.division}
                        onChange={handleChange}
                      >
                        <option value="">-- तुकडी निवडा --</option>
                        {divisions.map(div => (
                          <option key={div.id} value={div.id}>{div.name}</option>
                        ))}
                      </select>
                      {errors.division && <div className="invalid-feedback">{errors.division}</div>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">शिक्षक</label>
                      <div className="form-control">
                        {singleTeacher ? `${singleTeacher.staff.fname} ${singleTeacher.staff.lname}` : 'शिक्षक निवडले नाहीत'}
                      </div>
                      {warning && (
                        <div className='mt-2 text-danger'>
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>
                          या वर्गासाठी शिक्षक नियुक्त नाही
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">शैक्षणिक वर्ष</label>
                      <input
                        className={`form-control ${errors.academicYear ? 'is-invalid' : ''}`}
                        name='academicYear'
                        placeholder='उदा. 2024-25'
                        value={formData.academicYear}
                        readOnly
                      />
                      {errors.academicYear && <div className="invalid-feedback">{errors.academicYear}</div>}
                    </div>
                  </>
                )}



                <div className="text-center">
                  {showPassAndLeftButton ? (
                    <button type="submit" className="btn btn-info w-100 fw-bold">
                      Pass & Left म्हणून अपडेट करा
                    </button>
                  ) : (
                    (statusForFormLoad === 'Pass' || statusForFormLoad === 'Fail') && (
                      <button type="submit" className="btn btn-success w-100 fw-bold">
                        अपडेट करा
                      </button>
                    )
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateStudentAcademicYearForm;