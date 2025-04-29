import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api.service';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    userType: ""
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

  const checkSubscription = async (udiseNo) => {
    try {
      const response = await apiService.getdata(`api/subscription/check/${udiseNo}`);
      return response.data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      throw new Error('Subscription check failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First authenticate the user
      await authService.login('public/authenticate', credentials);
      const token = sessionStorage.getItem('token');
      
      if (token) {
        const decoded = jwtDecode(token);
        
        // If user is developer, allow login without subscription check
        if (decoded.role?.toLowerCase() === 'developer') {
          navigate(getTargetPath(decoded.role), { replace: true });
          return;
        }

        // Check subscription for non-developer users
        const isSubscriptionValid = await checkSubscription(decoded.udiseNo);
      
        if (!isSubscriptionValid) {
          // Subscription is valid, proceed with login
          navigate(getTargetPath(decoded.role), { replace: true });
        } else {

          setError('सॉफ्टवेअर लायसन्स वैध नाही. कृपया डेवलपरशी संपर्क साधा.');
          setCredentials({ username: '', password: '', userType: '' });
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('कृपया आपल्या लॉगिन माहितीची (वापरकर्तानाव, संकेतशब्द, भूमिका) पुन्हा एकदा खात्री करा.');
      setCredentials({ username: '', password: '', userType: '' });
    } finally {
      setLoading(false);
    }
  };

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
                    placeholder="-- वापरकर्तानाव प्रविष्ट करा --"
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
                    placeholder="-- पासवर्ड प्रविष्ट करा --"
                    disabled={loading}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4" controlId="userRole">
                  <Form.Label>✅ वापरकर्त्याची भूमिका निवडा</Form.Label>
                  <Form.Select 
                    name="userType" 
                    value={credentials.userType} 
                    onChange={handleChange} 
                    required 
                    disabled={loading}
                  >
                    <option value="">-- भूमिका निवडा --</option>
                    <option value="HEADMASTER">मुख्याध्यापक</option>
                    <option value="STAFF">शिक्षक / लिपिक</option>
                    <option value="DEVELOPER">डेवलपर</option>
                  </Form.Select>
                </Form.Group>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'लॉगिन होत आहे...' : 'लॉगिन करा'}
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
