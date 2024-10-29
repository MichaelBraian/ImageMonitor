import React, { useEffect, useState } from 'react';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import * as THREE from 'three';

interface ModelProps {
  url: string;
  format: 'STL' | 'PLY';
}

export function Model({ url, format }: ModelProps) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loader = format === 'STL' ? new STLLoader() : new PLYLoader();
    
    console.log('Loading 3D model:', { url, format });
    
    loader.load(
      url,
      (loadedGeometry) => {
        console.log('Model loaded successfully');
        loadedGeometry.computeVertexNormals();
        setGeometry(loadedGeometry);
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100, '%');
      },
      (error) => {
        console.error('Error loading model:', error);
        setError(error.message);
      }
    );
  }, [url, format]);

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Error loading model: {error}
      </div>
    );
  }

  if (!geometry) {
    return (
      <div className="text-gray-500 text-center">
        Loading model...
      </div>
    );
  }

  const material = format === 'PLY' 
    ? new THREE.MeshStandardMaterial({ 
        vertexColors: true,
        side: THREE.DoubleSide
      })
    : new THREE.MeshStandardMaterial({ 
        color: '#B8B8B8',
        side: THREE.DoubleSide
      });

  return <mesh geometry={geometry} material={material} />;
}
