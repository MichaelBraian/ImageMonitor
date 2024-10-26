import { v4 as uuidv4 } from 'uuid';

export type ImageCategory = 'X-Ray' | 'Intraoral' | 'Extraoral' | 'Unsorted';
export type ImageGroup = 'Before' | 'After' | 'Unsorted';
export type FileType = '2D' | '3D';

export interface Patient {
  id: string;
  name: string;
  lastImageDate: string;
  profileImage?: string | null;
  imageCount: number;
}

export interface DentalFile {
  id: string;
  patientId: string;
  url: string;
  date: string;
  type: ImageCategory;
  group: ImageGroup;
  fileType: FileType;
  format?: '2D' | 'PLY' | 'STL';
}

export interface DentalImage {
  id: string;
  url: string;
  // Add other properties as needed
}

export const mockFiles: DentalFile[] = [
  {
    id: '1',
    patientId: '1',
    url: '/sample.stl',
    date: '2024-03-15',
    type: 'Intraoral',
    group: 'Before',
    fileType: '3D',
    format: 'STL'
  }
];
