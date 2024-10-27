import React, { useState, useEffect, useMemo } from 'react';
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
import { DentalFile, ImageGroup } from '../data/mockData';
import { ThreeDThumbnail } from '../components/ThreeDThumbnail';

export function PatientDetails() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { getPatient, updatePatient, deletePatient } = usePatients();
  const { getPatientFiles } = useFiles();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [files, setFiles] = useState<DentalFile[]>([]);

  const patient = patientId ? getPatient(patientId) : null;

  useEffect(() => {
    if (patientId) {
      getPatientFiles(patientId).then(setFiles);
    }
  }, [patientId, getPatientFiles]);

  const handleFileClick = (file: DentalFile) => {
    navigate(`/editor/${file.id}`);
  };

  const handleDeletePatient = () => {
    if (patientId) {
      deletePatient(patientId);
      navigate('/patients');
    }
  };

  if (!patient) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Patient not found</h2>
          <Link 
            to="/patients" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to patients list
          </Link>
        </div>
      </div>
    );
  }

  // Deduplicate files based on their ID
  const uniqueFiles = useMemo(() => {
    const uniqueMap = new Map<string, DentalFile>();
    files.forEach(file => {
      if (!uniqueMap.has(file.id)) {
        uniqueMap.set(file.id, file);
      }
    });
    return Array.from(uniqueMap.values());
  }, [files]);

  console.log("Unique files after deduplication:", uniqueFiles);

  // Group files by category and group
  const filesByGroup = useMemo(() => {
    const groups = {
      Before: [],
      After: [],
      Unsorted: []
    };

    uniqueFiles.forEach(file => {
      const groupId = file.group?.id || 'unsorted';
      const validGroup = groups.hasOwnProperty(groupId) ? groupId : 'Unsorted';
      if (!groups[validGroup]) {
        groups[validGroup] = [];
      }
      groups[validGroup].push(file);
    });

    return groups;
  }, [uniqueFiles]);

  const groupedFiles = useMemo(() => {
    const groups: Record<string, DentalFile[]> = {};
    uniqueFiles.forEach(file => {
      const key = `${file.type}_${file.format}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(file);
    });
    console.log("Files grouped by type and format:", groups);
    return groups;
  }, [uniqueFiles]);

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
            Files ({uniqueFiles.length})
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
          groupFiles.length > 0 && (
            <div key={groupId} className="mb-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <Grid className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {groupId.charAt(0).toUpperCase() + groupId.slice(1)}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({groupFiles.length})
                  </span>
                </div>
              </div>
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
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {renderThumbnail(file)}
                      </div>
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
            </div>
          )
        ))}

        {uniqueFiles.length === 0 && (
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
