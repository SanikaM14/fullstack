import React from 'react';
import '../styles/Register.css';

const Register = ({ onClose }) => {
  const handleGoogleRegister = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Create Your Account</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <p>Join the Memory Flashback Portal:</p>
          <button className="google-register-button" onClick={handleGoogleRegister}>
            <span className="google-icon">G</span>
            Register with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;