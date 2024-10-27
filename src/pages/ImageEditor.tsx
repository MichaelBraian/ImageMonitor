import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFiles } from '../context/FileContext';
import { ThreeDViewer } from '../components/ThreeDViewer';
import { Editor2D } from '../components/Editor2D';
import { DentalFile } from '../types';

export function ImageEditor() {
  const { imageId } = useParams<{ imageId: string }>();
  console.log('ImageEditor received imageId:', imageId); // Added logging
  const navigate = useNavigate();
  const { getFile } = useFiles();
  const [file, setFile] = useState<DentalFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (imageId) {
        try {
          setLoading(true);
          const fetchedFile = await getFile(imageId);
          console.log('Fetched file:', fetchedFile); // Added logging
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
  }, [imageId, getFile]);

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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center">
        <h1 className="text-lg font-medium text-gray-900 dark:text-white">
          {file.fileType === '2D' ? '2D Image Editor' : '3D Model Viewer'} - {file.name}
        </h1>
      </div>
      <div className="flex-1 overflow-hidden">
        {file.fileType === '2D' ? (
          <Editor2D file={file} />
        ) : (
          <ThreeDViewer fileUrl={file.url} fileFormat={file.format as 'STL' | 'PLY'} />
        )}
      </div>
    </div>
  );
}
