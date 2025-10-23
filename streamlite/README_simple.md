# Simple RAG System

A simplified version of the RAG (Retrieval-Augmented Generation) system using Google's Gemini and LangChain.

## Quick Start

1. **Set up your Google API Key:**
   ```bash
   # Create a .env file or set environment variable
   echo GOOGLE_API_KEY=your_api_key_here > .env
   ```

2. **Run the setup script:**
   ```bash
   setup.bat
   ```

3. **Run the app:**
   ```bash
   call rag_env\Scripts\activate.bat
   streamlit run simple_rag_app.py
   ```

## What was simplified

- Removed complex dependency management
- Simplified imports to avoid version conflicts
- Removed advanced features like reranking
- Used basic document loaders (PDF and TXT only)
- Simplified UI and error handling

## Features

- Upload PDF and TXT documents
- Ask questions about your documents
- Get AI-powered answers with source references
- Simple chat interface

## Requirements

- Python 3.8+
- Google API key (for Gemini)
- Internet connection for model downloads
