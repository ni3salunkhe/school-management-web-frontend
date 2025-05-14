// AttendanceCoverPage.js
import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import '../styling/AttendanceCoverPage.css'; // Your existing CSS
import { jwtDecode } from 'jwt-decode';
import apiService from '../services/api.service';

function AttendanceCoverPage() {
    const token = sessionStorage.getItem('token');
    const teacherId = token ? jwtDecode(token)?.id : null;
    const udiseNo = token ? jwtDecode(token)?.udiseNo : null;

    // --- States for Year/Month Selection ---
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-indexed
    const [availableYears, setAvailableYears] = useState([]);
    const months = [
        { value: 1, name: 'जानेवारी' }, { value: 2, name: 'फेब्रुवारी' }, { value: 3, name: 'मार्च' },
        { value: 4, name: 'एप्रिल' }, { value: 5, name: 'मे' }, { value: 6, name: 'जून' },
        { value: 7, name: 'जुलै' }, { value: 8, name: 'ऑगस्ट' }, { value: 9, name: 'सप्टेंबर' },
        { value: 10, name: 'ऑक्टोबर' }, { value: 11, name: 'नोव्हेंबर' }, { value: 12, name: 'डिसेंबर' }
    ];
    // --- End Year/Month Selection States ---

    const [teacherInfo, setTeacherInfo] = useState(null);
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Start false
    const [attendanceData, setAttendanceData] = useState({ // This state is for summary like workDays
        workDays: 0,
        avgAttendance: "0.0%", // Placeholder - TODO: Fetch or calculate
        percentAttendance: "0.0%" // Placeholder - TODO: Fetch or calculate
    });

    const initialCountsObject = { male: 0, female: 0, other: 0, total: 0 };
    const [ageGroups, setAgeGroups] = useState({});
    const [casteCategoryCounts, setCasteCategoryCounts] = useState({
        sc: { ...initialCountsObject }, st: { ...initialCountsObject }, vjnt: { ...initialCountsObject },
        obc: { ...initialCountsObject }, sbc: { ...initialCountsObject }, open: { ...initialCountsObject },
        esbc: { ...initialCountsObject },
    });
    const [feeCategoryCounts, setFeeCategoryCounts] = useState({
        pay: { ...initialCountsObject }, bcf: { ...initialCountsObject }, ebc: { ...initialCountsObject },
        ebcbc: { ...initialCountsObject }, pt: { ...initialCountsObject }, mt: { ...initialCountsObject },
        exSol: { ...initialCountsObject },
    });
    const [minorityCounts, setMinorityCounts] = useState({
        nonMinority: { ...initialCountsObject }, jainMinority: { ...initialCountsObject },
        muslimMinority: { ...initialCountsObject }, boudhaMinority: { ...initialCountsObject }
    });
    const [divyangCounts, setDivyangCounts] = useState({ /* TODO: Define structure */ });


    useEffect(() => {
        const currentYr = new Date().getFullYear();
        const yrs = [];
        for (let i = currentYr - 5; i <= currentYr + 1; i++) {
            yrs.push(i);
        }
        setAvailableYears(yrs);
    }, []);

    // Combined data loading effect
    const loadDataForSelectedPeriod = useCallback(async () => {
        if (!teacherId || !udiseNo || !selectedYear || !selectedMonth) {
            console.warn("CoverPage: Missing critical parameters for data load.");
            setStudents([]);
            setAttendanceData({ workDays: 0, avgAttendance: "0.0%", percentAttendance: "0.0%" });
            setTeacherInfo(null);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            let currentStandard = teacherInfo?.standardMaster?.standard;

            // Fetch teacher info if not already loaded for the current teacherId or if standard is missing
            if (!teacherInfo || teacherInfo.staff?.id !== teacherId || !currentStandard) {
                const teacherResponse = await apiService.getdata(`classteacher/getbyid/${teacherId}`);
                setTeacherInfo(teacherResponse.data);
                currentStandard = teacherResponse.data?.standardMaster?.standard;
                if (!currentStandard) {
                    throw new Error("Standard not found in teacher data.");
                }
            }

            const formattedMonth = String(selectedMonth).padStart(2, '0');
            const apiMonthYearFormatForFetch = `${selectedYear}-${formattedMonth}`;

            // Fetch Attendance Data using the endpoint you provided
            console.log(`Fetching attendance records: api/attendance/by-udise-std-monthnyear/${udiseNo}/${currentStandard}/${apiMonthYearFormatForFetch}`);
            const attRes = await apiService.getdata(
                `api/attendance/by-udise-std-monthnyear/${udiseNo}/${currentStandard}/${apiMonthYearFormatForFetch}`
            );

            let workDaysFromApi = 0;
            if (attRes.data && Array.isArray(attRes.data) && attRes.data.length > 0) {
                // Assuming workDays is consistent across all student records for the month
                // and present in at least the first student's attendance record.
                workDaysFromApi = attRes.data[0]?.workDays || 0;
                console.log(`WorkDays from API (first student record): ${workDaysFromApi}`);
            } else {
                console.warn("No attendance records found or data not in expected array format to determine workDays.", attRes.data);
            }
            // TODO: You still need to get avgAttendance and percentAttendance.
            // This might require a different API endpoint or client-side calculation
            // based on the full attendance data if `attRes.data` contains daily statuses.
            setAttendanceData(prev => ({
                ...prev, // Keep existing avg/percent if they were fetched differently
                workDays: workDaysFromApi
            }));

            // Fetch Academic/Student demographic data
            console.log(`Fetching academic data: academic/${udiseNo}/${teacherId}`);
            const academicResponse = await apiService.getdata(`academic/${udiseNo}/${teacherId}`);
            const studentDetailsArray = (academicResponse.data || [])
                .map(item => item.studentId)
                .filter(student => student && typeof student === 'object');
            setStudents(studentDetailsArray);

        } catch (error) {
            console.error("Error loading data for Cover Page:", error);
            setStudents([]);
            setAttendanceData({ workDays: 0, avgAttendance: "0.0%", percentAttendance: "0.0%" });
            // setTeacherInfo(null); // Decide if teacherInfo should also be cleared on general error
        } finally {
            setIsLoading(false);
        }
    }, [teacherId, udiseNo, selectedYear, selectedMonth, teacherInfo]); // teacherInfo is a dependency

    useEffect(() => {
        loadDataForSelectedPeriod();
    }, [loadDataForSelectedPeriod]);


    // useEffect for processing students for demographic counts
    useEffect(() => {
        const resetCountsObject = (countsState) => {
            const newCounts = {};
            Object.keys(countsState).forEach(key => {
                newCounts[key] = { ...initialCountsObject };
            });
            return newCounts;
        };

        if (!students || students.length === 0) {
            setAgeGroups({});
            setCasteCategoryCounts(resetCountsObject(casteCategoryCounts));
            setFeeCategoryCounts(resetCountsObject(feeCategoryCounts));
            setMinorityCounts(resetCountsObject(minorityCounts));
            return;
        }

        const today = new Date();
        const newAgeGroups = {};
        const newCasteCategoryCounts = resetCountsObject(casteCategoryCounts);
        const newFeeCategoryCounts = resetCountsObject(feeCategoryCounts);
        const newMinorityCounts = resetCountsObject(minorityCounts);

        students.forEach(student => {
            if (!student || typeof student !== 'object') return;

            const studentGender = student.gender?.trim().toLowerCase();
            const updateCounts = (categoryObject) => {
                if (!categoryObject) return;
                if (studentGender === 'पुरुष' || studentGender === 'male') categoryObject.male++;
                else if (studentGender === 'स्त्री' || studentGender === 'female') categoryObject.female++;
                else if (studentGender === 'इतर' || studentGender === 'other') categoryObject.other++;
                categoryObject.total++;
            };

            if (student.dateOfBirth) {
                const dob = new Date(student.dateOfBirth);
                if (!isNaN(dob.getTime())) {
                    let age = today.getFullYear() - dob.getFullYear();
                    const m = today.getMonth() - dob.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
                    if (age >= 0) {
                        if (!newAgeGroups[age]) newAgeGroups[age] = { ...initialCountsObject };
                        updateCounts(newAgeGroups[age]);
                    }
                }
            }

            const ebcInfo = student.ebcInformation?.toUpperCase().trim();
            if (ebcInfo === 'PAY') updateCounts(newFeeCategoryCounts.pay);
            else if (ebcInfo === 'B.C.F.') updateCounts(newFeeCategoryCounts.bcf);
            else if (ebcInfo === 'E.B.C.') updateCounts(newFeeCategoryCounts.ebc);
            else if (ebcInfo === 'E.B.C.B.C.') updateCounts(newFeeCategoryCounts.ebcbc);
            else if (ebcInfo === 'P.T.') updateCounts(newFeeCategoryCounts.pt);
            else if (ebcInfo === 'M.T.') updateCounts(newFeeCategoryCounts.mt);
            else if (ebcInfo === 'EX. SOL.') updateCounts(newFeeCategoryCounts.exSol);

            const casteCat = student.casteCategory?.toUpperCase().trim();
            const vjntCats = ['VJ(A)', 'N.T.(B)', 'N.T.(C)', 'N.T.(D)', 'VJNT', 'VJ/NT'];
            if (casteCat === 'S.C.') updateCounts(newCasteCategoryCounts.sc);
            else if (casteCat === 'S.T.') updateCounts(newCasteCategoryCounts.st);
            else if (vjntCats.includes(casteCat)) updateCounts(newCasteCategoryCounts.vjnt);
            else if (['O.B.C.', 'OBC'].includes(casteCat)) updateCounts(newCasteCategoryCounts.obc);
            else if (['S.B.C.', 'SBC'].includes(casteCat)) updateCounts(newCasteCategoryCounts.sbc);
            else if (['OPEN', 'GENERAL'].includes(casteCat)) updateCounts(newCasteCategoryCounts.open);
            else if (casteCat === 'E.S.B.C.') updateCounts(newCasteCategoryCounts.esbc);

            const minorityInfo = student.minorityInformation?.trim();
            if (minorityInfo === 'Non Minority') updateCounts(newMinorityCounts.nonMinority);
            else if (minorityInfo === 'Jain Minority') updateCounts(newMinorityCounts.jainMinority);
            else if (minorityInfo === 'MinorityMuslim Minority' || minorityInfo === 'Muslim Minority') updateCounts(newMinorityCounts.muslimMinority);
            else if (minorityInfo === 'Boudha Minority') updateCounts(newMinorityCounts.boudhaMinority);
        });

        setAgeGroups(newAgeGroups);
        setCasteCategoryCounts(newCasteCategoryCounts);
        setFeeCategoryCounts(newFeeCategoryCounts);
        setMinorityCounts(newMinorityCounts);
    }, [students]);


    const selectedMonthObject = months.find(m => m.value === selectedMonth);
    const displayMonthName = selectedMonthObject ? selectedMonthObject.name : '';

    const schoolDisplayData = {
        slogan: teacherInfo?.school?.schoolSlogan || teacherInfo?.schoolUdiseNo?.schoolSlogan || "शाळेचे बोधवाक्य",
        trustName: teacherInfo?.school?.sansthaName || teacherInfo?.schoolUdiseNo?.sansthaName || "संस्थेचे नाव",
        schoolName: teacherInfo?.school?.schoolName || teacherInfo?.schoolUdiseNo?.schoolName || "शाळेचे नाव",
        indexNo: teacherInfo?.school?.boardIndexNo || teacherInfo?.schoolUdiseNo?.boardIndexNo || "इंडेक्स क्र.",
        udiseNo: teacherInfo?.school?.udiseNo || teacherInfo?.schoolUdiseNo?.udiseNo || "UDISE क्र.",
        logoUrl: teacherInfo?.school?.logo || teacherInfo?.schoolUdiseNo?.logo
    };

    const reportDisplayData = {
        month: displayMonthName,
        monthYear: `${displayMonthName} ${selectedYear}`,
        workingDays: attendanceData.workDays,
        avgAttendance: attendanceData.avgAttendance, // Will be placeholder if not fetched
        percentAttendance: attendanceData.percentAttendance, // Will be placeholder if not fetched
        standard: teacherInfo?.standardMaster?.standard || "इयत्ता",
        standardInWords: teacherInfo?.standardMaster?.standardInWord || "शब्दात",
        stream: teacherInfo?.stream?.name || "",
        division: teacherInfo?.division?.name || "तुकडी",
        classTeacherName: `${teacherInfo?.staff?.fname || ''} ${teacherInfo?.staff?.mname || ''} ${teacherInfo?.staff?.lname || ''}`.trim() || "शिक्षक नाव",
        classTeacherQualification: teacherInfo?.staff?.qualification || "शिक्षण"
    };

    const calculateTableTotals = (countsObject) => { /* ... same as before ... */
        return Object.values(countsObject).reduce((acc, curr = { ...initialCountsObject }) => {
            acc.male += (curr.male || 0);
            acc.female += (curr.female || 0);
            acc.other += (curr.other || 0);
            acc.total += (curr.total || 0);
            return acc;
        }, { ...initialCountsObject });
    };

    const ageTotals = calculateTableTotals(ageGroups);
    const casteCategoryTotals = calculateTableTotals(casteCategoryCounts);
    const feeCategoryTotals = calculateTableTotals(feeCategoryCounts);
    const minorityTotals = calculateTableTotals(minorityCounts);

    const minorityDisplayLabels = { /* ... same as before ... */ };
    const casteDisplayLabels = { /* ... same as before ... */ };
    const feeDisplayLabels = { /* ... same as before ... */ };

    if (isLoading && !teacherInfo && students.length === 0) { // Show only very initial loading
        return <div className="container text-center mt-5"><p>माहिती लोड होत आहे...</p></div>;
    }
    if (!teacherInfo && !isLoading) {
        return <div className="container text-center mt-5"><p>आवश्यक शिक्षक माहिती मिळाली नाही. कृपया पुन्हा प्रयत्न करा.</p></div>;
    }

    const noDataForSelectedPeriod = !isLoading && teacherInfo && students.length === 0 && attendanceData.workDays === 0;

    return (
        <>
            <div className="container-fluid my-4 p-4 bg-white rounded-lg shadow-md d-print-none border border-gray-200">
                <div className="row g-3 align-items-center justify-content-center">
                    <div className="col-sm-auto mb-3 mb-sm-0">
                        <div className="d-flex align-items-center flex-wrap flex-sm-nowrap">
                            <label htmlFor="coverPageSelectYear" className="form-label fw-bold text-secondary mb-2 mb-sm-0 me-sm-3 me-2">वर्ष:</label>
                            <select
                                id="coverPageSelectYear"
                                className="form-select py-2 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-400 transition-all"
                                style={{ minWidth: '120px' }}
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

                    <div className="col-sm-auto">
                        <div className="d-flex align-items-center flex-wrap flex-sm-nowrap">
                            <label htmlFor="coverPageSelectMonth" className="form-label fw-bold text-secondary mb-2 mb-sm-0 me-sm-3 me-2">महिना:</label>
                            <select
                                id="coverPageSelectMonth"
                                className="form-select py-2 border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-400 transition-all"
                                style={{ minWidth: '150px' }}
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
                        <div className="col-sm-auto ms-sm-2">
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

            {isLoading && <div className="container text-center mt-2"><p>निवडलेल्या कालावधीसाठी माहिती लोड करत आहे...</p></div>}

            {noDataForSelectedPeriod && (
                <div className="container text-center mt-4 p-4 bg-white rounded border shadow-sm">
                    <i className="bi bi-info-circle-fill text-warning" style={{ fontSize: '2.5rem' }}></i>
                    <h5 className="mt-3 text-secondary">माहिती उपलब्ध नाही</h5>
                    <p className="text-muted mb-0">
                        निवडलेल्या महिन्यासाठी ({displayMonthName} {selectedYear}) विद्यार्थी किंवा हजेरीची माहिती उपलब्ध नाही.
                    </p>
                </div>
            )}

            {(!isLoading && teacherInfo && (students.length > 0 || attendanceData.workDays > 0)) && (
                <div id="printable-catalog" className="container-fluid p-md-2 p-1 mt-3">
                    <div className="report-wrapper">
                        {/* Header Section - Renders schoolDisplayData and reportDisplayData */}
                        <div className="row mb-2 align-items-center">
                            {schoolDisplayData?.logoUrl && (
                                <div className="col-2 d-flex justify-content-center align-items-center">
                                    <img src={`data:image/jpeg;base64,${schoolDisplayData?.logoUrl}`} alt="Logo" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                </div>
                            )}
                            <div className="col-10">
                                <div className="header-line fw-bold">{schoolDisplayData.slogan}</div>
                                <div className="header-line fw-bold">{schoolDisplayData.trustName}</div>
                                <div className="header-line fw-bold fs-6">{schoolDisplayData.schoolName}</div>
                                <div className="header-line-thick fw-bold">इंडेक्स क्र. {schoolDisplayData.indexNo} UDISE क्र. {schoolDisplayData.udiseNo}</div>
                            </div>
                        </div>

                        <div className="text-center mb-2">
                            <div className="d-inline-block border border-2 border-dark p-1 px-3 fw-bold rounded">
                                मासिक पत्रक / MONTHWISE CATLOG
                            </div>
                        </div>

                        <div className="row mb-2 gx-1">
                            <div className="col-auto">
                                <div className="bordered-box-label text-center">महिना</div>
                                <div className="bordered-box" style={{ minWidth: '90px' }}>{reportDisplayData.month}</div>
                            </div>
                            <div className="col-auto">
                                <div className="bordered-box-label text-center">महिना व वर्ष</div>
                                <div className="bordered-box" style={{ minWidth: '130px' }}>{reportDisplayData.monthYear}</div>
                            </div>
                            <div className="col"></div> {/* Spacer */}
                            <div className="col-auto">
                                <div className="bordered-box-label">कामाचे दिवस: <span className="fw-bold">{reportDisplayData.workingDays}</span></div>
                                <div className="bordered-box-label">सरासरी उपस्थिती: <span className="fw-bold">{reportDisplayData.avgAttendance}</span></div>
                                <div className="bordered-box-label">शेकडा उपस्थिती: <span className="fw-bold">{reportDisplayData.percentAttendance}</span></div>
                            </div>
                        </div>

                        <div className="row mb-2 align-items-center gx-1 report-details-row">
                            <div className="col-auto pe-0"><strong>इयत्ता:</strong></div>
                            <div className="col-auto bordered-box-small-text me-1">{reportDisplayData.standard} ({reportDisplayData.standardInWords})</div>
                            {reportDisplayData.stream && <>
                                <div className="col-auto pe-0"><strong>प्रवाह:</strong></div>
                                <div className="col-auto bordered-box-small-text me-1">{reportDisplayData.stream}</div>
                            </>}
                            <div className="col-auto pe-0"><strong>तुकडी:</strong></div>
                            <div className="col-auto bordered-box-small-text me-1">{reportDisplayData.division}</div>
                            <div className="col-auto pe-0"><strong>वर्गशिक्षक:</strong></div>
                            <div className="col bordered-box-small-text">{reportDisplayData.classTeacherName} ({reportDisplayData.classTeacherQualification})</div>
                        </div>

                        {/* Main Content Tables */}
                        <div className="section-title mb-1">O माहिती अहवाल O</div>
                        <div className="row gx-1">
                            {/* Table A: Age Groups */}
                            <div className="col-md-4">
                                <div className="sub-table-title">वयोगटानुसार (A)</div>
                                <table className="table table-bordered table-sm report-table text-center align-middle">
                                    <thead><tr><th>वय</th><th>मुले</th><th>मुली</th><th>इतर</th><th>एकूण</th></tr></thead>
                                    <tbody>
                                        {Object.entries(ageGroups)
                                            .sort(([ageA], [ageB]) => parseInt(ageA) - parseInt(ageB))
                                            .map(([age, counts]) => (
                                                <tr key={`age-${age}`}><td>{age}</td><td>{counts.male}</td><td>{counts.female}</td><td>{counts.other}</td><td>{counts.total}</td></tr>
                                            ))}
                                        <tr><td className="fw-bold">एकूण</td><td>{ageTotals.male}</td><td>{ageTotals.female}</td><td>{ageTotals.other}</td><td>{ageTotals.total}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Table B & D: Caste and Minority */}
                            <div className="col-md-4">
                                <div className="sub-table-title">प्रवर्गनिहाय (B)</div>
                                <table className="table table-bordered table-sm report-table text-center align-middle">
                                    <thead><tr><th>प्रवर्ग</th><th>मुले</th><th>मुली</th><th>इतर</th><th>एकूण</th></tr></thead>
                                    <tbody>
                                        {Object.entries(casteCategoryCounts).map(([key, counts]) => (
                                            <tr key={`caste-${key}`}>
                                                <td>{casteDisplayLabels[key] || key.toUpperCase()}</td>
                                                <td>{counts.male}</td><td>{counts.female}</td><td>{counts.other}</td><td>{counts.total}</td>
                                            </tr>
                                        ))}
                                        <tr><td className="fw-bold">एकूण</td><td>{casteCategoryTotals.male}</td><td>{casteCategoryTotals.female}</td><td>{casteCategoryTotals.other}</td><td>{casteCategoryTotals.total}</td></tr>
                                    </tbody>
                                </table>

                                <div className="sub-table-title mt-2">अल्पसंख्यांक (D)</div>
                                <table className="table table-bordered table-sm report-table text-center align-middle">
                                    <thead><tr><th>अल्पसंख्यांक</th><th>मुले</th><th>मुली</th><th>इतर</th><th>एकूण</th></tr></thead>
                                    <tbody>
                                        {Object.entries(minorityCounts).map(([key, counts]) => (
                                            <tr key={`minority-${key}`}>
                                                <td>{minorityDisplayLabels[key] || key.replace(/([A-Z])/g, ' $1').trim()}</td>
                                                <td>{counts.male}</td><td>{counts.female}</td><td>{counts.other}</td><td>{counts.total}</td>
                                            </tr>
                                        ))}
                                        <tr><td className="fw-bold">एकूण</td><td>{minorityTotals.male}</td><td>{minorityTotals.female}</td><td>{minorityTotals.other}</td><td>{minorityTotals.total}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Table C & E: Fee and Divyang */}
                            <div className="col-md-4">
                                <div className="sub-table-title">शुल्क दाविनुसार (C)</div>
                                <table className="table table-bordered table-sm report-table text-center align-middle">
                                    <thead><tr><th>वर्गवारी</th><th>मुले</th><th>मुली</th><th>इतर</th><th>एकूण</th></tr></thead>
                                    <tbody>
                                        {Object.entries(feeCategoryCounts).map(([key, counts]) => (
                                            <tr key={`fee-${key}`}>
                                                <td>{feeDisplayLabels[key] || key.toUpperCase()}</td>
                                                <td>{counts.male}</td><td>{counts.female}</td><td>{counts.other}</td><td>{counts.total}</td>
                                            </tr>
                                        ))}
                                        <tr><td className="fw-bold">एकूण</td><td>{feeCategoryTotals.male}</td><td>{feeCategoryTotals.female}</td><td>{feeCategoryTotals.other}</td><td>{feeCategoryTotals.total}</td></tr>
                                    </tbody>
                                </table>

                                <div className="sub-table-title mt-2">दिव्यांग (E)</div>
                                <table className="table table-bordered table-sm report-table text-center align-middle">
                                    <thead><tr><th>दिव्यांग प्रकार</th><th>मुले</th><th>मुली</th><th>इतर</th><th>एकूण</th></tr></thead>
                                    <tbody>
                                        {/* TODO: Map over divyangCounts once data structure and processing are defined */}
                                        <tr><td>(उदा. अस्थिव्यंग)</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
                                        <tr><td>(उदा. मतीमंद)</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
                                        <tr><td className="fw-bold">एकूण</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Syllabus Section */}
                        <div className="syllabus-title mt-2">
                            <span>✺✺</span> चालू महिन्यात पूर्ण झालेला अभ्यासक्रम <span>✺✺</span>
                        </div>
                        <table className="table table-bordered table-sm report-table text-center align-middle mb-0">
                            <thead><tr><th style={{ width: '10%' }}>अ.क्र.</th><th style={{ width: '30%' }}>विषय</th><th>तपशील</th></tr></thead>
                            <tbody>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <tr key={`sub-${i}`}><td>{i}</td><td></td><td></td></tr>)}
                            </tbody>
                        </table>
                    </div> {/* End report-wrapper */}
                </div> // End printable-catalog
            )}
            <div className="mt-3 mb-5 text-center d-print-none">
                <button
                    className="btn btn-primary"
                    onClick={() => window.print()}
                    disabled={isLoading || !teacherInfo || (students.length === 0 && !Object.keys(ageGroups).length && attendanceData.workDays === 0)}
                >
                    अहवाल प्रिंट करा
                </button>
            </div>
        </>
    );
}

export default AttendanceCoverPage;