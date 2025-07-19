import { emojiMap } from '../../data/debugStrings';
import useStore from '../../store/index';
import { useEffect, useRef, useState } from 'react';

export function DebugOverlay() {
  const logs = useStore(state => state.debug.debugLogs);
  const clear = useStore(state => state.debug.clearDebugLogs);
  const toggleVerbose = useStore(state => state.debug.toggleVerbose);
  const verboseEnabled = useStore(state => state.debug.verboseEnabled);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [logs]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const logsToRender = logs.filter(log =>
    log.type !== 'verbose' || verboseEnabled
  );

  return (
    <div
      ref={containerRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className="fixed w-[600px] max-h-[300px] bg-[#364554] bg-opacity-90 text-white text-sm rounded-lg shadow-xl z-50 border border-white overflow-hidden"
    >
      {/* Header bar (drag handle) */}
      <div
        className="cursor-move bg-[#364554] bg-opacity-80 p-2 flex justify-between items-center border-b border-white"
        onMouseDown={handleMouseDown}
      >
        <span className="font-bold">🧪 Debug Logs</span>
        <div className="flex gap-2">
          <button className="text-xs underline" onClick={toggleVerbose}>
            {verboseEnabled ? 'Disable Verbose' : 'Enable Verbose'}
          </button>
          <button className="text-xs underline text-red-400" onClick={clear}>
            Clear
          </button>
        </div>
      </div>

      {/* Scrollable log output */}
      <div
        ref={scrollRef}
        className="overflow-y-auto max-h-[250px] p-2"
      >
        {logsToRender.map((log, idx) => (
          <div key={idx} className="whitespace-pre-wrap">
            <span>[{log.timestamp}] </span>
            <span>{emojiMap[log.type] ?? ''} </span>
            {log.message.map((m, i) => (
              <span key={i}>
                {typeof m === 'string' ? m : JSON.stringify(m)}{' '}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}