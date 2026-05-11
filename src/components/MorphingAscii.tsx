import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AsciiRenderer, Float, useTexture, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

// ----------------------------------------------------
// SCENE COMPONENTS
// ----------------------------------------------------

function FlowCoin() {
  const texture = useTexture('/assets/flow-logo.svg');

  return (
    <group scale={0.85}>
      {/* Front Face */}
      <mesh position={[0, 0, 0.11]}>
        <circleGeometry args={[2, 64]} />
        <meshStandardMaterial map={texture} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Back Face */}
      <mesh position={[0, 0, -0.11]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[2, 64]} />
        <meshStandardMaterial map={texture} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Edge */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2, 2, 0.22, 64, 1, true]} />
        <meshStandardMaterial color="#00FF94" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}

function CadenceLogo3D() {
  const { scene } = useGLTF('/assets/logo.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.roughness = 0.4;
        child.material.metalness = 0.6;
      }
    });
  }, [scene]);

  return (
    <group position={[0, 0, 0]}>
      <primitive object={scene} scale={1.2} />
    </group>
  );
}

function CryptoKitty3D() {
  const { scene } = useGLTF('/assets/cryptokitty.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.roughness = 0.5;
        child.material.metalness = 0.2;
      }
    });
  }, [scene]);

  return (
    <group position={[0, -0.4, 0]}>
      <primitive object={scene} scale={2.2} />
    </group>
  );
}

useGLTF.preload('/assets/logo.glb');
useGLTF.preload('/assets/cryptokitty.glb');

function AsciiScene({ activeCycleIdx, fgColor }: { activeCycleIdx: number; fgColor: string }) {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={3} />
      <pointLight position={[-10, -10, -10]} intensity={1} />

      <Suspense fallback={null}>
        <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <group visible={activeCycleIdx === 0}>
            <CadenceLogo3D />
          </group>
          <group visible={activeCycleIdx === 1}>
            <FlowCoin />
          </group>
          <group visible={activeCycleIdx === 2}>
            <CryptoKitty3D />
          </group>
        </Float>
      </Suspense>

      {/* Ascii shader layer */}
      <AsciiRenderer
        fgColor={fgColor}
        bgColor="transparent"
        characters=" .:'-+*=%@#"
        resolution={0.25}
        color={false}
        invert={false}
      />
    </>
  );
}

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------

export function MorphingAscii() {
  const [activeCycleIdx, setActiveCycleIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();

  const onCreated = useCallback(() => {
    // Wait two frames so AsciiRenderer has fully taken over
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setReady(true);
      });
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCycleIdx(prev => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <div className="w-full h-[280px] lg:h-[700px] lg:w-[700px]" />;
  }

  return (
    <div
      className={[
        'relative flex flex-col items-center justify-center p-0 m-0 group',
        'w-full h-[280px]',
        'lg:h-[700px] lg:w-[700px] lg:-right-5',
        'overflow-hidden lg:overflow-visible',
        isMobile ? '' : 'cursor-grab active:cursor-grabbing',
      ].join(' ')}
    >
      {/* 3D ASCII Canvas */}
      <div
        className="absolute inset-0 overflow-hidden lg:overflow-visible ascii-wrapper"
        style={{
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.3s ease-in',
        }}
      >
        {resolvedTheme === 'light' && (
          <style>{`
            .ascii-wrapper > div {
              font-weight: 900 !important;
            }
          `}</style>
        )}
        <Canvas
          camera={{ position: [0, 0, 6.5], fov: 50 }}
          style={{ touchAction: isMobile ? 'pan-y' : 'none' }}
          onCreated={onCreated}
        >
          <color attach="background" args={['transparent']} />
          <AsciiScene
            activeCycleIdx={activeCycleIdx}
            fgColor={resolvedTheme === 'light' ? '#000000' : '#00FF94'}
          />
          <OrbitControls
            autoRotate
            autoRotateSpeed={6}
            enableZoom={false}
            enablePan={false}
            enableRotate={!isMobile}
          />
        </Canvas>
      </div>

      {/* Mobile: transparent overlay above ascii-wrapper to intercept touches
          and pass vertical scroll to the browser natively via pan-y */}
      {isMobile && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            touchAction: 'pan-y',
          }}
        />
      )}
    </div>
  );
}
