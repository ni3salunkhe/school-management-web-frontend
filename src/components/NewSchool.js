import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
// import { toast } from 'react-toastify'; // Assuming you might use toast later
import apiService from '../services/api.service';
import Swal from 'sweetalert2';
import Next from './Next';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsernames } from '../services/fetchAllUsernames';

const NewSchool = () => {
    // ... (keep existing useState hooks: allSchool, isDisabled, existingUsers, etc.) ...
    const [allSchool, setAllSchool] = useState([]);
    const [isDisabled, setIsDisabled] = useState(false); // Not used currently, but keep if needed later
    const [existingUsers, setExistingUsers] = useState([]);
    const [existingUdiseno, setExistingUdiseno] = useState([]);
    const [existingSchool, setExistingSchool] = useState([]);
    const [existingEmail, setExistingEmail] = useState([]);
    const [existingPhone, setExistingPhone] = useState([]);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        schoolUdise: '',
        schoolName: '',
        username: '',
        email: '',
        orgName: '', // Corrected: was listed twice before
        phone: '',
        role: 'HEADMASTER', // Default role
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null);

    const isEnglish = (text) => {
        // Allow spaces in names/orgs if needed, but strictly English for username/email/password
        // Adjust regex as needed. This one allows letters, numbers, and common symbols.
        return /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?\s]*$/.test(text);
    };

    const isStrictlyEnglish = (text) => {
        // No spaces allowed for username, email, password
        return /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(text);
    }


    const loadUsernames = async () => {
        try {
            const usernames = await fetchAllUsernames();
            // Ensure usernames are trimmed and lowercased for consistent comparison
            setExistingUsers(usernames.map(u => u.trim().toLowerCase()));
        } catch (error) {
            console.error("Error loading usernames:", error);
            // Handle error appropriately, maybe show a toast/alert
        }
    };

    const fetchSchoolData = async () => { // Renamed for clarity
        try {
            const response = await apiService.getdata("school/");
            const schools = response.data || [];
            if (!Array.isArray(schools)) {
                console.error("Expected an array of schools, but received:", schools);
                return; // Exit if data is not as expected
            }

            if (schools.length === 0) {
                console.warn("No school data found");
            } else {
                setAllSchool(schools); // Keep the full school data if needed elsewhere
                // Extract specific fields for validation checks
                const udisenos = schools.map(s => s.udiseNo).filter(Boolean); // Filter out null/undefined
                const schoolNames = schools.map(s => s.schoolName?.trim().toLowerCase()).filter(Boolean);
                const emails = schools.map(s => s.schoolEmailId?.trim().toLowerCase()).filter(Boolean);
                const phones = schools.map(s => s.headMasterMobileNo).filter(Boolean);

                setExistingUdiseno(udisenos);
                setExistingSchool(schoolNames);
                setExistingEmail(emails);
                setExistingPhone(phones);
            }

        } catch (error) {
            console.error("Error fetching school data:", error);
            // Handle error appropriately
        }
    };

    useEffect(() => {
        fetchSchoolData();
        loadUsernames();
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Refactored handleChange ---
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Update form data state first
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        // Use functional update for errors to ensure atomicity
        setErrors(prevErrors => {
            const updatedErrors = { ...prevErrors };

            // --- Clear previous error for the current field ---
            // This allows re-validation every time the field changes
            delete updatedErrors[name];

            // --- Field-Specific Validations ---

            // School UDISE
            if (name === 'schoolUdise') {
                if (!value) {
                    updatedErrors.schoolUdise = 'UDISE नंबर प्रविष्ट करणे आवश्यक आहे';
                } else if (!/^[0-9]+$/.test(value)) { // Must contain only numbers and be non-empty
                    updatedErrors.schoolUdise = 'कृपया केवळ इंग्रजी अंक प्रविष्ट करा';
                } else {
                    const numValue = Number(value);
                    if (existingUdiseno.some(existing => existing === numValue)) {
                        updatedErrors.schoolUdise = 'हे शाळेचे UDISE संख्या आधीच अस्तित्वात आहे';
                    }
                }
            }

            // School Name
            if (name === 'schoolName') {
                if (!value) {
                    updatedErrors.schoolName = 'शाळेचे नाव प्रविष्ट करणे आवश्यक आहे';
                 } // Removed English check - school names can be in Marathi
                 else if (value && existingSchool.includes(value.trim().toLowerCase())) {
                     updatedErrors.schoolName = 'हे शाळेचे नाव आधीच अस्तित्वात आहे';
                 }
            }

             // Org Name
             if (name === 'orgName') {
                if (!value) {
                    updatedErrors.orgName = 'संस्थेचे नाव प्रविष्ट करणे आवश्यक आहे';
                }
                // Removed English check - org names can be in Marathi
            }


            // Username
            if (name === 'username') {
                if (!value) {
                    updatedErrors.username = 'वापरकर्तानाव प्रविष्ट करणे आवश्यक आहे';
                } else if (value.length < 3) {
                    updatedErrors.username = 'वापरकर्तानाव किमान ३ अक्षरे असावे लागते';
                } else if (!isStrictlyEnglish(value)) {
                     updatedErrors.username = 'कृपया केवळ इंग्रजी अक्षरे/अंक/चिन्हे वापरा (Please use only English characters/numbers/symbols)';
                 } else if (existingUsers.includes(value.trim().toLowerCase())) {
                    updatedErrors.username = 'हे वापरकर्ता नाव आधीच अस्तित्वात आहे';
                }
            }

            // Email
            if (name === 'email') {
                 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value) {
                    updatedErrors.email = 'ईमेल प्रविष्ट करणे आवश्यक आहे';
                 } else if (!isStrictlyEnglish(value)) { // Email must be English chars
                     updatedErrors.email = 'कृपया केवळ इंग्रजी अक्षरे/अंक/चिन्हे वापरा';
                 } else if (!emailRegex.test(value)) {
                     updatedErrors.email = 'कृपया वैध ईमेल पत्ता प्रविष्ट करा';
                 } else if (existingEmail.includes(value.trim().toLowerCase())) {
                    updatedErrors.email = 'हे ईमेल आधीच अस्तित्वात आहे';
                }
            }

            // Phone
            if (name === 'phone') {
                 if (!value) {
                    updatedErrors.phone = 'फोन नंबर प्रविष्ट करणे आवश्यक आहे';
                 } else if (!/^[0-9]+$/.test(value)) { // Should only contain digits
                    updatedErrors.phone = 'कृपया केवळ इंग्रजी अंक प्रविष्ट करा';
                 } else if (!/^[6-9]\d{9}$/.test(value)) {
                    updatedErrors.phone = 'कृपया १० अंकी वैध भारतीय मोबाईल नंबर प्रविष्ट करा';
                 } else if (existingPhone.includes(value)) { // Assuming existingPhone contains strings
                    updatedErrors.phone = 'हा फोन नंबर आधीच अस्तित्वात आहे';
                }
            }

            // Password
            if (name === 'password') {
                if (!value) {
                    updatedErrors.password = 'पासवर्ड प्रविष्ट करणे आवश्यक आहे';
                 } else if (value.length < 8) {
                     updatedErrors.password = 'पासवर्ड किमान ८ अक्षरे असावे लागते';
                 } else if (!isStrictlyEnglish(value)) {
                     updatedErrors.password = 'कृपया केवळ इंग्रजी अक्षरे/अंक/चिन्हे वापरा';
                 }
                 // Check confirm password if it has a value
                 if (formData.confirmPassword && value !== formData.confirmPassword) {
                     updatedErrors.confirmPassword = 'पासवर्ड जुळत नाहीत';
                 } else if (formData.confirmPassword && value === formData.confirmPassword) {
                     delete updatedErrors.confirmPassword; // Clear error if they now match
                 }
            }

            // Confirm Password
            if (name === 'confirmPassword') {
                 if (!value) {
                    updatedErrors.confirmPassword = 'पासवर्डची पुष्टी करणे आवश्यक आहे';
                 } else if (formData.password !== value) {
                    updatedErrors.confirmPassword = 'पासवर्ड जुळत नाहीत';
                 } else if (!isStrictlyEnglish(value)) { // Also check characters here
                    updatedErrors.confirmPassword = 'कृपया केवळ इंग्रजी अक्षरे/अंक/चिन्हे वापरा';
                }
            }

            return updatedErrors; // Return the updated error object
        });
    };


    // --- validateForm (Runs on Submit) ---
    // This provides a final check before submission
    const validateForm = () => {
        // Trigger handleChange for all fields to populate errors based on current formData
        // This isn't ideal but ensures all current values are checked by the live validation logic
        // A better approach might be to duplicate the logic, but this is simpler for now.
        // Or, simply check the current `errors` state.

        const currentErrors = { ...errors }; // Start with errors found during typing
        const data = { ...formData }; // Use current form data

        // Add checks for fields that might be empty on submit but weren't typed into yet
        if (!data.schoolUdise) currentErrors.schoolUdise = 'UDISE नंबर प्रविष्ट करणे आवश्यक आहे';
        if (!data.schoolName) currentErrors.schoolName = 'शाळेचे नाव प्रविष्ट करणे आवश्यक आहे';
        if (!data.orgName) currentErrors.orgName = 'संस्थेचे नाव प्रविष्ट करणे आवश्यक आहे';
        if (!data.username) currentErrors.username = 'वापरकर्तानाव प्रविष्ट करणे आवश्यक आहे';
        if (!data.email) currentErrors.email = 'ईमेल प्रविष्ट करणे आवश्यक आहे';
        if (!data.phone) currentErrors.phone = 'फोन नंबर प्रविष्ट करणे आवश्यक आहे';
        if (!data.password) currentErrors.password = 'पासवर्ड प्रविष्ट करणे आवश्यक आहे';
        if (!data.confirmPassword) currentErrors.confirmPassword = 'पासवर्डची पुष्टी करणे आवश्यक आहे';

        // Re-check password match specifically
        if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
            currentErrors.confirmPassword = 'पासवर्ड जुळत नाहीत';
        }

        // Re-check lengths and formats not covered by simple existence check
        if (data.username && data.username.length < 3) currentErrors.username = 'वापरकर्तानाव किमान ३ अक्षरे असावे लागते';
        if (data.password && data.password.length < 8) currentErrors.password = 'पासवर्ड किमान ८ अक्षरे असावे लागते';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (data.email && !emailRegex.test(data.email)) currentErrors.email = 'कृपया वैध ईमेल पत्ता प्रविष्ट करा';
        if (data.phone && !/^[6-9]\d{9}$/.test(data.phone)) currentErrors.phone = 'कृपया १० अंकी वैध भारतीय मोबाईल नंबर प्रविष्ट करा';


        // Re-check uniqueness (important if data was loaded after initial input)
        if (data.username && existingUsers.includes(data.username.trim().toLowerCase())) currentErrors.username = 'हे वापरकर्ता नाव आधीच अस्तित्वात आहे';
        if (data.email && existingEmail.includes(data.email.trim().toLowerCase())) currentErrors.email = 'हे ईमेल आधीच अस्तित्वात आहे';
        if (data.schoolName && existingSchool.includes(data.schoolName.trim().toLowerCase())) currentErrors.schoolName = 'हे शाळेचे नाव आधीच अस्तित्वात आहे';
        if (data.schoolUdise && existingUdiseno.includes(Number(data.schoolUdise))) currentErrors.schoolUdise = 'हे शाळेचे UDISE संख्या आधीच अस्तित्वात आहे';
        if (data.phone && existingPhone.includes(data.phone)) currentErrors.phone = 'हा फोन नंबर आधीच अस्तित्वात आहे';


         // Re-check English only fields
         const englishOnlyFields = ['username', 'email', 'password', 'confirmPassword'];
         englishOnlyFields.forEach(field => {
             if (data[field] && !isStrictlyEnglish(data[field])) {
                 currentErrors[field] = 'कृपया केवळ इंग्रजी अक्षरे/अंक/चिन्हे वापरा';
             }
         });


        setErrors(currentErrors); // Update the errors state with the final check
        console.log("Validation Errors on Submit:", currentErrors);
        return Object.keys(currentErrors).length === 0; // Return true if no errors
    };

    // --- handleSubmit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus(null); // Clear previous status

        // Perform final validation
        if (validateForm()) {
            // If validation passes, proceed with submission
            try {
                // Prepare data for submission
                 // IMPORTANT: Use FormData for potential file uploads (like logo in the future)
                 const schoolPayload = new FormData()
                 schoolPayload.append('schoolDto', JSON.stringify({
                    udiseNo: formData.schoolUdise,
                    schoolName: formData.schoolName,
                    sansthaName: formData.orgName,
                    headMasterUserName: formData.username,
                    schoolEmailId: formData.email,
                    headMasterMobileNo: formData.phone,
                    headMasterPassword: formData.password,
                    role: formData.role || 'HEADMASTER' // Ensure role is set
                }))

                // Display confirmation dialog
                const result = await Swal.fire({
                    title: 'शाळेचे खाते तयार करायचे आहे का?',
                    text: "कृपया तपशील तपासा.",
                    icon: 'question',
                    showCancelButton: true,
                    showDenyButton: true, // Keep only Confirm/Cancel or adjust text
                    confirmButtonText: 'होय, तयार करा',
                    denyButtonText: 'जतन करा आणि पुढे चला', // Removed for simplicity, handle navigation after success if needed
                    cancelButtonText: 'रद्द करा',
                    confirmButtonColor: '#28a745', // Green for confirm
                    cancelButtonColor: '#dc3545', // Red for cancel
                    denyButtonColor: '#007bff', // Blue for deny
                });

                // Proceed if confirmed
                if (result.isConfirmed || result.isDenied) {
                    try {
                        // Send data to API
                        // If sending JSON:
                         await apiService.post('school/', schoolPayload);

                         // If using FormData (e.g., for logo):
                         // const dataToSend = new FormData();
                         // dataToSend.append('schoolDto', JSON.stringify(schoolPayload));
                         // if (formData.logo) { // Add this logic if you have a logo input
                         //     dataToSend.append('logo', formData.logo);
                         // }
                         // await apiService.post('school/', dataToSend);


                        setSubmitStatus({ type: 'success', message: 'शाळेचे खाते यशस्वीरीत्या तयार झाले!' });
                        setTimeout(() => setSubmitStatus(null), 2000); // Clear status after 2 seconds

                        // Show success message
                        await Swal.fire({
                            title: "यशस्वी!",
                            text: "शाळेची माहिती यशस्वीरीत्या जतन केली आहे!",
                            icon: "success",
                            timer: 2000, // Auto close after 2 seconds
                            showConfirmButton: false
                        });

                        // Refresh data and reset form
                        fetchSchoolData();
                        loadUsernames(); // Reload usernames including the new one
                        setFormData({ // Reset form
                            schoolUdise: '', schoolName: '', username: '', email: '',
                            orgName: '', phone: '', role: 'HEADMASTER', password: '', confirmPassword: ''
                        });
                        setErrors({}); // Clear errors state

                        // Optional navigation
                        if (result.isDenied) { // If using deny button
                            navigate('/developer/subscription');
                        }

                    } catch (apiError) {
                         console.error("API Error:", apiError);
                         // Try to get specific error message from backend response
                         const errorMessage = apiError.response?.data?.message || apiError.message || 'डेटा जतन करण्यात अडचण आली.';
                        Swal.fire('त्रुटी!', errorMessage, 'error');
                         setSubmitStatus({ type: 'danger', message: `खाते तयार करण्यात अयशस्वी: ${errorMessage}` });
                    }
                } else {
                     console.log("Submission cancelled by user.");
                 }

            } catch (error) {
                // Catch errors related to Swal or other pre-API issues
                console.error("Error during submit process:", error);
                setSubmitStatus({ type: 'danger', message: 'एक अनपेक्षित त्रुटी आली.' });
                Swal.fire('त्रुटी!', 'फॉर्म सबमिट करताना समस्या आली.', 'error');
            }
        } else {
            // If validation fails
            console.log('Form validation failed.');
            setSubmitStatus({ type: 'danger', message: 'कृपया फॉर्ममधील त्रुटी तपासा आणि दुरुस्त करा.' });
            // Optionally scroll to the first error or show a general validation error message
            // toast.error("कृपया फॉर्ममधील त्रुटी तपासा."); // Example using react-toastify
        }
    };


    // --- JSX Return ---
    return (
        <Container className="mt-4 mb-5" fluid> {/* Use fluid for better responsiveness */}
            <Row className="justify-content-center"> {/* Center the column */}
                <Col md={10} lg={8}> {/* Adjust column width */}
                    <Card className='shadow-sm border-0 rounded-3'> {/* Subtle shadow, no border, rounded corners */}
                         {/* Removed the 'X' button for now, add back if needed */}
                         {/* <div className="position-absolute top-0 end-0 m-2">
                            <Next classname={'btn bg-danger text-white btn-sm'} path={'/developer'} placeholder={'X'}></Next>
                        </div> */}
                        <Card.Header as="h4" className="text-center p-3 bg-primary text-white rounded-top-3"> {/* Use h4 for slightly smaller header */}
                            नवीन शाळेचे खाते तयार करा
                        </Card.Header>
                        <Card.Body className="p-4"> {/* Add more padding */}
                            {submitStatus && (
                                <Alert variant={submitStatus.type} onClose={() => setSubmitStatus(null)} dismissible>
                                    {submitStatus.message}
                                </Alert>
                            )}
                            <Form onSubmit={handleSubmit} noValidate> {/* Add noValidate to prevent default browser validation */}
                                {/* School Info Section */}
                                <Card className="mb-4 border bg-light shadow-sm"> {/* Card style for sections */}
                                    <Card.Body className="p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-6 fw-bold text-primary"> {/* Use fs-6, primary color */}
                                            <i className="bi bi-building me-2"></i>शाळेची माहिती
                                        </h5>
                                        <Row>
                                            <Col md={6}> {/* Use md={6} for 2 columns on medium screens and up */}
                                                <Form.Group className="mb-3" controlId="schoolUdiseInput">
                                                    <Form.Label>शाळेचा UDISE क्रमांक <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text" // Use text to allow leading zeros if any, validation handles numbers
                                                        inputMode='numeric' // Hint for mobile keyboards
                                                        name="schoolUdise"
                                                        value={formData.schoolUdise}
                                                        onChange={handleChange}
                                                        placeholder="11 अंकी UDISE क्रमांक"
                                                        isInvalid={!!errors.schoolUdise}
                                                        maxLength={11} // UDISE is 11 digits
                                                        required // HTML5 required (though validation handles it)
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.schoolUdise}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="orgNameInput">
                                                    <Form.Label>संस्थेचे नाव <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="orgName"
                                                        value={formData.orgName}
                                                        onChange={handleChange}
                                                        placeholder="उदा. शिक्षण प्रसारक मंडळ"
                                                        isInvalid={!!errors.orgName}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.orgName}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="schoolNameInput">
                                                    <Form.Label>शाळेचे नाव <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="schoolName"
                                                        value={formData.schoolName}
                                                        onChange={handleChange}
                                                        placeholder="उदा. आदर्श विद्यालय"
                                                        isInvalid={!!errors.schoolName}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.schoolName}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="schoolEmailInput">
                                                    <Form.Label>शाळेचा ईमेल <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="उदा. school@example.com"
                                                        isInvalid={!!errors.email}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.email}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Headmaster Info Section */}
                                <Card className="mb-4 border bg-light shadow-sm">
                                    <Card.Body className="p-3">
                                        <h5 className="card-title border-bottom pb-2 mb-3 fs-6 fw-bold text-primary">
                                            <i className="bi bi-person-fill me-2"></i>मुख्याध्यापकांची माहिती
                                        </h5>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="hmUsernameInput">
                                                    <Form.Label>मुख्याध्यापक वापरकर्तानाव <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="username"
                                                        value={formData.username}
                                                        onChange={handleChange}
                                                        placeholder="किमान ३ इंग्रजी अक्षरे"
                                                        isInvalid={!!errors.username}
                                                        required
                                                        autoComplete="new-password" // Prevent browser autocomplete for username
                                                    />
                                                     <Form.Text className="text-muted">
                                                        (फक्त इंग्रजी अक्षरे, अंक, चिन्हे वापरा)
                                                    </Form.Text>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.username}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="hmPhoneInput">
                                                    <Form.Label>मुख्याध्यापकांचा फोन नंबर <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="tel" // Use tel type for phone numbers
                                                        inputMode='numeric'
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="१० अंकी मोबाईल नंबर"
                                                        isInvalid={!!errors.phone}
                                                        maxLength={10}
                                                        required
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.phone}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="hmPasswordInput">
                                                    <Form.Label>पासवर्ड <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        placeholder="किमान ८ इंग्रजी अक्षरे/अंक/चिन्हे"
                                                        isInvalid={!!errors.password}
                                                        required
                                                        autoComplete="new-password" // Important for password managers
                                                    />
                                                    <Form.Text className="text-muted">
                                                       (फक्त इंग्रजी अक्षरे, अंक, चिन्हे वापरा)
                                                    </Form.Text>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.password}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="hmConfirmPasswordInput">
                                                    <Form.Label>पासवर्डची पुष्टी करा <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        placeholder="पासवर्ड पुन्हा प्रविष्ट करा"
                                                        isInvalid={!!errors.confirmPassword}
                                                        required
                                                        autoComplete="new-password"
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.confirmPassword}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>

                                {/* Other Info Section - Role */}
                                <Card className="mb-4 border bg-light shadow-sm">
                                     <Card.Body className="p-3">
                                         <h5 className="card-title border-bottom pb-2 mb-3 fs-6 fw-bold text-primary">
                                             <i className="bi bi-person-badge me-2"></i>भूमिका
                                         </h5>
                                         <Row>
                                             <Col md={6}> {/* Keep it centered or full width if only one item */}
                                                 <Form.Group className="mb-3" controlId="roleSelect">
                                                     <Form.Label>भूमिका</Form.Label>
                                                     <Form.Select
                                                         name="role"
                                                         value={formData.role}
                                                         onChange={handleChange}
                                                         // isInvalid={!!errors.role} // No validation needed if only one option
                                                     >
                                                         <option value={"HEADMASTER"}>Head Master (मुख्याध्यापक)</option>
                                                         {/* Add other roles here if necessary in the future */}
                                                         {/* Example: <option value={"TEACHER"}>Teacher (शिक्षक)</option> */}
                                                     </Form.Select>
                                                    {/* No need for feedback if only one fixed role */}
                                                     {/* <Form.Control.Feedback type="invalid">
                                                        {errors.role}
                                                    </Form.Control.Feedback> */}
                                                 </Form.Group>
                                             </Col>
                                             {/* Add other columns here if needed */}
                                         </Row>
                                     </Card.Body>
                                 </Card>

                                {/* Submit Button */}
                                <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4"> {/* Centered button(s) */}
                                    <Button variant="success" type="submit" className="btn-lg px-5 shadow-sm rounded-pill"> {/* Larger button, pill shape */}
                                        <i className="bi bi-check-circle-fill me-2"></i>खाते तयार करा
                                    </Button>
                                    {/* Optional Cancel/Back Button */}
                                    <Button variant="outline-secondary" type="button" onClick={() => navigate('/developer')} className="btn-lg px-4 shadow-sm rounded-pill"> {/* Example back button */}
                                         <i className="bi bi-arrow-left-circle me-2"></i>मागे जा
                                     </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default NewSchool;