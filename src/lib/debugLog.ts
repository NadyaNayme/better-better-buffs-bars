import useStore from '../store';

export function debugLog(...args: any[]) {
  const debugMode = useStore.getState().debugMode;
  if (debugMode) {
    console.log(...args);
  }
}