import React from 'react';
import { Container } from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import AddSchoolInfo from '../components/AddSchoolInfo';
import AddStaffMember from '../components/AddStaffMember';
import AddStudent from '../components/AddStudent';
import AddClass from '../components/AddClass';
import Attendance from '../components/Attendance';
import StudentList from '../components/StudentList';
import ReportsShows from '../components/ReportsShows';
import LColdForm from '../components/LColdForm';
import LCdownload from '../components/LCdownload';
import LCnewdownload from '../components/LCnewdownload';


function StudentManagement({ role }) {
  const renderRoutes = () => {
    switch (role) {
      case 'HEADMASTER':
        return (
          <Routes>
            <Route path='school' element={<AddSchoolInfo />} />
            <Route path='staff' element={<AddStaffMember />} />
            <Route path='class' element={<AddClass />} />
          </Routes>
        );
      case 'CLERK':
        return (
          <Routes>
            <Route path='student' element={<AddStudent />} />
            <Route path='studentlist' element={<StudentList />} ></Route>
            <Route path='reports/:id' element={<ReportsShows />}></Route>
            <Route path='reports/lc-old/:id' element={<LColdForm />}></Route>
            <Route path='reports/download/:id' element={<LCdownload />}></Route>
            <Route path='reports/lc-new/:id' element={<LColdForm />}></Route>
            <Route path='reports/lcnewdownload/:id' element={<LCnewdownload />}></Route>
          </Routes>
        );
      case 'TEACHER':
        return (
          <Routes>
            <Route path='attendance' element={<Attendance />} />
          </Routes>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      {renderRoutes()}
    </Container>
  );
}

export default StudentManagement;
