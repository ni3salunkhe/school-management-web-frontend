import React, { use, useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import apiService from '../services/api.service';


const NewSchool = () => {
    const [allSchool, setAllSchool] = useState([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const [existingUsers, setExistingUsers] = useState([]);
    const [existingUdiseno, setExistingUdiseno] = useState([]);
    const [existingSchool, setExistingSchool] = useState([]);
    const [existingEmail, setExistingEmail] = useState([]);
    const [existingPhone, setExistingPhone] = useState([]);

    useEffect(() => {


        const fetchHm = async () => {
            try {
                const response = await apiService.getdata("school/");
                if (Array.isArray(response.data)) {
                    response.data.forEach(school => {
                        // Look for headMasterName or any nested structure that might hold it
                        if (school.udiseNo) {
                            setExistingUdiseno(prevState => [...prevState, school.udiseNo]);
                        }
                        if (school.schoolName) {
                            setExistingSchool(prevState => [...prevState, school.schoolName]);
                        }

                        if (school.schoolEmailId) {
                            setExistingEmail(prevState => [...prevState, school.schoolEmailId]);
                        }

                        if (school.headMasterMobileNo) {
                            setExistingPhone(prevState => [...prevState, school.headMasterMobileNo]);
                        }

                        // Check if headMasterName exists (or if it is nested inside another field)
                        if (school.headMasterName) {
                            setExistingUsers(prevState => [...prevState, school.headMasterName]);
                        }
                    })
                }
                const school = response.data || [];
                if (school.length === 0) {
                    console.warn("No data found");
                } else {
                    setAllSchool(school);
                    console.log(school);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchHm();
    }, []);

    const [formData, setFormData] = useState({
        schoolUdise: '',
        schoolName: '',
        username: '',
        email: '',
        schoolName: '',
        orgName: '',
        phone: '',
        role: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null);


    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            logo: e.target.files[0]  // This captures the file object
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prevState => ({
            ...prevState,
            [name]: value

        }));

        if (name == 'username' && value) {
            if (existingUsers.includes(value)) {
                setErrors({
                    ...errors,
                    username: 'हे वापरकर्तानाव आधीच अस्तित्वात आहे'
                });
            } else {
                // Clear error if fixed
                const updatedErrors = { ...errors };
                delete updatedErrors.username;
                setErrors(updatedErrors);
            }
        }
        if (name == 'email' && value) {
            if (existingEmail.includes(value)) {
                setErrors({
                    ...errors,
                    email: 'हे ईमेल आधीच अस्तित्वात आहे'
                });
                console.log(existingEmail)
            } else {
                // Clear error if fixed
                const updatedErrors = { ...errors };
                delete updatedErrors.email;
                setErrors(updatedErrors);
            }
        }
        if (name == 'schoolName' && value) {
            console.log(existingSchool)
            if (existingSchool.includes(value)) {
                setErrors({
                    ...errors,
                    schoolName: 'हे शाळेचे नाव आधीच अस्तित्वात आहे'
                });
            } else {
                // Clear error if fixed
                const updatedErrors = { ...errors };
                delete updatedErrors.schoolName;
                setErrors(updatedErrors);
            }
        }
        if (name == 'schoolUdise' && value) {
            console.log(existingUdiseno)
            const numValue = Number(value);  // convert value to number

            if (existingUdiseno.some((item) => item === numValue)) {
                setErrors({
                    ...errors,
                    schoolUdise: 'हे शाळेचे UDISE संख्या आधीच अस्तित्वात आहे'
                });
            } else {
                // Clear error if fixed
                const updatedErrors = { ...errors };
                delete updatedErrors.schoolUdise;
                setErrors(updatedErrors);
            }
        }
        if (name == 'phone' && value) {
            if (existingPhone.includes(value)) {
                setErrors({
                    ...errors,
                    phone: 'हे फोन नंबर आधीच अस्तित्वात आहे'
                });
            } else {
                // Clear error if fixed
                const updatedErrors = { ...errors };
                delete updatedErrors.phone;
                setErrors(updatedErrors);
            }
        }

    };

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.schoolUdise) {
            newErrors.schoolUdise = 'UDISE नंबर प्रविष्ट करणे आवश्यक आहे';
        }

        // Username validation
        if (!formData.schoolName) {
            newErrors.schoolName = 'शाळेचे नाव प्रविष्ट करणे आवश्यक आहे';
        }

        // Username validation
        if (!formData.orgName) {
            newErrors.orgName = 'संस्थेचे नाव प्रविष्ट करणे आवश्यक आहे';
        }

        // Username validation
        if (!formData.phone) {
            newErrors.phone = 'फोन नंबर प्रविष्ट करणे आवश्यक आहे';
        }

        // Username validation
        if (!formData.username || formData.username.length < 3) {
            newErrors.username = 'वापरकर्तानाव किमान ३ अक्षरे असावे लागते';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = 'कृपया वैध ईमेल पत्ता प्रविष्ट करा';
        }

        // Password validation
        if (!formData.password || formData.password.length < 8) {
            newErrors.password = 'पासवर्ड किमान ८ अक्षरे असावे लागते';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'पासवर्ड जुळत नाहीत';
        }
        // Role validation
        // if (!formData.role) {
        //     newErrors.role = 'कृपया एक भूमिका निवडा';
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                const userData = new FormData();
                userData.append('schoolDto', JSON.stringify({
                    udiseNo: formData.schoolUdise,
                    schoolName: formData.schoolName,
                    sansthaName: formData.orgName,
                    headMasterUserName: formData.username,
                    schoolEmailId: formData.email,
                    headMasterMobileNo: formData.phone,
                    headMasterPassword: formData.password,
                    role: formData.role
                }));

                // Add the logo file if it exists
                if (formData.logo) {
                    userData.append('logo', formData.logo);
                }

                

                // Send the request
                try {
                    console.log(userData); // Check data before sending
                    await apiService.post('school/', userData);
                    setSubmitStatus({
                        type: 'success',
                        message: 'User account created successfully!'
                    });
                } catch (error) {
                    console.error(error);
                    setSubmitStatus({
                        type: 'error',
                        message: 'There was an error during submission.'
                    });
                }

                //  Reset form after successful submission
                setFormData({
                    username: '',
                    email: '',
                    schoolUdise:'',
                    schoolName: '',
                    orgName: '',
                    phone: '',
                    role: '',
                    password: '',
                    confirmPassword: ''
                });
            } catch (error) {
                setSubmitStatus({
                    type: 'danger',
                    message: error.message || 'Failed to create user account'
                });
            }
        }
    };

    return (
        <Container className="mt-5" >
            <Row className="justify-content-md-center ">
                <Col md={12} lg={12}>
                    <Card className='shadow-sm' style={{ border: 'none' }}>
                        <Card.Header as="h3" className="text-center p-3 bg-primary">
                            शाळेचे खाते तयार करा
                        </Card.Header>
                        <Card.Body>
                            {submitStatus && (
                                <Alert variant={submitStatus.type}>
                                    {submitStatus.message}
                                </Alert>
                            )}
                            <Form onSubmit={handleSubmit}>
                                <div className="card mb-3 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                    <i className="bi bi-info-circle"></i>


                                            शाळेची माहिती
                                        </h5>
                                        <Row>
                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>शाळेचा UDISE क्रमांक</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        name="schoolUdise"
                                                        value={formData.schoolUdise}
                                                        onChange={handleChange}
                                                        placeholder="शाळेचा UDISE क्रमांक प्रविष्ट करा"
                                                        isInvalid={!!errors.schoolUdise}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.schoolUdise}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>संस्थेचे नाव</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="orgName"
                                                        value={formData.orgName}
                                                        onChange={handleChange}
                                                        placeholder="संस्थेचे नाव प्रविष्ट करा"
                                                        isInvalid={!!errors.orgName}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.orgName}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>शाळेचे नाव</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="schoolName"
                                                        value={formData.schoolName}
                                                        onChange={handleChange}
                                                        placeholder="शाळेचे नाव प्रविष्ट करा"
                                                        isInvalid={!!errors.schoolName}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.schoolName}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>शाळेचा ईमेल</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="शाळेचा ईमेल प्रविष्ट करा"
                                                        isInvalid={!!errors.email}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.email}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                    </div>
                                </div>
                                <div className="card mb-3 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                        <i className="bi bi-person-fill"></i>

                                        मुख्याध्यापकांची माहिती
                                        </h5>
                                        <Row>

                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>मुख्याध्यापक वापरकर्तानाव</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="username"
                                                        value={formData.username}
                                                        onChange={handleChange}
                                                        placeholder="वापरकर्तानाव प्रविष्ट करा"
                                                        isInvalid={!!errors.username}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.username}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>


                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>मुख्याध्यापकांचा फोन नंबर</Form.Label>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="भ्रमणध्वनी क्रमांक प्रविष्ट करा"
                                                        isInvalid={!!errors.phone}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.phone}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>पासवर्ड</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        placeholder="पासवर्ड प्रविष्ट करा"
                                                        isInvalid={!!errors.password}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.password}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>पासवर्डची पुष्टी करा</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        placeholder="पासवर्डची पुष्टी करा"
                                                        isInvalid={!!errors.confirmPassword}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.confirmPassword}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>  
                                    </div>
                                </div>
                                <div className="card mb-3 border-0 bg-light">
                                    <div className="card-body p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">

                                        <i className="bi bi-file-earmark-text"></i>
                                        इतर माहिती
                                        </h5>
                                        <Row>
                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>भूमिका</Form.Label>
                                                    <Form.Select
                                                        name="role"
                                                        value={formData.role}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors.role}
                                                    >
                                                        <option value={"HEADMASTER"}>Head Master</option>
                                                        {/* {Array.isArray(allRoles) && allRoles.map(role => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.roleName}
                                                    </option>
                                                ))} */}
                                                    </Form.Select>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.role}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>


                                <div className="d-flex justify-content-center mt-4">
                                    <Button variant="primary" type="submit" className="btn btn-primary btn-md px-4 py-2 rounded-pill shadow-sm">
                                        खाते तयार करा
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default NewSchool;