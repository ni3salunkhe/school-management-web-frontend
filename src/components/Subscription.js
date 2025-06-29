import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Badge,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import {
  FaCalendarAlt,
  FaSchool,
  FaRegClock,
  FaTimes,
  FaArrowRight,
  FaPlus,
  FaTrash,
  FaCheck,
} from "react-icons/fa";
import apiService from "../services/api.service";
import { format, addYears, subDays } from "date-fns";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Next from "./Next";

const Subscription = () => {
  const [schools, setSchools] = useState([]);
  const [errors, setErrors] = useState({});
  const [isExpired, setIsExpired] = useState(false);
  const [flag, setFlag] = useState("");
  const [buttonText, setButtonText] = useState("मंजूर करा");
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [existingSubscriptions, setExistingSubscriptions] = useState([]);
  const navigate = useNavigate();

  const fetchSchools = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getdata("school/");
      if (Array.isArray(response.data)) {
        setSchools(response.data);
      }
      if (response.data.length === 0) {
        console.warn("No data found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error!",
        text: "शाळांची माहिती लोड करताना त्रुटी आली",
        icon: "error",
        confirmButtonText: "ठीक आहे",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getdata("modulemaster/");
      if (Array.isArray(response.data)) {
        setModules(response.data);
      }
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        title: "Error!",
        text: "मॉडुलची माहिती लोड करताना त्रुटी आली",
        icon: "error",
        confirmButtonText: "ठीक आहे",
      });
    }
  };

  useEffect(() => {
    fetchSchools();
    fetchModules();
  }, []);

  const [formData, setFormData] = useState({
    udiseNumber: "",
    startdate: "",
    enddate: "",
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "startdate" && value) {
      setFormData((prevState) => ({
        ...prevState,
        enddate: format(subDays(addYears(new Date(value), 1), 1), "yyyy-MM-dd"),
      }));
    }

    if (name === "udiseNumber" && value) {
      setIsLoading(true);
      try {
        const response = await apiService.getbyid(
          "api/subscription/check/",
          value
        );
        console.log("Subscription check:", response.data);

        const data = await apiService.getdata(
          `api/subscription/modules/${value}`
        );
        console.log("Module subscription data:", data.data);

        // Always clear previous errors
        setErrors((prev) => ({ ...prev, udiseNumber: "" }));

        if (response.data === true) {
          setIsExpired(true);
          setFlag("renew");
          setButtonText("पुनर्नविनीत करणे");

          const allModules = Array.isArray(data.data) ? data.data : [];

          // Filter only expired modules
          const expiredModules = allModules.filter(
            (mod) => new Date(mod.subscriptionEndDate) < new Date()
          );

          setExistingSubscriptions(expiredModules);

          // Auto-select expired modules for editing
          const today = new Date();
          const start = format(today, "yyyy-MM-dd");
          const end = format(subDays(addYears(today, 1), 1), "yyyy-MM-dd");

          const preSelected = expiredModules.map((mod) => ({
            id: mod.moduleId.id,
            moduleName: mod.moduleId.moduleName,
            startdate: start,
            enddate: end,
          }));

          setSelectedModules(preSelected);

          setFormData((prevState) => ({
            ...prevState,
            startdate: start,
            enddate: end,
          }));
        } else if (response.data === false) {
          setIsExpired(false);
          setFlag("");
          setButtonText("मंजूर करा");
          setExistingSubscriptions([]); // No expired ones to renew
          setSelectedModules([]); // Clear any previous selection
          setErrors({
            ...errors,
            udiseNumber:
              "आपण आधीच सदस्यता घेतली आहे! या शाळेसाठी सदस्यता अद्याप संपलेली नाही.",
          });
        } else {
          setIsExpired(true);
          setFlag("");
          setButtonText("मंजूर करा");
          setExistingSubscriptions([]);
          setSelectedModules([]);
          setErrors({
            ...errors,
            udiseNumber: `${response.data}`,
          });
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        Swal.fire({
          title: "त्रुटी!",
          text: "सदस्यता तपासताना त्रुटी आली.",
          icon: "error",
          confirmButtonText: "ठीक आहे",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleModuleSelection = (moduleId) => {
    const module = modules.find((m) => m.id === parseInt(moduleId));
    if (!module) return;

    // Check if module is already selected
    const isAlreadySelected = selectedModules.some((m) => m.id === module.id);

    if (isAlreadySelected) {
      Swal.fire({
        title: "सूचना",
        text: "हा मॉड्यूल आधीच निवडला आहे",
        icon: "info",
        confirmButtonText: "ठीक आहे",
      });
      return;
    }

    // Add module with default dates
    const newModule = {
      ...module,
      startdate: formData.startdate,
      enddate: formData.enddate,
    };

    setSelectedModules((prev) => [...prev, newModule]);
  };

  const removeModule = (moduleId) => {
    setSelectedModules((prev) => prev.filter((m) => m.id !== moduleId));
  };

  const updateModuleDates = (moduleId, field, value) => {
    setSelectedModules((prev) =>
      prev.map((module) => {
        if (module.id === moduleId) {
          const updatedModule = { ...module, [field]: value };

          // Auto-calculate end date if start date is changed
          if (field === "startdate" && value) {
            updatedModule.enddate = format(
              subDays(addYears(new Date(value), 1), 1),
              "yyyy-MM-dd"
            );
          }

          return updatedModule;
        }
        return module;
      })
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.udiseNumber) {
      newErrors.udiseNumber = "कृपया शाळेचा Udise क्रमांक निवडा";
    }

    if (selectedModules.length === 0) {
      newErrors.modules = "कृपया किमान एक मॉड्यूल निवडा";
    }

    // Validate each selected module
    selectedModules.forEach((module, index) => {
      if (!module.startdate) {
        newErrors[
          `module_${module.id}_startdate`
        ] = `${module.moduleName} साठी प्रारंभ तारीख आवश्यक आहे`;
      }
      if (!module.enddate) {
        newErrors[
          `module_${module.id}_enddate`
        ] = `${module.moduleName} साठी समाप्त तारीख आवश्यक आहे`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const result = await Swal.fire({
        title: "नोंदण करायची आहे का?",
        html: `
                    <div class="text-left">
                        <p><strong>शाळा:</strong> ${
                          schools.find(
                            (s) => s.udiseNo === Number(formData.udiseNumber)
                          )?.schoolName
                        }</p>
                        <p><strong>निवडलेले मॉड्यूल:</strong> ${
                          selectedModules.length
                        }</p>
                        <ul>
                            ${selectedModules
                              .map((m) => `<li>${m.moduleName}</li>`)
                              .join("")}
                        </ul>
                    </div>
                `,
        icon: "question",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "जतन करा",
        denyButtonText: "जतन करा आणि पुढे चला",
        cancelButtonText: "रद्द करा",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });

      if (result.isConfirmed || result.isDenied) {
        setIsLoading(true);
        try {
          // Prepare data for multiple modules
          const subscriptionData = selectedModules.map((module) => ({
            udiseNumber: formData.udiseNumber,
            moduleId: module.id,
            startdate: module.startdate,
            enddate: module.enddate,
          }));

          if (flag === "renew") {
            // Handle renewal for multiple modules
            for (const moduleData of subscriptionData) {
              await apiService.post("api/subscription/renew", moduleData);
            }
            await Swal.fire({
              title: "सदास्यता माहिती यशस्वीरीत्या संपादित केली आहे!",
              text: `${selectedModules.length} मॉड्यूल यशस्वीरीत्या नूतनीकरण केले`,
              icon: "success",
              confirmButtonColor: "#3085d6",
            });
            setButtonText("मंजूर करा");
            setFlag("");
          } else {
            // Handle new subscription for multiple modules
            for (const moduleData of subscriptionData) {
              await apiService.post("api/subscription/create", moduleData);
            }
            await Swal.fire({
              title: "सदस्यता यशस्वीरीत्या नोंदवली आहे!",
              text: `${selectedModules.length} मॉड्यूल यशस्वीरीत्या नोंदवले`,
              icon: "success",
              confirmButtonColor: "#3085d6",
            });
          }

          fetchSchools();

          // Reset form
          setFormData({
            udiseNumber: "",
            startdate: "",
            enddate: "",
          });
          setSelectedModules([]);
          setExistingSubscriptions([]);

          if (result.isDenied) {
            navigate("/developer");
          }
        } catch (error) {
          console.error("Error:", error);
          Swal.fire({
            title: "त्रुटी!",
            text: "डेटा जतन करण्यात अडचण आली.",
            icon: "error",
            confirmButtonColor: "#3085d6",
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  return (
    <Container
      fluid
      className="subscription-container bg-light min-vh-100 d-flex justify-content-center align-items-center py-5"
    >
      <Card
        className="subscription-card border-0 shadow-lg rounded-lg"
        style={{ maxWidth: "900px", width: "100%" }}
      >
        <Card.Header className="text-center text-white py-4 rounded-top bg-primary">
          <div className="d-flex justify-content-between align-items-center">
            <div style={{ width: "30px" }}></div>
            <h3 className="m-0 fw-bold">सदस्यता नविनीकरण</h3>
            <Button
              variant="link"
              className="p-0 text-white"
              onClick={() => navigate("/developer/school")}
              style={{ width: "30px" }}
            >
              <FaTimes size={20} />
            </Button>
          </div>
        </Card.Header>

        <Card.Body className="p-4">
          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">लोड होत आहे...</p>
            </div>
          )}

          {!isLoading && (
            <Form onSubmit={handleSubmit}>
              {/* School Selection Section */}
              <div className="card mb-4 border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <h5 className="d-flex align-items-center gap-2 border-bottom pb-3 mb-4 fw-bold text-primary">
                    <FaSchool className="me-2" />
                    शाळेची माहिती
                  </h5>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">
                      शाळेचा Udise क्रमांक
                    </Form.Label>
                    <Form.Select
                      name="udiseNumber"
                      onChange={handleChange}
                      value={formData.udiseNumber}
                      isInvalid={!!errors.udiseNumber}
                      className="form-select-lg rounded-3 border-light-subtle"
                    >
                      <option value="">शाळा निवडा</option>
                      {Array.isArray(schools) &&
                        schools.map((school) => (
                          <option key={school.udiseNo} value={school.udiseNo}>
                            {school.schoolName}
                          </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.udiseNumber}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>

              {/* Module Selection Section */}
              <div className="card mb-4 border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <h5 className="d-flex align-items-center gap-2 border-bottom pb-3 mb-4 fw-bold text-primary">
                    <FaRegClock className="me-2" />
                    मॉड्यूल निवड
                    <Badge bg="info" className="ms-2">
                      {selectedModules.length} निवडले
                    </Badge>
                  </h5>

                  <Row className="mb-3">
                    <Col md={10}>
                      <Form.Select
                        className="form-select-lg rounded-3 border-light-subtle"
                        onChange={(e) => handleModuleSelection(e.target.value)}
                        value=""
                      >
                        <option value="">मॉड्यूल निवडा</option>
                        {modules.map((module) => (
                          <option key={module.id} value={module.id}>
                            {module.moduleName}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>

                  {errors.modules && (
                    <div className="text-danger mb-3">{errors.modules}</div>
                  )}

                  {/* Display existing subscriptions */}
                  {existingSubscriptions.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-muted mb-3">सध्याचे सदस्यता:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {existingSubscriptions.map((sub, index) => (
                          <Badge key={index} bg="secondary" className="p-2">
                            <FaCheck className="me-1" />
                            {sub.moduleName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Modules List */}
                  {selectedModules.length > 0 && (
                    <div>
                      <h6 className="text-primary mb-3">निवडलेले मॉड्यूल:</h6>
                      <ListGroup>
                        {selectedModules.map((module) => (
                          <ListGroup.Item
                            key={module.id}
                            className="border-0 shadow-sm rounded-3 mb-3"
                          >
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="mb-0 text-primary fw-bold">
                                {module.moduleName}
                              </h6>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeModule(module.id)}
                              >
                                <FaTrash />
                              </Button>
                            </div>

                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label className="fw-medium">
                                    प्रारंभ तारीख
                                  </Form.Label>
                                  <Form.Control
                                    type="date"
                                    value={module.startdate}
                                    onChange={(e) =>
                                      updateModuleDates(
                                        module.id,
                                        "startdate",
                                        e.target.value
                                      )
                                    }
                                    isInvalid={
                                      !!errors[`module_${module.id}_startdate`]
                                    }
                                    className="form-control-lg rounded-3 border-light-subtle"
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {errors[`module_${module.id}_startdate`]}
                                  </Form.Control.Feedback>
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label className="fw-medium">
                                    समाप्त तारीख
                                  </Form.Label>
                                  <Form.Control
                                    type="date"
                                    value={module.enddate}
                                    onChange={(e) =>
                                      updateModuleDates(
                                        module.id,
                                        "enddate",
                                        e.target.value
                                      )
                                    }
                                    isInvalid={
                                      !!errors[`module_${module.id}_enddate`]
                                    }
                                    className="form-control-lg rounded-3 border-light-subtle"
                                    readOnly
                                  />
                                  <Form.Control.Feedback type="invalid">
                                    {errors[`module_${module.id}_enddate`]}
                                  </Form.Control.Feedback>
                                  <Form.Text className="text-muted">
                                    सदस्यता एक वर्षासाठी वैध आहे
                                  </Form.Text>
                                </Form.Group>
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="d-flex justify-content-center mt-4">
                <Button
                  type="submit"
                  className="px-5 py-3 rounded-pill fw-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                    border: "none",
                    minWidth: "200px",
                  }}
                  disabled={isLoading || selectedModules.length === 0}
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
                      प्रक्रिया चालू आहे...
                    </>
                  ) : (
                    <>
                      {buttonText} ({selectedModules.length} मॉड्यूल){" "}
                      <FaArrowRight className="ms-2" />
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Subscription;
