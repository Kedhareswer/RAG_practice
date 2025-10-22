'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  FileText, 
  MessageSquare, 
  Trash2, 
  RotateCcw,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DocumentInfo, ChatSession, RAGMetrics } from '@/types';
import { DocumentSkeleton, MetricsSkeleton } from './ui/skeleton';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  documents: DocumentInfo[];
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearCurrentChat: () => void;
  onUploadClick: () => void;
  isUploading: boolean;
  metrics?: RAGMetrics;
}

export default function LeftSidebar({
  isCollapsed,
  onToggle,
  documents,
  chatSessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onClearCurrentChat,
  onUploadClick,
  isUploading,
  metrics
}: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<'documents' | 'chats' | 'metrics'>('documents');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors mb-4"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('documents')}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'documents' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
            }`}
          >
            <FileText className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setActiveTab('chats')}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'chats' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setActiveTab('metrics')}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === 'metrics' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">RAG Assistant</h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'documents'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Documents
        </button>
        
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'chats'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Chats
        </button>
        
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'metrics'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Metrics
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <button
              onClick={onUploadClick}
              disabled={isUploading}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              <span>{isUploading ? 'Uploading...' : 'Upload Documents'}</span>
            </button>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">
                  Uploaded Files ({documents.length})
                </h3>
                {documents.length > 0 && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Saved
                  </span>
                )}
              </div>
              
              {documents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No documents uploaded yet
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {getStatusIcon(doc.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(doc.size)} • {doc.chunksCount} chunks
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="space-y-4">
            <button
              onClick={onNewChat}
              className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>

            {currentSessionId && (
              <button
                onClick={onClearCurrentChat}
                className="w-full p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear Current Chat</span>
              </button>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Chat History ({chatSessions.length})
              </h3>
              
              {chatSessions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No chat sessions yet
                </p>
              ) : (
                <div className="space-y-2">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors group ${
                        session.id === currentSessionId
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => onSelectSession(session.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {session.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.messages.length} messages
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(session.updatedAt)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-100 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">RAG Performance</h3>
            
            {!metrics ? (
              <MetricsSkeleton />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-500">Precision</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {(metrics.precision * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-500">Recall</p>
                    <p className="text-lg font-semibold text-green-600">
                      {(metrics.recall * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-500">Relevance</p>
                    <p className="text-lg font-semibold text-purple-600">
                      {(metrics.relevanceScore * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-gray-500">Response Time</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {metrics.responseTime.toFixed(0)}ms
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-xs text-gray-500 mb-2">Sources Usage</p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Used: {metrics.sourcesUsed}</span>
                    <span>Total: {metrics.totalSources}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(metrics.sourcesUsed / metrics.totalSources) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
