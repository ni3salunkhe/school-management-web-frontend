import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import Next from './Next';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


function DistrictForm() {
    const role=jwtDecode(sessionStorage.getItem('token'))?.role
    const [formData, setFormData] = useState({
        districtName: '',
        stateid: ''
    });

    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [allStates, setAllStates] = useState([]);
    const [districtData, setDistrictData] = useState([]);
    const navigate = useNavigate();
    function isOnlyMarathi(input) {
        const marathiRegex = /^[\u0900-\u097F\s]+$/;
        return marathiRegex.test(input);
    }

    useEffect(() => {
        apiService.getdata("state/").then((response) => {
            setAllStates(response.data);
        }).catch((error) => {
            console.error("Error loading states:", error);
        });
        apiService.getdata("district/").then((response) => {
            setDistrictData(response.data);
        })
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
        const newError = {}
        const isDuplicate = districtData.some((item) =>
            item.districtName.trim() === value
        );
        if (isDuplicate) {
            newError.districtName = "हे राज्य आधीच अस्तित्वात आहे.";
        }
        if (name === "districtName") {
            if (!isOnlyMarathi(value)) {
                newError.districtName = "कृपया केवळ मराठी भाषा वापरा. भाषा बदलण्यासाठी windows key + स्पेसबार दबा";
            }
        }

        setErrors(newError)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = {};

        // Validate the district name
        if (!formData.districtName.trim()) {
            validationErrors.districtName = "जिल्ह्याचे नाव आवश्यक आहे.";
        }

        // Validate the state selection
        if (!formData.stateid) {
            validationErrors.stateid = "राज्य निवडणे आवश्यक आहे.";
        }

        // Check for duplicate district name
        const isDuplicate = districtData.some((item) =>
            item.districtName.trim() === formData.districtName.trim()
        );

        if (isDuplicate) {
            validationErrors.districtName = "हा जिल्हा आधीच अस्तित्वात आहे.";
        }

        // If there are any validation errors, set them and stop submission
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Proceed to submit the data if there are no errors

        const result = await Swal.fire({
            title: 'जिल्हा जतन करायचे आहे का?',
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'जतन करा',
            denyButtonText: 'जतन करा आणि पुढे चला',
            cancelButtonText: 'रद्द करा'
        });

        if (result.isConfirmed || result.isDenied) {
            try {
                await apiService.postdata("district/", formData);

                await Swal.fire('यशस्वी!', 'जिल्हा जतन झाले.', 'success');
                setTimeout(() => setSubmitted(false), 1500);
                setSubmitted(true);
                setFormData({ districtName: '', stateid: '' });
                setErrors({});
                // Refresh state list
                const response = await apiService.getdata("state/");
                setAllStates(response.data);

                if (result.isDenied) {
                    navigate('/developer/tehsil');
                }

            } catch (error) {
                console.error("Error:", error);
                Swal.fire('त्रुटी!', 'डेटा जतन करण्यात अडचण आली.', 'error');
            }
        }
    };


    return (
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-header bg-primary bg-gradient text-white p-3 text-center position-relative">
                            <div className="position-absolute top-0 end-0 m-2">
                                <Next classname={'btn bg-danger text-white btn-sm'} path={`/${role}/state`} placeholder={'X'}></Next>
                            </div>
                            <h3 className="mb-0 fw-bold fs-4 heading-font">जिल्हा प्रविष्ट करा</h3>
                        </div>

                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit} className="fs-6">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">जिल्हा</label>
                                    <input
                                        type="text"
                                        name="districtName"
                                        className={`form-control form-control-sm ${errors.districtName ? 'is-invalid' : ''}`}
                                        value={formData.districtName}
                                        onChange={handleChange}
                                        placeholder='उदा. पुणे'
                                    />
                                    {errors.districtName && (
                                        <div className="invalid-feedback">
                                            {errors.districtName}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="stateid" className="form-label fw-semibold small">राज्य</label>
                                    <select
                                        className={`form-select form-select-sm ${errors.stateid ? 'is-invalid' : ''}`}
                                        name="stateid"
                                        id="stateid"
                                        value={formData.stateid}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- राज्य निवडा --</option>
                                        {allStates.map(state => (
                                            <option key={state.id} value={state.id}>{state.stateName}</option>
                                        ))}
                                    </select>
                                    {errors.stateid && (
                                        <div className="invalid-feedback">
                                            {errors.stateid}
                                        </div>
                                    )}
                                </div>

                                <button type="submit" className="btn btn-success btn-sm">जतन करा</button>
                                {submitted && <div className="mt-3 text-success">जिल्हा यशस्वीरित्या जतन झाला!</div>}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DistrictForm;
