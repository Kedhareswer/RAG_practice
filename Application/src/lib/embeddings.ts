import { pipeline, env } from '@xenova/transformers';

// Configure Transformer.js for Node.js environment
env.allowLocalModels = true;
env.allowRemoteModels = true;
env.useBrowserCache = false; // Disable browser cache in Node.js
env.useFS = true; // Enable file system cache for Node.js

// Set cache directory for Node.js
env.cacheDir = './.cache/transformers';

let embeddingPipeline: any = null;

/**
 * Initialize the embedding pipeline
 */
async function initPipeline() {
  if (!embeddingPipeline) {
    console.log('Loading embedding model...');
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    console.log('Embedding model loaded successfully');
  }
  return embeddingPipeline;
}

/**
 * Generate embeddings for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const pipe = await initPipeline();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const pipe = await initPipeline();
    const embeddings: number[][] = [];
    
    // Process in batches to avoid memory issues
    const batchSize = 10;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchEmbeddings = await Promise.all(
        batch.map(async (text) => {
          const output = await pipe(text, { pooling: 'mean', normalize: true });
          return Array.from(output.data as Float32Array);
        })
      );
      embeddings.push(...batchEmbeddings);
      
      // Log progress
      console.log(`Processed ${Math.min(i + batchSize, texts.length)}/${texts.length} embeddings`);
    }
    
    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}
