declare module 'react-image-picker-editor' {
  export interface ImagePickerConf {
    borderRadius?: string;
    language?: string;
    width?: string;
    height?: string;
    objectFit?: string;
    compressInitial?: number | null;
    darkMode?: boolean;
    rtl?: boolean;
    hideDeleteBtn?: boolean;
    hideDownloadBtn?: boolean;
    hideEditBtn?: boolean;
    hideAddBtn?: boolean;
  }

  interface ReactImagePickerEditorProps {
    config: ImagePickerConf;
    imageSrcProp: string;
    imageChanged: (newDataUri: string) => void;
  }

  const ReactImagePickerEditor: React.FC<ReactImagePickerEditorProps>;
  export default ReactImagePickerEditor;
}
