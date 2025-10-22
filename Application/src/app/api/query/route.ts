import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, cosineSimilarity } from '@/lib/embeddings';
import { getVectorStore } from '@/lib/vectorStore';
import { generateAnswer } from '@/lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute

function calculateRAGMetrics(
  queryEmbedding: number[],
  relevantDocs: any[],
  totalDocs: number,
  responseTime: number
) {
  if (relevantDocs.length === 0) {
    return {
      precision: 0,
      recall: 0,
      relevanceScore: 0,
      responseTime,
      sourcesUsed: 0,
      totalSources: totalDocs
    };
  }

  // Calculate relevance scores for each document
  const relevanceScores = relevantDocs.map(doc => 
    cosineSimilarity(queryEmbedding, doc.embedding || [])
  );

  // Calculate average relevance score
  const avgRelevanceScore = relevanceScores.reduce((sum, score) => sum + score, 0) / relevanceScores.length;

  // Precision: How many of the retrieved documents are relevant (threshold: 0.5 for better sensitivity)
  const relevanceThreshold = 0.5;
  const relevantRetrieved = relevanceScores.filter(score => score >= relevanceThreshold).length;
  const precision = relevantRetrieved / relevantDocs.length;

  // Recall: Estimate based on relevance scores and total documents
  // This is a simplified calculation - assumes we retrieved most relevant docs
  const estimatedRelevantTotal = Math.max(Math.min(totalDocs * 0.15, 15), relevantRetrieved);
  const recall = relevantRetrieved / estimatedRelevantTotal;

  return {
    precision,
    recall,
    relevanceScore: avgRelevanceScore,
    responseTime,
    sourcesUsed: relevantDocs.length,
    totalSources: totalDocs
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { query, apiKey, settings } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    console.log(`Processing query: ${query}`);

    // Get vector store (will auto-load from persistent storage if available)
    const vectorStore = getVectorStore();
    
    if (vectorStore.size() === 0) {
      return NextResponse.json(
        { 
          error: 'No documents found. Please upload your documents first.' 
        },
        { status: 400 }
      );
    }
    
    console.log(`Using ${vectorStore.size()} document chunks from vector store`);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    console.log('Generated query embedding');

    // Search for similar documents (use topK from settings if provided)
    const topK = settings?.topK || 4;
    const relevantDocs = await vectorStore.similaritySearch(queryEmbedding, topK);
    console.log(`Found ${relevantDocs.length} relevant documents`);

    if (relevantDocs.length === 0) {
      const responseTime = Date.now() - startTime;
      return NextResponse.json({
        answer: 'No relevant information found in the uploaded documents.',
        sources: [],
        metrics: calculateRAGMetrics(queryEmbedding, [], vectorStore.size(), responseTime)
      });
    }

    // Generate answer using Gemini with custom system prompt if provided
    const answer = await generateAnswer(
      query, 
      relevantDocs, 
      apiKey, 
      settings?.systemPrompt,
      settings?.temperature,
      settings?.model
    );
    console.log('Generated answer');

    const responseTime = Date.now() - startTime;

    // Calculate relevance scores for sources
    const sourcesWithScores = relevantDocs.map((doc) => {
      const relevanceScore = cosineSimilarity(queryEmbedding, doc.embedding || []);
      return {
        source: doc.metadata.source,
        page: doc.metadata.page,
        content: doc.pageContent.substring(0, 200) + '...',
        relevanceScore
      };
    });

    // Calculate metrics
    const metrics = calculateRAGMetrics(
      queryEmbedding,
      relevantDocs,
      vectorStore.size(),
      responseTime
    );

    return NextResponse.json({
      answer,
      sources: sourcesWithScores,
      metrics
    });
  } catch (error: any) {
    console.error('Error in query route:', error);
    
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid Google API key. Please check your API key and try again.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to process query' },
      { status: 500 }
    );
  }
}
