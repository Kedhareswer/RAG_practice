'use client';

import { useState } from 'react';
import { Send, Loader2, BookOpen } from 'lucide-react';

interface Source {
  source: string;
  page?: number;
  content: string;
}

interface Message {
  type: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

interface ChatInterfaceProps {
  apiKey: string;
  disabled: boolean;
}

export default function ChatInterface({ apiKey, disabled }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || loading || disabled) return;

    const userMessage: Message = {
      type: 'user',
      content: input,
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      const assistantMessage: Message = {
        type: 'assistant',
        content: data.answer,
        sources: data.sources,
      };

      setMessages((prev: Message[]) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        type: 'assistant',
        content: `Error: ${error.message}`,
      };
      setMessages((prev: Message[]) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Ask Questions</h2>

      {/* Messages */}
      <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-lg">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Ask a question about your documents</p>
          </div>
        ) : (
          messages.map((message: Message, index: number) => (
            <div key={index}>
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-100 ml-auto max-w-[80%]'
                    : 'bg-white border border-gray-200 mr-auto max-w-[90%]'
                }`}
              >
                <p className="text-sm font-semibold mb-1 text-gray-700">
                  {message.type === 'user' ? 'You' : 'Assistant'}
                </p>
                <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 ml-4 space-y-1">
                  <p className="text-xs font-semibold text-gray-600">Sources:</p>
                  {message.sources.map((source: Source, idx: number) => (
                    <div key={idx} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-300">
                      • {source.source}
                      {source.page && ` (Page ${source.page})`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm">Thinking...</p>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? 'Upload documents first...' : 'Type your question...'}
          disabled={disabled || loading}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={disabled || loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
}
