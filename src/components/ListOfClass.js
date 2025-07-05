import React, { useCallback, useEffect, useState } from 'react'
import apiService from '../services/api.service'
import { jwtDecode } from 'jwt-decode'
import { BiReset, BiSearch, BiX } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';


function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

function ListOfClass() {

    const school = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    const [classTeacheData, setClassTeacherData] = useState([]);
    const [searchFirstName, setSearchFirstName] = useState('');
    const [searchFatherName, setSearchFatherName] = useState('');
    const [searchSurName, setSearchSurName] = useState('');
    const [searchStandard, setSearchStandard] = useState('');
    const [searchDivision, setSearchDivision] = useState('');
    const [loading, setLoading] = useState(false);
    const [filteredClass, setFilteredClass] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!school) return;
        fetchClassTeacher();
    }, [])

    const fetchClassTeacher = async () => {
        try {
            await apiService.getbyid("classteacher/getbyudise/", school).then((response) => {
                setClassTeacherData(response.data);
            })
        }
        catch (error) {
            
            setError("Failed to load data");
        }
        finally {
            setLoading(false);
        }
    }

    
    useEffect(() => {
        if (!school) return;
        setLoading(true);
        setError(null)
        fetchClassTeacher();
    }, [])

    const performFilter = useCallback((standard, division, firstName, fatherName, surName) => {
        if (!classTeacheData.length) return; // Don't filter if there's no base data

        const searchst = standard.trim();
        const searchDiv = division.toLowerCase().trim();
        const searchF = firstName.toLowerCase().trim();
        const searchFa = fatherName.toLowerCase().trim();
        const searchS = surName.toLowerCase().trim();

        // If all search terms are empty, show all staff
        if (!searchst && !searchDiv && !searchF && !searchFa && !searchS) {
            setFilteredClass(classTeacheData);
            return;
        }

        const filtered = classTeacheData.filter(classdata => {
            const standard = String(classdata?.standardMaster?.standard ?? '')
            const division = String(classdata?.division?.name ?? '').toLowerCase();
            const staffFname = String(classdata?.staff?.fname ?? '').toLowerCase();
            const staffFathername = String(classdata?.staff?.fathername ?? '').toLowerCase();
            const staffLname = String(classdata?.staff?.lname ?? '').toLowerCase();

            const matchesStandard = searchst ? standard.includes(searchst) : true;
            const matchesDivision = searchDiv ? division.includes(searchDiv) : true;
            const matchesFirstName = searchF ? staffFname.includes(searchF) : true;
            const matchesFatherName = searchFa ? staffFathername.includes(searchFa) : true;
            const matchesSurName = searchS ? staffLname.includes(searchS) : true;

            return matchesStandard && matchesDivision && matchesFirstName && matchesFatherName && matchesSurName;
        });
        setFilteredClass(filtered);
    }, [classTeacheData]);

    const debouncedFilter = useCallback(debounce(performFilter, 300), [performFilter]);

    useEffect(() => {
        debouncedFilter(searchStandard, searchDivision, searchFirstName, searchFatherName, searchSurName)
    }, [searchStandard, searchDivision, searchFirstName, searchFatherName, searchSurName, debouncedFilter])

    const clearSearch = () => {
        setSearchDivision('');
        setSearchStandard('');
        setSearchFirstName('');
        setSearchFatherName('');
        setSearchSurName('');
    };

   

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <div className="p-3 bg-white rounded shadow-sm">
                            <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.8rem' }}>
                                सर्व वर्गांची यादी
                            </h2>
                        </div>
                    </div>

                    {/* Display Error Message */}
                    {/* {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )} */}


                    {/* Search Box */}
                    <div className="card border-0 rounded-0 mb-4 shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center mb-3">
                                <BiSearch className="me-2 text-muted" size="1.3em" />
                                <h5 className="card-title mb-0 text-dark fw-bold">वर्ग शोधा</h5>
                            </div>

                            <div className="d-flex flex-column flex-md-row align-items-md-start">

                                <div className="flex-grow-1 d-flex flex-wrap gap-2 mb-2 mb-md-0">

                                    {/* Standard Input */}
                                    <div className="flex-fill" style={{ minWidth: '160px' }}>
                                        <input
                                            type="text" 
                                            value={searchStandard}
                                            onChange={(e) => setSearchStandard(e.target.value)}
                                            className="form-control form-control-sm"
                                            placeholder="इयत्ता"
                                            aria-label="इयत्ता"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Division Input */}
                                    <div className="flex-fill" style={{ minWidth: '160px' }}>
                                        <input
                                            type="text"
                                            value={searchDivision}
                                            onChange={(e) => setSearchDivision(e.target.value)}
                                            className="form-control form-control-sm"
                                            placeholder="तुकडी"
                                            aria-label="तुकडी"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Teacher First Name Input */}
                                    <div className="flex-fill" style={{ minWidth: '160px' }}>
                                        <input
                                            type="text"
                                            value={searchFirstName}
                                            onChange={(e) => setSearchFirstName(e.target.value)}
                                            className="form-control form-control-sm"
                                            placeholder="शिक्षकाचे नाव"
                                            aria-label="शिक्षकाचे नाव"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Father's Name Input */}
                                    <div className="flex-fill" style={{ minWidth: '160px' }}>
                                        <input
                                            type="text"
                                            value={searchFatherName}
                                            onChange={(e) => setSearchFatherName(e.target.value)}
                                            className="form-control form-control-sm"
                                            placeholder="वडिलांचे नाव"
                                            aria-label="वडिलांचे नाव"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Surname Input */}
                                    <div className="flex-fill" style={{ minWidth: '160px' }}>
                                        <input
                                            type="text"
                                            value={searchSurName}
                                            onChange={(e) => setSearchSurName(e.target.value)}
                                            className="form-control form-control-sm"
                                            placeholder="आडनाव"
                                            aria-label="आडनाव"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>


                                <div className="d-flex mt-2 mt-md-0 ms-md-auto flex-shrink-0">
                                    <button
                                        onClick={clearSearch}
                                        className="btn btn-outline-danger btn-sm d-flex align-items-center px-3 ms-2 py-1"
                                        disabled={loading || (!searchStandard && !searchDivision && !searchFirstName && !searchFatherName && !searchSurName)} // Adjusted disabled logic slightly to include all fields
                                        type="button"
                                        title="शोध साफ करा"
                                    >
                                        <BiReset className='me-1' size="1.8em"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Staff Table */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2">Loading class data...</p>
                        </div>
                    ) : (
                        <div className="card border-0 rounded-0" style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                            <div className="card-header bg-primary text-white p-2">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h3 className="mb-0 fw-bold fs-6">वर्गांची यादी</h3>
                                    {!error && (
                                        <div className="text-white">
                                            एकूण वर्ग: {filteredClass.length}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {filteredClass.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped mb-0">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th scope="col" width="5%" className="text-center">क्र.</th>
                                                    <th scope="col" width="10%">इयत्ता</th>
                                                    <th scope="col" width="10%">तुकडी</th>
                                                    <th scope="col" width="25%" className="text-center">वर्ग  शिक्षकाचे नाव</th>
                                                    {/* <th scope ="col" width="20">वर्ग शिक्षकाच्या वडीलांचे </th> */}
                                                    {/* <th scope="col" width="25%" className="text-center"> वर्ग शिक्षकाचे आडनाव</th> */}
                                                    {/* <th scope="col" width="10%">Status</th> */}
                                                    <th scope="col" width="15%" className="text-center">क्रिया</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredClass.map((classdata, index) => (
                                                    <tr key={classdata.id || index}>
                                                        <td className="text-center">{index + 1}</td>
                                                        <td>{classdata?.standardMaster?.standard || '-'}</td>
                                                        <td>{classdata?.division?.name || '-'}</td>
                                                        <td>{classdata?.staff?.fname || '-'} {classdata?.staff?.fathername || ''} {classdata?.staff?.lname || '-'}</td>
                                                        {/* <td><span className={`badge ${classdata.status === 'left' ? 'bg-danger' : 'bg-success'}`}>
                                                                {classdata.status}
                                                            </span></td>      */}
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-sm btn-outline-warning"
                                                                style={{ fontSize: '0.8rem' }}
                                                                onClick={() => { navigate(`/clerk/editclassteacher/${classdata.id}`) }}
                                                            >
                                                                वर्गशिक्षक बदला
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    
                                ) : (
                                    <div className="text-center py-4 text-muted">

                                        {classTeacheData.length === 0 && !loading && !error ?
                                            "या शाळेसाठी वर्ग नोंदणी केली  नाही." : // No staff registered for this school
                                            "दिलेल्या निकषांनुसार कोणताही वर्ग सापडला नाही." // No results matching search
                                        }

                                        {classTeacheData.length > 0 && filteredClass.length === 0 && (searchFirstName || searchFatherName || searchSurName) &&
                                            "शोध निकषांशी जुळणारे वर्ग नाहीत."
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                    )}
                </div>

            </div>
        </div>
    )
}

export default ListOfClass
