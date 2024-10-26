import { Object3DNode, LightNode } from '@react-three/fiber'
import { Mesh, AmbientLight, DirectionalLight } from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: Object3DNode<Mesh, typeof Mesh>
      ambientLight: LightNode<AmbientLight, typeof AmbientLight>
      directionalLight: LightNode<DirectionalLight, typeof DirectionalLight>
    }
  }
}

export interface ImageCategory {
  id: string;
  name: string;
}

export interface ImageGroup {
  id: string;
  name: string;
}

export interface DentalFile {
  id: string;
  url: string;
  name: string;
  type: ImageCategory;
  format: '2D' | 'PLY' | 'STL';
  userId: string;
  patientId: string;
  createdAt: string;
  group: ImageGroup;
  date: string;
  fileType: FileType;
}

export interface Patient {
  id: string;
  name: string;
  lastImageDate?: string;
  imageCount?: number;
  userId: string;
  createdAt: string;
  profileImage?: string;
}

export interface FileWithPreview extends File {
  preview: string;
}

export type FileType = '2D' | '3D';

export interface PreviewFile extends File {
  id: string;
  preview?: string;
  fileType: FileType;
  format: '2D' | 'PLY' | 'STL';
}
