import React, { useState, useEffect } from 'react';
import apiService from '../services/api.service';
import { BiSearch } from 'react-icons/bi';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function LColdForm() {

    const { id } = useParams();
    const navigate = useNavigate();

    const udise = 12345678093;
    const [error, setError] = useState('');
    const [studentData, setStudentData] = useState('');
    const [formData, setFormData] = useState({
        reasonOfLeavingSchool: '',
        progress: '',
        behavior: '',
        dateOfLeavingSchool: '',
        remark: '',
        lcNumber: '',
        lcDate: '',
        otherRemark: '',
    });

    useEffect(() => {
        try {
            apiService.getbyid("student/", id).then((response) => {
                setStudentData(response.data);
                console.log(response.data);
            });
        } catch (err) {
            setError('विद्यार्थ्याची माहिती लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.');
        }
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        const payload = { ...formData, schoolUdise: udise, studentId: id };
        // You can send `payload` to backend here via POST if needed
        console.log('Form Payload:', payload);
        // alert("navigating");
        apiService.post("leavinginfo/", payload).then((response) => {
        })
        setFormData({
            reasonOfLeavingSchool: '',
            progress: '',
            behavior: '',
            dateOfLeavingSchool: '',
            remark: '',
            lcNumber: '',
            lcDate: '',
            otherRemark: '',
        })
        navigate(`/reports/download/${id}`);

    }

    if (error) {
        return (
            <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container py-3">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card shadow-sm border-0 rounded-3">
                            {/* Header */}
                            <div className="card-header bg-primary bg-gradient text-white p-3 text-center">
                                <h3 className="mb-0 fw-bold fs-4 heading-font">शाळा सोडल्याची दाखला माहिती </h3>
                            </div>

                            {/* Form Body */}
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit} className="fs-6">

                                    {/* ✅ Updated Name Section */}
                                    <div className="mb-4 p-3 bg-light border rounded text-center h3">
                                        <strong className="text-primary">नाव:</strong> {studentData.studentName} {studentData.fatherName} {studentData.surName}
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-md-12">
                                            <label className="form-label fw-semibold">शाळा सोडल्याचे कारण</label>
                                            <input type="text" name="reasonOfLeavingSchool" className="form-control" value={formData.reasonOfLeavingSchool} onChange={handleChange} placeholder="शाळा सोडल्याचे कारण" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">प्रगती</label>
                                            <input type="text" name="progress" className="form-control" value={formData.progress} onChange={handleChange} placeholder="प्रगती" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">वर्तन</label>
                                            <input type="text" name="behavior" className="form-control" value={formData.behavior} onChange={handleChange} placeholder="वर्तन" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">शेरा</label>
                                            <input type="text" name="remark" className="form-control" value={formData.remark} onChange={handleChange} placeholder="शेरा" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">शाळा सोडल्याची दिनांक</label>
                                            <input type="date" name="dateOfLeavingSchool" className="form-control" value={formData.dateOfLeavingSchool} onChange={handleChange} placeholder="शाळा सोडल्याची दिनांक" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">दाखला क्रमांक</label>
                                            <input type="text" name="lcNumber" className="form-control" value={formData.lcNumber} onChange={handleChange} placeholder="दाखला क्रमांक" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">दिनांक</label>
                                            <input type="date" name="lcDate" className="form-control" value={formData.lcDate} onChange={handleChange} placeholder="दिनांक" />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
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
        </>
    );
}

export default LColdForm;
