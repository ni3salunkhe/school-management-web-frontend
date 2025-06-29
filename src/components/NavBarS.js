import React, { useContext, useState } from 'react'
// import { ColorContext } from '../contexts/ColorContext';
import { Container, Row, Col, Nav, Navbar, Card, Table, Button, Badge, Form, Dropdown, Offcanvas } from 'react-bootstrap';
import { FiHome, FiFileText, FiUsers, FiSettings, FiLogOut, FiPlusCircle, FiFilter, FiSearch, FiEdit, FiEye, FiTrash2, FiBell, FiBarChart2, FiMenu } from 'react-icons/fi';
import { CgProfile } from "react-icons/cg";
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styling/NavBar.css';
import { jwtDecode } from 'jwt-decode';

function NavBarS({ role }) {
  const handleShowSidebar = () => setShowSidebar(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const handleCloseSidebar = () => setShowSidebar(false);
  const [username, setUsername] = useState(jwtDecode(sessionStorage.getItem('token'))?.username);
  const handleLogout = () => {
    authService.logout()
  };
  // const { colors } = useContext(ColorContext);

  return (
    <div className="navbar-wrapper">
      <Navbar
        style={{ backgroundColor: "black", padding: '0.5rem' }}
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
              <>
                {role == "DEVELOPER" && <Nav className="ms-auto align-items-center">
                  <Nav.Link className="" as={Link} to={"/developer/school"}>शाळा नोंदणी करा</Nav.Link>
                  <Nav.Link as={Link} to={"/developer/subscription"}>सदस्यता नविनीकरण किंवा नूतनीकरण करा</Nav.Link>
                  <Dropdown as={Nav.Item} className="me-2">
                    <Dropdown.Toggle as={Nav.Link} >
                      माहिती पहा
                      {/* शाळेची व वपरकर्त्यांची  */}
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ color: "white", backgroundColor: "black", padding: '0.5rem' }}>
                      <Dropdown.Item as={Link} to={"/developer/view"}>शाळेची माहिती पहा</Dropdown.Item>
                      <Dropdown.Item as={Link} to={"/developer/view-users"}>वापरकर्त्यांची माहिती पहा</Dropdown.Item>

                    </Dropdown.Menu>

                  </Dropdown>
                  <Dropdown as={Nav.Item} className="me-2">
                    <Dropdown.Toggle as={Nav.Link} >
                      स्थान माहिती प्रविष्ट करणे

                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ color: "white", backgroundColor: "black", padding: '0.5rem' }}>
                      <Dropdown.Item as={Link} to={"/developer/state"}>राज्य प्रविष्ट करणे</Dropdown.Item>
                      <Dropdown.Item as={Link} to={"/developer/district"}>जिल्हा  प्रविष्ट करणे</Dropdown.Item>
                      <Dropdown.Item as={Link} to={"/developer/tehsil"}>तालुका  प्रविष्ट करणे</Dropdown.Item>
                      <Dropdown.Item as={Link} to={"/developer/village"}>गाव किंवा शहर प्रविष्ट करणे</Dropdown.Item>
                    </Dropdown.Menu>

                  </Dropdown>
                </Nav>}
                <Dropdown align="end">
                  <Dropdown.Toggle
                    className="btn-sm d-flex align-items-center"
                    id="profile-dropdown"
                  >
                    <span className="d-none d-md-inline me-2">{`${username} | ${role}`.toUpperCase()}</span>
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                      <CgProfile style={{ width: '28px', height: '28px' }} />
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-end shadow">
                    <Dropdown.Item onClick={handleLogout} ><FiLogOut className="me-2" /> बाहेर पडा</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  )
}

export default NavBarS
