import React, { useState, useEffect } from "react";
import { Offcanvas, Collapse } from 'react-bootstrap';
import { FaUniversity } from 'react-icons/fa';
import {
  FiHome, FiFileText, FiUsers, FiLogOut, FiFilter,
  FiBarChart2, FiUserPlus, FiGrid, FiCalendar,
  FiClipboard, FiTrendingUp, FiMapPin, FiMap, FiLayout, FiTarget,
  FiCreditCard, FiBookOpen, FiUserX, FiChevronDown, FiChevronRight, FiMenu, FiSettings,
  FiChevronsLeft, FiChevronsRight,
  FiFilePlus
} from 'react-icons/fi';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from "../services/authService"; // Assuming this path is correct

// Define base widths
const BASE_EXPANDED_WIDTH = '300px'; // Default expanded width
const WIDER_EXPANDED_WIDTH = '500px'; // Wider width for specific routes
const COMPACT_SIDEBAR_WIDTH = '80px';  // Compact width (icon-only)

const Sidebar = ({ sidebarItems = [], role }) => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [isSidebarCompact, setIsSidebarCompact] = useState(false);
  // This state will hold the "target" expanded width based on the route
  const [routeBasedExpandedWidth, setRouteBasedExpandedWidth] = useState(BASE_EXPANDED_WIDTH);
  // This state will hold the actual width to be applied to the sidebar
  const [currentAppliedWidth, setCurrentAppliedWidth] = useState(BASE_EXPANDED_WIDTH);


  // 1. Determine the "target" expanded width based on the current route
  useEffect(() => {
    if (location.pathname === '/teacher/monthlyattendancereport') {
      // Assuming you want to hide the sidebar or have a specific very small width
      // For now, let's stick to the standard widths and handle hiding elsewhere if needed
      setRouteBasedExpandedWidth(BASE_EXPANDED_WIDTH); // Or handle differently
      return; // Exit if sidebar should be hidden for this path
    }
    if (location.pathname === '') {
      setRouteBasedExpandedWidth(WIDER_EXPANDED_WIDTH);
    } else {
      setRouteBasedExpandedWidth(BASE_EXPANDED_WIDTH);
    }
  }, [location.pathname]);

  // 2. Determine the actual applied width based on compact state and route-based expanded width
  useEffect(() => {
    if (isSidebarCompact) {
      setCurrentAppliedWidth(COMPACT_SIDEBAR_WIDTH);
    } else {
      setCurrentAppliedWidth(routeBasedExpandedWidth);
    }
  }, [isSidebarCompact, routeBasedExpandedWidth]);


  // useEffect for expandedSections (active route highlighting, etc.) - NO CHANGE NEEDED HERE
  useEffect(() => {
    const getActiveSectionKey = () => {
      if (!Array.isArray(sidebarItems) || !role || sidebarItems.length === 0) return null;
      for (const section of sidebarItems) {
        if (section && typeof section === 'object' && Object.keys(section).length > 0) {
          const sectionKey = Object.keys(section)[0];
          const items = section[sectionKey];
          if (items && Array.isArray(items)) {
            if (items.some(item => {
              const path = `/${role}/${item.trim().toLowerCase().replace(/\s+/g, '')}`;
              return location.pathname === path || (path !== `/${role}` && location.pathname.startsWith(path + '/'));
            })) {
              return sectionKey;
            }
          }
        }
      }
      return null;
    };

    const activeKey = getActiveSectionKey();

    setExpandedSections(prevExpanded => {
      const isInitialLoad = Object.keys(prevExpanded).length === 0 ||
                            !sidebarItems.every(section => {
                                if (!section || typeof section !== 'object' || Object.keys(section).length === 0) return true; // skip if section is invalid
                                const key = Object.keys(section)[0];
                                return key in prevExpanded;
                            }) ||
                            sidebarItems.length !== Object.keys(prevExpanded).length;

      if (isInitialLoad && Array.isArray(sidebarItems) && sidebarItems.length > 0) {
        const initialState = {};
        let firstValidKey = null;
        sidebarItems.forEach(section => {
          if (section && typeof section === 'object' && Object.keys(section).length > 0) {
              const key = Object.keys(section)[0];
              initialState[key] = false;
              if (!firstValidKey) firstValidKey = key;
          }
        });

        if (activeKey) {
          initialState[activeKey] = true;
        } else if (firstValidKey) { // Use the first valid key found
          initialState[firstValidKey] = true;
        }
        return initialState;
      }
      if (activeKey && prevExpanded[activeKey] === false) {
        return { ...prevExpanded, [activeKey]: true };
      }
      return prevExpanded;
    });
  }, [sidebarItems, role, location.pathname]);


  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path || (path !== `/${role}` && location.pathname.startsWith(path + '/'));
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width >= 768 && showOffcanvas) {
        setShowOffcanvas(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showOffcanvas]); // Removed isSidebarCompact, resize shouldn't directly change compact state

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  const toggleSidebarCompact = () => {
    setIsSidebarCompact(!isSidebarCompact);
    // If collapsing, also collapse all dropdown sections for a cleaner compact view
    if (!isSidebarCompact) { // This means it is *about to become* compact
        const collapsedAll = {};
        Object.keys(expandedSections).forEach(key => {
            collapsedAll[key] = false;
        });
        setExpandedSections(collapsedAll);
    }
  };


  const getSectionTitle = (sectionKey) => {
    switch (sectionKey) {
      case 'mainMenu': return 'विद्यार्थी व्यवस्थापन';
      case 'masterMenu': return 'मास्टर व्यवस्थापन';
      case 'account': return 'खाते व्यवस्थापन';
      case 'reports': return 'अहवाल';
      default:
        return sectionKey.replace(/([A-Z](?=[a-z]))/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
    }
  };

  const getItemDetails = (item) => {
    const iconProps = { size: 18, className: 'me-2 flex-shrink-0' };
    let IconComponent = FiFileText;
    let name = item;

    switch (item.trim().toLowerCase().replace(/\s+/g, '')) {
      case 'school': IconComponent = FiUsers; name = "शाळा माहिती"; break;
      case 'class': IconComponent = FiGrid; name = "वर्ग माहिती"; break;
      case 'classes': IconComponent = FiGrid; name = "वर्ग शिक्षक नियुक्ती"; break;
      case 'staff': IconComponent = FiUsers; name = "शिक्षकवृंद माहिती"; break;
      case 'student': IconComponent = FiHome; name = "विद्यार्थी जनरल रजिस्टर"; break;
      case 'addacademicnewstudents': IconComponent = FiUserPlus; name = "नवीन विद्यार्थी प्रवेश"; break;
      case 'listofstudents': IconComponent = FiBarChart2; name = "विद्यार्थी यादी/अहवाल"; break;
      case 'changeclassteacher': IconComponent = FiFilter; name = "वर्गशिक्षक बदला"; break;
      case 'markholiday': IconComponent = FiCalendar; name = "सुट्टी नोंद"; break;
      case 'attendance': IconComponent = FiClipboard; name = "उपस्थिती नोंद"; break;
      case 'catlogcoverpage': IconComponent = FiUserPlus; name = "कॅटलॉग कवर पेज"; break;
      case 'updateyear': IconComponent = FiTrendingUp; name = "पास/नापास नोंदी"; break;
      case 'dailyattendancereport': IconComponent = FiFileText; name = "दैनंदिन उपस्थिती अहवाल"; break;
      case 'monthlyattendancereport': IconComponent = FiBarChart2; name = "मासिक उपस्थिती अहवाल"; break;
      case 'state': IconComponent = FiMapPin; name = "राज्य"; break;
      case 'district': IconComponent = FiMap; name = "जिल्हा"; break;
      case 'tehsil': IconComponent = FiLayout; name = "तालुका"; break;
      case 'village': IconComponent = FiTarget; name = "गाव/शहर"; break;
      case 'dashboard': IconComponent = FiTrendingUp; name = "खाते डॅशबोर्ड"; break;
      case 'bank': IconComponent = FaUniversity; name = "बँक नोंदणी"; break;
      case 'openingbalance': IconComponent = FiBarChart2; name = "ताळेबंद"; break;
      case 'head': IconComponent = FiFileText; name = "लेखा शीर्ष (Head)"; break;
      case 'customer': IconComponent = FiUsers; name = "ग्राहक खाते"; break;
      case 'transactionslist': IconComponent = FiCreditCard; name = "व्यवहार सूची"; break;
      case 'subhead': IconComponent = FiUserX; name = "उप-शीर्ष (Sub Head)"; break;
      case 'accounttype': IconComponent = FiBookOpen; name="खाते प्रकार मास्टर"; break;
      case 'accountreports':IconComponent=FiFilePlus;name="हिशोब अहवाल";break;
      default:
        name = item.replace(/([A-Z](?=[a-z]))/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
    }
    return { IconComponent, name, iconProps };
  };


  const renderSidebarContent = (isMobileView = false) => (
    <>
      {isMobileView && (
        <>
          <div className="p-3 border-bottom d-flex align-items-center bg-light">
            <div className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px' }}>
              {role ? role.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="fw-bold text-dark">{role ? role.toUpperCase() : 'User'}</div>
              <small className="text-muted">Menu</small>
            </div>
          </div>
          <div className="p-2">
            <input
              type="search"
              placeholder="Search..."
              className="form-control form-control-sm rounded-pill"
              aria-label="Search menu items"
            />
          </div>
        </>
      )}

      <nav className="nav flex-column py-2">
        {Array.isArray(sidebarItems) && sidebarItems.map((section, index) => {
          if (!section || typeof section !== 'object' || Object.keys(section).length === 0) return null;
          const sectionKey = Object.keys(section)[0];
          const items = section[sectionKey];
          if (!Array.isArray(items) || items.length === 0) return null; // Ensure items array is not empty

          const isExpanded = !!expandedSections[sectionKey];
          const ChevronIcon = isExpanded ? FiChevronDown : FiChevronRight;
          const { IconComponent: SectionIcon } = getItemDetails(items[0] || sectionKey);

          return (
            <React.Fragment key={`${sectionKey}-${index}`}>
              <div
                className={`nav-link text-muted text-uppercase fw-bold small px-3 py-2 d-flex align-items-center ${isSidebarCompact && !isMobileView ? 'justify-content-center' : 'justify-content-between'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => !(isSidebarCompact && !isMobileView) && toggleSection(sectionKey)}
                title={ (isSidebarCompact && !isMobileView) ? getSectionTitle(sectionKey) : ""}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && !(isSidebarCompact && !isMobileView) && toggleSection(sectionKey)}
                aria-expanded={(isSidebarCompact && !isMobileView) ? undefined : isExpanded}
                aria-controls={(isSidebarCompact && !isMobileView) ? undefined :`collapse-${sectionKey}`}
              >
                {(isSidebarCompact && !isMobileView) ? <SectionIcon size={22} /> : getSectionTitle(sectionKey)}
                {!(isSidebarCompact && !isMobileView) && <ChevronIcon size={16} />}
              </div>

              {!(isSidebarCompact && !isMobileView) && (
                <Collapse in={isExpanded}>
                  <div id={`collapse-${sectionKey}`}>
                    {items.map((item, itemIndex) => {
                      const path = `/${role}/${item.trim().toLowerCase().replace(/\s+/g, '')}`;
                      const { IconComponent, name, iconProps } = getItemDetails(item);
                      const itemIsActive = isActive(path);
                      return (
                        <Link
                          key={itemIndex}
                          to={path}
                          className={`nav-link d-flex align-items-center py-2 px-3 mx-2 mb-1 rounded-2 ${
                            itemIsActive ? 'active bg-primary text-white shadow-sm' : 'text-dark link-hover'
                          }`}
                          onClick={isMobileView ? handleCloseOffcanvas : undefined}
                          style={{ transition: 'all 0.2s ease-in-out' }}
                          aria-current={itemIsActive ? "page" : undefined}
                        >
                          <IconComponent {...iconProps} />
                          <span className="ms-1">{name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </Collapse>
              )}

               {(isSidebarCompact && !isMobileView) && (
                 <div className="compact-item-list">
                    {items.map((item, itemIndex) => {
                      const path = `/${role}/${item.trim().toLowerCase().replace(/\s+/g, '')}`;
                      const { IconComponent, name } = getItemDetails(item);
                      const itemIsActive = isActive(path);
                       return (
                        <Link
                          key={`${itemIndex}-compact`}
                          to={path}
                          className={`nav-link d-flex align-items-center justify-content-center py-2 px-3 mx-2 mb-1 rounded-2 ${
                            itemIsActive ? 'active bg-primary text-white shadow-sm' : 'text-dark link-hover'
                          }`}
                          onClick={isMobileView ? handleCloseOffcanvas : undefined}
                          style={{ transition: 'all 0.2s ease-in-out' }}
                          aria-current={itemIsActive ? "page" : undefined}
                          title={name}
                        >
                          <IconComponent size={22} />
                        </Link>
                      );
                    })}
                 </div>
               )}
            </React.Fragment>
          );
        })}
      </nav>

      {isMobileView && (
        <div className="mt-auto p-3 border-top">
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center"
          >
            <FiLogOut size={16} className="me-2" /> बाहेर पडा
          </button>
        </div>
      )}
    </>
  );

  // Conditionally render nothing if on a path where sidebar should be hidden
  if (location.pathname === '/teacher/monthlyattendancereport') {
    return null;
  }

  return (
    <>
      {isMobile && (
        <button
          className="btn btn-light d-md-none m-2 position-fixed top-0 start-0"
          style={{ zIndex: 1051, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
          type="button"
          onClick={handleShowOffcanvas}
          aria-controls="sidebarOffcanvas"
          aria-label="Toggle navigation menu"
        >
          <FiMenu size={24} />
        </button>
      )}

      <div
        className={`d-none d-md-flex flex-column bg-white shadow-sm vh-100 position-sticky top-0 sidebar-transition ${isSidebarCompact ? 'sidebar-compact' : ''}`}
        style={{
          width: currentAppliedWidth, // Use the merged width state
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        <div className="p-3 border-bottom d-flex align-items-center sticky-top bg-white justify-content-between" style={{minHeight: '56px', flexShrink: 0}}>
            <div className={`d-flex align-items-center overflow-hidden ${isSidebarCompact ? 'sidebar-brand-compact' : 'sidebar-brand-expanded'}`}>
                <FiSettings size={24} className="me-2 text-primary flex-shrink-0" />
                <h5 className="mb-0 text-primary fw-bold text-nowrap">SMS</h5>
            </div>
            <button
                className="btn btn-sm btn-outline-secondary p-1 lh-1 flex-shrink-0"
                onClick={toggleSidebarCompact}
                title={isSidebarCompact ? "Expand Sidebar" : "Collapse Sidebar"}
                aria-label={isSidebarCompact ? "Expand Sidebar" : "Collapse Sidebar"}
                aria-expanded={!isSidebarCompact}
            >
                {isSidebarCompact ? <FiChevronsRight size={20} /> : <FiChevronsLeft size={20} />}
            </button>
        </div>
        <div className="flex-grow-1 overflow-auto">
            {renderSidebarContent(false)}
        </div>
        {/* <div className={`mt-auto p-3 border-top ${isSidebarCompact ? 'text-center' : ''}`} style={{flexShrink: 0}}>
             <button
                type="button"
                onClick={handleLogout}
                className={`btn btn-sm btn-outline-secondary w-100 d-flex align-items-center ${isSidebarCompact ? 'justify-content-center p-2' : 'justify-content-center'}`}
                title="बाहेर पडा"
            >
                <FiLogOut size={isSidebarCompact ? 20 : 16} className={isSidebarCompact ? '' : 'me-2'}/>
                {!isSidebarCompact && <span className="ms-1 text-nowrap">बाहेर पडा</span>}
            </button>
        </div> */}
      </div>

      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffcanvas}
        placement="start"
        className="d-md-none"
        style={{ width: '280px' }}
        id="sidebarOffcanvas"
        aria-labelledby="sidebarOffcanvasLabel"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title id="sidebarOffcanvasLabel" className="fw-bold h6">
             SMS Menu
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0 d-flex flex-column">
          <div className="flex-grow-1 overflow-auto">
            {renderSidebarContent(true)}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;