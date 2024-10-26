import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, CollectionReference, Query } from 'firebase/firestore';

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
