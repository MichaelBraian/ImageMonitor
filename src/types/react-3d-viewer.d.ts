declare module 'react-3d-viewer' {
  import React from 'react';

  export interface ModelProps {
    url: string;
    width?: string | number;
    height?: string | number;
    position?: { x: number; y: number; z: number };
    rotate?: boolean;
  }

  export const STLModel: React.FC<ModelProps>;
  export const PLYModel: React.FC<ModelProps>;
}
