import React, { use, useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import apiService from '../services/api.service';


const NewSchool = () => {
    const [allSchool, setAllSchool] = useState([]);

    const [allRoles, setAllRoles] = useState([]);
    const [allBranches, setAllBranches] = useState([]);
    const [filterDepartment, setFilterDepartment] = useState([]);
    const [filterRole, setFilterRole] = useState([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const [existingUsers, setExistingUsers] = useState([]);

    useEffect(() => {


        const fetchHm = async () => {
            try {
                const response = await apiService.getdata("school/");

                // if (response.data && Array.isArray(response.data)) {
                //     // Loop through each school object and extract the logo
                //     response.data.forEach(school => {
                //         if (school.logo) {
                //             // If the school has a logo, create an image element
                //             const imgElement = document.createElement('img');
                //             imgElement.src = `data:image/jpeg;base64,${school.logo}`; // Assuming it's a JPEG image
                //             document.body.appendChild(imgElement); // Append image to the body
                //             console.log("Blob URL:", school.logo);
                //         } else {
                //             console.log(`No logo for UDISE No ${school.udiseNo}`);
                //         }
                //     });
                // }
                // response.data.forEach(school => {
                //     if (school.headMasterName) {
                //         console.log("U N:", school.headMasterName);
                //     } else {
                //         console.log(`No logo for UDISE No ${school.headMasterName}`);
                //     }
                // });
                if (Array.isArray(response.data)) {
                    response.data.forEach(school => {
                        // Look for headMasterName or any nested structure that might hold it
                        console.log("School Data:", school);
        
                        // Check if headMasterName exists (or if it is nested inside another field)
                        if (school.headMasterName) {
                            console.log("HeadMasterName:", school.headMasterName);
                            setExistingUsers(school.headMasterName);
                        } else {
                            console.log("No headMasterName for school with udiseNo:", school.udiseNo);
                        }
                })}
                console.log(existingUsers)
                const school = response.data || [];
                if (school.length === 0) {
                    console.warn("No data found");
                } else {
                    setAllSchool(school);
                    console.log(school);
                }
                console.log(response.data.
                    headMasterName
                )

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchHm();

        // const fetchDepartments = async () => {
        //   try {
        //     const response = await DepartmentService.getDepartments();
        //     const department = response.data || []; // Ensure it's an array if data is null or undefined

        //     if (department.length === 0) {
        //       console.warn('No department found, setting fallback value.');
        //       setAllDepartments([{ id: 0, name: 'No department available' }]); // Placeholder category
        //     } else {
        //       setAllDepartments(department);
        //     }
        //   } catch (error) {
        //     console.error('Failed to fetch departments:', error);
        //   }
        // };
        // const fetchRoles = async () => {
        //   try {
        //     const response = await RoleService.getRole();
        //     // const response = ["await RoleService.getRole();"]
        //     const roles = response.data || []; // Ensure it's an array if data is null or undefined
        //     console.log(response)
        //     if (roles.length === 0) {
        //       console.warn('No roles found, setting fallback value.');
        //       setAllRoles([{ id: 0, name: 'No roles available' }]); // Placeholder category
        //     } else {
        //       setAllRoles(roles);
        //       console.log(allRoles)
        //     }
        //   } catch (error) {
        //     console.error('Failed to fetch roles:', error);
        //   }
        // };

        // const fetchBranches = async () => {
        //   try {
        //     const response = await BranchService.getBranches();
        //     const branches = response.data || []; // Ensure it's an array if data is null or undefined

        //     if (branches.length === 0) {
        //       console.warn('No branches found, setting fallback value.');
        //       setAllBranches([{ id: 0, name: 'No branches available' }]); // Placeholder category
        //     } else {
        //       setAllBranches(branches);
        //     }
        //   } catch (error) {
        //     console.error('Failed to fetch branches:', error);
        //   }
        // };

        // fetchBranches()
        // fetchRoles()
        // fetchDepartments()
    }, []);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        schoolName: '',
        lastName: '',
        phone: '',
        branch: '',
        branchName: '',
        department: '',
        role: '',
        password: '',
        confirmPassword: '',
        logo: ''
    });

    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null);

    // Simulated department and role lists (would typically come from backend)
    const branch = [
        { id: 'Head Office', name: 'Head Office' },
        { id: 'Sub Branches', name: 'Sub Branches' },
    ];

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            logo: e.target.files[0]  // This captures the file object
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prevState => ({
            ...prevState,
            [name]: value

        }));

        console.log(existingUsers);
        if(name == 'username' && value){
            if (existingUsers.includes(value)) {
                setErrors({
                    ...errors,
                    username: 'This username already exists'
                });
                console.log('This username already exists')
            } else {
                // Clear error if fixed
                const updatedErrors = {...errors};
                delete updatedErrors.username;
                setErrors(updatedErrors);
            }
        }

    };

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username || formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters long';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password || formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        // Branch validation
        // Branch Validation
        if (!formData.department && !formData.branchName) {
            newErrors.branchName = "Please select a branch name or department";
            newErrors.department = "Please select a branch name or department";
        }

        // Department validation
        // if (!formData.department) {
        //   newErrors.department = 'Please select a department';
        // }

        // Role validation
        if (!formData.role) {
            newErrors.role = 'Please select a role';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            try {
                // Simulated API call - replace with actual backend integration

                // const userData = {
                //     udiseNo: formData.schoolUdise,
                //     schoolName: formData.schoolName,
                //     sansthaName: formData.orgName,
                //     headMasterName: formData.username,
                //     schoolEmailId: formData.email,
                //     headMasterMobileNo: formData.phone,
                //     headMasterPassword: formData.password,
                //     schoolPlace: "hsdf",
                //     board: "sdfs",
                //     boardDivision: "sd",
                //     boardIndexNo: 89,
                //     schoolApprovalNo: 1,
                //     createdAt: 20 - 12 - 20,
                //     state:1,

                //     district:1,

                //     tehsil:1,

                //     village:1,

                //     pinCode:1,
                //     medium:"efdsfsd",
                //     logo:formData.logo
                //     // roleId: formData.role,
                // }

                // try {
                //     const config = {
                //         headers: {
                //             'Content-Type': 'multipart/form-data'  // This ensures the server knows the body is JSON
                //         }
                //     };
                //     console.log(userData)
                //     await apiService.createHm('school/', userData,config);
                //     setSubmitStatus({
                //         type: 'success',
                //         message: 'User account created successfully!'
                //     });

                //     toast.success('User created successfully!', {
                //         position: "top-right",
                //         autoClose: 3000,
                //         hideProgressBar: false,
                //         closeOnClick: true,
                //         pauseOnHover: true,
                //         draggable: true,
                //     });
                // }
                // catch (error) {
                //     const errorMessage = error.response?.data?.message || 'Failed to create User';
                //     toast.error(errorMessage, {
                //         position: "top-right",
                //         autoClose: 5000,
                //         hideProgressBar: false,
                //         closeOnClick: true,
                //         pauseOnHover: true,
                //         draggable: true,
                //     });
                // }
                const userData = new FormData();
                userData.append('schoolDto', JSON.stringify({
                    udiseNo: formData.schoolUdise,
                    schoolName: formData.schoolName,
                    sansthaName: formData.orgName,
                    headMasterName: formData.username,
                    schoolEmailId: formData.email,
                    headMasterMobileNo: formData.phone,
                    headMasterPassword: formData.password,
                    schoolPlace: "hsdf",
                    board: "sdfs",

                }));

                // Add the logo file if it exists
                if (formData.logo) {
                    userData.append('logo', formData.logo);
                }

                // Set the correct headers for multipart/form-data
                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                };

                // Send the request
                try {
                    console.log(userData); // Check data before sending
                    await apiService.createHm('school/', userData, config);
                    setSubmitStatus({
                        type: 'success',
                        message: 'User account created successfully!'
                    });
                } catch (error) {
                    console.error(error);
                    setSubmitStatus({
                        type: 'error',
                        message: 'There was an error during submission.'
                    });
                }

                //  Reset form after successful submission
                // setFormData({
                //     username: '',
                //     email: '',
                //     schoolUdise:'',
                //     schoolName: '',
                //     orgName: '',
                //     phone: '',
                //     role: '',
                //     password: '',
                //     confirmPassword: ''
                // });
            } catch (error) {
                setSubmitStatus({
                    type: 'danger',
                    message: error.message || 'Failed to create user account'
                });
            }
        }
    };

    return (
        <Container className="mt-5" >
            <Row className="justify-content-md-center">
                <Col md={12} lg={12}>
                    <Card>
                        <Card.Header as="h3" className="text-center">
                            मुख्याध्यापक खाते तयार करा
                        </Card.Header>
                        <Card.Body>
                            {submitStatus && (
                                <Alert variant={submitStatus.type}>
                                    {submitStatus.message}
                                </Alert>
                            )}
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>शाळेचा UDISE क्रमांक</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="schoolUdise"
                                                value={formData.schoolUdise}
                                                onChange={handleChange}
                                                placeholder="शाळेचा UDISE क्रमांक प्रविष्ट करा"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>संस्थेचे नाव</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="orgName"
                                                value={formData.orgName}
                                                onChange={handleChange}
                                                placeholder="संस्थेचे नाव प्रविष्ट करा"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>


                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>शाळेचे नाव</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="schoolName"
                                                value={formData.schoolName}
                                                onChange={handleChange}
                                                placeholder="शाळेचे नाव प्रविष्ट करा"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>मुख्याध्यापक वापरकर्तानाव</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                placeholder="वापरकर्तानाव प्रविष्ट करा"
                                                isInvalid={!!errors.username}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.username}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row >

                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>शाळेचा ईमेल</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="शाळेचा ईमेल प्रविष्ट करा"
                                                isInvalid={!!errors.email}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.email}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>मुख्याध्यापकांचा फोन नंबर</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="भ्रमणध्वनी क्रमांक प्रविष्ट करा"
                                            />
                                        </Form.Group>
                                    </Col>
                                    {/* <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Branch</Form.Label>
                    <Form.Select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      isInvalid={!!errors.branch}
                    >
                      <option value="">Select Branch</option>
                      {branch.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.branch}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col> */}
                                </Row>
                                <Row>
                                    {/* <Col> */}
                                    {/* Conditional Rendering */}
                                    {/* {formData.branch === "Sub Branches" ? (
                    <Form.Group className="mb-3">
                      <Form.Label>Branch Name</Form.Label>
                      <Form.Select
                        name="branchName"
                        value={formData.branchName}
                        onChange={handleChange}
                        isInvalid={!!errors.branchName}

                      >
                        <option value="">Select Branch Name</option>
                        {Array.isArray(allBranches) && allBranches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.branchname}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.branchName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  ) : (
                    <Form.Group className="mb-3">
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        isInvalid={!!errors.department}

                      >
                        <option value="">Select Department</option>
                        {Array.isArray(allDepartments) && allDepartments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.departmentName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  )} */}
                                    {/* </Col> */}

                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>भूमिका</Form.Label>
                                            <Form.Select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                isInvalid={!!errors.role}
                                            >
                                                <option value="">भूमिका निवडा</option>
                                                <option value={"Head Master"}>Head Master</option>
                                                {/* {Array.isArray(allRoles) && allRoles.map(role => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.roleName}
                                                    </option>
                                                ))} */}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errors.role}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>पासवर्ड</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="पासवर्ड प्रविष्ट करा"
                                                isInvalid={!!errors.password}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.password}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>logo</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="logo"
                                                onChange={(e) => handleFileChange(e)}
                                                placeholder="logo प्रविष्ट करा"
                                                isInvalid={!!errors.password}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.password}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group className="mb-3">
                                            <Form.Label>पासवर्डची पुष्टी करा</Form.Label>
                                            <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="पासवर्डची पुष्टी करा"
                                                isInvalid={!!errors.confirmPassword}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.confirmPassword}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button variant="primary" type="submit" className="w-100">
                                    खाते तयार करा
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default NewSchool;