export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface DentalFileFirestore {
  id: string;
  url: string;
  name: string;
  type: {
    id: string;
    name: string;
  };
  format: string;
  userId: string;
  patientId: string;
  createdAt: FirestoreTimestamp;
  group: {
    id: string;
    name: string;
  };
  date: FirestoreTimestamp;
  fileType: '2D' | '3D';
}
