import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Save, X, FlipHorizontal, FlipVertical, Crop } from 'lucide-react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

interface Editor2DProps {
  imageUrl: string;
  onSave: (editedImage: string) => void;
  onClose: () => void;
}

interface FilterSettings {
  contrast: number;
  brightness: number;
  grayscale: number;
  saturate: number;
  sepia: number;
  blur: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Editor2D: React.FC<Editor2DProps> = ({ imageUrl, onSave, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [filters, setFilters] = useState<FilterSettings>({
    contrast: 100,
    brightness: 100,
    grayscale: 0,
    saturate: 100,
    sepia: 0,
    blur: 0
  });
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [displayUrl, setDisplayUrl] = useState<string>('');

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        const storage = getStorage();
        const imageRef = ref(storage, imageUrl);
        const url = await getDownloadURL(imageRef);
        
        // Create a new image with CORS settings
        const img = new Image();
        img.crossOrigin = "anonymous"; // This is crucial for preventing canvas tainting
        
        // Create a promise to handle image loading
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        // Convert image to base64 to prevent CORS issues
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const base64Url = canvas.toDataURL('image/jpeg');
          setDisplayUrl(base64Url);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading image:', error);
        setIsLoading(false);
      }
    };

    loadImage();
  }, [imageUrl]);

  const getTransformStyle = () => {
    return {
      transform: `
        rotate(${rotation}deg)
        scaleX(${flipH ? -1 : 1})
        scaleY(${flipV ? -1 : 1})
      `,
      filter: `
        contrast(${filters.contrast}%)
        brightness(${filters.brightness}%)
        grayscale(${filters.grayscale}%)
        saturate(${filters.saturate}%)
        sepia(${filters.sepia}%)
        blur(${filters.blur}px)
      `
    };
  };

  const handleCropStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !imageRef.current) return;

    // Get the container's bounds
    const container = imageRef.current.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    // Calculate position relative to container, ignoring rotation
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCropStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleCropMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !cropStart || !imageRef.current) return;

    // Get the container's bounds
    const container = imageRef.current.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    // Calculate position relative to container, ignoring rotation
    const currentX = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    const currentY = Math.min(Math.max(0, e.clientY - rect.top), rect.height);

    setCropArea({
      x: Math.min(cropStart.x, currentX),
      y: Math.min(cropStart.y, currentY),
      width: Math.abs(currentX - cropStart.x),
      height: Math.abs(currentY - cropStart.y)
    });
  };

  const handleCropEnd = () => {
    if (!cropArea || !imageRef.current) return;
    
    try {
      // Create a canvas to perform the crop
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx || !imageRef.current) return;

      // Create a temporary canvas for the rotated/transformed image
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Set canvas sizes
      const img = imageRef.current;
      tempCanvas.width = img.naturalWidth || img.width;
      tempCanvas.height = img.naturalHeight || img.height;

      // Calculate scale factor between displayed image and original size
      const scaleFactor = img.naturalWidth / img.width;

      // Draw the image with current transformations
      tempCtx.save();
      tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
      tempCtx.rotate((rotation * Math.PI) / 180);
      tempCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      tempCtx.translate(-tempCanvas.width / 2, -tempCanvas.height / 2);
      tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.restore();

      // Set final canvas size to crop dimensions
      canvas.width = cropArea.width * scaleFactor;
      canvas.height = cropArea.height * scaleFactor;

      // Draw the cropped portion
      ctx.drawImage(
        tempCanvas,
        cropArea.x * scaleFactor,
        cropArea.y * scaleFactor,
        cropArea.width * scaleFactor,
        cropArea.height * scaleFactor,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Apply current filters
      ctx.filter = `
        contrast(${filters.contrast}%)
        brightness(${filters.brightness}%)
        grayscale(${filters.grayscale}%)
        saturate(${filters.saturate}%)
        sepia(${filters.sepia}%)
        blur(${filters.blur}px)
      `;

      // Update the display URL with cropped image
      const newUrl = canvas.toDataURL('image/jpeg', 1.0);
      setDisplayUrl(newUrl);
      
      // Reset crop mode
      setIsCropping(false);
      setCropStart(null);
      setCropArea(null);

      // Reset rotation and flips after crop
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    } catch (error) {
      console.error('Error during crop:', error);
      alert('Failed to crop image. Please try again.');
      setIsCropping(false);
      setCropStart(null);
      setCropArea(null);
    }
  };

  // Modify the save handler to include all transformations
  const handleSave = () => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match original image
    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;

    // Apply transformations in the correct order
    ctx.save();
    
    // Move to center for transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Apply flips
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    
    // Move back
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Apply filters
    ctx.filter = `
      contrast(${filters.contrast}%)
      brightness(${filters.brightness}%)
      grayscale(${filters.grayscale}%)
      saturate(${filters.saturate}%)
      sepia(${filters.sepia}%)
      blur(${filters.blur}px)
    `;

    // Draw the image with all transformations
    ctx.drawImage(
      imageRef.current,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();

    // Convert to base64 and save
    const finalImage = canvas.toDataURL('image/jpeg', 1.0);
    onSave(finalImage);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="h-16 bg-white dark:bg-gray-800 shadow flex items-center justify-between px-4">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Image Editor</h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </button>
      </div>

      {/* Editor Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Image Area */}
        <div 
          className="flex-1 p-4 flex items-center justify-center bg-gray-200 dark:bg-gray-800"
          onMouseDown={handleCropStart}
          onMouseMove={handleCropMove}
          onMouseUp={handleCropEnd}
          onMouseLeave={() => {
            if (isCropping) {
              setCropStart(null);
              setCropArea(null);
            }
          }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="mt-2">Loading image...</p>
            </div>
          ) : displayUrl ? (
            <div className="relative max-w-full max-h-full overflow-auto">
              <img
                ref={imageRef}
                src={displayUrl}
                alt="Editing"
                className="max-w-full max-h-full"
                style={{
                  ...getTransformStyle(),
                  cursor: isCropping ? 'crosshair' : 'default'
                }}
              />
              {cropArea && isCropping && (
                <>
                  {/* Dark overlay outside crop area */}
                  <div className="absolute inset-0 bg-black bg-opacity-50">
                    <div
                      className="absolute bg-transparent"
                      style={{
                        left: `${cropArea.x}px`,
                        top: `${cropArea.y}px`,
                        width: `${cropArea.width}px`,
                        height: `${cropArea.height}px`,
                      }}
                    />
                  </div>
                  {/* Crop area border */}
                  <div
                    className="absolute border-2 border-blue-500"
                    style={{
                      left: `${cropArea.x}px`,
                      top: `${cropArea.y}px`,
                      width: `${cropArea.width}px`,
                      height: `${cropArea.height}px`,
                    }}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="text-red-500">Failed to load image</div>
          )}
        </div>

        {/* Controls Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 p-4 overflow-y-auto">
          {/* Add Crop Button at the top */}
          <div className="mb-6">
            <button
              onClick={() => setIsCropping(!isCropping)}
              className={`w-full p-2 rounded flex items-center justify-center ${
                isCropping 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              <Crop className="w-5 h-5 mr-2" />
              {isCropping ? 'Cancel Crop' : 'Crop Image'}
            </button>
          </div>

          {/* Existing controls */}
          {!isCropping && (
            <>
              {/* Rotation Control */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Rotation</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Flip Controls */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setFlipH(!flipH)}
                  className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 rounded"
                >
                  <FlipHorizontal className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={() => setFlipV(!flipV)}
                  className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 rounded"
                >
                  <FlipVertical className="w-5 h-5 mx-auto" />
                </button>
              </div>

              {/* Filter Controls */}
              {Object.entries(filters).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium mb-2 capitalize">
                    {key}
                  </label>
                  <input
                    type="range"
                    min={key === 'blur' ? 0 : key === 'brightness' || key === 'contrast' ? 0 : 0}
                    max={key === 'blur' ? 10 : key === 'brightness' || key === 'contrast' ? 200 : 100}
                    value={value}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      [key]: Number(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
