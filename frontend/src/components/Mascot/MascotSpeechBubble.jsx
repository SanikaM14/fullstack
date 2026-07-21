import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MascotSpeechBubble = ({ text }) => {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            position: 'relative',
            background: 'white',
            padding: '10px 15px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '2px solid #FFE0E9', // Match theme
            color: '#333',
            fontSize: '14px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {text}
          {/* Bubble Tail pointing down */}
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            marginLeft: '-8px',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid white',
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.05))',
            zIndex: -1
          }}></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MascotSpeechBubble;
