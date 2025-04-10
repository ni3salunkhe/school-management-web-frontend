import React, { useState, useEffect } from 'react'
import { Col, Container, Form, Row, Button, Card } from 'react-bootstrap'
import apiService from '../services/api.service'

const Attendance = () => {
    const [schools, setSchools] = useState([])
    const [students, setStudents] = useState([])
    const [selectedStudents, setSelectedStudents] = useState([])
    const [selectedSchool, setSelectedSchool] = useState('')
    const [errors, setErrors] = useState({})

    // Fetch schools on component mount
    useEffect(() => {
        fetchSchools()
    }, [])



    // Fetch schools from API
    const fetchSchools = async () => {
        try {
            const response = await apiService.getdata('school/')
            if (Array.isArray(response.data)) {
                setSchools(response.data)
            }
        } catch (error) {
            console.error("Error fetching schools:", error)
        }
    }

    // Fetch students when school is selected
    const fetchStudents = async (udiseNo) => {
        try {
            const response = await apiService.getdata(`api/student/school/${udiseNo}`)
            if (Array.isArray(response.data)) {
                setStudents(response.data)
                console.log(response.data)
            }
        } catch (error) {
            console.error("Error fetching students:", error)
        }
    }

    const [formData, setFormData] = useState({
        udiseNumber: '',
        standard:'',
        selesctedStudent:[]
    })

    // Handle school selection
    const handleSchoolChange = (e) => {
        const udiseNo = e.target.value
        setSelectedSchool(udiseNo)
        if (udiseNo) {
            fetchStudents(udiseNo)
        } else {
            setStudents([])
        }
        setSelectedStudents([])
    }

    // Handle student selection
    const handleStudentSelection = (registerNumber) => {
        setSelectedStudents(prev => {
            if (prev.includes(registerNumber)) {
                return prev.filter(id => id !== registerNumber)
            } else {
                return [...prev, registerNumber]
            }
        })
    }

    // Handle select all students
    const handleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([])
        } else {
            setSelectedStudents(students.map(student => student.registerNumber))
        }
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedSchool) {
            setErrors({ school: 'Please select a school' })
            return
        }
        if (selectedStudents.length === 0) {
            setErrors({ students: 'Please select at least one student' })
            return
        }

        try {
            const attendanceData = {
                udiseNo: selectedSchool,
                studentRegisterId: selectedStudents
            }
            await apiService.post(`api/attendance/${attendanceData.udiseNo}`, attendanceData)
            alert('Students registered successfully!')
            // Reset form
            setSelectedSchool('')
            setSelectedStudents([])
            setStudents([])
        } catch (error) {
            console.error("Error registering students:", error)
            setErrors({ submit: 'Failed to register students' })
        }
    }

    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={{  }}>
            <Card className="shadow-lg" style={{ width: '100%', maxWidth: '800px' }}>
                <Card.Header as="h3" className="text-center p-3 bg-primary text-white">
                    विद्यार्थी उपस्थिती नोंदणी
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-4">
                            <Col>
                                <Form.Group>
                                    <Form.Label>शाळेचा Udise क्रमांक</Form.Label>
                                    <Form.Select
                                        value={selectedSchool}
                                        onChange={handleSchoolChange}
                                        isInvalid={!!errors.school}
                                    >
                                        <option value="">शाळा निवडा</option>
                                        {schools.map((school) => (
                                            <option key={school.udiseNo} value={school.udiseNo}>
                                                {school.schoolName}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.school}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col>
                                <Form.Group>
                                    <Form.Label>Standard</Form.Label>
                                    <Form.Select
                                        value={selectedSchool}
                                        onChange={handleSchoolChange}
                                        isInvalid={!!errors.school}
                                    >
                                        <option value="">Select Statandard</option>
                                            <option>
                                                1
                                            </option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.school}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        {students.length > 0 && (
                            <Row className="mb-4">
                                <Col>
                                    <Form.Group>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <Form.Label>विद्यार्थी निवडा</Form.Label>
                                            <Button 
                                                variant="link" 
                                                onClick={handleSelectAll}
                                                className="text-decoration-none"
                                            >
                                                {selectedStudents.length === students.length ? 'सर्व निवड रद्द करा' : 'सर्व निवडा'}
                                            </Button>
                                        </div>
                                        <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {students.map((student) => (
                                                <Form.Check
                                                    key={student.registerNumber}
                                                    type="checkbox"
                                                    id={`student-${student.registerNumber}`}
                                                    label={`${student.studentName} - ${student.apparId}`}
                                                    checked={selectedStudents.includes(student.registerNumber)}
                                                    onChange={() => handleStudentSelection(student.registerNumber)}
                                                    className="mb-2"
                                                />
                                            ))}
                                        </div>
                                        
                                        {errors.students && (
                                            <div className="text-danger mt-1">
                                                {errors.students}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <div className="d-flex justify-content-center">
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="px-4 py-2 rounded-pill"
                                disabled={!selectedSchool || selectedStudents.length === 0}
                            >
                                नोंदणी करा
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    )
}

export default Attendance
