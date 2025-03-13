import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import { OrbitControls } from "@react-three/drei";

function D10() {
  const meshRef = useRef();

  // Drop-in animation using React Spring
  const { position } = useSpring({
    position: [0, 0, 0], // Final position
    from: [0, 5, 0], // Start high above
    config: { mass: 1, tension: 200, friction: 10 },
  });

  // Rotate the die continuously
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <a.mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="blue" wireframe />
    </a.mesh>
  );
}

export default function D10Dice() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <D10 />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
