import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import * as THREE from 'three';
import { use3DModel } from '../hooks/use3DModel';

interface ThreeDViewerProps {
  fileUrl: string;
  fileFormat: 'STL' | 'PLY';
}

function Model({ url, format }: { url: string; format: 'STL' | 'PLY' }) {
  const { scene, camera } = useThree();
  const { geometry, material } = use3DModel(url, format);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (geometry && material) {
      // Remove existing mesh if any
      scene.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          scene.remove(child);
        }
      });

      const mesh = new THREE.Mesh(geometry, material);
      
      // Center and fit the model to view
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      mesh.position.sub(center);
      scene.add(mesh);

      // Adjust camera
      camera.position.set(maxDim * 2, maxDim * 2, maxDim * 2);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      camera.updateProjectionMatrix();

      // Update OrbitControls
      const controls = scene.userData.controls;
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
    }

    // Cleanup function
    return () => {
      scene.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          scene.remove(child);
        }
      });
    };
  }, [geometry, material, scene, camera]);

  if (!geometry || !material) return null;

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

export function ThreeDViewer({ fileUrl, fileFormat }: ThreeDViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <OrbitControls makeDefault enableRotate={true} enableZoom={true} enablePan={true} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <Model url={fileUrl} format={fileFormat} />
      </Canvas>
    </div>
  );
}
