import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { DentalImage } from '../data/mockData';

interface EditorContextType {
  canvas: CanvasRenderingContext2D | null;
  activeImage: HTMLImageElement | null;
  aspectRatio: '16:9' | '1:1' | null;
  isLoading: boolean;
  setCanvas: (canvas: CanvasRenderingContext2D) => void;
  setAspectRatio: (ratio: '16:9' | '1:1') => void;
  resetImage: () => void;
  saveImage: () => Promise<string>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

interface EditorProviderProps {
  children: React.ReactNode;
  initialImage: DentalImage;
}

export function EditorProvider({ children, initialImage }: EditorProviderProps) {
  const [canvas, setCanvas] = useState<CanvasRenderingContext2D | null>(null);
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  };

  const setupCanvas = async (ratio: '16:9' | '1:1') => {
    if (!canvas) return;
    setIsLoading(true);

    try {
      // Clear existing canvas
      canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

      // Calculate canvas dimensions based on aspect ratio
      const containerWidth = canvas.canvas.width;
      const containerHeight = canvas.canvas.height;

      let canvasWidth, canvasHeight;
      if (ratio === '16:9') {
        if (containerWidth / containerHeight > 16/9) {
          canvasHeight = containerHeight * 0.8;
          canvasWidth = canvasHeight * (16/9);
        } else {
          canvasWidth = containerWidth * 0.8;
          canvasHeight = canvasWidth * (9/16);
        }
      } else {
        const size = Math.min(containerWidth, containerHeight) * 0.8;
        canvasWidth = size;
        canvasHeight = size;
      }

      canvas.canvas.width = canvasWidth;
      canvas.canvas.height = canvasHeight;

      // Load and position the image
      const img = await loadImage(initialImage.url);
      
      // Scale image to fit canvas while maintaining aspect ratio
      const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
      const x = (canvasWidth - img.width * scale) / 2;
      const y = (canvasHeight - img.height * scale) / 2;

      canvas.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      setActiveImage(img);
      originalImageRef.current = img;

      // Create frame overlay
      canvas.strokeStyle = '#4F46E5';
      canvas.strokeRect(0, 0, canvasWidth, canvasHeight);
    } catch (error) {
      console.error('Error setting up canvas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (aspectRatio && canvas) {
      setupCanvas(aspectRatio);
    }
  }, [aspectRatio, canvas]);

  const resetImage = () => {
    if (!canvas || !originalImageRef.current || !aspectRatio) return;
    setupCanvas(aspectRatio);
  };

  const saveImage = async (): Promise<string> => {
    if (!canvas) return '';
    
    return canvas.canvas.toDataURL('image/jpeg', 0.95);
  };

  return (
    <EditorContext.Provider
      value={{
        canvas,
        activeImage,
        aspectRatio,
        isLoading,
        setCanvas,
        setAspectRatio,
        resetImage,
        saveImage
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
