import React, { useState, useEffect } from 'react';
import { Loader2, Save, X, FlipHorizontal, FlipVertical } from 'lucide-react';
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

  const [displayUrl, setDisplayUrl] = useState<string>('');

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        const storage = getStorage();
        const imageRef = ref(storage, imageUrl);
        const url = await getDownloadURL(imageRef);
        console.log('Got image URL:', url);
        setDisplayUrl(url);
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
          onClick={() => onSave(displayUrl)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </button>
      </div>

      {/* Editor Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Image Area */}
        <div className="flex-1 p-4 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="mt-2">Loading image...</p>
            </div>
          ) : displayUrl ? (
            <div className="relative max-w-full max-h-full overflow-auto">
              <img
                src={displayUrl}
                alt="Editing"
                className="max-w-full max-h-full"
                style={getTransformStyle()}
              />
            </div>
          ) : (
            <div className="text-red-500">Failed to load image</div>
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
