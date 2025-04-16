import logo from './logo.svg';
import './App.css';
import React, { useEffect } from 'react';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import NewSchool from './components/NewSchool';
import NavBarS from './components/NavBarS';
import ViewSchools from './components/ViewSchools';
import { Route, Routes, useLocation } from 'react-router-dom';
import Subscription from './components/Subscription';
import Attendance from './components/Attendance';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  sessionStorage.setItem("udiseNo",1)
  
  return (
    <>
      {!isLoginPage && (
        <>
          <NavBarS />
          <div style={{ "minHeight": "45px" }}></div>
        </>
      )}
      
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/view-school/*' element={<ViewSchools />} />
        <Route path='/new-school/*' element={<NewSchool />} />
        <Route path='/subscription/*' element={<Subscription />} />
        <Route path='/attendance/*' element={<Attendance />} />
      </Routes> 
    </>
  );
}

export default App;

