import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import HeadmasterDashboard from './pages/HeadmasterDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ClerkDashboard from './pages/ClerkDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './components/Layout';
import Developer from './pages/Developer';
import Account from './modules/Account';
import { authService } from './services/authService';
import { jwtDecode } from 'jwt-decode';
import { getSidebarItems } from './utils/SidebarConfig';

function NavigationBlocker() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const isLoginPage = location.pathname === '/';

    // If we're on login page and there's no token, prevent back navigation
    if (isLoginPage && (!token || typeof token !== 'string' || token.trim() === '')) {
      // Add a state to history to prevent going back to protected routes
      window.history.pushState(null, null, window.location.pathname);
      
      const handlePopState = (event) => {
        // Prevent going back from login page when not authenticated
        window.history.pushState(null, null, window.location.pathname);
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }

    // Handle link clicks on login page
    const handleLinkClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href && isLoginPage) {
        const targetPath = new URL(link.href).pathname;
        if (targetPath !== '/') {
          e.preventDefault();
          alert('Navigation from root is blocked.');
        }
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, [location.pathname, navigate]);

  return null;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    const hasToken = sessionStorage.getItem('token');
    const isLoginPage = location.pathname === '/';

    // If user is NOT authenticated and NOT on login page, redirect to login
    if ((!authenticated || !hasToken) && !isLoginPage) {
      navigate('/', { replace: true });
      return;
    }

    // If user IS authenticated and IS on login page, redirect to appropriate dashboard
    if (authenticated && hasToken && isLoginPage) {
      try {
        const token = sessionStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const userRole = decodedToken.role || decodedToken.authorities?.[0];

        // Redirect based on role
        switch (userRole) {
          case 'DEVELOPER':
            navigate('/developer', { replace: true });
            break;
          case 'HEADMASTER':
            navigate('/headmaster', { replace: true });
            break;
          case 'CLERK':
            navigate('/clerk', { replace: true });
            break;
          case 'TEACHER':
            navigate('/teacher', { replace: true });
            break;
          default:
            // If role is unknown, stay on login page or handle as needed
            console.warn('Unknown user role:', userRole);
            break;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        // If token is invalid, clear it and stay on login
        sessionStorage.removeItem('token');
      }
    }
  }, [location.pathname, navigate]);

  const isLoginPage = location.pathname === '/';
  const componentMap = ['StudentManagement', 'Account']; // dynamically from backend
  const { sidebarItemsHm, sidebarItemsClerk, sidebarItemsTeacher } = getSidebarItems(componentMap);

  return (
    <div>
      {!isLoginPage && <div style={{ minHeight: "45px" }}></div>}

      <NavigationBlocker />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/developer/*"
          element={
            <ProtectedRoute allowedRoles={['DEVELOPER']}>
              <Layout role="DEVELOPER" sidebarItems={sidebarItemsHm}>
                <Developer />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/headmaster/*"
          element={
            <ProtectedRoute allowedRoles={['HEADMASTER']}>
              <Layout role="headmaster" sidebarItems={sidebarItemsHm}>
                <HeadmasterDashboard componentMap={componentMap} role="HEADMASTER" />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clerk/*"
          element={
            <ProtectedRoute allowedRoles={['CLERK']}>
              <Layout role="clerk" sidebarItems={sidebarItemsClerk}>
                <ClerkDashboard componentMap={componentMap} role="CLERK" />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <Layout role="teacher" sidebarItems={sidebarItemsTeacher}>
                <TeacherDashboard componentMap={componentMap} role="TEACHER" />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;