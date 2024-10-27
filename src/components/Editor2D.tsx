import React, { useState, useEffect, useRef } from 'react';
import { DentalFile } from '../types';
import { CropTool } from './CropTool';
import { RotationRuler } from './RotationRuler';
import { ImageControls } from './ImageControls';
import { Crop, RotateCw, ZoomIn, ZoomOut, Save } from 'lucide-react';

interface Editor2DProps {
  file: DentalFile;
}

export function Editor2D({ file }: Editor2DProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number>(0);

  useEffect(() => {
    const img = new Image();
    img.src = file.url;
    img.onload = () => setImage(img);
  }, [file.url]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Check if it's a touchpad/trackpad gesture
      const isTrackpad = Math.abs(e.deltaY) < 50;
      const delta = isTrackpad ? e.deltaY * -0.01 : e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prevZoom => Math.max(0.1, Math.min(5, prevZoom + delta)));
    };

    // Handle touchpad pinch gestures
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        lastTouchDistance.current = distance;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = (distance - lastTouchDistance.current) * 0.01;
        lastTouchDistance.current = distance;
        setZoom(prevZoom => Math.max(0.1, Math.min(5, prevZoom + delta)));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  if (!image) {
    return <div>Loading image...</div>;
  }

  const handleZoom = (delta: number) => {
    setZoom(prevZoom => Math.max(0.1, Math.min(5, prevZoom + delta)));
  };

  const handleRotate = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };

  const handleCrop = () => {
    setIsCropping(!isCropping);
  };

  const handleCropComplete = (croppedArea: { width: number; height: number; x: number; y: number }) => {
    // Create a canvas to draw the cropped image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || !image) return;

    // Set canvas dimensions to the cropped area size
    canvas.width = croppedArea.width;
    canvas.height = croppedArea.height;

    // Draw the cropped portion of the image
    ctx.drawImage(
      image,
      croppedArea.x, croppedArea.y,
      croppedArea.width, croppedArea.height,
      0, 0,
      croppedArea.width, croppedArea.height
    );

    // Convert canvas to data URL
    const croppedImage = canvas.toDataURL('image/jpeg', 0.95);
    
    // Update the image
    const newImage = new Image();
    newImage.src = croppedImage;
    newImage.onload = () => {
      setImage(newImage);
      setIsCropping(false);
    };
  };

  const handleCropCancel = () => {
    setIsCropping(false);
  };

  const handleSave = () => {
    // Implement save functionality
    console.log('Saving image...');
  };

  return (
    <div className="h-full flex">
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <img
          src={file.url}
          alt={file.name}
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
            transition: 'transform 0.3s ease',
          }}
          className="max-w-full max-h-full object-contain"
        />
        {isCropping && (
          <CropTool 
            imageRef={{ current: image }} 
            onCropComplete={handleCropComplete} 
            onCancel={handleCropCancel}
            aspectRatio={undefined}
          />
        )}
      </div>
      <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Editing Tools</h2>
        <button 
          onClick={handleCrop} 
          className={`mb-2 flex items-center p-2 rounded ${
            isCropping 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Crop className="mr-2" /> Crop
        </button>
        <button 
          onClick={handleRotate} 
          className="mb-2 flex items-center p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <RotateCw className="mr-2" /> Rotate
        </button>
        <div className="mb-2 space-y-2">
          <button 
            onClick={() => handleZoom(0.1)} 
            className="w-full flex items-center p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ZoomIn className="mr-2" /> Zoom In
          </button>
          <button 
            onClick={() => handleZoom(-0.1)} 
            className="w-full flex items-center p-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ZoomOut className="mr-2" /> Zoom Out
          </button>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Rotation</label>
          <RotationRuler rotation={rotation} onChange={setRotation} />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Zoom: {(zoom * 100).toFixed(0)}%</label>
        </div>
        <button 
          onClick={handleSave} 
          className="mt-auto bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          <Save className="inline mr-2" /> Save Changes
        </button>
      </div>
    </div>
  );
}
