import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { FileWithPreview } from '../types';
import { Editor2D } from './Editor2D';  // Changed from ImageEditor to Editor2D

interface FileUploadProps {
  onFileSelect: (file: FileWithPreview) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowEditor(true);
  };

  const handleFile = (file: File) => {
    const fileWithPreview: FileWithPreview = {
      file,
      preview: URL.createObjectURL(file)
    };
    onFileSelect(fileWithPreview);
  };

  return (
    <div>
      <div
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) {
            handleFile(file);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        className="max-w-2xl mx-auto"
      >
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              STL, OBJ, PLY, glTF, and other 3D files
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".stl,.obj,.ply,.gltf,.glb"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFile(file);
              }
            }}
          />
        </label>
      </div>

      {/* Show editor when an image is clicked */}
      {showEditor && selectedImage && (
        <Editor2D
          imageUrl={selectedImage}
          onSave={(editedImage: string) => {
            // Handle the edited image here
            setShowEditor(false);
          }}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
