import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Next from './Next';
import Swal from 'sweetalert2';

function AddNewStudentAcademicYearForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        division: '',
        standardId: '',
        academicYear: ''
    });

    const [studentData, setStudentData] = useState();
    const [divisions, setDivisions] = useState([]);
    const [standards, setStandards] = useState([]);
    const [singleTeacher, setSingleTeacher] = useState();
    const [classTeacherData, setClassTeacherData] = useState([]);
    const [warning, setWarning] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const schoolUdiseNo = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;


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

    // useEffect(() => {
    //     setFormData(prev => ({
    //         ...prev,
    //         standardId: studentData?.whichStandardAdmitted.id,
    //         academicYear: calculateAcademicYear()
    //     }));
    // }, []);

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
        apiService.getbyid("student/", id).then((response) => {
            setStudentData(response.data);
            // Set standardId when student data is loaded
            setFormData(prev => ({
                ...prev,
                standardId: response.data?.whichStandardAdmitted?.id || '',
                academicYear: calculateAcademicYear()
            }));
        }).catch(error => {
            console.error("Error fetching student data:", error);
        });

    }, [id, schoolUdiseNo]);

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

        if (warning) {
            setErrors({ submit: "कृपया वर्गासाठी शिक्षक नियुक्त करा" });
            return;
        }
        if (payload.classTeacher === null) {
            setErrors({ submit: "कृपया वर्गासाठी शिक्षक नियुक्त करा" });
            return;
        }

        apiService.postdata('academic/', payload).then((response) => {
            setSubmitted(true);
            setFormData({
                division: '',
                standardId: '',
                academicYear: ''
            });

            Swal.fire({
                title: "विद्यार्थ्याची शैक्षणिक माहिती यशस्वीरित्या जतन झाली!",
                icon: "success",
                draggable: true
              });
              navigate(`/clerk/AddAcademicNewStudents`);
            // setTimeout(() => {
                
            //     setSubmitted(false);
            // }, 1000);
        }).catch(error => {
            console.error("Error saving data:", error);
            setErrors({ submit: "डेटा जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा." });
            Swal.fire('त्रुटी!', "डेटा जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.", 'error');
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
                            <div className="bg-white bg-opacity-10 p-3 mt-3 rounded-3">
                                {studentData?.studentName && (
                                    <div className="student-info">
                                        <div className="d-flex align-items-center justify-content-center">
                                            <h5 className="mb-0 text-white fw-bold">
                                                {studentData?.studentName} {studentData?.fatherName} {studentData?.surName}
                                            </h5>
                                        </div>

                                        {studentData?.whichStandardAdmitted && (
                                            <div className="d-flex justify-content-center mt-2">
                                                <span className="badge bg-light text-primary px-3 py-2 fs-6">
                                                    इयत्ता: {studentData?.whichStandardAdmitted?.standard}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card-body p-4">
                            {errors.submit && (
                                <div className="alert alert-danger mb-3">{errors.submit}</div>
                            )}

                            <form onSubmit={handleSubmit} className="fs-6">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">इयत्ता</label>
                                    <input
                                        className="form-control"
                                        value={studentData?.whichStandardAdmitted.standard || ''}
                                        readOnly
                                    />
                                    {/* {errors.standardId && (
                                        <div className="invalid-feedback">{errors.standardId}</div>
                                    )} */}
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
                                            `${singleTeacher.staff.fname} ${singleTeacher.staff.fathername} ${singleTeacher.staff.lname}` :
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
                                        readOnly
                                    />
                                    {errors.academicYear && (
                                        <div className="invalid-feedback">{errors.academicYear}</div>
                                    )}
                                </div>

                                <div className="text-center mt-4">
                                    <button type="submit" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm" disabled={!singleTeacher}>
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
            <div className="card border-0 mt-4 rounded-0" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <div className="card-header bg-primary text-white p-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0 fw-bold fs-6">वर्गांची यादी</h3>
                        {/* {!error && ( */}
                            <div className="text-white">
                                एकूण वर्ग: {classTeacherData.length}
                            </div>
                        {/* )} */}
                    </div>
                </div>
                <div className="card-body p-0">
                    {classTeacherData.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th scope="col" width="5%" className="text-center">क्र.</th>
                                        <th scope="col" width="10%">इयत्ता</th>
                                        <th scope="col" width="10%">तुकडी</th>
                                        <th scope="col" width="25%" className="text-center">वर्ग  शिक्षकाचे नाव</th>
                                        {/* <th scope="col" width="25%" className="text-center"> वर्ग शिक्षकाचे आडनाव</th> */}
                                        {/* <th scope="col" width="10%">Status</th> */}
                                        {/* <th scope="col" width="15%" className="text-center">क्रिया</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {classTeacherData.map((classdata, index) => (
                                        <tr key={classdata.id || index}>
                                            <td className="text-center">{index + 1}</td>
                                            <td>{classdata?.standardMaster?.standard || '-'}</td>
                                            <td>{classdata?.division?.name || '-'}</td>
                                            <td>{classdata?.staff?.fname || '-'} {classdata?.staff?.fathername || '_'} {classdata?.staff?.lname}</td>
                                            {/* <td>{classdata?.staff?.lname || '-'}</td> */}
                                            {/* <td><span className={`badge ${classdata.status === 'left' ? 'bg-danger' : 'bg-success'}`}>
                                                                {classdata.status}
                                                            </span></td>      */}
                                            {/* <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-outline-warning"
                                                    style={{ fontSize: '0.8rem' }}
                                                    onClick={() => { navigate(`/clerk/editclassteacher/${classdata.id}`) }}
                                                >
                                                    वर्गशीक्षक बदला
                                                </button>
                                            </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                    ) : (
                        <div className="text-center py-4 text-muted">

                            {classTeacherData.length === 0  ?
                                "या शाळेसाठी वर्ग नोंदणी केली  नाही." : // No staff registered for this school
                                "दिलेल्या निकषांनुसार कोणताही वर्ग सापडला नाही." // No results matching search
                            }

                            {/* {classTeacherData.length > 0  && (searchFirstName || searchFatherName || searchSurName) &&
                                "शोध निकषांशी जुळणारे वर्ग नाहीत."
                            } */}
                        </div>
                    )}
                </div>
            </div>
        </div>


    );
}

export default AddNewStudentAcademicYearForm;