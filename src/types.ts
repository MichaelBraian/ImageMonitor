export interface FileWithPreview {
  file: File;
  preview: string;
}

export interface Patient {
  id: string;
  name: string;
  lastImageDate: string;
  imageCount: number;
  userId: string;
  createdAt: string;
}

export type ImageGroup = 'Before' | 'After' | 'Unsorted';

export interface DentalFile {
  id: string;
  url: string;
  name: string;
  type: ImageCategory;
  format: string;
  userId: string;
  patientId: string;
  createdAt: string;
  group: ImageGroup;  // This should be one of the three valid values
  date: string;
  fileType: '2D' | '3D';
}

export type FileType = '2D' | '3D';

export interface ImageCategory {
  id: string;
  name: string;
}

export interface PreviewFile {
  id: string;
  file: File;
  preview?: string;
  fileType: FileType;
  format: '2D' | 'PLY' | 'STL';
}
