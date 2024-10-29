import React, { createContext, useContext, useState, useCallback } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase/config';
import { DentalFile, FileType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface FileContextType {
  uploadFile: (file: File, patientId: string, type: FileType) => Promise<DentalFile>;
  getPatientFiles: (patientId: string) => Promise<DentalFile[]>;
  deleteFile: (fileId: string, patientId: string) => Promise<void>;
  updateFile: (fileId: string, updates: Partial<DentalFile>) => Promise<void>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const uploadFile = async (file: File, patientId: string, type: FileType): Promise<DentalFile> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be authenticated to upload files');

    // Determine file format
    const format = file.name.toLowerCase().endsWith('.stl') ? 'STL' :
                  file.name.toLowerCase().endsWith('.ply') ? 'PLY' : '2D';

    // Create appropriate storage path based on file type
    const fileId = uuidv4();
    const folder = type === '2D' ? 'images' : 'models';
    const storagePath = `patients/${patientId}/${folder}/${fileId}`;

    try {
      // Upload file to Storage with metadata
      const storageRef = ref(storage, storagePath);
      const metadata = {
        customMetadata: {
          dentistId: user.uid,
          patientId: patientId
        }
      };

      await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(storageRef);

      // Create Firestore document
      const fileData: Omit<DentalFile, 'id'> = {
        url,
        name: file.name,
        type: 'Unsorted',
        format,
        userId: user.uid,
        dentistId: user.uid,
        patientId,
        createdAt: new Date().toISOString(),
        group: 'Unsorted',
        date: new Date().toISOString(),
        fileType: type
      };

      const collectionPath = `patients/${patientId}/${folder}`;
      const docRef = await addDoc(collection(db, collectionPath), fileData);

      return { id: docRef.id, ...fileData };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  };

  const getPatientFiles = async (patientId: string): Promise<DentalFile[]> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be authenticated');

    try {
      // Get both images and models
      const imagesQuery = query(collection(db, `patients/${patientId}/images`));
      const modelsQuery = query(collection(db, `patients/${patientId}/models`));

      const [imagesSnapshot, modelsSnapshot] = await Promise.all([
        getDocs(imagesQuery),
        getDocs(modelsQuery)
      ]);

      const images = imagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DentalFile));
      const models = modelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DentalFile));

      return [...images, ...models];
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  };

  const deleteFile = async (fileId: string, patientId: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be authenticated');

    // Get file details to determine type
    const file = await getDoc(doc(db, `patients/${patientId}/files/${fileId}`));
    if (!file.exists()) throw new Error('File not found');

    const fileData = file.data() as DentalFile;
    const isImage = fileData.fileType === '2D';

    // Delete from Storage
    const storagePath = isImage 
      ? `patients/${patientId}/images/${fileId}`
      : `patients/${patientId}/models/${fileId}`;
    
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);

    // Delete from Firestore
    const collectionPath = isImage ? 'images' : 'models';
    await deleteDoc(doc(db, `patients/${patientId}/${collectionPath}/${fileId}`));
  };

  const updateFile = async (fileId: string, updates: Partial<DentalFile>): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be authenticated');

    const { patientId, fileType } = updates;
    if (!patientId) throw new Error('PatientId is required');

    const collectionPath = fileType === '2D' ? 'images' : 'models';
    await updateDoc(doc(db, `patients/${patientId}/${collectionPath}/${fileId}`), updates);
  };

  return (
    <FileContext.Provider value={{
      uploadFile,
      getPatientFiles,
      deleteFile,
      updateFile,
    }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within FileProvider');
  }
  return context;
};
