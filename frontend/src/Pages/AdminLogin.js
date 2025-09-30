import React, { useState } from 'react';
import { authManager } from '../utils/authUtils';
import '../Css/AdminLogin.css';

function AdminLogin({ onAuthenticated }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const isValid = await authManager.verifyPassword(password);
      
      if (isValid) {
        authManager.setAuthenticated();
        onAuthenticated();
      } else {
        setError('Invalid password. Access denied.');
        setPassword(''); // Clear password field
      }
    } catch (error) {
      setError('Authentication error. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h2>Admin Access Required</h2>
          <p>Please enter the admin password to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <input
              type="password"
              id="admin-password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter admin password"
              disabled={isLoading}
              autoFocus
              required
            />
          </div>
          
          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? 'Verifying...' : 'Access Admin'}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <p>Secure authentication • Session expires in 2 hours</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;