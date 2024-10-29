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
  dentistId: string;
  createdAt: string;
  profileImage?: string | null;
}

export type ImageGroup = 'Before' | 'After' | 'Unsorted';
export type ImageCategory = 'X-Ray' | 'Intraoral' | 'Extraoral' | 'Unsorted';

export interface DentalFile {
  id: string;
  url: string;
  name: string;
  type: ImageCategory;
  format: '2D' | 'PLY' | 'STL';
  userId: string;
  dentistId: string;
  patientId: string;
  createdAt: string;
  group: ImageGroup;
  date: string;
  fileType: FileType;
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
