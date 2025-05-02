import React, { useEffect, useRef, useState } from 'react'
import apiService from '../services/api.service';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function PresentyCertificate() {

  const { id } = useParams();
  const [studentData, setStudentData] = useState();
  const[academicData,setAcademicData]=useState();
  const[lastAcademicData,setLastAcademicData]=useState();
  const udise = 12345678093;
  const printContentRef = useRef(null);
  const navigate = useNavigate();

  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 900;

  useEffect(() => {
    apiService.getbyid('student/', id).then((response) => {
      console.log('Student Data:', response.data);
      setStudentData(response.data);
    });
  
    axios.get("http://localhost:8080/academic/student-school", {
      params: {
        studentId: id,
        schoolUdiseNo: udise
      }
    }).then((response) => {
      console.log('Academic Data:', response.data);
      setAcademicData(response.data);
  
      // Now that we have academicData, call the last year data API
      apiService.getbyid('academicold/lastyear/', response.data.id).then((lastYearResponse) => {
        console.log('Last Year Academic:', lastYearResponse.data);
        setLastAcademicData(lastYearResponse.data);
      });
    }).catch((error) => {
      console.error("Error fetching academic data:", error);
    });
  }, [id, udise]);
  

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
    navigate(`/reports/${id}`);
  }

  return (
    <div className="container mt-3 mb-3">
      {/* Print Button */}
      <div className="d-flex justify-content-center mb-3">
        <button
          className="btn btn-primary"
          onClick={handlePrint}
        >
          Print 75% Presenty Certificate
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
                  <p className="small  p-0 m-0"><span className='fw-bold'>तालुका :-</span> {studentData?.school?.tehsil?.tehsilName || ''}, <span className='fw-bold'>जिल्हा :-</span> {studentData?.school?.district?.districtName}, <span className='fw-bold'>राज्य :-</span> {studentData?.school?.state.stateName}, <span className='fw-bold'>पिनकोड :-</span> {studentData?.school?.pinCode}, </p>
                  <p className="small  border-top p-0 m-0 border-dark"><span className='fw-bold'>माध्यम :-</span> {studentData?.school?.medium}, <span className='fw-bold'>बोर्ड :-</span> {studentData?.school?.board}, <span className='fw-bold'>बोर्ड विभाग :-</span> {studentData?.school?.boardDivision}, <span className='fw-bold'>शिक्षण बोर्ड क्रमांक :- </span> {studentData?.schoolUdise?.boardIndexNo}</p>
                </div>
              </div>
            </div>

            {/* School Information */}
            <div className='border-top border-dark '>
              <div className="row py-2 ">
                <div className="col-5 mx-auto ">
                  <div className="d-flex ">
                    <p className="fw-bold p-0 m-0 ">SCHOOL U-DISE NO.:</p>
                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{studentData?.school?.udiseNo}</p>
                  </div>
                </div>
                <div className="col-5 mx-auto">
                  <div className="d-flex ">
                    <p className="fw-bold p-0 m-0">E-MAIL ID:</p>
                    <p className="border-bottom border-dark flex-grow-1 p-0 m-0">{studentData?.school?.schoolEmailId}</p>
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

            <div>
              <p>प्रमाणपत्र  देण्यात येते की ,कुमार/कुमारी <span>{studentData?.studentName} {studentData?.fatherName} {studentData?.surName} </span> चालू वर्ष { academicData?.academicYear} मध्ये {academicData?.standard?.standard } मध्ये शिकत आहे.मागील शैक्षणिक {lastAcademicData?.academicYear} वर्ष मध्ये त्याची/तिची उपस्थिती ७५% पेक्षा जास्त होती. दाखला मागणीव न देणेत आला असे.</p>
            </div>
            <div className='row'>
              <div className='col-6'>
                <p>स्थळ :- </p>
                <p>दिनांक :-</p>
              </div>
              <div className='col-6'>
                <p>मुख्याध्यापक</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PresentyCertificate

