import React, { useState } from 'react';
import { Button, Card, Container, Form, Alert, Spinner } from 'react-bootstrap';
import apiService from '../services/api.service';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'

function Holiday() {
    const [holidayDate, setHolidayDate] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' }); // For success/error messages
    const udiseNo=jwtDecode(sessionStorage.getItem('token'))?.udiseNo;

    // --- Get UDISE or School ID if needed for the API ---
    // Example:
    // const token = sessionStorage.getItem('token');
    // const decodedToken = token ? jwtDecode(token) : {};
    // const udiseNo = decodedToken?.udiseNo;

    const clearForm = () => {
        setHolidayDate('');
        setReason('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission
        setMessage({ type: '', text: '' }); // Clear previous messages

        if (!holidayDate || !reason.trim()) {
            setMessage({ type: 'danger', text: 'कृपया तारीख आणि कारण दोन्ही भरा.' }); // Please fill both date and reason.
            return;
        }

        setIsLoading(true);

        const payload = {
            holiday_date: holidayDate, // Adjust field name as per your API
            reason: reason.trim(),
            // udise_no: udiseNo, // If your API needs it
            // school_id: someSchoolId, // Or school ID
        };

        try {
            // --- Replace with your actual API call ---
            await axios.post(`http://localhost:8080/api/attendance/mark-holiday/school/${udiseNo}/${payload.holiday_date}`,{},{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            })
            // const response = await apiService.post('/api/holidays', payload); // Example
            // Mock API call
            setMessage({ type: 'success', text: 'सुट्टी यशस्वीरित्या जतन केली गेली!' }); // Holiday saved successfully!
            clearForm();
            await new Promise(resolve => setTimeout(resolve, 1500));
            // --- End of API call ---
            

            // Assuming API call was successful
            // setMessage({ type: 'success', text: response.data.message || 'सुट्टी यशस्वीरित्या जतन केली गेली!' });

        } catch (error) {
            console.error("Error saving holiday:", error);
            // setMessage({
            //     type: 'danger',
            //     text: error.response?.data?.message || 'सुट्टी जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
            // });
            setMessage({ type: 'danger', text: 'सुट्टी जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' }); // Error saving holiday. Please try again.
        } finally {
            setIsLoading(false);
            setMessage("");
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-start py-3 min-vh-100"> {/* Changed align-items-center to start for longer content */}
            <Card className="shadow-lg" style={{ width: '100%', maxWidth: '600px' }}> {/* Reduced maxWidth slightly */}
                <Card.Header as="h3" className="text-center p-3 bg-primary text-white">
                    शाळेसाठी सुट्टी नोंद करा
                </Card.Header>
                <Card.Body className="p-4"> {/* Added more padding to Card.Body */}
                    <Form onSubmit={handleSubmit}> {/* Use React Bootstrap Form component */}
                        <div className="card mb-4 border-0 bg-light">
                            <div className="card-body p-3">
                                <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">सुट्टीची माहिती</h5>
                                <Form.Group className="mb-3" controlId="holidayDate"> {/* Added controlId for accessibility */}
                                    <Form.Label className="fw-semibold">तारीख <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type='date'
                                        name="holidayDate"
                                        value={holidayDate}
                                        onChange={(e) => setHolidayDate(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="reason"> {/* Added controlId for accessibility */}
                                    <Form.Label className="fw-semibold">
                                        कारण <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea" // Using textarea for potentially longer reasons
                                        rows={3}
                                        name='reason'
                                        placeholder="-- सुट्टीचे कारण नमूद करा --"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        {message.text && (
                            <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible className="mt-3">
                                {message.text}
                            </Alert>
                        )}

                        <div className='d-grid gap-2 d-md-flex justify-content-md-center mt-4'>
                            <Button
                                variant='success'
                                type='submit'
                                className="btn-lg px-5 py-2 rounded-pill shadow-sm"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        जतन करत आहे...
                                    </>
                                ) : (
                                    'जतन करा'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Holiday;