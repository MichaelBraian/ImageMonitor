import React from 'react';
import { useEditor } from '../../context/EditorContext';
import { LayoutTemplate, Square } from 'lucide-react';

export function AspectRatioSelector() {
  const { setAspectRatio } = useEditor();

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Select Canvas Format
        </h2>
        <div className="flex gap-4">
          <button
            onClick={() => setAspectRatio('16:9')}
            className="flex flex-col items-center px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <LayoutTemplate className="w-8 h-8 mb-2 text-blue-600" />
            <span className="text-gray-900 dark:text-white font-medium">16:9</span>
          </button>
          <button
            onClick={() => setAspectRatio('1:1')}
            className="flex flex-col items-center px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Square className="w-8 h-8 mb-2 text-blue-600" />
            <span className="text-gray-900 dark:text-white font-medium">1:1</span>
          </button>
        </div>
      </div>
    </div>
  );
}