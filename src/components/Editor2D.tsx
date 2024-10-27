import React from 'react';
import ReactImagePickerEditor, { ReactImagePickerEditorProps } from 'react-image-picker-editor';
import 'react-image-picker-editor/dist/index.css';

interface Editor2DProps {
  imageUrl: string;
  onSave: (editedImage: string) => void;
  onClose: () => void;
}

export const Editor2D: React.FC<Editor2DProps> = ({ imageUrl, onSave, onClose }) => {
  const config: ReactImagePickerEditorProps['config'] = {
    borderRadius: '8px',
    language: 'en',
    width: '800px',
    height: '400px',
    objectFit: 'contain',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Edit Image</h2>
        </div>
        
        <ReactImagePickerEditor
          config={config}
          imageSrcProps={imageUrl}
          onSave={onSave}
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
