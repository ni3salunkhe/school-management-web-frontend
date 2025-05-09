import React from 'react';
// Ensure this path is correct for your project structure
import '../styling/AttendanceSheet.css';

function AttendanceReport() {
    const currentMonthYear = "JANUARY 2024";
    const totalWorkingDays = 22;

    // Single source of truth for days data
    const daysData = [
        // Sample days for a 30-day month (Adjust month/year/holidays as needed)
        { eng: 'MON', mar: 'सोमवार', date: '01' }, { eng: 'TUE', mar: 'मंगळवार', date: '02' },
        { eng: 'WED', mar: 'बुधवार', date: '03' }, { eng: 'THU', mar: 'गुरुवार', date: '04' },
        { eng: 'FRI', mar: 'शुक्रवार', date: '05' }, { eng: 'SAT', mar: 'शनिवार', date: '06' },
        { eng: 'SUN', mar: 'रविवार', date: '07', holiday: 'H' },
        { eng: 'MON', mar: 'सोमवार', date: '08' }, { eng: 'TUE', mar: 'मंगळवार', date: '09' },
        { eng: 'WED', mar: 'बुधवार', date: '10' }, { eng: 'THU', mar: 'गुरुवार', date: '11' },
        { eng: 'FRI', mar: 'शुक्रवार', date: '12' }, { eng: 'SAT', mar: 'शनिवार', date: '13' },
        { eng: 'SUN', mar: 'रविवार', date: '14', holiday: 'H' }, { eng: 'MON', mar: 'सोमवार', date: '15', holiday: '#' },
        { eng: 'TUE', mar: 'मंगळवार', date: '16' }, { eng: 'WED', mar: 'बुधवार', date: '17' },
        { eng: 'THU', mar: 'गुरुवार', date: '18' }, { eng: 'FRI', mar: 'शुक्रवार', date: '19' },
        { eng: 'SAT', mar: 'शनिवार', date: '20' }, { eng: 'SUN', mar: 'रविवार', date: '21', holiday: 'H' },
        { eng: 'MON', mar: 'सोमवार', date: '22' }, { eng: 'TUE', mar: 'मंगळवार', date: '23' },
        { eng: 'WED', mar: 'बुधवार', date: '24' }, { eng: 'THU', mar: 'गुरुवार', date: '25', holiday: '#' },
        { eng: 'FRI', mar: 'शुक्रवार', date: '26', holiday: '#' }, { eng: 'SAT', mar: 'शनिवार', date: '27' },
        { eng: 'SUN', mar: 'रविवार', date: '28', holiday: 'H' }, { eng: 'MON', mar: 'सोमवार', date: '29' },
        { eng: 'TUE', mar: 'मंगळवार', date: '30' },
    ];

    const numberOfDays = daysData.length;

    const renderStudentRows = (count = 20) => { // Changed default to 20 to match usage
        let rows = [];
        for (let i = 0; i < count; i++) {
            rows.push(
                <tr key={i}>
                    <td className="text-center info-col"> {/* GEN REG NO */} </td>
                    <td className="text-center info-col"> {/* APAR ID */} </td>
                    <td className="text-center info-col"> {/* STUDENT ID */} </td>
                    <td className="text-center info-col"> {/* ADHAR NO */} </td>
                    <td className="text-center info-col"> {/* DATE OF BIRTH */} </td>
                    <td className="text-center info-col"> {/* RELIGION */} </td>
                    <td className="text-center info-col"> {/* CAST */} </td>
                    <td className="text-center info-col"> {/* CATEGORY */} </td>
                    <td className="text-center info-col"> {/* EBC INFO */} </td>
                    <td className="text-center sr-no-col">{i + 1}</td>
                    <td className="name-col">Student Name {i + 1} Surname</td>
                    <td className="name-col">Mother's Name {i + 1}</td>

                    {Array.from({ length: numberOfDays }).map((_, idx) => (
                        // Added day-col class here for consistency if td specific styles needed
                        <td key={idx} className="text-center attendance-mark day-col"> {/* P/A/H */} </td>
                    ))}

                    <td className="text-center working-days-data summary-col"> {/* ... */} </td>
                    <td className="text-center total-col-data summary-col"> {/* ... */} </td>
                </tr>
            );
        }
        return rows;
    };

    return (
        <div className="attendance-component-wrapper container-fluid p-3">
            <div className="d-flex justify-content-between align-items-center mb-3 p-1 border header-info d-print-none flex-wrap">
                <div><strong>वर्गशिक्षकाचे नांव:-</strong> NAME & QUALIFICATION</div>
                <div><strong>इयत्ता:</strong> ......</div>
                <div><strong>तुकडी / DIV STREAM:</strong> ......</div>
                <div><strong>महिना / MONTH & YEAR:</strong> {currentMonthYear}</div>
                <div><strong>एकूण कामाचे दिवस / WORKING DAYS:</strong> {totalWorkingDays}</div>
            </div>

            <div id="printable-area">
                <div className="table-responsive attendance-sheet"> {/* Bootstrap's responsive wrapper */}
                    <table className="table table-bordered table-sm align-middle custom-table">
                        <thead>
                            <tr className="text-center header-row-1">
                                <th rowSpan="2" className="info-col">जन. <br />रजी.<br /> क्र. / <br />GEN<br />REG<br />NO</th>
                                <th rowSpan="2" className="info-col">अपार आयडी / <br />APAR ID</th>
                                <th rowSpan="2" className="info-col">स्टुडंट आय.<br />डी.<br />STUDENT ID</th>
                                <th rowSpan="2" className="info-col">आधार <br />क्रमांक / <br />ADHAR NO.</th>
                                <th rowSpan="2" className="info-col">जन्म<br />तारीख / <br />DATE OF<br /> BIRTH</th>
                                <th rowSpan="2" className="info-col">धर्म /<br />RELIGION</th>
                                <th rowSpan="2" className="info-col">जात / <br />CAST</th>
                                <th rowSpan="2" className="info-col">प्रवर्ग / <br />CATEGORY</th>
                                <th rowSpan="2" className="info-col">शुल्क <br />दायीत्व <br /> वर्ग / <br />EBC INFO</th>
                                <th rowSpan="2" className="sr-no-col">अनु.<br /> क्र. / <br /> SR.<br /> NO.</th>
                                <th rowSpan="2" className="name-header-col">पूर्ण नांव<br />(आडनांव प्रथम) /<br /> STUDENT <br /> NAME<br /> (SURNAME FIRST)</th>
                                <th rowSpan="2" className="name-header-col">आईचे <br /> नांव /<br /> MOTHER'S<br /> NAME</th>

                                {/* Use daysData directly */}
                                {daysData.map((day, index) => (
                                    <th key={index} className="text-center align-middle day-col">
                                        <div>{day.eng}</div>
                                        <div>{day.date}</div>
                                        <div className='d-coloumn'>{day.mar}</div> {/* Assuming d-coloumn is for styling Marathi */}
                                        <div> </div> {/* Empty div for spacing - consider margin/padding on other divs */}
                                        <div>{day.holiday ? day.holiday : '•'}</div>
                                    </th>
                                ))}

                                <th rowSpan="2" className="summary-col">एकूण<br />कामाचे<br /> दिवस <br /><span style={{ fontSize: '0.8em' }}>चालू महिना<br />उपस्थिती</span></th>
                                <th rowSpan="2" className="summary-col total-header-col">एकूण<br /> हजेरी <br /> TOTAL<br /> PRESENT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderStudentRows(20)}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 text-center d-print-none">
                <button className="btn btn-primary" onClick={() => window.print()}>
                    Print Attendance Sheet
                </button>
            </div>
        </div>
    );
}

export default AttendanceReport;