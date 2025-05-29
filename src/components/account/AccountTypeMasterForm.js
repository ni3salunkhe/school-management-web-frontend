import React, { useEffect, useState } from 'react';
import apiService from '../../services/api.service';
import Next from '../Next';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Edit, Trash2 } from 'lucide-react';

function AccountTypeMasterForm() {
    const [accountType, setAccountType] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [allAccountType, setAllAccountType] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    
    const role = jwtDecode(sessionStorage.getItem('token'))?.role.toLowerCase();
    const udiseNo = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    const navigate = useNavigate();

    function isOnlyMarathi(input) {
        const marathiRegex = /^[\u0900-\u097F\s]+$/;
        return marathiRegex.test(input);
    }

    // Fetch all account types
    const fetchAccountTypes = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getdata(`accounttype/byudiseno/${udiseNo}`);
            setAllAccountType(response.data);
            console.log(response.data);
            
        } catch (error) {
            console.error("Error fetching accounttypes:", error);
            Swal.fire('त्रुटी!', 'डेटा लोड करण्यात अडचण आली.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccountTypes();
    }, []);

    const handleChange = (e) => {
        const { value } = e.target;
        setAccountType(value);

        const newError = {};
        // Clear previous error if user is typing
        if (errors.accountType) {
            setErrors(prev => ({ ...prev, accountType: null }));
        }

        // Check for duplicates (exclude current editing item)
        const isDuplicate = allAccountType.some((item) =>
            item.name.trim().toLowerCase() === value.toLowerCase() && 
            item.accountTypeId !== editingId
        );
        
        if (isDuplicate) {
            newError.accountType = "हा खाते प्रकार आधीच अस्तित्वात आहे.";
        }

        if (value && !isOnlyMarathi(value)) {
            newError.accountType = "कृपया केवळ मराठी भाषा वापरा. भाषा बदलण्यासाठी windows key + स्पेसबार दबा";
        }

        setErrors(newError);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedAccountType = accountType.trim();
        let validationErrors = {};

        if (!trimmedAccountType) {
            validationErrors.accountType = "खाते प्रकाराचे नाव आवश्यक आहे.";
        } else {
            const isDuplicate = allAccountType.some((item) =>
                item.name.trim().toLowerCase() === trimmedAccountType.toLowerCase() && 
                item.accountTypeId !== editingId
            );
            if (isDuplicate) {
                validationErrors.accountType = "हा खाते प्रकार आधीच अस्तित्वात आहे.";
            }
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const isEditing = editingId !== null;
        const title = isEditing ? 'खाते प्रकार अपडेट करायचा आहे का?' : 'खाते प्रकार जतन करायचा आहे का?';
        
        const result = await Swal.fire({
            title: title,
            icon: 'question',
            showCancelButton: true,
            showDenyButton: !isEditing,
            confirmButtonText: isEditing ? 'अपडेट करा' : 'जतन करा',
            denyButtonText: 'जतन करा आणि पुढे चला',
            cancelButtonText: 'रद्द करा'
        });

        if (result.isConfirmed || result.isDenied) {
            try {
                const accountDto={ name: trimmedAccountType, udiseNo }
                if (isEditing) {
                    await apiService.put(`accounttype/edit/${editingId}`, accountDto);
                    await Swal.fire('यशस्वी!', 'खाते प्रकार अपडेट झाला.', 'success');
                } else {
                    await apiService.postdata("accounttype/", accountDto).then(()=>{

                        Swal.fire('यशस्वी!', 'खाते प्रकार जतन झाला.', 'success');
                    }).catch((error)=>{Swal.fire('त्रुटि!', 'खाते प्रकार जतन करण्यात अपयश आले.', 'error');})
                }

                setTimeout(() => setSubmitted(false), 1500);
                setSubmitted(true);
                resetForm();
                await fetchAccountTypes();

                if (result.isDenied) {
                    navigate('/developer/district');
                }

            } catch (error) {
                console.error("Error:", error);
                Swal.fire('त्रुटी!', 'डेटा जतन करण्यात अडचण आली.', 'error');
            }
        }
    };

    const handleEdit = (item) => {
        setAccountType(item.name);
        setEditingId(item.accountTypeId);
        setShowForm(true);
        setErrors({});
    };

    const handleDelete = async (id, accountTypeName) => {
        const result = await Swal.fire({
            title: 'खात्री आहे का?',
            text: `"${accountTypeName}" हा खाते प्रकार कायमचा काढून टाकायचा आहे का?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'होय, काढून टाका!',
            cancelButtonText: 'रद्द करा'
        });

        if (result.isConfirmed) {
            try {
                await apiService.deletedata(`accounttype/${id}`);
                await Swal.fire('काढून टाकले!', 'खाते प्रकार यशस्वीरित्या काढून टाकला गेला.', 'success');
                await fetchAccountTypes();
            } catch (error) {
                console.error("Error deleting account type:", error);
                Swal.fire('त्रुटी!', 'खाते प्रकार काढून टाकण्यात अडचण आली.', 'error');
            }
        }
    };

    const resetForm = () => {
        setAccountType('');
        setEditingId(null);
        setErrors({});
        setShowForm(false);
    };

    const handleAddNew = () => {
        resetForm();
        setShowForm(true);
    };

    return (
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-header bg-primary bg-gradient text-white p-3 text-center position-relative">
                            <div className="position-absolute top-0 end-0 m-2">
                                <Next classname={'btn bg-danger text-white btn-sm'} path={`/${role}`} placeholder={'X'}></Next>
                            </div>
                            <h3 className="mb-0 fw-bold fs-4 heading-font">खाते प्रकार मास्टर</h3>
                        </div>

                        <div className="card-body p-4">
                            {/* Add New Button */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">खाते प्रकार यादी</h5>
                                <button 
                                    className="btn btn-success btn-sm"
                                    onClick={handleAddNew}
                                >
                                    <i className="fas fa-plus me-1"></i>नवीन जोडा
                                </button>
                            </div>

                            {/* Form Section */}
                            {showForm && (
                                <div className="card mb-4 border-secondary">
                                    <div className="card-header bg-light">
                                        <h6 className="mb-0">
                                            {editingId ? 'खाते प्रकार संपादित करा' : 'नवीन खाते प्रकार जोडा'}
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit} className="fs-6">
                                            <div className="row">
                                                <div className="col-md-8">
                                                    <label className="form-label fw-semibold">खाते प्रकार</label>
                                                    <input
                                                        type="text"
                                                        name="accountType"
                                                        className={`form-control form-control-sm ${errors.accountType ? 'is-invalid' : ''}`}
                                                        value={accountType}
                                                        onChange={handleChange}
                                                        placeholder='उदा. बचत खाते'
                                                    />
                                                    {errors.accountType && (
                                                        <div className="invalid-feedback">
                                                            {errors.accountType}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-4 d-flex align-items-end">
                                                    <button type="submit" className="btn btn-success btn-sm me-2">
                                                        {editingId ? 'अपडेट करा' : 'जतन करा'}
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={resetForm}
                                                    >
                                                        रद्द करा
                                                    </button>
                                                </div>
                                            </div>
                                            {submitted && (
                                                <div className="mt-3 alert alert-success">
                                                    खाते प्रकार यशस्वीरित्या {editingId ? 'अपडेट' : 'जतन'} झाला!
                                                </div>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* List Section */}
                            <div className="card">
                                <div className="card-body">
                                    {isLoading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">लोड होत आहे...</span>
                                            </div>
                                        </div>
                                    ) : allAccountType.length === 0 ? (
                                        <div className="text-center py-4 text-muted">
                                            <p>कोणताही खाते प्रकार सापडला नाही.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover table-striped">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th scope="col">#</th>
                                                        <th scope="col">खाते प्रकार</th>
                                                        <th scope="col" className="text-center">क्रिया</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allAccountType.map((item, index) => (
                                                        <tr key={item.accountTypeId}>
                                                            <th scope="row">{index + 1}</th>
                                                            <td>{item.name}</td>
                                                            <td className="text-center">
                                                                <button
                                                                    className="btn btn-outline-primary btn-sm me-2"
                                                                    onClick={() => handleEdit(item)}
                                                                    title="संपादित करा"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => handleDelete(item.accountTypeId, item.name)}
                                                                    title="काढून टाका"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Navigation */}
                           
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountTypeMasterForm;
