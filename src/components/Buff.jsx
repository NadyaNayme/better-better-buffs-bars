import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const formatTime = (seconds) => {
  if (seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m` : `${secs}s`;
};

const Buff = ({ buff, scale = 100, onRemove  }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: buff.id });

  const sizePercent = Math.max(50, Math.min(scale, 500)) / 100;
  const baseSize = 27;
  const sizePx = baseSize;

  const style = {
    width: `${sizePx}px`,
    height: `${sizePx}px`,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    gridColumn: 'span 1',
    gridRow: 'span 1',
  };

  const fontStyle = {
    fontSize:  'calc(10px * ' + sizePercent + ')'
  }

  const imageUrl = buff.isActive ? buff.imageData : buff.imageData;

  const [highlighted, setHighlighted] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative ${highlighted ? 'ring-1 ring-red-500' : ''}`}
      onContextMenu={(e) => {
        e.preventDefault();
        setHighlighted(true);
        setTimeout(() => onRemove(), 50);
      }}
    >
      <img src={imageUrl} alt={buff.name} className={`w-full h-full object-cover ${highlighted ? 'opacity-40' : ''}`} />
      {buff.timeRemaining != null && !(buff.name === "Overhead Prayers" || buff.name === "DPS Prayers" || buff.name === "Quiver" || buff.name === "Death Spark") && (
        <div className="absolute bottom-0 right-0 text-white text-xs text-shadow-md text-shadow-black right-1">
          {formatTime(buff.timeRemaining)}
        </div>
      )}
    </div>
  );
};

export default Buff;