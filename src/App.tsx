import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppProvider } from './context/AppContext';
import { PatientProvider } from './context/PatientContext';
import { FileProvider } from './context/FileContext';
import { SettingsProvider } from './context/SettingsContext';

export default function App() {
  return (
    <Router>
      <AppProvider>
        <PatientProvider>
          <FileProvider>
            <SettingsProvider>
              <Layout />
            </SettingsProvider>
          </FileProvider>
        </PatientProvider>
      </AppProvider>
    </Router>
  );
}
