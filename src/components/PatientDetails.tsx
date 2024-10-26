import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ImageUploadModal } from './ImageUploadModal';
import { useParams } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import { Patient, DentalFile } from '../types';

export function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>();
  const [files, setFiles] = useState<DentalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { getPatient } = usePatients();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetchPatientAndFiles = async () => {
      if (!patientId) {
        setError('Patient ID is missing');
        setLoading(false);
        return;
      }

      try {
        const fetchedPatient = await getPatient(patientId);
        if (fetchedPatient) {
          setPatient(fetchedPatient);
          console.log('Fetched patient:', fetchedPatient);

          const patientDoc = await getDoc(doc(db, 'patients', patientId));
          if (patientDoc.exists()) {
            setFiles(patientDoc.data().files || []);
          }
        } else {
          setError('Patient not found');
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setError('Failed to fetch patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientAndFiles();
  }, [patientId, getPatient]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div>
      <h2>{patient.name}'s Files</h2>
      <button onClick={() => setIsUploadModalOpen(true)}>Upload Files</button>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              {file.fileType === '2D' ? (
                <img src={file.url} alt={file.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
              ) : (
                <div>{file.name} (3D file)</div>
              )}
            </li>
          ))}
        </ul>
      )}
      {isUploadModalOpen && patientId && (
        <ImageUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          patientId={patientId}
        />
      )}
    </div>
  );
}
