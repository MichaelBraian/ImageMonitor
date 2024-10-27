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

export interface DentalFile {
  id: string;
  url: string;
  name: string;
  fileType: '2D' | '3D';
  // Add other properties as needed
}

export type FileType = '2D' | '3D';

export interface ImageCategory {
  id: string;
  name: string;
}

export interface ImageGroup {
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
