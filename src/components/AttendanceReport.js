import React from 'react';
// Ensure this path is correct for your project structure
import '../styling/AttendanceSheet.css'; // Assuming your CSS is here

function AttendanceReport() {
    // --- Dynamic Month/Year Data (Example - Replace with actual logic) ---
    const currentMonthYear = "JANUARY 2024"; // Example
    const totalWorkingDays = 22; // Example

    const days = [
        // Sample days for a 30-day month (Adjust month/year/holidays as needed)
        { eng: 'MON', mar: 'सोमवार', date: '01' }, { eng: 'TUE', mar: 'मंगळवार', date: '02' },
        { eng: 'WED', mar: 'बुधवार', date: '03' }, { eng: 'THU', mar: 'गुरुवार', date: '04' },
        { eng: 'FRI', mar: 'शुक्रवार', date: '05' }, { eng: 'SAT', mar: 'शनिवार', date: '06' },
        { eng: 'SUN', mar: 'रविवार', date: '07', holiday: 'H' }, // Example Holiday 'H'
        { eng: 'MON', mar: 'सोमवार', date: '08' }, { eng: 'TUE', mar: 'मंगळवार', date: '09' },
        { eng: 'WED', mar: 'बुधवार', date: '10' }, { eng: 'THU', mar: 'गुरुवार', date: '11' },
        { eng: 'FRI', mar: 'शुक्रवार', date: '12' }, { eng: 'SAT', mar: 'शनिवार', date: '13' },
        { eng: 'SUN', mar: 'रविवार', date: '14', holiday: 'H' }, { eng: 'MON', mar: 'सोमवार', date: '15', holiday: '#' }, // Example '#' marker
        { eng: 'TUE', mar: 'मंगळवार', date: '16' }, { eng: 'WED', mar: 'बुधवार', date: '17' },
        { eng: 'THU', mar: 'गुरुवार', date: '18' }, { eng: 'FRI', mar: 'शुक्रवार', date: '19' },
        { eng: 'SAT', mar: 'शनिवार', date: '20' }, { eng: 'SUN', mar: 'रविवार', date: '21', holiday: 'H' },
        { eng: 'MON', mar: 'सोमवार', date: '22' }, { eng: 'TUE', mar: 'मंगळवार', date: '23' },
        { eng: 'WED', mar: 'बुधवार', date: '24' }, { eng: 'THU', mar: 'गुरुवार', date: '25', holiday: '#' },
        { eng: 'FRI', mar: 'शुक्रवार', date: '26', holiday: '#' }, { eng: 'SAT', mar: 'शनिवार', date: '27' },
        { eng: 'SUN', mar: 'रविवार', date: '28', holiday: 'H' }, { eng: 'MON', mar: 'सोमवार', date: '29' },
        { eng: 'TUE', mar: 'मंगळवार', date: '30' },
        // Add day 31 if applicable for the month
        // { eng: 'WED', mar: 'बुधवार', date: '31' },
    ];

    // --- Generate Days Data (More robust generation recommended for production) ---
    const renderDayColumns = () => {
        const days = [
            // Sample days for a 30-day month (Adjust month/year/holidays as needed)
            { eng: 'MON', mar: 'सोमवार', date: '01' }, { eng: 'TUE', mar: 'मंगळवार', date: '02' },
            { eng: 'WED', mar: 'बुधवार', date: '03' }, { eng: 'THU', mar: 'गुरुवार', date: '04' },
            { eng: 'FRI', mar: 'शुक्रवार', date: '05' }, { eng: 'SAT', mar: 'शनिवार', date: '06' },
            { eng: 'SUN', mar: 'रविवार', date: '07', holiday: 'H' }, // Example Holiday 'H'
            { eng: 'MON', mar: 'सोमवार', date: '08' }, { eng: 'TUE', mar: 'मंगळवार', date: '09' },
            { eng: 'WED', mar: 'बुधवार', date: '10' }, { eng: 'THU', mar: 'गुरुवार', date: '11' },
            { eng: 'FRI', mar: 'शुक्रवार', date: '12' }, { eng: 'SAT', mar: 'शनिवार', date: '13' },
            { eng: 'SUN', mar: 'रविवार', date: '14', holiday: 'H' }, { eng: 'MON', mar: 'सोमवार', date: '15', holiday: '#' }, // Example '#' marker
            { eng: 'TUE', mar: 'मंगळवार', date: '16' }, { eng: 'WED', mar: 'बुधवार', date: '17' },
            { eng: 'THU', mar: 'गुरुवार', date: '18' }, { eng: 'FRI', mar: 'शुक्रवार', date: '19' },
            { eng: 'SAT', mar: 'शनिवार', date: '20' }, { eng: 'SUN', mar: 'रविवार', date: '21', holiday: 'H' },
            { eng: 'MON', mar: 'सोमवार', date: '22' }, { eng: 'TUE', mar: 'मंगळवार', date: '23' },
            { eng: 'WED', mar: 'बुधवार', date: '24' }, { eng: 'THU', mar: 'गुरुवार', date: '25', holiday: '#' },
            { eng: 'FRI', mar: 'शुक्रवार', date: '26', holiday: '#' }, { eng: 'SAT', mar: 'शनिवार', date: '27' },
            { eng: 'SUN', mar: 'रविवार', date: '28', holiday: 'H' }, { eng: 'MON', mar: 'सोमवार', date: '29' },
            { eng: 'TUE', mar: 'मंगळवार', date: '30' },
            // Add day 31 if applicable for the month
            // { eng: 'WED', mar: 'बुधवार', date: '31' },
        ];
        // Calculate the number of day columns based on the actual days array
        const numberOfDays = days.length;

        // Create the header elements
        const columns = days.map((day, index) => (
            <th key={index} className="text-center align-middle day-col">
                <div>{day.eng} </div>
                <div>{day.date}</div>
                <div className='d-coloumn'>{day.mar}</div>
                <div> </div>
                {/* Render holiday marker or a placeholder like a dot */}
                <div>{day.holiday ? day.holiday : '•'}</div>
            </th>
        ));

        return { columns, numberOfDays };
    };

    const { columns: dayHeaderColumns, numberOfDays } = renderDayColumns();

    // --- Generate Student Rows ---
    const renderStudentRows = (count = 10) => { // Render 10 sample rows
        let rows = [];
        for (let i = 0; i < count; i++) {
            rows.push(
                <tr key={i}>
                    {/* Use classes for potential width control if needed */}
                    <td className="text-center"> {/* GEN REG NO */} </td>
                    <td className="text-center"> {/* APAR ID */} </td>
                    <td className="text-center"> {/* STUDENT ID */} </td>
                    <td className="text-center"> {/* ADHAR NO */} </td>
                    <td className="text-center"> {/* DATE OF BIRTH */} </td>
                    <td className="text-center"> {/* RELIGION */} </td>
                    <td className="text-center"> {/* CAST */} </td>
                    <td className="text-center"> {/* CATEGORY */} </td>
                    <td className="text-center"> {/* EBC INFO */} </td>
                    <td className="text-center">{i + 1}</td> {/* SR NO */}
                    <td className="name-col">Student Name {i + 1} Surname</td> {/* STUDENT NAME */}
                    <td className="name-col">Mother's Name {i + 1}</td> {/* MOTHER S NAME */}
                    {/* FATHER'S NAME DATA CELL REMOVED */}

                    {/* Day columns - Dynamically generate based on numberOfDays */}
                    {Array.from({ length: numberOfDays }).map((_, idx) => (
                        <td key={idx} className="text-center attendance-mark"> {/* P/A/H */} </td>
                    ))}

                    <td className="text-center working-days-data"> {/* Working Days Attended - Calculated */} </td>
                    <td className="text-center total-col-data"> {/* TOTAL OF P - Calculated */} </td>
                </tr>
            );
        }
        return rows;
    };

    // --- Component Render ---
    return (
        <div className="attendance-component-wrapper container-fluid p-3"> {/* Added padding */}

            {/* Top Header Info - Hidden in print */}
            <div className="d-flex justify-content-between align-items-center mb-3 p-2 border header-info d-print-none flex-wrap">
                <div><strong>वर्गशिक्षकाचे नांव:-</strong> NAME & QUALIFICATION</div>
                <div><strong>इयत्ता:</strong> ......</div>
                <div><strong>तुकडी / DIV STREAM:</strong> ......</div>
                <div><strong>महिना / MONTH & YEAR:</strong> {currentMonthYear}</div>
                <div><strong>एकूण कामाचे दिवस / WORKING DAYS:</strong> {totalWorkingDays}</div>
            </div>

            {/* Main Attendance Table Container - Only this section is printed */}
            <div id="printable-area">
                <div className="table-responsive attendance-sheet">
                    <table className="table table-bordered table-sm align-middle custom-table">
                        <thead>
                            {/* Adjusting header row structure slightly for better alignment */}
                            <tr className="text-center header-row-1">
                                {/* Student Info Headers */}
                                <th rowSpan="2" className="info-col">जन. <br />रजी.<br /> क्र. / <br />GEN<br />REG<br />NO</th>
                                <th rowSpan="2" className="info-col">अपार आयडी / <br />APAR ID</th>
                                <th rowSpan="2" className="info-col">स्टुडंट आय.<br />डी.<br />STUDENT ID</th>
                                <th rowSpan="2" className="info-col">आधार <br />क्रमांक / <br />ADHAR NO.</th>
                                <th rowSpan="2" className="info-col">जन्म<br />तारीख / <br />DATE OF<br /> BIRTH</th>
                                <th rowSpan="2" className="info-col">धर्म /<br />RELIGION</th>
                                <th rowSpan="2" className="info-col">जात / <br />CAST</th>
                                <th rowSpan="2" className="info-col">प्रवर्ग / <br />CATEGORY</th>
                                <th rowSpan="2" className="info-col">शुल्क <br />दावीत्व<br /> वर्ग / <br />EBC INFO</th>
                                <th rowSpan="2" className="sr-no-col">अनु.<br /> क्र. / <br /> SR.<br /> NO.</th>
                                <th rowSpan="2" className="name-header-col">पूर्ण नांव<br />(आडनांव प्रथम) /<br /> STUDENT <br /> NAME<br /> (SURNAME FIRST)</th>
                                <th rowSpan="2" className="name-header-col">आईचे <br /> नांव /<br /> MOTHER'S<br /> NAME</th>
                                {/* FATHER'S NAME HEADER CELL REMOVED */}

                                {/* Daily Attendance Headers */}
                                {/* {dayHeaderColumns} */}

                                {days.map((day, index) => (
                                <th key={index} className="text-center align-middle day-col">
                                    <div>{day.eng} </div>
                                    <div>{day.date}</div>
                                    <div >{day.mar}</div>
                                    <div> </div>
                                    {/* Render holiday marker or a placeholder like a dot */}
                                    <div>{day.holiday ? day.holiday : '•'}</div>
                                </th>
                                ))}


                                {/* Summary Headers */}
                                <th rowSpan="2" className="summary-col">एकूण<br />कामाचे<br /> दिवस <br /><span style={{ fontSize: '0.8em' }}>चालू महिना<br />उपस्थिती</span></th>
                                <th rowSpan="2" className="summary-col total-header-col">एकूण<br /> हजेरी <br /> TOTAL<br /> PRESENT</th>
                            </tr>
                            {/* Second header row is effectively merged using rowSpan */}
                        </thead>
                        <tbody>
                            {renderStudentRows(20)} {/* Render sample rows */}
                        </tbody>
                    </table>
                </div> {/* End table-responsive */}
            </div> {/* End printable-area */}

            {/* Print Button - Hidden in print */}
            <div className="mt-4 text-center d-print-none">
                <button className="btn btn-primary" onClick={() => window.print()}>
                    Print Attendance Sheet
                </button>
            </div>

        </div> // End of attendance-component-wrapper
    );
}

export default AttendanceReport;