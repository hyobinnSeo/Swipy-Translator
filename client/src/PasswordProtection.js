import React, { useState, useEffect } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';

const PasswordProtection = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Get password from environment variable
  const CORRECT_PASSWORD = process.env.REACT_APP_ACCESS_PASSWORD;

  useEffect(() => {
    // Check if already authenticated
    const isAuth = localStorage.getItem('translator_auth');
    if (isAuth === 'true') {
      onAuthenticated(true);
    }
  }, [onAuthenticated]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem('translator_auth', 'true');
      onAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Private Translator</h2>
          <Lock className="h-5 w-5 text-gray-500" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500"
                placeholder="Enter access password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm flex items-center">
              <X className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-navy-500 text-white rounded-lg py-2 px-4 hover:bg-navy-600 
            transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
          >
            Access Translator
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordProtection;