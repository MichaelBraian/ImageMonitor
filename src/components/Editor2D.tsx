import React, { useState, useEffect } from 'react';
import ReactImagePickerEditor from 'react-image-picker-editor';
import 'react-image-picker-editor/dist/index.css';
import { Loader2 } from 'lucide-react';

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
    width: '800px',
    height: '600px',
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="mt-2">Loading image editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Edit Image</h2>
        </div>
        
        <ReactImagePickerEditor
          config={config}
          imageSrcProp={initialImage}
          imageChanged={(newDataUri: string) => {
            if (newDataUri && newDataUri !== initialImage) {
              onSave(newDataUri);
            }
          }}
        />
        
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
