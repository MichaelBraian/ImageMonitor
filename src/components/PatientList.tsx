import React, { useEffect } from 'react';
import { usePatients } from '../context/PatientContext';
import { useAsync } from '../hooks/useAsync';

export const PatientList: React.FC = () => {
  const { patients, fetchPatients } = usePatients();
  const { isLoading, error, execute } = useAsync();

  useEffect(() => {
    execute(fetchPatients);
  }, [execute, fetchPatients]);

  if (isLoading) return <div>Loading patients...</div>;
  if (error) return <div>Error: {error}</div>;
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
