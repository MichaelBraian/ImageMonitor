import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { FileProvider } from './context/FileContext';
import { Layout } from './components/Layout';
import { ThreeDViewer } from './components/ThreeDViewer';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <PatientProvider>
          <FileProvider>
            <Routes>
              <Route path="/*" element={<Layout />} />
              <Route path="/viewer/3d/:fileId" element={<ThreeDViewer />} />
            </Routes>
          </FileProvider>
        </PatientProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
