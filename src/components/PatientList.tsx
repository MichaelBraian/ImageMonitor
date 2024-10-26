import React, { useEffect } from 'react';
import { usePatients } from '../context/PatientContext';

export const PatientList: React.FC = () => {
  const { patients, fetchPatients } = usePatients();

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  if (patients.length === 0) {
    return <div>No patients found. Add a new patient to get started.</div>;
  }

  return (
    <ul>
      {patients.map((patient) => (
        <li key={patient.id}>{patient.name}</li>
      ))}
    </ul>
  );
};
