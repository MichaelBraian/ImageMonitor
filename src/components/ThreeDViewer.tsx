import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Model } from './Model';
import { Slider } from './ui/Slider';

interface ThreeDViewerProps {
  fileUrl: string;
  fileFormat: 'STL' | 'PLY';
}

export function ThreeDViewer({ fileUrl, fileFormat }: ThreeDViewerProps) {
  const [ambientLight, setAmbientLight] = useState(0.7);
  const [directionalLight, setDirectionalLight] = useState(0.5);

  return (
    <div className="w-full h-full relative">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <OrbitControls makeDefault enableRotate={true} enableZoom={true} enablePan={true} />
        
        {/* Adjustable lights */}
        <ambientLight intensity={ambientLight} />
        <directionalLight position={[10, 10, 5]} intensity={directionalLight} />
        
        <Model url={fileUrl} format={fileFormat} />
      </Canvas>

      {/* Light controls */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-64">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Ambient Light: {(ambientLight * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={ambientLight}
              onChange={(e) => setAmbientLight(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Directional Light: {(directionalLight * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={directionalLight}
              onChange={(e) => setDirectionalLight(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
