import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import '../styling/AttendanceSheet.css'; // Ensure this path is correct
import { jwtDecode } from 'jwt-decode';
import apiService from '../services/api.service';
import Next from './Next'; // Assuming this is your custom Next button/link component

// --- Helper Functions (Keep these as they are) ---
function getDaysInMonthForHeader(year, month) { // month is 1-indexed
    // ... (your existing function - no changes needed here)
    const daysArray = [];
    const date = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayNamesEng = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dayNamesMar = ["रवि", "सोम", "मंगळ", "बुध", "गुरु", "शुक्र", "शनि"];

    for (let i = 1; i <= daysInMonth; i++) {
        date.setDate(i);
        const dayOfWeek = date.getDay();
        let holidayMarker = '•';
        if (dayOfWeek === 0) holidayMarker = 'S';
        daysArray.push({
            eng: dayNamesEng[dayOfWeek], mar: dayNamesMar[dayOfWeek],
            date: String(i).padStart(2, '0'), holiday: holidayMarker,
            fullDate: new Date(year, month - 1, i)
        });
    }
    return daysArray;
}

function generateDailyReportForStudent(studentAttendanceRecord) {
    // ... (your existing function - no changes needed here)
    if (!studentAttendanceRecord || !studentAttendanceRecord.monthnyear) return [];
    const [recordYearStr, recordMonthStr] = studentAttendanceRecord.monthnyear.split("-");
    const recordYear = parseInt(recordYearStr, 10);
    const recordMonth = parseInt(recordMonthStr, 10);
    if (isNaN(recordYear) || isNaN(recordMonth)) return [];
    const report = [];
    const daysInMonth = new Date(recordYear, recordMonth, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(recordYear, recordMonth - 1, i);
        if (date.getFullYear() !== recordYear || date.getMonth() !== recordMonth - 1) continue;
        const dayLabel = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        report.push({ day: i, dayLabel, status: studentAttendanceRecord[`day${i}`] || "N/A" });
    }
    return report;
}

function formatISODateToDMY(isoDateString, outputSeparator = "") {
    // ... (your existing function - no changes needed here)
    if (!isoDateString || typeof isoDateString !== 'string') return "";
    const dateObj = new Date(isoDateString);
    if (isNaN(dateObj.getTime())) return "";
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return outputSeparator ? `${day}${outputSeparator}${month}${outputSeparator}${year}` : `${day}${month}${year}`;
}


function AttendanceReport() {
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Start false, set true during fetch
    const [error, setError] = useState(null);
    const [classTeacherInfo, setClassTeacherInfo] = useState({
        standard: '', teacherName: 'लोड होत आहे...', teacherDivision: '...', teacherId: null
    }); // Initialize with empty or loading states

    // New states for year and month selection
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12

    const [availableYears, setAvailableYears] = useState([]);
    const months = [
        { value: 1, name: 'जानेवारी' }, { value: 2, name: 'फेब्रुवारी' }, { value: 3, name: 'मार्च' },
        { value: 4, name: 'एप्रिल' }, { value: 5, name: 'मे' }, { value: 6, name: 'जून' },
        { value: 7, name: 'जुलै' }, { value: 8, name: 'ऑगस्ट' }, { value: 9, name: 'सप्टेंबर' },
        { value: 10, name: 'ऑक्टोबर' }, { value: 11, name: 'नोव्हेंबर' }, { value: 12, name: 'डिसेंबर' }
    ];

    const [monthDaysHeader, setMonthDaysHeader] = useState([]);
    const [displayMonthYear, setDisplayMonthYear] = useState('');
    const [totalWorkingDaysForMonth, setTotalWorkingDaysForMonth] = useState(0);

    const token = sessionStorage.getItem('token');
    const decodedToken = token ? jwtDecode(token) : {};
    const udise = decodedToken?.udiseNo;
    const currentTeacherId = decodedToken?.id; // Use a different name to avoid conflict with teacherId in classTeacherInfo state


    useEffect(() => {
        // Populate available years
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 1; i++) {
            years.push(i);
        }
        setAvailableYears(years);
    }, []);


    // This useCallback is for the main data fetching logic
    const fetchDataForSelectedPeriod = useCallback(async () => {
        if (!currentTeacherId || !udise || !selectedYear || !selectedMonth) {
            setError("आवश्यक माहिती उपलब्ध नाही.");
            setAttendanceData([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setAttendanceData([]); // Clear previous attendance data

        // Update display month/year and day headers based on selected period
        const selectedDateObj = new Date(selectedYear, selectedMonth - 1, 1);
        const monthName = selectedDateObj.toLocaleString('mr-IN', { month: 'long' }).toUpperCase();
        setDisplayMonthYear(`${monthName} ${selectedYear}`);
        const daysForHeader = getDaysInMonthForHeader(selectedYear, selectedMonth);
        setMonthDaysHeader(daysForHeader);
        // TODO: Fetch actual holidays for the selected month/year for accurate working days
        const workingDaysCount = daysForHeader.filter(day => day.holiday !== 'S' && day.holiday !== 'H').length;
        setTotalWorkingDaysForMonth(workingDaysCount);

        try {
            let currentStandard = classTeacherInfo.standard;

            // Fetch teacher info if it's not loaded yet or if the teacherId has changed
            if (!classTeacherInfo.teacherId || classTeacherInfo.teacherId !== currentTeacherId) {
                const teacherResponse = await apiService.getdata(`classteacher/getbyid/${currentTeacherId}`);
                currentStandard = teacherResponse.data?.standardMaster?.standard;
                const teacherName = `${teacherResponse.data?.staff?.fname || ''} ${teacherResponse.data?.staff?.lname || ''}`.trim() || 'N/A';
                const teacherDivision = teacherResponse.data?.division?.name || 'N/A';
                setClassTeacherInfo({ standard: currentStandard, teacherName, teacherDivision, teacherId: currentTeacherId });

                if (!currentStandard) {
                    throw new Error("शिक्षकासाठी इयत्ता माहिती मिळाली नाही.");
                }
            }

            if (!currentStandard) { // If standard is still not available after attempting to fetch teacher info
                throw new Error("इयत्ता माहिती उपलब्ध नसल्याने हजेरी लोड करता आली नाही.");
            }


            const formattedMonthForAPI = String(selectedMonth).padStart(2, '0');
            const apiMonthYearFormat = `${selectedYear}-${formattedMonthForAPI}`;

            // ***** CRITICAL: ADJUST YOUR API ENDPOINT HERE *****
            const attendanceRes = await apiService.getdata(
                `api/attendance/by-udise-std-monthnyear/${udise}/${currentStandard}/${apiMonthYearFormat}`
                // Make sure this endpoint accepts monthnyear in YYYY-MM format
            );

            if (Array.isArray(attendanceRes.data)) {
                setAttendanceData(attendanceRes.data);
            } else {
                console.warn("API did not return an array for attendance data:", attendanceRes.data);
                setAttendanceData([]); // Set to empty if API response is not an array
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message || 'हजेरी माहिती लोड करताना त्रुटी आली.');
            setAttendanceData([]); // Clear data on error
        } finally {
            setIsLoading(false);
        }
    }, [currentTeacherId, udise, selectedYear, selectedMonth, classTeacherInfo.teacherId, classTeacherInfo.standard]); // Added classTeacherInfo.teacherId to re-evaluate if it changes

    useEffect(() => {
        fetchDataForSelectedPeriod();
    }, [fetchDataForSelectedPeriod]); // Trigger fetch when dependencies of fetchDataForSelectedPeriod change


    // Initial check for teacherId and UDISE - can be part of the main useEffect or separate
    useEffect(() => {
        if (!currentTeacherId || !udise) {
            setError("User information (teacher ID or UDISE) not found in token.");
            setIsLoading(false); // Ensure loading is stopped if critical info is missing
        }
    }, [currentTeacherId, udise]);


    if (isLoading && attendanceData.length === 0) { // Show main loading only on initial load or when data is truly empty
        return <div className="text-center p-5">माहिती लोड होत आहे...</div>;
    }

    if (error && !isLoading && attendanceData.length === 0) { // Show error if no data and not loading
        return (
            <div className="container mt-5">
                <div className="position-relative p-4 bg-light rounded-3 border shadow-sm">

                    <div className="text-center py-5">
                        <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mt-3 text-danger">त्रुटी</h4>
                        <p className="text-muted mb-0">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const today = new Date();

    // Get the last day of the current month
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // day 0 of next month is last day of current month

    // Check if today is the last day of the month
    const isLastDayOfMonth = today.toDateString() === lastDayOfMonth.toDateString();

    if (!isLastDayOfMonth) {
        return (
            <>
                <div className="not-available-container">
                    <div className="position-absolute top-0 end-0 mt-2 me-2">
                        <Next
                            classname="btn btn-outline-danger btn-sm rounded-circle float-end"
                            path="/teacher/"
                            placeholder={
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                                </svg>
                            }
                        />
                    </div>
                    <div className="not-available-content">
                        <svg className="not-available-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                            <path d="M0 0h24v24H0z" fill="none" />
                        </svg>
                        <h2>Content Currently Unavailable</h2>
                        <p>This section is only visible on the last day of each month.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Year and Month Selection UI - Non-Printable */}
            <div className="container-fluid my-4 p-4 bg-white rounded-lg shadow-md d-print-none border border-gray-200">
                <div className="row g-4 align-items-center position-relative">
                    {/* Close button positioned in the top corner */}
                    <div className="position-absolute top-0 end-0 mt-2 me-2">
                        <Next
                            classname="btn btn-outline-danger btn-sm rounded-circle float-end"
                            path="/teacher/"
                            placeholder={
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                                </svg>
                            }
                        />
                    </div>

                    {/* Date selectors with improved styling */}
                    <div className="col-12 col-md-auto me-md-4">
                        <div className="d-flex align-items-center">
                            <label htmlFor="reportSelectYear" className="form-label fw-bold me-3 text-secondary mb-0">वर्ष:</label>
                            <select
                                id="reportSelectYear"
                                className="form-select py-2 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-400 transition-all"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                disabled={isLoading}
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="col-12 col-md-auto">
                        <div className="d-flex align-items-center">
                            <label htmlFor="reportSelectMonth" className="form-label fw-bold me-3 text-secondary mb-0">महिना:</label>
                            <select
                                id="reportSelectMonth"
                                className="form-select py-2 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-400 transition-all"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                disabled={isLoading}
                            >
                                {months.map(month => (
                                    <option key={month.value} value={month.value}>{month.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="col-12 col-md-auto ms-md-auto">
                            <div className="d-flex align-items-center">
                                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <span className="text-muted">Loading...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isLoading && <div className="text-center p-3"><p>निवडलेल्या कालावधीसाठी माहिती लोड करत आहे...</p></div>}

            {!isLoading && !error && attendanceData.length === 0 && (
                <div className="container mt-4">
                    <div className="position-relative p-4 bg-white rounded-3 border shadow-sm">

                        <div className="text-center py-5">
                            <i className="bi bi-calendar-x text-secondary" style={{ fontSize: '3rem' }}></i>
                            <h4 className="mt-3 text-secondary">हजेरी माहिती उपलब्ध नाही</h4>
                            <p className="text-muted mb-0">निवडलेल्या महिन्यासाठी ({displayMonthYear}) कोणतीही हजेरी माहिती सापडली नाही.</p>
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && attendanceData.length > 0 && ( // Only render report if data exists and not loading
                <div className="attendance-component-wrapper container-fluid p-3">

                    <div id="printable-area">
                        <div className="d-flex justify-content-between align-items-center mb-3 p-2 border header-info flex-wrap">
                            <div><strong>वर्गशिक्षकाचे नांव:-</strong> {classTeacherInfo.teacherName}</div>
                            <div><strong>इयत्ता:</strong> {classTeacherInfo.standard}</div>
                            <div><strong>तुकडी / DIV STREAM:</strong> {classTeacherInfo.teacherDivision}</div>
                            <div><strong>महिना / MONTH & YEAR:</strong> {displayMonthYear}</div>
                            <div><strong>एकूण कामाचे दिवस / WORKING DAYS:</strong> {totalWorkingDaysForMonth}</div>
                        </div>
                        <div className="table-responsive attendance-sheet">
                            <table className="table table-bordered table-sm align-middle custom-table">
                                <thead>
                                    <tr className="text-center header-row-1">
                                        {/* Static Headers ... (same as your existing headers) ... */}
                                        <th rowSpan="2" className="info-col">जन.<br />रजी.<br />क्र.<br />GEN<br />REG<br />NO</th>
                                        <th rowSpan="2" className="info-col">अपार आयडी<br />APAR ID</th>
                                        <th rowSpan="2" className="info-col">स्टुडंट आय.डी.<br />STUDENT ID</th>
                                        <th rowSpan="2" className="info-col">आधार क्रमांक<br />ADHAR NO.</th>
                                        <th rowSpan="2" className="info-col">जन्म तारीख<br />DATE OF<br />BIRTH</th>
                                        <th rowSpan="2" className="info-col">धर्म<br />RELIGION</th>
                                        <th rowSpan="2" className="info-col">जात<br />CAST</th>
                                        <th rowSpan="2" className="info-col">प्रवर्ग<br />CATEGORY</th>
                                        <th rowSpan="2" className="info-col">शुल्क दावीत्व<br />वर्ग<br />EBC INFO</th>
                                        <th rowSpan="2" className="sr-no-col">अनु.क्र.<br />SR.NO.</th>
                                        <th rowSpan="2" className="name-header-col">पूर्ण नांव<br />(आडनांव प्रथम)<br />STUDENT<br />NAME</th>
                                        <th rowSpan="2" className="name-header-col">आईचे नांव<br />MOTHER'S<br />NAME</th>

                                        {monthDaysHeader.map((day, index) => (
                                            <th key={`header-${index}`} className="text-center align-middle day-col">
                                                <div>{day.eng}</div>
                                                <div>{day.date}</div>
                                                <div className='d-column'>{day.mar}</div>
                                                <div>{day.holiday}</div>
                                            </th>
                                        ))}
                                        <th rowSpan="2" className="summary-col">एकूण<br />कामाचे<br />दिवस<br /><span style={{ fontSize: '0.8em' }}>चालू महिना<br />उपस्थिती</span></th>
                                        <th rowSpan="2" className="summary-col total-header-col">एकूण<br />हजेरी<br />TOTAL<br />PRESENT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData.map((studentRecord, studentIndex) => {
                                        const studentInfo = studentRecord.studId || {};
                                        const studentDailyReport = generateDailyReportForStudent(studentRecord);
                                        let totalPresent = studentRecord.totalp || 0;
                                        let attendedOnWorkingDays = studentRecord.workDays || 0;

                                        return (
                                            <tr key={studentInfo.studentId || `student-${studentIndex}`}>
                                                <td className="text-center">{studentInfo.registerNumber || ''}</td>
                                                <td className="text-center">{studentInfo.apparId || ''}</td>
                                                <td className="text-center">{studentInfo.studentId || ''}</td>
                                                <td className="text-center">{studentInfo.adhaarNumber || ''}</td>
                                                <td className="text-center">{formatISODateToDMY(studentInfo.dateOfBirth, "/")}</td>
                                                <td className="text-center">{studentInfo.religion || ''}</td>
                                                <td className="text-center">{studentInfo.subCast || ''}</td>
                                                <td className="text-center">{studentInfo.casteCategory || ''}</td>
                                                <td className="text-center">{studentInfo.ebcInformation || ''}</td>
                                                <td className="text-center">{studentIndex + 1}</td>
                                                <td className="name-col">{`${studentInfo.surName || ''} ${studentInfo.studentName || ''} ${studentInfo.fatherName || ''}`.trim()}</td>
                                                <td className="name-col">{studentInfo.motherName || ''}</td>

                                                {monthDaysHeader.map((dayConfig, dayIdx) => {
                                                    const dayNum = parseInt(dayConfig.date, 10);
                                                    const reportForDay = studentDailyReport.find(r => r.day === dayNum);
                                                    const status = reportForDay ? reportForDay.status : "N/A";
                                                    let cellClass = "text-center attendance-mark";
                                                    if (['S', 'H'].includes(status) || ['S', 'H'].includes(dayConfig.holiday)) {
                                                        cellClass += " holiday-cell-highlight";
                                                    }
                                                    return (
                                                        <td key={`day-${dayConfig.date}-${dayIdx}`} className={cellClass}>
                                                            {status}
                                                        </td>
                                                    );
                                                })}
                                                <td className="text-center working-days-data">{attendedOnWorkingDays}</td>
                                                <td className="text-center total-col-data">{totalPresent}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-4 text-center d-print-none">
                        <button className="btn btn-primary" onClick={() => window.print()} disabled={attendanceData.length === 0}>
                            हजेरी पत्रक प्रिंट करा
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default AttendanceReport;