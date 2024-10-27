import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, CollectionReference, Query, QueryDocumentSnapshot, SnapshotOptions, DocumentData } from 'firebase/firestore';
import { DentalFile } from '../types';

const dentalFileConverter = {
  toFirestore(dentalFile: DentalFile): DocumentData {
    return { ...dentalFile };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): DentalFile {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      url: data.url,
      name: data.name,
      type: data.type,
      format: data.format,
      userId: data.userId,
      patientId: data.patientId,
      createdAt: data.createdAt,
      group: data.group,
      date: data.date,
      fileType: data.fileType
    };
  }
};

export const useFirestore = () => {
  const addDocument = async (collectionName: string, data: any) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error('Error adding document: ', error);
      throw error;
    }
  };

  const getDocuments = async (collectionName: string, conditions: [string, any, any][] = []) => {
    try {
      let q: Query = collection(db, collectionName) as Query;
      conditions.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value));
      });
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting documents: ', error);
      throw error;
    }
  };

  return { addDocument, getDocuments };
};

export const usePatientFiles = (patientId: string) => {
  const getPatientFiles = async () => {
    const filesRef = collection(db, 'files').withConverter(dentalFileConverter);
    const filesQuery = query(filesRef, where('patientId', '==', patientId));
    const querySnapshot = await getDocs(filesQuery);
    const files = querySnapshot.docs.map(doc => doc.data());
    console.log('Fetched patient files:', files);
    return files;
  };

  return { getPatientFiles };
};
