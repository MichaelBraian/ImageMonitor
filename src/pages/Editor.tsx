import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFiles } from '../context/FileContext';
import { DentalFile } from '../types'; // Make sure to import DentalFile type

export function Editor() {
  const { fileId } = useParams<{ fileId: string }>();
  const { getFile } = useFiles();
  const [file, setFile] = useState<DentalFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (fileId) {
        try {
          setLoading(true);
          const fetchedFile = await getFile(fileId);
          if (fetchedFile) {
            setFile(fetchedFile);
          } else {
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
        <img src={file.url} alt={file.name} className="max-w-full h-auto" />
      ) : (
        <p>3D file viewer not implemented yet</p>
      )}
      <div className="mt-4">
        <p>File Type: {file.fileType}</p>
        <p>Format: {file.format}</p>
        <p>Uploaded: {new Date(file.createdAt).toLocaleString()}</p>
      </div>
      {/* Add your editor controls and functionality here */}
    </div>
  );
}
