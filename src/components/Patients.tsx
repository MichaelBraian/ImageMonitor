import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '../context/PatientContext';
import { Patient } from '../types';

export function Patients() {
  const navigate = useNavigate();
  const { patients, fetchPatients } = usePatients();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      await fetchPatients();
      setLoading(false);
    };
    loadPatients();
  }, [fetchPatients]);

  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  if (loading) return <div>Loading patients...</div>;

  return (
    <div>
      <h2>Patients</h2>
      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul>
          {patients.map((patient: Patient) => (
            <li key={patient.id} onClick={() => handlePatientClick(patient.id)}>
              {patient.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
