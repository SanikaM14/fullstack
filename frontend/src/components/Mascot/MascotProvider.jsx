import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { mascotStates } from './mascotStates';
import { mascotMessages } from './mascotMessages';

const MascotContext = createContext();

export const useMascot = () => useContext(MascotContext);

export const MascotProvider = ({ children }) => {
  const [currentState, setCurrentState] = useState('idle');
  const [speechText, setSpeechText] = useState(null);
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef(null);
  const stateTimeoutRef = useRef(null);

  const triggerState = useCallback((stateName, payload = {}) => {
    const requestedState = mascotStates[stateName];
    if (!requestedState) return;

    const currentPriority = mascotStates[currentState]?.priority || 0;
    
    // Only interrupt if new priority is strictly higher, or if returning to idle
    if (requestedState.priority >= currentPriority || stateName === 'idle' || stateName === 'walking') {
      setCurrentState(stateName);
      
      // Determine speech text
      let text = payload.text || requestedState.defaultSpeech || null;
      if (stateName === 'greeting' && payload.name) {
        text = `Welcome back, ${payload.name}! Ready for a flashback?`;
      }
      
      setSpeechText(text);

      // Handle auto-dismiss
      if (stateTimeoutRef.current) clearTimeout(stateTimeoutRef.current);
      
      if (!requestedState.persistent && requestedState.duration) {
        stateTimeoutRef.current = setTimeout(() => {
          setCurrentState('idle');
          setSpeechText(null);
        }, requestedState.duration);
      }
    }
  }, [currentState]);

  const setSpeechBubble = useCallback((text, duration = 6000) => {
    setSpeechText(text);
    if (stateTimeoutRef.current) clearTimeout(stateTimeoutRef.current);
    if (duration > 0) {
      stateTimeoutRef.current = setTimeout(() => {
        setSpeechText(null);
      }, duration);
    }
  }, []);

  const handleHover = useCallback(() => {
    if (currentState === 'idle') {
      triggerState('hovered');
      const randomMsg = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];
      setSpeechBubble(randomMsg, 6000);
    }
  }, [currentState, triggerState, setSpeechBubble]);

  const handleLeave = useCallback(() => {
    if (currentState === 'hovered') {
      setCurrentState('idle');
      setSpeechText(null);
    }
  }, [currentState]);

  const addClick = useCallback(() => {
    setClickCount(prev => {
      const next = prev + 1;
      
      if (next === 5) {
        setSpeechBubble("Woohoo! Spin time! 🌪️", 2000);
      } else if (next === 10) {
        setSpeechBubble("Dance party! 💃🕺", 3000);
      } else if (next === 15) {
        setSpeechBubble("Okay, I'm getting dizzy...", 2000);
      }

      return next;
    });

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 4000); // reset if no clicks for 4s
  }, [setSpeechBubble]);

  return (
    <MascotContext.Provider value={{
      currentState,
      speechText,
      triggerState,
      setSpeechBubble,
      addClick,
      clickCount,
      handleHover,
      handleLeave
    }}>
      {children}
    </MascotContext.Provider>
  );
};
