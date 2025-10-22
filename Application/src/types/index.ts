export interface Document {
  pageContent: string;
  metadata: {
    source: string;
    page?: number;
    [key: string]: any;
  };
}

export interface DocumentChunk extends Document {
  embedding?: number[];
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  content: ArrayBuffer;
}

export interface VectorStoreEntry {
  id: string;
  embedding: number[];
  document: DocumentChunk;
}

export interface Source {
  source: string;
  page?: number;
  content: string;
  relevanceScore?: number;
}

export interface QueryResult {
  answer: string;
  sources: Source[];
  metrics?: RAGMetrics;
}

export interface RAGMetrics {
  precision: number;
  recall: number;
  relevanceScore: number;
  responseTime: number;
  sourcesUsed: number;
  totalSources: number;
}

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  metrics?: RAGMetrics;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessingStatus {
  status: 'idle' | 'processing' | 'ready' | 'error';
  message?: string;
  documentsCount?: number;
  chunksCount?: number;
}

export interface AppSettings {
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topK: number;
  chunkSize: number;
  chunkOverlap: number;
  showMetrics: boolean;
  autoSave: boolean;
}

export const GEMINI_MODELS = [
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable model for complex reasoning and analysis' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Best price-performance balance (Recommended)' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', description: 'Fastest and most cost-efficient model' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Previous generation with 1M context window' },
] as const;

export interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  chunksCount: number;
  status: 'processing' | 'ready' | 'error';
}
