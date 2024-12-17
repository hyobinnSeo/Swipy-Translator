import React from 'react';

const Copyright = ({ darkMode }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className={`text-center py-4 text-sm ${
      darkMode ? 'text-slate-400' : 'text-gray-600'
    }`}>
      © {currentYear} Swipy. All rights reserved.
    </div>
  );
};

export default Copyright;
