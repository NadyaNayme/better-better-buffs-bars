import { useState, useEffect, useRef, useCallback } from 'react'; // Import useCallback
import * as BuffReader from 'alt1/buffs';

const isAlt1 = typeof window.alt1 !== "undefined";

export function BuffReaderComponent({ 
  isDebuff = false, 
  onDataRead,
  readInterval = 600
}) {
  const [status, setStatus] = useState("Idle");
  const [isBarFound, setIsBarFound] = useState(false);
  const readerRef = useRef<any>(null);
  const findTimeoutRef = useRef<number | null>(null);

  const findInitiatedRef = useRef(false);

  const tryToFindBar = useCallback(() => {
    if (isBarFound) return;

    const barName = isDebuff ? "Debuff" : "Buff";
    setStatus(`Searching for ${barName} bar...`);

    const position = readerRef.current.find();

    if (position) {
      setStatus(`${barName} bar found at X:${readerRef.current.pos.x}, Y:${readerRef.current.pos.y}`);
      setIsBarFound(true);
    } else {
      setStatus(`${barName} bar not found. Retrying in 3 seconds...`);
      findTimeoutRef.current = setTimeout(tryToFindBar, 3000);
    }
  }, [isDebuff, isBarFound]);

  useEffect(() => {
    if (!isAlt1) {
      setStatus("Error: Not running in Alt1.");
      return;
    }

    if (findInitiatedRef.current) {
      return;
    }
    findInitiatedRef.current = true;

    if (!readerRef.current) {
      const reader = new BuffReader.default();
      if (isDebuff) {
        reader.debuffs = true;
      }
      readerRef.current = reader;
    }
    
    tryToFindBar();

    return () => {
      if (findTimeoutRef.current) {
        clearTimeout(findTimeoutRef.current);
      }
    };
  }, [isDebuff, tryToFindBar]);

  useEffect(() => {
    if (!isBarFound) {
      return;
    }

    const readDataInterval = setInterval(() => {
      if (readerRef.current) {
        const data = readerRef.current.read();
        if (data) {
          onDataRead(data);
        }
      }
    }, readInterval);
    
    return () => {
      clearInterval(readDataInterval);
    };
    
  }, [isBarFound, onDataRead, readInterval]);

  return (
    <div style={{ padding: '5px', border: '1px solid #555', marginTop: '5px' }}>
      <p style={{ margin: 0, fontWeight: 'bold' }}>{isDebuff ? "Debuff Reader" : "Buff Reader"}</p>
      <p style={{ margin: 0, fontSize: '0.9em' }}>Status: {status}</p>
    </div>
  );
}