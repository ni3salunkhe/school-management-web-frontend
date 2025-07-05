import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import apiService from '../services/api.service';
import Next from './Next';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

function EditClassTeacher() {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        staff: '',
    });
    const [classTeacherData, setClassTeacherData] = useState([]);
    const [allClassTeacherData, setAllClassTeacherData] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [warning, setWarning] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setError] = useState({});
    const [apierror, setApiError] = useState('');
    const [teachers, setTeachers] = useState([]);
    const school = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    const navigate = useNavigate();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getbyid("classteacher/", id);
            setClassTeacherData(response.data);
        } catch {
            console.log("data is not available");
            setApiError("डेटा लोड करण्यात अयशस्वी झाले!");
        } finally {
            setIsLoading(false);
        }
    };

    const getAllClassTeacherData = async () => {
        try {
            const response = await apiService.getbyid("classteacher/getbyudise/", school);
            setAllClassTeacherData(response.data);
            return response.data;
        } catch {
            setApiError("डेटा लोड करण्यात अयशस्वी झाले!");
            return [];
        }
    };

    const getAllTeacher = async () => {
        try {
            // First get all class teacher data
            const classTeachers = await getAllClassTeacherData();

            // Then get all staff
            const response = await apiService.getbyid("staff/getbyudise/", school);

            // Filter available teachers
            const availableTeachers = response.data
                .filter(staff =>
                    staff.role?.toLowerCase() === 'teacher' &&
                    staff.status?.toLowerCase() === 'working'
                )
                .filter(staff =>
                    !classTeachers.some(ct => ct.staff?.id === staff.id) ||
                    staff.id === classTeacherData?.staff?.id // Include current teacher
                );

            setTeachers(availableTeachers);
        } catch {
            setApiError("शिक्षकांचा डेटा लोड करण्यात अयशस्वी झाले!");
        }
    };

    useEffect(() => {
        const loadAllData = async () => {
            await fetchData();
            await getAllTeacher();
        };
        loadAllData();
    }, [id, school]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        const updatedFormData = {
            [name]: value
        };

        const newErrors = {};

        if (name === 'staff' && value) {
            const isAssigned = allClassTeacherData.some(
                (item) => item?.staff?.id?.toString() === value && item?.id !== parseInt(id)
            );

            if (isAssigned) {
                newErrors.staff = "हा शिक्षक आधीच एका वर्गासाठी नियुक्त आहे.";
            }
        }

        setError(newErrors);
        setFormData(updatedFormData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        const newErrors = {};
        if (!formData.staff) {
            newErrors.staff = "कृपया शिक्षक निवडा";
        }

        if (Object.keys(newErrors).length > 0) {
            setError(newErrors);
            setIsLoading(false);
            return;
        }

        apiService.putdata("classteacher/editclassteacher/", formData, id)
            .then(() => {
                setSubmitted(true);
                setWarning(false);
                setTimeout(() => {
                    navigate("/clerk/changeclassteacher");
                }, 1500);
            })
            .catch(() => {
                setWarning(true);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8 col-xl-7">
                    {/* Form Card */}
                    <div className="card shadow border-0 rounded-4 mb-4">
                        <div className="card-header bg-gradient-primary-to-secondary text-white p-4">
                            <div className="position-absolute top-0 end-0 m-3">
                                <Next classname={'btn btn-light btn-sm rounded-circle shadow-sm'} path={'/clerk/list'} placeholder={<i className="bi bi-x-lg"></i>}></Next>
                            </div>
                            <h3 className="mb-0 fw-bold fs-4 text-center">वर्गशिक्षक बदलणे</h3>

                            {classTeacherData?.staff && (
                                <div className="d-flex align-items-center justify-content-center mt-3">
                                    <div className="px-4 py-2 rounded-pill bg-white bg-opacity-25 d-flex align-items-center">
                                        <i className="bi bi-person-check me-2 fs-5"></i>
                                        <p className="mb-0">
                                            सध्याचे वर्ग शिक्षक: <span className="fw-bold">
                                                {classTeacherData?.staff?.fname || '...'} {classTeacherData?.staff?.fathername || '...'} {classTeacherData?.staff?.lname || '...'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="card-body p-4">
                            {apierror && (
                                <div className="alert alert-danger d-flex align-items-center mb-4">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {apierror}
                                </div>
                            )}

                            {isLoading && !submitted ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3 text-muted">माहिती लोड करत आहे...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="fs-6">
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-semibold">
                                                <i className="bi bi-bookmark me-1 text-primary"></i>
                                                इयत्ता
                                            </label>
                                            <input
                                                className="form-control form-control-lg bg-light"
                                                value={classTeacherData?.standardMaster?.standard || ''}
                                                readOnly
                                            />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-semibold">
                                                <i className="bi bi-grid me-1 text-primary"></i>
                                                तुकडी
                                            </label>
                                            <input
                                                className="form-control form-control-lg bg-light"
                                                value={classTeacherData?.division?.name || ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-person me-1 text-primary"></i>
                                            शिक्षक निवडा
                                        </label>
                                        <select
                                            className={`form-select form-select-lg ${errors.staff ? 'is-invalid' : ''}`}
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
                                            <div className="invalid-feedback">
                                                <i className="bi bi-exclamation-circle me-1"></i>
                                                {errors.staff}
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-grid mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg py-3 rounded-3 shadow-sm"
                                            disabled={isLoading || warning}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    प्रक्रिया करत आहे...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    जतन करा
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {submitted && (
                                        <div className="alert alert-success d-flex align-items-center mt-4">
                                            <i className="bi bi-check-circle-fill me-2"></i>
                                            वर्गशिक्षक यशस्वीरित्या जतन झाला!
                                        </div>
                                    )}
                                    {warning && (
                                        <div className="alert alert-danger d-flex align-items-center mt-4">
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                            या वर्गासाठी शिक्षक आधीच नियुक्त आहे.
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="card shadow border-0 rounded-4 overflow-hidden">
                        <div className="card-header bg-gradient-primary-to-secondary text-white p-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h3 className="mb-0 fw-bold fs-5">
                                    <i className="bi bi-list-ul me-2"></i>
                                    वर्गांची यादी
                                </h3>
                                <div className="bg-white bg-opacity-25 px-3 py-1 rounded-pill text-white">
                                    <i className="bi bi-grid-3x3-gap me-1"></i>
                                    एकूण वर्ग: <span className="fw-bold">{allClassTeacherData.length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card-body p-0">
                            {isLoading && allClassTeacherData.length === 0 ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3 text-muted">माहिती लोड करत आहे...</p>
                                </div>
                            ) : allClassTeacherData.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th scope="col" width="5%" className="text-center">क्र.</th>
                                                <th scope="col" width="15%">इयत्ता</th>
                                                <th scope="col" width="15%">तुकडी</th>
                                                <th scope="col">वर्ग शिक्षकाचे नाव</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allClassTeacherData.map((classdata, index) => (
                                                <tr key={classdata.id || index} className={classdata.id === parseInt(id) ? "table-primary" : ""}>
                                                    <td className="text-center fw-bold">{index + 1}</td>
                                                    <td>
                                                        <span className="badge bg-info text-dark fs-6 px-3 py-2 rounded-pill">
                                                            {classdata?.standardMaster?.standard || '-'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary fs-6 px-3 py-2 rounded-pill">
                                                            {classdata?.division?.name || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="fs-6">
                                                        <div>
                                                            {classdata?.staff?.fname || '-'} {classdata?.staff?.fathername || ''} {classdata?.staff?.lname || ''}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <i className="bi bi-info-circle text-muted fs-1"></i>
                                    <p className="text-muted mt-3">
                                        {allClassTeacherData.length === 0 ?
                                            "या शाळेसाठी वर्ग नोंदणी केली नाही." :
                                            "दिलेल्या निकषांनुसार कोणताही वर्ग सापडला नाही."
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style >{`
        .bg-gradient-primary-to-secondary {
          background: linear-gradient(135deg,rgb(84, 171, 247) 0%,rgb(154, 110, 235) 100%);
        }
        
        .form-control, .form-select {
          border: 1px solid #dee2e6;
          padding: 0.75rem 1rem;
        }
        
        .form-control:focus, .form-select:focus {
          border-color: #1e88e5;
          box-shadow: 0 0 0 0.25rem rgba(30, 136, 229, 0.25);
        }
        
        .btn-primary {
          background-color: #1e88e5;
          border-color: #1e88e5;
        }
        
        .btn-primary:hover {
          background-color: #1976d2;
          border-color: #1976d2;
        }
        
        .table-primary {
          background-color: rgba(30, 136, 229, 0.1);
        }
      `}</style>
        </div>
    );
}

export default EditClassTeacher;