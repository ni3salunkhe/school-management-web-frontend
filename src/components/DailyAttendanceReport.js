import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import { jwtDecode } from 'jwt-decode';

// Helper function to process a SINGLE student's attendance record
function generateDailyReportForStudent(studentAttendanceRecord) {
  // Check if the input record is valid and has the necessary month/year info
  if (!studentAttendanceRecord || !studentAttendanceRecord.monthnyear) {
    console.warn("Invalid student attendance record provided:", studentAttendanceRecord);
    return [];
  }

  const today = new Date().getDate(); // Get the current day of the month
  const currentMonth = new Date().getMonth() + 1; // Get the current month (1-12)
  const currentYear = new Date().getFullYear(); // Get the current year

  const monthYear = studentAttendanceRecord.monthnyear;
  const [recordYear, recordMonth] = monthYear.split("-").map(Number);

  const report = [];

  // Only generate report up to today if the record is for the current month and year
  const daysToShow = (recordYear === currentYear && recordMonth === currentMonth) ? today : 31; // Or use studentAttendanceRecord.totalDays if available and accurate for days in month

  // Check if recordYear and recordMonth are valid numbers
  if (isNaN(recordYear) || isNaN(recordMonth)) {
    console.error("Invalid monthnyear format in record:", studentAttendanceRecord);
    return [];
  }

  for (let i = 1; i <= daysToShow; i++) {
    try {
      const date = new Date(recordYear, recordMonth - 1, i);
      // Check if the date is valid (e.g., handle Feb 30th) and belongs to the correct month
      if (date.getFullYear() !== recordYear || date.getMonth() !== recordMonth - 1) {
        continue; // Skip invalid dates for the month
      }

      const dayLabel = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const key = `day${i}`;
      report.push({
        dayLabel: dayLabel,
        status: studentAttendanceRecord[key] || "N/A", // Use N/A if status is missing
      });
    } catch (e) {
      console.error(`Error processing date for day ${i}, year ${recordYear}, month ${recordMonth}:`, e);
    }
  }

  return report;
}


function DailyAttendanceReport() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state
  const [classTeacherInfo, setClassTeacherInfo] = useState(null); // State for teacher info

  // Safely decode token and get values
  const token = sessionStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : {};
  const udise = decodedToken?.udiseNo;
  const id = decodedToken?.id;
  const now = new Date();
  const monthnyear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthnyearend = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    // Ensure udise and id are available before fetching
    if (!id || !udise) {
      setError("User information not found in token.");
      setIsLoading(false);
      return;
    }
    const fetchAttendanceData = async () => {
      setIsLoading(true);
      setError(null); // Reset error on new fetch
      try {
        // 1. Fetch Class Teacher Info to get the standard
        
        const teacherResponse = await apiService.getdata(`classteacher/getbyid/${id}`);
        const standard = teacherResponse.data?.standardMaster?.standard;
        const teacherName = `${teacherResponse.data?.staff?.fname || ''} ${teacherResponse.data?.staff?.lname || ''}`.trim();
        setClassTeacherInfo({ standard, teacherName }); // Store teacher info
        if (!standard) {
          throw new Error("Could not determine the standard for the class teacher.");
        }
        
        // 2. Fetch Attendance Data for that standard and current month
        const now = new Date();
        const monthnyear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const res = await apiService.getdata(`api/attendance/by-udise-monthnyear/${standard}/${udise}/${monthnyear}/${monthnyearend}`)
        console.log(res.data);

        const attendanceRes = await apiService.getdata(
          `api/attendance/by-udise-std-monthnyear/${udise}/${standard}/${monthnyear}`
        );

        // Ensure the response data is an array
        if (Array.isArray(attendanceRes.data)) {
          setAttendanceData(attendanceRes.data);
        } else {
          console.warn("API did not return an array for attendance data:", attendanceRes.data);
          setAttendanceData([]); // Set to empty array if response is not as expected
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch attendance data.');
        setAttendanceData([]); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [id, udise]); // Dependencies for useEffect

  // console.log("Attendance Data State:", attendanceData); // Log state for debugging

  return (
    <div className="container mt-5">
      <h3>Daily Attendance Report</h3>
      {classTeacherInfo && (
        <p>Class Teacher: {classTeacherInfo.teacherName} | Standard: {classTeacherInfo.standard}</p>
      )}

      {isLoading && <p>Loading attendance data...</p>}
      {error && <p className="text-danger">Error: {error}</p>}

      {!isLoading && !error && attendanceData.length === 0 && (
        <p>No attendance data available for this class and month.</p>
      )}

      {!isLoading && !error && attendanceData.length > 0 && (
        // Iterate over each student's attendance record
        attendanceData.map((studentRecord, index) => {
          // Generate the daily report specifically for this student
          const studentDailyReport = generateDailyReportForStudent(studentRecord);
          const studentInfo = studentRecord.studId; // Get the nested student info object

          return (
            <div key={studentRecord.id || index} className="mb-4 border p-3 rounded">
              {/* Display student identifier */}
              <h4>
                Student: {studentInfo?.studentName || 'N/A'} {studentInfo?.surName || ''}
                (Reg No: {studentRecord.registerNumber || 'N/A'})
              </h4>

              {studentDailyReport.length === 0 ? (
                <p>No daily records processed for this student.</p>
              ) : (
                // Display the daily status for this student
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {studentDailyReport.map((day, dayIndex) => (
                    <div key={dayIndex} style={{ border: '1px solid #eee', padding: '5px', minWidth: '120px', textAlign: 'center' }}>
                      <small><strong>{day.dayLabel}</strong></small>
                      <br />
                      <span>{day.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default DailyAttendanceReport;