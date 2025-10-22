import { NextRequest, NextResponse } from 'next/server';
import { DocumentLoader, RecursiveCharacterTextSplitter } from '@/lib/documentLoader';
import { generateEmbeddings } from '@/lib/embeddings';
import { getVectorStore, resetVectorStore, addDocumentsWithPersistence } from '@/lib/vectorStore';
import { DocumentChunk } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`Processing ${files.length} files...`);

    // Reset vector store for new upload
    resetVectorStore();
    const vectorStore = getVectorStore();

    // Load all documents
    const allDocuments: any[] = [];
    
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const docs = await DocumentLoader.load(buffer, file.name);
        allDocuments.push(...docs);
        console.log(`Loaded ${docs.length} documents from ${file.name}`);
      } catch (error: any) {
        console.error(`Error loading ${file.name}:`, error);
        return NextResponse.json(
          { error: `Failed to load ${file.name}: ${error.message}` },
          { status: 400 }
        );
      }
    }

    console.log(`Total documents loaded: ${allDocuments.length}`);

    // Split documents into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = splitter.splitDocuments(allDocuments);
    console.log(`Split into ${chunks.length} chunks`);

    // Generate embeddings for all chunks
    const texts = chunks.map((chunk) => chunk.pageContent);
    const embeddings = await generateEmbeddings(texts);
    console.log(`Generated ${embeddings.length} embeddings`);

    // Add embeddings to chunks
    const chunksWithEmbeddings: DocumentChunk[] = chunks.map((chunk, idx) => ({
      ...chunk,
      embedding: embeddings[idx],
    }));

    // Add to vector store with persistence
    addDocumentsWithPersistence(chunksWithEmbeddings);
    console.log(`Added ${chunksWithEmbeddings.length} chunks to vector store with persistence`);

    return NextResponse.json({
      success: true,
      documentsCount: allDocuments.length,
      chunksCount: chunks.length,
      message: `Successfully processed ${files.length} file(s)`,
    });
  } catch (error: any) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process documents' },
      { status: 500 }
    );
  }
}
