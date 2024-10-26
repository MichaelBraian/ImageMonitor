import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  notifications: number;
  setNotifications: (count: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState(0);

  return (
    <AppContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}