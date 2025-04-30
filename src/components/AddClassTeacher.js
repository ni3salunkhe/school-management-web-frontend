import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import { jwtDecode } from 'jwt-decode';
import Next from './Next';

function AddClassTeacher() {
    const [formData, setFormData] = useState({
        division: '',
        staff: '',
        standardMaster: ''
    });

    const [divisions, setDivisions] = useState([]);
    const [standards, setStandards] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classteacherdata, setClassTeacherData] = useState([]);
    const [errors, setErrors] = useState({});
    const [warning, setWarning] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const schoolUdiseNo = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setApiError(null);
                
                const [divisionsRes, standardsRes, teachersRes, classteacherRes] = await Promise.all([
                    apiService.getbyid("Division/getbyudise/", schoolUdiseNo),
                    apiService.getbyid("standardmaster/getbyudise/", schoolUdiseNo),
                    apiService.getbyid("staff/getbyudise/", schoolUdiseNo),
                    apiService.getbyid("classteacher/getbyudise/", schoolUdiseNo)
                ]);

                setDivisions(divisionsRes.data);
                setStandards(standardsRes.data);
                setTeachers(teachersRes.data.filter(staff => staff.role?.toLowerCase() === 'teacher'));
                setClassTeacherData(classteacherRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                setApiError("डेटा लोड करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [schoolUdiseNo]);

    function handleChange(event) {
        const { name, value } = event.target;

        const updatedFormData = {
            ...formData,
            [name]: value
        };

        const newErrors = { ...errors };
        delete newErrors[name]; // Clear any existing error for this field

        // Check if teacher is already assigned
        if (name === 'staff' && value) {
            const isAssigned = classteacherdata.some(
                (item) => item?.staff?.id?.toString() === value
            );

            if (isAssigned) {
                newErrors.staff = "हा शिक्षक आधीच एका वर्गासाठी नियुक्त आहे.";
            }
        }

        // Check if standard+division pair is already assigned
        if (updatedFormData.standardMaster && updatedFormData.division) {
            const isCombinationAssigned = classteacherdata.some(
                (item) =>
                    item?.standardMaster?.id?.toString() === updatedFormData.standardMaster.toString() &&
                    item?.division?.id?.toString() === updatedFormData.division.toString()
            );

            setWarning(isCombinationAssigned);
        } else {
            setWarning(false);
        }

        setErrors(newErrors);
        setFormData(updatedFormData);
    }

    function validateForm() {
        const newErrors = {};

        if (!formData.division) {
            newErrors.division = "कृपया तुकडी निवडा.";
        }
        if (!formData.staff) {
            newErrors.staff = "कृपया शिक्षक निवडा.";
        }
        if (!formData.standardMaster) {
            newErrors.standardMaster = "कृपया इयत्ता निवडा.";
        }

        return newErrors;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (warning) {
            return;
        }

        try {
            setIsLoading(true);
            setApiError(null);

            const payload = { ...formData, schoolUdiseNo };
            await apiService.postdata("classteacher/", payload);

            // Refresh data after successful submission
            const response = await apiService.getbyid("classteacher/getbyudise/", schoolUdiseNo);
            setClassTeacherData(response.data);

            setSubmitted(true);
            setFormData({
                division: '',
                staff: '',
                standardMaster: ''
            });

            setTimeout(() => setSubmitted(false), 1500);
        } catch (error) {
            console.error("Error saving class teacher:", error);
            setApiError("वर्गशिक्षक जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-header bg-primary bg-gradient text-white p-3 text-center">
                            <h3 className="mb-0 fw-bold fs-4 heading-font">वर्गशिक्षक नियुक्ती</h3>
                        </div>

                        <div className="card-body p-4">
                            {apiError && (
                                <div className="alert alert-danger mb-4">{apiError}</div>
                            )}

                            <form onSubmit={handleSubmit} className="fs-6">
                                {/* Division Select */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">तुकडी</label>
                                    <select
                                        className={`form-select form-select-sm ${errors.division ? 'is-invalid' : ''}`}
                                        name="division"
                                        value={formData.division}
                                        onChange={handleChange}
                                        disabled={isLoading}
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
                                        className={`form-select form-select-sm ${errors.standardMaster ? 'is-invalid' : ''}`}
                                        name="standardMaster"
                                        value={formData.standardMaster}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    >
                                        <option value="">-- इयत्ता निवडा --</option>
                                        {standards.map(standard => (
                                            <option key={standard.id} value={standard.id}>
                                                {standard.standard}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.standardMaster && (
                                        <div className="invalid-feedback">{errors.standardMaster}</div>
                                    )}
                                </div>

                                {/* Staff Select */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">शिक्षक</label>
                                    <select
                                        className={`form-select form-select-sm ${errors.staff ? 'is-invalid' : ''}`}
                                        name="staff"
                                        value={formData.staff}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    >
                                        <option value="">-- शिक्षक निवडा --</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.fname}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.staff && (
                                        <div className="invalid-feedback">{errors.staff}</div>
                                    )}
                                </div>

                                <div className="text-center mt-4 gap-5">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary px-4 py-2 rounded-pill shadow-sm"
                                        disabled={isLoading || warning}
                                    >
                                        {isLoading ? 'प्रक्रिया करत आहे...' : 'जतन करा'}
                                    </button>
                                    <Next classname={'btn btn-success px-4 py-2 rounded-pill shadow-sm'} path={'/clerk/AddAcademicNewStudents'} placeholder={'पुढे चला'}></Next>
                                </div>


                                {submitted && (
                                    <div className="mt-3 text-success">वर्गशिक्षक यशस्वीरित्या जतन झाला!</div>
                                )}
                                {warning && (
                                    <div className="mt-3 text-danger">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        या वर्गासाठी शिक्षक आधीच नियुक्त आहे.
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddClassTeacher;