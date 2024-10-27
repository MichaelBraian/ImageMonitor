import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import { usePatientFiles } from '../hooks/useFirestore';
import { DentalFile, Patient } from '../types';

export function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>();
  const { getPatient } = usePatients();
  const { getPatientFiles } = usePatientFiles(patientId || '');
  const [files, setFiles] = useState<DentalFile[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (patientId) {
          const fetchedPatient = await getPatient(patientId);
          setPatient(fetchedPatient);
          const fetchedFiles = await getPatientFiles();
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
    return files.reduce<Record<string, DentalFile[]>>((acc, file) => {
      const groupId = file.group || 'Unsorted';
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(file);
      return acc;
    }, {});
  }, [files]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div>
      <h2>{patient.name}'s Files</h2>
      {Object.entries(filesByGroup).map(([groupId, groupFiles]) => (
        <div key={groupId}>
          <h3>{groupId}</h3>
          <ul>
            {groupFiles.map((file) => (
              <li key={file.id}>{file.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
