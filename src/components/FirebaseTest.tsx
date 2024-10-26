import React, { useState } from 'react';
import { auth, db, storage } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

export const FirebaseTest: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const addDocument = async () => {
    try {
      const docRef = await addDoc(collection(db, 'test_collection'), {
        test: 'data',
        timestamp: new Date()
      });
      setDocId(docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const storageRef = ref(storage, 'test-file');
    try {
      const snapshot = await uploadBytes(storageRef, file);
      setUploadResult(`File uploaded successfully. Path: ${snapshot.ref.fullPath}`);
    } catch (error) {
      console.error('Error uploading file: ', error);
      setUploadResult('Error uploading file');
    }
  };

  return (
    <div>
      <h2>Firebase Test Component</h2>
      <button onClick={signInWithGoogle}>Sign In with Google</button>
      {user && <p>Signed in as: {user.email}</p>}
      <button onClick={addDocument}>Add Test Document to Firestore</button>
      {docId && <p>Document added with ID: {docId}</p>}
      <input type="file" onChange={uploadFile} />
      {uploadResult && <p>{uploadResult}</p>}
    </div>
  );
};
