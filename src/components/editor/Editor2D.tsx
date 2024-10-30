import React from 'react';

interface Editor2DProps {
  imageUrl: string;
  onSave: () => Promise<void>;
  onClose: () => void;
}

const Editor2D: React.FC<Editor2DProps> = ({ imageUrl, onSave, onClose }) => {
  return (
    <div className="h-full w-full flex flex-col">
      {/* Add your editor implementation here */}
      <img src={imageUrl} alt="Editor" className="max-w-full h-auto" />
    </div>
  );
};

export default Editor2D; 