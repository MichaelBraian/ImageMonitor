import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Model } from './Model';

interface ThreeDViewerProps {
  fileUrl: string;
  fileFormat: 'STL' | 'PLY';
}

export function ThreeDViewer({ fileUrl, fileFormat }: ThreeDViewerProps) {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <OrbitControls makeDefault enableRotate={true} enableZoom={true} enablePan={true} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <Model url={fileUrl} format={fileFormat} />
      </Canvas>
    </div>
  );
}
