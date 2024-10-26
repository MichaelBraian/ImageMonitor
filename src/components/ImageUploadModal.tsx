import React, { useState, useCallback, useEffect } from 'react';
import { X, Upload, ImageIcon, Loader2, FileType } from 'lucide-react';
import { useFiles } from '../context/FileContext';
import { usePatients } from '../context/PatientContext';
import { FileType as FileTypeEnum } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db, auth } from '../firebase/config';
import { collection, addDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { DentalFile } from '../types';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

interface PreviewFile {
  id: string;
  file: File;
  preview?: string;
  fileType: FileTypeEnum;
  format: '2D' | 'PLY' | 'STL';
}

export function ImageUploadModal({ isOpen, onClose, patientId }: ImageUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { addFile } = useFiles();
  const { updatePatient } = usePatients();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Instead of setCurrentUser, we're using the user from useAuth
      if (currentUser) {
        console.log('User is signed in:', currentUser.uid);
      } else {
        console.log('No user is signed in.');
      }
    });

    return () => unsubscribe();
  }, []);

  const getFileFormat = (file: File): '2D' | 'PLY' | 'STL' => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'ply':
        return 'PLY';
      case 'stl':
        return 'STL';
      default:
        return '2D';
    }
  };

  const createObjectURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    try {
      const newFiles = await Promise.all(files.map(async (file) => {
        console.log("Processing file:", file);
        const fileType = file.type.startsWith('image/') ? '2D' : '3D';
        const format = getFileFormat(file);
        const preview = fileType === '2D' ? await createObjectURL(file) : undefined;
        return {
          id: uuidv4(),
          file,
          preview,
          fileType: fileType as FileTypeEnum,
          format,
        };
      }));
      console.log("Processed files:", newFiles);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    } catch (err) {
      console.error("Error processing files:", err);
      setError("Failed to process selected files. Please try again.");
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
        const fileId = uuidv4();
        const storageRef = ref(storage, `files/${user.uid}/${fileId}`);
        
        const snapshot = await uploadBytes(storageRef, file.file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        const fileData: DentalFile = {
          id: fileId,
          url: downloadURL,
          name: file.file.name,
          type: file.fileType,
          format: file.format,
          userId: user.uid,
          patientId,
          createdAt: new Date().toISOString(),
          group: 'Unsorted',
          date: new Date().toISOString(),
          fileType: file.fileType === '2D' ? '2D' : '3D'
        };

        await addDoc(collection(db, 'files'), fileData);
        await addFile(fileData);
      }

      await updatePatient(patientId, {
        imageCount: selectedFiles.length,
        lastImageDate: new Date().toISOString()
      });

      setSelectedFiles([]);
      onClose();
    } catch (err) {
      console.error("Error in handleUpload:", err);
      setError("An error occurred while uploading files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(p => p.id !== id));
  };

  const handleFileUpload = async (file: File) => {
    try {
      const storageRef = ref(storage, `images/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('File uploaded successfully:', downloadURL);
      // Update your state or perform any other actions with the downloadURL
    } catch (error) {
      console.error('Error uploading file:', error);
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
                    {file.fileType === '2D' ? (
                      <img
                        src={file.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <FileType className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          {file.file.name}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
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

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

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
