import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, User } from 'lucide-react';
import { usePatients } from '../context/PatientContext';
import { AddPatientModal } from './AddPatientModal';
import { ImageUploadModal } from './ImageUploadModal';
import { Patient } from '../types';

export function Patients() {
  const navigate = useNavigate();
  const { patients, searchPatients, addPatient, fetchPatients } = usePatients();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const filteredPatients = searchPatients(searchQuery);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients, refreshTrigger]);

  const handleAddPatient = async (name: string) => {
    const newPatient = await addPatient({
      name,
      lastImageDate: new Date().toISOString(),
      imageCount: 0,
    });
    setRefreshTrigger(prev => prev + 1);
    navigate(`/patients/${newPatient.id}`);
  };

  const handlePatientClick = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedPatientId(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      <h2>Patients</h2>
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <Search className="mr-2" />
          <input
            type="search"
            placeholder="Search patients"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <Plus className="mr-2" />
          Add Patient
        </button>
      </div>
      {filteredPatients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <ul>
          {filteredPatients.map((patient: Patient) => (
            <li key={patient.id} onClick={() => handlePatientClick(patient.id)} className="cursor-pointer">
              {patient.name} - Images: {patient.imageCount}
            </li>
          ))}
        </ul>
      )}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPatient={handleAddPatient}
      />
      {selectedPatientId && (
        <ImageUploadModal
          isOpen={isUploadModalOpen}
          onClose={handleCloseUploadModal}
          patientId={selectedPatientId}
        />
      )}
    </div>
  );
}
