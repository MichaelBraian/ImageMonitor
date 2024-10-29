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
    
    console.log('Starting to load 3D model:', { url, format });
    
    // Add error handling for invalid URLs
    if (!url) {
      console.error('Invalid URL provided');
      setError('Invalid URL provided');
      return;
    }

    try {
      loader.load(
        url,
        (loadedGeometry) => {
          console.log('Model loaded successfully');
          try {
            loadedGeometry.computeVertexNormals();
            setGeometry(loadedGeometry);
          } catch (computeError) {
            console.error('Error computing vertex normals:', computeError);
            setError('Error processing the model');
          }
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`Loading progress: ${percent.toFixed(2)}%`);
        },
        (error) => {
          console.error('Error loading model:', error);
          setError(`Failed to load model: ${error.message}`);
        }
      );
    } catch (err) {
      console.error('Error initializing loader:', err);
      setError('Failed to initialize model loader');
    }

    // Cleanup function
    return () => {
      if (geometry) {
        geometry.dispose();
      }
    };
  }, [url, format]);

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
        {console.error('Rendering error state:', error)}
      </mesh>
    );
  }

  if (!geometry) {
    return (
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="gray" />
        {console.log('Rendering loading state')}
      </mesh>
    );
  }

  const material = format === 'PLY' 
    ? new THREE.MeshStandardMaterial({ 
        vertexColors: true,
        side: THREE.DoubleSide,
        flatShading: true
      })
    : new THREE.MeshStandardMaterial({ 
        color: '#B8B8B8',
        side: THREE.DoubleSide,
        flatShading: true
      });

  return <mesh geometry={geometry} material={material} scale={[0.1, 0.1, 0.1]} />;
}
