import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, getDocs, updateDoc, doc, getDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

export interface Patient {
  id: string;
  name: string;
  lastImageDate: string;
  imageCount: number;
  userId: string;
  createdAt: string;
}

interface PatientContextType {
  patients: Patient[];
  fetchPatients: () => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<Patient>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  getPatient: (id: string) => Promise<Patient | null>;
  searchPatients: (query: string) => Patient[];
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);

  const fetchPatients = async () => {
    try {
      const q = query(collection(db, 'patients'), where('userId', '==', auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const fetchedPatients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Patient));
      setPatients(fetchedPatients);
    } catch (e) {
      console.error("Error fetching patients: ", e);
    }
  };

  const addPatient = async (patient: Omit<Patient, 'id' | 'userId' | 'createdAt'>): Promise<Patient> => {
    if (!user) {
      throw new Error('User must be authenticated to add a patient');
    }
    const newPatient = {
      ...patient,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      imageCount: 0,
      lastImageDate: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'patients'), newPatient);
    const addedPatient = { id: docRef.id, ...newPatient };
    return addedPatient;
  };

  const updatePatient = async (id: string, patientUpdate: Partial<Patient>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'patients', id), patientUpdate);
      setPatients(prev => prev.map(p => p.id === id ? { ...p, ...patientUpdate } : p));
    } catch (e) {
      console.error("Error updating patient: ", e);
      throw e;
    }
  };

  const getPatient = async (id: string): Promise<Patient | null> => {
    try {
      const docSnap = await getDoc(doc(db, 'patients', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Patient;
      } else {
        return null;
      }
    } catch (e) {
      console.error("Error getting patient: ", e);
      throw e;
    }
  };

  const searchPatients = (query: string): Patient[] => {
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <PatientContext.Provider value={{
      patients,
      fetchPatients,
      addPatient,
      updatePatient,
      getPatient,
      searchPatients,
    }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};
