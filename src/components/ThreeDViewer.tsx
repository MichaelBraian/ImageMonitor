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
    // Add padding and container styling
    <div className="p-8 h-full w-full flex items-center justify-center">
      {/* Add a visible boundary with shadow and border */}
      <div className="w-[800px] h-[600px] rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Canvas>
          <OrthographicCamera
            makeDefault
            zoom={20}  // Reduced zoom to show more of the object
            position={[0, 0, 200]}  // Moved camera further back
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
          <ambientLight intensity={0.9} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} />
          <Model url={fileUrl} format={fileFormat} />
          {/* Removed the gridHelper */}
        </Canvas>
      </div>
    </div>
  );
}
