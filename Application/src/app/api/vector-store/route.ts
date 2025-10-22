import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore, resetVectorStore } from '@/lib/vectorStore';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const vectorStore = getVectorStore();
    const size = vectorStore.size();
    
    return NextResponse.json({
      success: true,
      documentsCount: size,
      status: size > 0 ? 'ready' : 'empty',
      message: size > 0 
        ? `${size} document chunks loaded and ready` 
        : 'No documents loaded. Please upload documents.'
    });
  } catch (error: any) {
    console.error('Error getting vector store status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get status' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    resetVectorStore();
    
    return NextResponse.json({
      success: true,
      message: 'Vector store cleared successfully'
    });
  } catch (error: any) {
    console.error('Error clearing vector store:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear vector store' },
      { status: 500 }
    );
  }
}
