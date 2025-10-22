import { GoogleGenerativeAI } from '@google/generative-ai';
import { DocumentChunk } from '@/types';

/**
 * Initialize Gemini client
 */
function getGeminiClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate an answer using Gemini with RAG context
 */
export async function generateAnswer(
  query: string,
  context: DocumentChunk[],
  apiKey: string,
  systemPrompt?: string,
  temperature?: number,
  modelName?: string
): Promise<string> {
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName || 'gemini-2.5-flash',
      generationConfig: {
        temperature: temperature || 0.3,
        maxOutputTokens: 2048,
      }
    });

    // Build context from retrieved documents
    const contextText = context
      .map((doc, idx) => {
        const source = doc.metadata.source;
        const page = doc.metadata.page ? ` (Page ${doc.metadata.page})` : '';
        return `[Document ${idx + 1}: ${source}${page}]\n${doc.pageContent}`;
      })
      .join('\n\n---\n\n');

    // Use custom system prompt or default
    const defaultSystemPrompt = `You are an intelligent assistant that answers questions based on the provided context.

IMPORTANT: When citing information, add inline citations using the format [1], [2], etc. corresponding to the document numbers provided in the context.
Place citations at the end of sentences or paragraphs that use information from specific documents.

Format your response with:
- **Bold text** for emphasis
- *Italic text* for subtle emphasis  
- Bullet points with - or * for lists
- Numbered lists with 1. 2. 3. etc.
- Proper paragraph breaks for readability

If the context does not contain the answer, reply: "The information is not available in the provided documents."`;

    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

    // Create the prompt
    const prompt = `${finalSystemPrompt}

Context:
${contextText}

Question: ${query}

Answer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error generating answer with Gemini:', error);
    
    if (error.message?.includes('API key')) {
      throw new Error('Invalid or missing Google API key');
    }
    
    throw new Error('Failed to generate answer');
  }
}

/**
 * Validate API key
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    await model.generateContent('test');
    return true;
  } catch (error) {
    return false;
  }
}
