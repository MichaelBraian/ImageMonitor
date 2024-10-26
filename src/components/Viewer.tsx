import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Model } from './Model';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { FileWithPreview } from '../types';

interface ViewerProps {
  file: FileWithPreview;
  onBack: () => void;
}

export function Viewer({ file, onBack }: ViewerProps) {
  return (
    <div className="relative h-[calc(100vh-10rem)]">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-10 flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>
      <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            <Model url={file.preview} />
          </Stage>
        </Suspense>
        <OrbitControls autoRotate={false} />
      </Canvas>
      <div className="absolute bottom-4 left-4 text-sm text-gray-500 dark:text-gray-400">
        File: {file.file.name}
      </div>
    </div>
  );
}