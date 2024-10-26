import { useState, useCallback } from 'react';
import { Patient } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);

  const addPatient = useCallback((patient: Omit<Patient, 'id' | 'imageCount'>) => {
    const newPatient: Patient = {
      ...patient,
      id: uuidv4(),
      imageCount: 0,
      lastImageDate: new Date().toISOString(),
      profileImage: null
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  }, []);

  const updatePatient = useCallback((patientId: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(patient => 
      patient.id === patientId ? { ...patient, ...updates } : patient
    ));
  }, []);

  const getPatient = useCallback((patientId: string) => {
    return patients.find(patient => patient.id === patientId);
  }, [patients]);

  const searchPatients = useCallback((query: string) => {
    if (!query) return patients;
    const lowercaseQuery = query.toLowerCase();
    return patients.filter(
      patient => patient.name.toLowerCase().includes(lowercaseQuery)
    );
  }, [patients]);

  const deletePatient = useCallback((patientId: string) => {
    setPatients(prev => prev.filter(patient => patient.id !== patientId));
  }, []);

  return {
    patients,
    addPatient,
    updatePatient,
    getPatient,
    searchPatients,
    deletePatient,
  };
}