import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

export function use3DModel(url: string, format: 'STL' | 'PLY') {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [material, setMaterial] = useState<THREE.Material | null>(null);

  useEffect(() => {
    const loader = format === 'STL' ? new STLLoader() : new PLYLoader();
    loader.load(url, (loadedGeometry: THREE.BufferGeometry) => {
      loadedGeometry.computeVertexNormals();
      setGeometry(loadedGeometry);

      const newMaterial = format === 'PLY' 
        ? new THREE.MeshStandardMaterial({ vertexColors: true })
        : new THREE.MeshPhongMaterial({ color: 0xcccccc });
      setMaterial(newMaterial);
    });
  }, [url, format]);

  return { geometry, material };
}
