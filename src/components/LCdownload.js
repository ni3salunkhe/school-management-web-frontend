import React, { useEffect, useState, useRef } from 'react';
import apiService from '../services/api.service';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import helper from '../services/helper.service';
import { decodeId } from '../utils/idEncoder';

function LCdownload() {
    const { id:encodedId } = useParams();
    const id= decodeId(encodedId)
    
    const printContentRef = useRef(null);

    const [leavingInfo, setLeavingInfo] = useState(null);
    const [error, setError] = useState(null);
    const [isduplicate, setIsDuplicate] = useState(false); // Initialize with false
    const udise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    const [date,setDate]=useState('');

    // A4 dimensions in pixels at 96 DPI
    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 900;

    useEffect(() => {
        apiService.getbyid(`leavinginfo/getbystudentId/${id}/udise/`, udise)
            .then((response) => {
                if (response.data) {
                    setLeavingInfo(response.data);

                    // Assuming printed: true means it's NOT a duplicate (original)
                    setIsDuplicate(response.data.printed);
                    const date=new Date()
                    setDate(date);
                } else {
                    setError("No data received from server");
                }
            })
            .catch(err => {
                setError("Error fetching data: " + (err.message || "Unknown error"));
                console.error("API error:", err);
            });
    }, [id]);

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
            <title>Leaving Certificate</title>
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
                }
                body {
                    font-family: 'Noto Sans Devanagari', sans-serif;
                }
                .print-container {
                    width: ${A4_WIDTH_PX}px;
                    min-height: ${A4_HEIGHT_PX}px;
                    padding: 20px;
                    margin: 0 auto;
                }
                .bg-secondary-subtle {
                    background-color: #e2e3e5;
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

        // After delay (enough for print window to load and print), ask for confirmation
        setTimeout(() => {
            const isPrinted = window.confirm("प्रिंट यशस्वीरीत्या प्राप्त झाली का ?");
            if (isPrinted) {
                if (isduplicate === true) {
                    apiService.putdata(`leavinginfo/lc/duplicate-count/${id}/udise/`, null, udise)
                        .then(() => alert("धन्यवाद !"))
                        .catch(err => console.error("Duplicate count error", err));
                    // axios.put(`http://localhost:8080/leavinginfo/lc/duplicate-count/${id}/udise/${udise}`).then((response)=>{
                    //     console.log(response.data);

                    // })
                } else {
                    apiService.putdata(`leavinginfo/markprinted/${id}/udise/`, null, udise)
                        .then(() => alert("धन्यवाद !"))
                        .catch(err => console.error("Mark printed error", err));

                }
            } else {
            }
        }, 1000); // Slightly delayed to ensure print is done
    };


    if (error) {
        return (
            <div className="alert alert-danger m-3">
                {error}
            </div>
        );
    }

    if (!leavingInfo) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }


    return (
        <div className="container mt-3 mb-3">
            {/* Print Button */}
            <div className="d-flex justify-content-center mb-3">
                <button
                    className="btn btn-primary"
                    onClick={handlePrint}
                >
                    Print Leaving Certificate
                </button>
            </div>

            {/* A4 Preview Container */}
            <div className="d-flex justify-content-center mb-2">
                <div
                    ref={printContentRef}
                    style={{
                        width: `${A4_WIDTH_PX}px`,
                        minHeight: `${A4_HEIGHT_PX}px`,
                        backgroundColor: 'white',
                        padding: '20px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                        fontFamily: "'Noto Sans Devanagari', sans-serif"
                    }}
                >
                    {/* Your exact original design content */}
                    <div className="border border-dark p-2">
                        {/* Header Section */}
                        <div className="row">
                            <div className="col-3">
                                <div className="border border-dark h-100 d-flex align-items-center justify-content-center">
                                    {leavingInfo?.schoolUdise?.logo ? (
                                        <img
                                            src={`data:image/jpeg;base64,${leavingInfo.schoolUdise.logo}`}
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
                                    <p className="small">{leavingInfo?.schoolUdise?.schoolSlogan || ''}</p>
                                    <p className="">{leavingInfo?.schoolUdise?.sansthaName || ''}</p>
                                    <h1 className="fs-4 fw-bold bg-secondary-subtle p-2">{leavingInfo?.schoolUdise?.schoolName || ''}</h1>
                                    <p className="small  p-0 m-0"><span className='fw-bold'>तालुका :-</span> {leavingInfo?.schoolUdise?.tehsil?.tehsilName || ''}, <span className='fw-bold'>जिल्हा :-</span> {leavingInfo?.schoolUdise?.district?.districtName}, <span className='fw-bold'>राज्य :-</span> {leavingInfo?.schoolUdise?.state?.stateName || "___"}, <span className='fw-bold'>पिनकोड :-</span> {leavingInfo?.schoolUdise?.pinCode}, </p>
                                    <p className="small  border-top p-0 m-0 border-dark"><span className='fw-bold'>माध्यम :-</span> {leavingInfo?.schoolUdise?.medium}, <span className='fw-bold'>बोर्ड :-</span> {leavingInfo?.schoolUdise?.board}, <span className='fw-bold'>बोर्ड विभाग :-</span> {leavingInfo?.schoolUdise?.boardDivision}, <span className='fw-bold'>शिक्षण बोर्ड क्रमांक :- </span> {leavingInfo?.schoolUdise?.boardIndexNo}</p>
                                </div>
                            </div>
                        </div>

                        {/* School Information */}
                        <div className='border-top border-dark '>
                            <div className="row py-2 ">
                                <div className="col-5 mx-auto ">
                                    <div className="d-flex ">
                                        <p className="fw-bold p-0 m-0 ">SCHOOL U-DISE NO.:</p>
                                        <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.schoolUdise?.udiseNo}</p>
                                    </div>
                                </div>
                                <div className="col-5 mx-auto">
                                    <div className="d-flex ">
                                        <p className="fw-bold p-0 m-0">E-MAIL ID:</p>
                                        <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.schoolUdise?.schoolEmailId}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='text-center fw-bold border-top border-dark'>
                            <span>SCHOOL APPROVEL NO.</span> {leavingInfo?.schoolUdise?.schoolApprovalNo}
                        </div>

                        {/* Title */}
                        <div className="text-center bg-secondary-subtle border-bottom border-top border-dark py-2">
                            <h3 className=" fw-bold p-0 m-0">शाळा सोडल्याचा दाखला (SCHOOL LEAVING CERTIFICATE)</h3>
                        </div>

                        <div className="text-center bg-secondary-subtle border-bottom border-dark">
                            <p className="small py-1 p-0 m-0">
                                (या प्रमाणपत्रामध्ये कोणत्याहीप्रकारचा बदल केल्यास प्रमाणपत्र देणारी संस्था हा बदल स्वीकारणार नाही.)
                                <br />
                                सदर प्रमाणपत्र देणाऱ्या प्राधीकाऱ्याच्या शिक्क्यावाचून व स्वाक्षरीवाचून नियमभंग केल्यास शिक्षास पात्र राहील.
                                <br />
                                (NO CHANGE IN ANY ENTRY OF THIS LEAVING CERTIFICATE IS RECOGNISED BY THE AUTHORITY
                                <br />
                                ISSUING THE LEAVING CERTIFICATE INFRINGEMENT OF THE RULE WILL BE PUNISHED WITH RUSTICATION)
                            </p>
                        </div>

                        {/* Student Information */}
                        {isduplicate === false ? (
                            <div className="mb-2">
                                <div className='border-bottom border-dark mb-2'>
                                    <div className="row py-2">
                                        <div className="col-6">
                                            <div className="d-flex">
                                                <p className="fw-bold me-2 p-0 m-0">जनरल रजिस्टर क्रमांक :</p>
                                                <p className="p-0 m-0">{leavingInfo?.studentId?.registerNumber}</p>
                                            </div>
                                        </div>
                                        <div className="col-6 mx-auto">
                                            <div className="d-flex">
                                                <p className="fw-bold me-2 p-0 m-0">एल.सी. क्रमांक :</p>
                                                <p className="p-0 m-0">{leavingInfo?.lcNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-2">
                                <div className='border-bottom border-dark '>
                                    <div className="row py-2">
                                        <div className="col-5">
                                            <div className="d-flex">
                                                <p className="fw-bold me-2 p-0 m-0">जनरल रजिस्टर क्रमांक :</p>
                                                <p className="p-0 m-0">{leavingInfo?.studentId?.registerNumber}</p>
                                            </div>
                                        </div>
                                        <div className="col-3 text-center">
                                            <div className="d-flex align-items-center justify-content-center ">
                                                <h4 className='fw-bold m-0 p-0'>DUPLICATE</h4>
                                            </div>
                                        </div>
                                        <div className="col-4 mx-auto">
                                            <div className="d-flex">
                                                <p className="fw-bold me-2 p-0 m-0">एल.सी. क्रमांक :</p>
                                                <p className="p-0 m-0">{leavingInfo?.lcNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='border-bottom border-dark text-center m-0 p-0'>
                                    <p className='m-0 p-0 fw-bold'>प्रथम दाखला (1 st L.C) L.C NO: {leavingInfo?.lcNumber} व L.C Date: {helper.formatISODateToDMY(leavingInfo?.lcDate,"-")} अन्वये दिला होता </p>
                                </div>
                            </div>
                        )}

                        <div className="row p-1">
                            <div className="col-12">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">१) विद्यार्थ्याचे संपूर्ण नाव :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.studentId?.studentName} {leavingInfo?.studentId?.fatherName} {leavingInfo?.studentId?.surName}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row p-1">
                            <div className="col-md-6">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">२) आईचे नाव :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.studentId?.motherName}</p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">मातृभाषा :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.studentId?.motherTongue}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row p-1">
                            <div className="col-4">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">३) धर्म :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.studentId?.religion}</p>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">जात :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.studentId?.caste}</p>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">पोटजात :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.studentId?.subCast}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row p-1">
                            <div className="col-12">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">४) राष्ट्रीयत्व :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.studentId?.nationality}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row p-1">
                            <div className="col-6">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">५) जन्मस्थान :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.studentId?.birthPlace}</p>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">तालुका :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.studentId?.tehasilOfBirth?.tehsilName}</p>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">जिल्हा :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.studentId?.districtOfBirth?.districtName}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row p-1">
                            <div className="col-6">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">६) जन्म दिनांक (अंकात) :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{helper.formatISODateToDMY(leavingInfo?.studentId?.dateOfBirth,"-")}</p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">(अक्षरी) :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.studentId?.dateOfBirthInWord}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row p-1">
                            <div className="col-12">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">७) या शाळेत येण्यापूर्वीची शाळा :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0"></p>
                                </div>
                            </div>
                        </div>

                        <div className="row p-1">
                            <div className="col-12">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">८) प्रवेश दिनांक :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{helper.formatISODateToDMY(leavingInfo?.studentId?.admissionDate, "-")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row p-1">
                            <div className="col-6">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">९) अभ्यासाची प्रगती :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.progress}</p>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">वर्तणूक :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.behavior}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row p-1">
                            <div className="col-12">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">१०) शाळा सोडल्याचा दिनांक:</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{helper.formatISODateToDMY(leavingInfo?.dateOfLeavingSchool,"-")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row p-1">
                            <div className="col-12">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">११)कोणत्या इयत्तेत व कधीपासून शिकत होता :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.studentId?.whichStandardAdmitted?.standard}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row p-1">
                            <div className="col-12">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">१२) शाळा सोडण्याचे कारण :</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.reasonOfLeavingSchool}</p>
                                </div>
                            </div>
                        </div>

                        <div className="row p-1">
                            <div className="col-12">
                                <div className="d-flex">
                                    <p className="fw-bold me-2 p-0 m-0">१३) शेरा REMARK:</p>
                                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{leavingInfo?.remark}</p>
                                </div>
                            </div>
                        </div>


                        {/* Footer Section */}
                        <div className="mt-3">
                            <p>वरील माहिती शालेय दैनिक मुल्यांकनानुसार आहे.</p>
                            <div className="d-flex justify-content-between mt-3">
                                <p>दिनांक: {date.getDate()}-{date.getMonth()}-{date.getFullYear()}</p>
                                <p>वर्गशिक्षक</p>
                                <p>शिक्षक</p>
                                <p>मुख्याध्यापक</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LCdownload;