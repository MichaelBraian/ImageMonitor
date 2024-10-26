import React from 'react';

interface RotationRulerProps {
  rotation: number;
  onChange: (rotation: number) => void;
}

export function RotationRuler({ rotation, onChange }: RotationRulerProps) {
  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const ruler = e.currentTarget;
    const rect = ruler.getBoundingClientRect();
    const startX = e.clientX;
    const startRotation = rotation;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newRotation = startRotation + (deltaX / rect.width) * 60; // 60 degrees per ruler width
      onChange(Math.min(180, Math.max(-180, newRotation)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const ticks = Array.from({ length: 37 }, (_, i) => i - 18); // -180 to 180 degrees, step 10

  return (
    <div className="w-full px-4 py-2">
      <div 
        className="relative h-12 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-ew-resize"
        onMouseDown={handleDrag}
      >
        <div className="absolute inset-x-0 top-0 h-full flex items-center justify-center">
          {ticks.map((tick, index) => (
            <div
              key={index}
              className="absolute h-4 w-px bg-gray-400"
              style={{
                left: `${(index / 36) * 100}%`,
                height: tick % 9 === 0 ? '1rem' : '0.5rem',
              }}
            />
          ))}
          <div
            className="absolute w-1 h-8 bg-blue-500 rounded-full transform -translate-x-1/2"
            style={{
              left: `${((rotation + 180) / 360) * 100}%`,
            }}
          />
        </div>
        <div className="absolute bottom-0 left-0 text-xs text-gray-500">-180°</div>
        <div className="absolute bottom-0 right-0 text-xs text-gray-500">180°</div>
      </div>
    </div>
  );
}