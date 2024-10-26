import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface PatientDetailsProps {
  patientId: string;
}

export function PatientDetails({ patientId }: PatientDetailsProps) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    </div>
  );
}
