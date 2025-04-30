import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import { jwtDecode } from 'jwt-decode';

function AddClass() {
    const [formData, setFormData] = useState({
        lowerClass: '',
        upperClass: ''
    });

    const [divisionName, setDivisionName] = useState({ division: '' });
    const [classSaved, setClassSaved] = useState(false);
    const [allDivision, setAllDivision] = useState([]);
    const [errors, setErrors] = useState({});
    const [schools, setSchools] = useState([]);
    const [isShows, setIsShows] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const udiseNo = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

    const isEnglish = (text) => {
        return /^[A-Za-z0-9_,\s-]*$/.test(text);
    };

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            apiService.getbyid("Division/getbyudise/", udiseNo),
            apiService.getbyid("standardmaster/getbyudise/", udiseNo)
        ])
            .then(([divisionsRes, standardsRes]) => {
                setAllDivision(divisionsRes.data);
                setSchools(standardsRes.data);
                setIsShows(standardsRes.data.length === 0);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [udiseNo]);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        const newErrors = { ...errors };
        if (name === "lowerClass") {
            if (!/^[0-9]*$/.test(value)) {
                newErrors.lowerClass = 'कृपया इंग्रजी नंबर प्रविष्ट करा';
            } else {
                delete newErrors.lowerClass;
            }
        }

        if (name === "upperClass") {
            if (!/^[0-9]*$/.test(value)) {
                newErrors.upperClass = 'कृपया इंग्रजी नंबर प्रविष्ट करा';
            } else {
                delete newErrors.upperClass;
            }
        }

        setErrors(newErrors);
    }

    function handlechangedivision(e) {
        const { name, value } = e.target;
        setDivisionName(prev => ({ ...prev, [name]: value }));

        const newErrors = { ...errors };
        if (name === "division") {
            if (!isEnglish(value)) {
                newErrors.division = "कृपया फक्त इंग्रजी अक्षरे, अंक, स्वल्पविराम किंवा रिकाम्या जागा वापरा";
            } else {
                delete newErrors.division;
            }
        }

        setErrors(newErrors);
    }

    function validateClassForm() {
        const newErrors = {};
        if (!formData.lowerClass.trim()) {
            newErrors.lowerClass = 'कनिष्ठ इयत्ता आवश्यक आहे';
        } else if (!/^[0-9]+$/.test(formData.lowerClass)) {
            newErrors.lowerClass = 'कृपया वैध संख्या प्रविष्ट करा';
        }

        if (!formData.upperClass.trim()) {
            newErrors.upperClass = 'उच्च इयत्ता आवश्यक आहे';
        } else if (!/^[0-9]+$/.test(formData.upperClass)) {
            newErrors.upperClass = 'कृपया वैध संख्या प्रविष्ट करा';
        } else if (parseInt(formData.upperClass) <= parseInt(formData.lowerClass)) {
            newErrors.upperClass = 'उच्च इयत्ता कनिष्ठ इयत्तेपेक्षा जास्त असणे आवश्यक आहे';
        }

        return newErrors;
    }

    function handleSubmit(e) {
        e.preventDefault();
        const validationErrors = validateClassForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        const payload = { ...formData, udiseNo };
        apiService.postdata("standardmaster/", payload)
            .then(() => {
                setClassSaved(true);
                setFormData({ lowerClass: '', upperClass: '' });
            })
            .catch(error => {
                console.error("Error saving class:", error);
                alert("इयत्ता जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    function validateDivisionForm() {
        const newErrors = {};
        if (!divisionName.division.trim()) {
            newErrors.division = 'कृपया तुकड्या प्रविष्ट करा';
        } else if (!isEnglish(divisionName.division)) {
            newErrors.division = 'कृपया फक्त इंग्रजी अक्षरे, अंक, स्वल्पविराम किंवा रिकाम्या जागा वापरा';
        }
        return newErrors;
    }

    function handleAddDivision() {
        const validationErrors = validateDivisionForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const divisionArray = divisionName.division
            .split(",")
            .map(item => item.trim().toUpperCase())
            .filter(item => item.length > 0);

        if (divisionArray.length === 0) {
            setErrors({ division: 'कृपया किमान एक वैध तुकडी प्रविष्ट करा' });
            return;
        }

        setIsLoading(true);
        const divisionPayload = {
            divisionName: divisionArray,
            schoolUdiseNo: udiseNo
        };

        apiService.postdata("Division/", divisionPayload)
            .then(() => {
                alert("तुकड्या यशस्वीरीत्या नोंद केल्या गेल्या आहेत");
                setDivisionName({ division: '' });
                return apiService.getbyid("Division/getbyudise/", udiseNo);
            })
            .then(response => {
                setAllDivision(response.data);
            })
            .catch(error => {
                console.error("Error adding divisions:", error);
                alert("तुकड्या जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">लोड होत आहे...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {isShows ? (
                <div className="container py-3">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0 rounded-3">
                                <div className="card-header bg-primary bg-gradient text-white p-3 text-center">
                                    <h3 className="mb-0 fw-bold fs-4 heading-font">इयत्ता नोंदणी</h3>
                                </div>

                                <div className="card-body p-4">
                                    <form onSubmit={handleSubmit} className="fs-6">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-semibold">कनिष्ठ इयत्ता</label>
                                                <input
                                                    type="text"
                                                    name="lowerClass"
                                                    className={`form-control ${errors.lowerClass ? 'is-invalid' : ''}`}
                                                    value={formData.lowerClass}
                                                    placeholder='उदा. पहिली साठी 1'
                                                    onChange={handleChange}
                                                    maxLength="2"
                                                />
                                                {errors.lowerClass && (
                                                    <div className="invalid-feedback">
                                                        {errors.lowerClass}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label fw-semibold">उच्च इयत्ता</label>
                                                <input
                                                    type="text"
                                                    name="upperClass"
                                                    className={`form-control ${errors.upperClass ? 'is-invalid' : ''}`}
                                                    value={formData.upperClass}
                                                    onChange={handleChange}
                                                    placeholder='उदा. दहावी साठी 10'
                                                    maxLength="2"
                                                />
                                                {errors.upperClass && (
                                                    <div className="invalid-feedback">
                                                        {errors.upperClass}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-center mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-primary px-4 py-2 rounded-pill shadow-sm"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'प्रक्रिया करत आहे...' : 'जतन करा'}
                                            </button>
                                        </div>
                                    </form>

                                    {classSaved && (
                                        <div className="mt-4">
                                            <hr />
                                            <h6 className="fw-semibold mb-3">तुमच्या शाळेत असणाऱ्या जास्तीत जास्त तुकड्या नोंद करा</h6>
                                            <div>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <div className="flex-grow-1">
                                                        <input
                                                            type="text"
                                                            className={`form-control ${errors.division ? 'is-invalid' : ''}`}
                                                            name="division"
                                                            value={divisionName.division}
                                                            onChange={handlechangedivision}
                                                            placeholder="उदा. A, B, C, D"
                                                        />
                                                        {errors.division && (
                                                            <div className="invalid-feedback">
                                                                {errors.division}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={handleAddDivision}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? 'जोडत आहे...' : 'जोडा'}
                                                    </button>
                                                </div>
                                                <small className="text-muted">एकापेक्षा जास्त तुकड्या स्वल्पविरामाने विभक्त करा</small>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container py-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card shadow-sm border-0 rounded-3">
                                <div className="card-header bg-primary bg-gradient text-white p-3 text-center">
                                    <h3 className="mb-0 fw-bold fs-4 heading-font">शाळेतील इयत्ता</h3>
                                </div>
                                <div className="card-body p-4">
                                    <div className="row row-cols-1 row-cols-md-3 g-4">
                                        {schools.map((item, index) => (
                                            <div className="col" key={index}>
                                                <div className="card h-100 border-primary">
                                                    <div className="card-body text-center">
                                                        <h2 className="card-title display-1 text-primary">
                                                            {item.standard}
                                                        </h2>
                                                        <p className="card-text text-muted">
                                                            इयत्ता {item.standard}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center mt-4">
                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={() => setIsShows(true)}
                                        >
                                            नवीन इयत्ता जोडा
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AddClass;