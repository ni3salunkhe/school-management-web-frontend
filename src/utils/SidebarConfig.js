export function getSidebarItems(componentMap) {
  const hasStudent = componentMap.includes('StudentManagement');
  const hasAccount = componentMap.includes('Account');
  const hasExam = componentMap.includes('Exam');

  const sidebarItemsHm = [];
  const sidebarItemsClerk = [];
  const sidebarItemsTeacher = [];

  if (hasStudent) {
    sidebarItemsHm.push({
      mainMenu: ['School', 'Class', 'Staff'],
    });

    sidebarItemsClerk.push({
      mainMenu: [
        'Student', 'Classes', 'Add Academic New Students', 'List Of Students',
        'Change Class Teacher', 'Mark Holiday', 'State', 'District', 'Tehsil', 'Village'
      ],
    });

    sidebarItemsTeacher.push({
      mainMenu: [
        'Attendance', 'Update year', 'Catlog Cover Page',
        'Daily Attendance Report', 'Monthly Attendance Report'
      ],
    });
  }

  if (hasAccount) {
   sidebarItemsClerk.push({
      account: ['Dashboard','Transactions list','Bank','Opening Balance','Customer','Head','Sub Head','Account Type'],
    });
  }

  if (hasExam) {
    sidebarItemsClerk.push({
      exam: ['Schedule', 'Fees'],
    });
  }

  return {
    sidebarItemsHm,
    sidebarItemsClerk,
    sidebarItemsTeacher
  };
}