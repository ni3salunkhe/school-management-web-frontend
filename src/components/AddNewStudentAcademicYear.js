import React, { useState, useEffect } from 'react';
import { BiSearch } from 'react-icons/bi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Next from './Next';

function AddNewStudentAcademicYear() {
    const [surName, setSurName] = useState('');
    const [studentName, setStudentName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [motherName, setMotherName] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [listOfStudents, setListOfStudents] = useState([]);
    const [selectedStandard, setSelectedStandard] = useState();

    const udise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;


    const navigate = useNavigate();

    const api = axios.create({
        baseURL: 'http://localhost:8080',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
    });

    const fetchStudents = (searchParams = {}) => {
        setLoading(true);
        const params = { udise, ...searchParams };

        api.get('student/search', { params })
            .then(response => {
                setResults(response.data);
                
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching students', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    function handleClick(id) {
        navigate(`/clerk/academicyearform/${id}`);
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            const hasSearch =
                surName.trim() ||
                studentName.trim() ||
                fatherName.trim() ||
                motherName.trim();

            if (hasSearch) {
                const params = {};
                if (surName.trim()) params.surName = surName.trim();
                if (studentName.trim()) params.studentName = studentName.trim();
                if (fatherName.trim()) params.fatherName = fatherName.trim();
                if (motherName.trim()) params.motherName = motherName.trim();
                fetchStudents(params);
            } else {
                fetchStudents();
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [surName, studentName, fatherName, motherName]);


    const toggleStudentSelection = (id) => {

        const student = results.find(student => student.id === id);

        if (!selectedStandard && student) {
            setSelectedStandard(student.whichStandardAdmitted.standard);
        }

        if (selectedStandard && student) {
            if (student && student.whichStandardAdmitted.standard !== selectedStandard) {
                alert(`तुम्ही फक्त एका इयत्तेतील विद्यार्थी निवडू शकता.`);
                return;
            }
        }

        if (listOfStudents.includes(id)) {
            const updatedList = listOfStudents.filter((item) => item !== id);
            setListOfStudents(updatedList);
            if (updatedList.length === 0) {
                setSelectedStandard(undefined);
            }
        } else {
            setListOfStudents([...listOfStudents, id]);
        }

    }

    function alldataset() {
        if (listOfStudents.length > 0) {

            navigate('/clerk/addacademicyearall', { state: { selectedStudents: listOfStudents } })
        }
        else {
            alert("कृपया विद्यार्थी निवडा तुम्ही विद्यार्थी निवडलेले नाहीत ");
        }

    }


    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    {/* Header with official-looking design */}
                    <div className="text-center mb-4">
                        <div className="p-3 bg-white rounded shadow-sm position-relative">
                            <div className="position-absolute top-0 end-0 m-2">
                                <Next classname={'btn bg-danger text-white btn-sm'} path={'/clerk/list'} placeholder={'X'}></Next>
                            </div>
                            <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.8rem' }}>
                                विद्यार्थ्यांची शैक्षणिक माहिती नोंदणी फॉर्म
                            </h2>
                        </div>
                    </div>

                    {/* Search Box - Compact and Official */}
                    <div className="card border-0 rounded-0 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                        <div className="card-body p-3">
                            <h5 className="card-title mb-3 text-dark">विद्यार्थी शोधा</h5>
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1 d-flex flex-wrap">

                                    <div className="me-2 mb-2" style={{ width: '23%' }}>
                                        <input
                                            value={studentName}
                                            onChange={e => setStudentName(e.target.value)}
                                            className="form-control form-control-sm"
                                            placeholder="विद्यार्थ्याचे नाव"
                                        />
                                    </div>
                                    <div className="me-2 mb-2" style={{ width: '23%' }}>
                                        <input
                                            value={fatherName}
                                            onChange={e => setFatherName(e.target.value)}
                                            className="form-control form-control-sm"
                                            placeholder="वडिलांचे नाव"
                                        />
                                    </div>
                                    <div className="me-2 mb-2" style={{ width: '23%' }}>
                                        <input
                                            value={surName}
                                            onChange={e => setSurName(e.target.value)}
                                            className="form-control form-control-sm"
                                            placeholder="आडनाव"
                                        />
                                    </div>
                                    <div className="me-2 mb-2" style={{ width: '23%' }}>
                                        <input
                                            value={motherName}
                                            onChange={e => setMotherName(e.target.value)}
                                            className="form-control form-control-sm"
                                            placeholder="आईचे नाव"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const params = {};
                                        if (surName.trim()) params.surName = surName.trim();
                                        if (studentName.trim()) params.studentName = studentName.trim();
                                        if (fatherName.trim()) params.fatherName = fatherName.trim();
                                        if (motherName.trim()) params.motherName = motherName.trim();
                                        fetchStudents(params);
                                    }}
                                    className="btn btn-primary d-flex align-items-center px-3 py-1"
                                    disabled={loading}
                                    style={{ height: '32px', marginLeft: '10px' }}
                                >
                                    <BiSearch className="me-1" /> शोधा
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Search Results - Official Government Style */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="card border-0 rounded-0" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                            <div className="card-header d-flex justify-content-between bg-primary text-white p-2">
                                <h3 className="mb-0 fw-bold fs-6 text-center">
                                    विद्यार्थ्यांची यादी
                                </h3>

                                <button
                                    onClick={alldataset}
                                    className="btn btn-sm btn-outline-light  d-flex align-items-center"
                                    style={{ fontSize: '0.8rem', fontWeight: '500' }}
                                >
                                    सर्वांची माहिती संपादित करा
                                </button>
                            </div>
                            <div className="card-body p-0">
                                {results.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>निवडा</th>
                                                    <th width="20%">विद्यार्थ्याचे नाव</th>
                                                    <th width="15%">आडनाव</th>
                                                    <th width="20%">वडिलांचे नाव</th>
                                                    <th width="20%">आईचे नाव</th>
                                                    <th width="10%">इयत्ता</th>
                                                    <th width="15%">क्रिया</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.map(student => (
                                                    <tr key={student.id}>
                                                        <td><input type="checkbox"
                                                            checked={listOfStudents.includes(student.id)}
                                                            onChange={() => toggleStudentSelection(student.id)} /></td>
                                                        <td>{student.studentName}</td>
                                                        <td>{student.surName}</td>
                                                        <td>{student.fatherName}</td>
                                                        <td>{student.motherName}</td>
                                                        <td>{student.whichStandardAdmitted.standard}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                style={{ fontSize: '0.8rem' }}
                                                                onClick={() => handleClick(student.id)}
                                                            >
                                                                माहिती नोंदवा
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        कोणतेही विद्यार्थी सापडले नाहीत.
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

export default AddNewStudentAcademicYear;