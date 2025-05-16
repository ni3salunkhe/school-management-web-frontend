import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';

function ViewUsers() {
  const [headmasters, setHeadmasters] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedUdise, setSelectedUdise] = useState("");
  const [filteredHeadmasters, setFilteredHeadmasters] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("headmasters");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [headmastersRes, staffRes] = await Promise.all([
        apiService.getdata("school/"), 
        apiService.getdata("staff/")
      ]);
      
      setHeadmasters(headmastersRes.data || []);
      setStaff(staffRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUdise) {
      setFilteredHeadmasters(
        headmasters.filter(hm => hm.udiseNo === parseInt(selectedUdise) || hm.udiseNo === selectedUdise)
      );
      setFilteredStaff(
        staff.filter(s => s.school?.udiseNo === parseInt(selectedUdise) || s.school?.udiseNo === selectedUdise)
      );
    } else {
      setFilteredHeadmasters(headmasters);
      setFilteredStaff(staff);
    }
  }, [selectedUdise, headmasters, staff]);

  // Get unique UDISE numbers for dropdown
  const getUniqueUdiseNumbers = () => {
    const udiseFromHeadmasters = headmasters
      .filter(hm => hm.udiseNo)
      .map(hm => hm.udiseNo.toString());
    
    const udiseFromStaff = staff
      .filter(s => s.school?.udiseNo)
      .map(s => s.school.udiseNo.toString());
    
    return [...new Set([...udiseFromHeadmasters, ...udiseFromStaff])];
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="bg-primary text-white p-4 rounded">
            <h2 className="display-6">School User Directory</h2>
            <p className="lead">View information about headmasters, teachers, and clerks</p>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="row justify-content-center my-5">
          <div className="col-auto text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading user data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Section */}
          <div className="row mb-4">
            <div className="col">
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <h4 className="card-title">Filter Users</h4>
                      <p className="card-text text-muted">Select a UDISE number to view specific school data</p>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="udiseFilter" className="form-label">UDISE Number:</label>
                      <select
                        id="udiseFilter"
                        value={selectedUdise}
                        onChange={(e) => setSelectedUdise(e.target.value)}
                        className="form-select"
                      >
                        <option value="">All UDISE Numbers</option>
                        {getUniqueUdiseNumbers().map((udise) => (
                          <option key={udise} value={udise}>
                            {udise}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="row mb-4">
            <div className="col">
              <ul className="nav nav-tabs" id="userTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === "headmasters" ? "active" : ""}`} 
                    onClick={() => setActiveTab("headmasters")}
                    type="button" 
                    role="tab"
                  >
                    Headmasters
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === "staff" ? "active" : ""}`} 
                    onClick={() => setActiveTab("staff")}
                    type="button" 
                    role="tab"
                  >
                    Staff (Teachers & Clerks)
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Tab Content */}
          <div className="row">
            <div className="col">
              <div className="tab-content" id="userTabsContent">
                {/* Headmasters Tab */}
                <div className={`tab-pane fade ${activeTab === "headmasters" ? "show active" : ""}`}>
                  <div className="card">
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-striped table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>UDISE No.</th>
                              <th>Username</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>School Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredHeadmasters.length > 0 ? (
                              filteredHeadmasters.map((hm, index) => (
                                <tr key={index}>
                                  <td>{hm.udiseNo || "-"}</td>
                                  <td>{hm.headMasterUserName || "-"}</td>
                                  <td>{hm.schoolEmailId || hm.headMasterEmailId || "-"}</td>
                                  <td>{hm.headMasterMobileNo || "-"}</td>
                                  <td>{hm.schoolName || "-"}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="text-center py-5">
                                  <div className="text-muted">
                                    <i className="bi bi-emoji-frown fs-3 d-block mb-3"></i>
                                    <h5>No headmasters found</h5>
                                    <p>No headmasters found with this UDISE number.</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Staff Tab */}
                <div className={`tab-pane fade ${activeTab === "staff" ? "show active" : ""}`}>
                  <div className="card">
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-striped table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>UDISE No.</th>
                              <th>Username</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>School Name</th>
                              <th>Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStaff.length > 0 ? (
                              filteredStaff.map((s, index) => (
                                <tr key={index}>
                                  <td>{s.school?.udiseNo || "-"}</td>
                                  <td>{s.username || "-"}</td>
                                  <td>{s.email || "-"}</td>
                                  <td>{s.mobile || "-"}</td>
                                  <td>{s.school?.schoolName || "-"}</td>
                                  <td>
                                    <span className={`badge ${
                                      s.role === 'TEACHER' ? 'bg-success' : 
                                      s.role === 'CLERK' ? 'bg-info' : 
                                      'bg-secondary'
                                    }`}>
                                      {s.role || "-"}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" className="text-center py-5">
                                  <div className="text-muted">
                                    <i className="bi bi-emoji-frown fs-3 d-block mb-3"></i>
                                    <h5>No staff found</h5>
                                    <p>No staff found with this UDISE number.</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ViewUsers;