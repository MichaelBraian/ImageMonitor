import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFiles } from '../context/FileContext';
import { ThreeDViewer } from '../components/ThreeDViewer';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import { Button } from '../components/ui/Button';
import { Slider } from '../components/ui/Slider';
import { RefreshCw, Save, RotateCcw, RotateCw, LayoutTemplate } from 'lucide-react';
import debounce from 'lodash/debounce';

export function ImageEditor() {
  const { imageId } = useParams<{ imageId: string }>();
  const navigate = useNavigate();
  const { getFile, updateFile } = useFiles();
  const file = imageId ? getFile(imageId) : null;

  const [activeTab, setActiveTab] = useState<'Basic' | 'Filters'>('Basic');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [quality, setQuality] = useState(92);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [contrast, setContrast] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [grayscale, setGrayscale] = useState(0);
  const [saturate, setSaturate] = useState(1);
  const [sepia, setSepia] = useState(0);
  const [blur, setBlur] = useState(0);

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const applyFilters = useCallback(
    debounce((filters: any) => {
      if (!originalImage || !file || !imageId) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.filter = `contrast(${filters.contrast}) brightness(${filters.brightness}) grayscale(${filters.grayscale}) saturate(${filters.saturate}) sepia(${filters.sepia}) blur(${filters.blur}px)`;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const dataUrl = canvas.toDataURL(`image/${format}`, quality / 100);
          updateFile(imageId, { ...file, url: dataUrl });
        }
      };
      img.src = originalImage;
    }, 100),
    [originalImage, file, imageId, updateFile, format, quality]
  );

  useEffect(() => {
    if (file && !originalImage) {
      setOriginalImage(file.url);
    }
  }, [file, originalImage]);

  useEffect(() => {
    applyFilters({ contrast, brightness, grayscale, saturate, sepia, blur });
  }, [contrast, brightness, grayscale, saturate, sepia, blur, applyFilters]);

  const handleSave = useCallback(async () => {
    if (!file || !croppedAreaPixels || !imageId) return;

    try {
      const croppedImage = await getCroppedImg(
        file.url,
        croppedAreaPixels,
        rotation,
        { contrast, brightness, grayscale, saturate, sepia, blur },
        aspectRatio,
        format,
        quality
      );
      if (croppedImage) {
        await updateFile(imageId, { ...file, url: croppedImage });
        navigate(`/patients/${file.patientId}`);
      }
    } catch (e) {
      console.error(e);
    }
  }, [file, croppedAreaPixels, rotation, contrast, brightness, grayscale, saturate, sepia, blur, aspectRatio, format, quality, imageId, updateFile, navigate]);

  const handleRotate = (direction: 'left' | 'right') => {
    setRotation(prev => {
      const newRotation = direction === 'left' ? prev - 90 : prev + 90;
      return newRotation >= 360 ? newRotation - 360 : newRotation < 0 ? newRotation + 360 : newRotation;
    });
  };

  const handleReset = () => {
    setContrast(1);
    setBrightness(1);
    setGrayscale(0);
    setSaturate(1);
    setSepia(0);
    setBlur(0);
    setRotation(0);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setAspectRatio(16 / 9);
    if (originalImage && file && imageId) {
      updateFile(imageId, { ...file, url: originalImage });
    }
  };

  const toggleAspectRatio = () => {
    setAspectRatio(prev => prev === 16 / 9 ? 1 : 16 / 9);
  };

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">File not found or failed to load</p>
          <Button onClick={() => navigate('/patients')}>
            Return to Patients
          </Button>
        </div>
      </div>
    );
  }

  if (file.fileType === '3D' && file.format && (file.format === 'STL' || file.format === 'PLY')) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center">
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">
            3D Model Viewer - {file.format} File
          </h1>
        </div>
        <div className="flex-1">
          <ThreeDViewer fileUrl={file.url} fileFormat={file.format} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 relative">
        <Cropper
          image={file?.url}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          rotation={rotation}
        />
      </div>
      <div className="w-80 bg-gray-800 text-white p-4">
        <div className="flex mb-4">
          <button
            className={`flex-1 py-2 ${activeTab === 'Basic' ? 'bg-blue-500' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('Basic')}
          >
            Basic
          </button>
          <button
            className={`flex-1 py-2 ${activeTab === 'Filters' ? 'bg-blue-500' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('Filters')}
          >
            Filters
          </button>
        </div>
        <div className="mb-4">
          <RefreshCw className="w-6 h-6 text-gray-400 float-right cursor-pointer" onClick={handleReset} />
        </div>
        {activeTab === 'Basic' ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Zoom</label>
              <Slider min={1} max={3} step={0.1} value={zoom} onChange={setZoom} />
              <span className="text-sm">{zoom.toFixed(1)}x</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Rotation</label>
              <div className="flex items-center justify-between">
                <button onClick={() => handleRotate('left')} className="p-2 bg-gray-700 rounded">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <Slider
                  min={-180}
                  max={180}
                  value={rotation}
                  onChange={(value: number) => setRotation(value)}
                  className="mx-2 flex-grow"
                />
                <button onClick={() => handleRotate('right')} className="p-2 bg-gray-700 rounded">
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm">{rotation}°</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Quality</label>
              <Slider min={0} max={100} value={quality} onChange={setQuality} />
              <span className="text-sm">{quality}%</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Aspect Ratio</label>
              <button
                onClick={toggleAspectRatio}
                className="flex items-center justify-center w-full p-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                <LayoutTemplate className="w-4 h-4 mr-2" />
                {aspectRatio === 16 / 9 ? '16:9' : '1:1'}
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                className="w-full bg-gray-700 p-2 rounded"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Contrast</label>
              <Slider min={0} max={2} step={0.1} value={contrast} onChange={setContrast} />
              <span className="text-sm">{contrast.toFixed(1)}</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Brightness</label>
              <Slider min={0} max={2} step={0.1} value={brightness} onChange={setBrightness} />
              <span className="text-sm">{brightness.toFixed(1)}</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Grayscale</label>
              <Slider min={0} max={1} step={0.1} value={grayscale} onChange={setGrayscale} />
              <span className="text-sm">{grayscale.toFixed(1)}</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Saturate</label>
              <Slider min={0} max={2} step={0.1} value={saturate} onChange={setSaturate} />
              <span className="text-sm">{saturate.toFixed(1)}</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Sepia</label>
              <Slider min={0} max={1} step={0.1} value={sepia} onChange={setSepia} />
              <span className="text-sm">{sepia.toFixed(1)}</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Blur</label>
              <Slider min={0} max={10} step={0.1} value={blur} onChange={setBlur} />
              <span className="text-sm">{blur.toFixed(1)}px</span>
            </div>
          </>
        )}
        <Button onClick={handleSave} className="w-full mt-4">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  filters: {
    contrast: number;
    brightness: number;
    grayscale: number;
    saturate: number;
    sepia: number;
    blur: number;
  },
  aspectRatio: number,
  format: string,
  quality: number
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set canvas size to match the aspect ratio
  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Set canvas size to the desired aspect ratio
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Apply filters
  ctx.filter = `contrast(${filters.contrast}) brightness(${filters.brightness}) grayscale(${filters.grayscale}) saturate(${filters.saturate}) sepia(${filters.sepia}) blur(${filters.blur}px)`;

  ctx.putImageData(
    data,
    0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
    0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          resolve(null);
          return;
        }
        resolve(URL.createObjectURL(blob));
      },
      `image/${format}`,
      quality / 100
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}
