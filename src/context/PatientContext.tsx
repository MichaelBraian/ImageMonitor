import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { Patient } from '../types';

interface PatientContextType {
  patients: Patient[];
  fetchPatients: () => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id' | 'userId' | 'createdAt'>) => Promise<Patient>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  getPatient: (id: string) => Promise<Patient | null>;
  searchPatients: (query: string) => Patient[];
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);

  const fetchPatients = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    const q = query(collection(db, 'patients'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    const fetchedPatients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
    setPatients(fetchedPatients);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchPatients();
      } else {
        setPatients([]);
      }
    });

    return () => unsubscribe();
  }, [fetchPatients]);

  const addPatient = useCallback(async (patient: Omit<Patient, 'id' | 'userId' | 'createdAt'>): Promise<Patient> => {
    const user = auth.currentUser;
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
    setPatients(prev => [...prev, addedPatient]);
    return addedPatient;
  }, []);

  const updatePatient = async (id: string, patientUpdate: Partial<Patient>): Promise<void> => {
    await updateDoc(doc(db, 'patients', id), patientUpdate);
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...patientUpdate } : p));
  };

  const getPatient = async (id: string): Promise<Patient | null> => {
    const docRef = doc(db, 'patients', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Raw patient data:', JSON.stringify(data, null, 2));
      return {
        id: docSnap.id,
        name: data.name || '',
        lastImageDate: data.lastImageDate || '',
        imageCount: data.imageCount || 0,
        userId: data.userId || '',
        createdAt: data.createdAt || ''
      };
    }
    return null;
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
