import React, { useState } from 'react';
import { FiCalendar, FiX, FiShare2, FiFile, FiInfo } from 'react-icons/fi';

const MemoryCard = ({ memory, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getYearDisplay = (year) => {
    if (year === "Unknown") return "UNKNOWN ERA";
    const currentYear = new Date().getFullYear();
    const yearDiff = currentYear - parseInt(year);
    
    if (yearDiff === 0) return `FROM ${year} · THIS YEAR`;
    if (yearDiff === 1) return `FROM ${year} · 1 YEAR AGO`;
    if (yearDiff > 1) return `FROM ${year} · ${yearDiff} YEARS AGO`;
    return `FROM ${year} · FUTURE MEMORY`;
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const uploadDate = new Date(date);
    const diffMs = now - uploadDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return uploadDate.toLocaleDateString();
  };

  const toggleExpand = (e) => {
    if (e.target.closest('.delete-btn') || e.target.closest('.share-btn')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(memory.id);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareData = {
      title: `Memory from ${memory.year}`,
      text: `Check out this memory: ${memory.mood} - ${memory.tags?.join(', ')}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        const text = `${shareData.title}\n${shareData.text}\nColors: ${memory.dominantColors?.join(', ')}`;
        await navigator.clipboard.writeText(text);
        alert('Memory details copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  };

  const copyColorCode = (color, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color);
  };

  return (
    <div 
      className={`memory-card ${isExpanded ? 'expanded' : ''} ${isHovered ? 'hovered' : ''}`}
      onClick={toggleExpand}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-glow"></div>
      
      <div className="card-actions">
        <button className="share-btn" onClick={handleShare} title="Share memory">
          <FiShare2 />
        </button>
        {onDelete && (
          <button className="delete-btn" onClick={handleDelete} title="Delete memory">
            <FiX />
          </button>
        )}
      </div>

      <div className="card-header">
        <div className="year-badge">
          <span className="year-icon"><FiCalendar /></span>
          {getYearDisplay(memory.year)}
        </div>
        <div className="mood-indicator">{memory.mood}</div>
      </div>

      <div className="color-palette-section">
        <h4>Color Palette</h4>
        <div className="color-palette">
          {memory.dominantColors?.map((color, idx) => (
            <div 
              key={idx} 
              className="color-item"
              onClick={(e) => copyColorCode(color, e)}
              title="Click to copy color code"
            >
              <span 
                className="color-bubble" 
                style={{ backgroundColor: color }}
              ></span>
              <span className="color-code">{color}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tags-section">
        <h4>Memory Tags</h4>
        <div className="tags">
          {memory.tags?.map((tag, idx) => (
            <span key={idx} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      {isExpanded && (
        <div className="card-details">
          <div className="detail-item">
            <span className="detail-label"><FiFile /> Original File:</span>
            <span className="detail-value" title={memory.fileName}>
              {memory.fileName?.length > 40 
                ? memory.fileName.substring(0, 40) + '...' 
                : memory.fileName}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label"><FiCalendar /> Added:</span>
            <span className="detail-value">
              {getTimeAgo(memory.uploadDate)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Memory ID:</span>
            <span className="detail-value monospace" title={memory.id}>
              {memory.id ? memory.id.substring(0, 8) + '...' : 'N/A'}
            </span>
          </div>
          {memory.year !== 'Unknown' && (
            <div className="detail-item">
              <span className="detail-label"><FiInfo /> Year Info:</span>
              <span className="detail-value">
                {new Date().getFullYear() - parseInt(memory.year)} years ago
              </span>
            </div>
          )}
        </div>
      )}

      <div className="card-footer">
        <div className="expand-hint">
          {isExpanded ? 'Click to collapse' : 'Click for more details'}
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;