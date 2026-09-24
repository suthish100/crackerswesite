# RAG Knowledge Base

Place business knowledge documents inside:

```text
data/rag/documents/
```

The AI assistant uses these documents to answer questions about:
- Business history, licensing, and Sivakasi factory direct operations
- Product safety instructions, storage, and classifications
- Delivery and regional road transport logistics (Godown pickup vs door delivery)
- Payment instructions, bank details, and verification
- Returns, damaged shipment claims, and refunds
- Order cancellations
- Frequently Asked Questions (FAQs)
- Store policies and terms

> **Security Note:** Do not store API keys, passwords, customer private data, or private credentials in this directory.

---

## Supported Document Formats
The document pipeline currently supports:
- `.md` (Markdown with headings, lists, tables)
- `.txt` (Plain text files)
- `.pdf` (Portable Document Format via `pdf-parse`)
- `.docx` (Microsoft Word documents via `mammoth`)

Additional document loaders can be registered in `src/lib/ai/document-loader.ts`.

---

## How Documents are Processed
```text
Source Document (data/rag/documents/)
        ↓
Text Extraction (document-loader.ts)
        ↓
Text Cleaning & Normalization
        ↓
Context-Aware Chunking (chunker.ts)
[chunk_size = 800 chars, chunk_overlap = 150 chars]
        ↓
Embedding Generation (embeddings.ts)
[OpenAI / Gemini / Local Dense Vectorizer]
        ↓
Vector Indexing & Persistence (data/rag/embeddings/vectors.json)
        ↓
Semantic Retrieval for Customer Queries (Top-K)
```

---

## Managing Store Knowledge

### 1. Adding New Knowledge
1. Place your `.md`, `.txt`, `.pdf`, or `.docx` file into `data/rag/documents/`.
2. Re-index the knowledge base by calling the API:
   ```bash
   curl -X POST http://localhost:3000/api/ai/knowledge/reindex
   ```
   Or the assistant will automatically index new documents on server startup.

### 2. Updating Knowledge
1. Edit the relevant file in `data/rag/documents/`.
2. Trigger the re-index API to update the stored vectors in `data/rag/embeddings/vectors.json`.

### 3. Removing Outdated Knowledge
1. Delete the outdated file from `data/rag/documents/`.
2. Trigger the re-index API to remove old vectors.

---

## Important Architecture Note: Separation of Truth
- **`data/rag/`** is solely for business policies, guides, logistics, and company information.
- **Product catalog details (prices, stock availability, discounts, SKU)** are queried dynamically from the live PostgreSQL database via Prisma (`prisma.product`). Product rates and inventory are **NEVER** hardcoded in RAG documents, ensuring prices remain 100% accurate at all times.
