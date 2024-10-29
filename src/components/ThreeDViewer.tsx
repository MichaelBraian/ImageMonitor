import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Model } from './Model';

interface ThreeDViewerProps {
  fileUrl: string;
  fileFormat: 'STL' | 'PLY';
}

export function ThreeDViewer({ fileUrl, fileFormat }: ThreeDViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify the URL is accessible
    fetch(fileUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.statusText}`);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading 3D file:', err);
        setError('Failed to load 3D model. Please try again.');
        setIsLoading(false);
      });
  }, [fileUrl]);

  if (error) {
    return (
      <div className="p-8 h-[80vh] w-full flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 h-[80vh] w-full">
      <div className="w-full h-full rounded-lg border border-gray-200 shadow-lg bg-gray-50 overflow-hidden">
        <Canvas>
          <OrthographicCamera
            makeDefault
            zoom={20}
            position={[0, 0, 200]}
            near={0.1}
            far={2000}
          />
          <OrbitControls 
            makeDefault 
            enableRotate={true} 
            enableZoom={true} 
            enablePan={true}
            minZoom={10}
            maxZoom={500}
          />
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} />
          <Suspense fallback={null}>
            <Model url={fileUrl} format={fileFormat} />
          </Suspense>
        </Canvas>
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
          <div className="text-gray-700">Loading 3D model...</div>
        </div>
      )}
    </div>
  );
}
