import { useState, useCallback } from 'react';
import { Patient } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { useContext } from 'react';
import { PatientContext } from '../context/PatientContext';

export function usePatients() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
}