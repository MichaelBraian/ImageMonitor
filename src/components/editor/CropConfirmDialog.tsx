import React from 'react';
import { Check, X } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';

export function CropConfirmDialog() {
  const { applyCrop, cancelCrop } = useEditor();

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center space-x-4 z-50">
      <span className="text-gray-700 dark:text-gray-200">Apply crop?</span>
      <button
        onClick={applyCrop}
        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title="Apply crop"
      >
        <Check className="w-5 h-5" />
      </button>
      <button
        onClick={cancelCrop}
        className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        title="Cancel crop"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}