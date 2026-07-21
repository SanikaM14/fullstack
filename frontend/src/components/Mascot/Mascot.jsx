import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Sphere, Cylinder, Capsule, RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion as motion3d } from 'framer-motion-3d';
import { motion } from 'framer-motion';
import { useMascot } from './MascotProvider';
import MascotSpeechBubble from './MascotSpeechBubble';
import { seasonalAccessories } from './seasonalAccessories';
import confetti from 'canvas-confetti';

const Mascot3D = ({ isMini }) => {
  const { currentState, clickCount, handleHover, handleLeave, addClick, speechText } = useMascot();
  
  const groupRef = useRef();
  const headRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const rightArmRef = useRef();
  const leftArmRef = useRef();
  const bodyRef = useRef();

  const [blinkScale, setBlinkScale] = useState(1);
  const nextBlinkTime = useRef(0);
  const idleTimer = useRef(0);

  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: '#D6336C', roughness: 0.3, metalness: 0.1 
  });
  const faceMaterial = new THREE.MeshStandardMaterial({
    color: '#FFF5F5', roughness: 0.4 
  });
  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: '#333333', roughness: 0.2, metalness: 0.5 
  });

  // State-driven variants for framer-motion-3d
  const variants = {
    idle: { y: 0, scale: 1, rotateY: 0, rotateX: 0 },
    empty: { y: -0.4, scale: 1, rotateX: 0.2 }, // Sit down slightly, tilt head down
    uploadSuccess: { y: [0, 0.8, 0], scale: [1, 1.1, 1], transition: { duration: 0.6 } },
    greeting: { y: [0, 0.3, 0], rotateY: [0, 0.2, -0.2, 0], transition: { duration: 1 } },
    error: { y: 0, rotateX: 0.1 },
    celebrating: { y: [0, 1, 0, 1, 0], rotateY: [0, Math.PI, Math.PI * 2, Math.PI * 3, Math.PI * 4], transition: { duration: 2 } },
    walking: { y: [0, 0.1, 0, 0.1, 0], rotateZ: [0, 0.05, 0, -0.05, 0], transition: { repeat: Infinity, duration: 1 } },
  };

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // --- Blinking Logic ---
    if (time > nextBlinkTime.current) {
      setBlinkScale(0.1);
      nextBlinkTime.current = time + 3 + Math.random() * 4;
      setTimeout(() => setBlinkScale(1), 150);
    }
    
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, blinkScale, 0.5);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, blinkScale, 0.5);
    }

    // --- Cursor Tracking & 10s Idle ---
    const pointer = state.pointer;
    const distToCenter = Math.sqrt(pointer.x * pointer.x + pointer.y * pointer.y);
    const isHovering = distToCenter < 0.6;
    
    // Reset idle timer if moving
    if (Math.abs(state.pointer.x) > 0.01 || Math.abs(state.pointer.y) > 0.01) {
      idleTimer.current = time;
    }
    const isIdle = time - idleTimer.current > 10;

    // --- Eye/Head Tracking ---
    if (headRef.current && currentState !== 'empty' && currentState !== 'celebrating') {
      headRef.current.rotation.order = 'YXZ'; // Fix diagonal skew
      const maxYaw = 0.35; // ~20 degrees
      const maxPitch = 0.17; // ~10 degrees
      
      const targetX = isIdle ? Math.sin(time) * 0.3 : THREE.MathUtils.clamp((pointer.x * Math.PI) / 4, -maxYaw, maxYaw);
      const targetY = isIdle ? Math.cos(time * 0.5) * 0.2 : THREE.MathUtils.clamp((pointer.y * Math.PI) / 6, -maxPitch, maxPitch);
      
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 0.1);
    }

    // --- Arm Logic ---
    if (rightArmRef.current && leftArmRef.current) {
      if (clickCount >= 5) {
        // Spin/dance arms
        rightArmRef.current.rotation.z = Math.PI / 2 + Math.sin(time * 10);
        leftArmRef.current.rotation.z = -Math.PI / 2 - Math.sin(time * 10);
      } else if (currentState === 'error') {
        // Scratch head
        rightArmRef.current.rotation.z = Math.PI * 0.8;
        rightArmRef.current.rotation.x = 0.5;
      } else if (isHovering || currentState === 'greeting') {
        // Wave
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, Math.PI / 2 + Math.sin(time * 15) * 0.5, 0.1);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.5, 0.1);
      } else {
        // Idle
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0.3, 0.05);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.05);
        leftArmRef.current.rotation.z = -0.3;
        leftArmRef.current.rotation.x = Math.sin(time * 2) * 0.1;
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3} floatingRange={[-0.05, 0.05]}>
      <motion3d.group 
        ref={groupRef} 
        position={[0, isMini ? -1.2 : -1.3, 0]}
        scale={isMini ? 0.6 : 0.75}
        variants={variants}
        animate={currentState}
        initial="idle"
        onPointerOver={handleHover}
        onPointerOut={handleLeave}
        onClick={addClick}
      >
        {/* Body */}
        <Capsule ref={bodyRef} args={[0.6, 0.7, 4, 16]} position={[0, 0.35, 0]} material={bodyMaterial} />
        
        {/* Head Group */}
        <group ref={headRef} position={[0, 1.45, 0]}>
          <RoundedBox args={[1.4, 1.1, 1.2]} radius={0.3} smoothness={4} material={bodyMaterial} />
          <RoundedBox args={[1.1, 0.8, 0.2]} position={[0, 0, 0.55]} radius={0.1} smoothness={4} material={faceMaterial} />
          
          <Sphere ref={leftEyeRef} args={[0.12, 16, 16]} position={[-0.25, 0.05, 0.65]} material={eyeMaterial} />
          <Sphere ref={rightEyeRef} args={[0.12, 16, 16]} position={[0.25, 0.05, 0.65]} material={eyeMaterial} />
          
          <Sphere args={[0.08, 16, 16]} position={[-0.4, -0.15, 0.63]}>
             <meshStandardMaterial color="#FFB6C1" roughness={0.6} />
          </Sphere>
          <Sphere args={[0.08, 16, 16]} position={[0.4, -0.15, 0.63]}>
             <meshStandardMaterial color="#FFB6C1" roughness={0.6} />
          </Sphere>
          
          <Cylinder args={[0.02, 0.02, 0.3]} position={[0, 0.65, 0]} material={bodyMaterial} />
          <Sphere args={[0.08]} position={[0, 0.8, 0]}>
             <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
          </Sphere>
          
          <Html position={[0, 1.4, 0]} center zIndexRange={[100, 0]}>
            <MascotSpeechBubble text={speechText} />
          </Html>
        </group>

        {/* Arms */}
        <group position={[-0.7, 0.7, 0]}>
          <group ref={leftArmRef}>
            <Capsule args={[0.15, 0.5, 4, 16]} position={[0, -0.3, 0]} material={bodyMaterial} />
          </group>
        </group>
        <group position={[0.7, 0.7, 0]}>
          <group ref={rightArmRef}>
            <Capsule args={[0.15, 0.5, 4, 16]} position={[0, -0.3, 0]} material={bodyMaterial} />
          </group>
        </group>
        
      </motion3d.group>
    </Float>
  );
};

// Main wrapper that handles HTML overlay and context
const Mascot = ({ width = '100%', height = '300px', isScrollCompanion = false, isMini = false }) => {
  const { currentState, speechText } = useMascot();
  
  // Seasonal Overlay
  const currentMonth = new Date().getMonth();
  const accessory = seasonalAccessories[currentMonth];



  // Confetti on celebration
  useEffect(() => {
    if (currentState === 'celebrating') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [currentState]);

  const wrapperStyles = isScrollCompanion ? {
    position: 'fixed',
    left: 'auto',
    top: 'auto',
    right: 40,
    bottom: 40,
    width: '280px',
    height: '280px',
    zIndex: 1000,
    pointerEvents: 'auto'
  } : {
    position: 'relative',
    left: 'auto',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    width,
    height,
    zIndex: 1,
    pointerEvents: 'auto'
  };

  const containerRef = useRef();

  return (
    <div ref={containerRef} style={{ ...wrapperStyles, boxSizing: 'border-box' }}>
      {accessory && (
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', 
          zIndex: 10, fontSize: '40px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
        }}>
          {accessory}
        </div>
      )}

      <Canvas 
        eventSource={containerRef}
        camera={{ position: [0, 1.2, 5], fov: 45 }} 
        gl={{ antialias: true, pixelRatio: Math.min(window.devicePixelRatio, 2) }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#FFB6C1" />
        
        {/* Adds natural studio-like reflections */}
        <Environment preset="city" />
        
        <Mascot3D isMini={isMini} />
        
        <ContactShadows position={[0, -0.6, 0]} opacity={0.4} scale={5} blur={2.5} far={4} />
      </Canvas>
    </div>
  );
};

export default Mascot;
