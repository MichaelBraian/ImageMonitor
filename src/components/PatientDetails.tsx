import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import { usePatientFiles } from '../hooks/useFirestore';
import { DentalFile, Patient } from '../types';
import { ThreeDThumbnail } from './ThreeDThumbnail';

export function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>();
  const { getPatient } = usePatients();
  const { getPatientFiles } = usePatientFiles(patientId || '');
  const [files, setFiles] = useState<DentalFile[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (patientId) {
          const fetchedPatient = await getPatient(patientId);
          console.log('Fetched patient:', JSON.stringify(fetchedPatient, null, 2));
          setPatient(fetchedPatient);
          const fetchedFiles = await getPatientFiles();
          console.log('Fetched files:', JSON.stringify(fetchedFiles, null, 2));
          setFiles(fetchedFiles);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch patient data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [patientId, getPatient, getPatientFiles]);

  const filesByGroup = useMemo(() => {
    console.log('Creating filesByGroup. Files:', JSON.stringify(files, null, 2));
    const grouped = files.reduce<Record<string, DentalFile[]>>((acc, file) => {
      const groupId = file.group || 'Unsorted';
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(file);
      return acc;
    }, {});
    console.log('Grouped files:', JSON.stringify(grouped, null, 2));
    return grouped;
  }, [files]);

  const renderFile = (file: DentalFile) => {
    console.log('Rendering file:', JSON.stringify(file, null, 2));
    if (file.fileType === '3D') {
      return (
        <div className="w-full h-40 flex items-center justify-center">
          <ThreeDThumbnail fileUrl={file.url} fileFormat={file.format as 'STL' | 'PLY'} />
        </div>
      );
    } else {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="w-full h-40 object-cover"
        />
      );
    }
  };

  const handleFileClick = (file: DentalFile) => {
    console.log('Clicked file:', file);
    console.log('Navigating to editor with file ID:', file.id);
    navigate(`/editor/${file.id}`);
  };

  console.log('Rendering PatientDetails. Patient:', JSON.stringify(patient, null, 2));
  console.log('FilesByGroup:', JSON.stringify(filesByGroup, null, 2));

  if (isLoading) return <div className="text-gray-800 dark:text-gray-200">Loading...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;
  if (!patient) return <div className="text-gray-800 dark:text-gray-200">Patient not found</div>;

  return (
    <div className="p-4 bg-white dark:bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {patient.name}'s Files
      </h2>
      {Object.keys(filesByGroup).length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No files uploaded yet.</p>
      ) : (
        Object.entries(filesByGroup).map(([groupId, groupFiles]) => (
          <div key={groupId} className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              {groupId}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-200" 
                  onClick={() => handleFileClick(file)}
                >
                  {renderFile(file)}
                  <div className="p-2">
                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {file.type} - {new Date(file.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
