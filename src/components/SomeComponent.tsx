import { auth, db, storage } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

// Example function to sign in with Google
const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Signed in:', result.user);
  } catch (error) {
    console.error('Error signing in:', error);
  }
};

// Example function to add a document to Firestore
const addDocument = async (data: any) => {
  try {
    const docRef = await addDoc(collection(db, 'your_collection'), data);
    console.log('Document written with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

// Example function to upload a file to Storage
const uploadFile = async (file: File) => {
  const storageRef = ref(storage, 'some-child');
  try {
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Uploaded a blob or file!', snapshot);
  } catch (error) {
    console.error('Error uploading file: ', error);
  }
};

const handleSaveData = async (data: any) => {
  try {
    await setDoc(doc(db, 'collection', 'documentId'), data);
    console.log('Document successfully written!');
  } catch (error) {
    console.error('Error writing document: ', error);
  }
};
