import React, { useEffect, useState } from 'react'
import apiService from '../../services/api.service';
import Swal from 'sweetalert2';
import { Calendar, Edit } from 'lucide-react';
import { FaCalendar, FaClock, FaCogs, FaHashtag, FaInfoCircle, FaSave, FaTable, FaUndo } from 'react-icons/fa';

function YearMaster() {
    const [formData, setFormData] = useState({
        id: null,
        year: ''
    });

    const [yearList, setYearList] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchYear();
    }, [])

    const fetchYear = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.getdata("year/");
            // Make sure response.data exists and is an array
            setYearList(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching years:", error);
            Swal.fire('Error', 'वर्ष डेटा लोड करताना त्रुटी', 'error');
            setYearList([]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.year.trim()) {
            newErrors.year = 'वर्ष आवश्यक आहे';
        } else if (!/^\d{4}-\d{4}$/.test(formData.year)) {
            newErrors.year = 'वर्ष 2024-2025 या स्वरूपात असावे';
        } else {
            // Additional validation to check if it's a valid year range
            const [startYear, endYear] = formData.year.split('-').map(Number);
            if (endYear !== startYear + 1) {
                newErrors.year = 'वर्ष क्रमवार असावे (उदा. 2024-2025)';
            } else if (yearList.some(y => y.year === formData.year)) {
                newErrors.year = 'हे वर्ष आधीच जोडले आहे';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            if (!isEditing) {
                const saveData = await apiService.post("year/", formData);
                if (saveData.data) {
                    Swal.fire('Success', 'वर्ष यशस्वीरित्या जतन केले!', 'success');
                    setFormData({ year: '' });
                    fetchYear();
                }
            }
            if (isEditing && formData.id) {
                const editData = await apiService.put(`year/${formData.id}`, formData);
                if (editData.data) {
                    Swal.fire('Success', 'वर्ष यशस्वीरित्या edit केले!', 'success');
                    setFormData({ year: '' });
                    fetchYear();
                }
            }

        } catch (err) {
            console.error("Error saving year:", err);
            Swal.fire('Error', 'वर्ष जतन करताना त्रुटी', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (year) => {
        setIsEditing(true);
        setFormData(prev => ({ ...formData, year: year.year, id: year.id }));
    }

    const handleReset = () => {
        setFormData({ year: '' });
        setIsEditing(false);
        setErrors({});
    };

    // const handleDelete = async (yearToDelete) => {
    //     const result = await Swal.fire({
    //         title: 'तुम्हाला खात्री आहे?',
    //         text: "तुम्ही हे वर्ष कायमचे हटवू शकत नाही!",
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonColor: '#3085d6',
    //         cancelButtonColor: '#d33',
    //         confirmButtonText: 'होय, हटवा!',
    //         cancelButtonText: 'रद्द करा'
    //     });

    //     if (result.isConfirmed) {
    //         try {
    //             await apiService.delete(`year/${yearToDelete.id}`);
    //             setYearList(prev => prev.filter(year => year.id !== yearToDelete.id));
    //             Swal.fire('Deleted!', 'वर्ष यशस्वीरित्या हटवले.', 'success');
    //         } catch (error) {
    //             console.error("Error deleting year:", error);
    //             Swal.fire('Error', 'वर्ष हटवताना त्रुटी', 'error');
    //         }
    //     }
    // };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-header text-white text-center" style={{ backgroundColor: '#007bff' }}>
                            <h4 className="mb-0">
                                <FaCalendar className='me-2' size={14} />
                                वर्ष मास्टर फॉर्म
                            </h4>
                        </div>

                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="year" className="form-label fw-semibold" style={{ color: '#0056b3' }}>
                                        वर्ष <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.year ? 'is-invalid' : ''}`}
                                        id="year"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        placeholder="वर्ष प्रविष्ट करा (उदा. 2024-2025)"
                                        style={{
                                            borderColor: errors.year ? '#dc3545' : '#007bff',
                                            borderWidth: '2px'
                                        }}
                                        onFocus={(e) => {
                                            if (!errors.year) {
                                                e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                                            }
                                        }}
                                        onBlur={(e) => e.target.style.boxShadow = 'none'}
                                    />
                                    {errors.year && (
                                        <div className="invalid-feedback">
                                            {errors.year}
                                        </div>
                                    )}
                                    <small className="form-text text-muted">
                                        कृपया वर्ष 2024-2025 या स्वरूपात प्रविष्ट करा
                                    </small>
                                </div>

                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">

                                    <button
                                        type="submit"
                                        className="btn text-white"
                                        style={{ backgroundColor: '#007bff' }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                जतन करत आहे...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-1"></i>
                                                <FaSave className='me-2' size={14} />
                                                वर्ष जतन करा
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary me-md-2"
                                        onClick={handleReset}
                                        disabled={isSubmitting}
                                    >
                                        <i className="fas fa-undo me-1"></i>
                                        <FaUndo size={14} className='me-2' />
                                        रीसेट
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center mt-3">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">लोड होत आहे...</span>
                            </div>
                        </div>
                    ) : yearList.length > 0 ? (
                        <div className="card mt-3 mb-5 shadow-sm border-0">
                            <div className="card-header text-white" style={{ backgroundColor: 'blue' }}>
                                <h5 className="mb-0">
                                    <i className="fas fa-table me-2"></i>
                                    <FaTable size={14} className='me-2' />
                                    जतन केलेली वर्षे
                                </h5>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover mb-0">
                                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                                            <tr>
                                                <th scope="col" className="px-4 py-3">
                                                    <FaHashtag size={14} className='me-2' />
                                                    अनुक्रमांक
                                                </th>
                                                <th scope="col" className="px-4 py-3">
                                                    शैक्षणिक वर्ष
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-center">
                                                    <FaCogs size={14} className='me-2' />
                                                    कृती
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {yearList.map((year, index) => (
                                                <tr key={year.id || index}>
                                                    <td className="px-4 py-3 align-middle">
                                                        <span className="badge bg-primary rounded-pill">
                                                            {index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 align-middle">
                                                        <span className="fw-semibold" style={{ color: '#0056b3', fontSize: '1.1rem' }}>
                                                            {year.year}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 align-middle text-center">
                                                        {/* <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDelete(year)}
                                                            title="हटवा"
                                                            disabled={isSubmitting}
                                                        >
                                                            <i className="fas fa-trash me-1"></i>
                                                            हटवा
                                                        </button> */}
                                                        <button
                                                            type='button'
                                                            className='btn btn-sm btn-outline-warning'
                                                            onClick={() => handleEdit(year)}
                                                            title='Update'
                                                            disabled={isSubmitting}
                                                        >
                                                            <Edit size={14} className='me-2' />
                                                            Update
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="card-footer bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            <i className="fas fa-info-circle me-1"></i>
                                            <FaInfoCircle size={14} className='me-2' />
                                            एकूण {yearList.length} वर्षे जतन केली आहेत
                                        </small>
                                        <small className="text-muted">
                                            <i className="fas fa-clock me-1"></i>
                                            <FaClock size={14} className='me-2' />
                                            अद्यतनित: {new Date().toLocaleDateString('mr-IN')}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-info mt-3">
                            <i className="fas fa-info-circle me-2"></i>
                            कोणतीही वर्षे जतन केलेली नाहीत
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default YearMaster;