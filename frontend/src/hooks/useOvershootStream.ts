/**
 * useOvershootStream Hook
 * Handles streaming inference from Overshoot AI
 */

import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

export interface OvershootStreamConfig {
  prompt: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  sessionId?: string;
  userId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface OvershootStreamResult {
  text: string;
  streaming: boolean;
  error: string | null;
  clusterId: string | null;
  latency: number | null;
  startStream: (config: OvershootStreamConfig) => Promise<void>;
  stopStream: () => void;
  clear: () => void;
}

export function useOvershootStream(): OvershootStreamResult {
  const [text, setText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clusterId, setClusterId] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startStream = useCallback(async (config: OvershootStreamConfig) => {
    setStreaming(true);
    setError(null);
    setText('');
    setClusterId(null);
    setLatency(null);
    
    startTimeRef.current = Date.now();
    
    // Create new AbortController for this stream
    abortControllerRef.current = new AbortController();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_OVERSHOOT_API_URL || 'http://localhost:8001';
      
      const response = await fetch(`${apiUrl}/api/inference/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: config.prompt,
          difficulty: config.difficulty || 'medium',
          session_id: config.sessionId,
          user_id: config.userId,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;

          try {
            const data = JSON.parse(line);
            
            if (data.token) {
              accumulatedText += data.token;
              setText(accumulatedText);
            }
            
            if (data.cluster_id) {
              setClusterId(data.cluster_id);
            }
            
            if (data.error) {
              throw new Error(data.error);
            }
          } catch (e) {
            // Skip invalid JSON lines
            if (e instanceof SyntaxError) {
              continue;
            }
            throw e;
          }
        }
      }

      // Calculate latency
      if (startTimeRef.current) {
        setLatency(Date.now() - startTimeRef.current);
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Stream was cancelled, this is expected
        return;
      }
      setError(err.message || 'Streaming failed');
    } finally {
      setStreaming(false);
    }
  }, []);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreaming(false);
  }, []);

  const clear = useCallback(() => {
    setText('');
    setError(null);
    setClusterId(null);
    setLatency(null);
    stopStream();
  }, [stopStream]);

  return {
    text,
    streaming,
    error,
    clusterId,
    latency,
    startStream,
    stopStream,
    clear,
  };
}
