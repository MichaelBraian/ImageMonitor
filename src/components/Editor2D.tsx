import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Save, X, RotateCw, FlipHorizontal, FlipVertical, Crop } from 'lucide-react';
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

export const Editor2D: React.FC<Editor2DProps> = ({ imageUrl, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      console.log('Starting to load image from URL:', imageUrl);
      setIsLoading(true);
      
      try {
        // Get a fresh download URL from Firebase
        const storage = getStorage();
        const imageRef = ref(storage, imageUrl);
        const freshUrl = await getDownloadURL(imageRef);
        
        console.log('Got fresh download URL:', freshUrl);
        
        const image = new Image();
        image.crossOrigin = "anonymous";
        
        // Create a promise to handle image loading
        const imageLoadPromise = new Promise((resolve, reject) => {
          image.onload = () => {
            console.log('Image loaded successfully:', {
              width: image.width,
              height: image.height,
              src: image.src,
              complete: image.complete,
              naturalWidth: image.naturalWidth,
              naturalHeight: image.naturalHeight
            });
            resolve(image);
          };

          image.onerror = (error) => {
            console.error('Error loading image:', error);
            reject(error);
          };
        });

        image.src = freshUrl;
        
        // Wait for image to load
        await imageLoadPromise;
        
        if (canvasRef.current && image.complete && image.naturalWidth > 0) {
          const canvas = canvasRef.current;
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Draw the original image first to verify it loads
            ctx.drawImage(image, 0, 0);
            console.log('Image drawn to canvas successfully');
            
            setOriginalImage(image);
            applyTransformations(image);
          } else {
            throw new Error('Could not get canvas context');
          }
        } else {
          throw new Error('Canvas not ready or image not properly loaded');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in loadImage:', error);
        setIsLoading(false);
        setOriginalImage(null);
      }
    };

    loadImage();
  }, [imageUrl]);

  // Add effect to reapply transformations when any transform state changes
  useEffect(() => {
    if (originalImage) {
      applyTransformations(originalImage);
    }
  }, [rotation, flipH, flipV, filters]);

  const applyTransformations = (image: HTMLImageElement) => {
    if (!canvasRef.current) {
      console.error('Canvas ref is null');
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    console.log('Applying transformations:', {
      rotation,
      flipH,
      flipV,
      filters,
      imageWidth: image.width,
      imageHeight: image.height,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up filters before any drawing
    ctx.filter = `
      contrast(${filters.contrast}%)
      brightness(${filters.brightness}%)
      grayscale(${filters.grayscale}%)
      saturate(${filters.saturate}%)
      sepia(${filters.sepia}%)
      blur(${filters.blur}px)
    `;

    // Save context state
    ctx.save();

    // Move to center for rotation
    ctx.translate(canvas.width/2, canvas.height/2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply flips
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Draw image
    try {
      ctx.drawImage(
        image,
        -image.width/2,
        -image.height/2,
        image.width,
        image.height
      );
      console.log('Transformations applied successfully');
    } catch (error) {
      console.error('Error drawing image with transformations:', error);
    }

    // Restore context state
    ctx.restore();
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      onSave(dataUrl);
    }
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
        {/* Main Canvas Area */}
        <div className="flex-1 p-4 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="mt-2">Loading image...</p>
            </div>
          ) : !originalImage ? (
            <div className="text-red-500 flex flex-col items-center">
              <p>Failed to load image. Please try again.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reload
              </button>
            </div>
          ) : (
            <div className="relative max-w-full max-h-full">
              <canvas 
                ref={canvasRef} 
                className="shadow-lg"
              />
            </div>
          )}
        </div>

        {/* Controls Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 p-4 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
};
