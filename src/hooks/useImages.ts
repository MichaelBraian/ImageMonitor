import { useState, useCallback } from 'react';
import { mockFiles, DentalFile, ImageCategory, ImageGroup } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';

export function useImages() {
  const [files, setFiles] = useState<DentalFile[]>(mockFiles);

  const getPatientImages = useCallback((patientId: string) => {
    return files.filter(file => file.patientId === patientId);
  }, [files]);

  const getImage = useCallback((imageId: string) => {
    return files.find(file => file.id === imageId);
  }, [files]);

  const addFile = useCallback((file: Omit<DentalFile, 'id'>) => {
    const newFile = { 
      ...file, 
      id: uuidv4(),
      type: 'Unsorted' as ImageCategory,
      group: 'Unsorted' as ImageGroup,
    };
    setFiles(prev => [...prev, newFile]);
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

  return {
    files,
    getPatientImages,
    getImage,
    addFile,
    updateFileGroup,
    updateFileCategory,
    deleteFile
  };
}