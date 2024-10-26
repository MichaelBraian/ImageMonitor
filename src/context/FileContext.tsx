import React, { createContext, useContext, useState, useCallback } from 'react';
import { DentalFile, ImageCategory, ImageGroup, FileType } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';

interface FileContextType {
  files: DentalFile[];
  getPatientFiles: (patientId: string) => DentalFile[];
  getFile: (fileId: string) => DentalFile | undefined;
  addFile: (file: Omit<DentalFile, 'id'>) => DentalFile;
  updateFileGroup: (fileId: string, group: ImageGroup) => void;
  updateFileCategory: (fileId: string, category: ImageCategory) => void;
  deleteFile: (fileId: string) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<DentalFile[]>([]);

  const getPatientFiles = useCallback((patientId: string) => {
    return files.filter(file => file.patientId === patientId);
  }, [files]);

  const getFile = useCallback((fileId: string) => {
    return files.find(file => file.id === fileId);
  }, [files]);

  const addFile = useCallback((file: Omit<DentalFile, 'id'>) => {
    console.log("Adding file to context:", file);
    const newFile = { ...file, id: uuidv4() };
    setFiles(prev => {
      console.log("Previous files:", prev);
      console.log("New files state:", [...prev, newFile]);
      return [...prev, newFile];
    });
    return newFile;
  }, []);

  const updateFileGroup = useCallback((fileId: string, group: ImageGroup) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, group } : file
    ));
  }, []);

  const updateFileCategory = useCallback((fileId: string, category: ImageCategory) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, type: category } : file
    ));
  }, []);

  const deleteFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
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
