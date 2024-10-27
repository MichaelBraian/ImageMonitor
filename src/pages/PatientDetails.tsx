import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import { useFiles } from '../context/FileContext';
import { 
  Edit,
  Trash2,
  Plus,
  Grid,
  Image as ImageIcon,
  FileType,
  User
} from 'lucide-react';
import { ImageUploadModal } from '../components/ImageUploadModal';
import { EditPatientModal } from '../components/EditPatientModal';
import { DentalFile, ImageGroup } from '../types';
import { ThreeDThumbnail } from '../components/ThreeDThumbnail';
import { Editor2D } from '../components/Editor2D';
import { Patient } from '../types';

export function PatientDetails() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { getPatient, updatePatient, deletePatient } = usePatients();
  const { getPatientFiles, refreshPatientFiles, updateFileImage } = useFiles();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [files, setFiles] = useState<DentalFile[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<DentalFile | null>(null);

  const fetchPatientFiles = useCallback(async () => {
    if (patientId) {
      const fetchedFiles = await refreshPatientFiles(patientId);
      setFiles(fetchedFiles);
    }
  }, [patientId, refreshPatientFiles]);

  useEffect(() => {
    fetchPatientFiles();
  }, [fetchPatientFiles]);

  useEffect(() => {
    const fetchPatient = async () => {
      if (patientId) {
        const patientData = await getPatient(patientId);
        setPatient(patientData);
      }
    };
    fetchPatient();
  }, [patientId, getPatient]);

  const handleFileClick = (file: DentalFile) => {
    if (file.fileType === '2D') {
      console.log('Opening editor with file:', {
        id: file.id,
        url: file.url,
        type: file.type
      });
      setEditingFile(file);
      setIsEditing(true);
    } else {
      navigate(`/editor/${file.id}`);
    }
  };

  const handleDeletePatient = () => {
    if (patientId) {
      deletePatient(patientId);
      navigate('/patients');
    }
  };

  const handleFileUpload = async () => {
    await fetchPatientFiles();
  };

  // Modified filesByGroup implementation
  const filesByGroup = useMemo(() => {
    // Initialize with empty arrays
    const groups = {
      'Before': [] as DentalFile[],
      'After': [] as DentalFile[],
      'Unsorted': [] as DentalFile[]
    };

    // If there are no files, return the empty groups
    if (!files || files.length === 0) {
      return groups;
    }

    // Process each file
    files.forEach(file => {
      if (!file) return; // Skip if file is undefined
      
      // Ensure group is one of our valid types
      const validGroup = (file.group === 'Before' || file.group === 'After') 
        ? file.group 
        : 'Unsorted';
      
      if (!groups[validGroup]) {
        groups[validGroup] = [];
      }
      
      groups[validGroup].push(file);
    });

    return groups;
  }, [files]);

  // Early return for loading state
  if (!patient) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  function renderThumbnail(file: DentalFile) {
    if (file.fileType === '3D') {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <ThreeDThumbnail
            fileUrl={file.url}
            fileFormat={file.format as 'STL' | 'PLY'}
          />
        </div>
      );
    }
    return null;
  }

  if (isEditing && editingFile) {
    return (
      <Editor2D
        imageUrl={editingFile.url}
        onSave={async (editedImage) => {
          try {
            // Convert base64 to blob
            const response = await fetch(editedImage);
            const blob = await response.blob();
            
            // Update the file
            await updateFileImage(editingFile.id, blob);
            
            // Refresh the files list
            await fetchPatientFiles();
            
            // Close editor
            setIsEditing(false);
            setEditingFile(null);
          } catch (error) {
            console.error('Error saving edited image:', error);
          }
        }}
        onClose={() => {
          setIsEditing(false);
          setEditingFile(null);
        }}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {patient.profileImage ? (
              <img
                src={patient.profileImage}
                alt={patient.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {patient.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date(patient.lastImageDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button 
            onClick={handleDeletePatient}
            className="flex items-center px-4 py-2 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Files ({files?.length || 0})
          </h2>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Files
          </button>
        </div>

        {Object.entries(filesByGroup).map(([groupId, groupFiles]) => (
          <div key={groupId} className="mb-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                <Grid className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-900 dark:text-white font-medium">
                  {groupId}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({groupFiles.length})
                </span>
              </div>
            </div>
            {groupFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                {groupFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:opacity-75 transition-opacity cursor-pointer relative group"
                  >
                    {file.fileType === '2D' ? (
                      <img
                        src={file.url}
                        alt={`${file.type} ${file.group}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.png'; // Add a placeholder image
                        }}
                      />
                    ) : (
                      renderThumbnail(file)
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                      <div className="flex items-center">
                        {file.fileType === '2D' ? (
                          <ImageIcon className="w-4 h-4 text-white mr-1" />
                        ) : (
                          <FileType className="w-4 h-4 text-white mr-1" />
                        )}
                        <span className="text-xs text-white">
                          {file.type} - {new Date(file.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {(!files || files.length === 0) && (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No files available</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Click "Add Files" to upload images or 3D models
            </p>
          </div>
        )}
      </div>

      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleFileUpload}
        patientId={patientId || ''}
      />

      <EditPatientModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        patient={patient}
        onUpdate={updatePatient}
      />
    </div>
  );
}
