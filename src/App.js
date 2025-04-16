import logo from './logo.svg';
import './App.css';
import React from 'react';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import NewSchool from './components/NewSchool';
import NavBarS from './components/NavBarS';
import AddSchoolInfo from './components/AddSchoolInfo';
import AddStaffMember from './components/AddStaffMember';
import AddClass from './components/AddClass';
import AddClassTeacher from './components/AddClassTeacher';
import Pdfgenerator from './components/Pdfgenerator';
import AddStudent from './components/AddStudent';
import AddNewStudentAcademicYear from './components/AddNewStudentAcademicYear';
import { Route, Routes } from 'react-router-dom';
import AddNewStudentAcademicYearForm from './components/AddNewStudentAcademicYearForm';
import UpdateStudentAcademicYearForm from './components/UpdateStudentAcademicYearForm';
import UpdateStudentAcademicYear from './components/UpdateStudentAcademicYear';
import UpdateStudentAllAcademic from './components/UpdateStudentAllAcademic';
import LColdForm from './components/LColdForm';

function App() {
  return (
    <>
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
        <Route path='updateacademicyearform' element={<UpdateStudentAcademicYearForm />}></Route>
        <Route path='updateacademicyearform/:id' element={<UpdateStudentAcademicYearForm />}></Route>
        <Route path='updateacademicyearall' element={<UpdateStudentAllAcademic/>}></Route>
      </Routes> */}
      <LColdForm/>
      {/* <UpdateStudentAcademicYear /> */}
      {/* <UpdateStudentAcademicYearForm/> */}
      {/* <Login /> */}
    </>
  );
}

export default App;
