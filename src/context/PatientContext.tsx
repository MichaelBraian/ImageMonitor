import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { Patient } from '../types';

interface PatientContextType {
  patients: Patient[];
  fetchPatients: () => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id' | 'userId' | 'dentistId' | 'createdAt'>) => Promise<Patient>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  getPatient: (id: string) => Promise<Patient | null>;
  searchPatients: (query: string) => Patient[];
  deletePatient: (id: string) => Promise<void>;
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
    // Query patients where dentistId matches the current user's ID
    const q = query(collection(db, 'patients'), where('dentistId', '==', user.uid));
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

  const addPatient = useCallback(async (patient: Omit<Patient, 'id' | 'userId' | 'dentistId' | 'createdAt'>): Promise<Patient> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to add a patient');
    }

    const newPatient = {
      ...patient,
      userId: user.uid,
      dentistId: user.uid, // This is crucial for the security rules
      createdAt: new Date().toISOString(),
      imageCount: 0,
      lastImageDate: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'patients'), newPatient);
      const addedPatient = { id: docRef.id, ...newPatient };
      setPatients(prev => [...prev, addedPatient]);
      return addedPatient;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw new Error('Failed to add patient. Please try again.');
    }
  }, []);

  const updatePatient = async (id: string, updates: Partial<Patient>): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be authenticated');

    // Ensure we can't modify the dentistId
    const { dentistId, ...safeUpdates } = updates;
    
    await updateDoc(doc(db, 'patients', id), safeUpdates);
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...safeUpdates } : p));
  };

  const getPatient = async (id: string): Promise<Patient | null> => {
    const docRef = doc(db, 'patients', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        lastImageDate: data.lastImageDate,
        imageCount: data.imageCount,
        userId: data.userId,
        dentistId: data.dentistId,
        createdAt: data.createdAt,
        profileImage: data.profileImage
      };
    }
    return null;
  };

  const searchPatients = (query: string): Patient[] => {
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const deletePatient = async (id: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be authenticated');

    await deleteDoc(doc(db, 'patients', id));
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PatientContext.Provider value={{
      patients,
      fetchPatients,
      addPatient,
      updatePatient,
      getPatient,
      searchPatients,
      deletePatient,
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
