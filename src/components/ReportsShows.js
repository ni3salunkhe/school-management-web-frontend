import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api.service';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function ReportsShows() {
    const { id } = useParams();
    const navigate = useNavigate();

    const udise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    const [result, setResult] = useState({
        studentName: '',
        fatherName: '',
        surName: '',
        studentId: '',
        registerNumber: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [academicData, setAcademicData] = useState({
        standard: { standard: '' },
        division: { name: '' }
    });

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                // setLoading(true);
                // await new Promise(resolve => setTimeout(resolve, 800));

                const response = await apiService.getbyid("student/", id);
                if (response?.data) {
                    setResult(response.data);
                }
                setLoading(false);
            } catch (err) {
                setError('विद्यार्थ्याची माहिती लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.');
                setLoading(false);
            }
        };

        const fetchAcademicData = async () => {
            try {
                const response = await axios.get("http://localhost:8080/academic/student-school", {
                    params: {
                        studentId: id,
                        schoolUdiseNo: udise
                    },
                    headers: {
                        "Authorization": `Bearer ${sessionStorage.getItem('token')}`
                    }
                });
                if (response?.data) {
                    setAcademicData(response.data);
                    console.log(response.data);
                }
            } catch (error) {
                console.error("Error fetching academic data:", error);
            }
        };

        fetchStudentData();
        fetchAcademicData();
    }, [id, udise]);

    const handleReportClick = async (reportType) => {
        if (reportType === "lc-old") {
            try {
                const lcDataResponse = await apiService.getbyid(`leavinginfo/getbystudentId/${id}/udise/`, udise);

                // Check if the response data exists and has the newlcprinted property
                if (lcDataResponse.data && lcDataResponse.data.newlcprinted === true) {
                    alert("तुम्ही नवीन फॉरमॅट मध्ये शाळा सोडलेला दाखल घेतलेला आहे !");
                    return; // Exit the function early
                }

                // Check if data exists in leavinginfo
                const dataCheckResponse = await apiService.getbyid(`leavinginfo/checkingisdatapresent/${id}/udise/`, udise);

                if (dataCheckResponse.data === true) {
                    navigate(`/clerk/reports/download/${id}`);
                } else {
                    navigate(`/clerk/reports/${reportType}/${id}`);
                }
            } catch (error) {
                console.error("Error while checking LC data:", error);
                navigate(`/clerk/reports/${reportType}/${id}`);
            }
        }
        else if (reportType === "lc-new") {
            try {
                const lcDataResponse = await apiService.getbyid(`leavinginfo/getbystudentId/${id}/udise/`, udise);

                // Check if the response data exists and has the printed property
                if (lcDataResponse.data && lcDataResponse.data.printed === true) {
                    alert("तुम्ही जुन्या फॉरमॅट मध्ये शाळा सोडलेला दाखल घेतलेला आहे !");
                    return; // Exit the function early
                }

                // Check if data exists in leavinginfo
                const dataCheckResponse = await apiService.getbyid(`leavinginfo/checkingisdatapresent/${id}/udise/`, udise);

                if (dataCheckResponse.data === true) {
                    navigate(`/clerk/reports/lcnewdownload/${id}`);
                } else {
                    navigate(`/clerk/reports/${reportType}/${id}`);
                }
            } catch (error) {
                console.error("Error while checking LC data:", error);
                navigate(`/clerk/reports/${reportType}/${id}`);
            }
        }
        else if (reportType === "bonafide") {
            navigate(`/clerk/reports/bonfide/${id}`);
        }
        else if (reportType === "attendance") {
            navigate(`/clerk/reports/prsenty/${id}`);
        }
        else {
            navigate(`/clerk/reports/${reportType}/${id}`);
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
                                    <span>
                                        {academicData?.standard?.standard || 'माहिती नाही'}
                                        {academicData?.division?.name ? ` ${academicData.division.name}` : ''}
                                    </span>
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
