'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Helix({
  count  = 80,
  radius = 2,
  height = 10,
  twist  = 2,
  speed  = 0.5,
  color1 = '#2563eb',   // Electric Blue strand
  color2 = '#0a0f1e',   // Near-black strand
}) {
  const points = useMemo(() => {
    const p1 = [], p2 = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 * twist;
      const y     = (i / count - 0.5) * height;
      p1.push(new THREE.Vector3( Math.cos(angle)           * radius, y, Math.sin(angle)           * radius));
      p2.push(new THREE.Vector3( Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
    }
    return { p1, p2 };
  }, [count, radius, height, twist]);

  const groupRef = useRef();
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.004 * speed;
  });

  return (
    <group ref={groupRef}>
      {points.p1.map((pos, i) => (
        <group key={`p1-${i}`}>
          {/* Blue strand dot */}
          <mesh position={pos}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color={color1} emissive={color1} emissiveIntensity={0.6} />
          </mesh>
          {/* Rung connector every 4th node */}
          {i % 4 === 0 && (
            <mesh
              position={[
                (pos.x + points.p2[i].x) / 2,
                (pos.y + points.p2[i].y) / 2,
                (pos.z + points.p2[i].z) / 2,
              ]}
            >
              <boxGeometry args={[radius * 2, 0.014, 0.014]} />
              <meshStandardMaterial color="#2563eb" opacity={0.1} transparent />
            </mesh>
          )}
        </group>
      ))}
      {points.p2.map((pos, i) => (
        <mesh key={`p2-${i}`} position={pos}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export default function DNA() {
  return (
    <div
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{ background: '#ffffff' }}
    >
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        {/* Lighting for white bg — warm white + cool blue */}
        <ambientLight intensity={0.7} color="#f0f4ff" />
        <pointLight position={[10,  10,  10]} intensity={1.0} color="#dde9ff" />
        <pointLight position={[-10,-10, -10]} intensity={0.4} color="#2563eb" />
        <spotLight
          position={[0, 15, 5]}
          angle={0.3}
          penumbra={1}
          intensity={0.4}
          color="#bfcfff"
        />

        <Float speed={1.1} rotationIntensity={0.28} floatIntensity={0.35}>
          <Helix />
        </Float>

        {/* No stars on white — would look odd. Use very faint dots */}
        <Stars radius={120} depth={60} count={800} factor={2} saturation={0} fade speed={0.3} />
      </Canvas>

      {/* Subtle blue tints at edges */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 55% 38% at 3% 3%, rgba(37,99,235,0.06) 0%, transparent 60%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 45% 32% at 97% 97%, rgba(37,99,235,0.05) 0%, transparent 60%)',
      }} />
      {/* Soft vignette to blend with white page */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 40%, rgba(255,255,255,0.85) 100%)',
      }} />
      {/* Bottom fade to white */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.95) 100%)',
      }} />
    </div>
  );
}
