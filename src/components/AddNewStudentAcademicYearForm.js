import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Next from './Next';

function AddNewStudentAcademicYearForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        division: '',
        standardId: '',
        academicYear: ''
    });

    const [divisions, setDivisions] = useState([]);
    const [standards, setStandards] = useState([]);
    const [singleTeacher, setSingleTeacher] = useState();
    const [classTeacherData, setClassTeacherData] = useState([]);
    const [warning, setWarning] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const schoolUdiseNo = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

    useEffect(() => {
        apiService.getbyid("Division/getbyudise/", schoolUdiseNo).then((response) => {
            setDivisions(response.data);
        });
        apiService.getbyid("standardmaster/getbyudise/", schoolUdiseNo).then((response) => {
            setStandards(response.data);
        });
        apiService.getbyid("classteacher/getbyudise/", schoolUdiseNo).then((response) => {
            setClassTeacherData(response.data);
        });
    }, []);

    useEffect(() => {
        if (formData.division && formData.standardId) {
            const filter = classTeacherData.find(ct =>
                ct?.division?.id === parseInt(formData.division) &&
                ct?.standardMaster?.id === parseInt(formData.standardId)
            );
            setSingleTeacher(filter);
            setWarning(!filter);
        } else {
            setSingleTeacher(null);
        }
    }, [formData.division, formData.standardId, classTeacherData]);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error when user starts typing
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
        return newErrors;
    }

    function handleSubmit(event) {
        event.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const payload = {
            ...formData,
            studentId: id,
            schoolUdiseNo,
            classTeacher: singleTeacher?.id
        };

        apiService.postdata('academic/', payload).then((response) => {
            setSubmitted(true);
            setFormData({
                division: '',
                standardId: '',
                academicYear: ''
            });

            setTimeout(() => {
                navigate(`/clerk/AddAcademicNewStudents`);
                setSubmitted(false);
            }, 2000);
        }).catch(error => {
            console.error("Error saving data:", error);
            setErrors({ submit: "डेटा जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा." });
        });
    }

    return (
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-header bg-primary bg-gradient text-white p-3 text-center">
                        <div className="position-absolute top-0 end-0 m-2">
                                <Next classname={'btn bg-danger text-white btn-sm'} path={'/clerk/list'} placeholder={'X'}></Next>
                            </div>
                            <h3 className="mb-0 fw-bold fs-4 heading-font">विद्यार्थि शैक्षणिक माहिती अपडेट करा</h3>
                        </div>

                        <div className="card-body p-4">
                            {errors.submit && (
                                <div className="alert alert-danger mb-3">{errors.submit}</div>
                            )}

                            <form onSubmit={handleSubmit} className="fs-6">

                                {/* Standard Select */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">इयत्ता</label>
                                    <select
                                        className={`form-select form-select-sm ${errors.standardId ? 'is-invalid' : ''}`}
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


                                {/* Division Select */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">तुकडी</label>
                                    <select
                                        className={`form-select form-select-sm ${errors.division ? 'is-invalid' : ''}`}
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


                                {/* Teacher Display */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">शिक्षक</label>
                                    <div className={`form-control form-control-sm ${errors.teacher ? 'is-invalid' : ''}`}>
                                        {singleTeacher ?
                                            `${singleTeacher.staff.fname} ${singleTeacher.staff.lname}` :
                                            'शिक्षक निवडले नाहीत'}
                                    </div>
                                    {/* {errors.teacher && (
                                        <div className="invalid-feedback">{errors.teacher}</div>
                                    )} */}

                                    {warning && (
                                        <div className='text-danger'>
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                            या वर्गासाठी कोणताही शिक्षक नियुक्त केला नाही</div>
                                    )}
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

                                <div className="text-center mt-4">
                                    <button type="submit" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
                                        जतन करा
                                    </button>
                                </div>

                                {submitted && (
                                    <div className="mt-3 text-success">विद्यार्थ्याची शैक्षणिक माहिती यशस्वीरित्या जतन झाली!</div>
                                )}

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddNewStudentAcademicYearForm;