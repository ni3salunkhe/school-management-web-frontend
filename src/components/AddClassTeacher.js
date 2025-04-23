import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import { jwtDecode } from 'jwt-decode';

function AddClassTeacher() {

    const [formData, setFormData] = useState({
        division: '',
        staff: '',
        standardMaster: ''
    });

    const [divisions, setDivisions] = useState([]);
    const [standards, setStandards] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classteacherdata, setClassTeacherData] = useState([]);
    const [warningMessage, setWarningMessage] = useState('');
    const schoolUdiseNo = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

    useEffect(() => {

        apiService.getbyid("Division/getbyudise/",schoolUdiseNo).then((response)=>{
            setDivisions(response.data);
        })
        apiService.getbyid("standardmaster/getbyudise/",schoolUdiseNo).then((response)=>setStandards(response.data))

        apiService.getbyid("staff/getbyudise/",schoolUdiseNo).then((response)=>{
            setTeachers(response.data);
        })
        apiService.getbyid("classteacher/getbyudise/",schoolUdiseNo).then((response)=>{
            console.log(response.data);
            setClassTeacherData(response.data);
        })
    }, []);

    // console.log(divisions);
    // console.log(standards);
    // console.log(teachers);
    // console.log(divisions);
    
    // console.log(classteacherdata);


    // Handle input changes for each field
    function handleChange(event) {
        const { name, value } = event.target;
        if (name === 'staff') {
            const isAssigned = classteacherdata.some(
                (item) => item.staff.id.toString() === value
            );

            if (isAssigned) {
                setWarningMessage("हा शिक्षक आधीच एका वर्गासाठी नियुक्त आहे.");
            } else {
                setWarningMessage('');
            }
        }
        setFormData({
            ...formData,
            [name]: value
        });
    }

    // Handle form submission
    function handleSubmit(event) {
        event.preventDefault();

        const payload = { ...formData, schoolUdiseNo }
        console.log("Form Data Submitted:", payload);
        apiService.postdata("classteacher/", payload).then((response) => {
            alert("data submitted");
        })
        setFormData({
            division: '',
            staff: '',
            standardMaster: ''
        })
        // You can send the formData to the server here
    }

    return (
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-header bg-primary bg-gradient text-white p-3 text-center">
                            <h3 className="mb-0 fw-bold fs-4 heading-font">वर्गशिक्षक नियुक्ती</h3>
                        </div>

                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit} className="fs-6">
                                {/* Division Select */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">तुकडी</label>
                                    <select
                                        className="form-select form-select-sm"
                                        name="division"
                                        value={formData.division}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- तुकडी निवडा --</option>
                                        {divisions.map(division => (
                                            <option key={division.id} value={division.id}>
                                                {division.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Staff Select */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">शिक्षक</label>
                                    <select
                                        className="form-select form-select-sm"
                                        name="staff"
                                        value={formData.staff}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- शिक्षक निवडा --</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.fname}
                                            </option>
                                        ))}
                                    </select>
                                    {warningMessage && (
                                        <div className="form-text text-danger mt-1">
                                            {warningMessage}
                                        </div>
                                    )}
                                </div>

                                {/* Standard Select */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">इयत्ता</label>
                                    <select
                                        className="form-select form-select-sm"
                                        name="standardMaster"
                                        value={formData.standardMaster}
                                        onChange={handleChange}
                                    >
                                        <option value="">-- इयत्ता निवडा --</option>
                                        {standards.map(standard => (
                                            <option key={standard.id} value={standard.id}>
                                                {standard.standard}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="text-center mt-4">
                                    <button type="submit" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
                                        जतन करा
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddClassTeacher;
