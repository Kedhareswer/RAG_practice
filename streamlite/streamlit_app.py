import streamlit as st
import os
import tempfile
import pandas as pd
from pathlib import Path

# LangChain and Google Gemini
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Document loaders
from langchain_community.document_loaders import (
    TextLoader, PyPDFLoader, JSONLoader, Docx2txtLoader,
    CSVLoader, UnstructuredExcelLoader
)
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

# OCR
import easyocr
reader = easyocr.Reader(['en'], gpu=False)


# ---------- App Configuration ----------
st.set_page_config(page_title="RAG Q&A with Gemini + LangChain", layout="wide")
st.title("RAG Q&A Chatbot using Gemini + LangChain")
st.caption("Supports multiple file types: PDF, DOCX, TXT, CSV, Excel, JSON, Markdown, Images")


# ---------- Sidebar for File Upload ----------
st.sidebar.header("Upload Documents")
uploaded_files = st.sidebar.file_uploader(
    "Upload your documents here",
    type=["pdf", "docx", "txt", "csv", "xlsx", "json", "md", "jpeg", "jpg", "png"],
    accept_multiple_files=True
)


# ---------- Document Loading ----------
def load_documents(files):
    docs = []
    for file in files:
        filename = file.name
        suffix = Path(filename).suffix.lower()

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(file.read())
            tmp_path = tmp.name

        try:
            if suffix == ".pdf":
                loader = PyPDFLoader(tmp_path)
                docs.extend(loader.load())
            elif suffix == ".docx":
                loader = Docx2txtLoader(tmp_path)
                docs.extend(loader.load())
            elif suffix == ".txt" or suffix == ".md":
                loader = TextLoader(tmp_path)
                docs.extend(loader.load())
            elif suffix == ".csv":
                loader = CSVLoader(tmp_path)
                docs.extend(loader.load())
            elif suffix in [".xls", ".xlsx"]:
                loader = UnstructuredExcelLoader(tmp_path)
                docs.extend(loader.load())
            elif suffix == ".json":
                loader = JSONLoader(file_path=tmp_path, jq_schema=".")  # loads all
                docs.extend(loader.load())
            elif suffix in [".jpg", ".jpeg", ".png"]:
                text = "\n".join([x[1] for x in reader.readtext(tmp_path)])
                docs.append(Document(page_content=text, metadata={"source": filename}))
            else:
                st.warning(f"⚠️ Skipping unsupported file: {filename}")
        except Exception as e:
            st.error(f"❌ Error loading {filename}: {e}")

    return docs


# ---------- Processing Uploaded Files ----------
if uploaded_files:
    with st.spinner("📚 Processing documents..."):
        docs = load_documents(uploaded_files)

        # Split into chunks
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_documents(docs)

        st.success(f"✅ Loaded and chunked {len(docs)} documents into {len(chunks)} chunks.")
else:
    st.info("👈 Upload files to begin.")
    st.stop()


# ---------- Create Embeddings + FAISS Index ----------
with st.spinner("🔢 Creating vector embeddings..."):
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = FAISS.from_documents(chunks, embedding=embedding_model)
    retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 4})
st.success("✅ FAISS vector store ready.")


# ---------- Initialize Gemini Model ----------
api_key = st.sidebar.text_input("🔑 Enter your Google API Key", type="password")
if not api_key:
    st.warning("Please enter your Gemini API key in the sidebar.")
    st.stop()

os.environ["GOOGLE_API_KEY"] = api_key

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True,
)

custom_prompt = PromptTemplate.from_template("""
You are an intelligent assistant that answers questions based on the provided context.
If the context does not contain the answer, reply: "The information is not available in the provided documents."

Context:
{context}

Question: {question}
Answer:
""")


# ---------- User Query Section ----------
st.subheader("💬 Ask Questions about Your Documents")

query = st.text_input("Enter your question:")
if st.button("🔍 Search"):
    if query.strip() == "":
        st.warning("Please enter a valid question.")
    else:
        with st.spinner("🤖 Thinking..."):
            result = qa_chain.invoke({"query": query})

        st.markdown("### 💡 Answer:")
        st.write(result["result"])

        st.markdown("### 📚 Sources:")
        for doc in result["source_documents"]:
            st.caption(f"• {doc.metadata.get('source', 'Unknown')}")
