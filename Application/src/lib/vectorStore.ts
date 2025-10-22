import { DocumentChunk, VectorStoreEntry } from '@/types';
import { cosineSimilarity } from './embeddings';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * In-memory vector store with similarity search
 */
export class VectorStore {
  private entries: VectorStoreEntry[] = [];

  /**
   * Add documents with embeddings to the store
   */
  addDocuments(documents: DocumentChunk[]): void {
    for (const doc of documents) {
      if (!doc.embedding) {
        throw new Error('Document must have an embedding');
      }

      this.entries.push({
        id: randomUUID(),
        embedding: doc.embedding,
        document: doc,
      });
    }
  }

  /**
   * Search for similar documents
   */
  async similaritySearch(
    queryEmbedding: number[],
    k: number = 4
  ): Promise<DocumentChunk[]> {
    if (this.entries.length === 0) {
      return [];
    }

    // Calculate similarity scores for all entries
    const scores = this.entries.map((entry) => ({
      entry,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    // Sort by score (descending) and take top k
    scores.sort((a, b) => b.score - a.score);
    const topK = scores.slice(0, k);

    return topK.map((item) => item.entry.document);
  }

  /**
   * Get the number of documents in the store
   */
  size(): number {
    return this.entries.length;
  }

  /**
   * Clear all documents from the store
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get all documents
   */
  getAllDocuments(): DocumentChunk[] {
    return this.entries.map((entry) => entry.document);
  }

  /**
   * Serialize the vector store to JSON
   */
  toJSON(): string {
    return JSON.stringify({
      entries: this.entries,
      version: '1.0',
    });
  }

  /**
   * Deserialize the vector store from JSON
   */
  static fromJSON(json: string): VectorStore {
    const data = JSON.parse(json);
    const store = new VectorStore();
    store.entries = data.entries;
    return store;
  }
}

// Global vector store instance (in-memory for this session)
let globalVectorStore: VectorStore | null = null;
const STORAGE_DIR = path.join(process.cwd(), '.cache');
const STORAGE_FILE = path.join(STORAGE_DIR, 'vector-store.json');

/**
 * Ensure storage directory exists
 */
function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Save vector store to file system
 */
function saveToFile(store: VectorStore): void {
  try {
    ensureStorageDir();
    const data = store.toJSON();
    fs.writeFileSync(STORAGE_FILE, data, 'utf-8');
    console.log(`✓ Saved ${store.size()} documents to persistent storage`);
  } catch (error) {
    console.error('Failed to save vector store to file:', error);
  }
}

/**
 * Load vector store from file system
 */
function loadFromFile(): VectorStore | null {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const store = VectorStore.fromJSON(data);
      console.log(`✓ Loaded ${store.size()} documents from persistent storage`);
      return store;
    }
  } catch (error) {
    console.error('Failed to load vector store from file:', error);
  }
  return null;
}

/**
 * Get or create the global vector store with persistence
 */
export function getVectorStore(): VectorStore {
  if (!globalVectorStore) {
    // Try to load from file first
    const stored = loadFromFile();
    globalVectorStore = stored || new VectorStore();
  }
  return globalVectorStore;
}

/**
 * Add documents and persist to storage
 */
export function addDocumentsWithPersistence(documents: DocumentChunk[]): void {
  const store = getVectorStore();
  store.addDocuments(documents);
  saveToFile(store);
}

/**
 * Reset the global vector store and clear storage
 */
export function resetVectorStore(): void {
  globalVectorStore = new VectorStore();
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      fs.unlinkSync(STORAGE_FILE);
      console.log('✓ Cleared persistent storage');
    }
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/**
 * Clear storage file
 */
export function clearStorage(): void {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      fs.unlinkSync(STORAGE_FILE);
      console.log('✓ Cleared vector store from persistent storage');
    }
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}
