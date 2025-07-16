import { emojiMap } from '../data/debugStrings';
import useStore from '../store/index';

type DebugLogType = 
  | 'success'
  | 'error'
  | 'retrying'
  | 'info'
  | 'warning'
  | 'verbose';

function createLogger(type: DebugLogType) {
  return (...args: unknown[]) => {
    const state = useStore.getState();
    const { debug } = state;
    const prefix = emojiMap[type];
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    if (!state.debugMode) return;
    if (type === 'verbose' && !debug.verboseEnabled) return;

    console.log(prefix, ...args);

    debug.addDebugLog({
      timestamp,
      type,
      message: args,
    });
  };
}

export const debugLog = {
  success: createLogger('success'),
  error: createLogger('error'),
  retrying: createLogger('retrying'),
  info: createLogger('info'),
  warning: createLogger('warning'),
  verbose: createLogger('verbose'),
};