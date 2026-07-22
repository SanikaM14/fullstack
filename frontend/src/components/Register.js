import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Register.css';

const Register = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email format (e.g., user@example.com)";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and a number";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const sanitizedEmail = email.trim().toLowerCase();
      
      const csrfRes = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/auth/csrf`, { withCredentials: true });
      const csrfToken = csrfRes.data.token;

      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/auth/register`, {
        name: name.trim(),
        email: sanitizedEmail,
        password
      }, { 
        withCredentials: true,
        headers: { 'X-XSRF-TOKEN': csrfToken }
      });
      
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/auth/login`, {
        email: sanitizedEmail,
        password
      }, { 
        withCredentials: true,
        headers: { 'X-XSRF-TOKEN': csrfToken }
      });
      
      onClose();
      window.location.reload();
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Create an Account</h2>
          <button className="close-button" onClick={onClose} disabled={isSubmitting}>×</button>
        </div>
        <div className="modal-content">

          {serverError && <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{serverError}</p>}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label htmlFor="register-name">Name</label>
              <input 
                id="register-name"
                type="text" 
                placeholder="Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                maxLength="100"
                style={{ padding: '10px', borderRadius: '5px', border: errors.name ? '1px solid red' : '1px solid #ccc' }}
              />
              {errors.name && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.name}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label htmlFor="register-email">Email</label>
              <input 
                id="register-email"
                type="email" 
                placeholder="Email" 
                autoComplete="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                maxLength="100"
                style={{ padding: '10px', borderRadius: '5px', border: errors.email ? '1px solid red' : '1px solid #ccc' }}
              />
              {errors.email && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.email}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative' }}>
              <label htmlFor="register-password">Password</label>
              <div style={{ display: 'flex', width: '100%', position: 'relative' }}>
                <input 
                  id="register-password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  autoComplete="new-password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength="100"
                  style={{ width: '100%', padding: '10px', paddingRight: '40px', borderRadius: '5px', border: errors.password ? '1px solid red' : '1px solid #ccc', boxSizing: 'border-box' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.password}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative' }}>
              <label htmlFor="register-confirm-password">Confirm Password</label>
              <input 
                id="register-confirm-password"
                type={showPassword ? "text" : "password"} 
                placeholder="Confirm Password" 
                autoComplete="new-password"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                maxLength="100"
                style={{ padding: '10px', borderRadius: '5px', border: errors.confirmPassword ? '1px solid red' : '1px solid #ccc' }}
              />
              {errors.confirmPassword && <span style={{ color: 'red', fontSize: '0.85em' }}>{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="register-button" disabled={isSubmitting} style={{ marginTop: '10px', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;