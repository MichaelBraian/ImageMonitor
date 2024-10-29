import React, { useState, useCallback } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { useFiles } from '../context/FileContext';
import { PreviewFile } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  patientId: string;
}

export function ImageUploadModal({ isOpen, onClose, onUploadComplete, patientId }: ImageUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { uploadFile } = useFiles();

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    try {
      const newFiles = await Promise.all(files.map(async (file) => {
        console.log("Processing file:", file);
        const fileType = file.type.startsWith('image/') ? '2D' as const : '3D' as const;
        const format = file.name.toLowerCase().endsWith('.stl') ? 'STL' as const :
                      file.name.toLowerCase().endsWith('.ply') ? 'PLY' as const : '2D' as const;
        const preview = fileType === '2D' ? URL.createObjectURL(file) : undefined;
        
        return {
          id: uuidv4(),
          file,
          preview,
          fileType,
          format,
        };
      }));
      console.log("Processed files:", newFiles);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    } catch (err) {
      console.error("Error processing files:", err);
      setError("Failed to process selected files");
    }
  }, []);

  const handleUpload = async () => {
    if (!user) {
      setError('User must be authenticated to upload files');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      for (const file of selectedFiles) {
        await uploadFile(file.file, patientId, file.fileType);
      }
      
      setSelectedFiles([]);
      onUploadComplete();
      onClose();
    } catch (err) {
      console.error("Error in handleUpload:", err);
      setError(err instanceof Error ? err.message : "Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Files</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 mb-4 text-center">
            <input
              type="file"
              id="files"
              multiple
              accept="image/*,.stl,.ply"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="files"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Drag and drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supports: JPG, PNG, HEIC, STL, PLY
              </p>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden group"
                  >
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">
                          {file.format} file
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedFiles(prev => prev.filter(f => f.id !== file.id))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
