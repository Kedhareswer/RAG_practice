import { Document } from '@/types';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { createWorker } from 'tesseract.js';

export class DocumentLoader {
  /**
   * Load a PDF document
   */
  static async loadPDF(buffer: Buffer, filename: string): Promise<Document[]> {
    try {
      const data = await pdfParse(buffer);
      const pages = data.text.split('\f'); // Form feed character separates pages
      
      return pages.map((pageContent, index) => ({
        pageContent: pageContent.trim(),
        metadata: {
          source: filename,
          page: index + 1,
          totalPages: pages.length,
        },
      })).filter(doc => doc.pageContent.length > 0);
    } catch (error) {
      console.error(`Error loading PDF ${filename}:`, error);
      throw new Error(`Failed to load PDF: ${filename}`);
    }
  }

  /**
   * Load a DOCX document
   */
  static async loadDOCX(buffer: Buffer, filename: string): Promise<Document[]> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return [{
        pageContent: result.value,
        metadata: {
          source: filename,
        },
      }];
    } catch (error) {
      console.error(`Error loading DOCX ${filename}:`, error);
      throw new Error(`Failed to load DOCX: ${filename}`);
    }
  }

  /**
   * Load a text file (TXT, MD)
   */
  static async loadText(buffer: Buffer, filename: string): Promise<Document[]> {
    try {
      const text = buffer.toString('utf-8');
      return [{
        pageContent: text,
        metadata: {
          source: filename,
        },
      }];
    } catch (error) {
      console.error(`Error loading text file ${filename}:`, error);
      throw new Error(`Failed to load text file: ${filename}`);
    }
  }

  /**
   * Load a CSV file
   */
  static async loadCSV(buffer: Buffer, filename: string): Promise<Document[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      
      // Split into rows and create a document for each row
      const rows = csvData.split('\n').filter(row => row.trim().length > 0);
      const header = rows[0];
      
      return rows.slice(1).map((row, index) => ({
        pageContent: `${header}\n${row}`,
        metadata: {
          source: filename,
          row: index + 2, // +2 because we skip header and 0-index
        },
      }));
    } catch (error) {
      console.error(`Error loading CSV ${filename}:`, error);
      throw new Error(`Failed to load CSV: ${filename}`);
    }
  }

  /**
   * Load an Excel file
   */
  static async loadExcel(buffer: Buffer, filename: string): Promise<Document[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const documents: Document[] = [];
      
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const content = data
          .map((row: any) => (row as any[]).join(' | '))
          .join('\n');
        
        documents.push({
          pageContent: content,
          metadata: {
            source: filename,
            sheet: sheetName,
          },
        });
      }
      
      return documents;
    } catch (error) {
      console.error(`Error loading Excel ${filename}:`, error);
      throw new Error(`Failed to load Excel: ${filename}`);
    }
  }

  /**
   * Load a JSON file
   */
  static async loadJSON(buffer: Buffer, filename: string): Promise<Document[]> {
    try {
      const text = buffer.toString('utf-8');
      const data = JSON.parse(text);
      
      // Convert JSON to readable text
      const content = JSON.stringify(data, null, 2);
      
      return [{
        pageContent: content,
        metadata: {
          source: filename,
        },
      }];
    } catch (error) {
      console.error(`Error loading JSON ${filename}:`, error);
      throw new Error(`Failed to load JSON: ${filename}`);
    }
  }

  /**
   * Load an image using OCR
   */
  static async loadImage(buffer: Buffer, filename: string): Promise<Document[]> {
    try {
      const worker = await createWorker('eng');
      const { data } = await worker.recognize(buffer);
      await worker.terminate();
      
      return [{
        pageContent: data.text,
        metadata: {
          source: filename,
          confidence: data.confidence,
        },
      }];
    } catch (error) {
      console.error(`Error loading image ${filename}:`, error);
      throw new Error(`Failed to load image: ${filename}`);
    }
  }

  /**
   * Main loader that routes to appropriate handler
   */
  static async load(buffer: Buffer, filename: string): Promise<Document[]> {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return this.loadPDF(buffer, filename);
      case 'docx':
        return this.loadDOCX(buffer, filename);
      case 'txt':
      case 'md':
        return this.loadText(buffer, filename);
      case 'csv':
        return this.loadCSV(buffer, filename);
      case 'xlsx':
      case 'xls':
        return this.loadExcel(buffer, filename);
      case 'json':
        return this.loadJSON(buffer, filename);
      case 'jpg':
      case 'jpeg':
      case 'png':
        return this.loadImage(buffer, filename);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }
}

/**
 * Text splitter for chunking documents
 */
export class RecursiveCharacterTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];

  constructor(options: { chunkSize?: number; chunkOverlap?: number } = {}) {
    this.chunkSize = options.chunkSize || 1000;
    this.chunkOverlap = options.chunkOverlap || 200;
    this.separators = ['\n\n', '\n', '. ', ' ', ''];
  }

  splitDocuments(documents: Document[]): Document[] {
    const chunks: Document[] = [];
    
    for (const doc of documents) {
      const textChunks = this.splitText(doc.pageContent);
      
      for (let i = 0; i < textChunks.length; i++) {
        chunks.push({
          pageContent: textChunks[i],
          metadata: {
            ...doc.metadata,
            chunk: i,
            totalChunks: textChunks.length,
          },
        });
      }
    }
    
    return chunks;
  }

  private splitText(text: string): string[] {
    if (text.length <= this.chunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    let currentChunk = '';

    for (const separator of this.separators) {
      if (separator === '') {
        // Last resort: split by character
        return this.splitByCharacter(text);
      }

      const parts = text.split(separator);
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i] + (i < parts.length - 1 ? separator : '');
        
        if (currentChunk.length + part.length <= this.chunkSize) {
          currentChunk += part;
        } else {
          if (currentChunk) {
            chunks.push(currentChunk);
          }
          currentChunk = part;
        }
      }

      if (currentChunk) {
        chunks.push(currentChunk);
      }

      if (chunks.length > 0) {
        return this.addOverlap(chunks);
      }
    }

    return chunks;
  }

  private splitByCharacter(text: string): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += this.chunkSize - this.chunkOverlap) {
      chunks.push(text.slice(i, i + this.chunkSize));
    }
    return chunks;
  }

  private addOverlap(chunks: string[]): string[] {
    if (this.chunkOverlap === 0 || chunks.length <= 1) {
      return chunks;
    }

    const overlappedChunks: string[] = [chunks[0]];
    
    for (let i = 1; i < chunks.length; i++) {
      const prevChunk = chunks[i - 1];
      const currentChunk = chunks[i];
      const overlap = prevChunk.slice(-this.chunkOverlap);
      overlappedChunks.push(overlap + currentChunk);
    }

    return overlappedChunks;
  }
}
