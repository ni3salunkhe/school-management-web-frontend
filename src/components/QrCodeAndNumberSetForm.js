import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

function base64ToFile(base64Data, fileName, mimeType = "image/jpeg") {
    const byteString = atob(base64Data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
}


function QrCodeAndNumberSetForm() {
    const [formData, setFormData] = useState({
        phoneNumber: '',
        qrCodeFile: null
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [qrPreview, setQrPreview] = useState(null);

    const username = jwtDecode(sessionStorage.getItem('token'))?.username;

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await apiService.getdata(`developer/${username}`);
            

            let qrFile = null;
            if (data.qrCode) {
                qrFile = base64ToFile(data.qrCode, "qr_code_from_db.jpg", "image/jpeg");
                setQrPreview(`data:image/jpeg;base64,${data.qrCode}`);
            }

            setFormData({
                phoneNumber: data.phone,
                qrCodeFile: qrFile
            });
        };

        fetchData();
    }, []);



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    qrCodeFile: 'Please select a valid image file'
                }));
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    qrCodeFile: 'File size must be less than 5MB'
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                qrCodeFile: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setQrPreview(e.target.result);
            };
            reader.readAsDataURL(file);

            // Clear error
            setErrors(prev => ({
                ...prev,
                qrCodeFile: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Phone number validation
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
        }

        // QR code validation
        if (!formData.qrCodeFile) {
            newErrors.qrCodeFile = 'QR code image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Simulate API call
            //   await new Promise(resolve => setTimeout(resolve, 2000));
            const formPayload = new FormData();
            const developer = {
                phone: formData.phoneNumber,
            };

            formPayload.append(
                "developer",
                new Blob([JSON.stringify(developer)], { type: "application/json" })
            );
            formPayload.append("qrCode", formData.qrCodeFile);

            await apiService.put(`developer/${username}`, formPayload);


            // Success feedback
            // alert('Information updated successfully!');

            Swal.fire({
                icon: "success",
                title: "Your work has been saved",
                showConfirmButton: false,
                timer: 1500
            })

            // Reset form
            setFormData({
                phoneNumber: '',
                qrCodeFile: null
            });
            setQrPreview(null);

        } catch (error) {
            // alert('Error updating information. Please try again.');
            Swal.fire({
                icon: "success",
                title: "Error updating information. Please try again.",
                showConfirmButton: false,
                timer: 1500
            })
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeQrCode = () => {
        setFormData(prev => ({
            ...prev,
            qrCodeFile: null
        }));
        setQrPreview(null);
    };

    return (
        <div className=" d-flex mt-5 mb-5 align-items-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-xl-6">
                        <div className="card shadow-lg border-0" style={{
                            borderRadius: '20px',
                            backdropFilter: 'blur(10px)',
                            background: 'rgba(255, 255, 255, 0.95)'
                        }}>
                            <div className="card-body p-5 ">
                                {/* Header */}
                                <div className="text-center mb-5">
                                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-gradient rounded-circle mb-3"
                                        style={{ width: '80px', height: '80px' }}>
                                        <i className="fas fa-qrcode text-white" style={{ fontSize: '2rem' }}></i>
                                    </div>
                                    <h2 className="fw-bold text-dark mb-2">Update Information</h2>
                                    <p className="text-muted">Update your phone number and QR code for subscription alert page</p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Phone Number Input */}
                                    <div className="mb-4">
                                        <label htmlFor="phoneNumber" className="form-label fw-semibold text-dark">
                                            <i className="fas fa-phone me-2 text-primary"></i>
                                            Phone Number
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <i className="fas fa-mobile-alt text-muted"></i>
                                            </span>
                                            <input
                                                type="tel"
                                                className={`form-control border-start-0 ${errors.phoneNumber ? 'is-invalid' : ''}`}
                                                id="phoneNumber"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                placeholder="Enter your phone number"
                                                style={{ paddingLeft: '8px' }}
                                            />
                                            {errors.phoneNumber && (
                                                <div className="invalid-feedback">
                                                    {errors.phoneNumber}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* QR Code Upload */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold text-dark">
                                            <i className="fas fa-qrcode me-2 text-primary"></i>
                                            QR Code Image
                                        </label>

                                        {!qrPreview ? (
                                            <div className=" rounded-3 p-4 text-center"
                                                style={{ border: "3px dashed rgb(5, 138, 255)", padding: "16px", borderRadius: "8px" }}>
                                                <i className="fas fa-cloud-upload-alt text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                                                <div>
                                                    <label htmlFor="qrCodeFile" className="btn btn-primary btn-lg mb-2" style={{ cursor: 'pointer' }}>
                                                        <i className="fas fa-plus me-2"></i>
                                                        Choose QR Code
                                                    </label>
                                                    <input
                                                        type="file"
                                                        className="d-none"
                                                        id="qrCodeFile"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                    />
                                                    <p className="text-muted small mb-0">
                                                        Support: PNG, JPG, GIF (Max 5MB)
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="position-relative">
                                                <div className="border rounded-3 p-3 bg-light">
                                                    <div className="row align-items-center">
                                                        <div className="col-auto">
                                                            <img
                                                                src={qrPreview}
                                                                alt="QR Code Preview"
                                                                className="rounded"
                                                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                        <div className="col">
                                                            <h6 className="mb-1 fw-semibold">{formData.qrCodeFile?.name}</h6>
                                                            <small className="text-muted">
                                                                {(formData.qrCodeFile?.size / 1024 / 1024).toFixed(2)} MB
                                                            </small>
                                                        </div>
                                                        <div className="col-auto">
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={removeQrCode}
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {errors.qrCodeFile && (
                                            <div className="text-danger small mt-2">
                                                <i className="fas fa-exclamation-circle me-1"></i>
                                                {errors.qrCodeFile}
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="d-grid gap-2">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg fw-semibold"
                                            disabled={isSubmitting}
                                            style={{
                                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                                border: 'none',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-2"></i>
                                                    Update Information
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {/* Footer */}
                                <div className="text-center mt-4">
                                    <small className="text-muted">
                                        <i className="fas fa-shield-alt me-1"></i>
                                        Your information is secure and encrypted
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bootstrap CSS */}
            <link
                href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
                rel="stylesheet"
            />
            {/* Font Awesome for icons */}
            <link
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
                rel="stylesheet"
            />
        </div>
    );
}

export default QrCodeAndNumberSetForm;