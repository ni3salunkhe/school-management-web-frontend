import React, { useEffect, useState } from 'react';
import { BiUser, BiIdCard, BiEnvelope, BiPhone, BiLockAlt, BiBook, BiBriefcase } from 'react-icons/bi';
import '../styling/formstyle.css'
import apiService from '../services/api.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

function AddStaffMember() {
    const [formData, setFormData] = useState({
        fname: '',
        fathername: '',
        lname: '',
        username: '',
        email: '',
        mobile: '',
        password: '',
        standard: '',
        role: '',
        level: '',
    });
    const [errors, setErrors] = useState({});
    const [currentStaff, setCurrentStaff] = useState([]);
    const school = jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    const isEnglish = (text) => {
        // Allows English letters, numbers, and common special characters
        return /^[A-Za-z0-9_.!@#$%^&*]*$/.test(text);
    };

    useEffect(() => {
        apiService.getbyid("staff/getbyudise/", school).then((response) => {
            setCurrentStaff(response.data)
        })
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value.trim() });

        const newErrors = {};
        if (name === "email") {
            if (!value) {
                newErrors.email = 'ई-मेल प्रविष्ट करा';
            } else if (!/\S+@\S+\.\S+/.test(value)) {
                newErrors.email = "वैद्य ई-मेल प्रविष्ट करा";
            } else if (!isEnglish(value)) {
                newErrors.email = "कृपया केवळ इंग्रजी अक्षरे आणि संख्या प्रविष्ट करा";
            }
            else if (currentStaff.some(staff => staff.email === value.trim())) {
                newErrors.email = "हा ई-मेल आधीच वापरात आहे";
            }
        }

        // Mobile validation
        if (name === "mobile") {
            if (!value) {
                newErrors.mobile = 'मोबाईल नंबर प्रविष्ट करा';
            } else if (!/^[6-9]\d{9}$/.test(value)) {
                newErrors.mobile = 'वैध १० अंकी मोबाईल नंबर प्रविष्ट करा';
            }
            else if (currentStaff.some(staff => staff.mobile === value.trim())) {
                newErrors.mobile = "हा मोबाईल नंबर आधीच वापरात आहे";
            }
        }

        // Username validation
        if (name === "username") {
            if (!value.trim()) {
                newErrors.username = 'वापरकर्तानाव प्रविष्ट करा';
            } else if (!isEnglish(value.trim())) {
                newErrors.username = "कृपया केवळ इंग्रजी अक्षरे आणि संख्या प्रविष्ट करा";
            }
            else if (currentStaff.some(staff => staff.username === value.trim())) {
                newErrors.username = "हे वापरकर्तानाव आधीच वापरात आहे";
            }
        }

        // Password validation
        if (name === "password") {
            if (!value.trim()) {
                newErrors.password = 'पासवर्ड प्रविष्ट करा';
            } else if (!isEnglish(value.trim())) {
                newErrors.password = "कृपया केवळ इंग्रजी अक्षरे आणि संख्या प्रविष्ट करा";
            }
        }

        setErrors(newErrors)
    };

    const validateForm = () => {
        const newErrors = {}
        if (!formData.fname) {
            newErrors.fname = 'पहिले नाव प्रविष्ट करा '
        }
        if (!formData.fathername) {
            newErrors.fathername = 'वडीलांचे नाव प्रविष्ट करा '
        }
        if (!formData.lname) {
            newErrors.lname = 'आडनाव प्रविष्ट करा '
        }
        if (!formData.username) {
            newErrors.username = 'वापरकर्तानाव प्रविष्ट करा '
        }
        if (!formData.password) {
            newErrors.password = 'पासवर्ड प्रविष्ट करा '
        }
        if (!formData.email) {
            newErrors.email = 'ई-मेल प्रविष्ट करा '
        }
        if (!formData.mobile) {
            newErrors.mobile = 'मोबाईल नंबर प्रविष्ट करा '
        }
        if (!formData.standard) {
            newErrors.standard = 'शैक्षणिक माहिती प्रविष्ट करा '
        }
        if (!formData.role) {
            newErrors.role = 'भूमिका निवडा '
        }
        if (!formData.level) {
            newErrors.level = 'पातळी निवडा'
        }

        if (currentStaff.some(staff => staff.email === formData.email.trim())) {
            newErrors.email = "हा ई-मेल आधीच वापरात आहे";
        }
        if (currentStaff.some(staff => staff.mobile === formData.mobile.trim())) {
            newErrors.mobile = "हा मोबाईल नंबर आधीच वापरात आहे";
        }
        if (currentStaff.some(staff => staff.username === formData.username.trim())) {
            newErrors.username = "हे वापरकर्तानाव आधीच वापरात आहे";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        // TODO: Send formData to backend
        if (validateForm()) {
            const payload = { ...formData, school };
            console.log("Form submitted:", payload);
            apiService.postdata("staff/", payload).then((response) => {
                Swal.fire({
                    title: "माहिती यशस्वीपणे प्रणालीमध्ये समाविष्ट करण्यात आली आहे...!",
                    icon: "success",
                    draggable: true
                });
            
            })
            setFormData({
                fname: '',
                fathername: '',
                lname: '',
                username: '',
                email: '',
                mobile: '',
                password: '',
                standard: '',
                role: '',
                level: '',
            })
        }
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
                                            <input type="text" name="fname" className={`form-control form-control-sm ${errors.fname ? 'is-invalid' : ''}`}
                                                value={formData.fname} onChange={handleChange} placeholder='प्रथम नाव' />
                                            {errors.fname && <div className="invalid-feedback">
                                                {errors.fname}
                                            </div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold ">वडीलांचे नाव</label>
                                            <input type="text" name="fathername" className={`form-control form-control-sm ${errors.fathername ? 'is-invalid' : ''}`} value={formData.fathername} onChange={handleChange} placeholder='वडीलांचे नाव' />
                                            {errors.fathername && <div className="invalid-feedback">
                                                {errors.fathername}
                                            </div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">आडनाव</label>
                                            <input type="text" name="lname" className={`form-control form-control-sm ${errors.lname ? 'is-invalid' : ''}`} value={formData.lname} onChange={handleChange} placeholder='आडनाव' />
                                            {errors.lname && <div className="invalid-feedback">
                                                {errors.lname}
                                            </div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">मोबाईल नंबर</label>
                                            <input type="text" name="mobile" className={`form-control form-control-sm ${errors.mobile ? 'is-invalid' : ''}`} value={formData.mobile} onChange={handleChange} maxLength={10} placeholder='मोबाईल नंबर' />
                                            {errors.mobile && <div className="invalid-feedback">
                                                {errors.mobile}
                                            </div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">ई-मेल</label>
                                            <input type="email" name="email" className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`} value={formData.email} onChange={handleChange} placeholder='ई-मेल' />
                                            {errors.email && <div className="invalid-feedback">
                                                {errors.email}
                                            </div>}
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
                                            <input type="text" name="username" className={`form-control form-control-sm ${errors.username ? 'is-invalid' : ''}`} value={formData.username} onChange={handleChange} placeholder='username' />
                                            {errors.username && <div className="invalid-feedback">
                                                {errors.username}
                                            </div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">पासवर्ड / password</label>
                                            <input type="password" name="password" className={`form-control form-control-sm ${errors.password ? 'is-invalid' : ''}`} value={formData.password} onChange={handleChange} placeholder='password' />
                                            {errors.password && <div className="invalid-feedback">
                                                {errors.password}
                                            </div>}
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
                                            <label className="form-label fw-semibold">शिक्षण</label>
                                            <input type="text" name="standard" className={`form-control form-control-sm ${errors.standard ? 'is-invalid' : ''}`} value={formData.standard} onChange={handleChange} placeholder='--शिक्षण--' />
                                            {errors.standard && <div className="invalid-feedback">
                                                {errors.standard}
                                            </div>}
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
                                            <select name="role" className={`form-select ${errors.role ? 'is-invalid' : ''}`} value={formData.role} onChange={handleChange}>
                                                <option value="">-- निवडा --</option>
                                                <option value="TEACHER">शिक्षक</option>
                                                <option value="CLERK">लिपिक</option>
                                            </select>
                                            {errors.role && <div className="invalid-feedback">
                                                {errors.role}
                                            </div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">पातळी</label>
                                            <select name="level" className={`form-select ${errors.level ? 'is-invalid' : ''}`} value={formData.level} onChange={handleChange}>
                                                <option value="">-- निवडा --</option>
                                                <option value="PRIMARY">प्राथमिक</option>
                                                <option value="SECONDARY">माध्यमिक</option>
                                                <option value="HigherSecondary">उच्च माध्यमिक</option>
                                            </select>
                                            {errors.level && <div className="invalid-feedback">
                                                {errors.level}
                                            </div>}
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
