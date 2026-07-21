import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Login.css';

const Login = ({ onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const csrfRes = await axios.get('http://localhost:8080/api/auth/csrf', { withCredentials: true });
      const csrfToken = csrfRes.data.token;
      
      await axios.post('http://localhost:8080/api/auth/login', {
        email: email.trim().toLowerCase(),
        password
      }, { 
        withCredentials: true,
        headers: { 'X-XSRF-TOKEN': csrfToken }
      });
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Login to Your Account</h2>
          <button className="close-button" onClick={onClose} disabled={isSubmitting}>×</button>
        </div>
        <div className="modal-content">

          {error && <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label htmlFor="login-email">Email</label>
              <input 
                id="login-email"
                type="email" 
                placeholder="Email" 
                autoComplete="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                maxLength="100"
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative' }}>
              <label htmlFor="login-password">Password</label>
              <div style={{ display: 'flex', width: '100%', position: 'relative' }}>
                <input 
                  id="login-password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  autoComplete="current-password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  maxLength="100"
                  style={{ width: '100%', padding: '10px', paddingRight: '40px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            
            <button type="submit" className="login-button" disabled={isSubmitting} style={{ marginTop: '10px', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;