import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { FileWithPreview } from '../types';

interface FileUploadProps {
  onFileSelect: (file: FileWithPreview) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFile = (file: File) => {
    const fileWithPreview: FileWithPreview = {
      file,
      preview: URL.createObjectURL(file)
    };
    onFileSelect(fileWithPreview);
  };

  return (
    <div
      onDrop={handleDrop}
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
  );
}