import React from 'react';
import ReactImagePickerEditor, { ImagePickerConf } from 'react-image-picker-editor';
import 'react-image-picker-editor/dist/index.css';

interface ImageEditorProps {
  selectedImage: string;
  onSave: (editedImage: string) => void;
  onClose: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  selectedImage,
  onSave,
  onClose
}) => {
  const editorConfig: ImagePickerConf = {
    borderRadius: '8px',
    language: 'en',
    width: '100%',
    height: '400px',
    objectFit: 'contain',
    compressInitial: null,
    darkMode: false
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl">
        <ReactImagePickerEditor
          config={editorConfig}
          imageSrcProp={selectedImage}
          imageChanged={(newDataUri) => {
            onSave(newDataUri);
          }}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg mr-2"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedImage)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
