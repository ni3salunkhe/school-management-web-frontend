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
  // sessionStorage.setItem("udiseNo",1)

  return (
    <>

      <div style={{ "minHeight": "45px" }}></div>

      {/* {!isLoginPage && (
        <>
          <NavBarS />
          <div style={{ "minHeight": "45px" }}></div>
        </>
      )}
      
      <Routes>
        <Route path="/" element={<Login />} />
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
        <Route path='/' element={<Login />} />
        <Route path='/view-school/*' element={<ViewSchools />} />
        <Route path='/new-school/*' element={<NewSchool />} />
        <Route path='/subscription/*' element={<Subscription />} />
        <Route path='/attendance/*' element={<Attendance />} />
      </Routes>  */}
      {/* <NavBarS /> */}
      <div style={{ "min-height": "45px" }}></div>
      {/* <NewSchool /> */}
      {/* <AddSchoolInfo/> */}
      {/* <AddStaffMember/> */}
      {/* <AddClass/> */}
      {/* <AddClassTeacher/> */}
      {/* <Pdfgenerator/> */}
      {/* <AddStudent/> */}
      {/* <AddNewStudentAcademicYear/> */}
      {/* <Routes>
          <Route path='' element={<AddNewStudentAcademicYear/>}></Route>
          <Route path='academicyearform' element={<AddNewStudentAcademicYear/>}></Route>
          <Route path='academicyearform/:id' element={<AddNewStudentAcademicYearForm/>}></Route>
        </Routes> */}

      {/* <Routes>
        <Route path='' element={<UpdateStudentAcademicYear />}></Route>
        <Route path='updateacademicyearlist' element={<UpdateStudentAcademicYear/>}></Route>
        <Route path='updateacademicyearform' element={<UpdateStudentAcademicYearForm />}></Route>
        <Route path='updateacademicyearform/:id' element={<UpdateStudentAcademicYearForm />}></Route>
        <Route path='updateacademicyearall' element={<UpdateStudentAllAcademic/>}></Route>
      </Routes> */}
      {/* <LColdForm/> */}
      {/* <StudentList /> */}
      <Routes>
        <Route path='' element={<StudentList/>}></Route>
        <Route path='studentlist' element={<StudentList/>} ></Route>
        <Route path='reports/:id' element={<ReportsShows/>}></Route>
        <Route path='reports/lc-old/:id' element={<LColdForm/>}></Route>
        <Route path='reports/download/:id' element={<LCdownload/>}></Route>
        <Route path='reports/lc-new/:id' element={<LColdForm/>}></Route>
        <Route path='reports/lcnewdownload/:id' element={<LCnewdownload/>}></Route>
      </Routes>

      {/* <UpdateStudentAcademicYear /> */}
      {/* <UpdateStudentAcademicYearForm/> */}
      {/* <Login /> */}
    </>
  );
}

export default App;