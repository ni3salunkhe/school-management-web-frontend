import React from 'react'
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { BsGear } from 'react-icons/bs'
import { FaBox, FaCalendarAlt, FaCog } from 'react-icons/fa'

const Subscription = () => {
    const handleSubmit = () => { }
    return (
        <Container fluid
            className="d-flex justify-content-center align-items-center subuscription"
            style={{ height: '100vh' }} >
            <Card style={{ height: '30rem', width: '40rem' }} className='shadow-lg'>
                <Card.Header as="h3" className="text-center p-3 bg-primary">सदस्यता नूतनीकरण करा</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="card mb-3 border-0 bg-light">
                            <div className="card-body p-3">
                                <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                    <i className="bi bi-info-circle"></i>
                                    शाळेची माहिती
                                </h5>
                                <Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>
                                                शाळेचा Udise क्रमांक
                                            </Form.Label>
                                            <Form.Select
                                                name='schoolUdise'
                                            >
                                                <option value="">शाळेचा Udise क्रमांक निवडा</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        <div className="card mb-3 border-0 bg-light">
                            <div className="card-body p-3">
                                <h5 className="card-title border-bottom pb-2 mb-3 fs-5 fw-bold">
                                <FaCalendarAlt />
                                    सदस्यता तपशील
                                </h5>
                                <Row>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>
                                                सदस्यता प्रारंभ तारीख
                                            </Form.Label>
                                            <Form.Control
                                                name='date'
                                                type='date'
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>
                                                सदस्यता समाप्त तारीख
                                            </Form.Label>
                                            <Form.Control
                                                name='date'
                                                type='date'
                                            >
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                <div className="d-flex justify-content-center">
                    <Button variant="primary" type="submit" className="btn btn-primary btn-md px-4 py-2 rounded-pill shadow-sm">
                        मंजूर कर</Button>
                </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    )
}

export default Subscription
