import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import { BiSearch } from 'react-icons/bi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import UpdateYearCss from '../styling/UpdateStudentAcademicYear.css'


function UpdateStudentAcademicYear() {
  const id = jwtDecode(sessionStorage.getItem('token'))?.id;
  const [surName, setSurName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listOfStudents, setListOfStudents] = useState([]);
  const [teacher, setTeacher] = useState({});
  const [error, setError] = useState(null); // New state for error handling
  const [academicYearData, setAcademicYearData] = useState([]);
  const navigate = useNavigate();

  // Get token data
  const token = sessionStorage.getItem('token');
  let udise, username;

  try {
    const decoded = jwtDecode(token);
    udise = decoded?.udiseNo;
    username = decoded?.username;
  } catch (error) {
    console.error("Token decoding error:", error);
  }

  // Create API instance
  const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // Fetch teacher data first
  useEffect(() => {
    if (udise && username) {
      setLoading(true);
      apiService.getdata(`staff/getbyudiseandusername/${udise}/${username}`)
        .then((response) => {
          setTeacher(response.data);
          console.log(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching teacher data:", error);
          setError("Failed to load teacher data. Please try again.");
          setLoading(false);
        });
    }
    apiService.getdata(`academic/${udise}/${id}`)
      .then((response) => {
        setAcademicYearData(response.data);
        console.log(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching teacher data:", error);
        setError("Failed to load teacher data. Please try again.");
        setLoading(false);
      });
    fetchStudents();
  }, [udise, username]);



  function findAcademicYear(academicYearData, udiseNo, studentId) {
    return academicYearData.find(
      (entry) =>
        entry.studentId.registerNumber === studentId &&
        entry.schoolUdiseNo?.udiseNo === udiseNo
    )?.academicYear;
  }

  // Fetch students after teacher data is available
  const fetchStudents = (searchParams = {}) => {
    if (!teacher.id) {
      // console.log("Teacher ID not available yet");
      return;
    }

    setLoading(true);
    const params = { udise, ...searchParams };

    // Use the baseURL from api instance - don't repeat the full URL
    api.get(`/student/byclass/search/${teacher.id}`, { params })
      .then((response) => {
        // console.log("Student data received:", response.data);
        setResults(response.data);
        console.log(response.data);

        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
        setError("Failed to load student data. Please check your connection and try again.");
        setLoading(false);
      });
  };



  const toggleStudentSelection = (id) => {
    if (listOfStudents.includes(id)) {
      const updatedList = listOfStudents.filter((item) => item !== id);
      setListOfStudents(updatedList);
      console.log(listOfStudents);
    } else {
      setListOfStudents([...listOfStudents, id]);
      console.log(listOfStudents);
    }
  };

  function selectAllStudents() {
    const allIds = results.map((student) => student.id);
    setListOfStudents(allIds);
    console.log(allIds);
  }

  function clearAllSelections() {
    setListOfStudents([]);
  }

  function alldataset() {
    if (listOfStudents.length > 0) {
      navigate('/teacher/updateacademicyearall', { state: { selectedStudents: listOfStudents } })
    }
    else {
      alert("कृपया विद्यार्थी निवडा तुम्ही विद्यार्थी निवडलेले नाहीत ");
    }

  }

  useEffect(() => {
    if (teacher.id) {
      fetchStudents();
    }
  }, [teacher.id]);

  function handleClick(id) {
    navigate(`/teacher/updateacademicyearform/${id}`);
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


  const today = new Date();

  // Define start and end dates
  const start = new Date(today.getFullYear(), 4, 1);  // May 1 (Month is 0-indexed)
  const end = new Date(today.getFullYear(), 6, 31);   // July 31

  // Check if today is between May 1 and July 31
  const isWithinRange = today >= start && today <= end;

  if (!isWithinRange) {
    return (<>
    <div className="not-available-container">
      <div className="not-available-content">
        <svg className="not-available-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          <path d="M0 0h24v24H0z" fill="none" />
        </svg>
        <h2>Content Currently Unavailable</h2>
        <p>This section is only visible between May 1st and July 31st.</p>
      </div>
    </div></>
    ) 
  }


  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="p-3 bg-white rounded shadow-sm">
              <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.8rem' }}>
                विद्यार्थ्यांची शैक्षणिक माहिती अद्ययावत फॉर्म
              </h2>
            </div>
          </div>

          {/* Search Box */}
          <div className="card border-0 rounded-0 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="card-body p-3">
              <h5 className="card-title mb-3 text-dark">विद्यार्थी शोधा</h5>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 d-flex flex-wrap">
                  <div className="me-2 mb-2" style={{ width: '23%' }}>
                    <input
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="form-control form-control-sm"
                      placeholder="विद्यार्थ्याचे नाव"
                    />
                  </div>
                  <div className="me-2 mb-2" style={{ width: '23%' }}>
                    <input
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      className="form-control form-control-sm"
                      placeholder="वडिलांचे नाव"
                    />
                  </div>
                  <div className="me-2 mb-2" style={{ width: '23%' }}>
                    <input
                      value={surName}
                      onChange={(e) => setSurName(e.target.value)}
                      className="form-control form-control-sm"
                      placeholder="आडनाव"
                    />
                  </div>
                  <div className="me-2 mb-2" style={{ width: '23%' }}>
                    <input
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
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

          {/* Student Table */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="card border-0 rounded-0" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
              <div className="card-header bg-primary text-white p-2">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0 fw-bold fs-6">विद्यार्थ्यांची यादी</h3>
                  <div className="d-flex">
                    <button
                      onClick={selectAllStudents}
                      disabled={results.length === 0}
                      className="btn btn-sm btn-light me-2 d-flex align-items-center"
                      style={{ fontSize: '0.8rem', fontWeight: '500' }}
                    >
                      <i className="bi bi-check-all me-1"></i> सर्व निवडा
                    </button>
                    <button
                      onClick={clearAllSelections}
                      className="btn btn-sm btn-outline-light me-2 d-flex align-items-center"
                      style={{ fontSize: '0.8rem', fontWeight: '500' }}
                    >
                      <i className="bi bi-x-circle me-1"></i> निवड रद्द करा
                    </button>
                    <button
                      onClick={alldataset}
                      className="btn btn-sm btn-outline-light  d-flex align-items-center"
                      style={{ fontSize: '0.8rem', fontWeight: '500' }}
                    >
                      सर्वांची माहिती संपादित करा
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                {results.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th width="5%">निवडा</th>
                          <th width="25%">विद्यार्थ्याचे नाव</th>
                          <th width="15%">आडनाव</th>
                          <th width="20%">वडिलांचे नाव</th>
                          <th width="20%">आईचे नाव</th>
                          <th width="15%">शैक्षणिक वर्ष</th>
                          <th width="15%">क्रिया</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((student) => (
                          <tr key={student.id}>
                            <td className="text-center">
                              <input
                                type="checkbox"
                                checked={listOfStudents.includes(student.id)}
                                onChange={() => toggleStudentSelection(student.id)}
                                className="form-check-input"
                              />
                            </td>
                            <td>{student.studentName}</td>
                            <td>{student.surName}</td>
                            <td>{student.fatherName}</td>
                            <td>{student.motherName}</td>
                            <td>{findAcademicYear(academicYearData, student.school.udiseNo, student.registerNumber)}</td>
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
                  <div className="text-center py-4 text-muted">कोणतेही विद्यार्थी सापडले नाहीत.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpdateStudentAcademicYear;