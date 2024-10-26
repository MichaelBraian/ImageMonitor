import React from 'react';

export const DebugEnv: React.FC = () => {
  return (
    <div>
      <h2>Environment Variables:</h2>
      <pre>{JSON.stringify(import.meta.env, null, 2)}</pre>
    </div>
  );
};
