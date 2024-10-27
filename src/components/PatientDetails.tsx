import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import { usePatientFiles } from '../hooks/useFirestore';
import { DentalFile, ImageGroup } from '../types';

export function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>();
  const { getPatient } = usePatients();
  const { data: files, isLoading, error } = usePatientFiles(patientId || '');
  const patient = patientId ? getPatient(patientId) : null;

  const filesByGroup = useMemo(() => {
    if (!files) return {};

    return files.reduce<Record<string, DentalFile[]>>((acc, file) => {
      const groupId = file.group?.id || 'Unsorted';
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(file);
      return acc;
    }, {});
  }, [files]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
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
