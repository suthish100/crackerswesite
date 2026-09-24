import { loadDocumentsFromDirectory } from './document-loader';
import { chunkDocument } from './chunker';
import { embeddingService } from './embeddings';
import { vectorStore } from './vector-store';
import { getAiConfig } from './config';
import { DocumentChunk, SearchResult } from './types';

export class RagService {
  private isIndexing = false;

  async indexKnowledgeBase(): Promise<{ documentCount: number; chunkCount: number }> {
    if (this.isIndexing) {
      throw new Error('Indexing is already in progress');
    }

    this.isIndexing = true;
    try {
      const config = getAiConfig();
      const docs = await loadDocumentsFromDirectory(config.ragDocumentsDir);

      if (docs.length === 0) {
        return { documentCount: 0, chunkCount: 0 };
      }

      await vectorStore.rebuild();
      const allChunks: DocumentChunk[] = [];

      for (const doc of docs) {
        const chunks = chunkDocument(doc, {
          chunkSize: config.ragChunkSize,
          chunkOverlap: config.ragChunkOverlap,
        });

        for (const chunk of chunks) {
          const emb = await embeddingService.generateEmbedding(
            `${chunk.title}\n${chunk.content}`
          );
          chunk.embedding = emb;
          allChunks.push(chunk);
        }
      }

      await vectorStore.addDocuments(allChunks);
      return { documentCount: docs.length, chunkCount: allChunks.length };
    } finally {
      this.isIndexing = false;
    }
  }

  async retrieveRelevantChunks(query: string, topK?: number): Promise<SearchResult[]> {
    const config = getAiConfig();
    const k = topK || config.ragTopK;

    const count = await vectorStore.count();
    if (count === 0) {
      // Auto-index on first request if empty
      console.log('RAG vector store empty, running initial index...');
      await this.indexKnowledgeBase();
    }

    const queryEmbedding = await embeddingService.generateEmbedding(query);
    return vectorStore.search(queryEmbedding, k);
  }

  async buildContext(query: string, topK?: number): Promise<{ contextText: string; sources: SearchResult[] }> {
    const results = await this.retrieveRelevantChunks(query, topK);

    if (results.length === 0) {
      return { contextText: '', sources: [] };
    }

    const contextText = results
      .map((r, i) => `[Source ${i + 1}: ${r.chunk.source} | ${r.chunk.title}]\n${r.chunk.content}`)
      .join('\n\n---\n\n');

    return { contextText, sources: results };
  }
}

export const ragService = new RagService();
