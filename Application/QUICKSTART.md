# Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
cd Application
npm install
```

This will install all required packages:
- Next.js 14
- TypeScript
- Transformer.js (@xenova/transformers)
- Google Generative AI SDK
- Document processing libraries (pdf-parse, mammoth, xlsx, tesseract.js)
- UI libraries (Tailwind CSS, Lucide React)

### 2. Get Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 3. Start Development Server
```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## First Time Usage

### Step 1: Enter API Key
- Paste your Google Gemini API key in the input field at the top of the page
- The key is only stored in your browser session (not on the server)

### Step 2: Upload Documents
1. Click the upload area or drag files into it
2. Select one or more files:
   - **Documents**: PDF, DOCX, TXT, MD
   - **Data**: CSV, XLSX, JSON
   - **Images**: JPG, PNG (OCR will extract text)
3. Click "Upload X File(s)" button
4. Wait for processing (you'll see a progress indicator)
5. Success message will show number of documents and chunks created

### Step 3: Ask Questions
1. Type your question in the chat input field
2. Press Enter or click the Send button
3. Wait for the AI to generate an answer
4. View the answer and source citations

## Example Workflow

### Example 1: Research Papers
```
1. Upload: research_paper.pdf
2. Ask: "What is the main hypothesis of this study?"
3. Ask: "What were the key findings?"
4. Ask: "What are the limitations mentioned?"
```

### Example 2: Business Documents
```
1. Upload: quarterly_report.xlsx, meeting_notes.docx
2. Ask: "What was the revenue growth this quarter?"
3. Ask: "What action items were discussed in the meeting?"
```

### Example 3: Mixed Documents
```
1. Upload: contract.pdf, invoice.csv, product_image.jpg
2. Ask: "What are the payment terms in the contract?"
3. Ask: "What items are listed in the invoice?"
4. Ask: "What product is shown in the image?"
```

## Tips for Best Results

### Document Upload
- ✅ Upload related documents together for better context
- ✅ Use clear, readable documents
- ✅ Ensure PDFs are not password-protected
- ⚠️ Large files (>10MB) may take longer to process
- ⚠️ Image OCR works best with clear, high-contrast text

### Asking Questions
- ✅ Be specific in your questions
- ✅ Ask one question at a time
- ✅ Reference specific topics from your documents
- ✅ Use follow-up questions to dig deeper
- ⚠️ The AI can only answer based on uploaded documents
- ⚠️ If information isn't in the documents, it will say so

### Performance
- First upload takes longer (embedding model downloads)
- Subsequent uploads are faster (model is cached)
- Processing time depends on:
  - Number of files
  - File sizes
  - Document complexity
  - Your internet speed (for model download)

## Troubleshooting

### Upload Issues
**Problem**: Upload fails or hangs
- Check file format is supported
- Ensure file isn't corrupted
- Try smaller files first
- Check browser console for errors

**Problem**: "Failed to load PDF"
- Ensure PDF isn't password-protected
- Try opening PDF in another viewer first
- Re-save PDF if possible

### Query Issues
**Problem**: "Invalid API key"
- Double-check key from Google AI Studio
- Ensure no extra spaces when pasting
- Try generating a new key

**Problem**: "No relevant information found"
- Documents may not contain the answer
- Try rephrasing your question
- Upload more relevant documents

### Performance Issues
**Problem**: Slow processing
- First run downloads embedding model (~100MB)
- Check internet connection
- Close other browser tabs
- Try processing fewer files at once

**Problem**: Out of memory
- Reduce number of uploaded files
- Process documents in batches
- Restart the development server

## Advanced Usage

### Environment Variables
Create `.env.local` to set default API key:
```bash
GOOGLE_API_KEY=your_key_here
```

### Custom Configuration
Edit `next.config.mjs` to adjust:
- Max file size
- Timeout durations
- Webpack configurations

### Deployment
Build for production:
```bash
npm run build
npm start
```

## What Happens Behind the Scenes

### When You Upload Documents:
1. Files are sent to `/api/upload`
2. Each file is processed by the appropriate loader
3. Text is extracted (OCR for images)
4. Documents are split into 1000-character chunks
5. Transformer.js generates embeddings for each chunk
6. Embeddings are stored in the vector database

### When You Ask a Question:
1. Query is sent to `/api/query` with your API key
2. Query is converted to an embedding
3. Vector database finds 4 most similar chunks
4. Chunks are sent to Gemini as context
5. Gemini generates an answer based on context
6. Answer and sources are returned to you

## Next Steps

- Try different document types
- Experiment with complex queries
- Upload multiple related documents
- Compare answers from different sources
- Build your own document knowledge base

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review the [Architecture](#architecture) section
- Open an issue on GitHub
- Check browser console for error messages

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Transformer.js Guide](https://huggingface.co/docs/transformers.js)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
