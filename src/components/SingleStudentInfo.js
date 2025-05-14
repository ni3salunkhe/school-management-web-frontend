import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../services/api.service';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser, FaUsers, FaMapMarkerAlt, FaSchool, FaIdCard, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function SingleStudentInfo() {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [academicData, setAcademicData] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');
    const udise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

    useEffect(() => {
        setLoading(true);
        apiService.getbyid(`student/`, id)
            .then((response) => {
                setStudent(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError("Failed to load student information");
                setLoading(false);
            });

        axios.get("http://localhost:8080/academic/student-school", {
            params: {
                studentId: id,
                schoolUdiseNo: udise
            },
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem('token')}`
            }
        }).then((response) => {
            console.log('Academic Data:', response.data);
            setAcademicData(response.data);
        });
    }, [id]);

    // Custom styles
    const styles = {
        pageBackground: {
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            padding: '2rem 0',
        },
        cardHeader: {
            background: 'linear-gradient(120deg,rgb(79, 102, 128) 0%,rgb(45, 128, 253) 100%)',
            color: 'white',
            borderRadius: '0.5rem 0.5rem 0 0',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
        mainCard: {
            borderRadius: '0.5rem',
            overflow: 'hidden',
            border: 'none',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07)',
        },
        profileCircle: {
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(120deg, #1E88E5 0%, #1565C0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2.5rem',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            border: '4px solid white',
            margin: '0 auto 1rem'
        },
        infoCard: {
            borderRadius: '0.75rem',
            padding: '1.5rem',
            height: '100%',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            border: 'none',
            background: 'white',
        },
        tabButton: (isActive) => ({
            borderRadius: '50px',
            padding: '0.75rem 1.5rem',
            margin: '0 0.5rem 1rem 0',
            background: isActive ? 'linear-gradient(120deg, #1E88E5 0%, #1565C0 100%)' : 'white',
            color: isActive ? 'white' : '#1565C0',
            border: isActive ? 'none' : '1px solid #1565C0',
            fontWeight: '600',
            boxShadow: isActive ? '0 4px 10px rgba(0, 0, 0, 0.2)' : 'none',
            transition: 'all 0.3s ease',
        }),
        sectionIcon: {
            background: 'linear-gradient(120deg, #1E88E5 0%, #1565C0 100%)',
            color: 'white',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '1rem',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
        actionButton: (isPrimary) => ({
            borderRadius: '50px',
            padding: '0.75rem 2rem',
            background: isPrimary ? 'linear-gradient(120deg, #1E88E5 0%, #1565C0 100%)' : 'white',
            color: isPrimary ? 'white' : '#1565C0',
            border: isPrimary ? 'none' : '1px solid #1565C0',
            fontWeight: '600',
            boxShadow: isPrimary ? '0 4px 10px rgba(0, 0, 0, 0.2)' : 'none',
            margin: '0 0.5rem',
            transition: 'all 0.3s ease',
        }),
        infoLabel: {
            color: '#1565C0',
            fontWeight: '600',
            marginBottom: '0.25rem',
        },
        infoValue: {
            background: '#f8f9fa',
            padding: '0.65rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
            fontWeight: '500',
            border: '1px solid #e9ecef',
        }
    };

    if (loading) {
        return (
            <div style={styles.pageBackground} className="d-flex justify-content-center align-items-center">
                <div className="text-center">
                    <FaSpinner className="text-primary mb-3" style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }} />
                    <h3 className="text-primary">विद्यार्थी माहिती लोड करत आहे...</h3>
                    <style>
                        {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
                    </style>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.pageBackground} className="d-flex justify-content-center align-items-center">
                <div className="card p-5 text-center" style={styles.mainCard}>
                    <h2 className="text-danger mb-3">Error</h2>
                    <p className="mb-0">{error}</p>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div style={styles.pageBackground} className="d-flex justify-content-center align-items-center">
                <div className="card p-5 text-center" style={styles.mainCard}>
                    <h2 className="text-warning mb-3">No Data Found</h2>
                    <p className="mb-0">विद्यार्थी माहिती उपलब्ध नाही</p>
                </div>
            </div>
        );
    }

    // Organize data into categories
    const personalInfo = [
        { label: "विद्यार्थी संपूर्ण नाव", value: `${student.studentName} ${student.surName}` },
        { label: "लिंग", value: student.gender },
        { label: "जन्म तारीख", value: student.dateOfBirth },
        { label: "शब्दात जन्म तारीख", value: student.dateOfBirthInWord },
        { label: "राष्ट्रीयत्व", value: student.nationality },
        { label: "धर्म", value: student.religion },
        { label: "जात", value: student.caste },
        { label: "जात प्रवर्ग", value: student.casteCategory },
        { label: "मातृभाषा", value: student.motherTongue },
    ];

    const parentInfo = [
        { label: "वडिलांचे नाव", value: student.fatherName },
        { label: "आईचे नाव", value: student.motherName },
        { label: "निवासी पत्ता", value: student.residentialAddress },
        { label: "मोबाईल क्रमांक", value: student.mobileNo },
    ];

    const birthInfo = [
        { label: "जन्म स्थळ", value: student.birthPlace },
        { label: "जन्म राज्य", value: student.stateOfBirth?.stateName },
        { label: "जन्म जिल्हा", value: student.districtOfBirth?.districtName },
        { label: "जन्म तहसील", value: student.tehasilOfBirth?.tehsilName },
        { label: "जन्म गाव", value: student.villageOfBirth?.villageName },
    ];

    const schoolInfo = [
        { label: "शाळेचे नाव", value: student.school?.schoolName },
        { label: "संस्थेचे नाव", value: student.school?.sansthaName },
        { label: "शाळेचा घोषवाक्य", value: student.school?.schoolSlogan },
        { label: "प्रवेश तारीख", value: student.admissionDate },
        { label: "प्रवेश घेतलेला वर्ग", value: student.whichStandardAdmitted.standard},
        { label: "मागील शाळेचा UDISE क्र", value: student.lastSchoolUdiseNo || "उपलब्ध नाही" },
    ];

    const identificationInfo = [
        { label: "नोंदणी क्रमांक", value: student.registerNumber },
        { label: "विद्यार्थी ID", value: student.studentId },
        { label: "आधार क्रमांक", value: student.adhaarNumber },
        { label: "अपर ID", value: student.apparId },
        { label: "EBC माहिती", value: student.ebcInformation },
        { label: "अल्पसंख्याक माहिती", value: student.minorityInformation },
    ];

    const renderTabContent = () => {
        let contentToRender;

        switch (activeTab) {
            case 'personal':
                contentToRender = personalInfo;
                break;
            case 'parents':
                contentToRender = parentInfo;
                break;
            case 'birth':
                contentToRender = birthInfo;
                break;
            case 'school':
                contentToRender = schoolInfo;
                break;
            case 'identification':
                contentToRender = identificationInfo;
                break;
            default:
                contentToRender = personalInfo;
        }

        return (
            <div className="row">
                {contentToRender.map((info, index) => (
                    <div key={index} className="col-md-6">
                        <div className="mb-3">
                            <div style={styles.infoLabel}>{info.label}</div>
                            <div style={styles.infoValue}>{info.value || "उपलब्ध नाही"}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const getTabIcon = () => {
        switch (activeTab) {
            case 'personal': return <FaUser />;
            case 'parents': return <FaUsers />;
            case 'birth': return <FaMapMarkerAlt />;
            case 'school': return <FaSchool />;
            case 'identification': return <FaIdCard />;
            default: return <FaUser />;
        }
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case 'personal': return "वैयक्तिक माहिती";
            case 'parents': return "पालकांची माहिती";
            case 'birth': return "जन्म माहिती";
            case 'school': return "शाळेची माहिती";
            case 'identification': return "ओळख माहिती";
            default: return "वैयक्तिक माहिती";
        }
    };

    return (
        <div style={styles.pageBackground}>
            <div className="container">
                <div className="card" style={styles.mainCard}>
                    <div style={styles.cardHeader}>
                        <div className="d-flex justify-content-between align-items-center">
                            <h2 className="mb-0 fw-bold">विद्यार्थी माहिती पत्रक</h2>
                            <div className="badge bg-white text-primary px-3 py-2 fs-6">
                                UDISE: {student.school?.udiseNo}
                            </div>
                        </div>
                    </div>

                    <div className="card-body p-4">
                        <div className="row mb-4 justify-content-center">
                            <div className="col-md-4 text-center mb-4">
                                <h2 className="mb-1 fw-bold text-primary">{student.studentName} {student.surName}</h2>
                                <p className="text-muted mb-2">रोल नंबर: {student.registerNumber}</p>
                                <p className="badge bg-primary px-3 py-2 fs-6">
                                    {academicData?.standard?.standard}{" "}
                                    {academicData?.standard?.standard === 1
                                        ? "ली"
                                        : academicData?.standard?.standard === 2 || academicData?.standard?.standard === 3
                                            ? "री"
                                            : academicData?.standard?.standard === 4
                                                ? "थी"
                                                : "वी"}{" "}
                                    इयत्ता
                                </p>
                            </div>
                        </div>

                        <div className="mb-4 d-flex flex-wrap justify-content-center">
                            <button
                                onClick={() => setActiveTab('personal')}
                                className="btn"
                                style={styles.tabButton(activeTab === 'personal')}
                            >
                                <FaUser className="me-2" /> वैयक्तिक माहिती
                            </button>
                            <button
                                onClick={() => setActiveTab('parents')}
                                className="btn"
                                style={styles.tabButton(activeTab === 'parents')}
                            >
                                <FaUsers className="me-2" /> पालकांची माहिती
                            </button>
                            <button
                                onClick={() => setActiveTab('birth')}
                                className="btn"
                                style={styles.tabButton(activeTab === 'birth')}
                            >
                                <FaMapMarkerAlt className="me-2" /> जन्म माहिती
                            </button>
                            <button
                                onClick={() => setActiveTab('school')}
                                className="btn"
                                style={styles.tabButton(activeTab === 'school')}
                            >
                                <FaSchool className="me-2" /> शाळेची माहिती
                            </button>
                            <button
                                onClick={() => setActiveTab('identification')}
                                className="btn"
                                style={styles.tabButton(activeTab === 'identification')}
                            >
                                <FaIdCard className="me-2" /> ओळख माहिती
                            </button>
                        </div>

                        <div className="card" style={styles.infoCard}>
                            <div className="d-flex align-items-center mb-4">
                                <div style={styles.sectionIcon}>
                                    {getTabIcon()}
                                </div>
                                <h3 className="mb-0 fw-bold text-primary">{getTabTitle()}</h3>
                            </div>

                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SingleStudentInfo;