import logo from './logo.svg';
import './App.css';
import React from 'react';
import Login from './pages/Login';
import 'bootstrap/dist/css/bootstrap.min.css';
import NewSchool from './components/NewSchool';
import NavBarS from './components/NavBarS';

function App() {
  return (
    <>
      {/* <NavBarS /> */}
      <div style={{"min-height": "45px"}}></div>
      <NewSchool />
      {/* <Login /> */}
    </>
  );
}

export default App;
