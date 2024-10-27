import React, { useState, useCallback } from 'react';
import { DentalFile } from '../types';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import { Crop, RotateCw, ZoomIn, ZoomOut, Save, Check, X } from 'lucide-react';

interface Editor2DProps {
  file: DentalFile;
}

export function Editor2D({ file }: Editor2DProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (croppedAreaPixels) {
      // Implement save functionality
      console.log('Saving cropped image...', croppedAreaPixels);
    }
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 relative">
        {isCropping ? (
          <div className="absolute inset-0">
            <Cropper
              image={file.url}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        ) : (
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `rotate(${rotation}deg) scale(${zoom})`,
              transition: 'transform 0.3s ease',
            }}
          />
        )}
      </div>
      <div className="w-64 bg-gray-100 dark:bg-gray-800 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Editing Tools</h2>
        <button
          onClick={() => setIsCropping(!isCropping)}
          className={`mb-2 flex items-center p-2 rounded ${
            isCropping ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
          }`}
        >
          <Crop className="mr-2" /> Crop
        </button>
        <button
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="mb-2 flex items-center p-2 rounded hover:bg-gray-200"
        >
          <RotateCw className="mr-2" /> Rotate
        </button>
        <div className="space-y-2">
          <button
            onClick={() => setZoom(z => Math.min(3, z + 0.1))}
            className="w-full flex items-center p-2 rounded hover:bg-gray-200"
          >
            <ZoomIn className="mr-2" /> Zoom In
          </button>
          <button
            onClick={() => setZoom(z => Math.max(1, z - 0.1))}
            className="w-full flex items-center p-2 rounded hover:bg-gray-200"
          >
            <ZoomOut className="mr-2" /> Zoom Out
          </button>
        </div>
        <button
          onClick={handleSave}
          className="mt-auto bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          <Save className="inline mr-2" /> Save Changes
        </button>
      </div>
    </div>
  );
}
