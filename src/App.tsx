import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { FileProvider } from './context/FileContext';
import { PatientProvider } from './context/PatientContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <PatientProvider>
            <FileProvider>
              <ErrorBoundary>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </ErrorBoundary>
            </FileProvider>
          </PatientProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
