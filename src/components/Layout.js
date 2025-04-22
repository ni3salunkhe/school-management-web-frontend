import React from 'react';
import Sidebar from './Sidebar';
import NavBarS from './NavBarS';

const Layout = ({ children, role, sidebarItems }) => {
  return (
    <div className="d-flex">
      <Sidebar role={role} sidebarItems={sidebarItems} />
      <div className="flex-grow-1">
        <NavBarS role={role} />
        <div className="container-fluid">{children}</div>
      </div>
    </div>
  );
};

export default Layout;