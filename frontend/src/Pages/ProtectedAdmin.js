import React, { useState, useEffect } from 'react';
import { authManager } from '../utils/authUtils';
import AdminLogin from './AdminLogin';
import Admin from './Admin';

function ProtectedAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      const authenticated = authManager.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authManager.logout();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div>
      {/* Logout button */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={handleLogout}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          Logout
        </button>
      </div>
      
      {/* Admin component */}
      <Admin />
    </div>
  );
}

export default ProtectedAdmin;