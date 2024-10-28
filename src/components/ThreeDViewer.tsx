import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Model } from './Model';

interface ThreeDViewerProps {
  fileUrl: string;
  fileFormat: 'STL' | 'PLY';
}

export function ThreeDViewer({ fileUrl, fileFormat }: ThreeDViewerProps) {
  console.log('ThreeDViewer: Rendering with props:', { fileUrl, fileFormat });

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
          <Model url={fileUrl} format={fileFormat} />
        </Canvas>
      </div>
    </div>
  );
}
