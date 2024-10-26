import React, { useEffect, useRef } from 'react';
import { useEditor } from '../../context/EditorContext';
import { AspectRatioSelector } from './AspectRatioSelector';
import { Loader2 } from 'lucide-react';

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCanvas, canvas, aspectRatio, isLoading } = useEditor();

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const ctx = canvasRef.current.getContext('2d');

    if (!ctx) return;

    // Set initial dimensions
    canvasRef.current.width = container.clientWidth;
    canvasRef.current.height = container.clientHeight;

    setCanvas(ctx);

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = container.clientWidth;
        canvasRef.current.height = container.clientHeight;
        // Redraw canvas content here if needed
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 relative flex items-center justify-center"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {!aspectRatio && <AspectRatioSelector />}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
    </div>
  );
}
