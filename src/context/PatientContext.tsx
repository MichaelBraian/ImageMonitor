import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Patient } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface PatientContextType {
  patients: Patient[];
  addPatient: (patient: Patient) => Patient;
  updatePatient: (patientId: string, updates: Partial<Patient>) => void;
  getPatient: (patientId: string) => Patient | undefined;
  searchPatients: (query: string) => Patient[];
  deletePatient: (patientId: string) => void;
  fetchPatients: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);

  const addPatient = async (patient: Patient) => {
    try {
      const docRef = await addDoc(collection(db, 'patients'), patient);
      console.log("Document written with ID: ", docRef.id);
      setPatients(prevPatients => [...prevPatients, { ...patient, id: docRef.id }]);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

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

  // Function to fetch patients from Firestore
  const fetchPatients = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'patients'));
      const fetchedPatients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Patient));
      setPatients(fetchedPatients);
    } catch (e) {
      console.error("Error fetching patients: ", e);
    }
  };

  // Call fetchPatients when the component mounts
  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <PatientContext.Provider value={{
      patients,
      addPatient,
      updatePatient,
      getPatient,
      searchPatients,
      deletePatient,
      fetchPatients
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
