import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  practiceName: string;
  imageQuality: 'high' | 'medium' | 'low';
  storageLocation: string;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  isSaving: boolean;
}

const defaultSettings: Settings = {
  practiceName: 'Dental Care Clinic',
  imageQuality: 'high',
  storageLocation: '/path/to/images',
  autoBackup: true,
  backupFrequency: 'daily'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSettings(prev => ({ ...prev, ...newSettings }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isSaving }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}