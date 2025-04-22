import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';


function AddClass() {
    const [formData, setFormData] = useState({
        lowerClass: '',
        upperClass: ''
    });

    const [divisionName, setDivisionName] = useState({ division: '' });
    const [classSaved, setClassSaved] = useState(false);
    const [allDivision, setAllDivision] = useState([]);
    const [errors, setErrors] = useState({});
    const udiseNo = 42534565235;

    useEffect(() => {
        // apiService.getdata("Division/")
        //     .then((response) => {
        //         console.log("Division fetched:", response.data);
        //         setAllDivision(response.data);
        //     })
        //     .catch((error) => {
        //         console.error("Error fetching divisions:", error);
        //     });
        apiService.getbyid("Division/getbyudise/",udiseNo).then((response)=>{
            setAllDivision(response.data);
            console.log(response.data);
        })
    }, []);
    

    // Handle input for lowerClass and upperClass
    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    // Handle input for division name
    function handlechangedivision(e) {
        const { name, value } = e.target;
        setDivisionName({ [name]: value });
    }

    // Submit class data with validation
    function handleSubmit(e) {
        e.preventDefault();

        const newErrors = {};
        if (!formData.lowerClass.trim()) {
            newErrors.lowerClass = true;
        }
        if (!formData.upperClass.trim()) {
            newErrors.upperClass = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        const payload = { ...formData, udiseNo };

        apiService.postdata("standardmaster/", payload).then((response) => {
            console.log("Form Submitted");
            setClassSaved(true);
            setFormData({
                lowerClass: '',
                upperClass: ''
            });
        });
    }

    // Submit division data with validation
    function handleAddDivision() {
        const trimmedName = divisionName.division.trim();

        if (!trimmedName) {
            setErrors({ division: true });
            return;
        }

        const divisionPayload = {
            divisionName: trimmedName,
            schoolUdiseNo: udiseNo
        };

        const exists = allDivision.some(
            (item) =>
              item.schoolUdiseNo === udiseNo &&
              item.divisionName.toLowerCase() === trimmedName.toLowerCase()
          );

        if (exists) {
            alert("तुकडी आधीच अस्तित्वात आहे");
            setErrors({ division: true });
            setDivisionName({ division: '' });
            return;
        }

        setErrors({});
        apiService.postdata("Division/", divisionPayload).then((response) => {
            console.log("Division Submitted");
            setAllDivision(prev => [...prev, divisionPayload]);
            setDivisionName({ division: '' });
        });
    }

    return (
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-3">
                       
                        <div className="card-header bg-primary bg-gradient text-white p-3 text-center">
                            <h3 className="mb-0 fw-bold fs-4 heading-font">इयत्ता नोंदणी</h3>
                        </div>

                        
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit} className="fs-6">
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">कनिष्ठ इयत्ता</label>
                                    <input
                                        type="text"
                                        name="lowerClass"
                                        className={`form-control ${errors.lowerClass ? 'is-invalid' : ''}`}
                                        value={formData.lowerClass}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">उच्च इयत्ता</label>
                                    <input
                                        type="text"
                                        name="upperClass"
                                        className={`form-control ${errors.upperClass ? 'is-invalid' : ''}`}
                                        value={formData.upperClass}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="text-center mt-4">
                                    <button type="submit" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
                                        जतन करा
                                    </button>
                                </div>
                            </form>

                           
                            {classSaved && (
                                <>
                                    <hr />
                                    <h5 className="fw-semibold mt-4">तुकडी जोडा</h5>
                                    <div className="d-flex gap-2 align-items-center">
                                        <input
                                            type="text"
                                            className={`form-control ${errors.division ? 'is-invalid' : ''}`}
                                            name="division"
                                            value={divisionName.division}
                                            onChange={handlechangedivision}
                                            placeholder="उदा. A, B, C"
                                        />
                                        <button className="btn btn-success" onClick={handleAddDivision}>
                                            जोडा
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddClass;
