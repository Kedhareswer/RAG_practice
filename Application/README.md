# RAG Q&A Application - Next.js + Transformer.js

A powerful Retrieval Augmented Generation (R&A) chatbot with persistent document storage, built with Next.js, TypeScript, and Transformer.js. Features client-side embeddings, multi-format document support, and a modern ChatGPT-like interface.

A powerful Retrieval Augmented Generation (RAG) Q&A chatbot built with Next.js, TypeScript, and Transformer.js. This application runs entirely standalone with client-side embeddings and supports multiple document formats.

## ✨ Key Features

### 🗂️ Document Processing
- 📄 **Multi-format Support**: PDF, DOCX, TXT, CSV, Excel, JSON, Markdown, Images (JPG, PNG)
- 🔄 **Persistent Storage**: Documents and embeddings saved between sessions
- 🔍 **Advanced Search**: Semantic search with cosine similarity
- 🔄 **Auto-save**: All changes automatically persisted

### 🤖 AI & ML
- 🧠 **Local Embeddings**: Transformer.js with all-MiniLM-L6-v2
- 💡 **Smart Context**: Retrieval Augmented Generation (RAG)
- 🌐 **LLM Integration**: Google Gemini 2.0 Flash API
- ⚡ **Batch Processing**: Efficient embedding generation

### 🎨 Modern Interface
- 💬 **ChatGPT-like UI**: Familiar messaging interface
- 🌓 **Dark Theme**: Easy on the eyes
- 📱 **Responsive Design**: Works on all devices
- 🎭 **Collapsible Sidebars**: Maximize your workspace

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Icons**: Lucide React

### AI & ML
- **Embeddings**: Transformer.js (@xenova/transformers)
- **Model**: sentence-transformers/all-MiniLM-L6-v2
- **LLM**: Google Gemini 2.0 Flash

### Document Processing
- **PDF**: pdf-parse
- **DOCX**: mammoth
- **Excel/CSV**: xlsx
- **Images**: tesseract.js (OCR)
- **JSON/Markdown**: Native parsing

### Storage
- **Vector Store**: In-memory with disk persistence
- **Cache**: File system based
- **Session Management**: Automatic state persistence

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- npm or yarn package manager

### Installation

1. Clone the repository and navigate to the project directory:
```bash
git clone [your-repo-url]
cd RAG/Application
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Add your Google API key to `.env.local` (or enter it in the UI):
```
GOOGLE_API_KEY=your_api_key_here
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 User Guide

### 🏁 Getting Started
1. **Enter your API Key**
   - Paste your Google Gemini API key in the top bar
   - Or set it in `.env.local` as `GOOGLE_API_KEY`
   - Get your key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. **Upload Documents**
   - Click "Upload Documents" or drag & drop files
   - Supports multiple files in one go
   - Supported formats: PDF, DOCX, TXT, CSV, XLSX, JSON, MD, JPG, PNG
   - Documents are automatically processed and saved

3. **Chat with Your Documents**
   - Type your question in the chat input
   - Press Enter or click the send button
   - View AI-generated answers with source citations
   - Conversation history is automatically saved

### 🔄 Document Persistence
- Uploaded documents and their embeddings are automatically saved
- Data persists across page refreshes and server restarts
- No need to re-upload documents
- Clear all data anytime from the settings

### ⚙️ Settings & Configuration
- **Model Settings**: Adjust temperature, max tokens
- **RAG Parameters**: Configure chunk size, overlap, and top-K results
- **System Prompt**: Customize the AI's behavior
- **Theme**: Toggle between light and dark mode

## 🏗️ Architecture Overview

### Frontend Components
- **Left Sidebar**: Document management and chat history
- **Right Sidebar**: Settings and configuration
- **Chat Interface**: Message display and input
- **File Upload**: Drag & drop with progress tracking
- **Settings Panel**: Model and RAG configuration

### Backend API Routes
- **`/api/upload`**: 
  - Handles document uploads and processing
  - Supports batch processing of multiple files
  - Generates and stores embeddings
  - Auto-saves to persistent storage
  
- **`/api/query`**:
  - Processes natural language queries
  - Performs semantic search
  - Generates contextual responses
  - Returns sources and confidence scores
  
- **`/api/vector-store`**:
  - Manages document persistence
  - Provides status and metrics
  - Handles clearing of stored data

## 🧩 Core Components

### `documentLoader.ts`
- **DocumentLoader**: Unified interface for all document types
- **RecursiveCharacterTextSplitter**: Intelligent text chunking with overlap
- **Format Support**:
  - PDF: Full text extraction with metadata
  - DOCX: Preserves formatting and structure
  - Images: OCR with Tesseract.js
  - Spreadsheets: Tabular data extraction
  - JSON: Structured data parsing

### `embeddings.ts`
- **Transformer.js Integration**: Local embedding generation
- **Batch Processing**: Optimized for performance
- **Vector Operations**:
  - Cosine similarity
  - L2 normalization
  - Batch processing
- **Caching**: Redundant computation prevention

### `vectorStore.ts`
- **In-Memory Store**: Fast vector search
- **Persistence Layer**:
  - Automatic saving to disk
  - Loading on startup
  - Versioning support
- **Search Features**:
  - Top-K nearest neighbors
  - Similarity thresholding
  - Metadata filtering

### `gemini.ts`
- **API Client**: Handles all Gemini API communication
- **Prompt Engineering**:
  - Context window management
  - System message templating
  - Response formatting
- **Error Handling**:
  - Rate limiting
  - Timeouts
  - Fallback responses

## 📁 Project Structure

```
Application/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/              # Document processing
│   │   │   │   └── route.ts         
│   │   │   ├── query/               # RAG query endpoint
│   │   │   │   └── route.ts         
│   │   │   └── vector-store/        # Persistence management
│   │   │       └── route.ts         
│   │   ├── page.tsx                 # Main application page
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── ui/                      # Shadcn UI components
│   │   ├── FileUpload.tsx           # File upload interface
│   │   ├── ChatInterface.tsx        # Chat UI components
│   │   └── LeftSidebar.tsx          # Navigation and documents
│   ├── lib/
│   │   ├── embeddings.ts            # Text embeddings
│   │   ├── vectorStore.ts           # Vector database
│   │   ├── documentLoader.ts        # Document processing
│   │   └── gemini.ts                # LLM integration
│   └── types/                       # TypeScript types
├── public/                          # Static assets
├── .cache/                          # Persistent storage
│   └── vector-store.json            # Document embeddings
├── .env.local                       # Environment variables
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts               # Tailwind CSS config
├── next.config.mjs                  # Next.js config
└── README.md                        # This file
```
```

## 🔄 How It Works

### Document Processing Pipeline
1. **Upload & Extraction**
   - Files uploaded via drag & drop or file picker
   - Automatic format detection and processing
   - Text extraction with format-specific parsers
   - OCR for images using Tesseract.js

2. **Text Processing**
   - Smart chunking with configurable size/overlap
   - Metadata extraction and preservation
   - Language detection and normalization

3. **Embedding Generation**
   - Local embedding model (all-MiniLM-L6-v2)
   - Batch processing for efficiency
   - Vector normalization
   - Automatic persistence to disk

4. **Query Processing**
   - Natural language query understanding
   - Semantic search with cosine similarity
   - Context-aware response generation
   - Source attribution and citations

5. **Response Generation**
   - Context-aware prompt construction
   - Multi-turn conversation support
   - Confidence scoring
   - Fallback handling

## 🚀 Performance & Optimization

### Optimized Processing
- **Batch Processing**: Parallel embedding generation
- **Smart Chunking**: 1000-character chunks with 200-character overlap
- **Efficient Storage**: Compressed vector storage
- **Lazy Loading**: Models loaded on demand

### Caching Strategy
- **Embedding Cache**: Avoids redundant computations
- **Browser Storage**: Local state persistence
- **File System**: Persistent document storage
- **Memory Management**: Automatic cleanup of old data
- **Lazy Loading**: Transformer.js model loaded on first use
- **Streaming**: Future enhancement for real-time responses

## Limitations

- **Session-based**: Vector store resets on server restart
- **Memory**: Large document sets may require optimization
- **Single User**: Not designed for multi-user concurrent access
- **API Key**: Required for each query (not stored server-side)

## Future Enhancements

- [ ] Persistent vector storage (PostgreSQL with pgvector)
- [ ] User authentication and document management
- [ ] Streaming responses
- [ ] Multiple embedding models
- [ ] Document preview and highlighting
- [ ] Export conversation history
- [ ] Advanced filtering and search
- [ ] Multi-language support

## Troubleshooting

### "Failed to load embedding model"
- Check internet connection (model downloads from Hugging Face)
- Ensure sufficient disk space for model cache
- Try clearing Next.js cache: `rm -rf .next`

### "Invalid Google API key"
- Verify key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check API is enabled for your project
- Ensure no extra spaces in key

### "Failed to load PDF"
- Ensure PDF is not password-protected
- Check file is not corrupted
- Try re-saving PDF from another application

### Upload hangs
- Check file size (large files take longer)
- Monitor browser console for errors
- Ensure sufficient server memory

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- [Transformer.js](https://github.com/xenova/transformers.js) by Xenova
- [Google Gemini](https://ai.google.dev/) for LLM capabilities
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Hugging Face](https://huggingface.co/) for the embedding model
