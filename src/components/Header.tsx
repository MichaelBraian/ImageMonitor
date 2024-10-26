import React from 'react';
import { Github } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">F3D Web Viewer</h1>
          </div>
          <a
            href="https://github.com/f3d-app/f3d"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Github className="w-6 h-6" />
          </a>
        </div>
      </div>
    </header>
  );
}