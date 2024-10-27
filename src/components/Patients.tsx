import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, User } from 'lucide-react';
import { usePatients } from '../context/PatientContext';
import { AddPatientModal } from './AddPatientModal';

export function Patients() {
  const navigate = useNavigate();
  const { patients, searchPatients, addPatient, fetchPatients } = usePatients();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const filteredPatients = searchPatients(searchQuery);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients, refreshTrigger]);

  const handleAddPatient = async (name: string) => {
    const newPatient = await addPatient({
      name,
      lastImageDate: new Date().toISOString(),
    });
    navigate(`/patients/${newPatient.id}`);
  };

  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRefreshTrigger(prev => prev + 1); // This will trigger a re-fetch of patients
  };

  if (filteredPatients.length === 0) return <div>Loading patients...</div>;

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
          onClick={() => setIsModalOpen(true)}
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
            <li key={patient.id} onClick={() => handlePatientClick(patient.id)}>
              {patient.name}
            </li>
          ))}
        </ul>
      )}
      <AddPatientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddPatient}
      />
    </div>
  );
}
