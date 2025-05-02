import React, { useEffect, useState } from 'react'
import apiService from '../services/api.service'
import Next from './Next';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function VillageOrCityForm() {
    const [formData, setFormData] = useState({
        villageName: '',
        tehsilid: ''
    });
    const [tehsils, setTehsil] = useState([]);
    const [village, setVillage] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        apiService.getdata("tehsil/").then((response) => {
            setTehsil(response.data);
        });
        apiService.getdata("village/").then((response) => {
            setVillage(response.data);
        });
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));

        // गाव नाव duplicate आहे का ते तपासा
        if (name === 'villageName') {
            const isDuplicate = village.some(
                (item) => item.villageName.trim() === value.trim()
            );
            if (isDuplicate) {
                setErrors((prev) => ({
                    ...prev,
                    villageName: "हे गाव/शहर आधीच अस्तित्वात आहे."
                }));
            }
        }
    }

    function validate() {
        const newErrors = {};
        if (!formData.villageName.trim()) newErrors.villageName = "गावाचे/शहराचे नाव आवश्यक आहे.";
        if (!formData.tehsilid) newErrors.tehsilid = "तालुका निवडा.";
        const isDuplicate = village.some(
            (item) => item.villageName.trim() === formData.villageName.trim()
        );
        if (isDuplicate) {
            // setErrors((prev) => ({
            //     ...prev,
            //     villageName: "हे गाव/शहर आधीच अस्तित्वात आहे."
            // }));
            newErrors.villageName = "हे गाव/शहर आधीच अस्तित्वात आहे."
        }
        return newErrors;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedFormData = {
            ...formData,
            villageName: formData.villageName.trim()
        };

        const validationErrors = validate(trimmedFormData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const result = await Swal.fire({
            title: 'गाव/शहर जतन करायचे आहे का?',
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

                apiService.postdata("village/", trimmedFormData)

                const response1 = await apiService.getdata("village/");
                setVillage(response1.data);

                setSubmitted(true);
                setFormData({ tehsilName: '', district: '' });
                setTimeout(() => setSubmitted(false), 1500);
                await Swal.fire('यशस्वी!', 'गाव/शहर जतन झाले.', 'success');
                setTimeout(() => setSubmitted(false), 1500);
                setSubmitted(true);
                setFormData({ villageName: '', tehsilid: '' });
                setErrors({});
                // Refresh state list
                const response = await apiService.getdata("tehsil/");
                setTehsil(response.data);

                if (result.isDenied) {
                    navigate('/developer/state');
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
                                <Next classname={'btn bg-danger text-white btn-sm'} path={'/developer/state'} placeholder={'X'}></Next>
                            </div>
                            <h3 className="mb-0 fw-bold fs-4 heading-font">गाव किंवा शहर प्रविष्ट करा</h3>
                        </div>

                        <div className="card-body p-4">
                            {errors.submit && (
                                <div className="alert alert-danger">{errors.submit}</div>
                            )}

                            <form onSubmit={handleSubmit} className="fs-6">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">शहराचे नाव / गावाचे नाव </label>
                                    <input
                                        type="text"
                                        name="villageName"
                                        className={`form-control form-control-sm ${errors.villageName ? 'is-invalid' : ''}`}
                                        value={formData.villageName}
                                        onChange={handleChange}
                                        placeholder='उदा. कोल्हापूर'
                                        disabled={isLoading}
                                    />
                                    {errors.villageName && (
                                        <div className="invalid-feedback">{errors.villageName}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="tehsilid" className="form-label fw-semibold">तालुका</label>
                                    <select
                                        name="tehsilid"
                                        className={`form-select form-select-sm ${errors.tehsilid ? 'is-invalid' : ''}`}
                                        value={formData.tehsilid}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    >
                                        <option value="">-- तालुका निवडा --</option>
                                        {tehsils.map((tehsil) => (
                                            <option key={tehsil.id} value={tehsil.id}>
                                                {tehsil.tehsilName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.tehsilid && (
                                        <div className="invalid-feedback">{errors.tehsilid}</div>
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
                                    <div className="mt-3 text-success">गाव/शहर यशस्वीरित्या जतन झाले!</div>
                                )}
                                {/* <Next classname={'btn px-4 py-1 btn-primary btn-sm float-end'} path={'/developer/state'} placeholder={'पुढे चला'}></Next> */}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VillageOrCityForm;
