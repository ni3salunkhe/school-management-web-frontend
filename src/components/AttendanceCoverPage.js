import React from 'react'
import '../styling/AttendanceCoverPage.css'

function AttendanceCoverPage() {
    const schoolData = {
        slogan: "SCHOOL SLOGAN",
        trustName: "NAME OF THE TRUST/MANAGEMENT",
        schoolName: "NAME OF THE SCHOOL",
        indexNo: "SCHOOL INDEX NO.",
        udiseNo: "UDISE NO.",
        logoUrl: "https://via.placeholder.com/80?text=LOGO" // Placeholder LOGO URL
    };
    const reportData = {
        month: "माहे/MONTH",
        monthYear: "MONTH & YEAR",
        workingDays: "XX", // Replace with actual data
        avgAttendance: "YY.Y%",
        percentAttendance: "ZZ.Z%",
        standard: "STANDARD IN NUMBER & WORDS",
        stream: "STREAM",
        division: "DIVISION",
        classTeacher: "NAME OF THE CLASS TEACHER QUALIFICATION"
    };
    return (
        <>    
        {/* Main Printable Wrapper */}
            <div id="printable-catalog" className="container-fluid p-2 mt-5">
                <div className="report-wrapper">

                    {/* Top Header Section */}
                    <div className="row mb-2 align-items-center">
                        <div className="col-2 d-flex justify-content-center align-items-center">
                            {/* LOGO Placeholder */}
                            {/* <img src={schoolData.logoUrl} alt="Logo" style={{ maxHeight: '50px', maxWidth: '100%' }} /> */}
                            <div className="logo-placeholder">LOGO</div>
                        </div>
                        <div className="col-10">
                            <div className="header-line fw-bold">{schoolData.slogan}</div>
                            <div className="header-line fw-bold">{schoolData.trustName}</div>
                            <div className="header-line fw-bold fs-6">{schoolData.schoolName}</div>
                            <div className="header-line-thick fw-bold">{schoolData.indexNo}........... UDISE NO. {schoolData.udiseNo}...........</div>
                        </div>
                    </div>

                    {/* Monthwise Catlog Title */}
                    <div className="text-center mb-2">
                        <div className="d-inline-block border border-2 border-dark p-1 px-3 fw-bold rounded">
                            मासिक पत्रक / MONTHWISE CATLOG
                        </div>
                    </div>

                    {/* Main Info Row */}
                    <div className="row mb-2 gx-2">
                        {/* Month */}
                        <div className="col-auto">
                            <div className="bordered-box-label text-center">{reportData.month}</div>
                            <div className="bordered-box" style={{ minWidth: '100px' }}> </div>
                        </div>
                        {/* Month & Year */}
                        <div className="col-auto">
                            <div className="bordered-box-label text-center"> </div> {/* Spacer for alignment */}
                            <div className="bordered-box" style={{ minWidth: '150px' }}>{reportData.monthYear}</div>
                        </div>
                        {/* Spacer */}
                        <div className="col"></div>
                        {/* Working Days / Attendance */}
                        <div className="col-auto">
                            <div className="bordered-box-label">कामाचे दिवस: <span className="fw-bold">{reportData.workingDays}</span></div>
                            <div className="bordered-box-label">सरासरी उपस्थिती: <span className="fw-bold">{reportData.avgAttendance}</span></div>
                            <div className="bordered-box-label">शेकडा उपस्थिती: <span className="fw-bold">{reportData.percentAttendance}</span></div>
                        </div>
                    </div>

                    {/* Standard / Stream / Teacher Row */}
                    <div className="row mb-3 align-items-center">
                        <div className="col-auto pe-0"><strong>इयत्ता:-</strong></div>
                        <div className="col"><span className="bordered-box-small-text">{reportData.standard}</span></div>
                        <div className="col-auto pe-0"><strong>STREAM</strong></div>
                        <div className="col-auto pe-0"><span className="bordered-box-small-text">{reportData.stream}</span></div>
                        <div className="col-auto pe-0"><strong>तुकडी/DIVISION:-</strong></div>
                        <div className="col-auto pe-0"><span className="bordered-box-small-text">{reportData.division}</span></div>
                        <div className="col-auto pe-0"><strong>वर्ग शिक्षक :-</strong></div>
                        <div className="col"><span className="bordered-box-small-text">{reportData.classTeacher}</span></div>
                    </div>

                    {/* --- Main Content Tables --- */}
                    <div className="section-title mb-1">O माहिती अहवाल O</div>

                    <div className="row gx-2">
                        {/* Table A */}
                        <div className="col">
                            <div className="sub-table-title">वयोगटानुसार वर्गीकरण (A)</div>
                            <table className="table table-bordered table-sm report-table text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>वय वर्ष</th>
                                        <th>मुले</th>
                                        <th>मुली</th>
                                        <th>एकूण</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['८', '९', '१०', '११', '१२', '१३', '१४', '१५', '१६', '१७', '१८', '१९', '२०', '२१', '२२'].map(age => (
                                        <tr key={age}><td>{age}</td><td></td><td></td><td></td></tr>
                                    ))}
                                    <tr>
                                        <td className="fw-bold">एकूण</td>
                                        <td>0</td><td>0</td><td>0</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Tables B, D */}
                        <div className="col">
                            <div className="sub-table-title">प्रवर्गनिहाय वर्गीकरण (B)</div>
                            <table className="table table-bordered table-sm report-table text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>प्रवर्ग</th>
                                        <th>मुले</th>
                                        <th>मुली</th>
                                        <th>एकूण</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['S.C.', 'S.T.', 'VJ/NT', 'OBC', 'SBC', 'OPEN', 'E.S.B.C'].map(cat => (
                                        <tr key={cat}><td>{cat}</td><td></td><td></td><td>0</td></tr>
                                    ))}
                                    <tr>
                                        <td className="fw-bold">एकूण</td>
                                        <td>0</td><td>0</td><td>0</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="sub-table-title mt-3">अल्पसंख्यांक विद्यार्थी (D)</div>
                            <table className="table table-bordered table-sm report-table text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>MINORITY INFOR</th>
                                        <th>मुले</th>
                                        <th>मुली</th>
                                        <th>एकूण</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Add minority rows if needed */}
                                    <tr><td> </td><td></td><td></td><td>0</td></tr>
                                    <tr><td> </td><td></td><td></td><td>0</td></tr>
                                    <tr><td> </td><td></td><td></td><td>0</td></tr>
                                    <tr><td> </td><td></td><td></td><td>0</td></tr>
                                    <tr>
                                        <td className="fw-bold">एकूण</td>
                                        <td>0</td><td>0</td><td>0</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Tables C, E */}
                        <div className="col">
                            <div className="sub-table-title">शुल्क दाविनुसार वर्गीकरण ©</div>
                            <table className="table table-bordered table-sm report-table text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>वर्गवारी</th>
                                        <th>मुले</th>
                                        <th>मुली</th>
                                        <th>एकूण</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['PAY', 'B.C.F.', 'E.B.C.', 'E.B.C.B.C', 'P.T.', 'M.T.', 'Ex. Sol.'].map(feeCat => (
                                        <tr key={feeCat}><td>{feeCat}</td><td></td><td></td><td>0</td></tr>
                                    ))}
                                    <tr>
                                        <td className="fw-bold">एकूण</td>
                                        <td>0</td><td>0</td><td>0</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="sub-table-title mt-3">दिव्यांग विद्यार्थी नोंद (E)</div>
                            <table className="table table-bordered table-sm report-table text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>प्रकार</th>
                                        <th>मुले</th>
                                        <th>मुली</th>
                                        <th>एकूण</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {['अस्थिव्यंग', 'मतीमंद'].map(disType => ( // Add more types if needed
                                        <tr key={disType}><td>{disType}</td><td></td><td></td><td></td></tr>
                                    ))}
                                    {/* Add empty rows if needed */}
                                    <tr><td> </td><td></td><td></td><td></td></tr>
                                    <tr>
                                        <td className="fw-bold">एकूण</td>
                                        <td></td><td></td><td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Syllabus Section */}
                    <div className="syllabus-title">
                        <span>✺✺</span> चालू महिन्यात पूर्ण झालेला अभ्यासक्रम <span>✺✺</span>
                    </div>
                    <table className="table table-bordered table-sm report-table text-center align-middle mb-0">
                        <thead>
                            <tr>
                                <th style={{ width: '15%' }}>अ.क्र./S.NO.</th>
                                <th style={{ width: '35%' }}>विषय / SUBJECT</th>
                                <th>तपशील / PERTICULARS (BLANK)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Add rows for subjects - Example */}
                            <tr><td>1</td><td></td><td></td></tr>
                            <tr><td>2</td><td></td><td></td></tr>
                            <tr><td>3</td><td></td><td></td></tr>
                            <tr><td>4</td><td></td><td></td></tr>
                        </tbody>
                    </table>

                </div> {/* End report-wrapper */}
            </div> {/* End printable-catalog */}

            {/* Print Button - Hidden in print */}
            <div className="mt-3 text-center d-print-none">
                <button className="btn btn-primary" onClick={() => window.print()}>
                    Print Catalog Report
                </button>
            </div>
        </>
    )
}

export default AttendanceCoverPage
