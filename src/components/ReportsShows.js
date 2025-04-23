import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api.service';
import axios from 'axios';

function ReportsShows() {
    const { id } = useParams();
    const navigate = useNavigate();

    const udise = 12345678093;
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [academicData, setAcademicData] = useState('');
    const [duplicate, setDuplicate] = useState();

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setLoading(true);
                await new Promise(resolve => setTimeout(resolve, 800));

                apiService.getbyid("student/", id).then((response) => {
                    setResult(response.data);
                })

                setLoading(false);
            } catch (err) {
                setError('विद्यार्थ्याची माहिती लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.');
                setLoading(false);
            }
        };

        axios.get("http://localhost:8080/academic/student-school", {
            params: {
                studentId: id,
                schoolUdiseNo: udise
            }
        }).then((response) => {
             console.log(response.data);
            setAcademicData(response.data);
        })

        fetchStudentData();
    }, [id]);

    const handleReportClick = (reportType) => {
        if (reportType === "lc-old") {
            apiService.getbyid(`leavinginfo/checkingisdatapresent/${id}/udise/`, udise)
                .then((response) => {
                    if (response.data === true) {
                        navigate(`/reports/download/${id}`);
                    } else {
                        navigate(`/reports/${reportType}/${id}`);
                    }
                })
                .catch((error) => {
                    console.error("Error while checking data presence:", error);
                    navigate(`/reports/${reportType}/${id}`); // fallback
                });
        } 
        else if(reportType ==="lc-new")
        {
            apiService.getbyid(`leavinginfo/checkingisdatapresent/${id}/udise/`, udise)
            .then((response) => {
                if (response.data === true) {
                    navigate(`/reports/lcnewdownload/${id}`);
                } else {
                    navigate(`/reports/${reportType}/${id}`);
                }
            })
            .catch((error) => {
                console.error("Error while checking data presence:", error);
                navigate(`/reports/${reportType}/${id}`); // fallback
            });
        }else if(reportType==="bonafide")
        {
            navigate(`/reports/bonfide/${id}`);
        }
        else if(reportType==="attendance")
        {
           if(academicData.standard.standard>1)
           {
            navigate(`/reports/prsenty/${id}`);
           }
           else{
            alert("तुमचा 75% हाजेरीचा दाखला निघू शकत नाही ");
           }

        }
        else {
            navigate(`/reports/${reportType}/${id}`);
        }
    };
    

    const reportOptions = [
        { name: 'lc-old', title: 'शाळा सोडल्याचा दाखला (जुना फॉरमॅट)', icon: '📄' },
        { name: 'lc-new', title: 'शाळा सोडल्याचा दाखला (नवीन फॉरमॅट)', icon: '📝' },
        { name: 'bonafide', title: 'बोनाफाइड प्रमाणपत्र', icon: '🏛️' },
        { name: 'attendance', title: '७५% उपस्थिती प्रमाणपत्र', icon: '📊' }
    ];

    if (loading) {
        return (
            <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
                <div className="p-4 text-primary fs-4">
                    <div className="spinner-border text-primary me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    विद्यार्थी माहिती लोड होत आहे...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4 min-vh-100">
            <div className="container">
                {/* Student Info Card */}
                <div className="card shadow mb-4">
                    <div className="card-header bg-primary text-white">
                        <h4 className="mb-0">विद्यार्थ्याची माहिती</h4>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="p-3 bg-light rounded">
                                    <span className="fw-bold text-primary d-inline-block w-25">नाव:</span>
                                    <span>{result.studentName} {result.fatherName} {result.surName}</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-3 bg-light rounded">
                                    <span className="fw-bold text-primary d-inline-block w-25">वर्ग:</span>
                                    <span>{academicData.standard.standard || 'माहिती नाही'} {academicData.division.name}</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-3 bg-light rounded">
                                    <span className="fw-bold text-primary d-inline-block w-25">विद्यार्थी आयडी:</span>
                                    <span>{result.studentId || 'माहिती नाही'}</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-3 bg-light rounded">
                                    <span className="fw-bold text-primary d-inline-block w-25">नोंदणी क्रमांक:</span>
                                    <span>{result.registerNumber || 'माहिती नाही'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reports List */}
                <div className="card shadow">
                    <div className="card-header bg-primary text-white">
                        <h4 className="mb-0">उपलब्ध अहवाल</h4>
                    </div>
                    <div className="card-body">
                        <p className="text-muted mb-4">या विद्यार्थ्यासाठी तयार करायचा अहवाल निवडा</p>

                        <div className="row g-4">
                            {reportOptions.map((report) => (
                                <div className="col-md-6 col-lg-4" key={report.name}>
                                    <div
                                        onClick={() => handleReportClick(report.name)}
                                        className="card bg-primary text-white h-100 shadow report-card"
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <div className="card-body d-flex align-items-center">
                                            <div className="fs-1 me-3">{report.icon}</div>
                                            <div>
                                                <h5 className="card-title mb-1">{report.title}</h5>
                                                <p className="card-text small opacity-75">क्लिक करून तयार करा</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportsShows;
