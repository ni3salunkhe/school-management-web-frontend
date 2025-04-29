import React, { useEffect, useRef, useState } from 'react';
import apiService from '../services/api.service';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function BonafideCertificate() {
    const printContentRef = useRef(null);
    const [studentData, setStudentData] = useState();
    const { id } = useParams();
    const udise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    const [academicData, setAcademicData] = useState();

    useEffect(() => {
        apiService.getbyid('student/', id).then((response) => {
            setStudentData(response.data);
        });

        apiService.api.get("http://localhost:8080/academic/student-school", {
            params: {
                studentId: id,
                schoolUdiseNo: udise
            }
        }).then((response) => {
            setAcademicData(response.data);
        });
    }, [id]);

    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 1000; // Standard A4 height in pixels at 96dpi

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            alert("Please allow pop-ups to print the document");
            return;
        }

        const contentToPrint = printContentRef.current;

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bonafide Certificate</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
            <style>
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    .certificate-page {
                        page-break-after: always;
                        height: ${A4_HEIGHT_PX}px;
                    }
                    .certificate-page:last-child {
                        page-break-after: auto;
                    }
                }
                body {
                    font-family: 'Noto Sans Devanagari', sans-serif;
                    margin: 0;
                    padding: 0;
                }
                .print-container {
                    width: ${A4_WIDTH_PX}px;
                    margin: 0 auto;
                }
                .certificate-page {
                    width: 100%;
                    padding: 20px;
                    box-sizing: border-box;
                }
                .bg-secondary-subtle {
                    background-color: #e2e3e5;
                }
                .office-copy-label {
                    position: absolute;
                    right: 20px;
                    top: 20px;
                    font-style: italic;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="print-container">
                ${contentToPrint.innerHTML}
            </div>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 500);
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
    }

    const CertificateTemplate = ({ isOfficeCopy = false }) => (
        <div className="border border-dark p-2 h-100" style={{ position: 'relative' }}>
            {isOfficeCopy && (
                <div className="office-copy-label">OFFICE COPY</div>
            )}
            
            {/* Header Section */}
            <div className="row">
                <div className="col-3">
                    <div className="border border-dark h-100 d-flex align-items-center justify-content-center">
                        {studentData?.school?.logo ? (
                            <img
                                src={`data:image/jpeg;base64,${studentData.school.logo}`}
                                alt="School Logo"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        ) : (
                            <p className="text-center fw-bold">logo</p>
                        )}
                    </div>
                </div>
                <div className="col-9">
                    <div className="text-center">
                        <p className="small">{studentData?.school?.schoolSlogan || ''}</p>
                        <p className="">{studentData?.school?.sansthaName || ''}</p>
                        <h1 className="fs-4 fw-bold bg-secondary-subtle p-2">{studentData?.school?.schoolName || ''}</h1>
                        <p className="small p-0 m-0">
                            <span className='fw-bold'>तालुका :-</span> {studentData?.school?.tehsil?.tehsilName || ''},
                            <span className='fw-bold'> जिल्हा :-</span> {studentData?.school?.district?.districtName || ''},
                            <span className='fw-bold'> राज्य :-</span> {studentData?.school?.state?.stateName || ''},
                            <span className='fw-bold'> पिनकोड :-</span> {studentData?.school?.pinCode || ''}
                        </p>
                        <p className="small border-top p-0 m-0 border-dark">
                            <span className='fw-bold'>माध्यम :-</span> {studentData?.school?.medium || ''},
                            <span className='fw-bold'> बोर्ड :-</span> {studentData?.school?.board || ''},
                            <span className='fw-bold'> बोर्ड विभाग :-</span> {studentData?.school?.boardDivision || ''},
                            <span className='fw-bold'> शिक्षण बोर्ड क्रमांक :-</span> {studentData?.school?.boardIndexNo || ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* School Information */}
            <div className='border-top border-dark border-bottom'>
                <div className="row py-2">
                    <div className="col-5 mx-auto">
                        <div className="d-flex">
                            <p className="fw-bold p-0 m-0">SCHOOL U-DISE NO.:</p>
                            <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{studentData?.school?.udiseNo || ''}</p>
                        </div>
                    </div>
                    <div className="col-5 mx-auto">
                        <div className="d-flex">
                            <p className="fw-bold p-0 m-0">E-MAIL ID:</p>
                            <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{studentData?.school?.schoolEmailId || ''}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className='text-center fw-bold'>प्रमाणपत्र</h2>
            </div>

            <div className="row m-0">
                <div className="col-6 border-bottom border-end p-0">
                    <div className="d-flex">
                        <div className="fw-bold Cpadding border-top border-end border-start p-1" style={{ width: '35%' }}>अपार आयडी :</div>
                        <div className="Cpadding flex-grow-1 border-top p-1">{studentData?.apparId || ''}</div>
                    </div>
                </div>
                <div className="col-6 border-bottom p-0">
                    <div className="d-flex">
                        <div className="fw-bold Cpadding border-end border-top p-1" style={{ width: '35%' }}>जन.रजि.क्रमांक :</div>
                        <div className="Cpadding flex-grow-1 border-end border-top p-1">{studentData?.registerNumber || ''}</div>
                    </div>
                </div>
            </div>

            <div className="row m-0">
                <div className="col-6 border-bottom border-end p-0">
                    <div className="d-flex">
                        <div className="fw-bold Cpadding border-end border-start p-1" style={{ width: '35%' }}>विद्यार्थी आयडी :</div>
                        <div className="Cpadding flex-grow-1 p-1">{studentData?.studentId || ''}</div>
                    </div>
                </div>
                <div className="col-6 border-bottom p-0">
                    <div className="d-flex">
                        <div className="fw-bold Cpadding border-end p-1" style={{ width: '35%' }}>आधार नं. :</div>
                        <div className="Cpadding flex-grow-1 border-end p-1">{studentData?.adhaarNumber || ''}</div>
                    </div>
                </div>
            </div>
            
            <div className='pt-3'>
                <p>प्रमाणपत्र देण्यात येते की ,कुमार/कुमारी <span className='fw-bold'>{studentData?.studentName} {studentData?.fatherName} {studentData?.surName} </span> हा/ही दिनांक {studentData?.admissionDate} ते दिनांक { } पर्यंत या विद्यालयाचा प्रामाणिक विद्यार्थी/विद्यार्थिनी {academicData?.status === "learning" ? ("आहे") : ("होता/होती")}.ती सन {academicData?.academicYear} या वर्षी {academicData?.standard?.standard} ईयत्तेमध्ये शिक्षण घेत {academicData?.status === "learning" ? ("आहे") : ("होता/होती")}.<br />विद्यालयाच्या नोंदणीबुकावरून त्याची/तिची जन्म तारीख (अंकी) {studentData?.dateOfBirth} ही आहे. जन्म तारीख (अक्षरी) {studentData?.dateOfBirthInWord} ही आहे. जन्मस्थळ {studentData?.birthPlace} तालुका {studentData?.tehasilOfBirth?.tehsilName} जिल्हा {studentData?.districtOfBirth?.districtName} राज्य {studentData?.stateOfBirth?.stateName} आहे. त्याचा/तिचा धर्म {studentData?.religion} जात {studentData?.caste || ''} पोटजात {studentData?.subCaste || '_______'}आहे .माझ्या माहितीनुसार त्याची/तिची वर्तणूक चांगली आहे प्रमाणपत्र मागणीनुसार [] कामी देण्यात आले.</p>
            </div>
            
            <div className='row mt-4'>
                <div className='col-6'>
                    <p>स्थळ :- </p>
                    <p>दिनांक :-</p>
                </div>
                <div className='col-6'>
                    {isOfficeCopy ? (
                        <>
                            <p>स्थळप्रत: <strong>Office Copy</strong></p>
                            <p>सही: ___________________</p>
                            <p>नाव: ___________________</p>
                            <p>मोबाईल क्र./आधार क्र.: ___________________</p>
                        </>
                    ) : (
                        <p className="text-center">मुख्याध्यापक</p>
                    )}
                </div>
            </div>
            
            {isOfficeCopy && (
                <div className="mt-4 text-center border-top pt-3">
                    <p className="mb-2"><strong>मोबाईल क्र./आधार क्र.</strong></p>
                    <div className="border border-dark mx-auto" style={{ width: "300px", height: "40px" }}></div>
                </div>
            )}
        </div>
    );

    return (
        <div className='container mt-3 mb-3'>
            {/* Print Button */}
            <div className="d-flex justify-content-center mb-3">
                <button
                    className="btn btn-primary"
                    onClick={handlePrint}
                >
                    Print Bonafide Certificate
                </button>
            </div>

            <div className="d-flex justify-content-center mb-2">
                <div
                    ref={printContentRef}
                    style={{
                        width: `${A4_WIDTH_PX}px`,
                        backgroundColor: 'white',
                        fontFamily: "'Noto Sans Devanagari', sans-serif"
                    }}
                >
                    {/* Student Copy - First Page */}
                    <div className="certificate-page">
                        <CertificateTemplate />
                    </div>
                    
                    {/* Office Copy - Second Page */}
                    <div className="certificate-page">
                        <CertificateTemplate isOfficeCopy={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BonafideCertificate;