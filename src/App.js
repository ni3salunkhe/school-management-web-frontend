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
import Account from './modules/Account'
import { authService } from './services/authService';
import { jwtDecode } from 'jwt-decode';
import {getSidebarItems } from './utils/SidebarConfig'

function App() {
  const navigate=useNavigate()
  useEffect(()=>{
    const authenticated=authService.isAuthenticated();
    
    if(!authenticated){
      navigate('/')
    }
  },[])

  const location = useLocation();
  const isLoginPage = location.pathname === '/';
    const componentMap = ['StudentManagement']; // dynamically from backend
  const { sidebarItemsHm, sidebarItemsClerk, sidebarItemsTeacher } = getSidebarItems(componentMap);
  return (
    <div>
      {!isLoginPage && <div style={{ minHeight: "45px" }}></div>}
       <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/developer/*"
          element={
            <ProtectedRoute allowedRoles={['DEVELOPER']}>
              <Layout role="DEVELOPER" sidebarItems={sidebarItemsHm} >
                <Developer/>
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