import React, { useState } from 'react';
import { BiUser, BiIdCard, BiEnvelope, BiPhone, BiLockAlt, BiBook, BiBriefcase } from 'react-icons/bi';
import '../styling/formstyle.css'
import apiService from '../services/api.service';

function AddStaffMember() {
    const [formData, setFormData] = useState({
        fname: '',
        fathername:'',
        lname: '',
        username: '',
        email: '',
        mobile: '',
        password: '',
        standard: '',
        role: '',
        level: '',
    });

    const school = 42534565235;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value.trim() });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        // TODO: Send formData to backend
        const payload = { ...formData, school };
        console.log("Form submitted:", payload);
        apiService.postdata("staff/", payload).then((response) => {
            alert("Data Added Successfully");
        })
        setFormData({
            fname: '',
            fathername:'',
            lname: '',
            username: '',
            email: '',
            mobile: '',
            password: '',
            standard: '',
            role: '',
            level: '',
        })
    };

    return (
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="card shadow-sm border-0 rounded-3">
                        {/* Header */}
                        <div className="card-header bg-primary bg-gradient text-white p-3 text-center">
                            <h3 className="mb-0 fw-bold fs-4 heading-font">कर्मचारी नोंदणी</h3>
                        </div>

                        {/* Form Body */}
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit} className="fs-6">
                                {/* Section 1: मूलभूत माहिती */}
                                <div className="mb-4 bg-light p-3 rounded">
                                    <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                        <BiUser className="me-2" />
                                        मूलभूत माहिती
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold ">प्रथम नाव</label>
                                            <input type="text" name="fname" className="form-control" value={formData.fname} onChange={handleChange} placeholder='प्रथम नाव' />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold ">वडीलांचे नाव</label>
                                            <input type="text" name="fathername" className="form-control" value={formData.fathername} onChange={handleChange}  placeholder='वडीलांचे नाव'/>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">आडनाव</label>
                                            <input type="text" name="lname" className="form-control" value={formData.lname} onChange={handleChange} placeholder='आडनाव'/>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">मोबाईल नंबर</label>
                                            <input type="text" name="mobile" className="form-control" value={formData.mobile} onChange={handleChange} maxLength={10} placeholder='मोबाईल नंबर' />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">ई-मेल</label>
                                            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} placeholder='ई-मेल'/>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: लॉगिन माहिती */}
                                <div className="mb-4 bg-light p-3 rounded">
                                    <h5 className="border-bottom pb-2 mb-3 fw-bold">
                                        <BiIdCard className="me-2" />
                                        लॉगिन माहिती
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">वापरकर्तानाव / username</label>
                                            <input type="text" name="username" className="form-control" value={formData.username} onChange={handleChange} placeholder='username' />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">पासवर्ड / password</label>
                                            <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} placeholder='password'/>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: शैक्षणिक माहिती */}
                                <div className="mb-4 bg-light p-3 rounded">
                                    <h5 className="border-bottom pb-2 mb-3 fw-bold">
                                        <BiBook className="me-2" />
                                        शैक्षणिक माहिती
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">इयत्ता</label>
                                            <input type="text" name="standard" className="form-control" value={formData.standard} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: भूमिका व पातळी */}
                                <div className="mb-4 bg-light p-3 rounded">
                                    <h5 className="border-bottom pb-2 mb-3 fw-bold">
                                        <BiBriefcase className="me-2" />
                                        भूमिका व पातळी
                                    </h5>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">भूमिका</label>
                                            <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                                                <option value="">-- निवडा --</option>
                                                <option value="TEACHER">शिक्षक</option>
                                                <option value="CLERK">लिपिक</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">पातळी</label>
                                            <select name="level" className="form-select" value={formData.level} onChange={handleChange}>
                                                <option value="">-- निवडा --</option>
                                                <option value="PRIMARY">प्राथमिक</option>
                                                <option value="SECONDARY">माध्यमिक</option>
                                                <option value="HigherSecondary">उच्च माध्यमिक</option>
                                            </select>
                                        </div>
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
    );
}

export default AddStaffMember;
