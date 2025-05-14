import React from 'react';
import AddClass from '../components/AddClass';
import StudentManagement from '../modules/StudentManagement';
import Account from '../modules/Account';

const availableComponents = {
  'StudentManagement':StudentManagement,
  'Account':Account
}

function ClerkDashboard({ componentMap = [] , role }) {
  
  return (
    <div>
      {componentMap.map((moduleName, index) => {
        const Component = availableComponents[moduleName];
        return Component ? <Component key={index} role={role} /> : null;
      })}
    </div>
  );
}

export default ClerkDashboard;