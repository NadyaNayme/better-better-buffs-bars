import useStore from '../store/index';
import { useEffect, useRef } from 'react';

export function DebugOverlay() {
  const logs = useStore(state => state.debug.debugLogs);
  const clear = useStore(state => state.debug.clearDebugLogs);
  const toggleVerbose = useStore(state => state.debug.toggleVerbose);
  const verboseEnabled = useStore(state => state.debug.verboseEnabled);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [logs]);

  const logsToRender = logs.filter(log =>
    log.type !== 'verbose' || verboseEnabled
  );

  return (
    <div className="fixed top-0 left-0 w-[600px] max-h-[300px] bg-black bg-opacity-90 text-white text-sm p-2 overflow-y-auto rounded-tl-lg shadow-xl z-50 border-t border-l border-white" ref={ref}>
      <div className="fixed top-0 left-0 mb-10 z-51 flex justify-between items-center mb-2 bg-black full">
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
  );
}

const emojiMap: Record<string, string> = {
  success: '✅',
  error: '❌',
  retrying: '🔁',
  info: 'ℹ️',
  warning: '⚠️',
  verbose: '🔍',
};