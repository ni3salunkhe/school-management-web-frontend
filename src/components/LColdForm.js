import React, { useState, useEffect } from 'react';
import apiService from '../services/api.service';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { decodeId, encodeId } from '../utils/idEncoder';

function LColdForm() {
    const { id:encodedId } = useParams();
    const id=decodeId(encodedId)
    const navigate = useNavigate();
    const udise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [studentData, setStudentData] = useState({});
    const [allLeavingInfos, setAllLeavingInfos] = useState([]);
    const date = new Date();
    const getCurrentDate = () => {
        const today = date;
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const [formData, setFormData] = useState({
        reasonOfLeavingSchool: '',
        progress: '',
        behavior: '',
        dateOfLeavingSchool: '',
        remark: '',
        lcNumber: '',
        lcDate: getCurrentDate(),
        otherRemark: '',
    });

    // Regular expression for Marathi text validation (including Devanagari characters and common punctuation)
    const marathiRegex = /^[\u0900-\u097F\u0020-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/;

    useEffect(() => {
        fetchStudentData();
    }, [udise]);

    const fetchStudentData = async () => {
        try {
            const response = await apiService.getbyid("student/", id);
            setStudentData(response.data);

            const lcdata = await apiService.getbyid("leavinginfo/getbyudise/", udise);
            setAllLeavingInfos(lcdata.data);

        } catch (err) {
            setError('विद्यार्थ्याची माहिती लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.');
        }
    }

    const validateMarathiText = (text) => {
        return marathiRegex.test(text);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validate Marathi text for specific fields in real-time
        if (['reasonOfLeavingSchool', 'progress', 'behavior', 'remark'].includes(name)) {
            if (value && !validateMarathiText(value)) {
                setValidationErrors({
                    ...validationErrors,
                    [name]: 'कृपया फक्त मराठी मजकूर प्रविष्ट करा'
                });
            } else {
                const newErrors = { ...validationErrors };
                delete newErrors[name];
                setValidationErrors(newErrors);
            }
        }

        if (name === "lcNumber") {
            const isDuplicate = allLeavingInfos.some(info => info.lcNumber === value);
            if (isDuplicate) {
                setValidationErrors({
                    ...validationErrors,
                    [name]: 'हा दाखला क्रमांक आधीच वापरात आहे'
                });
            } else {
                const newErrors = { ...validationErrors };
                delete newErrors[name];
                setValidationErrors(newErrors);
            }
        }

        setFormData({ ...formData, [name]: value });
    }

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        // Required field validation
        if (!formData.reasonOfLeavingSchool.trim()) {
            errors.reasonOfLeavingSchool = 'शाळा सोडल्याचे कारण आवश्यक आहे';
            isValid = false;
        }

        if (!formData.progress.trim()) {
            errors.progress = 'प्रगती प्रविष्ट करणे आवश्यक आहे';
            isValid = false;
        }

        if (!formData.behavior.trim()) {
            errors.behavior = 'वर्तन प्रविष्ट करणे आवश्यक आहे';
            isValid = false;
        }

        if (!formData.remark.trim()) {
            errors.remark = 'शेरा प्रविष्ट करणे आवश्यक आहे';
            isValid = false;
        }

        if (!formData.dateOfLeavingSchool) {
            errors.dateOfLeavingSchool = 'शाळा सोडल्याची दिनांक आवश्यक आहे';
            isValid = false;
        }

        if (!formData.lcNumber.trim()) {
            errors.lcNumber = 'दाखला क्रमांक आवश्यक आहे';
            isValid = false;
        }

        if (!formData.lcDate) {
            errors.lcDate = 'दाखला दिनांक आवश्यक आहे';
            isValid = false;
        }

        // Date validation (lcDate should not be before dateOfLeavingSchool)
        if (formData.dateOfLeavingSchool && formData.lcDate) {
            if (new Date(formData.lcDate) < new Date(formData.dateOfLeavingSchool)) {
                errors.dateOfLeavingSchool = 'दाखला दिनांक शाळा सोडल्याच्या दिनांकापेक्षा पूर्वीचा असू शकत नाही';
                isValid = false;
            }
        }

        if (formData.lcDate) {
            if (date === formData.lcDate) {
                error.lcDate = "दाखला दिनांक आजची असावी "
                isValid = false;
            }
        }

        setValidationErrors(errors);
        return isValid;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const payload = { ...formData, schoolUdise: udise, studentId: id };
            await apiService.post("leavinginfo/", payload);
            navigate(`/clerk/reports/download/${encodeId(id)}`);
        } catch (error) {
            setError('फॉर्म सबमिट करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
            console.error("Submission error:", error);
        }
    }

    if (error) {
        return (
            <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-light">
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
                    <div>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4 ">
            <div className="row justify-content-center">
                <div className="col-lg-9">
                    <div className="card shadow border-0 rounded-4">
                        <div className="card-header bg-primary text-white p-4 text-center position-relative overflow-hidden">
                            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10 bg-pattern"></div>
                            <h2 className="mb-0 fw-bold heading-font">शाळा सोडल्याची दाखला माहिती</h2>
                        </div>

                        <div className="card-body p-4">
                            {/* Student Info Section */}
                            <div className="mb-4 p-4 bg-light rounded-3 border-start border-5 border-primary">
                                <div className="d-flex flex-column align-items-center">
                                    <div className="text-center">
                                        <span className="fs-6 text-muted">विद्यार्थ्याचे नाव</span>
                                        <h3 className="mb-0 fw-bold text-primary">
                                            {studentData.studentName} {studentData.fatherName} {studentData.surName}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="fs-6">
                                <div className="row g-4">
                                    {/* Reason for Leaving School */}
                                    <div className="col-md-12">
                                        <div className="form-floating mb-1">
                                            <input
                                                type="text"
                                                name="reasonOfLeavingSchool"
                                                id="reasonOfLeavingSchool"
                                                className={`form-control form-control-lg ${validationErrors.reasonOfLeavingSchool ? 'is-invalid' : ''}`}
                                                value={formData.reasonOfLeavingSchool}
                                                onChange={handleChange}
                                                placeholder="शाळा सोडल्याचे कारण"
                                            />
                                            <label htmlFor="reasonOfLeavingSchool" className="form-label">शाळा सोडल्याचे कारण *</label>
                                            {validationErrors.reasonOfLeavingSchool && (
                                                <div className="invalid-feedback">
                                                    {validationErrors.reasonOfLeavingSchool}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <hr className="text-muted" />
                                    </div>

                                    {/* Progress and Behavior */}
                                    <div className="col-md-6">
                                        <div className="form-floating mb-1">
                                            <input
                                                type="text"
                                                name="progress"
                                                id="progress"
                                                className={`form-control ${validationErrors.progress ? 'is-invalid' : ''}`}
                                                value={formData.progress}
                                                onChange={handleChange}
                                                placeholder="प्रगती"
                                            />
                                            <label htmlFor="progress" className="form-label">प्रगती *</label>
                                            {validationErrors.progress && (
                                                <div className="invalid-feedback">
                                                    {validationErrors.progress}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-floating mb-1">
                                            <input
                                                type="text"
                                                name="behavior"
                                                id="behavior"
                                                className={`form-control ${validationErrors.behavior ? 'is-invalid' : ''}`}
                                                value={formData.behavior}
                                                onChange={handleChange}
                                                placeholder="वर्तन"
                                            />
                                            <label htmlFor="behavior" className="form-label">वर्तन *</label>
                                            {validationErrors.behavior && (
                                                <div className="invalid-feedback">
                                                    {validationErrors.behavior}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Remark */}
                                    <div className="col-md-6">
                                        <div className="form-floating mb-1">
                                            <input
                                                type="text"
                                                name="remark"
                                                id="remark"
                                                className={`form-control ${validationErrors.remark ? 'is-invalid' : ''}`}
                                                value={formData.remark}
                                                onChange={handleChange}
                                                placeholder="शेरा"
                                            />
                                            <label htmlFor="remark" className="form-label">शेरा *</label>
                                            {validationErrors.remark && (
                                                <div className="invalid-feedback">
                                                    {validationErrors.remark}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Date of Leaving School */}
                                    <div className="col-md-6">
                                        <div className="form-floating mb-1">
                                            <input
                                                type="date"
                                                name="dateOfLeavingSchool"
                                                id="dateOfLeavingSchool"
                                                className={`form-control ${validationErrors.dateOfLeavingSchool ? 'is-invalid' : ''}`}
                                                value={formData.dateOfLeavingSchool}
                                                onChange={handleChange}
                                            />
                                            <label htmlFor="dateOfLeavingSchool" className="form-label">शाळा सोडल्याची दिनांक *</label>
                                            {validationErrors.dateOfLeavingSchool && (
                                                <div className="invalid-feedback">
                                                    {validationErrors.dateOfLeavingSchool}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <hr className="text-muted" />
                                    </div>

                                    {/* LC Number */}
                                    <div className="col-md-6">
                                        <div className="form-floating mb-1">
                                            <input
                                                type="number"
                                                name="lcNumber"
                                                id="lcNumber"
                                                className={`form-control ${validationErrors.lcNumber ? 'is-invalid' : ''}`}
                                                value={formData.lcNumber}
                                                onChange={handleChange}
                                                placeholder="दाखला क्रमांक"
                                            />
                                            <label htmlFor="lcNumber" className="form-label">दाखला क्रमांक *</label>
                                            {validationErrors.lcNumber && (
                                                <div className="invalid-feedback">
                                                    {validationErrors.lcNumber}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* LC Date */}
                                    {/* <div className="col-md-6">
                                        <div className="form-floating mb-1">
                                            <input
                                                type="date"
                                                name="lcDate"
                                                id="lcDate"
                                                className={`form-control ${validationErrors.lcDate ? 'is-invalid' : ''}`}
                                                value={formData.lcDate}
                                                onChange={handleChange}
                                            />
                                            <label htmlFor="lcDate" className="form-label">दिनांक *</label>
                                            {validationErrors.lcDate && (
                                                <div className="invalid-feedback">
                                                    {validationErrors.lcDate}
                                                </div>
                                            )}
                                        </div>
                                    </div> */}
                                </div>

                                {/* Submit Button */}
                                <div className="d-grid gap-2 col-md-6 mx-auto mt-5">
                                    <button type="submit" className="btn btn-primary btn-lg py-3 fw-bold rounded-pill shadow">
                                        <i className="bi bi-check2-circle me-2"></i>
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

export default LColdForm;