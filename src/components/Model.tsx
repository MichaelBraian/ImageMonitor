import React, { useEffect, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import * as THREE from 'three';

interface ModelProps {
  url: string | File;
}

export function Model({ url }: ModelProps) {
  console.log('Model component props:', { url });
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError('No URL or File provided');
      return;
    }

    const loadModel = async () => {
      try {
        let loadedGeometry;
        if (typeof url === 'string') {
          if (url.toLowerCase().endsWith('.stl')) {
            loadedGeometry = await useLoader(STLLoader, url);
          } else if (url.toLowerCase().endsWith('.ply')) {
            loadedGeometry = await useLoader(PLYLoader, url);
          } else {
            throw new Error('Unsupported file format');
          }
        } else if (url instanceof File) {
          const arrayBuffer = await url.arrayBuffer();
          const loader = url.name.toLowerCase().endsWith('.stl') ? new STLLoader() : new PLYLoader();
          loadedGeometry = loader.parse(arrayBuffer);
        } else {
          throw new Error('Invalid url type');
        }

        if (loadedGeometry) {
          loadedGeometry.center();
          loadedGeometry.computeVertexNormals();
          const box = new THREE.Box3().setFromObject(new THREE.Mesh(loadedGeometry));
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 100 / maxDim;
          loadedGeometry.scale(scale, scale, scale);
          setGeometry(loadedGeometry);
          setError(null);
        } else {
          throw new Error('Failed to load geometry');
        }
      } catch (err) {
        console.error('Failed to load model:', err);
        setError(err instanceof Error ? err.message : 'Failed to load model');
      }
    };

    loadModel();
  }, [url]);

  useEffect(() => {
    const logModelViewerInfo = () => {
      console.log('Attempting to log model viewer info');
      const modelViewer = document.getElementById('dental-model-viewer') as any;
      if (modelViewer) {
        console.log('Model Viewer element:', modelViewer);
        console.log('Model Viewer src:', modelViewer.src);
        console.log('Model Viewer loaded:', modelViewer.loaded);
        console.log('Model Viewer modelIsVisible:', modelViewer.modelIsVisible);
        console.log('Model Viewer error:', modelViewer.error);
      } else {
        console.log('Model Viewer element not found');
      }
    };

    // Log info immediately and after a short delay
    logModelViewerInfo();
    const timeoutId = setTimeout(logModelViewerInfo, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!geometry) {
    return <div>Loading...</div>;
  }

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#B8B8B8" />
    </mesh>
  );
}
