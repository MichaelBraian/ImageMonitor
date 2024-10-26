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
  updateFileGroup: (fileId: string, group: ImageGroup) => Promise<void>;
  updateFileCategory: (fileId: string, category: ImageCategory) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  updateFile: (fileId: string, updates: Partial<DentalFile>) => Promise<void>;
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
    const docRef = doc(db, 'files', fileId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as DentalFile : undefined;
  }, []);

  const addFile = useCallback(async (file: DentalFile) => {
    const docRef = await addDoc(collection(db, 'files'), file);
    setFiles(prev => [...prev, { ...file, id: docRef.id }]);
  }, []);

  const updateFileGroup = useCallback(async (fileId: string, group: ImageGroup) => {
    const docRef = doc(db, 'files', fileId);
    await updateDoc(docRef, { group });
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, group } : f));
  }, []);

  const updateFileCategory = useCallback(async (fileId: string, category: ImageCategory) => {
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
