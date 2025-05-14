import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import Next from './Next';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function StateForm() {
    const [stateName, setStateName] = useState('');
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [allStates, setAllStates] = useState([]);
    const role=jwtDecode(sessionStorage.getItem('token'))?.role.toLowerCase()
    const navigate=useNavigate();
    function isOnlyMarathi(input) {
        const marathiRegex = /^[\u0900-\u097F\s]+$/;
        return marathiRegex.test(input);
    }

    useEffect(() => {
        apiService.getdata("state/")
            .then((response) => {
                setAllStates(response.data);
            })
            .catch((error) => {
                console.error("Error fetching states:", error);
            });
    }, []); 

    const handleChange = (e) => {
        const { value } = e.target;
        setStateName(value);

        const newError = {};
        // Clear previous error if user is typing
        if (errors.stateName) {
            setErrors(prev => ({ ...prev, stateName: null }));
        }
        const isDuplicate = allStates.some((item) =>
            item.stateName.trim().toLowerCase() === value.toLowerCase()
        );
        if (isDuplicate) {
            newError.stateName = "हे राज्य आधीच अस्तित्वात आहे.";
        }

        if (!isOnlyMarathi(value)) {
            newError.stateName = "कृपया केवळ मराठी भाषा वापरा. भाषा बदलण्यासाठी windows key + स्पेसबार दबा";
        }

        setErrors(newError);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedStateName = stateName.trim();
        let validationErrors = {};

        if (!trimmedStateName) {
            validationErrors.stateName = "राज्याचे नाव आवश्यक आहे.";
        } else {
            const isDuplicate = allStates.some((item) =>
                item.stateName.trim().toLowerCase() === trimmedStateName.toLowerCase()
            );
            if (isDuplicate) {
                validationErrors.stateName = "हे राज्य आधीच अस्तित्वात आहे.";
            }
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const result = await Swal.fire({
            title: 'राज्य जतन करायचे आहे का?',
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'जतन करा',
            denyButtonText: 'जतन करा आणि पुढे चला',
            cancelButtonText: 'रद्द करा'
        });
    
        if (result.isConfirmed || result.isDenied) {
            try {
                await apiService.postdata("state/", { stateName: trimmedStateName });
    
                await Swal.fire('यशस्वी!', 'राज्य जतन झाले.', 'success');
                setTimeout(() => setSubmitted(false), 1500);
                setSubmitted(true);
                setStateName('');
                setErrors({});
                // Refresh state list
                const response = await apiService.getdata("state/");
                setAllStates(response.data);
    
                if (result.isDenied) {
                    navigate('/developer/district');
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
                                <Next classname={'btn bg-danger text-white btn-sm'} path={`/${role}`} placeholder={'X'}></Next>
                            </div>
                            <h3 className="mb-0 fw-bold fs-4 heading-font">राज्य प्रविष्ट करा</h3>
                        </div>

                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit} className="fs-6">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">राज्य</label>
                                    <input
                                        type="text"
                                        name="stateName"
                                        className={`form-control form-control-sm ${errors.stateName ? 'is-invalid' : ''}`}
                                        value={stateName}
                                        onChange={handleChange}
                                        placeholder='उदा. महाराष्ट्र'
                                    />
                                    {errors.stateName && (
                                        <div className="invalid-feedback">
                                            {errors.stateName}
                                        </div>
                                    )}
                                </div>
                                <button type="submit" className="btn btn-success btn-sm">जतन करा</button>
                                {submitted && <div className="mt-3 text-success">राज्य यशस्वीरित्या जतन झाले!</div>}
                                {/* <Next classname={'btn px-4 py-1 btn-primary btn-sm float-end'} path={'/developer/district'} placeholder={'पुढे चला'}></Next> */}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StateForm;
