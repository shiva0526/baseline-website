
import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { createBasketballTexture } from './basketballTexture';
import BasketballLighting from './BasketballLighting';

const BasketballMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const basketballTexture = createBasketballTexture();

  // Enhanced animations and interactions
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Continuous slow rotation
      if (!clicked) {
        meshRef.current.rotation.y += 0.008;
        meshRef.current.rotation.x += 0.003;
      }

      // Gentle floating animation
      const baseY = hovered ? 0.2 : 0;
      meshRef.current.position.y = baseY + Math.sin(time * 1.5) * 0.1;

      // Scale effect on hover
      const targetScale = hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      // Faster spin when clicked
      if (clicked) {
        meshRef.current.rotation.y += 0.15;
        meshRef.current.rotation.x += 0.08;
      }
    }
  });

  // Reset click effect after animation
  useEffect(() => {
    if (clicked) {
      const timer = setTimeout(() => setClicked(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [clicked]);

  return (
    <>
      <BasketballLighting />

      {/* Basketball mesh with enhanced material */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'grab';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          setClicked(true);
          document.body.style.cursor = 'grabbing';
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          document.body.style.cursor = hovered ? 'grab' : 'default';
        }}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <sphereGeometry args={[1.8, 64, 64]} />
        <meshPhongMaterial
          map={basketballTexture}
          shininess={8}
          specular={new THREE.Color(0x222222)}
          bumpMap={basketballTexture}
          bumpScale={0.02}
        />
      </mesh>

      {/* Orbit Controls with enhanced settings */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        autoRotate={false}
        autoRotateSpeed={0.5}
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI * 0.8}
        minPolarAngle={Math.PI * 0.2}
        rotateSpeed={0.8}
      />
    </>
  );
};

export default BasketballMesh;
