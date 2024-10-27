import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFiles } from '../context/FileContext';
import { DentalFile } from '../types'; // Make sure to import DentalFile type

export function Editor() {
  const { fileId } = useParams<{ fileId: string }>();
  const { getFile } = useFiles();
  const [file, setFile] = useState<DentalFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFile = async () => {
      if (fileId) {
        try {
          setLoading(true);
          console.log('Fetching file with ID:', fileId);
          const fetchedFile = await getFile(fileId);
          if (fetchedFile) {
            console.log('Fetched file:', fetchedFile);
            setFile(fetchedFile);
          } else {
            console.error('File not found');
            setError('File not found');
          }
        } catch (err) {
          console.error('Error fetching file:', err);
          setError('An error occurred while fetching the file');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchFile();
  }, [fileId, getFile]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!file) {
    return <div className="p-6">No file found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Editor</h1>
      <p className="mb-4">Editing file: {file.name}</p>
      {file.fileType === '2D' ? (
        <img 
          src={file.url} 
          alt={file.name} 
          className="max-w-full h-auto"
          onError={(e) => {
            console.error('Error loading image:', e);
            e.currentTarget.src = '/placeholder-dental.jpg'; // Fallback image
          }}
        />
      ) : (
        <p>3D file viewer not implemented yet</p>
      )}
      <div className="mt-4">
        <p>File Type: {file.fileType}</p>
        <p>Format: {file.format}</p>
        <p>Uploaded: {new Date(file.createdAt).toLocaleString()}</p>
      </div>
      <button
        onClick={() => navigate(`/patients/${file.patientId}`)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Back to Patient
      </button>
    </div>
  );
}
