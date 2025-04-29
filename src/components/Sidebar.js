import React from "react";
import { Nav, Button, Form, Offcanvas } from 'react-bootstrap';
import { FiHome, FiFileText, FiUsers, FiSettings, FiLogOut, FiFilter, FiBarChart2 ,FiBell ,FiFilePlus, FiUserPlus} from 'react-icons/fi';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useContext, useEffect } from "react";
import { authService } from "../services/authService";

const Sidebar = ({sidebarItems, role}) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const handleCloseSidebar = () => setShowSidebar(false);
  const handleShowSidebar = () => setShowSidebar(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Track active route for highlighting
  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);

      if (width >= 768) {
        setShowSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    authService.logout()
  };

  // Nav link style function
  const getLinkStyle = (path) => {
    return {
      color: isActive(path) ? "white" : "black",
      backgroundColor: isActive(path) ? "blue" : 'transparent',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    };
  };

  // Mobile nav link style function
  const getMobileLinkStyle = (path) => {
    return {
      color: isActive(path) ? "grey" : 'inherit',
      backgroundColor: isActive(path) ? '#f8f9fa' : 'transparent'
    };
  };

  return (
    <>
      {/* Sidebar for desktop */}
      <div
        className="d-none d-md-block overflow-auto"
        style={{
          width: '300px',
          backgroundColor: "white",
          position: 'sticky',
          top: '56px',
          height: 'calc(100vh - 56px)',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}
      ><Nav className="flex-column py-3">
          {sidebarItems.map((section, index) => (
            <React.Fragment key={index}>
              {/* Render section title */}
              <div className="px-3 mb-3">
                <small className="text-muted text-uppercase fw-bold">
                  {Object.keys(section)[0]}
                </small>
              </div>

              {/* Render section links */}
              {section[Object.keys(section)[0]].map((item, itemIndex) => {
                const path = `/${role}/${item.toLowerCase()}`;
                const iconProps = { size: 18, className: 'me-2' };

                // Determine the icon based on the item name
                let Icon;
                switch (item) {
                  case 'Dashboard':
                    Icon = FiHome;
                    break;
                  case 'Circular':
                    Icon = FiFileText;
                    break;
                  case 'Departments':
                    Icon = FiUsers;
                    break;
                  case 'Workflows':
                    Icon = FiBarChart2;
                    break;
                  case 'Categories':
                    Icon = FiFilter;
                    break;
                  case 'Setting':
                    Icon = FiSettings;
                    break;
                  case 'Notification':
                    Icon = FiBell;
                    break;
                  case 'NewCircular':
                    Icon = FiFilePlus;
                    break;
                    case 'NewUser':
                      Icon = FiUserPlus;
                      break;
                  default:
                    Icon = FiHome;
                } 

                return (
                  <Nav.Link
                    key={itemIndex}
                    as={Link}
                    to={path}
                    style={getLinkStyle(path)}
                    className="d-flex align-items-center px-3 py-2 mb-1 mx-2"
                  >
                    <Icon {...iconProps} /> {item}
                  </Nav.Link>
                );
              })}
            </React.Fragment>
          ))}

          <div className="mt-3 px-3">
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleLogout}
              className="w-100 d-flex align-items-center justify-content-center"
            >
              <FiLogOut size={16} className="me-2" /> Logout
            </Button>
          </div>
        </Nav>
      </div>

      {/* Offcanvas Sidebar for mobile */}
      <Offcanvas
        show={showSidebar}
        onHide={handleCloseSidebar}
        placement="start"
        style={{ maxWidth: '85%', width: '250px', zIndex: 1050 }}
        backdrop={true}
      >
        <Offcanvas.Header closeButton className="border-bottom" style={{ backgroundColor: "gray", color: "black" }}>
          <Offcanvas.Title>BCMS Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <div className="p-3 border-bottom d-flex align-items-center">
            <img
              src="/api/placeholder/40/40"
              alt="Profile"
              className="rounded-circle me-2"
            />
            <div>
              <div className="fw-bold">{role.toUpperCase()}</div>
              <small className="text-muted">Administrator</small>
            </div>
          </div>

          <div className="p-2">
            <Form className="mb-3">
              <Form.Control
                type="search"
                placeholder="Search..."
                className="form-control-sm rounded-pill"
              />
            </Form>
          </div>

          <Nav className="flex-column py-3">
          {sidebarItems.map((section, index) => (
            <React.Fragment key={index}>
              {/* Render section title */}
              <div className="px-3 mb-3">
                <small className="text-muted text-uppercase fw-bold">
                  {Object.keys(section)[0]}
                </small>
              </div>

              {/* Render section links */}
              {section[Object.keys(section)[0]].map((item, itemIndex) => {
                const path = `/${role}/${item.toLowerCase()}`;
                const iconProps = { size: 18, className: 'me-2' };

                // Determine the icon based on the item name
                let Icon;
                switch (item) {
                  case 'Dashboard':
                    Icon = FiHome;
                    break;
                  case 'Circular':
                    Icon = FiFileText;
                    break;
                  case 'Departments':
                    Icon = FiUsers;
                    break;
                  case 'Workflows':
                    Icon = FiBarChart2;
                    break;
                  case 'Categories':
                    Icon = FiFilter;
                    break;
                  case 'Settings':
                    Icon = FiSettings;
                    break;
                  default:
                    Icon = FiHome;
                }

                return (
                  <Nav.Link
                    key={itemIndex}
                    as={Link}
                    to={path}
                    style={getLinkStyle(path)}
                    className="d-flex align-items-center px-3 py-2 mb-1 mx-2"
                  >
                    <Icon {...iconProps} /> {item}
                  </Nav.Link>
                );
              })}
            </React.Fragment>
          ))}

          <div className="mt-3 px-3">
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleLogout}
              className="w-100 d-flex align-items-center justify-content-center"
            >
              <FiLogOut size={16} className="me-2" /> Logout
            </Button>
          </div>
        </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;