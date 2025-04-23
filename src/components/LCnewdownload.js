import React, { useEffect, useRef, useState } from 'react'
import apiService from '../services/api.service';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function LCnewdownload() {

    const { id } = useParams();

    const printContentRef = useRef(null);

    const [leavingInfo, setLeavingInfo] = useState(null);
    const [error, setError] = useState(null);
    const [isduplicate, setIsDuplicate] = useState(false); // Initialize with false
    const udise = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 900;

    useEffect(() => {
        apiService.getbyid(`leavinginfo/getbystudentId/${id}/udise/`, udise)
            .then((response) => {
                if (response.data) {
                    setLeavingInfo(response.data);
                    console.log(response);
                    console.log(response.data);

                    // Assuming printed: true means it's NOT a duplicate (original)
                    setIsDuplicate(response.data.newlcprinted);
                    console.log(isduplicate);

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
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@500;700&display=swap" rel="stylesheet">
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
                    apiService.putdata(`leavinginfo/newlc/duplicate-count/${id}/udise/`, null, udise)
                        .then(() => alert("धन्यवाद !"))
                        .catch(err => console.error("Duplicate count error", err));
                    // axios.put(`http://localhost:8080/leavinginfo/lc/duplicate-count/${id}/udise/${udise}`).then((response)=>{
                    //     console.log(response.data);

                    // })
                } else {
                    apiService.putdata(`leavinginfo/marknewlcprinted/${id}/udise/`, null, udise)
                        .then(() => alert("धन्यवाद !"))
                        .catch(err => console.error("Mark printed error", err));

                }
            } else {
                console.log("User cancelled or said print failed");
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
        <><style>
            {
                `
                .Cpadding {
                    padding:3px;
                }
                `
            }
        </style>

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
                                        <p className="small m-0 p-0">{leavingInfo?.schoolUdise?.schoolSlogan || ''}</p>
                                        <p className=" m-0 p-0">{leavingInfo?.schoolUdise?.sansthaName || ''}</p>
                                        <h1 className="fs-4 fw-bold bg-secondary-subtle p-2">{leavingInfo?.schoolUdise?.schoolName || ''}</h1>
                                        <p className="small  p-0 m-0"><span className='fw-bold'>तालुका :-</span> {leavingInfo?.schoolUdise?.tehsil?.tehsilName || ''}, <span className='fw-bold'>जिल्हा :-</span> {leavingInfo?.schoolUdise?.district?.districtName}, <span className='fw-bold'>राज्य :-</span> {leavingInfo?.schoolUdise?.state.stateName}, <span className='fw-bold'>पिनकोड :-</span> {leavingInfo?.schoolUdise?.pinCode}, </p>
                                        <p className="small  border-top p-0 m-0 border-dark"><span className='fw-bold'>माध्यम :-</span> {leavingInfo?.schoolUdise?.medium}, <span className='fw-bold'>बोर्ड :-</span> {leavingInfo?.schoolUdise?.board}, <span className='fw-bold'>बोर्ड विभाग :-</span> {leavingInfo?.schoolUdise?.boardDivision}, <span className='fw-bold'>शिक्षण बोर्ड क्रमांक :- </span> {leavingInfo?.schoolUdise?.boardIndexNo}</p>
                                    </div>
                                </div>
                            </div>

                            {/* School Information */}
                            <div className='border-top border-dark '>
                                <div className="row py-1">
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
                            <div className="text-center bg-secondary-subtle border-bottom border-top border-dark py-1">
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
                                        <div className="row py-1">
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
                                        <div className="row py-1">
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
                                        <p className='m-0 p-0 fw-bold'>प्रथम दाखला (1 st L.C) L.C NO: {leavingInfo?.lcNumber} व L.C Date: {leavingInfo?.lcDate} अन्वये दिला होता </p>
                                    </div>
                                </div>
                            )}

                            <div className='row'>
                                <div className='col-12'>
                                    <div className=''>
                                        {/* Appar ID */}
                                        <div className="fw-bold p-0 m-0 d-flex align-items-center mb-2">
                                            <span className="me-2">अपार आयडी :</span>
                                            <div className="d-flex">
                                                {leavingInfo?.studentId?.apparId?.toString()?.split('').map((digit, index) => (
                                                    <div key={index} className="border border-black  px-2 text-center" style={{ minWidth: '20px' }}>
                                                        {digit}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Student ID */}
                                        <div className="fw-bold p-0 m-0 d-flex align-items-center mb-2">
                                            <span className="me-2">विद्यार्थी आयडी :</span>
                                            <div className="d-flex">
                                                {leavingInfo?.studentId?.registerNumber?.toString()?.split('').map((digit, index) => (
                                                    <div key={index} className="border border-black  px-2 text-center" style={{ minWidth: '20px' }}>
                                                        {digit}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Aadhaar Number */}
                                        <div className="fw-bold p-0 m-0 d-flex align-items-center">
                                            <span className="me-2">आधार क्रमांक :</span>
                                            <div className="d-flex">
                                                {leavingInfo?.studentId?.adhaarNumber?.toString()?.split('').map((digit, index) => (
                                                    <div key={index} className="border border-black px-2 text-center" style={{ minWidth: '20px' }}>
                                                        {digit}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='border border-dark mt-2'>
                                {/* Student Full Name + Father's Name */}
                                <div className="row m-0">
                                    <div className="col-8 border-bottom border-end p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding  border-end" style={{ width: '50%' }}>विद्यार्थ्याचे संपूर्ण नाव :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.studentName} {leavingInfo?.studentId?.fatherName} {leavingInfo?.studentId?.surName}</div>
                                        </div>
                                    </div>
                                    <div className="col-4 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>वडीलांचे नाव :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.fatherName}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Surname + Mother's Name */}
                                <div className="row m-0">
                                    <div className="col-6 border-bottom border-end p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>आडनाव :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.surName}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>आईचे नाव :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.motherName}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Nationality + Mother Tongue */}
                                <div className="row m-0">
                                    <div className="col-6 border-bottom border-end p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>राष्ट्रीयत्व :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.nationality}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>मातृभाषा :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.motherTongue}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Religion + Caste + Subcaste */}
                                <div className="row m-0">
                                    <div className="col-4 border-bottom border-end p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>धर्म :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.religion}</div>
                                        </div>
                                    </div>
                                    <div className="col-4 border-bottom border-end p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>जात :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.caste}</div>
                                        </div>
                                    </div>
                                    <div className="col-4 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>पोटजात :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.subCast}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Birth Place + Birth Tehsil */}
                                <div className="row m-0">
                                    <div className="col-6 border-bottom border-end p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>जन्म स्थळ :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.birthPlace}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>जन्म तालुका :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.tehasilOfBirth?.tehsilName}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Birth District + Birth State */}
                                <div className="row m-0">
                                    <div className="col-6 border-bottom border-end p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>जन्म जिल्हा :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.districtOfBirth?.districtName}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>जन्म राज्य :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.stateOfBirth?.stateName}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Date of Birth (Numeric + Words) */}
                                <div className="row m-0">
                                    <div className="col-6 border-bottom border-end p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>जन्म दिनांक (अंकात) :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.dateOfBirth}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>(अक्षरी) :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.dateOfBirthInWord}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Previous School (Full width) */}
                                <div className="row m-0">
                                    <div className="col-12 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '30%' }}>या शाळेत येण्यापूर्वीची शाळा :</div>
                                            <div className="Cpadding flex-grow-1"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Admission Date + Standard */}
                                <div className="row m-0">
                                    <div className="col-6 border-bottom border-end p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>प्रवेश दिनांक :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.admissionDate}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>इयत्ता :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.whichStandardAdmitted}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress + Behavior */}
                                <div className="row m-0">
                                    <div className="col-6 border-bottom border-end p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>अभ्यासाची प्रगती :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.progress}</div>
                                        </div>
                                    </div>
                                    <div className="col-6 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '50%' }}>वर्तणूक :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.behavior}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Leaving Date (Full width) */}
                                <div className="row m-0">
                                    <div className="col-12 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '40%' }}>शाळा सोडल्याचा दिनांक :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.dateOfLeavingSchool}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Studying Standard (Full width) */}
                                <div className="row m-0">
                                    <div className="col-12 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '40%' }}>कोणत्या इयत्तेत व कधीपासून शिकत होता :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.studentId?.whichStandardAdmitted}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reason for Leaving (Full width) */}
                                <div className="row m-0">
                                    <div className="col-12 border-bottom p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '30%' }}>शाळा सोडण्याचे कारण :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.reasonOfLeavingSchool}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Remarks (Full width) */}
                                <div className="row m-0">
                                    <div className="col-12 p-0">
                                        <div className="d-flex">
                                            <div className="fw-bold Cpadding border-end" style={{ width: '20%' }}>शेरा :</div>
                                            <div className="Cpadding flex-grow-1">{leavingInfo?.remark}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Footer Section */}
                            <div className="mt-3">
                                <p>वरील माहिती शालेय दैनिक मुल्यांकनानुसार आहे.</p>
                                <div className="d-flex justify-content-between mt-3">
                                    <p>दिनांक:{leavingInfo.lcDate}</p>
                                    <p>वर्गशिक्षक</p>
                                    <p>शिक्षक</p>
                                    <p>मुख्याध्यापक</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LCnewdownload
