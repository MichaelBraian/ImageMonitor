import React, { useState } from 'react';
import { DentalFile } from '../types';
import ReactImagePickerEditor from 'react-image-picker-editor';
import 'react-image-picker-editor/dist/index.css';

interface Editor2DProps {
  file: DentalFile;
}

function Editor2D({ file }: Editor2DProps) {
  const config2 = {
    borderRadius: '8px',
    language: 'en',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    compressInitial: null,
    hideDeleteBtn: false,
    hideDownloadBtn: false,
    hideEditBtn: false,
    hideAddBtn: true,
    hideZoomBtn: false,
    hideRotateBtn: false,
    hideFlipBtn: false,
    hideFilterBtn: false,
    hideAdjustBtn: false,
    hideCropBtn: false,
    hideResetBtn: false,
    hideResizeBtn: false,
    hideEffectBtn: false,
    hideOrientation: false,
    hideZoomControl: false,
    hideRotateControl: false,
    hideFlipControl: false,
    hideFilterControl: false,
    hideAdjustControl: false,
    hideCropControl: false,
    hideResizeControl: false,
    hideEffectControl: false,
    cropOptions: {
      aspect: null,
      maxWidth: 1920,
      maxHeight: 1080
    },
    resizeOptions: {
      width: 1920,
      height: 1080
    },
    adjustOptions: {
      brightness: true,
      contrast: true,
      saturation: true,
      hue: true,
      temperature: true
    },
    filterOptions: {
      grayscale: true,
      sepia: true,
      blur: true,
      sharpen: true,
      invert: true
    },
    effectOptions: {
      noise: true,
      pixelate: true,
      vintage: true,
      polaroid: true
    }
  };

  const initialImage = file.url;

  const [imagePickerState, setImagePickerState] = useState({
    image: initialImage,
    savedImage: initialImage
  });

  return (
    <div className="h-full flex items-center justify-center">
      <ReactImagePickerEditor
        config={config2}
        imageSrcProp={imagePickerState.image}
        imageChanged={(newDataUri: string) => {
          setImagePickerState({
            ...imagePickerState,
            image: newDataUri
          });
        }}
      />
    </div>
  );
}

export { Editor2D };
