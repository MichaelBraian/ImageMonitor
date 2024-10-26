import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ImageUploadModal } from './ImageUploadModal';
import { useParams } from 'react-router-dom';
import { usePatients } from './usePatients';

interface PatientDetailsProps {
  patientId: string;
}

interface File {
  id: string;
  name: string;
  url: string;
  type: '2D' | '3D';
}

export function PatientDetails({ patientId }: PatientDetailsProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { patientId: patientIdParam } = useParams<{ patientId: string }>();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { getPatient } = usePatients();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchPatientFiles = async () => {
      try {
        const patientDoc = await getDoc(doc(db, 'patients', patientId));
        if (patientDoc.exists()) {
          setFiles(patientDoc.data().files || []);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching patient files:', error);
        setError('Failed to fetch patient files');
        setLoading(false);
      }
    };

    fetchPatientFiles();
  }, [patientId]);

  useEffect(() => {
    const fetchPatient = async () => {
      if (patientId) {
        const fetchedPatient = await getPatient(patientId);
        setPatient(fetchedPatient);
        console.log('Fetched patient:', fetchedPatient);
      }
    };
    fetchPatient();
  }, [patientId, getPatient]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Patient Files</h2>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              {file.type === '2D' ? (
                <img src={file.url} alt={file.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              ) : (
                <div>{file.name} (3D file)</div>
              )}
            </li>
          ))}
        </ul>
      )}
      <ImageUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        patientId={patientId || ''} // Ensure patientId is always a string
      />
    </div>
  );
}
