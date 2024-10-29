import React, { createContext, useContext, useState, useCallback } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../firebase/config';
import { DentalFile, FileType } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface FileContextType {
  uploadFile: (file: File, patientId: string, type: FileType) => Promise<DentalFile>;
  getPatientFiles: (patientId: string) => Promise<DentalFile[]>;
  deleteFile: (fileId: string, patientId: string) => Promise<void>;
  updateFile: (fileId: string, updates: Partial<DentalFile>) => Promise<void>;
  updateFileImage: (fileId: string, blob: Blob) => Promise<void>;
  refreshPatientFiles: (patientId: string) => Promise<DentalFile[]>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const uploadFile = async (file: File, patientId: string, type: FileType): Promise<DentalFile> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User must be authenticated to upload files');
      }

      // Generate unique ID for the file
      const fileId = uuidv4();
      
      // Determine file format and folder
      const format = file.name.toLowerCase().endsWith('.stl') ? 'STL' :
                    file.name.toLowerCase().endsWith('.ply') ? 'PLY' : '2D';
      const folder = type === '2D' ? 'images' : 'models';
      
      // Create storage path
      const storagePath = `patients/${patientId}/${folder}/${fileId}`;
      
      // Create storage reference with metadata
      const storageRef = ref(storage, storagePath);
      const metadata = {
        contentType: file.type,
        customMetadata: {
          dentistId: user.uid,
          patientId: patientId,
          fileType: type,
          format: format
        }
      };

      // Upload to Storage
      console.log('Uploading to storage:', { storagePath, metadata });
      const uploadResult = await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(uploadResult.ref);

      // Prepare file data
      const fileData: DentalFile = {
        id: fileId,
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

      try {
        // Save to Firestore with a different path structure
        console.log('Saving to Firestore:', { patientId, fileId, fileData });
        await setDoc(
          doc(db, 'patients', patientId, folder, fileId), 
          fileData
        );
        
        return fileData;
      } catch (firestoreError) {
        // If Firestore save fails, delete the uploaded file from storage
        console.error('Firestore save failed, cleaning up storage:', firestoreError);
        await deleteObject(storageRef);
        throw firestoreError;
      }
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
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

  const updateFileImage = async (fileId: string, blob: Blob): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be authenticated');

    try {
      console.log('Attempting to update file:', {
        fileId,
        userId: user.uid,
        blobSize: blob.size
      });

      // Get the original file document first to get the patientId
      const fileRef = doc(db, 'patients', user.uid, 'images', fileId);
      const fileDoc = await getDoc(fileRef);
      
      if (!fileDoc.exists()) {
        throw new Error('File not found');
      }

      const fileData = fileDoc.data() as DentalFile;
      const patientId = fileData.patientId;

      // Upload to storage with correct path
      const storagePath = `patients/${patientId}/images/${fileId}`;
      const storageRef = ref(storage, storagePath);
      const metadata = {
        contentType: 'image/jpeg'
      };

      // Upload new image
      console.log('Uploading edited image to:', storagePath);
      await uploadBytes(storageRef, blob, metadata);
      const newUrl = await getDownloadURL(storageRef);

      // Update the file document with new URL
      console.log('Updating Firestore document with new URL');
      await updateDoc(fileRef, {
        url: newUrl,
        updatedAt: new Date().toISOString()
      });

      console.log('File update completed successfully');
    } catch (error) {
      console.error('Detailed error in updateFileImage:', {
        error,
        fileId,
        userId: user?.uid
      });
      throw error;
    }
  };

  const refreshPatientFiles = async (patientId: string): Promise<DentalFile[]> => {
    return await getPatientFiles(patientId);
  };

  return (
    <FileContext.Provider value={{
      uploadFile,
      getPatientFiles,
      deleteFile,
      updateFile,
      updateFileImage,
      refreshPatientFiles
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
