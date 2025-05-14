import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import Next from './Next';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


function TehsilForm() {
    const role=jwtDecode(sessionStorage.getItem('token'))?.role.toLowerCase()
    const [allDistricts, setAllDistricts] = useState([]);
    const [formData, setFormData] = useState({
        tehsilName: '',
        district: ''
    });
    const [tehsils, setTehsils] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    function isOnlyMarathi(input) {
        const marathiRegex = /^[\u0900-\u097F\s]+$/;
        return marathiRegex.test(input);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [districtsResponse, tehsilsResponse] = await Promise.all([
                    apiService.getdata("district/"),
                    apiService.getdata("tehsil/")
                ]);
                setAllDistricts(districtsResponse.data);
                setTehsils(tehsilsResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for the field being changed
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Check for duplicate tehsil name only if the field is tehsilName
        if (name === 'tehsilName') {
            const trimmedValue = value.trim();
            const isDuplicate = tehsils.some(item =>
                item.tehsilName.trim().toLowerCase() === trimmedValue.toLowerCase()
            );

            if (isDuplicate) {
                setErrors(prev => ({ ...prev, tehsilName: "हा तालुका आधीच अस्तित्वात आहे." }));
            }
            if (!isOnlyMarathi(value)) {
                setErrors(prev => ({ ...prev, tehsilName: "कृपया केवळ मराठी भाषा वापरा. भाषा बदलण्यासाठी windows key + स्पेसबार दबा" }));
            }
        }

    }

    function validate() {
        const newErrors = {};
        const trimmedTehsilName = formData.tehsilName.trim();

        if (!trimmedTehsilName) {
            newErrors.tehsilName = "तालुक्याचे नाव आवश्यक आहे";
        } else if (trimmedTehsilName.length < 2) {
            newErrors.tehsilName = "तालुक्याचे नाव किमान २ अक्षरे असावे";
        }

        if (!formData.district) {
            newErrors.district = "जिल्हा निवडा";
        }

        const isDuplicate = tehsils.some(item =>
            item.tehsilName.trim() === trimmedTehsilName
        );

        if (isDuplicate) {
            newErrors.tehsilName = "हा तालुका आधीच अस्तित्वात आहे."
        }

        return newErrors;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const trimmedFormData = {
            ...formData,
            tehsilName: formData.tehsilName.trim()
        };

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }


        const result = await Swal.fire({
            title: 'तालुका जतन करायचे आहे का?',
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'जतन करा',
            denyButtonText: 'जतन करा आणि पुढे चला',
            cancelButtonText: 'रद्द करा'
        });

        if (result.isConfirmed || result.isDenied) {
            try {
                setIsLoading(true);
                await apiService.postdata("tehsil/", trimmedFormData);

                const response1 = await apiService.getdata("tehsil/");
                setTehsils(response1.data);

                setSubmitted(true);
                setFormData({ tehsilName: '', district: '' });
                setTimeout(() => setSubmitted(false), 1500);
                await Swal.fire('यशस्वी!', 'तालुका जतन झाले.', 'success');
                setTimeout(() => setSubmitted(false), 1500);
                setSubmitted(true);
                setFormData({ districtName: '', stateid: '' });
                setErrors({});
                // Refresh state list
                const response = await apiService.getdata("district/");
                setAllDistricts(response.data);

                if (result.isDenied) {
                    navigate('/developer/village');
                }

            } catch (error) {
                console.error("Error:", error);
                Swal.fire('त्रुटी!', 'डेटा जतन करण्यात अडचण आली.', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    }

    return (
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-header bg-primary bg-gradient text-white p-3 text-center position-relative">
                            <div className="position-absolute top-0 end-0 m-2">
                                <Next classname={'btn bg-danger text-white btn-sm'} path={`/${role}/state`} placeholder={'X'}></Next>
                            </div>
                            <h3 className="mb-0 fw-bold fs-4 heading-font">तालुका प्रविष्ट करा</h3>
                        </div>

                        <div className="card-body p-4">
                            {errors.submit && (
                                <div className="alert alert-danger">{errors.submit}</div>
                            )}

                            <form onSubmit={handleSubmit} className="fs-6">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">तालुक्याचे नाव</label>
                                    <input
                                        type="text"
                                        name="tehsilName"
                                        className={`form-control form-control-sm ${errors.tehsilName ? 'is-invalid' : ''}`}
                                        value={formData.tehsilName}
                                        onChange={handleChange}
                                        placeholder='उदा. जुन्नर'
                                        disabled={isLoading}
                                    />
                                    {errors.tehsilName && (
                                        <div className="invalid-feedback">{errors.tehsilName}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="district" className="form-label fw-semibold">जिल्हा</label>
                                    <select
                                        name="district"
                                        className={`form-select form-select-sm ${errors.district ? 'is-invalid' : ''}`}
                                        value={formData.district}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    >
                                        <option value="">-- जिल्हा निवडा --</option>
                                        {allDistricts.map(d => (
                                            <option key={d.id} value={d.id}>{d.districtName}</option>
                                        ))}
                                    </select>
                                    {errors.district && (
                                        <div className="invalid-feedback">{errors.district}</div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success btn-sm"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'प्रक्रिया करत आहे...' : 'जतन करा'}
                                </button>

                                {submitted && !isLoading && (
                                    <div className="mt-3 text-success">तालुका यशस्वीरित्या जतन झाला!</div>
                                )}
                                {/* <Next classname={'btn px-4 py-1 btn-primary btn-sm float-end'} path={'/developer/village'} placeholder={'पुढे चला'}></Next> */}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TehsilForm;