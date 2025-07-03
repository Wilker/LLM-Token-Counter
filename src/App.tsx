import React, { useCallback, useState } from 'react';
import { get_encoding } from '@dqbd/tiktoken';

const encodingPromise = get_encoding('cl100k_base');

const App: React.FC = () => {
  const [tokens, setTokens] = useState<number | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFilename(file.name);
    try {
      const text = await file.text();
      const enc = await encodingPromise;
      const count = enc.encode(text).length;
      setTokens(count);
      setError(null);
    } catch (err) {
      setTokens(null);
      setError((err as Error).message);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '4rem'
    }}>
      <h1>LLM Token Counter</h1>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          width: 320,
          height: 200,
          border: '2px dashed #666',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          cursor: 'pointer'
        }}>
        <p>Drag &amp; drop a file here</p>
      </div>
      {filename && (
        <p>
          <strong>{filename}</strong> — {tokens !== null ? `${tokens} tokens` : 'Processing...'}
        </p>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
};

export default App;