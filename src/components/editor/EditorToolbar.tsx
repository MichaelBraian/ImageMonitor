import React from 'react';
import { 
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Save,
  RefreshCw,
  FlipHorizontal,
  FlipVertical
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';

export function EditorToolbar() {
  const { 
    canvas,
    activeImage,
    aspectRatio,
    resetImage,
    saveImage
  } = useEditor();

  const handleZoom = (delta: number) => {
    if (!canvas || !activeImage) return;
    // Implement zoom logic using canvas context
  };

  const handleRotate = (clockwise: boolean = true) => {
    if (!canvas || !activeImage) return;
    // Implement rotation logic using canvas context
  };

  const handleFlip = (horizontal: boolean = true) => {
    if (!canvas || !activeImage) return;
    // Implement flip logic using canvas context
  };

  const handleSave = async () => {
    const dataUrl = await saveImage();
    console.log('Image saved:', dataUrl);
  };

  if (!aspectRatio) return null;

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleRotate(false)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Rotate Counter-clockwise"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleRotate(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Rotate Clockwise"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleZoom(0.1)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleFlip(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Flip Horizontal"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleFlip(false)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Flip Vertical"
          >
            <FlipVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={resetImage}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          title="Reset Image"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="w-5 h-5 mr-2" />
          Save
        </button>
      </div>
    </div>
  );
}
