import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Patients } from '../pages/Patients';
import { PatientDetails } from '../pages/PatientDetails';
import { ImageEditor } from '../pages/ImageEditor';
import { Settings } from '../pages/Settings';
import { FirebaseTest } from './FirebaseTest';
import { Login } from './Login';
import { useAuth } from '../context/AuthContext';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function Layout() {
  const { user } = useAuth();

  // If not logged in, only show login route
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <FirebaseTest />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/patients" replace />} />
            <Route
              path="/patients"
              element={
                <RequireAuth>
                  <Patients />
                </RequireAuth>
              }
            />
            <Route
              path="/patients/:patientId"
              element={
                <RequireAuth>
                  <PatientDetails />
                </RequireAuth>
              }
            />
            <Route
              path="/editor/:imageId"
              element={
                <RequireAuth>
                  <ImageEditor />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
