import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const img = new Image();
    img.src = file.url;
    img.onload = () => setImage(img);
  }, [file.url]);

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

  const handleSave = () => {
    // Implement save functionality
    console.log('Saving image...');
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 relative overflow-hidden">
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
          <CropTool imageRef={{ current: image }} onCropComplete={() => {}} onCancel={() => setIsCropping(false)} />
        )}
      </div>
      <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Editing Tools</h2>
        <button onClick={handleCrop} className="mb-2 flex items-center">
          <Crop className="mr-2" /> Crop
        </button>
        <button onClick={handleRotate} className="mb-2 flex items-center">
          <RotateCw className="mr-2" /> Rotate
        </button>
        <div className="mb-2">
          <button onClick={() => handleZoom(0.1)} className="mr-2 flex items-center">
            <ZoomIn className="mr-1" /> Zoom In
          </button>
          <button onClick={() => handleZoom(-0.1)} className="flex items-center">
            <ZoomOut className="mr-1" /> Zoom Out
          </button>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Rotation</label>
          <RotationRuler rotation={rotation} onChange={setRotation} />
        </div>
        <button onClick={handleSave} className="mt-auto bg-blue-500 text-white py-2 px-4 rounded">
          <Save className="inline mr-2" /> Save Changes
        </button>
      </div>
    </div>
  );
}
