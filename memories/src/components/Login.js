import React from 'react';
import '../styles/Login.css';

const Login = ({ onClose }) => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Login to Your Account</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <p>Choose your login method:</p>
          <button className="google-login-button" onClick={handleGoogleLogin}>
            <span className="google-icon">G</span>
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;