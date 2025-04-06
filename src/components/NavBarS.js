import React, { useContext, useState } from 'react'
// import { ColorContext } from '../contexts/ColorContext';
import { Container, Row, Col, Nav, Navbar, Card, Table, Button, Badge, Form, Dropdown, Offcanvas } from 'react-bootstrap';
import { FiHome, FiFileText, FiUsers, FiSettings, FiLogOut, FiPlusCircle, FiFilter, FiSearch, FiEdit, FiEye, FiTrash2, FiBell, FiBarChart2, FiMenu } from 'react-icons/fi';
import { CgProfile } from "react-icons/cg";
import { Link, useNavigate } from 'react-router-dom';

function NavBarS({ role }) {
  const handleShowSidebar = () => setShowSidebar(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const handleCloseSidebar = () => setShowSidebar(false);
  // const navigate = useNavigate();

  // const handleLogout = () => {
  //   localStorage.removeItem('authToken');
  //   localStorage.removeItem('role');
  //   navigate('/');
  // };
  // const { colors } = useContext(ColorContext);

  return (
    <div className="navbar-wrapper">
      <Navbar
        style={{ backgroundColor: "#111111", padding: '0.5rem' }}
        variant="dark"
        expand="md"
        fixed="top"
        className="shadow-sm"
      >
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center me-auto py-0">

            <span className="d-none d-sm-inline" style={{ color: "white" }}>शाळा व्यवस्थापन प्रणाली</span>
            <span className="d-inline d-sm-none" style={{ color: "white" }}>SMS</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <div className="d-flex align-items-center">
                <Nav className="ms-auto align-items-center">
                  <Nav.Link as={Link} to={"/new-school"}>शाळा नोंदणी करा</Nav.Link>
                  <Nav.Link as={Link} to={"/subscription"}>सदस्यता</Nav.Link>
                  <Nav.Link as={Link} to={"/view-school"}>शाळांची माहिती पहा</Nav.Link>
                </Nav>
                {/* <Form className="me-2 d-none d-lg-block position-relative">
                  <Form.Control
                    type="search"
                    placeholder="Search..."
                    className="form-control-sm rounded-pill"
                    style={{ width: '200px', paddingRight: '30px' }}
                  />
                  <FiSearch className="position-absolute" style={{ right: '10px', top: '7px' }} />
                </Form> */}

                {/* <Dropdown align="end" className="me-2">
                  <Dropdown.Toggle 
                    style={{ backgroundColor: 'transparent', color: "white", border: 'none' }} 
                    className="btn-sm position-relative p-1" 
                    id="notification-dropdown"
                  >
                    <FiBell size={20} />
                    <Badge 
                      bg="danger" 
                      pill 
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.6rem' }}
                    >
                      4
                    </Badge>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-end shadow-sm">
                    <Dropdown.Header>Notifications</Dropdown.Header>
                    <Dropdown.Item>New circular pending approval</Dropdown.Item>
                    <Dropdown.Item>5 circulars awaiting review</Dropdown.Item>
                    <Dropdown.Item>System maintenance scheduled</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item className="text-center">View all notifications</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown> */}

                <Dropdown align="end">
                  <Dropdown.Toggle
                    style={{ backgroundColor: 'transparent', color: "white", border: 'none' }}
                    className="btn-sm d-flex align-items-center"
                    id="profile-dropdown"
                  >
                    <span className="d-none d-md-inline me-2">{`${role}`.toUpperCase()}</span>
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                      <CgProfile style={{ width: '28px', height: '28px' }} />
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-end shadow">
                    <Dropdown.Item href="#profile"><FiUsers className="me-2" /> Profile</Dropdown.Item>
                    <Dropdown.Item href="#settings"><FiSettings className="me-2" /> Settings</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item ><FiLogOut className="me-2" /> Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  )
}

export default NavBarS
