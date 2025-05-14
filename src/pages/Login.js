import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api.service';
import { authService } from '../services/authService';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    userType: ""
  });

  const [resetData, setResetData] = useState({
    role: '',
    email: '',
    mobile: ''
  });

  const [error, setError] = useState('');
  const [resetFormError, setResetFormError] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAvailable, setIsAvailable] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
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

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetData(prev => ({
      ...prev,
      [name]: value
    }));

    const newError = {}

    if (name === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        newError.email = "वैध ई-मेल प्रविष्ट करा";
      } else if (!/^[A-Za-z0-9@.!#$%^&*()_+\-=<>?/|]+$/.test(value.trim())) {
        newError.email = "कृपया फक्त इंग्रजी अक्षरे वापरा";
      }
    }

    if (name === "mobile") {
      if (!/^[6-9]\d{9}$/.test(value.trim())) {
        newError.mobile = "कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा";
      }
    }

    setResetFormError(newError);

  };

  function validateClassForm() {
    const newError = {}
    if (resetData) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetData.email.trim())) {
        newError.email = "वैध ई-मेल प्रविष्ट करा";
      } else if (!/^[A-Za-z0-9@.!#$%^&*()_+\-=<>?/|]+$/.test(resetData.email.trim())) {
        newError.email = "कृपया फक्त इंग्रजी अक्षरे वापरा";
      }
    }


    if (!/^[6-9]\d{9}$/.test(resetData.mobile.trim())) {
      newError.mobile = "कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा";
    }

    return newError;
  }

  const resetSubmit = async (e) => {
    e.preventDefault();

    console.log(resetData);
    const validationErrors = validateClassForm();

    if (Object.keys(validationErrors).length > 0) {
      setError(validationErrors);
      return;
    }

    try {
      // const res= await axios.post("http://localhost:8080/",resetData);
      if (resetData.role === "STAFF") {
        const res = await apiService.postlogin("staff/checkmobileamdemail", resetData);
        console.log(res.data);
        setIsAvailable(res.data);
      }
      else if (resetData.role === "HEADMASTER") {
        const payload = { headMasterMobileNo: resetData.mobile, headMasterEmailId: resetData.email }
        const res = await apiService.postlogin("school/checkmobileamdemail", payload)
        console.log(res.data);
        setIsAvailable(res.data);
      }

    }
    catch (err) {
      // console.log(err.status);
      if (err.status === 404) {
        alert("दिलेला ई-मेल आणि मोबाईल नंबर आमच्या रेकॉर्डमध्ये आढळला नाही.")
      }
    }

  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const payload = {
      password: newPassword
    }

    // Reset previous errors
    setNewPasswordError("");

    // Validate password
    if (!newPassword) {
      setNewPasswordError("कृपया पासवर्ड प्रविष्ट करा.");
      return;
    }

    if (!/^(?=[^!@#$%^&+=]*[!@#$%^&+=][^!@#$%^&+=]*$)([A-Za-z0-9]+|[A-Za-z0-9]*[!@#$%^&+=][A-Za-z0-9]*){8,}$/.test(newPassword)) {
      setNewPasswordError("पासवर्ड ८ अक्षरांचा असावा आणि फक्त इंग्रजी अक्षरे, अंक किंवा फक्त एकच चिन्ह असावीत.");
      return;
    }

    try {

      if (resetData.role === "STAFF") {
        const payload = {
          password: newPassword
        }
        const res = await axios.put(`http://localhost:8080/staff/resetpassword/${isAvailable?.id}`, payload);
        console.log(res);
      }
      else if (resetData.role === "HEADMASTER") {
        const payload = {
          headMasterPassword: newPassword
        }
        const res = await axios.put(`http://localhost:8080/school/resetpassword/${isAvailable.id}`,payload);
        console.log(res);
        
      }


      // Show success alert
      alert("पासवर्ड यशस्वीरित्या बदलण्यात आला.");

      // Close modal after alert is shown
      setTimeout(() => {
        setShowModal(false);
        setResetData({ email: '', mobile: '' });
        setNewPassword('');
        setIsAvailable({});
      }, 100);

    } catch (err) {
      console.error("Password update failed:", err);
      setNewPasswordError("पासवर्ड अपडेट करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.");
      // Don't close the modal on error
    }
  }

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

                <div className='text-end mt-2'>
                  <Link className='text-decoration-none' style={{ cursor: 'pointer' }}
                    onClick={() => setShowModal(true)}>पासवर्ड विसरलात?</Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => {
        setShowModal(false); setShowModal(false); setShowModal(false); setResetData({ email: '', mobile: '' }); setNewPassword(''); setIsAvailable({});
      }}>
        <Form onSubmit={isAvailable?.Available ? handlePasswordUpdate : resetSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>पासवर्ड रीसेट</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-4" controlId="userRole">
              <Form.Label>✅ वापरकर्त्याची भूमिका निवडा</Form.Label>
              <Form.Select
                name="role"
                value={resetData.role}
                onChange={handleResetChange}
                required
                disabled={loading}
              >
                <option value="">-- भूमिका निवडा --</option>
                <option value="HEADMASTER">मुख्याध्यापक</option>
                <option value="STAFF">शिक्षक / लिपिक</option>
                {/* <option value="DEVELOPER">डेवलपर</option> */}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>ई-मेल</Form.Label>
              <Form.Control
                type="text"
                name="email"
                value={resetData.email}
                onChange={handleResetChange}
                placeholder="-- ई-मेल प्रविष्ट करा --"
                disabled={loading}
                required
              />
              {resetFormError.email && <div className="text-danger">{resetFormError.email}</div>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>मोबाईल नं.</Form.Label>
              <Form.Control
                type="number"
                name="mobile"
                value={resetData.mobile}
                onChange={handleResetChange}
                placeholder="-- मोबाईल क्रमांक प्रविष्ट करा --"
                disabled={loading}
                required
              />
              {resetFormError.mobile && <div className="text-danger">{resetFormError.mobile}</div>}
            </Form.Group>

            {isAvailable?.Available == true &&
              <>
                <hr />
                <p>User verified. Please set your new password.</p>
                <Form.Group className="mb-3">
                  <Form.Label>नवीन पासवर्ड</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    // onChange={(e) => setNewPassword(e.target.value)}
                    isInvalid={newPassword && !/^(?=[^!@#$%^&+=]*[!@#$%^&+=][^!@#$%^&+=]*$)([A-Za-z0-9]+|[A-Za-z0-9]*[!@#$%^&+=][A-Za-z0-9]*){8,}$/.test(newPassword)}
                    placeholder="-- नवीन पासवर्ड प्रविष्ट करा --"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    पासवर्ड ८ अक्षरांचा असावा आणि फक्त इंग्रजी अक्षरे, अंक किंवा फक्त एकच  चिन्ह असावीत.
                  </Form.Control.Feedback>
                  {newPasswordError && <div className="text-danger">{newPasswordError}</div>}
                </Form.Group>
                {/* Add confirm password if needed */}
              </>
            }

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowModal(false); setShowModal(false);
              setResetData({ email: '', mobile: '' });
              setNewPassword('');
              setIsAvailable({});
            }}>
              बंद करा
            </Button>
            <Button variant="primary" type="submit">
              {isAvailable?.Available ? 'पासवर्ड अपडेट करा' : 'रीसेट विनंती पाठवा'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Login;
