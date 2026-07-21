import React from 'react';
import '../styles/Header.css';

const Header = ({ user, onLoginClick, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">Memory Flashback Portal</h1>
        <div className="header-nav">
          {user ? (
            <>
              <div className="user-info">
                <img src={user.profilePictureUrl} alt={user.name} className="user-avatar" />
                <span className="user-name">{user.name}</span>
              </div>
              <button className="logout-button" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <button className="login-button" onClick={onLoginClick}>Login</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;