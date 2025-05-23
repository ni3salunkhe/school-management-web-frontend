import React from "react";
import { Nav, Button, Form, Offcanvas } from 'react-bootstrap';
import { FiHome, FiFileText, FiUsers, FiSettings, FaPlus, FiLogOut, FiFilter, FiBarChart2, FiBell, FiFilePlus, FiUserPlus, FiGrid, FiCalendar, FiClipboard, FiTrendingUp, FiMapPin, FiMap, FiLayout, FiTarget, FiCreditCard, FiBookOpen, FiUserX } from 'react-icons/fi';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useContext, useEffect } from "react";
import { authService } from "../services/authService";

const Sidebar = ({ sidebarItems, role }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const handleCloseSidebar = () => setShowSidebar(false);
  const handleShowSidebar = () => setShowSidebar(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarWidth, setSidebarWidth] = useState();

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
  useEffect(() => {

    if (location.pathname === '/teacher/monthlyattendancereport') {
      return null;
    }
    if (location.pathname === '/clerk/head' || location.pathname === '/clerk/openingbalance') {
      return setSidebarWidth('500px');
    } else {
      setSidebarWidth('300px')
    }
  }, [location.pathname])

  let name = '';
  const switchFunction = (item) => {
    console.log(item)
    switch (item) {
      case 'mainMenu':
        return 'विद्यार्थी व्यवस्थापन'
      case 'account':
        return 'खाते व्यवस्थापन'
      default:
        return null;
    }
  }

  return (
    <>
      {/* Sidebar for desktop */}
      <div
        className="d-none d-md-block overflow-auto"
        style={{
          width: `${sidebarWidth}`,
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
                  {switchFunction(Object.keys(section)[0])}
                </small>
              </div>

              {/* Render section links */}
              {section[Object.keys(section)[0]].map((item, itemIndex) => {
                const path = `/${role}/${item.trim().toLowerCase().replace(/\s+/g, '')}`;
                const iconProps = { size: 18, className: 'me-2' };

                // Determine the icon based on the item name
                let Icon;
                let name = "";
                switch (item) {
                  case 'School':
                    Icon = FiUsers;
                    name = "शाळा माहिती"
                    break;
                  case 'Class':
                    Icon = FiGrid;
                    name = "वर्ग माहिती"
                    break;
                  case 'Staff':
                    Icon = FiUsers;
                    name = "शिक्षकवृंद माहिती"
                    break;
                  case 'Student':
                    Icon = FiHome;
                    name = "विद्यार्थी जनरल रजिस्टर माहिती नोंद"
                    break;
                  case 'Classes':
                    Icon = FiFileText;
                    name = "वर्गांची माहिती"
                    break;
                  case 'Add Academic New Students':
                    Icon = FiUserPlus;
                    name = "नवीन विद्यार्थी प्रवेश नोंद"
                    break;
                  case 'List Of Students':
                    Icon = FiBarChart2;
                    name = "विद्यार्थी यादी आणि रिपोर्ट"
                    break;
                  case 'Change Class Teacher':
                    Icon = FiFilter;
                    name = "वर्गशिक्षक बदला"
                    break;
                  case 'Mark Holiday':
                    Icon = FiCalendar;
                    name = "सुट्टीची नोंद करा"
                    break;
                  case 'Attendance':
                    Icon = FiClipboard;
                    name = "उपस्थिती माहिती नोंद"
                    break;
                  case 'Update year':
                    Icon = FiTrendingUp;
                    name = "पास नापास नोंदी"
                    break;
                  case 'Catlog Cover Page':
                    Icon = FiUserPlus;
                    name = "कॅटलॉग कवर पेज"
                    break;
                  case 'Daily Attendance Report':
                    Icon = FiFileText;
                    name = "दैनंदिन उपस्थिती अहवाल"
                    break;
                  case 'Monthly Attendance Report':
                    Icon = FiBarChart2;
                    name = "मासिक उपस्थिती अहवाल"
                    break;
                  case 'State':
                    Icon = FiMapPin;
                    name = "राज्य"
                    break;
                  case 'District':
                    Icon = FiMap;
                    name = "जिल्हा"
                    break;

                  case 'Tehsil':
                    Icon = FiLayout;
                    name = "तहसील"
                    break;
                  case 'Village':
                    Icon = FiTarget;
                    name = "गाव/शहर"
                    break;
                  case 'Dashboard':
                    Icon = FiTrendingUp;
                    name = "खाते डॅशबोर्ड";
                    break;
                  case 'Bank':
                    Icon = FiBookOpen;
                    name = "बँक नोंदणी माहिती";
                    break;
                  case 'Opening Balance':
                    Icon = FiBarChart2;
                    name = "त्रायल बॅलन्स";
                    break;
                  case 'Head':
                    Icon = FiFileText;
                    name = "हेड माहिती नोंदणी";
                    break;
                  case 'Customer':
                    Icon = FiUsers;
                    name = "ग्राहक खाते बनवा";
                    break;
                  case 'Transactions list':
                    Icon = FiCreditCard;
                    name = "देवाणघेवाण माहिती";
                    break;
                  case 'Sub Head':
                    Icon = FiUserX;
                    name = "सब हेड माहिती नोंदणी";
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
                    <Icon {...iconProps} /> {name}
                  </Nav.Link>
                );
              })}
            </React.Fragment>
          ))}

          {/* <div className="mt-3 px-3">
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleLogout}
              className="w-100 d-flex align-items-center justify-content-center"
            >
              <FiLogOut size={16} className="me-2" /> बाहेर पडा
            </Button>
          </div> */}
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
                  let name = "";
                  switch (item) {
                    case 'School':
                      Icon = FiUsers;
                      name = "शाळा माहिती"
                      break;
                    case 'Class':
                      Icon = FiGrid;
                      name = "वर्ग माहिती"
                      break;
                    case 'Staff':
                      Icon = FiUsers;
                      name = "शिक्षकवृंद माहिती"
                      break;
                    case 'Student':
                      Icon = FiHome;
                      name = "विद्यार्थी जनरल रजिस्टर माहिती नोंद"
                      break;
                    case 'Classes':
                      Icon = FiFileText;
                      name = "वर्गांची माहिती"
                      break;
                    case 'Add Academic New Students':
                      Icon = FiUserPlus;
                      name = "नवीन विद्यार्थी प्रवेश नोंद"
                      break;
                    case 'List Of Students':
                      Icon = FiBarChart2;
                      name = "विद्यार्थी यादी आणि रिपोर्ट"
                      break;
                    case 'Change Class Teacher':
                      Icon = FiFilter;
                      name = "वर्गशिक्षक बदला"
                      break;
                    case 'Mark Holiday':
                      Icon = FiCalendar;
                      name = "सुट्टीची नोंद करा"
                      break;
                    case 'Attendance':
                      Icon = FiClipboard;
                      name = "उपस्थिती माहिती नोंद"
                      break;
                    case 'Update year':
                      Icon = FiTrendingUp;
                      name = "पास नापास नोंदी"
                      break;
                    case 'Catlog Cover Page':
                      Icon = FiUserPlus;
                      name = "कॅटलॉग कवर पेज"
                      break;
                    case 'Daily Attendance Report':
                      Icon = FiFileText;
                      name = "दैनंदिन उपस्थिती अहवाल"
                      break;
                    case 'Monthly Attendance Report':
                      Icon = FiBarChart2;
                      name = "मासिक उपस्थिती अहवाल"
                      break;
                    case 'State':
                      Icon = FiMapPin;
                      name = "राज्य"
                      break;
                    case 'District':
                      Icon = FiMap;
                      name = "जिल्हा"
                      break;

                    case 'Tehsil':
                      Icon = FiLayout;
                      name = "तहसील"
                      break;
                    case 'Village':
                      Icon = FiTarget;
                      name = "गाव/शहर"
                      break;
                    case 'Dashboard':
                      Icon = FiTrendingUp;
                      name = "खाते डॅशबोर्ड";
                      break;
                    case 'Bank':
                      Icon = FiBookOpen;
                      name = "बँक नोंदणी माहिती";
                      break;
                    case 'Opening Balance':
                      Icon = FiBarChart2;
                      name = "त्रायल बॅलन्स";
                      break;
                    case 'Head':
                      Icon = FiFileText;
                      name = "हेड माहिती नोंदणी";
                      break;
                    case 'Customer':
                      Icon = FiUsers;
                      name = "ग्राहक खाते बनवा";
                      break;
                    case 'Transactions list':
                      Icon = FiCreditCard;
                      name = "देवाणघेवाण माहिती";
                      break;
                    case 'Sub Head':
                      Icon = FiUserX;
                      name = "सब हेड माहिती नोंदणी";
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
                      <Icon {...iconProps} /> {name}
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
                <FiLogOut size={16} className="me-2" /> बाहेर पडा
              </Button>
            </div>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;