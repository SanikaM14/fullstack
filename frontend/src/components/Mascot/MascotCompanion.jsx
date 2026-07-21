import React from 'react';
import './MascotCompanion.css';

const MascotCompanion = ({ memory }) => {
  if (!memory) return null;

  let fact = "A beautiful memory!";
  if (memory.year && memory.year !== "Unknown") {
    const diff = new Date().getFullYear() - parseInt(memory.year);
    if (diff > 0) fact = `${diff} years ago!`;
    else fact = "This year!";
  } else if (memory.dominantColors && memory.dominantColors.length > 0) {
    fact = `Color: ${memory.dominantColors[0]}`;
  }

  return (
    <div className="mascot-companion-wrapper">
      <div className="companion-speech-bubble">
        {fact}
        <div className="companion-tail"></div>
      </div>
      <div className="companion-icon">
        <svg viewBox="0 0 100 100" width="70" height="70">
          {/* Antenna */}
          <rect x="48" y="5" width="4" height="15" fill="#D6336C" />
          <circle cx="50" cy="5" r="5" fill="#FFD700" />
          
          {/* Body */}
          <rect x="25" y="50" width="50" height="45" rx="20" fill="#D6336C" />
          
          {/* Head */}
          <rect x="15" y="20" width="70" height="40" rx="12" fill="#D6336C" />
          
          {/* Face Plate */}
          <rect x="22" y="28" width="56" height="24" rx="6" fill="#FFF5F5" />
          
          {/* Eyes */}
          <circle cx="38" cy="40" r="4" fill="#333" />
          <circle cx="62" cy="40" r="4" fill="#333" />
          
          {/* Cheeks */}
          <circle cx="28" cy="44" r="3.5" fill="#FFB6C1" />
          <circle cx="72" cy="44" r="3.5" fill="#FFB6C1" />
          
          {/* Little Arms */}
          <rect x="10" y="55" width="12" height="25" rx="6" fill="#D6336C" transform="rotate(15 16 67)" />
          <rect x="78" y="55" width="12" height="25" rx="6" fill="#D6336C" transform="rotate(-15 84 67)" />
        </svg>
      </div>
    </div>
  );
};

export default MascotCompanion;
