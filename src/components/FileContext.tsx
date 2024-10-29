import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
  // Your existing config stays the same
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Add this helper function
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Add this function to your upload logic
const uploadFile = async (file: File, patientId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const dentistId = currentUser.uid;
    const fileId = uuidv4(); // Make sure you have uuid imported
    
    // Create the correct path based on file type
    const isImage = file.type.startsWith('image');
    const folder = isImage ? 'images' : 'models';
    const path = `patients/${patientId}/${folder}/${fileId}`;
    
    // Create storage reference with metadata
    const storageRef = ref(storage, path);
    const metadata = {
      customMetadata: {
        dentistId: dentistId,
        patientId: patientId
      }
    };

    // Upload file with metadata
    await uploadBytes(storageRef, file, metadata);
    const url = await getDownloadURL(storageRef);

    // Create Firestore document
    const fileData = {
      id: fileId,
      url: url,
      name: file.name,
      type: isImage ? 'IMAGE' : 'MODEL',
      format: isImage ? '2D' : 'STL',
      userId: currentUser.uid,
      dentistId: dentistId,
      patientId: patientId,
      createdAt: new Date().toISOString(),
      // Add other required fields
    };

    // Save to Firestore
    await setDoc(doc(db, 'patients', patientId, 'files', fileId), fileData);
    
    return fileData;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}; 