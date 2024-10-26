import React, { useState, useRef, useEffect } from 'react';
import { CropConfirmDialog } from './CropConfirmDialog';

interface CropToolProps {
  imageRef: React.RefObject<HTMLImageElement>;
  onCropComplete: (crop: CropArea) => void;
  onCancel: () => void;
  aspectRatio?: number | null;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function CropTool({ imageRef, onCropComplete, onCancel, aspectRatio }: CropToolProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [crop, setCrop] = useState<CropArea | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const cropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial crop area based on aspect ratio
    if (imageRef.current && aspectRatio !== undefined && !crop) {
      const rect = imageRef.current.getBoundingClientRect();
      const imageWidth = rect.width;
      const imageHeight = rect.height;

      let width = imageWidth * 0.8; // 80% of image width
      let height = aspectRatio ? width / aspectRatio : imageHeight * 0.8;

      // Ensure crop area doesn't exceed image bounds
      if (height > imageHeight) {
        height = imageHeight * 0.8;
        width = height * (aspectRatio || imageWidth / imageHeight);
      }

      const x = (imageWidth - width) / 2;
      const y = (imageHeight - height) / 2;

      setCrop({ x, y, width, height });
      setShowConfirm(true);
    }
  }, [aspectRatio, imageRef, crop]);

  const calculateCropArea = (e: MouseEvent) => {
    if (!imageRef.current || !cropRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const cropRect = cropRef.current.getBoundingClientRect();

    // Calculate coordinates relative to the image container
    const relativeX = e.clientX - cropRect.left;
    const relativeY = e.clientY - cropRect.top;

    // Calculate crop dimensions
    let x = Math.min(startPoint.x, relativeX);
    let y = Math.min(startPoint.y, relativeY);
    let width = Math.abs(relativeX - startPoint.x);
    let height = Math.abs(relativeY - startPoint.y);

    // Constrain to aspect ratio if specified
    if (aspectRatio) {
      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
    }

    // Ensure crop area stays within image bounds
    x = Math.max(0, Math.min(x, rect.width - width));
    y = Math.max(0, Math.min(y, rect.height - height));
    width = Math.min(width, rect.width - x);
    height = Math.min(height, rect.height - y);

    setCrop({ x, y, width, height });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropRef.current || !imageRef.current || showConfirm) return;

    const rect = imageRef.current.getBoundingClientRect();
    const cropRect = cropRef.current.getBoundingClientRect();
    
    // Calculate click position relative to the image container
    const relativeX = e.clientX - cropRect.left;
    const relativeY = e.clientY - cropRect.top;
    
    if (
      relativeX >= 0 && 
      relativeX <= rect.width && 
      relativeY >= 0 && 
      relativeY <= rect.height
    ) {
      setStartPoint({ x: relativeX, y: relativeY });
      setIsDragging(true);
      setCrop(null);
      setShowConfirm(false);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        calculateCropArea(e);
      }
    };

    const handleMouseUp = () => {
      if (isDragging && crop) {
        setShowConfirm(true);
      }
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, crop]);

  const handleConfirmCrop = () => {
    if (crop) {
      onCropComplete(crop);
    }
  };

  const handleCancelCrop = () => {
    setShowConfirm(false);
    setCrop(null);
    onCancel();
  };

  return (
    <div
      ref={cropRef}
      className="absolute inset-0 cursor-crosshair"
      onMouseDown={handleMouseDown}
      style={{
        width: imageRef.current?.offsetWidth,
        height: imageRef.current?.offsetHeight,
        transform: imageRef.current?.style.transform
      }}
    >
      {crop && (
        <>
          <div className="absolute inset-0 bg-black bg-opacity-50">
            <div
              className="absolute bg-transparent"
              style={{
                left: `${crop.x}px`,
                top: `${crop.y}px`,
                width: `${crop.width}px`,
                height: `${crop.height}px`,
              }}
            />
          </div>
          <div
            className="absolute border-2 border-blue-500"
            style={{
              left: `${crop.x}px`,
              top: `${crop.y}px`,
              width: `${crop.width}px`,
              height: `${crop.height}px`,
            }}
          >
            <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-white border border-blue-500" />
            <div className="absolute -right-1.5 -top-1.5 w-3 h-3 bg-white border border-blue-500" />
            <div className="absolute -left-1.5 -bottom-1.5 w-3 h-3 bg-white border border-blue-500" />
            <div className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-white border border-blue-500" />
            
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border-white border-opacity-50"
                  style={{
                    borderWidth: i % 2 === 0 ? '0 1px' : '1px 0'
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
      {showConfirm && (
        <CropConfirmDialog
          onConfirm={handleConfirmCrop}
          onCancel={handleCancelCrop}
        />
      )}
    </div>
  );
}