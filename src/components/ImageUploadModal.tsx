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
        const fileType = file.type.startsWith('image/') ? '2D' : '3D';
        const format = file.name.toLowerCase().endsWith('.stl') ? 'STL' :
                      file.name.toLowerCase().endsWith('.ply') ? 'PLY' : '2D';
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl">
        {/* ... rest of your modal UI ... */}
      </div>
    </div>
  );
}
