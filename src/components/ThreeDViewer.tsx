import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Model } from './Model';

interface ThreeDViewerProps {
  fileUrl: string;
  fileFormat: 'STL' | 'PLY';
}

export function ThreeDViewer({ fileUrl, fileFormat }: ThreeDViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <OrthographicCamera
          makeDefault
          zoom={50}
          position={[0, 0, 100]}
          near={0.1}
          far={2000}
        />
        <OrbitControls 
          makeDefault 
          enableRotate={true} 
          enableZoom={true} 
          enablePan={true}
          // Add these props for better orthographic control
          minZoom={10}
          maxZoom={500}
        />
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <Model url={fileUrl} format={fileFormat} />
      </Canvas>
    </div>
  );
}
