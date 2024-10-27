import React, { useState, useEffect } from 'react';
import { DentalFile } from '../types';
import { CropTool } from './CropTool';
import { RotationRuler } from './RotationRuler';
import { ImageControls } from './ImageControls';

interface Editor2DProps {
  file: DentalFile;
}

export function Editor2D({ file }: Editor2DProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const img = new Image();
    img.src = file.url;
    img.onload = () => setImage(img);
  }, [file.url]);

  if (!image) {
    return <div>Loading image...</div>;
  }

  const tools = [
    // Add your tools here, for example:
    // { icon: CropIcon, label: 'Crop', onClick: handleCrop },
    // { icon: RotateIcon, label: 'Rotate', onClick: handleRotate },
  ];

  return (
    <div className="h-full flex flex-col">
      <ImageControls tools={tools} zoom={zoom} rotation={rotation} />
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
        <CropTool imageRef={{ current: image }} onCropComplete={() => {}} onCancel={() => {}} />
      </div>
      <RotationRuler rotation={rotation} onChange={setRotation} />
    </div>
  );
}
