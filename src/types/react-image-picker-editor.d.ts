declare module 'react-image-picker-editor' {
  export interface ImagePickerConf {
    borderRadius?: string;
    language?: string;
    width?: string;
    height?: string;
    objectFit?: string;
    compressInitial?: number | null;
    darkMode?: boolean;
    cropTool?: boolean;
    rotateTool?: boolean;
    flipTool?: boolean;
    scaleSlider?: boolean;
    filterTool?: boolean;
    uploadBtn?: boolean;
    useInitialImage?: boolean;
    defaultImage?: string;
  }

  interface ReactImagePickerEditorProps {
    config: ImagePickerConf;
    imageSrcProp: string;
    imageChanged: (newDataUri: string) => void;
  }

  const ReactImagePickerEditor: React.FC<ReactImagePickerEditorProps>;
  export default ReactImagePickerEditor;
}
