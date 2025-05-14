import React from 'react'
import apiService from '../services/api.service';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

function UpdateStudentAllAcademic() {
    const { id } = useParams();

    // console.log(id);

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
    const [statusForFormLoad, setStatusForFormLoad] = useState();
    const [promotedStandard, setPromotedStandard] = useState();

    const { selectedStudents } = location.state || { selectedStudents: [] };
    console.log(selectedStudents);

    const schoolUdiseNo = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    const studentId = selectedStudents[0];
    // console.log(studentId);

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
        if (currentMonth >= 5) {
            return `${currentYear}-${String(currentYear + 1).slice(-2)}`;
        }
        // For January (0) to May (4), academic year is previousYear-currentYear
        return `${currentYear - 1}-${String(currentYear).slice(-2)}`;
    };

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            academicYear: calculateAcademicYear()
        }));
    }, []);

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
            console.log(response.data);
            setAcademicData(response.data);
        })
    }, []);

    console.log(teachers);
    // console.log(classTeacherData);

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
        } else if (!['Pass', 'Fail', "PassAndLeft"].includes(formData.status)) {
            newErrors.status = "कृपया valid status निवडा (pass, fail, PassAndLeft)";
        }

        return newErrors;
    }


    function handleSubmit(event) {
        event.preventDefault();


        // const validationErrors = validateForm();
        // if (Object.keys(validationErrors).length > 0) {
        //     setErrors(validationErrors);
        //     return;
        // }

        if (statusForFormLoad === 'Pass' &&
            academicdata?.standard?.id &&
            parseInt(formData.standardId) <= academicdata.standard.id) {
            alert("इयत्ता बदला (Please change the standard)");
            return;
        }

        const payload = {
            ...formData,
            studentIds: selectedStudents,
            schoolUdiseNo,
            classTeacher: singleTeacher?.id
        };
        api.put("http://localhost:8080/academic/update-student/bulk", payload).then((response) => {
            Swal.fire({
                title: "विद्यार्थ्याची शैक्षणीक माहिती संपादित केली आहे..!",
                icon: "success",
                draggable: true
            });
            navigate(`/teacher/Updateyear`);
        }).catch(() => {
            Swal.fire({
                title: "Error",
                text: "माहिती अपडेट करताना त्रुटी आली",
                icon: "error"
            });
        });



        // console.log(payload);

        // apiService.putdata('academic/update-status/', payload, academicdata.id).then((response) => {
        //     alert("Data Added Succesfully");
        // });


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


                                <div className="mb-4">
                                    <label className="form-label ">विद्यार्थी पास आहेत का नापास ? </label>
                                    <select
                                        className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                                        name='status'
                                        value={formData.status}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setStatusForFormLoad(value);
                                            setFormData(prev => ({ ...prev, status: value }));
                                            if (errors.status) setErrors(prev => ({ ...prev, status: '' }));
                                        }}
                                    >
                                        <option value="">-- Status निवडा --</option>
                                        <option value="Pass">Pass</option>
                                        <option value="Fail">Fail</option>
                                        <option value="PassAndLeft">Pass & Left (उत्तीर्ण आणि शाळा सोडली)</option>
                                    </select>
                                    {errors.status && <div className="invalid-feedback">{errors.status}</div>}
                                </div>

                                {(statusForFormLoad === "Pass" || statusForFormLoad === "Fail") && (
                                    <>
                                        {/* Standard Select */}
                                        {statusForFormLoad === 'Pass' && (
                                            <>
                                                <div className="mb-3">
                                                    <label className="form-label">इयत्ता</label>
                                                    <input
                                                        className='form-control'
                                                        value={promotedStandard?.standard || ''}
                                                        readOnly
                                                    />
                                                    {errors.standardId && <div className="invalid-feedback">{errors.standardId}</div>}
                                                </div>
                                            </>
                                        )}

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


                                        {/* Staff Select */}
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
                                                readOnly
                                            />
                                            {errors.academicYear && (
                                                <div className="invalid-feedback">{errors.academicYear}</div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="text-center mt-4">
                                    {
                                        statusForFormLoad === "PassAndLeft" ? (<button type="submit" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
                                            Pass & Left म्हणून अपडेट करा
                                        </button>) : (<button type="submit" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
                                            जतन करा
                                        </button>)
                                    }
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpdateStudentAllAcademic