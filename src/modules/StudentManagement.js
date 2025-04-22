import React from 'react';
import { Container } from 'react-bootstrap';
import { Route, Routes } from 'react-router-dom';
import AddSchoolInfo from '../components/AddSchoolInfo';
import AddStaffMember from '../components/AddStaffMember';
import AddStudent from '../components/AddStudent';
import AddClass from '../components/AddClass';
import Attendance from '../components/Attendance';

function StudentManagement({ role }) {
  const renderRoutes = () => {
    switch (role) {
      case 'HEADMASTER':
        return (
          <Routes>
            <Route path='school' element={<AddSchoolInfo />} />
            <Route path='staff' element={<AddStaffMember />} />
          </Routes>
        );
      case 'CLERK':
        return (
          <Routes>
            <Route path='student' element={<AddStudent/>} />
            <Route path='class' element={<AddClass/>} />
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
