import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Modal,
  InputGroup,
  Spinner,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../services/api.service";
import { authService } from "../services/authService";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../styling/LoginStyles.css";
import Swal from "sweetalert2";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    userType: "",
  });

  const [resetData, setResetData] = useState({
    role: "",
    email: "",
    mobile: "",
  });

  const [error, setError] = useState("");
  const [resetFormError, setResetFormError] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAvailable, setIsAvailable] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [formAppear, setFormAppear] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger the form appearance animation after component mounts
    setTimeout(() => setFormAppear(true), 300);

    // Set animation complete after animations finish
    setTimeout(() => setAnimationComplete(true), 1500);

    // Initialize particles background
    initParticles();

    // Apply glowing effect to the app title
    initTitleGlow();

    // Add background gradient animation
    document.body.classList.add("animated-gradient");

    return () => {
      document.body.classList.remove("animated-gradient");
    };
  }, []);

  const initParticles = () => {
    const particlesScript = document.createElement("script");
    particlesScript.src =
      "https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js";
    particlesScript.onload = () => {
      window.particlesJS &&
        window.particlesJS("particles-js", {
          particles: {
            number: { value: 50, density: { enable: true, value_area: 900 } },
            color: { value: "#4680ff" },
            shape: { type: "circle" },
            opacity: {
              value: 0.6,
              random: true,
              anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false },
            },
            size: {
              value: 3,
              random: true,
              anim: { enable: true, speed: 2, size_min: 0.1, sync: false },
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#4680ff",
              opacity: 0.3,
              width: 1,
            },
            move: {
              enable: true,
              speed: 1.5,
              direction: "none",
              random: false,
              straight: false,
              out_mode: "out",
              bounce: false,
              attract: { enable: false, rotateX: 600, rotateY: 1200 },
            },
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: { enable: true, mode: "grab" },
              onclick: { enable: true, mode: "push" },
              resize: true,
            },
            modes: {
              grab: { distance: 140, line_linked: { opacity: 1 } },
              push: { particles_nb: 4 },
            },
          },
          retina_detect: true,
        });
    };
    document.body.appendChild(particlesScript);
  };

  const initTitleGlow = () => {
    const titleElement = document.querySelector(".app-title");
    if (titleElement) {
      setInterval(() => {
        titleElement.classList.toggle("glow");
      }, 2000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getTargetPath = (role) => {
    switch (role?.toLowerCase()) {
      case "developer":
        return "/developer/view";
      case "headmaster":
        return "/headmaster/school";
      case "clerk":
        return "/clerk/student";
      case "teacher":
        return "/teacher/attendance";
      default:
        return "/";
    }
  };

  const checkDeveloperSubscription = async () => {
    try {
      const response = await apiService.getdata(`developer/active`);
      const activeDevelopers = response.data;

      // Check if current user's username is in the list of active developers
      return activeDevelopers;
    } catch (error) {
      console.error("Error checking subscription:", error);
      return false;
    }
  };

  const checkSubscription = async (udiseNo) => {
    try {
      const response = await apiService.getdata(
        `api/subscription/check/${udiseNo}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking subscription:", error);
      throw new Error("Subscription check failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First authenticate the user
      await authService.login("public/authenticate", credentials);
      const token = sessionStorage.getItem("token");

      if (token) {
        const decoded = jwtDecode(token);
        // If user is developer, allow login without subscription check
        const isDevSubscriptionValid = await checkDeveloperSubscription();
        if (decoded.role.toLowerCase() === "developer") {
          if (!isDevSubscriptionValid) {
            navigate("/expiry", { replace: true });
    
          } else {
            navigate(getTargetPath(decoded.role), { replace: true });
          }
        }

        // Check subscription for non-developer users
        const isSubscriptionValid = await checkSubscription(decoded.udiseNo);

        if (!isSubscriptionValid && isDevSubscriptionValid) {
          // Subscription is valid, proceed with login
          if (decoded.status === "left") {
            Swal.fire({
              icon: "error",
              title: "क्षमस्व...",
              text: "आपल्याला ही सेवा वापरण्याची परवानगी नाही.",
            });
          } else {
            navigate(getTargetPath(decoded.role), { replace: true });
          }
        } else {
          setError("सॉफ्टवेअर लायसन्स वैध नाही. कृपया डेवलपरशी संपर्क साधा.");
          navigate("/expiry", { replace: true });
          setCredentials({ username: "", password: "", userType: "" });
          return;
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        "कृपया आपल्या लॉगिन माहितीची (वापरकर्तानाव, संकेतशब्द, भूमिका) पुन्हा एकदा खात्री करा."
      );
      setCredentials({ username: "", password: "", userType: "" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleResetChange = (e) => {
    const { name, value } = e.target;
    setResetData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const newError = {};

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
    const newError = {};
    if (resetData) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetData.email.trim())) {
        newError.email = "वैध ई-मेल प्रविष्ट करा";
      } else if (
        !/^[A-Za-z0-9@.!#$%^&*()_+\-=<>?/|]+$/.test(resetData.email.trim())
      ) {
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
      if (resetData.role === "STAFF") {
        const res = await apiService.postlogin(
          "staff/checkmobileamdemail",
          resetData
        );
        console.log(res.data);
        setIsAvailable(res.data);
      } else if (resetData.role === "HEADMASTER") {
        const payload = {
          headMasterMobileNo: resetData.mobile,
          headMasterEmailId: resetData.email,
        };
        const res = await apiService.postlogin(
          "school/checkmobileamdemail",
          payload
        );
        console.log(res.data);
        setIsAvailable(res.data);
      }
    } catch (err) {
      if (err.status === 404) {
        alert("दिलेला ई-मेल आणि मोबाईल नंबर आमच्या रेकॉर्डमध्ये आढळला नाही.");
      }
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault(); // Prevent default form submission

    const payload = {
      password: newPassword,
    };

    // Reset previous errors
    setNewPasswordError("");

    // Validate password
    if (!newPassword) {
      setNewPasswordError("कृपया पासवर्ड प्रविष्ट करा.");
      return;
    }

    if (
      !/^(?=[^!@#$%^&+=]*[!@#$%^&+=][^!@#$%^&+=]*$)([A-Za-z0-9]+|[A-Za-z0-9]*[!@#$%^&+=][A-Za-z0-9]*){8,}$/.test(
        newPassword
      )
    ) {
      setNewPasswordError(
        "पासवर्ड ८ अक्षरांचा असावा आणि फक्त इंग्रजी अक्षरे, अंक किंवा फक्त एकच चिन्ह असावीत."
      );
      return;
    }

    try {
      if (resetData.role === "STAFF") {
        const payload = {
          password: newPassword,
        };
        const res = await axios.put(
          `http://localhost:8080/staff/resetpassword/${isAvailable?.id}`,
          payload
        );
        console.log(res);
      } else if (resetData.role === "HEADMASTER") {
        const payload = {
          headMasterPassword: newPassword,
        };
        const res = await axios.put(
          `http://localhost:8080/school/resetpassword/${isAvailable.id}`,
          payload
        );
        console.log(res);
      }

      // Show success alert
      alert("पासवर्ड यशस्वीरित्या बदलण्यात आला.");

      // Close modal after alert is shown
      setTimeout(() => {
        setShowModal(false);
        setResetData({ email: "", mobile: "" });
        setNewPassword("");
        setIsAvailable({});
      }, 100);
    } catch (err) {
      console.error("Password update failed:", err);
      setNewPasswordError(
        "पासवर्ड अपडेट करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा."
      );
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setResetData({ role: "", email: "", mobile: "" });
    setNewPassword("");
    setIsAvailable({});
    setResetFormError({});
    setNewPasswordError("");
  };

  return (
    <div className="login-wrapper">
      {/* Particles background */}
      <div id="particles-js" className="particles-container"></div>

      {/* App Logo */}
      <div className="position-absolute top-0 start-0 p-4">
        <div className="logo-container">
          <h3 className="mb-0 app-title text-white">
            <i className="bi bi-mortarboard-fill me-2 pulse"></i>
          </h3>
        </div>
      </div>

      <Container
        fluid
        className="login-container min-vh-100 d-flex align-items-center justify-content-center py-5"
      >
        <Row className="w-100 justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5} xl={4}>
            <Card
              className={`login-card shadow border-0 rounded-4 overflow-hidden ${
                formAppear ? "fade-in" : ""
              }`}
            >
              <div className="card-header-gradient text-white text-center p-4 position-relative">
                <div className="header-shape"></div>
                <h2 className="mb-1 fw-bold text-shadow "  style={{ position: 'relative', zIndex: 1 }}>शाळा व्यवस्थापन प्रणाली</h2>
                <p className="mb-0 text-light">School Management System</p>
                <div className="floating-icon">
                  <i className="bi bi-mortarboard-fill "></i>
                </div>
              </div>

              <Card.Body className="p-4">
                {error && (
                  <Alert
                    variant="danger"
                    className="mb-4 text-center py-2 small fade-in-fast"
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} className="mt-3">
                  <Form.Group className="mb-4 floating-label-group">
                    <InputGroup className="input-group-custom">
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-person-fill text-primary"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        placeholder="-- वापरकर्तानाव प्रविष्ट करा --"
                        disabled={loading}
                        required
                        className="py-2 border-start-0 form-control-elevated"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4 floating-label-group">
                    <InputGroup className="input-group-custom">
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-key-fill text-primary"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="-- पासवर्ड प्रविष्ट करा --"
                        disabled={loading}
                        required
                        className="py-2 border-start-0 form-control-elevated pe-5"
                      />
                      <Button
                        variant="link"
                        className="password-toggle-btn"
                        onClick={togglePasswordVisibility}
                        type="button"
                      >
                        <i
                          className={`bi bi-eye${
                            showPassword ? "-slash" : ""
                          } text-muted`}
                        ></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group
                    className="mb-4 floating-label-group"
                    controlId="userRole"
                  >
                    <InputGroup className="input-group-custom">
                      <InputGroup.Text className="bg-light border-end-0">
                        <i className="bi bi-person-check-fill text-primary"></i>
                      </InputGroup.Text>
                      <Form.Select
                        name="userType"
                        value={credentials.userType}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="py-2 border-start-0 form-control-elevated"
                      >
                        <option value="">-- भूमिका निवडा --</option>
                        <option value="HEADMASTER">मुख्याध्यापक</option>
                        <option value="STAFF">शिक्षक / लिपिक</option>
                        <option value="DEVELOPER">डेवलपर</option>
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 py-3 mt-2 fw-medium btn-gradient shadow-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        <span>लॉगिन होत आहे...</span>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center">
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        <span>लॉगिन करा</span>
                      </div>
                    )}
                  </Button>

                  <div className="text-end mt-3">
                    <Button
                      variant="link"
                      className="text-decoration-none p-0 text-primary forgot-password-link"
                      onClick={() => setShowModal(true)}
                    >
                      <i className="bi bi-question-circle me-1"></i>
                      पासवर्ड विसरलात?
                    </Button>
                  </div>
                </Form>
              </Card.Body>
              <Card.Footer className="bg-white text-center py-3 border-0">
                <small className="text-muted">
                  &copy; {new Date().getFullYear()} School Management System
                </small>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showModal}
        onHide={resetModal}
        centered
        backdrop="static"
        className="custom-modal"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-primary">
            <i className="bi bi-key me-2"></i>
            पासवर्ड रीसेट
          </Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={isAvailable?.Available ? handlePasswordUpdate : resetSubmit}
        >
          <Modal.Body className="px-4 py-4">
            {!isAvailable?.Available ? (
              <>
                <div className="notice-box mb-4">
                  <Badge bg="warning" className="me-2">
                    महत्त्वाची सूचना
                  </Badge>
                  <span className="text-muted small">
                    कृपया आपला नोंदणीकृत ई-मेल आणि मोबाईल नंबर प्रविष्ट करा.
                  </span>
                </div>

                <Form.Group
                  className="mb-3 floating-label-group"
                  controlId="userRole"
                >
                  <InputGroup className="input-group-custom">
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="bi bi-person-badge text-primary"></i>
                    </InputGroup.Text>
                    <Form.Select
                      name="role"
                      value={resetData.role}
                      onChange={handleResetChange}
                      required
                      disabled={loading}
                      className="py-2 border-start-0 form-control-elevated"
                    >
                      <option value="">-- भूमिका निवडा --</option>
                      <option value="HEADMASTER">मुख्याध्यापक</option>
                      <option value="STAFF">शिक्षक / लिपिक</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3 floating-label-group">
                  <InputGroup className="input-group-custom">
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="bi bi-at text-primary"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      value={resetData.email}
                      onChange={handleResetChange}
                      placeholder="-- ई-मेल प्रविष्ट करा --"
                      disabled={loading}
                      required
                      className="py-2 border-start-0 form-control-elevated"
                    />
                  </InputGroup>
                  {resetFormError.email && (
                    <div className="text-danger small mt-1 error-message">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {resetFormError.email}
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 floating-label-group">
                  <InputGroup className="input-group-custom">
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="bi bi-telephone-fill text-primary"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="mobile"
                      value={resetData.mobile}
                      onChange={handleResetChange}
                      placeholder="-- मोबाईल क्रमांक प्रविष्ट करा --"
                      disabled={loading}
                      required
                      className="py-2 border-start-0 form-control-elevated"
                    />
                  </InputGroup>
                  {resetFormError.mobile && (
                    <div className="text-danger small mt-1 error-message">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {resetFormError.mobile}
                    </div>
                  )}
                </Form.Group>
              </>
            ) : (
              <>
                <Alert variant="success" className="mb-4 success-alert">
                  <Alert.Heading className="h6">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    वापरकर्ता सत्यापित
                  </Alert.Heading>
                  <p className="mb-0 small">कृपया आपला नवीन पासवर्ड सेट करा.</p>
                </Alert>

                <Form.Group className="mb-3 floating-label-group">
                  <InputGroup className="input-group-custom">
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="bi bi-key-fill text-primary"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      isInvalid={
                        newPassword &&
                        !/^(?=[^!@#$%^&+=]*[!@#$%^&+=][^!@#$%^&+=]*$)([A-Za-z0-9]+|[A-Za-z0-9]*[!@#$%^&+=][A-Za-z0-9]*){8,}$/.test(
                          newPassword
                        )
                      }
                      placeholder="-- नवीन पासवर्ड प्रविष्ट करा --"
                      required
                      className="py-2 border-start-0 form-control-elevated pe-5"
                    />
                    <Button
                      variant="link"
                      className="password-toggle-btn"
                      onClick={togglePasswordVisibility}
                      type="button"
                    >
                      <i
                        className={`bi bi-eye${
                          showPassword ? "-slash" : ""
                        } text-muted`}
                      ></i>
                    </Button>
                  </InputGroup>

                  <div className="password-info mt-2">
                    <i className="bi bi-info-circle me-1 text-primary"></i>
                    <span className="text-muted small">
                      पासवर्ड ८ अक्षरांचा असावा आणि फक्त इंग्रजी अक्षरे, अंक
                      किंवा फक्त एकच चिन्ह असावीत.
                    </span>
                  </div>

                  {newPasswordError && (
                    <div className="text-danger small mt-1 error-message">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {newPasswordError}
                    </div>
                  )}
                </Form.Group>
              </>
            )}
          </Modal.Body>

          <Modal.Footer className="border-top-0">
            <Button
              variant="outline-secondary"
              onClick={resetModal}
              className="btn-cancel"
            >
              <i className="bi bi-x-circle me-1"></i>
              बंद करा
            </Button>
            <Button variant="primary" type="submit" className="btn-gradient">
              {isAvailable?.Available ? (
                <>
                  <i className="bi bi-check2-circle me-1"></i>
                  पासवर्ड अपडेट करा
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-right-circle me-1"></i>
                  पुढे जा
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
