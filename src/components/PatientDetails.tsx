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
    console.log('Clicked file:', file); // Added logging
    console.log('Navigating to editor with file ID:', file.id);
    navigate(`/editor/${file.id}`);
  };

  console.log('Rendering PatientDetails. Patient:', JSON.stringify(patient, null, 2));
  console.log('FilesByGroup:', JSON.stringify(filesByGroup, null, 2));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{patient.name}'s Files</h2>
      {Object.keys(filesByGroup).length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        Object.entries(filesByGroup).map(([groupId, groupFiles]) => (
          <div key={groupId} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{groupId}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupFiles.map((file) => (
                <div key={file.id} className="border rounded-lg overflow-hidden">
                  {renderFile(file)}
                  <div className="p-2">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.type} - {new Date(file.date).toLocaleDateString()}</p>
                    <Link to={`/editor/${file.id}`} className="text-blue-500 hover:underline">
                      Edit
                    </Link>
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
