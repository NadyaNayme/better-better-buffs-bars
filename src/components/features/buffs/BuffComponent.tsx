import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useStore from '../../../store/index';
import { isRuntimeBuff, type Buff } from '../../../types/Buff';

const formatTime = (seconds: number) => {
  if (seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m` : `${secs}s`;
};

interface BuffComponentProps {
  buff: Buff;
  onRemove: () => void;
}

const BuffComponent: React.FC<BuffComponentProps> = ({ buff, onRemove }) => {
  if (!isRuntimeBuff(buff)) return
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: buff.id });

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

  const imageUrl = buff.isActive ? buff.imageData : buff.imageData;

  const [highlighted, setHighlighted] = useState(false);

  const customThresholds = useStore((s) => s.customThresholds);
  const effectivePass = customThresholds[buff.name]?.passThreshold ?? buff.thresholds?.pass;
  const effectiveFail = customThresholds[buff.name]?.failThreshold ?? buff.thresholds?.fail;

  const getDisplayValue = (buff: Buff): string | null => {
    if (!buff.hasText) return null;
    if (
      buff.type === "Normal Buff" ||
      buff.type === "Ability Buff" ||
      buff.type === "Normal Debuff" ||
      buff.type === "Weapon Special"
    ) return formatTime(buff.timeRemaining);
    if (buff.type === "Stack Buff") return formatTime(buff.stacks);
    return null;
  };

  const displayValue = getDisplayValue(buff);

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
      <img src={imageUrl} alt={buff.name} title={buff.name} data-pass={effectivePass} data-fail={effectiveFail} className={`w-full h-full object-cover ${highlighted ? 'opacity-40' : ''}`} />
      {displayValue && (
        <div className="absolute pointer-events-none bottom-0 right-0 text-white text-xs text-shadow-md text-shadow-black right-1">
          {displayValue}
        </div>
      )}
    </div>
  );
};

export default BuffComponent;