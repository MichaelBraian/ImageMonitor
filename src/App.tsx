import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { FileProvider } from './context/FileContext';
import { Layout } from './components/Layout';
import { PatientList } from './components/PatientList';
import { PatientDetails } from './components/PatientDetails';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <PatientProvider>
          <FileProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route path="/patients" element={<PatientList />} />
                <Route path="/patients/:patientId" element={<PatientDetails />} />
                {/* ... other routes ... */}
              </Route>
            </Routes>
          </FileProvider>
        </PatientProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
