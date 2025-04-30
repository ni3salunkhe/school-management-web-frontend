import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { BsGear } from 'react-icons/bs'
import { FaBox, FaCalendarAlt, FaCog } from 'react-icons/fa'
import apiService from '../services/api.service'
import { format, addYears, subDays } from 'date-fns';
import Swal from 'sweetalert2'

const Subscription = () => {
    const [schools, setSchools] = useState([])
    const [errors, setErrors] = useState({})
    const [isExpired, setIsExpired] = useState(false)
    const [flag, setFlag] = useState("")
    const [buttonText, setButtonText] = useState("मंजूर कर")
    const fetchSchools = async () => {
        try {
            const response = await apiService.getdata('school/');
            if (Array.isArray(response.data)) {
                response.data.forEach(school => {
                    if (school.udiseNo) {
                        // setSchools(prevState=>[...prevState, school.udiseNo, school.schoolName]);

                    }
                })
            }
            if (response.data.length === 0) {
                console.warn("No data found");
            } else {
                setSchools(response.data)
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    useEffect(() => {
        fetchSchools();
    }, [])
    console.log(schools)

    const [formData, setFormData] = useState({
        udiseNumber: '',
        startdate: '',
        enddate: ''
    })

    const handleChange = async (e) => {
        const { name, value } = e.target
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }))

        if(name == 'startdate'){
            setFormData(prevState => ({
                ...prevState,
                enddate: format(subDays(addYears(value, 1), 1),'yyyy-MM-dd')
            }))
        }
        if (name == 'udiseNumber' && value) {
            const response = await apiService.getbyid('api/subscription/check/', value)
            const data = await apiService.getbyid('api/subscription/', value)

            // Function to format date from YYYYMMDD to YYYY-MM-DD
            const formatDate = (dateString) => {
                if (!dateString) return '';
                // Convert YYYYMMDD to YYYY-MM-DD
                return dateString.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            }

            if (response.data == true) {
                setIsExpired(true)
                // setErrors({
                //     ...errors,
                //     udiseNumber: 'Licence expired for this school'
                // })
                setFormData(prevState => ({
                    ...prevState,
                    // startdate: formatDate(data.data.startdate),
                    // enddate: formatDate(data.data.enddate)
                    startdate: data.data.startdate,
                    enddate: data.data.enddate
                }))
                setFlag("renew")
                setButtonText("पुनर्नविनीत करणे")
                console.log(flag)
                console.log(data.data)
            } else if (response.data == false) {
                setIsExpired(false)
                setErrors({
                    ...errors,
                    udiseNumber: 'Already subscribed ! subsription not expired yet for this school School'
                })
            } else {
                setIsExpired(true)
                setErrors({
                    ...errors,
                    udiseNumber: `${response.data}`
                })
            }
        }
    }

    const validateForm = () => {
        const newErrors = {}
        if (!formData.udiseNumber) {
            newErrors.udiseNumber = 'Please select School Udise number'
        }
        if (!formData.startdate) {
            newErrors.startdate = 'Please select subscription start date'
        }
        if (!formData.enddate) {
            newErrors.enddate = 'Please select Select Subscription end date'
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const convertToYYYYMMDD = (dateString) => {
        if (!dateString) return '';
        // Check if already in YYYYMMDD format
        if (/^\d{4}\d{2}\d{2}$/.test(dateString)) return dateString;

        // Convert from DDMMYYYY to YYYYMMDD
        const matches = dateString.match(/^(\d{2})(\d{2})(\d{4})$/);
        if (!matches) return dateString;
        return `${matches[3]}${matches[2]}${matches[1]}`;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const userData = {
                    udiseNumber: formData.udiseNumber,
                    startdate: convertToYYYYMMDD(formData.startdate),
                    enddate: convertToYYYYMMDD(formData.enddate)
                }
                console.log(flag)
                if (flag === "renew") {
                    await apiService.post("api/subscription/renew", userData);
                    // alert("subscription नूतनीकरण यशस्वीरीत्या झाले आहे!" + formData);
                    Swal.fire({
                        title: "subscription नूतनीकरण यशस्वीरीत्या झाले आहे!",
                        icon: "success",
                        draggable: true
                    });
                    setButtonText("मंजूर कर");
                    setFlag("");
                } else {
                    await apiService.post("api/subscription/create", formData);
                    // alert("Bhai data gaya hoga dekh ek baar" + formData)
                    // alert("subscription यशस्वीरीत्या नोंदवली आहे!");
                    Swal.fire({
                        title: "subscription यशस्वीरीत्या नोंदवली आहे!",
                        icon: "success",
                        draggable: true
                    });
                }
            } catch (error) {
                console.log(error)
            }
        }
        setFormData({
            udiseNumber: '',
            startdate: '',
            enddate: ''
        })
    }
    // Add this function somewhere in your component file, maybe outside the component function
    const formatDateToString = (date) => {
        if (!(date instanceof Date) || isNaN(date)) {
            return ''; // Return empty string for invalid dates
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    return (
        <Container fluid
            className="d-flex justify-content-center align-items-center subuscription"
            style={{ height: '100vh' }} >
            <Card style={{ height: '33rem', width: '40rem' }} className='shadow-lg'>
                <Card.Header as="h3" className="text-center p-3 bg-primary">सदस्यता नूतनीकरण करा</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="card mb-3 border-0 bg-light">
                            <div className="card-body p-3">
                                <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                    <i className="bi bi-info-circle"></i>
                                    शाळेची माहिती
                                </h5>
                                <Row style={{ height: '6rem' }}>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>
                                                शाळेचा Udise क्रमांक
                                            </Form.Label>
                                            <Form.Select
                                                name='udiseNumber'
                                                onChange={handleChange}
                                                value={formData.udiseNumber}
                                                isInvalid={!!errors.udiseNumber}
                                            >
                                                <option value="">शाळा निवडा</option>
                                                {Array.isArray(schools) && schools.map((school) => (
                                                    <option key={school.udiseNo} value={school.udiseNo}>{school.schoolName}</option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type='invalid'>
                                                {errors.udiseNumber}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        {isExpired === true ? (
                            <div className="card mb-3 border-0 bg-light">
                                <div className="card-body p-3">
                                    <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                        <FaCalendarAlt />
                                        सदस्यता तपशील
                                    </h5>
                                    <Row style={{ height: '6rem' }}>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>
                                                    सदस्यता प्रारंभ तारीख
                                                </Form.Label>
                                                <Form.Control
                                                    name='startdate'
                                                    type='date'
                                                    value={formData.startdate}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.startdate}
                                                >
                                                </Form.Control>
                                                <Form.Control.Feedback type='invalid' >
                                                    {errors.startdate}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>
                                                    सदस्यता समाप्त तारीख
                                                </Form.Label>
                                                <Form.Control
                                                    name='enddate'
                                                    type='date'
                                                    value={formData.enddate}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.enddate}
                                                >
                                                </Form.Control>
                                                <Form.Control.Feedback type='invalid' >
                                                    {errors.enddate}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            </div>) : ""
                        }
                        <div className="d-flex justify-content-center">
                            <Button variant="primary" type="submit" className="btn btn-primary btn-md px-4 py-2 rounded-pill shadow-sm">
                                {buttonText}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    )
}

export default Subscription
