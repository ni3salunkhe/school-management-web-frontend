import logo from './logo.svg';
import './App.css';
import React from 'react';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import NewSchool from './components/NewSchool';
import NavBarS from './components/NavBarS';
import ViewSchools from './components/ViewSchools';
import { Route, Routes } from 'react-router-dom';
import Subscription from './components/Subscription';

function App() {
  return (
    <>
      <NavBarS />
      <div style={{ "min-height": "45px" }}></div>
      <Routes>
        <Route path='/view-school/*' element={<ViewSchools />} />
        <Route path='/new-school/*' element={<NewSchool />} />
        <Route path='/subscription/*' element={<Subscription />} />

      </Routes>

      {/* <Login /> */}
    </>
  );
}

export default App;
