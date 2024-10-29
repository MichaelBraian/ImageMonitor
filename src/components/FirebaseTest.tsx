import React, { useEffect, useState } from 'react';
import { auth } from '../firebase/config';

export const FirebaseTest: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<string>('Checking auth...');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthStatus(`Authenticated as: ${user.email} (${user.uid})`);
      } else {
        setAuthStatus('Not authenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-bold mb-2">Firebase Auth Status</h2>
      <p>{authStatus}</p>
      <pre className="mt-2 p-2 bg-gray-200 rounded">
        {JSON.stringify(auth.currentUser, null, 2)}
      </pre>
    </div>
  );
};
