import React, { useState } from 'react'
import { Col, Container, Form, Row, Button, Card } from 'react-bootstrap'
import AttendanceEntryForm from './AttendanceEntryForm'
import AbsenceForm from './AbsenceForm'
import { jwtDecode } from 'jwt-decode'
import apiService from '../services/api.service'

const Attendance = () => {
    
    const udiseno=jwtDecode(sessionStorage.getItem('token'))?.udiseNo;
    const [udiseNo] = useState(udiseno)
    const id=jwtDecode(sessionStorage.getItem('token')).id;
    const [activeTab, setActiveTab] = useState("create")
    const [selectedClass, setSelectedClass] = useState('')
    const [errors, setErrors] = useState({})
    const [isDataPresent,setIsDataPresent]=useState(true)
    const [teacherName, setTeacherName] = useState('')
    

    const classTeacher = async () => {
        try {
          const response = await apiService.getdata(`classteacher/getbyid/${id}`);
          const staff = response?.data?.staff;
      
          if (staff) {
            const fullName = `${staff.fname || ''} ${staff.fathername || ''} ${staff.lname || ''}`.trim();
            setTeacherName(fullName);
            setSelectedClass(id);
          } else {
            setTeacherName(null);
            setSelectedClass(null);
            setIsDataPresent(false);
          }
        } catch (error) {
          console.error("Error fetching class teacher:", error);
          setTeacherName('Error fetching teacher');
          setSelectedClass(null);
        }
      };
      
    classTeacher();
    
    return (
        <>
            {isDataPresent===true ?(<Container fluid className="d-flex justify-content-center align-items-center py-3">
            <Card className="shadow-lg" style={{ width: '100%', maxWidth: '800px' }}>
                <Card.Header as="h3" className="text-center p-3 bg-primary text-white">
                    विद्यार्थी उपस्थिती नोंदणी
                </Card.Header>
                <Card.Body>
                    {/* UDISE Number */}
                    <Row className="mb-4">
                        <Col>
                            <Form.Group>
                                <Form.Label>शाळेचा UDISE क्रमांक</Form.Label>
                                <Form.Control value={udiseNo} readOnly />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Class Selection */}
                    <Row className="mb-4">
                        <Col>
                            <Form.Group>
                                <Form.Label>वर्ग शिक्षक</Form.Label>
                                <Form.Control
                                    value={teacherName}
                                    isInvalid={!!errors.class}
                                    readOnly
                                >
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {/* {errors.class} */}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Form Tabs */}
                    <Card className="shadow-lg">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                            <h4 className="mb-0">विद्यार्थी उपस्थिती व्यवस्थापन</h4>
                            <Button
                                variant="light"
                                onClick={() =>
                                    setActiveTab(prev => (prev === 'create' ? 'absent' : 'create'))
                                }
                            >
                                {activeTab === 'create' ? 'Mark Absence' : 'Create Attendance'}
                            </Button>
                        </Card.Header>

                        <Card.Body>
                            {activeTab === 'create' && (
                                <AttendanceEntryForm udiseNo={udiseNo} selectedClass={selectedClass} />
                            )}
                            {activeTab === 'absent' && (
                                <AbsenceForm udiseNo={udiseNo} selectedClass={selectedClass} />
                            )}
                        </Card.Body>
                    </Card>
                </Card.Body>
            </Card>
        </Container>):(<div className='mt-5'>
            <h1  className='text-center'>लिपिकाशी संपर्क साधा . सध्या कोणतीही माहिती नाही </h1>
        </div>)}
        </>
    )
}

export default Attendance
