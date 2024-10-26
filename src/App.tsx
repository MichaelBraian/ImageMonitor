import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { FileProvider } from './context/FileContext';
import { Layout } from './components/Layout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <PatientProvider>
          <FileProvider>
            <Layout />
          </FileProvider>
        </PatientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
