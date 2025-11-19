
import * as THREE from 'three';

const BasketballLighting = () => {
  return (
    <>
      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.3} color="#ffffff" />
      
      {/* Main directional light with shadows */}
      <directionalLight
        position={[8, 8, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* BaseLine brand yellow rim light */}
      <pointLight
        position={[-4, 3, 6]}
        color="#F7D046"
        intensity={0.8}
        distance={10}
      />

      {/* Additional orange accent light */}
      <pointLight
        position={[6, -2, 4]}
        color="#FF8C00"
        intensity={0.4}
        distance={8}
      />

      {/* Enhanced shadow plane */}
      <mesh
        position={[0, -3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[12, 12]} />
        <shadowMaterial opacity={0.3} color="#000000" />
      </mesh>
    </>
  );
};

export default BasketballLighting;
