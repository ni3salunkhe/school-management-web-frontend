import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import { jwtDecode } from 'jwt-decode';
import Next from './Next';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
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
                setClassTeacherData(classteacherRes.data);
    
                // Now filter only after class teacher data is available
                const availableTeachers = teachersRes.data
                    .filter(staff => staff.role?.toLowerCase() === 'teacher' && staff.status?.toLowerCase() === 'working')
                    .filter(staff => !classteacherRes.data.some(ct => ct.staff?.id === staff.id));
    
                setTeachers(availableTeachers);
    
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

        const result = await Swal.fire({
            title: 'वर्गशिक्षक नियुक्ती जतन करायचे आहे का?',
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'जतन करा',
            denyButtonText: 'जतन करा आणि पुढे चला',
            cancelButtonText: 'रद्द करा'
        });

        if (result.isConfirmed || result.isDenied) {
            try {
                setIsLoading(true);
                setApiError(null);

                const payload = { ...formData, schoolUdiseNo };
                await apiService.postdata("classteacher/", payload);

                // Refresh data after successful submission
                const response = await apiService.getbyid("classteacher/getbyudise/", schoolUdiseNo);
                setClassTeacherData(response.data);
                await Swal.fire({
                    title: "वर्गशिक्षक नियुक्ती यशस्वीरीत्या संपादित केली आहे ..!",
                    icon: "success",
                    draggable: true
                });

                setSubmitted(true);
                setFormData({
                    division: '',
                    staff: '',
                    standardMaster: ''
                });

                setTimeout(() => setSubmitted(false), 1500);



                if (result.isDenied) {
                    navigate('/clerk/AddAcademicNewStudents');
                }

            } catch (error) {
                console.error("Error:", error);
                Swal.fire('त्रुटी!', 'डेटा जतन करण्यात अडचण आली.', 'error');
            } finally {
                setIsLoading(false);
            }
        }
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
                            <h3 className="mb-0 fw-bold fs-4 heading-font">वर्गशिक्षक नियुक्ती</h3>
                        </div>

                        <div className="card-body p-4">
                            {apiError && (
                                <div className="alert alert-danger mb-4">{apiError}</div>
                            )}

                            <form onSubmit={handleSubmit} className="fs-6">
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
                                                {teacher.fname} {teacher.fathername} {teacher.lname}
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
                                    {/* <Next classname={'btn btn-success px-4 py-2 rounded-pill shadow-sm'} path={'/clerk/AddAcademicNewStudents'} placeholder={'पुढे चला'}></Next> */}
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

            <div className="card border-0 mt-4 rounded-0" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <div className="card-header bg-primary text-white p-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0 fw-bold fs-6">वर्गांची यादी</h3>
                        {/* {!error && ( */}
                        <div className="text-white">
                            एकूण वर्ग: {classteacherdata.length}
                        </div>
                        {/* )} */}
                    </div>
                </div>
                <div className="card-body p-0">
                    {classteacherdata.length > 0 ? (
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
                                    {classteacherdata.map((classdata, index) => (
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

                            {classteacherdata.length === 0 ?
                                "या शाळेसाठी वर्ग नोंदणी केली  नाही." : // No staff registered for this school
                                "दिलेल्या निकषांनुसार कोणताही वर्ग सापडला नाही." // No results matching search
                            }

                            {/* {classteacherdata.length > 0  && (searchFirstName || searchFatherName || searchSurName) &&
                                "शोध निकषांशी जुळणारे वर्ग नाहीत."
                            } */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddClassTeacher;