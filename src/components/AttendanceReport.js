import React, { useEffect, useState } from 'react';
import '../styling/AttendanceSheet.css'; // Ensure this path is correct
import { jwtDecode } from 'jwt-decode';
import apiService from '../services/api.service';
import Next from './Next';

// --- Helper Functions ---
function getDaysInMonthForHeader(year, month) { // month is 1-indexed
    const daysArray = [];
    const date = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayNamesEng = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dayNamesMar = ["रवि", "सोम", "मंगळ", "बुध", "गुरु", "शुक्र", "शनि"];

    for (let i = 1; i <= daysInMonth; i++) {
        date.setDate(i);
        const dayOfWeek = date.getDay();
        let holidayMarker = '•';
        if (dayOfWeek === 0) {
            holidayMarker = 'S'; // Mark Sundays
        }
        // TODO: Integrate your actual holiday list from API or config to mark 'H'
        // For now, only Sundays are marked 'S'
        daysArray.push({
            eng: dayNamesEng[dayOfWeek],
            mar: dayNamesMar[dayOfWeek],
            date: String(i).padStart(2, '0'),
            holiday: holidayMarker,
            fullDate: new Date(year, month - 1, i)
        });
    }
    return daysArray;
}

function generateDailyReportForStudent(studentAttendanceRecord) {
    if (!studentAttendanceRecord || !studentAttendanceRecord.monthnyear) {
        console.warn("Invalid student attendance record or missing monthnyear:", studentAttendanceRecord);
        return [];
    }
    const [recordYearStr, recordMonthStr] = studentAttendanceRecord.monthnyear.split("-");
    const recordYear = parseInt(recordYearStr, 10);
    const recordMonth = parseInt(recordMonthStr, 10);
    if (isNaN(recordYear) || isNaN(recordMonth)) {
        console.error("Invalid monthnyear format:", studentAttendanceRecord.monthnyear);
        return [];
    }
    const report = [];
    const daysInMonth = new Date(recordYear, recordMonth, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(recordYear, recordMonth - 1, i);
        if (date.getFullYear() !== recordYear || date.getMonth() !== recordMonth - 1) {
            console.warn(`Date mismatch for day ${i} of ${recordMonth}-${recordYear}.`);
            continue;
        }
        const dayLabel = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        const key = `day${i}`;
        report.push({
            day: i,
            dayLabel: dayLabel,
            status: studentAttendanceRecord[key] || "N/A",
        });
    }
    return report;
}

function formatISODateToDMY(isoDateString, outputSeparator = "") {
    if (!isoDateString || typeof isoDateString !== 'string') {
        return "";
    }
    const dateObj = new Date(isoDateString);
    if (isNaN(dateObj.getTime())) {
        return "";
    }
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    if (outputSeparator) {
        return `${day}${outputSeparator}${month}${outputSeparator}${year}`;
    }
    return `${day}${month}${year}`;
}


function AttendanceReport() {
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [classTeacherInfo, setClassTeacherInfo] = useState({ standard: '.....', teacherName: 'NAME & QUALIFICATION', teacherDivision: '.....' });
    const [monthDaysHeader, setMonthDaysHeader] = useState([]);
    const [displayMonthYear, setDisplayMonthYear] = useState('');
    const [totalWorkingDaysForMonth, setTotalWorkingDaysForMonth] = useState(0);

    const token = sessionStorage.getItem('token');
    const decodedToken = token ? jwtDecode(token) : {};
    const udise = decodedToken?.udiseNo;
    const teacherId = decodedToken?.id;

    useEffect(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1-indexed
        const apiMonthYearFormat = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

        const monthName = now.toLocaleString('default', { month: 'long' }).toUpperCase();
        setDisplayMonthYear(`${monthName} ${currentYear}`);

        const daysForHeader = getDaysInMonthForHeader(currentYear, currentMonth);
        setMonthDaysHeader(daysForHeader);

        // TODO: Fetch actual holidays for the month and pass to getDaysInMonthForHeader
        // or adjust workingDaysCount based on fetched holidays
        const workingDaysCount = daysForHeader.filter(day => day.holiday !== 'S' && day.holiday !== 'H').length;
        setTotalWorkingDaysForMonth(workingDaysCount);

        if (!teacherId || !udise) {
            setError("User information (teacher ID or UDISE) not found in token.");
            setIsLoading(false);
            return;
        }

        const fetchAttendanceData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const teacherResponse = await apiService.getdata(`classteacher/getbyid/${teacherId}`);
                const standard = teacherResponse.data?.standardMaster?.standard;
                const teacherName = `${teacherResponse.data?.staff?.fname || ''} ${teacherResponse.data?.staff?.lname || ''}`.trim() || classTeacherInfo.teacherName;
                const teacherDivision = teacherResponse.data?.division?.name || classTeacherInfo.teacherDivision; // Added fallback
                setClassTeacherInfo({ standard, teacherName, teacherDivision });

                if (!standard) {
                    throw new Error("Could not determine the standard for the class teacher.");
                }

                const attendanceRes = await apiService.getdata(
                    `api/attendance/by-udise-std-monthnyear/${udise}/${standard}/${apiMonthYearFormat}`
                );

                if (Array.isArray(attendanceRes.data)) {
                    setAttendanceData(attendanceRes.data);
                } else {
                    console.warn("API did not return an array for attendance data:", attendanceRes.data);
                    setAttendanceData([]);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to fetch attendance data.');
                setAttendanceData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendanceData();
    }, [teacherId, udise]); // Dependencies

    if (isLoading) {
        return <div className="text-center p-5">Loading attendance data...</div>;
    }

    if (error) {
        return <div className="alert alert-danger m-3">Error: {error}</div>;
    }

    return (
        <>
            {attendanceData.length === 0 && !isLoading && (
                <div className="position-relative mt-5 p-4 bg-light rounded-3 border shadow-sm">
                    <button className="btn btn-danger text-white btn-sm position-absolute top-0 end-0 m-3" onClick={() => window.location.href = '/teacher/'}>
                        <i className="bi bi-x-lg"></i>
                    </button>

                    <div className="text-center py-5">
                        <i className="bi bi-calendar-x text-danger" style={{ fontSize: '3rem' }}></i>
                        <h4 className="mt-3 text-secondary">No Attendance Data Available</h4>
                        <p className="text-muted mb-0">There is no attendance information for this class and month.</p>
                    </div>
                </div>
            )}

            {attendanceData.length > 0 && (
                <div className="attendance-component-wrapper container-fluid p-3">
                    {/* MODIFIED LINE: Removed d-print-none from this div */}
                    <div className="position-absolute top-8 end-0 m-2">
                        <Next classname={'btn bg-danger text-white btn-sm'} path={'/teacher/'} placeholder={'X'}></Next>
                    </div>
                    <div id="printable-area">
                        <div className="table-responsive attendance-sheet">
                            <div className="d-flex justify-content-between align-items-center mb-3 p-2 border header-info flex-wrap">
                                <div><strong>वर्गशिक्षकाचे नांव:-</strong> {classTeacherInfo.teacherName}</div>
                                <div><strong>इयत्ता:</strong> {classTeacherInfo.standard}</div>
                                <div><strong>तुकडी / DIV STREAM:</strong> {classTeacherInfo.teacherDivision}</div>
                                <div><strong>महिना / MONTH & YEAR:</strong> {displayMonthYear}</div>
                                <div><strong>एकूण कामाचे दिवस / WORKING DAYS:</strong> {totalWorkingDaysForMonth}</div>
                            </div>
                            <table className="table table-bordered table-sm align-middle custom-table">
                                <thead>
                                    <tr className="text-center header-row-1">
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
                                            <th key={index} className="text-center align-middle day-col">
                                                <div>{day.eng}</div>
                                                <div>{day.date}</div>
                                                <div className='d-column'>{day.mar}</div> {/* Corrected typo: d-column */}
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

                                        // Assuming totalp and workDays are coming directly from studentRecord
                                        // If not, you'll need to calculate them based on studentDailyReport and monthDaysHeader
                                        let totalPresent = studentRecord.totalp || 0;
                                        let attendedOnWorkingDays = studentRecord.workDays || 0;

                                        // If totalp and workDays are NOT from API, uncomment and use this calculation:
                                        /*
                                        totalPresent = 0;
                                        attendedOnWorkingDays = 0;
                                        monthDaysHeader.forEach(dayConfig => {
                                            const dayNum = parseInt(dayConfig.date, 10);
                                            const reportForDay = studentDailyReport.find(r => r.day === dayNum);
                                            const status = reportForDay ? reportForDay.status : "N/A";

                                            if (status === 'P') {
                                                totalPresent++;
                                                if (dayConfig.holiday !== 'S' && dayConfig.holiday !== 'H') {
                                                    attendedOnWorkingDays++;
                                                }
                                            }
                                        });
                                        */

                                        return (
                                            <tr key={studentInfo.studentId || studentIndex}> {/* Prefer studentId for key */}
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
                                                    if (status === 'S' || status === 'H' || dayConfig.holiday === 'S' || dayConfig.holiday === 'H') {
                                                        cellClass += " holiday-cell-highlight";
                                                    }
                                                    return (
                                                        <td key={dayIdx} className={cellClass}>
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

                    {/* This button will still be hidden in print because of d-print-none on its parent */}
                    <div className="mt-4 text-center d-print-none">
                        <button className="btn btn-primary" onClick={() => window.print()}>
                            Print Attendance Sheet
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default AttendanceReport;