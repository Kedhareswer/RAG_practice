'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Bot, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { Message, Source, RAGMetrics } from '@/types';
import { MessageSkeleton } from './ui/skeleton';
import MarkdownRenderer from './MarkdownRenderer';
import InlineCitation from './InlineCitation';

interface ChatGPTInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  disabled: boolean;
  showMetrics: boolean;
}

export default function ChatGPTInterface({
  messages,
  onSendMessage,
  isLoading,
  disabled,
  showMetrics
}: ChatGPTInterfaceProps) {
  const [input, setInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;

    const message = input.trim();
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderMetrics = (metrics: RAGMetrics) => {
    if (!showMetrics) return null;

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
        <div className="text-xs text-gray-600 mb-2">Performance Metrics</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Precision:</span>
            <span className="ml-1 font-medium text-blue-600">
              {(metrics.precision * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-gray-500">Recall:</span>
            <span className="ml-1 font-medium text-green-600">
              {(metrics.recall * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-gray-500">Relevance:</span>
            <span className="ml-1 font-medium text-purple-600">
              {(metrics.relevanceScore * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-gray-500">Time:</span>
            <span className="ml-1 font-medium text-orange-600">
              {metrics.responseTime.toFixed(0)}ms
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderContentWithCitations = (content: string, sources: Source[]) => {
    if (!sources || sources.length === 0) {
      return <MarkdownRenderer content={content} />;
    }

    // Parse content and replace citation markers with interactive components
    const parts: React.ReactNode[] = [];
    const citationRegex = /\[(\d+)\]/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = citationRegex.exec(content)) !== null) {
      // Add text before citation
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        parts.push(
          <MarkdownRenderer key={`text-${key++}`} content={textBefore} />
        );
      }

      // Add citation component
      const citationNum = parseInt(match[1]);
      const source = sources[citationNum - 1];
      if (source) {
        parts.push(
          <InlineCitation
            key={`cite-${key++}`}
            citationNumber={citationNum}
            source={source.source}
            page={source.page}
            content={source.content}
            relevanceScore={source.relevanceScore}
          />
        );
      } else {
        parts.push(<span key={`cite-${key++}`}>[{citationNum}]</span>);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <MarkdownRenderer key={`text-${key++}`} content={content.substring(lastIndex)} />
      );
    }

    return <div className="inline">{parts}</div>;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              How can I help you today?
            </h3>
            <p className="text-gray-600 max-w-md">
              Upload some documents and ask me questions about their content. 
              I'll provide accurate answers based on the information in your files.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-gray-600' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {message.type === 'user' ? 'You' : 'Assistant'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>

                    <div className="prose prose-sm max-w-none">
                      <div className="text-gray-200 leading-relaxed">
                        {message.type === 'assistant' 
                          ? renderContentWithCitations(message.content, message.sources || [])
                          : <div className="whitespace-pre-wrap">{message.content}</div>
                        }
                      </div>
                    </div>

                    {/* Metrics */}
                    {message.metrics && renderMetrics(message.metrics)}

                    {/* Message Actions */}
                    {message.type === 'assistant' && (
                      <div className="flex items-center space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                          title="Copy message"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        {copiedMessageId === message.id && (
                          <span className="text-xs text-green-600">Copied!</span>
                        )}

                        <button
                          className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                          title="Good response"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        
                        <button
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Poor response"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onSendMessage(messages.find(m => m.id === message.id)?.content || '')}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                          title="Regenerate response"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">Assistant</span>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                  <MessageSkeleton />
                </div>
              </div>
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "Upload documents to start chatting..." : "Message Assistant..."}
              disabled={disabled || isLoading}
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />
            
            <button
              type="submit"
              disabled={disabled || isLoading || !input.trim()}
              className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>
              {disabled 
                ? "Upload documents to enable chat" 
                : "Press Enter to send, Shift+Enter for new line"
              }
            </span>
            <span>{input.length}/2000</span>
          </div>
        </form>
      </div>
    </div>
  );
}
