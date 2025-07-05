import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import apiService from '../services/api.service'; // Assuming this path is correct
import { jwtDecode } from 'jwt-decode';
import { BiReset, BiSearch } from 'react-icons/bi';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// Simple debounce function
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}


function StaffList() {
    // State Hooks

    const [udise, setUdise] = useState(jwtDecode(sessionStorage.getItem('token'))?.udiseNo);
    const [allStaff, setAllStaff] = useState([]);
    const [filteredStaff, setFilteredStaff] = useState([]);
    const [searchFirstName, setSearchFirstName] = useState('');
    const [searchFatherName, setSearchFatherName] = useState('');
    const [searchSurName, setSearchSurName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        fname: '',
        fathername: '',
        lname: '',
        username: '',
        email: '',
        mobile: '',
        password: '',
        standard: '',
        role: '',
        level: '',
        status: ''
    });
    const navigate = useNavigate();

    // Decode token and set Udise on mount
    useEffect(() => {
        try {
            const token = sessionStorage.getItem('token');
            if (token) {
                const decodedToken = jwtDecode(token);
                setUdise(decodedToken?.udiseNo);
            } else {
                setError("Authentication token not found.");
                console.error("Authentication token not found in sessionStorage.");
            }
        } catch (err) {
            setError("Failed to decode token.");
            console.error("Error decoding token:", err);
        }
        getData();
    }, []);

    const getData = async () => {
        try {
            const response = await apiService.getbyid('staff/getbyudise/', udise)

            const staffData = Array.isArray(response?.data) ? response.data : [];
            setAllStaff(staffData);
            setFilteredStaff(staffData); // Initially show all staff
        } catch (err) {
            console.error("Error fetching staff data:", err);
            setError("Failed to load staff data.");
            setAllStaff([]);
            setFilteredStaff([]);
        }
        finally {
            setLoading(false);
        };
    }

    // Fetch data when udise is available
    useEffect(() => {
        if (!udise) return; // Don't fetch if udise is not set yet

        setLoading(true);
        setError(null);

        getData();

    }, [udise]);

    // --- Search Logic ---

    // Memoized function to perform the actual filtering
    const performFilter = useCallback((firstName, fatherName, surName) => {
        if (!allStaff.length) return; // Don't filter if there's no base data

        const searchF = firstName.toLowerCase().trim();
        const searchFa = fatherName.toLowerCase().trim();
        const searchS = surName.toLowerCase().trim();

        // If all search terms are empty, show all staff
        if (!searchF && !searchFa && !searchS) {
            setFilteredStaff(allStaff);
            return;
        }

        const filtered = allStaff.filter(staff => {
            const staffFname = String(staff?.fname ?? '').toLowerCase();
            const staffFathername = String(staff?.fathername ?? '').toLowerCase();
            const staffLname = String(staff?.lname ?? '').toLowerCase();

            const matchesFirstName = searchF ? staffFname.includes(searchF) : true;
            const matchesFatherName = searchFa ? staffFathername.includes(searchFa) : true;
            const matchesSurName = searchS ? staffLname.includes(searchS) : true;

            return matchesFirstName && matchesFatherName && matchesSurName;
        });
        setFilteredStaff(filtered);
    }, [allStaff]); // Dependency: allStaff



    const debouncedFilter = useCallback(debounce(performFilter, 300), [performFilter]); // 300ms delay

    useEffect(() => {

        debouncedFilter(searchFirstName, searchFatherName, searchSurName);


        return () => {

        };
    }, [searchFirstName, searchFatherName, searchSurName, debouncedFilter]); // Dependencies


    const clearSearch = () => {
        setSearchFirstName('');
        setSearchFatherName('');
        setSearchSurName('');
    };

    function changeStatus(id) {

        const isleft = allStaff.find(staff => staff.id === id && staff.status === "left")

        if (isleft) {
            alert("या शिक्षक/कर्मचारी यांची स्थिति आधीच नोंद केलेली आहे ")
        }
        else {
            Swal.fire({
                title: "तुम्हाला खात्री आहे की हे शिक्षक/कर्मचारी आता काम करत नाही?",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "होय",
                denyButtonText: `नाही `
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    setFormData(prev => ({ ...prev, status: "left" }))
                    apiService.getbyid("staff/status/", id).then((response) => {
                        Swal.fire("Saved!", "", "success");
                        getData();
                    })
                } else if (result.isDenied) {
                    Swal.fire("Changes are not saved", "", "info");
                }
            });

        }

    }
    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <div className="p-3 bg-white rounded shadow-sm">
                            <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.8rem' }}>
                                कर्मचाऱ्यांची यादी
                            </h2>
                        </div>
                    </div>

                    {/* Display Error Message */}
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}


                    {/* Search Box */}
                    <div className="card border-0 rounded-0 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center mb-2">
                                <BiSearch className="me-2 text-muted" size="1.2em" />
                                <h5 className="card-title mb-0 text-dark">कर्मचारी शोधा</h5>
                            </div>
                            <div className="d-flex flex-column flex-md-row align-items-md-stretch"> {/* Changed align-items */}
                                <div className="flex-grow-1 d-flex flex-wrap mb-2 mb-md-0">
                                    {/* Inputs */}
                                    <div className="me-md-2 mb-2 mb-md-0 flex-fill" style={{ minWidth: '150px' }}>
                                        <input
                                            value={searchFirstName}
                                            onChange={(e) => setSearchFirstName(e.target.value)}
                                            className="form-control form-control-sm"
                                            placeholder="कर्मचाऱ्याचे नाव"
                                            aria-label="कर्मचाऱ्याचे नाव"
                                            disabled={loading} // Disable inputs while loading initial data
                                        />
                                    </div>
                                    <div className="me-md-2 mb-2 mb-md-0 flex-fill" style={{ minWidth: '150px' }}>
                                        <input
                                            value={searchFatherName}
                                            onChange={(e) => setSearchFatherName(e.target.value)}
                                            className="form-control form-control-sm"
                                            placeholder="वडिलांचे नाव"
                                            aria-label="वडिलांचे नाव"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="me-md-2 mb-2 mb-md-0 flex-fill" style={{ minWidth: '150px' }}>
                                        <input
                                            value={searchSurName}
                                            onChange={(e) => setSearchSurName(e.target.value)}
                                            className="form-control form-control-sm"
                                            placeholder="आडनाव"
                                            aria-label="आडनाव"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                {/* Clear Button - kept it as it's useful */}
                                <div className="d-flex mt-2 mt-md-0 ms-md-auto"> {/* Use ms-md-auto to push right */}
                                    <button
                                        onClick={clearSearch}
                                        className="btn btn-danger d-flex align-items-center px-3 py-1"
                                        disabled={loading || (!searchFirstName && !searchFatherName && !searchSurName)} // Disable if loading or already clear
                                        style={{ height: '32px' }}
                                        type="button"
                                    >
                                        <BiReset className='me-1' size="1.8em" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Staff Table */}
                    {/* ... (rest of the table rendering code remains the same) ... */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading staff data...</p>
                        </div>
                    ) : (
                        <div className="card border-0 rounded-0" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                            <div className="card-header bg-primary text-white p-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="mb-0 fw-bold fs-6">कर्मचाऱ्यांची यादी</h3>
                                    {!error && ( // Show count only if no error
                                        <div className="text-white">
                                            एकूण कर्मचारी: {filteredStaff.length}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {filteredStaff.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th scope="col" width="5%" className="text-center">क्र.</th>
                                                    <th scope="col" width="25%">कर्मचाऱ्याचे नाव</th>
                                                    <th scope="col" width="20%">वडिलांचे नाव</th>
                                                    <th scope="col" width="15%">आडनाव</th>
                                                    <th scope="col" width="15%">पदनाम</th>
                                                    <th scope="col" width="10%">Status</th>
                                                    <th scope="col" width="20%" className="text-center">क्रिया</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredStaff.map((staff, index) => (
                                                    <tr key={staff.id || index}>
                                                        <td className="text-center">{index + 1}</td>
                                                        <td>{staff.fname || " "}</td>
                                                        <td>{staff.fathername || " "}</td>
                                                        <td>{staff.lname || " "}</td>
                                                        <td>{staff.role || " "}</td>
                                                        <td>
                                                            <span className={`badge ${staff.status === 'left' ? 'bg-danger' : 'bg-success'}`}>
                                                                {staff.status}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-sm btn-outline-warning"
                                                                style={{ fontSize: '0.8rem' }}
                                                                onClick={() => changeStatus(staff.id)}
                                                                aria-label={`Change status for ${staff.fname} ${staff.lname}`}
                                                            >
                                                                Mark As Left
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        {/* Improved message based on whether filtering occurred */}
                                        {allStaff.length === 0 && !loading && !error ?
                                            "या शाळेसाठी कर्मचाऱ्यांची नोंद नाही." : // No staff registered for this school
                                            "दिलेल्या निकषांनुसार कोणतेही कर्मचारी सापडले नाहीत." // No results matching search
                                        }
                                        {/* Add message specifically for when filters are active but yield no results */}
                                        {allStaff.length > 0 && filteredStaff.length === 0 && (searchFirstName || searchFatherName || searchSurName) &&
                                            "शोध निकषांशी जुळणारे कर्मचारी नाहीत."
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                    )}
                    <button className="btn btn-primary position-fixed bottom-0 start-50  mb-4" onClick={() => { navigate(`/headmaster/staffAdd`) }}>
                        कर्मचारी नोंदणी फॉर्म
                    </button>
                </div>

            </div>
        </div>
    );
}

export default StaffList;