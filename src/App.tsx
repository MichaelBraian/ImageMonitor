import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { FileProvider } from './context/FileContext';
import { Layout } from './components/Layout';
import { ThreeDViewerPage } from './pages/ThreeDViewerPage';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <PatientProvider>
          <FileProvider>
            <Routes>
              <Route path="/*" element={<Layout />} />
              <Route path="/viewer/3d/:fileId" element={<ThreeDViewerPage />} />
            </Routes>
          </FileProvider>
        </PatientProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
