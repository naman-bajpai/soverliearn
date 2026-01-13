/**
 * ChatUI Component
 * Main chat interface for the tutoring system
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { VerificationBadge } from './VerificationBadge';
import { useOvershootStream } from '../hooks/useOvershootStream';
import { useSedaProof } from '../hooks/useSedaProof';
import axios from 'axios';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  verification?: {
    sedaProof: any;
    kairoAudit: any;
    overshootStatus: any;
  };
}

export function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { startStream, text: streamText, streaming, clusterId, latency, clear: clearStream } = useOvershootStream();
  const { verifyFact, proof: sedaProof, loading: sedaLoading } = useSedaProof();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamText]);

  const handleSend = async () => {
    if (!input.trim() || loading || streaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Start streaming response
      await startStream({
        prompt: input,
        sessionId: 'session-' + Date.now(),
        difficulty: 'medium',
      });

      // Wait for stream to complete (in production, this would be handled differently)
      // For now, we'll create a placeholder message that gets updated
      const assistantMessageId = (Date.now() + 1).toString();
      
      // Check compliance with Kairo
      let kairoAudit = null;
      try {
        const kairoResponse = await axios.post('http://localhost:8000/check', {
          user_input: input,
          ai_output: streamText || 'Generating response...',
        });
        kairoAudit = kairoResponse.data;
      } catch (err) {
        console.error('Kairo check failed:', err);
      }

      // Verify facts with SEDA (would extract facts from response in production)
      let factHash = '';
      if (streamText) {
        // In production, extract facts from the response
        factHash = '0x' + Array.from(streamText.slice(0, 32))
          .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('');
        
        if (factHash.length === 66) { // Valid hash length
          await verifyFact(factHash);
        }
      }

      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: streamText || 'No response generated',
        timestamp: new Date(),
        verification: {
          sedaProof: sedaProof,
          kairoAudit: kairoAudit,
          overshootStatus: {
            clusterId: clusterId,
            latency: latency,
          },
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      clearStream();
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to generate response'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">SoveriLearn Tutor</h1>
        <p className="text-sm text-gray-600">Sovereign, Verified, and Secure AI Tutoring</p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg mb-2">Welcome to SoveriLearn!</p>
            <p className="text-sm">Ask me any educational question, and I'll provide verified, step-by-step explanations.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {message.role === 'assistant' && message.verification && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <VerificationBadge
                    sedaProof={message.verification.sedaProof}
                    kairoAudit={message.verification.kairoAudit}
                    overshootStatus={message.verification.overshootStatus}
                    loading={sedaLoading}
                  />
                </div>
              )}
              
              <div className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {streaming && (
          <div className="flex justify-start">
            <div className="max-w-3xl bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating response...</span>
              </div>
              {streamText && (
                <div className="mt-2 text-gray-900 whitespace-pre-wrap">{streamText}</div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex gap-4 max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={1}
            disabled={loading || streaming}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || streaming}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading || streaming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
