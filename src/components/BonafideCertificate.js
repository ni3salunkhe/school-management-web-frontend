import React, { useEffect, useRef, useState } from "react";
import apiService from "../services/api.service";
import { useParams } from "react-router-dom";
import axios from "axios"; // Keep if apiService doesn't cover all auth cases
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2"; // Keep for confirmations and errors
import "sweetalert2/dist/sweetalert2.min.css";
import CombinedDropdownInput from "./CombinedDropdownInput"; // Your custom component
import helper from "../services/helper.service";
import { decodeId } from "../utils/idEncoder";

function BonafideCertificate() {
  const printContentRef = useRef(null);
  const [studentData, setStudentData] = useState(null);
  const { id: encodedId } = useParams();
  const studentId = decodeId(encodedId);
  const token = sessionStorage.getItem("token");
  const udise = token ? jwtDecode(token)?.udiseNo : null;
  const [academicData, setAcademicData] = useState(null);
  const [certificateReason, setCertificateReason] = useState("");
  const [reasonOptions, setReasonOptions] = useState([]); // For CombinedDropdownInput options
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Tracks if student/academic data is loaded
  const [error, setError] = useState();
  const date = new Date();

  const isOnlyMarathi = (input) => {
    const marathiRegex = /^[\u0900-\u097F\s]+$/;
    return marathiRegex.test(input);
  };

  const A4_WIDTH_PX = 794; // Standard A4 width in pixels at 96dpi
  const A4_HEIGHT_PX = 1000; // Adjusted A4 height for your template

  // Effect 1: Fetch predefined reasons for the dropdown
  useEffect(() => {
    const fetchInitialReasons = async () => {
      if (!udise) {
        console.warn("UDISE number not available, cannot fetch reasons.");
        setIsLoading(false); // Stop initial loading if UDISE is missing
        return;
      }
      setIsLoading(true);
      try {
        // TODO: Replace 'bonafide/reasons' with your actual endpoint.
        // This endpoint should return an array of strings or objects like { id: ..., reasonText: "..." }
        const response = await apiService.getdata("bonafide/"); // Ensure apiService.getdata is defined and handles auth

        if (response && response.data) {
          // Assuming response.data is an array of objects like { id: ..., reasonText: "..." }
          // If it's an array of strings, just use response.data
          setReasonOptions(response.data.map((item) => item.reason) || []);
        } else {
          setReasonOptions(["कोणतीही माहिती मिळाली नाही "]); // Fallback
        }
      } catch (error) {
        console.error("Error fetching reasons:", error);
        Swal.fire("Error", "Failed to load predefined reasons.", "error");
        setReasonOptions([
          "शैक्षणिक कामासाठी",
          "शासकीय योजनेसाठी",
          "शिष्यवृत्तीसाठी",
        ]); // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialReasons();
  }, [udise]);

  // Effect 2: Fetch student and academic data (runs once or if studentId/udise change)
  useEffect(() => {
    const fetchStudentAndAcademicData = async () => {
      if (!studentId || !udise) {
        setIsDataLoaded(false);
        return;
      }
      // Don't set isLoading to true here if reasons are still loading
      // Let the initial reason fetch control the initial isLoading state
      setIsLoading((prev) => (!prev ? true : prev)); // Set to true only if not already loading
      setIsDataLoaded(false);
      try {
        const [studentRes, academicRes] = await Promise.all([
          apiService.getbyid("student/", studentId),
          axios.get("http://localhost:8080/academic/student-school", {
            params: { studentId: studentId, schoolUdiseNo: udise },
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setStudentData(studentRes.data);
        setAcademicData(academicRes.data);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error fetching student/academic data:", error);
        Swal.fire(
          "Error",
          "Failed to load student or academic details.",
          "error"
        );
        setIsDataLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };
    // Fetch data only if UDISE is present (implies reasons might also be fetched or attempted)
    if (udise) {
      fetchStudentAndAcademicData();
    }
  }, [studentId, udise, token]);

  const handleReasonInputChange = (id, value) => {

    if (!isOnlyMarathi(value)) {

      setError(true);
    } else {
      setError(false); // Clear error if input is valid
    }
    setCertificateReason(value);
  };

  const handleGenerateAndPrint = async () => {
    let flag = false;
    if (!certificateReason || certificateReason.trim() === "") {
      Swal.fire(
        "आवश्यक",
        "कृपया प्रमाणपत्र कशासाठी पाहिजे ते नमूद करा.",
        "warning"
      );
      return;
    }
    if (!isDataLoaded || !studentData || !academicData) {
      Swal.fire(
        "थांबा",
        "विद्यार्थी आणि शैक्षणिक माहिती लोड होत आहे किंवा अयशस्वी झाली आहे. कृपया थोडा वेळ थांबा किंवा पृष्ठ रीफ्रेश करा.",
        "info"
      );
      return;
    }
    if (!isOnlyMarathi(certificateReason)) {
      Swal.fire(
        "आवश्यक",
        "कृपया केवळ मराठी भाषा वापरा. भाषा बदलण्यासाठी Windows key + Spacebar दाबा"
      );
      return;
    }

    setIsLoading(true);
    try {
      const trimmedReason = certificateReason.trim();
      const isNewReason = !reasonOptions.some(
        (option) => option.toLowerCase() === trimmedReason.toLowerCase()
      );

      if (isNewReason) {
        // const { isConfirmed } = await Swal.fire({
        //     title: 'नवीन कारण?',
        //     text: `"${trimmedReason}" हे कारण नवीन आहे. तुम्हाला ते भविष्यातील वापरासाठी जतन करायचे आहे का?`,
        //     icon: 'question',
        //     showCancelButton: true,
        //     confirmButtonText: 'होय, जतन करा',
        //     cancelButtonText: 'नाही, फक्त वापरा',
        // });

        // if (isConfirmed) {
        //     try {
        //         // TODO: Use your endpoint: POST /bonafide/reasons/add or similar
        //         // Ensure apiService.post is correctly set up and sends auth token
        //         await apiService.post('bonafide/', { // Ensure endpoint and payload are correct
        //             reasonText: trimmedReason,
        //             // schoolUdise: udise // If reasons are school-specific
        //         });
        //         setReasonOptions(prev => { // Add to local options
        //             const newOptions = [...prev, trimmedReason];
        //             // Remove duplicates if any after adding
        //             return [...new Set(newOptions)];
        //         });
        //         Swal.fire('जतन केले!', 'नवीन कारण यशस्वीरित्या जतन केले गेले.', 'success');
        //         flag=true;
        //     } catch (saveError) {
        //         console.error("Error saving new reason:", saveError);
        //         Swal.fire('त्रुटी', 'नवीन कारण जतन करताना त्रुटी आली, परंतु प्रमाणपत्र तयार केले जाईल.', 'warning');
        //     }
        // }

        const bonafidePayload = {
          reason: trimmedReason,
          school: udise,
          // student: studentId,
          // location: "School Office"
        };
        const bonafideResponse = await apiService.post(
          "bonafide/",
          bonafidePayload
        );

      }
      triggerPrint();
      setCertificateReason("");
    } catch (error) {
      console.error("Error generating bonafide certificate:", error);
      let errorMessage = "प्रमाणपत्र तयार करताना त्रुटी आली.";
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = "तुमची विनंती अधिकृत नाही. कृपया पुन्हा लॉग इन करा.";
        } else if (error.response.status === 400) {
          errorMessage = `विनंतीमध्ये त्रुटी: ${error.response.data?.message ||
            error.response.data ||
            "कृपया माहिती तपासा."
            }`;
        } else {
          errorMessage = `सर्व्हर त्रुटी: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = "सर्व्हरकडून प्रतिसाद नाही.";
      }
      Swal.fire("त्रुटी", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerPrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      Swal.fire("त्रुटी", "कृपया प्रिंटसाठी पॉप-अप सक्षम करा.", "error");
      return;
    }
    const contentToPrint = printContentRef.current;
    if (!contentToPrint) {
      Swal.fire("त्रुटी", "प्रिंट करण्यासाठी सामग्री उपलब्ध नाही.", "error");
      return;
    }
    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bonafide Certificate</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: A4; margin: 0; } .certificate-page { page-break-after: always; height: ${A4_HEIGHT_PX}px; } .certificate-page:last-child { page-break-after: auto; } }
                    body { font-family: 'Noto Sans Devanagari', sans-serif; margin: 0; padding: 0; } .print-container { width: ${A4_WIDTH_PX}px; margin: 0 auto; } .certificate-page { width: 100%; padding: 20px; box-sizing: border-box; } .bg-secondary-subtle { background-color: #e2e3e5; } .office-copy-label { position: absolute; right: 20px; top: 20px; font-style: italic; font-weight: bold; }
                </style>
            </head>
            <body> <div class="print-container">${contentToPrint.innerHTML}</div> <script> window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 500); } </script> </body>
            </html>
        `);
    printWindow.document.close();
  };

  const CertificateTemplate = ({ isOfficeCopy = false }) => {
    if (!studentData || !academicData)
      return (
        <div className="text-center p-5">
          प्रमाणपत्रासाठी माहिती लोड होत आहे...
        </div>
      );



    return (
      <div
        className="border border-dark p-2 h-100"
        style={{ position: "relative" }}
      >
        {isOfficeCopy && <div className="office-copy-label">OFFICE COPY</div>}
        {/* Header Section */}
        <div className="row">
          <div className="col-3">
            <div className="border border-dark h-100 d-flex align-items-center justify-content-center">
              {studentData.school?.logo ? (
                <img
                  src={`data:image/jpeg;base64,${studentData.school.logo}`}
                  alt="School Logo"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <p className="text-center fw-bold">logo</p>
              )}
            </div>
          </div>
          <div className="col-9">
            <div className="text-center">
              <p className="small">{studentData.school?.schoolSlogan || ""}</p>
              <p className="">{studentData.school?.sansthaName || ""}</p>
              <h1 className="fs-4 fw-bold bg-secondary-subtle p-2">
                {studentData.school?.schoolName || ""}
              </h1>
              <p className="small p-0 m-0">
                <span className="fw-bold">तालुका :-</span>{" "}
                {studentData.school?.tehsil?.tehsilName || ""},
                <span className="fw-bold"> जिल्हा :-</span>{" "}
                {studentData.school?.district?.districtName || ""},
                <span className="fw-bold"> राज्य :-</span>{" "}
                {studentData.school?.state?.stateName || ""},
                <span className="fw-bold"> पिनकोड :-</span>{" "}
                {studentData.school?.pinCode || ""}
              </p>
              <p className="small border-top p-0 m-0 border-dark">
                <span className="fw-bold">माध्यम :-</span>{" "}
                {studentData.school?.medium || ""},
                <span className="fw-bold"> बोर्ड :-</span>{" "}
                {studentData.school?.board || ""},
                <span className="fw-bold"> बोर्ड विभाग :-</span>{" "}
                {studentData.school?.boardDivision || ""},
                <span className="fw-bold"> शिक्षण बोर्ड क्रमांक :-</span>{" "}
                {studentData.school?.boardIndexNo || ""}
              </p>
            </div>
          </div>
        </div>

        {/* School Information */}
        <div className="border-top border-dark border-bottom">
          <div className="row py-2">
            <div className="col-5 mx-auto">
              <div className="d-flex">
                <p className="fw-bold p-0 m-0">SCHOOL U-DISE NO.:</p>
                <p className="border-bottom border-dark flex-grow-1 p-0 m-0">
                  {studentData.school?.udiseNo || ""}
                </p>
              </div>
            </div>
            <div className="col-5 mx-auto">
              <div className="d-flex">
                <p className="fw-bold p-0 m-0">E-MAIL ID:</p>
                <p className="border-bottom border-dark flex-grow-1 p-0 m-0">
                  {studentData.school?.schoolEmailId || ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-center fw-bold">प्रमाणपत्र</h2>
        </div>

        <div className="row m-0">
          <div className="col-6 border-bottom border-end p-0">
            <div className="d-flex">
              <div
                className="fw-bold Cpadding border-top border-end border-start p-1"
                style={{ width: "35%" }}
              >
                अपार आयडी :
              </div>
              <div className="Cpadding flex-grow-1 border-top p-1">
                {studentData.apparId || ""}
              </div>
            </div>
          </div>
          <div className="col-6 border-bottom p-0">
            <div className="d-flex">
              <div
                className="fw-bold Cpadding border-end border-top p-1"
                style={{ width: "35%" }}
              >
                जन.रजि.क्रमांक :
              </div>
              <div className="Cpadding flex-grow-1 border-end border-top p-1">
                {studentData.registerNumber || ""}
              </div>
            </div>
          </div>
        </div>

        <div className="row m-0">
          <div className="col-6 border-bottom border-end p-0">
            <div className="d-flex">
              <div
                className="fw-bold Cpadding border-end border-start p-1"
                style={{ width: "35%" }}
              >
                विद्यार्थी आयडी :
              </div>
              <div className="Cpadding flex-grow-1 p-1">
                {studentData.studentId || ""}
              </div>
            </div>
          </div>
          <div className="col-6 border-bottom p-0">
            <div className="d-flex">
              <div
                className="fw-bold Cpadding border-end p-1"
                style={{ width: "35%" }}
              >
                आधार नं. :
              </div>
              <div className="Cpadding flex-grow-1 border-end p-1">
                {studentData.adhaarNumber || ""}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3">
          <p>
            प्रमाणपत्र देण्यात येते की ,
            {studentData.gender === "पुरुष" ? "कुमार" : "कुमारी"}{" "}
            <span className="fw-bold">
              {studentData.studentName} {studentData.fatherName}{" "}
              {studentData.surName}{" "}
            </span>
            {studentData.gender === "पुरुष" ? "हा" : "ही"} दिनांक{" "}
            <span className="fw-bold">
              {helper.formatISODateToDMY(studentData.admissionDate, "-")}
            </span>{" "}
            ते दिनांक{" "}
            <span className="fw-bold">{academicData.academicYear}</span> पर्यंत
            या विद्यालयाचा प्रामाणिक{" "}
            {studentData.gender === "पुरुष" ? "विद्यार्थी" : "विद्यार्थिनी"}{" "}
            {academicData.status === "learning" ? "आहे" : "होता/होती"}.
            {studentData.gender === "पुरुष" ? "तो" : "ती"} सन{" "}
            <span className="fw-bold">{academicData.academicYear}</span> या
            वर्षी{" "}
            <span className="fw-bold">{academicData.standard?.standard}</span>{" "}
            ईयत्तेमध्ये शिक्षण घेत{" "}
            {academicData.status === "learning" ? "आहे" : "होता/होती"}.<br />
            विद्यालयाच्या नोंदणीबुकावरून{" "}
            {studentData.gender === "पुरुष" ? "त्याची" : "तिची"} जन्म तारीख
            (अंकी){" "}
            <span className="fw-bold">
              {helper.formatISODateToDMY(studentData.dateOfBirth, "-")}
            </span>{" "}
            ही आहे. जन्म तारीख (अक्षरी){" "}
            <span className="fw-bold">{studentData.dateOfBirthInWord}</span> ही
            आहे. जन्मस्थळ{" "}
            <span className="fw-bold">{studentData.birthPlace}</span> तालुका{" "}
            <span className="fw-bold">
              {studentData.tehasilOfBirth?.tehsilName}
            </span>{" "}
            जिल्हा{" "}
            <span className="fw-bold">
              {studentData.districtOfBirth?.districtName}
            </span>{" "}
            राज्य{" "}
            <span className="fw-bold">
              {studentData.stateOfBirth?.stateName}
            </span>{" "}
            आहे.
            {studentData.gender === "पुरुष" ? "त्याचा" : "तिचा"} धर्म{" "}
            <span className="fw-bold">{studentData.religion}</span> जात{" "}
            <span className="fw-bold">{studentData.caste || ""}</span> पोटजात{" "}
            <span className="fw-bold">{studentData.subCast || "_______"}</span>{" "}
            आहे. माझ्या माहितीनुसार{" "}
            {studentData.gender === "पुरुष" ? "त्याची" : "तिची"} वर्तणूक चांगली
            आहे. हे प्रमाणपत्र मागणीनुसार{" "}
            <span className="fw-bold">
              {certificateReason || " कारण नमूद नाही "}
            </span>{" "}
            कामी देण्यात येत आहे.
          </p>
        </div>

        <div className="row mt-4">
          <div className="col-6">
            <p>स्थळ :- {studentData?.school?.village?.villageName}</p>
            <p>
              दिनांक :- {date.getDate()}-{date.getMonth()}-{date.getFullYear()}
            </p>
          </div>
          <div className="col-6">
            {isOfficeCopy ? (
              <>
                <p>
                  स्थळप्रत: <strong>Office Copy</strong>
                </p>
                <p>सही: ___________________</p>
                <p>नाव: ___________________</p>
                <p>मोबाईल क्र./आधार क्र.: ___________________</p>
              </>
            ) : (
              <p className="text-center">मुख्याध्यापक</p>
            )}
          </div>
        </div>

        {/* ... (rest of your certificate template code) ... */}
      </div>
    );
  };

  if (isLoading && !isDataLoaded) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="ms-2">माहिती लोड होत आहे...</p>
      </div>
    );
  }

  return (
    <div className="container mt-3 mb-3">
      <div className="row my-4 justify-content-center">
        <div className="col-md-8 col-lg-7">
          <div className="card shadow rounded-3 border-0">
            <div className="card-header bg-primary bg-gradient text-white py-3 text-center">
              <h4 className="fw-bold mb-0">प्रमाणपत्रासाठी कारण</h4>
            </div>
            <div className="card-body p-4">
              {error && (
                <div
                  className="alert alert-warning d-flex align-items-center mb-3"
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                  <div>
                    "कृपया केवळ मराठी भाषा वापरा. भाषा बदलण्यासाठी Windows key +
                    Spacebar दाबा"
                  </div>
                </div>
              )}
              <div className="alert alert-info small text-center">
                <strong>सूचना:</strong> कृपया प्रथम प्रमाणपत्रासाठीचे कारण निवडा किंवा लिहा. कारण दिल्यानंतरच प्रमाणपत्र तयार केले जाईल.
              </div>

              <div className="mb-4">
                <CombinedDropdownInput
                  label="कारण निवडा किंवा नवीन टाईप करा "
                  id="certificateReasonInput"
                  value={certificateReason}
                  onChange={handleReasonInputChange}
                  required={true}
                  options={reasonOptions}
                  className="col-lg-12"
                />
              </div>

              <div className="d-grid gap-2 mt-4">
                <button
                  className="btn btn-primary btn-lg py-2 rounded-pill shadow-sm"
                  onClick={handleGenerateAndPrint}
                  disabled={
                    !certificateReason.trim() || isLoading || !isDataLoaded
                  }
                >
                  {isLoading && isDataLoaded ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      प्रिंट करत आहे...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-printer-fill me-2"></i>
                      प्रमाणपत्र तयार करा आणि प्रिंट करा
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDataLoaded &&
        studentData &&
        academicData &&
        certificateReason &&
        certificateReason.trim() !== "" && (
          <>
            {/* Optional: Display selected reason above the certificate */}
            {/* <div className="alert alert-info mt-3 text-center">
                        निवडलेले कारण: <strong>{certificateReason}</strong>
                    </div> */}
            <div className="d-flex justify-content-center mb-2">
              <div
                ref={printContentRef}
                style={{
                  width: `${A4_WIDTH_PX}px`,
                  backgroundColor: "white",
                  fontFamily: "'Noto Sans Devanagari', sans-serif",
                  border: "1px solid #eee", // Light border for preview
                  boxShadow: "0 0 10px rgba(0,0,0,0.1)", // Subtle shadow
                }}
              >
                <div className="certificate-page">
                  <CertificateTemplate />
                </div>
                <div className="certificate-page">
                  <CertificateTemplate isOfficeCopy={true} />
                </div>
              </div>
            </div>
          </>
        )}
      {isLoading &&
        isDataLoaded && ( // Loader specifically for when "Generate and Print" is clicked
          <div className="text-center mt-3">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Generating...</span>
            </div>
            <p>प्रमाणपत्र तयार होत आहे...</p>
          </div>
        )}
    </div>
  );
}

export default BonafideCertificate;
