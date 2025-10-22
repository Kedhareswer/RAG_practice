'use client';

import { useState, useEffect } from 'react';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import ChatGPTInterface from '@/components/ChatGPTInterface';
import FileUpload from '@/components/FileUpload';
import { 
  Message, 
  ChatSession, 
  DocumentInfo, 
  AppSettings, 
  RAGMetrics 
} from '@/types';

const DEFAULT_SETTINGS: AppSettings = {
  systemPrompt: `You are an intelligent assistant that answers questions based on the provided context from uploaded documents.

Instructions:
1. Use ONLY the information provided in the context to answer questions
2. If the context doesn't contain sufficient information, clearly state: "The information is not available in the provided documents"
3. Be precise and cite specific sources when possible
4. Maintain a helpful and professional tone
5. If multiple sources provide conflicting information, acknowledge this and present both perspectives

Context will be provided below each question.`,
  model: 'gemini-2.5-flash',
  temperature: 0.3,
  maxTokens: 2048,
  topK: 4,
  chunkSize: 1000,
  chunkOverlap: 200,
  showMetrics: true,
  autoSave: true
};

export default function Home() {
  // UI State
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // App State
  const [apiKey, setApiKey] = useState('');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [lastMetrics, setLastMetrics] = useState<RAGMetrics | undefined>();

  // Load saved data on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('rag-api-key');
    const savedSettings = localStorage.getItem('rag-settings');
    const savedSessions = localStorage.getItem('rag-chat-sessions');
    const savedDocuments = localStorage.getItem('rag-documents');

    if (savedApiKey) setApiKey(savedApiKey);
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedSessions) setChatSessions(JSON.parse(savedSessions));
    if (savedDocuments) setDocuments(JSON.parse(savedDocuments));
  }, []);

  // Auto-save when settings change
  useEffect(() => {
    if (settings.autoSave) {
      localStorage.setItem('rag-settings', JSON.stringify(settings));
    }
  }, [settings]);

  // Auto-save API key
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('rag-api-key', apiKey);
    }
  }, [apiKey]);

  // Auto-save chat sessions
  useEffect(() => {
    localStorage.setItem('rag-chat-sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);

  // Auto-save documents
  useEffect(() => {
    localStorage.setItem('rag-documents', JSON.stringify(documents));
  }, [documents]);

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

  const handleUploadComplete = (data: { documentsCount: number; chunksCount: number }) => {
    // Add new documents to the list
    const newDocs: DocumentInfo[] = Array.from({ length: data.documentsCount }, (_, i) => ({
      id: generateId(),
      name: `Document ${i + 1}`, // This would normally come from the upload
      type: 'pdf', // This would be determined from the file
      size: 0, // This would come from the file
      uploadedAt: new Date(),
      chunksCount: Math.floor(data.chunksCount / data.documentsCount),
      status: 'ready'
    }));

    setDocuments(prev => [...prev, ...newDocs]);
    setShowUploadModal(false);
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setCurrentMessages([]);
  };

  const handleSelectSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setCurrentMessages(session.messages);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setCurrentMessages([]);
    }
  };

  const handleClearCurrentChat = () => {
    if (currentSessionId) {
      setChatSessions(prev => 
        prev.map(session => 
          session.id === currentSessionId 
            ? { ...session, messages: [], updatedAt: new Date() }
            : session
        )
      );
      setCurrentMessages([]);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!apiKey || !content.trim()) return;

    // Create user message
    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    // Update messages immediately
    const newMessages = [...currentMessages, userMessage];
    setCurrentMessages(newMessages);

    // Create or update session
    let sessionId = currentSessionId;
    if (!sessionId) {
      const newSession: ChatSession = {
        id: generateId(),
        title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [userMessage],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setChatSessions(prev => [newSession, ...prev]);
      sessionId = newSession.id;
      setCurrentSessionId(sessionId);
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content,
          apiKey,
          settings
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      // Create assistant message
      const assistantMessage: Message = {
        id: generateId(),
        type: 'assistant',
        content: data.answer,
        sources: data.sources,
        metrics: data.metrics,
        timestamp: new Date()
      };

      const finalMessages = [...newMessages, assistantMessage];
      setCurrentMessages(finalMessages);
      setLastMetrics(data.metrics);

      // Update session
      setChatSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? { 
                ...session, 
                messages: finalMessages,
                updatedAt: new Date(),
                title: session.title === 'New Chat' ? content.substring(0, 50) + (content.length > 50 ? '...' : '') : session.title
              }
            : session
        )
      );

    } catch (error: any) {
      const errorMessage: Message = {
        id: generateId(),
        type: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      };

      const finalMessages = [...newMessages, errorMessage];
      setCurrentMessages(finalMessages);

      // Update session with error
      setChatSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? { ...session, messages: finalMessages, updatedAt: new Date() }
            : session
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canChat = documents.length > 0 && apiKey.trim() !== '';

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Left Sidebar */}
      <LeftSidebar
        isCollapsed={leftSidebarCollapsed}
        onToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        documents={documents}
        chatSessions={chatSessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClearCurrentChat={handleClearCurrentChat}
        onUploadClick={() => setShowUploadModal(true)}
        isUploading={isUploading}
        metrics={lastMetrics}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatGPTInterface
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          disabled={!canChat}
          showMetrics={settings.showMetrics}
        />
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        isCollapsed={rightSidebarCollapsed}
        onToggle={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
        settings={settings}
        onSettingsChange={setSettings}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-50 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Upload Documents</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <FileUpload 
                onUploadComplete={handleUploadComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
