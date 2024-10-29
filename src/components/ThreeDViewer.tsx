import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { Model } from './Model';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { auth } from '../firebase/config';

interface ThreeDViewerProps {
  fileUrl: string;
  fileFormat: 'STL' | 'PLY';
}

export function ThreeDViewer({ fileUrl, fileFormat }: ThreeDViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        // Log authentication state
        console.log('Current auth state:', {
          isAuthenticated: !!auth.currentUser,
          userEmail: auth.currentUser?.email,
          fileUrl
        });

        const storage = getStorage();
        const fileRef = ref(storage, fileUrl);
        
        // Get download URL
        console.log('Attempting to get download URL for:', fileUrl);
        const url = await getDownloadURL(fileRef);
        console.log('Successfully generated download URL:', url);
        setDownloadUrl(url);
        
        // Test URL accessibility
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.statusText}`);
        }
        console.log('File is accessible via fetch');
        setIsLoading(false);
      } catch (err: any) {
        console.error('Detailed error:', {
          error: err,
          message: err.message,
          code: err.code,
          serverResponse: err.serverResponse
        });
        const errorMessage = err.message || 'Unknown error occurred';
        setError(`Failed to load 3D model: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    if (auth.currentUser) {
      loadModel();
    } else {
      setError('User not authenticated');
    }
  }, [fileUrl]);

  if (error) {
    return (
      <div className="p-8 h-[80vh] w-full flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!downloadUrl) {
    return (
      <div className="p-8 h-[80vh] w-full flex items-center justify-center">
        <div className="text-gray-700">Generating download URL...</div>
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
            <Model url={downloadUrl} format={fileFormat} />
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
