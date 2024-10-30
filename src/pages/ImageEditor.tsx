import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFiles } from '../context/FileContext';
import { ThreeDViewer } from '../components/ThreeDViewer';
import Editor2D from '../components/editor/Editor2D';
import { DentalFile } from '../types';
import { ArrowLeft } from 'lucide-react';

export function ImageEditor() {
  const { imageId } = useParams<{ imageId: string }>();
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
          if (fetchedFile) {
            setFile(fetchedFile);
          } else {
            setError('File not found');
          }
        } catch (err) {
          setError('An error occurred while fetching the file');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchFile();
  }, [imageId, getFile]);

  const handleSave = async () => {
    // Implement save functionality
    console.log('Saving changes...');
  };

  if (loading) {
    return <div className="p-6 text-gray-800 dark:text-gray-200">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!file) {
    return <div className="p-6 text-gray-800 dark:text-gray-200">No file found</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium text-gray-900 dark:text-white">
          {file.fileType === '2D' ? '2D Image Editor' : '3D Model Viewer'} - {file.name}
        </h1>
      </div>
      <div className="flex-1 overflow-hidden">
        {file.fileType === '2D' ? (
          <Editor2D 
            imageUrl={file.url} 
            onSave={handleSave}
            onClose={() => navigate(-1)}
          />
        ) : (
          <ThreeDViewer fileUrl={file.url} fileFormat={file.format as 'STL' | 'PLY'} />
        )}
      </div>
    </div>
  );
}
