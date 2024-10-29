import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Patients } from '../pages/Patients';
import { PatientDetails } from '../pages/PatientDetails';
import { ImageEditor } from '../pages/ImageEditor';
import { Settings } from '../pages/Settings';
import { FirebaseTest } from './FirebaseTest';

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <FirebaseTest />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/patients" replace />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:patientId" element={<PatientDetails />} />
            <Route path="/editor/:imageId" element={<ImageEditor />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
