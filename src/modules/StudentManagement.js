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
import BonafideCertificate from '../components/BonafideCertificate';
import PresentyCertificate from '../components/PresentyCertificate';
import SingleStudentInfo from '../components/SingleStudentInfo';
import AddClassTeacher from '../components/AddClassTeacher';
import AddNewStudentAcademicYear from '../components/AddNewStudentAcademicYear';
import AddNewStudentAcademicYearForm from '../components/AddNewStudentAcademicYearForm';
import UpdateStudentAcademicYear from '../components/UpdateStudentAcademicYear';
import UpdateStudentAcademicYearForm from '../components/UpdateStudentAcademicYearForm';
import UpdateStudentAllAcademic from '../components/UpdateStudentAllAcademic';
import StaffList from '../components/StaffList';
import ListOfClass from '../components/ListOfClass';
import EditClassTeacher from '../components/EditClassTeacher';
import AttendanceReport from '../components/AttendanceReport';
import AttendanceCoverPage from '../components/AttendanceCoverPage';
import DailyAttendanceReport from '../components/DailyAttendanceReport';



function StudentManagement({ role }) {
  const renderRoutes = () => {
    switch (role) {
      case 'HEADMASTER':
        return (
          <Routes>
            <Route path='school' element={<AddSchoolInfo />} />
            <Route path='staff' element={<StaffList />} />
            <Route path='class' element={<AddClass />} />
            <Route path='staffAdd' element={<AddStaffMember/>} />
          </Routes>
        );
      case 'CLERK':
        return (
          <Routes>
            <Route path='student' element={<AddStudent />} />
            <Route path='listofstudents' element={<StudentList />} ></Route>
            <Route path='reports/:id' element={<ReportsShows />}></Route>
            <Route path='reports/lc-old/:id' element={<LColdForm />}></Route>
            <Route path='reports/download/:id' element={<LCdownload />}></Route>
            <Route path='reports/lc-new/:id' element={<LColdForm />}></Route>
            <Route path='reports/lcnewdownload/:id' element={<LCnewdownload />}></Route>
            <Route path='reports/bonfide/:id' element={<BonafideCertificate />}></Route>
            <Route path='reports/prsenty/:id' element={<PresentyCertificate />}></Route>
            <Route path='singlestudentinfo/:id' element={<SingleStudentInfo />}></Route>
            <Route path='classes/' element={<AddClassTeacher/>}></Route>
            <Route path='changeclassteacher/' element={<ListOfClass/>}/>
            <Route path='AddAcademicNewStudents/' element={<AddNewStudentAcademicYear/>}></Route>
            <Route path='academicyearform/:id' element={<AddNewStudentAcademicYearForm/>}/>
            <Route path='editclassteacher/:id' element={<EditClassTeacher/>}/>
            <Route path='attendancereport' element={<AttendanceReport/>}/>
            <Route path='attendencecover' element={<AttendanceCoverPage/>}/>
          </Routes>
        );
      case 'TEACHER':
        return (
          <Routes>
            <Route path='attendance' element={<Attendance />} />
            <Route path='Updateyear' element={<UpdateStudentAcademicYear/>}/>
            <Route path='updateacademicyearform/:id' element={<UpdateStudentAcademicYearForm/>}/>
            <Route path='updateacademicyearall' element={<UpdateStudentAllAcademic />} />
            <Route path='dailyreport' element={<DailyAttendanceReport/>}/>
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
