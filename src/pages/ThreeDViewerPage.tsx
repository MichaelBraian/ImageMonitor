import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThreeDViewer } from '../components/ThreeDViewer';
import { useFiles } from '../context/FileContext';
import { DentalFile } from '../types';
import { ArrowLeft } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

export function ThreeDViewerPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<DentalFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFile = async () => {
      if (!fileId) return;
      
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }

        // First, get all patients for this dentist
        const patientsQuery = query(collection(db, 'patients'));
        const patientsSnapshot = await getDocs(patientsQuery);

        // Search through each patient's models collection
        let foundFile: DentalFile | null = null;
        for (const patientDoc of patientsSnapshot.docs) {
          const modelsQuery = collection(db, `patients/${patientDoc.id}/models`);
          const modelsSnapshot = await getDocs(modelsQuery);
          
          const matchingFile = modelsSnapshot.docs.find(doc => doc.id === fileId);
          if (matchingFile) {
            foundFile = { id: matchingFile.id, ...matchingFile.data() } as DentalFile;
            break;
          }
        }

        if (!foundFile) {
          console.error('File not found in any patient records');
          setError('File not found');
          return;
        }

        console.log('Found 3D file:', foundFile);
        setFile(foundFile);
      } catch (err) {
        console.error('Error fetching file:', err);
        setError('Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileId]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error || !file) {
    return <div className="p-8 text-center text-red-500">{error || 'File not found'}</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <div className="h-16 bg-white dark:bg-gray-800 shadow flex items-center px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="ml-4 text-lg font-medium">{file.name}</h1>
      </div>
      
      <div className="flex-1">
        <ThreeDViewer fileUrl={file.url} fileFormat={file.format as 'STL' | 'PLY'} />
      </div>
    </div>
  );
} 