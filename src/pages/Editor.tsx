import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFiles } from '../context/FileContext';

export function Editor() {
  const { fileId } = useParams<{ fileId: string }>();
  const { getFile } = useFiles();
  const [file, setFile] = useState<DentalFile | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (fileId) {
        const fetchedFile = await getFile(fileId);
        if (fetchedFile) {
          setFile(fetchedFile);
        }
      }
    };
    fetchFile();
  }, [fileId, getFile]);

  if (!file) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Editor</h1>
      <p>Editing file: {file.name}</p>
      {file.fileType === '2D' ? (
        <img src={file.url} alt={file.name} className="max-w-full h-auto" />
      ) : (
        <p>3D file viewer not implemented yet</p>
      )}
      {/* Add your editor controls and functionality here */}
    </div>
  );
}
