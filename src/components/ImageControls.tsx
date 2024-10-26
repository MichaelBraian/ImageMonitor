import React from 'react';
import { Save, Undo, Redo } from 'lucide-react';

interface ImageControlsProps {
  tools: Array<{
    icon: React.ElementType;
    label: string;
    onClick: () => void;
  }>;
  zoom: number;
  rotation: number;
}

export function ImageControls({ tools, zoom, rotation }: ImageControlsProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {tools.map((tool) => (
            <button
              key={tool.label}
              onClick={tool.onClick}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg tooltip"
              title={tool.label}
            >
              <tool.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Undo className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Redo className="w-5 h-5" />
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Save className="w-5 h-5 mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}