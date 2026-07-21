import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Sphere, Cylinder, Capsule, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const Mascot = () => {
  const groupRef = useRef();
  const headRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const rightArmRef = useRef();
  const leftArmRef = useRef();

  const [blinkScale, setBlinkScale] = useState(1);
  const nextBlinkTime = useRef(0);

  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: '#D6336C', // Magenta/pink
    roughness: 0.3,
    metalness: 0.1,
  });
  
  const faceMaterial = new THREE.MeshStandardMaterial({
    color: '#FFF5F5', // Soft cream/white
    roughness: 0.4,
  });
  
  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: '#333333',
    roughness: 0.2,
    metalness: 0.5,
  });

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // 1. Blinking Logic
    if (time > nextBlinkTime.current) {
      // Start a blink (scale Y goes to 0.1)
      setBlinkScale(0.1);
      
      // Schedule next blink in 3-7 seconds
      nextBlinkTime.current = time + 3 + Math.random() * 4;
      
      // Reset blink after 150ms
      setTimeout(() => {
        setBlinkScale(1);
      }, 150);
    }
    
    // Apply blink scale
    if (leftEyeRef.current && rightEyeRef.current) {
      // Lerp back to target scale for smoothness
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, blinkScale, 0.5);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, blinkScale, 0.5);
    }

    // 2. Eye/Head Tracking
    // state.pointer is normalized -1 to 1
    const targetX = (state.pointer.x * Math.PI) / 4; // Max rotation
    const targetY = (state.pointer.y * Math.PI) / 6;

    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 0.1);
    }

    // 3. Hover / Wave Detection
    // If pointer is near center, trigger wave
    const distToCenter = Math.sqrt(state.pointer.x * state.pointer.x + state.pointer.y * state.pointer.y);
    const isHovering = distToCenter < 0.6; // Threshold for "near"

    if (rightArmRef.current) {
      if (isHovering) {
        // Wave
        const waveAngle = Math.sin(time * 15) * 0.5;
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, Math.PI / 2 + waveAngle, 0.1);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.5, 0.1);
      } else {
        // Idle relax
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0.3, 0.05);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.05);
      }
    }
    
    // Idle left arm swing
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = -0.3;
      leftArmRef.current.rotation.x = Math.sin(time * 2) * 0.1;
    }
  });

  return (
    <Float
      speed={2} // Animation speed
      rotationIntensity={0.2} // XYZ rotation intensity
      floatIntensity={0.5} // Up/down float intensity
      floatingRange={[-0.1, 0.1]} // Range of y-axis values
    >
      <group ref={groupRef} position={[0, -0.5, 0]}>
        
        {/* Body */}
        <Capsule args={[0.6, 0.8, 4, 16]} position={[0, 0.4, 0]} material={bodyMaterial} />
        
        {/* Head Group */}
        <group ref={headRef} position={[0, 1.3, 0]}>
          {/* Main Head Shape */}
          <RoundedBox args={[1.4, 1.1, 1.2]} radius={0.3} smoothness={4} material={bodyMaterial} />
          
          {/* Face Plate (Screen/Camera look) */}
          <RoundedBox args={[1.1, 0.8, 0.2]} position={[0, 0, 0.55]} radius={0.1} smoothness={4} material={faceMaterial} />
          
          {/* Eyes */}
          <Sphere ref={leftEyeRef} args={[0.12, 16, 16]} position={[-0.25, 0.05, 0.65]} material={eyeMaterial} />
          <Sphere ref={rightEyeRef} args={[0.12, 16, 16]} position={[0.25, 0.05, 0.65]} material={eyeMaterial} />
          
          {/* Cute little cheeks */}
          <Sphere args={[0.08, 16, 16]} position={[-0.4, -0.15, 0.63]}>
             <meshStandardMaterial color="#FFB6C1" roughness={0.6} />
          </Sphere>
          <Sphere args={[0.08, 16, 16]} position={[0.4, -0.15, 0.63]}>
             <meshStandardMaterial color="#FFB6C1" roughness={0.6} />
          </Sphere>
          
          {/* Little Antenna */}
          <Cylinder args={[0.02, 0.02, 0.3]} position={[0, 0.65, 0]} material={bodyMaterial} />
          <Sphere args={[0.08]} position={[0, 0.8, 0]}>
             <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
          </Sphere>
        </group>

        {/* Left Arm (idle) */}
        <group position={[-0.7, 0.7, 0]}>
          <group ref={leftArmRef}>
            <Capsule args={[0.15, 0.5, 4, 16]} position={[0, -0.3, 0]} material={bodyMaterial} />
          </group>
        </group>

        {/* Right Arm (Waving) */}
        <group position={[0.7, 0.7, 0]}>
          <group ref={rightArmRef}>
            <Capsule args={[0.15, 0.5, 4, 16]} position={[0, -0.3, 0]} material={bodyMaterial} />
          </group>
        </group>
        
      </group>
    </Float>
  );
};

const MascotScene = () => {
  return (
    <div style={{ width: '100%', height: '220px', position: 'relative' }}>
      <Canvas 
        camera={{ position: [0, 1, 4.5], fov: 45 }}
        gl={{ antialias: true, pixelRatio: Math.min(window.devicePixelRatio, 2) }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#FFB6C1" />
        
        {/* Adds natural studio-like reflections */}
        <Environment preset="city" />
        
        <Mascot />
        
        {/* Soft shadow directly underneath */}
        <ContactShadows 
          position={[0, -0.6, 0]} 
          opacity={0.4} 
          scale={5} 
          blur={2.5} 
          far={4} 
        />
      </Canvas>
    </div>
  );
};

export default MascotScene;
