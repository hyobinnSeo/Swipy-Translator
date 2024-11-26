import React from 'react';

const Alert = ({ children }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{children}</span>
    </div>
);

export default Alert;
