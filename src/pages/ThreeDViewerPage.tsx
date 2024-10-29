import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThreeDViewer } from '../components/ThreeDViewer';
import { useFiles } from '../context/FileContext';
import { DentalFile } from '../types';
import { ArrowLeft } from 'lucide-react';

export function ThreeDViewerPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { getPatientFiles } = useFiles();
  const [file, setFile] = useState<DentalFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFile = async () => {
      if (!fileId) return;
      
      try {
        setLoading(true);
        // First get all files and find the one we want
        const allFiles = await getPatientFiles(fileId);
        const targetFile = allFiles.find(f => f.id === fileId);
        
        if (!targetFile) {
          setError('File not found');
          return;
        }

        console.log('Found 3D file:', targetFile);
        setFile(targetFile);
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