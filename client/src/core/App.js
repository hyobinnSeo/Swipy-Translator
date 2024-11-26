import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TranslatorApp from '../pages/TranslatorApp';
import PasswordProtection from '../pages/PasswordProtection';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <TranslatorApp />
              ) : (
                <PasswordProtection onAuthenticated={setIsAuthenticated} />
              )
            }
          />
          {/* Redirect any other paths to the root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
