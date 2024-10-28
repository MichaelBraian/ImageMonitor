import React, { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import * as THREE from 'three';

interface ModelProps {
  url: string;
  format: 'STL' | 'PLY';
}

export function Model({ url, format }: ModelProps) {
  console.log('Model component props:', { url, format });
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const loader = format === 'STL' ? new STLLoader() : new PLYLoader();
    loader.load(url, (loadedGeometry) => {
      loadedGeometry.computeVertexNormals();
      setGeometry(loadedGeometry);
    });
  }, [url, format]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#B8B8B8" />
    </mesh>
  );
}
