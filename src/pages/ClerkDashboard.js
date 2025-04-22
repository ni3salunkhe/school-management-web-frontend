import React from 'react';
import AddClass from '../components/AddClass';
import StudentManagement from '../modules/StudentManagement';

const availableComponents = {
  'StudentManagement':StudentManagement
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