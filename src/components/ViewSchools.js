import React, { useEffect, useState } from 'react';
import apiService from '../services/api.service';
import { FiSearch } from 'react-icons/fi';
import { Form, Container, Row, Col, Card, InputGroup } from 'react-bootstrap';
import '../styling/ViewSchools.css'; // Custom styles
import '../styling/SchoolDetailsOverlay.css'; // Assuming you created this or have it globally
// import { useNavigateService } from '../services/useNavigateService'; // Keep if used elsewhere, not directly for overlay
import SchoolDetailsOverlay from '../components/SchoolDetailsOverlay'; // Import the overlay component

const ViewSchools = () => {
    const [allSchools, setAllSchools] = useState([]);          // Holds all fetched school data
    const [filteredSchools, setFilteredSchools] = useState([]); // Holds the list to display (after search)
    const [searchTerm, setSearchTerm] = useState('');
    // const { navigateTo } = useNavigateService(); // Keep if used for other navigation

    // State for the overlay
    const [selectedSchool, setSelectedSchool] = useState(null); // School object for the overlay
    const [isOverlayOpen, setIsOverlayOpen] = useState(false);

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await apiService.getdata("school/");
                const schools = response.data || [];
                console.log("Fetched Schools:", schools);
                setAllSchools(schools);
                setFilteredSchools(schools); // Initialize filtered list with all schools
            } catch (error) {
                console.error("Error fetching schools:", error);
                setAllSchools([]); // Set to empty array on error
                setFilteredSchools([]);
            }
        };
        fetchSchools();
    }, []);

    // This useEffect will add/remove the 'blurred' class from the main page content wrapper
    // Ensure the 'pageContentWrapper' ID exists on a parent element in your app structure
    useEffect(() => {
        const pageContentWrapper = document.getElementById('pageContentWrapper');
        if (pageContentWrapper) {
            if (isOverlayOpen) {
                pageContentWrapper.classList.add('blurred');
            } else {
                pageContentWrapper.classList.remove('blurred');
            }
        }
        // Cleanup on component unmount or if isOverlayOpen changes before unmount
        return () => {
            if (pageContentWrapper) {
                pageContentWrapper.classList.remove('blurred');
            }
        };
    }, [isOverlayOpen]);


    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);

        if (value === '') {
            setFilteredSchools(allSchools); // If search is cleared, show all schools
        } else {
            const filtered = allSchools.filter(school =>
                school.schoolName && school.schoolName.toLowerCase().includes(value)
            );
            setFilteredSchools(filtered);
        }
    };

    // Function to handle clicking on a school name
    const handleSchoolNameClick = (school) => {
        console.log("School clicked:", school);
        // Ensure school object has all necessary fields for SchoolDetailsOverlay
        // (name, address, principal, established, contact, description)
        // You might need to map your API response fields to these expected fields
        // For now, assuming your 'school' object from API has these directly
        // or that SchoolDetailsOverlay can handle missing fields gracefully.

        // Example mapping if your API fields are different:
        // const schoolDetailsForOverlay = {
        //     name: school.schoolName,
        //     address: school.fullAddress || 'N/A',
        //     principal: school.principalName || 'N/A',
        //     established: school.yearEstablished || 'N/A',
        //     contact: school.contactInfo || 'N/A',
        //     description: school.aboutSchool || ''
        // };
        // setSelectedSchool(schoolDetailsForOverlay);

        setSelectedSchool(school); // Directly pass the school object
        setIsOverlayOpen(true);
    };

    const handleCloseOverlay = () => {
        setIsOverlayOpen(false);
        setSelectedSchool(null); // Clear selected school when closing
    };

    return (
        // IMPORTANT: For the blur effect to work, the parent of this ViewSchools component
        // (or a higher ancestor like in App.js) should have a div with id="pageContentWrapper"
        // that wraps the main content area of your application.
        <Container className="mt-4 view-schools-container">
            <div className="search-bar-wrapper mb-4 p-3 bg-light rounded shadow-sm">
                <Form className="position-relative">
                    <InputGroup>
                        <Form.Control
                            type="search"
                            placeholder=" शाळेचे नाव शोधा..."
                            className="form-control-sm rounded-pill search-input"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <InputGroup.Text className="search-icon-wrapper bg-transparent border-0">
                            <FiSearch className="search-icon-svg" />
                        </InputGroup.Text>
                    </InputGroup>
                </Form>
            </div>

            <h2 className="text-center mb-4 section-title">शाळांची यादी</h2>
            <Row className="g-4"> {/* g-4 for gutter spacing */}
                {filteredSchools.length > 0 ? (
                    filteredSchools.map((school) => ( // Changed element to school for clarity
                        <Col lg={4} md={6} sm={12} key={school.udiseNo || school.id} className="d-flex"> {/* Use a unique key like udiseNo or id */}
                            <Card className="school-card w-100 h-100 shadow-hover"> {/* w-100, h-100 for consistent card heights if desired, d-flex on Col helps */}
                                <Card.Header className='school-udise bg-primary text-white'>
                                    UDISE: {school.udiseNo}
                                </Card.Header>
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title
                                        style={{ cursor: 'pointer' }}
                                        className="school-name mb-2"
                                        onClick={() => handleSchoolNameClick(school)} // Call handler
                                        title={`View details for ${school.schoolName}`}
                                    >
                                        {school.schoolName}
                                    </Card.Title>
                                    {/* You can add more brief info here if needed */}

                                    {/* <Button variant="outline-primary" size="sm" className="mt-auto" onClick={() => handleSchoolNameClick(school)}>
                                        View Details
                                    </Button> */}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col className="text-center mt-5">
                        {searchTerm ? <p>"'${searchTerm}' नावाची शाळा आढळली नाही.</p> : <p>शाळा लोड होत आहेत किंवा कोणतीही शाळा उपलब्ध नाही.</p>}
                    </Col>
                )}
            </Row>

            <SchoolDetailsOverlay
                isOpen={isOverlayOpen}
                school={selectedSchool}
                onClose={handleCloseOverlay}
            />
        </Container>
    );
};

export default ViewSchools;