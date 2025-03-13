import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useSpring, a } from "@react-spring/three";
import { IcosahedronGeometry } from "three";

function D10({ number }) {
  const meshRef = useRef();

  // Rotate the dice when the number changes (simulating a roll)
  const { rotation } = useSpring({
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    config: { mass: 1, tension: 180, friction: 12 },
  });

  return (
    <a.mesh ref={meshRef} rotation={rotation}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="blue" wireframe />
    </a.mesh>
  );
}

export default function D10Dice({ guessCount }) {
  return (
    <Canvas camera={{ position: [0, 0, 3] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 3, 3]} intensity={1} />
      <D10 number={guessCount} />
    </Canvas>
  );
}
