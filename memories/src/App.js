import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import UploadBox from './components/UploadBox';
import MemoryCard from './components/MemoryCard';
import logoImage from '../src/logo.svg';
import defaultAvatar from '../src/default-avatar.png.svg';
import '../src/App.css';
import './styles/Header.css';
import './styles/Footer.css';
import './styles/Login.css';
import './styles/Register.css';
import './styles/MemoryCard.css';
import './styles/UploadBox.css';

import { BiSearch, BiCamera } from 'react-icons/bi';
import { FiStar } from 'react-icons/fi';

function App() {
  const [memories, setMemories] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterMood, setFilterMood] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null }); 

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);
  
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user-info');
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.log('User not authenticated:', error);
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  
  const loadMemories = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/memories');
      setMemories(response.data);
    } catch (error) {
      console.error('Failed to load memories:', error);
    }
  }, []);
  
  useEffect(() => {
    if (user) {
      loadMemories();
    }
  }, [user, loadMemories]);
  
  const handleMemoryAdded = useCallback((newMemory) => {
    setMemories(prev => [newMemory, ...prev]);
  }, []);

  const handleMemoryDelete = useCallback(async (memoryId) => {
    if (window.confirm('Are you sure you want to delete this memory? This can\'t be undone.')) {
      try {
        await axios.delete(`http://localhost:8080/api/memories/${memoryId}`);
        setMemories(prev => prev.filter(m => m.id !== memoryId));
      } catch (error) {
        console.error('Failed to delete memory:', error);
        alert('Failed to delete memory. Please try again.');
      }
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await axios.get('http://localhost:8080/logout');
      setUser(null);
      setMemories([]);
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
      setMemories([]);
    }
  }, []);

  const uniqueMoods = useMemo(() => {
    if (!memories || !Array.isArray(memories)) return [];
    const moods = [...new Set(memories.map(m => m.mood))];
    return moods.filter(Boolean);
  }, [memories]);

  const uniqueYears = useMemo(() => {
    if (!memories || !Array.isArray(memories)) return [];
    const years = [...new Set(memories.map(m => m.year).filter(y => y !== 'Unknown'))];
    return years.sort((a, b) => parseInt(b) - parseInt(a));
  }, [memories]);

  const filteredMemories = useMemo(() => {
    if (!memories || !Array.isArray(memories)) return [];
    let filtered = [...memories];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(memory => 
        memory.fileName?.toLowerCase().includes(query) ||
        memory.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        memory.mood?.toLowerCase().includes(query) ||
        memory.year?.includes(query)
      );
    }

    if (filterMood !== 'all') {
      filtered = filtered.filter(memory => memory.mood === filterMood);
    }

    if (filterYear !== 'all') {
      filtered = filtered.filter(memory => memory.year === filterYear);
    }
    
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(memory => {
        const memoryDate = new Date(memory.uploadDate);
        const start = dateRange.start ? new Date(dateRange.start) : null;
        const end = dateRange.end ? new Date(dateRange.end) : null;

        if (start && memoryDate < start) {
          return false;
        }
        if (end && memoryDate > end) {
          return false;
        }
        return true;
      });
    }

    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => {
          const yearA = parseInt(a.year) || 0;
          const yearB = parseInt(b.year) || 0;
          return yearA - yearB;
        });
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const yearA = parseInt(a.year) || 0;
          const yearB = parseInt(b.year) || 0;
          return yearB - yearA;
        });
        break;
      case 'recent':
        filtered.sort((a, b) => {
          const dateA = new Date(a.uploadDate || 0);
          const dateB = new Date(b.uploadDate || 0);
          return dateB - dateA;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [memories, searchQuery, sortBy, filterMood, filterYear, dateRange]);

  const stats = useMemo(() => {
    const totalYears = uniqueYears.length;
    const oldestYear = uniqueYears.length > 0 ? Math.min(...uniqueYears.map(y => parseInt(y))) : null;
    const newestYear = uniqueYears.length > 0 ? Math.max(...uniqueYears.map(y => parseInt(y))) : null;
    const span = oldestYear && newestYear ? newestYear - oldestYear : 0;
    
    return { totalYears, oldestYear, newestYear, span };
  }, [uniqueYears]);

  const getRandomEmptyMessage = useCallback(() => {
    const messages = [
      "Your photo album is waiting for its first memory...",
      "No memories yet, but that's about to change!",
      "Ready to capture some moments? Drop a photo here!",
      "Every journey starts with a single photo",
      "Your timeline is empty, but not for long!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setFilterMood('all');
    setFilterYear('all');
    setDateRange({ start: null, end: null });
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your memories...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        user={user} 
        logoImage={logoImage}
        defaultAvatar={defaultAvatar}
        onLoginClick={() => setShowLogin(true)} 
        onLogout={handleLogout} 
        stats={stats}
      />
      <main className="main-content">
        {!user ? (
          <div className="auth-container">
            <div className="auth-card">
              <img src={logoImage} alt="Memory Flashback Portal" className="auth-logo" />
              <h1><FiStar /> Memory Flashback Portal</h1>
              <p>Upload your photos and travel back in time through colors and memories</p>
              <button 
                className="login-button"
                onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.14l2.67-2z"/>
                  <path fill="#EA4335" d="M8.98 4.96c1.18 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-2.46z"/>
                </svg>
                Login with Google
              </button>
              <button 
                className="register-button"
                onClick={() => setShowRegister(true)}
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <>
            <UploadBox onMemoryAdded={handleMemoryAdded} />
            <div className="memories-controls">
              <div className="controls-left">
                <div className="search-box">
                  <span className="search-icon"><BiSearch /></span>
                  <input
                    type="text"
                    placeholder="Search memories, tags, moods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  {searchQuery && (
                    <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
                  )}
                </div>
              </div>

              <div className="controls-right">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="recent">Recently Added</option>
                </select>

                {uniqueMoods.length > 0 && (
                  <select 
                    value={filterMood} 
                    onChange={(e) => setFilterMood(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Moods</option>
                    {uniqueMoods.map(mood => (
                      <option key={mood} value={mood}>{mood}</option>
                    ))}
                  </select>
                )}

                {uniqueYears.length > 0 && (
                  <select 
                    value={filterYear} 
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Years</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                )}

              </div>
            </div>

            {memories.length > 0 && filteredMemories.length === 0 && (
              <div className="no-results">
                <div className="no-results-icon"><BiSearch /></div>
                <h3>No memories found</h3>
                <p>Try adjusting your search or filters</p>
                <button className="reset-filters-btn" onClick={resetFilters}>Reset Filters</button>
              </div>
            )}
            
            <div className="timeline-container">
              <div className="timeline">
                {memories.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon"><BiCamera /></div>
                    <h3>No Memories Yet</h3>
                    <p>{getRandomEmptyMessage()}</p>
                  </div>
                ) : (
                  filteredMemories.map((memory, index) => (
                    <MemoryCard 
                      key={memory.id || index} 
                      memory={memory}
                      onDelete={handleMemoryDelete}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showRegister && <Register onClose={() => setShowRegister(false)} />}
    </div>
  );
}

export default App;