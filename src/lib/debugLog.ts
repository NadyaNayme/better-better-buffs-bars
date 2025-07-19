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
  return (...args: any[]) => {
    const state = useStore.getState();
    const { debug } = state;
    const prefix = emojiMap[type];
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    if (!state.debugMode) return;
    if (type === 'verbose' && !debug.verboseEnabled) return;

    const tagsArg = args.find((a) => typeof a === 'object' && a?.__tags);
    const tags = tagsArg?.__tags ?? [];
    if (tagsArg) args = args.filter((a) => a !== tagsArg);

    console.log(prefix, ...args);

    debug.addDebugLog({
      timestamp,
      type,
      message: args,
      tags,
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