import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const Buff = ({ buff, isBigHead }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: buff.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: isBigHead ? 'span 2' : 'span 1',
    gridRow: isBigHead ? 'span 2' : 'span 1',
  };

  const imageUrl = buff.isActive ? buff.imageData : buff.desaturatedImageData;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative"
      onContextMenu={(e) => {
        e.preventDefault();
        // removeBuffFromGroup(groupId, buff.id);
      }}
    >
      <img src={imageUrl} alt={buff.name} className="w-full h-full object-cover" />
    </div>
  );
};

export default Buff;