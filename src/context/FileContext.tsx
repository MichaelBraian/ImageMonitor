import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DentalFile, ImageCategory, ImageGroup } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { db, storage, auth } from '../firebase/config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface FileContextType {
  files: DentalFile[];
  getPatientFiles: (patientId: string) => Promise<DentalFile[]>;
  getFile: (fileId: string) => Promise<DentalFile | undefined>;
  addFile: (file: DentalFile) => Promise<void>;
  updateFileGroup: (fileId: string, group: string) => Promise<void>;
  updateFileCategory: (fileId: string, category: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  updateFile: (fileId: string, updates: Partial<DentalFile>) => Promise<void>;
  refreshPatientFiles: (patientId: string) => Promise<DentalFile[]>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<DentalFile[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const querySnapshot = await getDocs(collection(db, 'files'));
      const fetchedFiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DentalFile));
      setFiles(fetchedFiles);
    };
    fetchFiles();
  }, []);

  const getPatientFiles = useCallback(async (patientId: string) => {
    const q = query(collection(db, 'files'), where('patientId', '==', patientId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DentalFile));
  }, []);

  const getFile = useCallback(async (fileId: string) => {
    try {
      console.log('Fetching file from Firestore with ID:', fileId);
      const docRef = doc(db, 'files', fileId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fileData = { id: docSnap.id, ...docSnap.data() } as DentalFile;
        console.log('File data from Firestore:', fileData);
        return fileData;
      } else {
        console.log('No such document!');
        return undefined;
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  }, []);

  const addFile = useCallback(async (file: Omit<DentalFile, 'id'>) => {
    const docRef = await addDoc(collection(db, 'files'), file);
    const newFile = { ...file, id: docRef.id };
    setFiles(prev => [...prev, newFile]);
    return newFile;
  }, []);

  const updateFileGroup = useCallback(async (fileId: string, group: string) => {
    const docRef = doc(db, 'files', fileId);
    await updateDoc(docRef, { group });
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, group } : f));
  }, []);

  const updateFileCategory = useCallback(async (fileId: string, category: string) => {
    const docRef = doc(db, 'files', fileId);
    await updateDoc(docRef, { type: category });
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, type: category } : f));
  }, []);

  const deleteFile = useCallback(async (fileId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be authenticated to delete files');

    await deleteDoc(doc(db, 'files', fileId));
    const storageRef = ref(storage, `files/${user.uid}/${fileId}`);
    await deleteObject(storageRef);
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const updateFile = useCallback(async (fileId: string, updates: Partial<DentalFile>) => {
    const docRef = doc(db, 'files', fileId);
    await updateDoc(docRef, updates);
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, ...updates } : f));
  }, []);

  const refreshPatientFiles = useCallback(async (patientId: string) => {
    try {
      const q = query(collection(db, 'files'), where('patientId', '==', patientId));
      const querySnapshot = await getDocs(q);
      const fetchedFiles: DentalFile[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DentalFile));
      setFiles(prevFiles => {
        const updatedFiles = prevFiles.filter(f => f.patientId !== patientId).concat(fetchedFiles);
        return updatedFiles;
      });
      return fetchedFiles;
    } catch (error) {
      console.error('Error refreshing patient files:', error);
      return [];
    }
  }, []);

  const uploadFile = async (file: File, patientId: string, category: string) => {
    // ... (existing upload logic)

    // After successful upload and document creation
    await refreshPatientFiles(patientId);
  };

  return (
    <FileContext.Provider value={{
      files,
      getPatientFiles,
      getFile,
      addFile,
      updateFileGroup,
      updateFileCategory,
      deleteFile,
      updateFile,
      refreshPatientFiles,
    }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}
