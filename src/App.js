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
import AddSchoolInfo from './components/AddSchoolInfo';
import AddStaffMember from './components/AddStaffMember';
import AddClass from './components/AddClass';
import AddClassTeacher from './components/AddClassTeacher';
import Pdfgenerator from './components/Pdfgenerator';
import AddStudent from './components/AddStudent';
import AddNewStudentAcademicYear from './components/AddNewStudentAcademicYear';

import AddNewStudentAcademicYearForm from './components/AddNewStudentAcademicYearForm';
import UpdateStudentAcademicYearForm from './components/UpdateStudentAcademicYearForm';
import UpdateStudentAcademicYear from './components/UpdateStudentAcademicYear';
import UpdateStudentAllAcademic from './components/UpdateStudentAllAcademic';
import LColdForm from './components/LColdForm';
import StudentList from './components/StudentList';
import ReportsShows from './components/ReportsShows';
import LCdownload from './components/LCdownload';
import LCnewdownload from './components/LCnewdownload';
import BonafideCertificate from './components/BonafideCertificate';
import PresentyCertificate from './components/PresentyCertificate';
import SingleStudentInfo from './components/SingleStudentInfo';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const componentMap = ['StudentManagement']
  const sidebarItemsHm = [
    {
      mainMenu: ['School','Class', 'Staff'],
    },
  ];
  const sidebarItemsClerk = [
    {
      mainMenu: ['Student','StudentList','classteacher','AddAcademicNewStudents'],
    },
  ];
  const sidebarItemsTeacher = [
    {
      mainMenu: ['Attendance','Updateyear'],
    },
  ];

  return (
    <div>

      <div style={{ "minHeight": "45px" }}></div>

      
      
      {/* {!isLoginPage && (
        <>
          <NavBarS />
          <div style={{ "minHeight": "45px" }}></div>
        </>
      )} */}

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
    {/*
      <Routes>
        <Route path='' element={<StudentList />}></Route>
        <Route path='studentlist' element={<StudentList />} ></Route>
        <Route path='reports/:id' element={<ReportsShows />}></Route>
        <Route path='reports/lc-old/:id' element={<LColdForm />}></Route>
        <Route path='reports/download/:id' element={<LCdownload />}></Route>
        <Route path='reports/lc-new/:id' element={<LColdForm />}></Route>
        <Route path='reports/lcnewdownload/:id' element={<LCnewdownload />}></Route>
        <Route path='reports/bonfide/:id'element={<BonafideCertificate/>}></Route>
        <Route path='reports/prsenty/:id' element={<PresentyCertificate/>}></Route>
        <Route path='singlestudentinfo/:id' element={<SingleStudentInfo/>}></Route>
      </Routes>

      {/* <UpdateStudentAcademicYear /> */}
      {/* <UpdateStudentAcademicYearForm/> */}
      {/* <Login /> */}
    </div>
  );
}

export default App;