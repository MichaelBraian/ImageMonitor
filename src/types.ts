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

export type ImageGroup = string;
export type ImageCategory = string;

export interface DentalFile {
  id: string;
  url: string;
  name: string;
  type: string;
  format: string;
  userId: string;
  patientId: string;
  createdAt: string;
  group: ImageGroup;
  date: string;
  fileType: '2D' | '3D';
}

export type FileType = '2D' | '3D';

// Remove or comment out the ImageCategory interface if it's not used elsewhere
// export interface ImageCategory {
//   id: string;
//   name: string;
// }

export interface PreviewFile {
  id: string;
  file: File;
  preview?: string;
  fileType: FileType;
  format: '2D' | 'PLY' | 'STL';
}
