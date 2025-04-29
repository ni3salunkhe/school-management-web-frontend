import React, { useEffect, useState } from 'react';
import { BiSearch, BiUserCheck } from 'react-icons/bi';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import apiService from '../services/api.service';


function StudentList() {
    const [surName, setSurName] = useState('');
    const [studentName, setStudentName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const udise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    const [teacherId, setTeacherId] = useState('');
    const [teachers, setTeachers] = useState([]);
    const [showSearchForm, setShowSearchForm] = useState(false);

    const navigate = useNavigate();

    const fetchStudents = (searchParams = {}) => {
        if (!teacherId) {
            return;
        }

        setLoading(true);
        const params = { udise, ...searchParams };
        
        axios.get(`http://localhost:8080/student/byclass/${teacherId}`,{
            headers: {
              "Authorization": `Bearer ${sessionStorage.getItem('token')}`
            }
          })
            .then(response => {
                setResults(response.data);
                setLoading(false);
                console.log(response.data);
                
            })
            .catch((error) => {
                console.error('Error fetching students', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (teacherId) {
            fetchStudents();
        }
    }, [teacherId]);

    useEffect(() => {
        apiService.getbyid("staff/getbyudise/", udise).then((response) => {
            const allStaff = response.data;
            const onlyTeachers = allStaff.filter((staff) => staff.role.toLowerCase() === "teacher");
            setTeachers(onlyTeachers);
            console.log(onlyTeachers);
        });
    }, [udise]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!teacherId) return;

            const hasSearch =
                surName.trim() || studentName.trim() || fatherName.trim() || motherName.trim();

            const params = {};
            if (surName.trim()) params.surName = surName.trim();
            if (studentName.trim()) params.studentName = studentName.trim();
            if (fatherName.trim()) params.fatherName = fatherName.trim();
            if (motherName.trim()) params.motherName = motherName.trim();

            if (hasSearch) {
                fetchStudents(params);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [surName, studentName, fatherName, motherName, teacherId]);

    useEffect(() => {
        if (studentName || surName || fatherName || motherName) {
            const filteredResults = results.filter(student => {
                return (
                    student.studentName?.toLowerCase().includes(studentName.toLowerCase()) ||
                    student.surName?.toLowerCase().includes(surName.toLowerCase()) ||
                    student.fatherName?.toLowerCase().includes(fatherName.toLowerCase()) ||
                    student.motherName?.toLowerCase().includes(motherName.toLowerCase())
                );
            });
            setSuggestions(filteredResults);
        } else {
            setSuggestions([]);
        }
    }, [studentName, surName, fatherName, motherName, results]);

    const handleClick = (id) => {
        navigate(`/clerk/reports/${id}`);
    };

    const viewInfo = (id) => {
        navigate(`/clerk/singlestudentinfo/${id}`);
    };

    const toggleSearchForm = () => {
        setShowSearchForm(!showSearchForm);
    };

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    <div className="text-center mb-4">
                        <div className="p-4 bg-white rounded shadow" >
                            <h2 className="fw-bold text-dark mb-0" style={{ fontSize: '2rem' }}>
                                <FaUserGraduate className="me-2 text-primary" />
                                सर्व विद्यार्थ्याची यादी
                            </h2>
                        </div>
                    </div>

                    <div className="card border-0 rounded shadow-sm mb-4" style={{ background: 'linear-gradient(to right, #f9f9f9, #f3f6fd)' }}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="card-title text-dark d-flex align-items-center mb-0">
                                    <FaChalkboardTeacher className="me-2 text-primary" size={20} />
                                    शिक्षक निवडा
                                </h5>
                                {teacherId && (
                                    <button 
                                        className="btn btn-sm btn-outline-primary" 
                                        onClick={toggleSearchForm}
                                    >
                                        {showSearchForm ? 'शोध फॉर्म लपवा' : 'अधिक शोध पर्याय'}
                                    </button>
                                )}
                            </div>
                            
                            <div className="row">
                                <div className="col-md-8 col-lg-6 mx-auto">
                                    <div className="select-container position-relative">
                                        <select
                                            className="form-select form-select-lg py-3 shadow-sm bg-white"
                                            value={teacherId}
                                            onChange={(e) => setTeacherId(e.target.value)}
                                            style={{ borderLeft: '4px solid #4361ee', fontSize: '1rem' }}
                                        >
                                            <option value="">-- शिक्षक निवडा --</option>
                                            {teachers.map((teacher) => (
                                                <option key={teacher.id} value={teacher.id}>
                                                    {teacher.fname} {teacher.lname}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {showSearchForm && teacherId && (
                                <div className="mt-4 pt-3 border-top">
                                    <h6 className="mb-3 text-primary">विद्यार्थी शोधा</h6>
                                    <div className="row">
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label small mb-1">विद्यार्थ्याचे नाव</label>
                                            <input
                                                value={studentName}
                                                onChange={e => setStudentName(e.target.value)}
                                                className="form-control shadow-sm"
                                                placeholder="नाव"
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label small mb-1">आडनाव</label>
                                            <input
                                                value={surName}
                                                onChange={e => setSurName(e.target.value)}
                                                className="form-control shadow-sm"
                                                placeholder="आडनाव"
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label small mb-1">वडिलांचे नाव</label>
                                            <input
                                                value={fatherName}
                                                onChange={e => setFatherName(e.target.value)}
                                                className="form-control shadow-sm"
                                                placeholder="वडिलांचे नाव"
                                            />
                                        </div>
                                        <div className="col-md-3 mb-3">
                                            <label className="form-label small mb-1">आईचे नाव</label>
                                            <input
                                                value={motherName}
                                                onChange={e => setMotherName(e.target.value)}
                                                className="form-control shadow-sm"
                                                placeholder="आईचे नाव"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <button
                                            onClick={() => {
                                                const params = {};
                                                if (surName.trim()) params.surName = surName.trim();
                                                if (studentName.trim()) params.studentName = studentName.trim();
                                                if (fatherName.trim()) params.fatherName = fatherName.trim();
                                                if (motherName.trim()) params.motherName = motherName.trim();
                                                fetchStudents(params);
                                            }}
                                            className="btn btn-primary px-4"
                                            disabled={loading}
                                        >
                                            <BiSearch className="me-2" /> शोधा
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {!teacherId && (
                        <div className="text-center py-5 my-4 bg-light rounded shadow-sm">
                            <FaChalkboardTeacher size={50} className="text-secondary mb-3" />
                            <h4>कृपया सुरू करण्यासाठी शिक्षक निवडा</h4>
                            <p className="text-muted">विद्यार्थ्यांची यादी पाहण्यासाठी वरील ड्रॉपडाउनमधून शिक्षक निवडा.</p>
                        </div>
                    )}

                    {teacherId && loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-muted">विद्यार्थ्यांची यादी लोड होत आहे...</p>
                        </div>
                    ) : teacherId && (
                        <div className="card border-0 rounded shadow">
                            <div className="card-header bg-primary text-white p-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="mb-0 fw-bold fs-5 d-flex align-items-center">
                                        <BiUserCheck className="me-2" size={22} />
                                        विद्यार्थ्यांची यादी
                                    </h3>
                                    <span className="badge bg-light text-primary rounded-pill">
                                        {results.length} विद्यार्थी
                                    </span>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {results.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-hover table-striped mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="py-3" width="25%">विद्यार्थ्याचे नाव</th>
                                                    <th className="py-3" width="15%">आडनाव</th>
                                                    <th className="py-3" width="20%">वडिलांचे नाव</th>
                                                    <th className="py-3" width="20%">आईचे नाव</th>
                                                    <th className="py-3 text-center" width="20%">क्रिया</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.map((student) => (
                                                    <tr key={student.id}>
                                                        <td className="align-middle">{student.studentName}</td>
                                                        <td className="align-middle">{student.surName}</td>
                                                        <td className="align-middle">{student.fatherName}</td>
                                                        <td className="align-middle">{student.motherName}</td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary me-2"
                                                                onClick={() => handleClick(student.id)}
                                                            >
                                                                रिपोर्ट
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary"
                                                                onClick={() => viewInfo(student.id)}
                                                            >
                                                                माहिती पहा
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        <img src="/api/placeholder/120/120" alt="No students" className="mb-3" />
                                        <h5>कोणतेही विद्यार्थी सापडले नाहीत.</h5>
                                        <p className="text-muted">या शिक्षकासाठी कोणतेही विद्यार्थी नोंदणीकृत नाहीत किंवा शोध मापदंड बदला.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentList;