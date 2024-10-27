import React, { useState, useEffect } from 'react';
import ReactImagePickerEditor from 'react-image-picker-editor';
import 'react-image-picker-editor/dist/index.css';
import { Loader2, Save, X } from 'lucide-react';

interface Editor2DProps {
  imageUrl: string;
  onSave: (editedImage: string) => void;
  onClose: () => void;
}

export const Editor2D: React.FC<Editor2DProps> = ({ imageUrl, onSave, onClose }) => {
  const [initialImage, setInitialImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setInitialImage(base64data);
          setIsLoading(false);
        };
        
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error loading image:', error);
        setIsLoading(false);
      }
    };

    loadImage();
  }, [imageUrl]);

  const config = {
    width: '100%',
    height: '70vh',
    objectFit: 'contain',
    cropTool: true,
    rotateTool: true,
    flipTool: true,
    scaleSlider: true,
    filterTool: true,
    uploadBtn: false,
    useInitialImage: true,
    defaultImage: initialImage || undefined
  };

  if (isLoading || !initialImage) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="mt-2">Loading image editor...</p>
        </div>
      </div>
    );
  }

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
          onClick={() => {
            if (initialImage) {
              onSave(initialImage);
            }
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Changes
        </button>
      </div>

      {/* Editor Container */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-full">
          <ReactImagePickerEditor
            config={config}
            imageSrcProp={initialImage}
            imageChanged={(newDataUri: string) => {
              if (newDataUri && newDataUri !== initialImage) {
                setInitialImage(newDataUri);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
