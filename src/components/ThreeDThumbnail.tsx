import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

interface ThreeDThumbnailProps {
  fileUrl: string;
  fileFormat: 'STL' | 'PLY';
}

export function ThreeDThumbnail({ fileUrl, fileFormat }: ThreeDThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(500, 500); // Increased size for better quality

    const loader = fileFormat === 'STL' ? new STLLoader() : new PLYLoader();
    loader.load(fileUrl, (geometry) => {
      geometry.computeVertexNormals();
      const material = fileFormat === 'PLY'
        ? new THREE.MeshStandardMaterial({ vertexColors: true })
        : new THREE.MeshPhongMaterial({ color: 0xcccccc });
      const mesh = new THREE.Mesh(geometry, material);

      // Center and fit the model to view
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      mesh.position.sub(center);
      scene.add(mesh);

      // Adjust camera position to be closer
      camera.position.set(maxDim * 0.8, maxDim * 0.8, maxDim * 0.8);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 1);
      scene.add(light);

      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      scene.add(ambientLight);

      function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
      }
      animate();
    });

    return () => {
      // Clean up Three.js resources
      scene.clear();
      renderer.dispose();
    };
  }, [fileUrl, fileFormat]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          maxWidth: '100%',
          maxHeight: '100%'
        }} 
      />
    </div>
  );
}
