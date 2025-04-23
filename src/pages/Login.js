import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api.service';
import { authService } from '../services/authService';
import {jwtDecode} from 'jwt-decode';

const Login = () => {

  const [isExpired, setIsExpired] = useState(false);

  const fetchSubscription = async (udiseNo) => {
    try {
      const response = await apiService.getdata(`api/subscription/check/${udiseNo}`);

      setIsExpired(response.data)
      alert(isExpired)
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    userType:"STAFF"
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getTargetPath = (role) => {
    switch (role?.toLowerCase()) {
      case 'developer':
        return '/developer/view';
      case 'headmaster':
        return '/headmaster/school';
      case 'clerk':
        return '/clerk/student';
      case 'teacher':
        return '/teacher/attendance';
      default:
        return '/';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.login('public/authenticate', credentials);
      const token=sessionStorage.getItem('token');
      if(token){
        const decoded=jwtDecode(token);
        const targetPath = getTargetPath(decoded.role);
        navigate(targetPath, { replace: true });
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Failed to login. Please try again.');
      setCredentials({ username: '', password: '' });
    } finally {
      setLoading(false);
    }
    
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  return (
    <Container fluid className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h4 className="mb-0">शाळा व्यवस्थापन प्रणाली</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>वापरकर्तानाव</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    placeholder="वापरकर्तानाव प्रविष्ट करा"
                    disabled={loading}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>पासवर्ड</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="पासवर्ड प्रविष्ट करा"
                    disabled={loading}
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
