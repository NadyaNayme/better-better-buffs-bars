export function isAlt1Available() {
    return typeof window !== 'undefined' && typeof window.alt1 !== 'undefined';
  }
  
  export function requireAlt1() {
    if (!isAlt1Available()) {
      throw new Error("Alt1 is not available or permissions not granted.");
    }
    return window.alt1;
  }