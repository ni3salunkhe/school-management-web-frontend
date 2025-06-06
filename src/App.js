import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, replace, Router } from 'react-router-dom';
import Login from './pages/Login';
import HeadmasterDashboard from './pages/HeadmasterDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ClerkDashboard from './pages/ClerkDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './components/Layout';
import Developer from './pages/Developer';
import Account from './modules/Account'
import { authService } from './services/authService';
import { jwtDecode } from 'jwt-decode';
import { getSidebarItems } from './utils/SidebarConfig'


function NavigationBlocker() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLinkClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href && location.pathname === '/') {
        const targetPath = new URL(link.href).pathname;
        if (targetPath !== '/') {
          e.preventDefault();
          alert('Navigation from root is blocked.');
        }
      }
    };

    const handlePopState = (e) => {
      if (location.pathname === '/') {
        // Push back to root
        navigate('/', { replace: true });
      }
    };

    document.addEventListener('click', handleLinkClick);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleLinkClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname, navigate]);

  return null;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate()
  useEffect(() => {
    const authenticated = authService.isAuthenticated();

    if (!authenticated) {
      navigate('/')
    }
    if (sessionStorage.getItem('token') === null) {
      navigate('/', { replace: true })
    }
  }, [])

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
              <Layout role="DEVELOPER" sidebarItems={sidebarItemsHm} >
                <Developer />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/headmaster/*"
          element={
            <ProtectedRoute allowedRoles={['HEADMASTER']}>
              <Layout role="headmaster" sidebarItems={sidebarItemsHm} >
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
              </ Layout>
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