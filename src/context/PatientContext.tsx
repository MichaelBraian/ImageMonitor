import React, { createContext, useContext, useState, useCallback } from 'react';
import { Patient } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'imageCount'>) => Patient;
  updatePatient: (patientId: string, updates: Partial<Patient>) => void;
  getPatient: (patientId: string) => Patient | undefined;
  searchPatients: (query: string) => Patient[];
  deletePatient: (patientId: string) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
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

  return (
    <PatientContext.Provider value={{
      patients,
      addPatient,
      updatePatient,
      getPatient,
      searchPatients,
      deletePatient,
    }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
}