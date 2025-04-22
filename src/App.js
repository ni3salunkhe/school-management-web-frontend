import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import HeadmasterDashboard from './pages/HeadmasterDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ClerkDashboard from './pages/ClerkDashboard';
import NavBarS from './components/NavBarS';
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import Attendance from './components/Attendance';
import Layout from './components/Layout';
import Developer from './pages/Developer';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const componentMap = ['StudentManagement']
  const sidebarItemsHm = [
    {
      mainMenu: ['School', 'Staff'],
    },
  ];
  const sidebarItemsClerk = [
    {
      mainMenu: ['Student','Class'],
    },
  ];
  const sidebarItemsTeacher = [
    {
      mainMenu: ['Attendance'],
    },
  ];
  return (
    <>

      <div style={{ "minHeight": "45px" }}></div>

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
              <Layout role="TEACHER" sidebarItems={sidebarItemsTeacher}>

                <TeacherDashboard componentMap={componentMap} role="TEACHER" />

              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </>
  );
}

export default App;