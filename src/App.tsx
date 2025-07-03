import React, { useCallback, useState, useEffect } from 'react';
import { get_encoding } from '@dqbd/tiktoken';

const ENCODINGS: Record<string, string> = {
  'gpt-4o': 'o200k_base',
  'gpt-4.1-family': 'cl100k_base',
  'gemini-2.5': '', // Gemini é estimativa
};

const MODELS = [
  {
    label: 'GPT-4o & GPT-4o mini',
    value: 'gpt-4o',
    group: 'openai-4o',
  },
  {
    label: 'GPT-4.1, 4.1-mini & 4.5',
    value: 'gpt-4.1-family',
    group: 'openai-4.1-family',
  },
  {
    label: 'Gemini 2.5 Pro & Gemini Flash',
    value: 'gemini-2.5',
    group: 'gemini',
  },
];

const BUTTON_WIDTH = 270;
const BUTTON_CONTAINER_WIDTH = 270;

const App: React.FC = () => {
  const [tokens, setTokens] = useState<number | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [fileText, setFileText] = useState<string | null>(null);
  const [isEstimate, setIsEstimate] = useState<boolean>(false);

  const calculateTokens = useCallback(async (text: string, model: string) => {
    setIsEstimate(false);
    if (model === 'gpt-4o') {
      const encodingName = ENCODINGS[model];
      try {
        const enc = await get_encoding(encodingName);
        const count = enc.encode(text).length;
        setTokens(count);
        setIsEstimate(false);
      } catch (err) {
        setTokens(null);
        setError('Erro ao calcular tokens para este modelo.');
      }
    } else if (model === 'gpt-4.1-family') {
      const encodingName = ENCODINGS[model];
      try {
        const enc = await get_encoding(encodingName);
        const count = enc.encode(text).length;
        setTokens(count);
        setIsEstimate(false);
      } catch (err) {
        setTokens(null);
        setError('Erro ao calcular tokens para este modelo.');
      }
    } else if (model === 'gemini-2.5') {
      const count = Math.ceil(text.length / 4);
      setTokens(count);
      setIsEstimate(true);
    } else {
      setTokens(null);
      setError('Modelo não suportado para contagem de tokens.');
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFilename(file.name);
    try {
      const text = await file.text();
      setFileText(text);
      setError(null);
      calculateTokens(text, selectedModel);
    } catch (err) {
      setTokens(null);
      setFileText(null);
      setError((err as Error).message);
    }
  }, [calculateTokens, selectedModel]);

  useEffect(() => {
    if (fileText) {
      calculateTokens(fileText, selectedModel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#fff' }}>
      <h1 style={{ textAlign: 'center', marginTop: 40, fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>LLM Token Counter</h1>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginTop: 48,
        gap: 56,
        width: '100%',
      }}>
        {/* Botões dos modelos */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          minWidth: BUTTON_CONTAINER_WIDTH,
          maxWidth: BUTTON_CONTAINER_WIDTH,
          width: BUTTON_CONTAINER_WIDTH,
          alignItems: 'center',
        }}>
          {MODELS.map((model) => (
            <button
              key={model.value}
              onClick={() => setSelectedModel(model.value)}
              style={{
                width: BUTTON_WIDTH,
                minWidth: BUTTON_WIDTH,
                maxWidth: BUTTON_WIDTH,
                padding: '10px 0',
                borderRadius: 6,
                border: selectedModel === model.value ? '2px solid #6366f1' : '1px solid #333',
                background: selectedModel === model.value ? '#f3f4f6' : '#fff',
                color: '#18181b',
                fontWeight: selectedModel === model.value ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                outline: 'none',
                fontSize: 15,
                boxShadow: selectedModel === model.value ? '0 2px 8px #6366f122' : 'none',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {model.label}
            </button>
          ))}
        </div>
        {/* Caixa de upload */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 400 }}>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              width: 360,
              height: 220,
              border: '2px dashed #222',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.2rem',
              cursor: 'pointer',
              background: '#fff',
              fontSize: 20
            }}>
            <p style={{ color: '#222', textAlign: 'center', width: '100%' }}>Drag &amp; drop a file here</p>
          </div>
          {filename && (
            <p style={{ marginTop: 8, fontSize: 16 }}>
              <strong>{filename}</strong> — {tokens !== null ? `${tokens} tokens` : 'Processing...'}
            </p>
          )}
          {isEstimate && (
            <span style={{ color: '#f59e42', marginLeft: 8 }}>(estimativa para Gemini)</span>
          )}
          {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default App;