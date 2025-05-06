import React, { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import apiService from '../services/api.service';
import Next from './Next';
import { jwtDecode } from 'jwt-decode';

function EditClassTeacher() {

    const { id } = useParams();
    const [formData, setFormData] = useState({
        staff: '',
    })
    const [classTeacherData, setClassTeacherData] = useState([]);
    const [allClassTeacherData, setAllClassTeacherData] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [warning, setWarning] = useState();
    const [isLoading, setIsLoading] = useState();
    const [errors, setError] = useState({});
    const [apierror, setApiError] = useState('');
    const [teachers, setTeachers] = useState([]);
    const school = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

    const fetchData = async () => {
        try {
            await apiService.getbyid("classteacher/", id).then((response) => {
                console.log(response.data);
                setClassTeacherData(response.data);
            })
        }
        catch {
            console.log("data is not available");
            setApiError("Failed to load Data")
        }
    }

    const getAllClassTeacherData = async () => {
        try {
           await apiService.getbyid("classteacher/getbyudise/", school).then((response) => {
                console.log(response.data);
                setAllClassTeacherData(response.data);
            })
        }
        catch {
            setApiError("Failed to load data");
        }
    }

    const getAllTeacher = async () => {
        try {
            await apiService.getbyid("staff/getbyudise/", school).then((response) => {
                const activeTeachers = response.data.filter(teacher => teacher.role.toLowerCase() === "teacher" && teacher.status.toLowerCase() === "working");

                const unassignedTeachers = activeTeachers.filter(teacher => {
                    return !allClassTeacherData.some(
                        classTeacher => classTeacher.staff?.id === teacher.id
                    );
                });
                setTeachers(unassignedTeachers);
            
                // setTeachers(activeTeachers);
            })
        }
        catch {
            setApiError("Failed to load Teachers Data please load Again !");
        }
    }

    useEffect(() => {
        fetchData();
        getAllTeacher();
        getAllClassTeacherData();
    }, [id, school])

    const handleChange = (event) => {
        const { name, value } = event.target;
        const upadatedFormData = {
            [name]: value
        }

        const newErrors = {}

        if (name === 'staff' && value) {
            const isAssigned = allClassTeacherData.some(
                (item) => item?.staff?.id?.toString() === value
            );

            if (isAssigned) {
                newErrors.staff = "हा शिक्षक आधीच एका वर्गासाठी नियुक्त आहे.";
            }
        }

        setError(newErrors);

        setFormData(upadatedFormData)

    }

    const handleSubmit = (e) => {
        e.preventDefault(); // prevent default form submission

        const newErrors = {};
        if (!formData.staff) {
            newErrors.staff = "कृपया शिक्षक निवडा";
        }

        if (Object.keys(newErrors).length > 0) {
            setError(newErrors);
            return;
        }

        apiService.putdata("classteacher/editclassteacher/", formData, id)
            .then((response) => {
                setSubmitted(true);
                setWarning(false);
                // alert("डेटा यशस्वीरित्या जतन झाला!");
                Navigate("clerck/classteacher")
            })
            .catch(() => {
                setWarning(true);
            });
    };

    return (
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-header bg-primary bg-gradient text-white p-3 text-center">
                            <div className="position-absolute top-0 end-0 m-2">
                                <Next classname={'btn bg-danger text-white btn-sm'} path={'/clerk/list'} placeholder={'X'}></Next>
                            </div>
                            <h3 className="mb-0 fw-bold fs-4 heading-font">वर्गशिक्षक बदलणे फॉर्म </h3>
                            <p className='mb-0 small'>सध्याचे वर्ग शिक्षक: {classTeacherData?.staff?.fname || '...'} {classTeacherData?.staff?.fathername || '...'} {classTeacherData?.staff?.lname || '...'}</p>
                        </div>

                        <div className="card-body p-4">
                            {apierror && (
                                <div className="alert alert-danger mb-4">{apierror}</div>
                            )}

                            <form onSubmit={handleSubmit} className="fs-6">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">इयत्ता</label>
                                    {/* <select
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
                                    </select> */}
                                    <input className='form-control' value={classTeacherData?.standardMaster?.standard}></input>
                                    {errors.standardMaster && (
                                        <div className="invalid-feedback">{errors.standardMaster}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">तुकडी</label>
                                    {/* <select
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
                                    </select> */}
                                    <input className='form-control' value={classTeacherData?.division?.name}></input>
                                    {errors.division && (
                                        <div className="invalid-feedback">{errors.division}</div>
                                    )}
                                </div>


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
                            एकूण वर्ग: {allClassTeacherData.length}
                        </div>
                        {/* )} */}
                    </div>
                </div>
                <div className="card-body p-0">
                    {allClassTeacherData.length > 0 ? (
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
                                    {allClassTeacherData.map((classdata, index) => (
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

                            {allClassTeacherData.length === 0 ?
                                "या शाळेसाठी वर्ग नोंदणी केली  नाही." : // No staff registered for this school
                                "दिलेल्या निकषांनुसार कोणताही वर्ग सापडला नाही." // No results matching search
                            }

                            {/* {allClassTeacherData.length > 0  && (searchFirstName || searchFatherName || searchSurName) &&
                                "शोध निकषांशी जुळणारे वर्ग नाहीत."
                            } */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EditClassTeacher
