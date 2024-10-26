import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFiles } from '../context/FileContext';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { EditorCanvas } from '../components/editor/EditorCanvas';
import { EditorProvider } from '../context/EditorContext';
import { ThreeDViewer } from '../components/ThreeDViewer';

export function ImageEditor() {
  const { imageId } = useParams();
  const navigate = useNavigate();
  const { getFile } = useFiles();
  const file = imageId ? getFile(imageId) : null;
  
  console.log("ImageEditor rendered with file:", JSON.stringify(file, null, 2));

  if (!file) {
    console.log("File not found");
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">File not found</p>
          <button 
            onClick={() => navigate('/patients')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Patients
          </button>
        </div>
      </div>
    );
  }

  if (file.fileType === '3D' && file.format && (file.format === 'STL' || file.format === 'PLY')) {
    console.log("Rendering 3D viewer with file:", JSON.stringify(file, null, 2));
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center">
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">
            3D Model Viewer - {file.format} File
          </h1>
        </div>
        <div className="flex-1">
          <ThreeDViewer fileUrl={file.url} fileFormat={file.format as 'STL' | 'PLY'} />
        </div>
      </div>
    );
  }

  // Otherwise show the 2D image editor
  console.log("Rendering 2D editor");
  return (
    <EditorProvider initialImage={file}>
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <EditorToolbar />
        <EditorCanvas />
      </div>
    </EditorProvider>
  );
}
