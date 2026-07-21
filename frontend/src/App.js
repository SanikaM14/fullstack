import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import Mascot from './components/Mascot/Mascot';
import { MascotProvider, useMascot } from './components/Mascot/MascotProvider';
import './styles/Header.css';
import './styles/Footer.css';
import './styles/Login.css';
import './styles/Register.css';
import './styles/MemoryCard.css';
import './styles/UploadBox.css';

import { BiSearch, BiCamera } from 'react-icons/bi';
import { FiStar } from 'react-icons/fi';

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

function AppContent() {
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
  const [isScrolled, setIsScrolled] = useState(false);

  const { triggerState, currentState } = useMascot();

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Explicitly fetch CSRF token on startup and manually set header since Axios cross-origin auto-xsrf can be flaky
    axios.get('http://localhost:8080/api/auth/csrf').then(res => {
      if (res.data.token) {
        axios.defaults.headers.common['X-XSRF-TOKEN'] = res.data.token;
      }
    }).catch(err => console.log('CSRF fetch error:', err));
  }, []);
  
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/user-info');
      setUser(response.data);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.log('User not authenticated:', error);
      setLoading(false);
      return null;
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

  // Mascot Milestone and Empty State logic
  const celebratedMilestones = useRef(new Set());
  
  useEffect(() => {
    if (!user || loading) return;
    
    if (memories.length === 0) {
      triggerState('empty');
    } else {
      if (currentState === 'empty') triggerState('idle');
      
      const count = memories.length;
      if ([10, 20, 50, 100].includes(count) && !celebratedMilestones.current.has(count)) {
        celebratedMilestones.current.add(count);
        triggerState('celebrating', { text: `🎉 ${count} memories collected!` });
      }
    }
  }, [memories, user, loading, triggerState, currentState]);
  
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

  useEffect(() => {
    if (loading) {
      triggerState('walking');
    }
  }, [loading, triggerState]);

  if (loading) {
    return (
      <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Mascot width="150px" height="150px" />
        <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#D6336C' }}>Loading your memories...</p>
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
              <div style={{ height: '430px', marginTop: '20px', overflow: 'visible' }}>
                <Mascot height="100%" />
              </div>
              <h1><FiStar /> Memory Flashback Portal</h1>
              <p>Upload your photos and travel back in time through colors and memories</p>
              <button 
                className="login-button"
                onClick={() => setShowLogin(true)}
              >
                Login
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

            <div style={{ display: 'flex', alignItems: 'flex-start', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
              <div style={{ flex: 3 }}>
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
              </div>

              {/* Inside Dashboard Mascot */}
              <div className="dashboard-mascot-sidebar" style={{ 
                flex: 1, 
                position: 'sticky', 
                top: '100px', 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'flex-start',
                paddingTop: '20px'
              }}>
                <div style={{ width: '100%', maxWidth: '350px', margin: '0 auto' }}>
                  <Mascot height="400px" />
                </div>
              </div>
            </div>
            
          </>
        )}
      </main>
      <Footer />
      {showLogin && <Login 
        onClose={() => setShowLogin(false)} 
        onLoginSuccess={async () => {
          setShowLogin(false);
          const userData = await checkAuthStatus();
          if (userData) {
            triggerState('greeting', { name: userData.name || userData.email.split('@')[0] });
          }
        }}
      />}
      {showRegister && <Register onClose={() => setShowRegister(false)} />}
    </div>
  );
}

function App() {
  return (
    <MascotProvider>
      <AppContent />
    </MascotProvider>
  );
}

export default App;