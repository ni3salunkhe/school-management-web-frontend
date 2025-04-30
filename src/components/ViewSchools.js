import React, { useEffect, useState } from 'react'
import apiService from '../services/api.service'
import { FiSearch } from 'react-icons/fi'
import { Form, Container, Row, Col, Card, InputGroup } from 'react-bootstrap'
import '../styling/ViewSchools.css' // Custom styles file for the UI
import { useNavigateService } from '../services/useNavigateService'

const ViewSchools = () => {
    const [filteredData, setFilteredData] = useState([]) // This will hold the filtered list
    const [data, setData] = useState([])  // This will hold all fetched data
    const [searchTerm, setSearchTerm] = useState('')  // Track the search input
    const {navigateTo} = useNavigateService();

    // Fetch the school data when the component is mounted
    useEffect(() => {
        const fetchHm = async () => {
            try {
                const response = await apiService.getdata("school/");
                const school = response.data || []
                console.log(response.data)
                setData(school)
                setFilteredData(school) // Initialize the filteredData with the full data
            } catch (error) {
                console.log(error)
            }
        }
        fetchHm()
    }, [])

    // Handle the search input change
    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchTerm(value)

        // Filter data based on the search term (match school names starting with the search term)
        const filtered = data.filter(element =>
            // Check if schoolName exists and is a valid string
            element.schoolName && element.schoolName.toLowerCase().includes(value.toLowerCase())
        )

        setFilteredData(filtered) // Update the filtered data
    }

    return (
        <Container className="mt-5">
            
                    <div className="search-bar">
                        <Form className="position-relative">
                            <InputGroup>
                                <Form.Control
                                    type="search"
                                    placeholder="Search for schools..."
                                    className="form-control-sm rounded-pill search-input"
                                    value={searchTerm}  // Bind the search input value
                                    onChange={handleSearchChange}  // Update search term on input change
                                />
                                <InputGroup.Text className="search-icon">
                                    <FiSearch />
                                </InputGroup.Text>
                            </InputGroup>
                        </Form>
                    </div>

                    <h2 className="text-center mt-4">List of Schools</h2>
                    <Row className="mt-4">
                        {filteredData.length > 0 ? (
                            filteredData.map((element, index) => (
                                <Col lg={4} md={6} sm={12} key={index} className="mb-4">
                                    <Card className="school-card">
                                        <Card.Body>
                                            <Card.Header className='school-udise'>{element.udiseNo}</Card.Header>
                                            <Card.Title style={{cursor:'pointer'}} onClick={()=>navigateTo('/developer/subscription')} className="school-name">{element.schoolName}</Card.Title>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col className="text-center">
                                <p>No schools found</p>
                            </Col>
                        )}
                    </Row>
                
        </Container>
    )
}

export default ViewSchools
