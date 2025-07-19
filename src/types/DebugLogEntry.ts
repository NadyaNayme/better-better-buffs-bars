export interface DebugLogEntry {
    timestamp: string;
    type: 'success' | 'error' | 'retrying' | 'info' | 'warning' | 'verbose';
    message: any[];
    tags: string[] | null;
  }