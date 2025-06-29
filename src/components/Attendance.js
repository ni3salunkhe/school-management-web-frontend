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
    const today = new Date();

  // Define start and end dates
  const start = new Date(today.getFullYear(), 4, 1);  // May 1 (Month is 0-indexed)
  const end = new Date(today.getFullYear(), 6, 31);   // July 31

  // Check if today is between May 1 and July 31
  const isWithinRange = today >= start && today <= end;

  if (isWithinRange) {
    return (<>
    <div className="not-available-container">
      <div className="not-available-content">
        <svg className="not-available-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          <path d="M0 0h24v24H0z" fill="none" />
        </svg>
        <h2>Content Currently Unavailable</h2>
        <p>This section is only visible between May 1st and May 31st.</p>
      </div>
    </div></>
    ) 
  }

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
          console.error("Error fetching      teacher:", error);
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
            <h1  className='text-center'>आपली नियुक्ती कोणत्याही वर्गासाठी करण्यात आलेली नाही कृपया लिपिकांशी संपर्क साधा.  </h1>
        </div>)}
        </>
    )
}

export default Attendance
