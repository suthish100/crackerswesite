import fs from 'fs';
import path from 'path';
import { DocumentChunk, SearchResult, VectorStore } from './types';
import { cosineSimilarity } from './embeddings';
import { getAiConfig } from './config';

export class LocalJsonVectorStore implements VectorStore {
  private chunks: DocumentChunk[] = [];
  private vectorsFilePath: string;
  private isLoaded = false;

  constructor(embeddingsDir?: string) {
    const config = getAiConfig();
    const dir = embeddingsDir || config.ragEmbeddingsDir;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.vectorsFilePath = path.join(dir, 'vectors.json');
  }

  private loadIfNeeded(): void {
    if (this.isLoaded) return;
    if (fs.existsSync(this.vectorsFilePath)) {
      try {
        const raw = fs.readFileSync(this.vectorsFilePath, 'utf-8');
        this.chunks = JSON.parse(raw);
      } catch (err) {
        console.error('Error loading vectors.json:', err);
        this.chunks = [];
      }
    } else {
      this.chunks = [];
    }
    this.isLoaded = true;
  }

  private save(): void {
    const config = getAiConfig();
    if (!fs.existsSync(config.ragEmbeddingsDir)) {
      fs.mkdirSync(config.ragEmbeddingsDir, { recursive: true });
    }
    fs.writeFileSync(this.vectorsFilePath, JSON.stringify(this.chunks, null, 2), 'utf-8');

    // Also write processed chunks without embeddings to processed/ for clean inspection
    if (!fs.existsSync(config.ragProcessedDir)) {
      fs.mkdirSync(config.ragProcessedDir, { recursive: true });
    }
    const cleanChunks = this.chunks.map((c) => ({
      chunkId: c.chunkId,
      source: c.source,
      documentType: c.documentType,
      title: c.title,
      content: c.content,
      createdAt: c.createdAt,
    }));
    fs.writeFileSync(
      path.join(config.ragProcessedDir, 'chunks.json'),
      JSON.stringify(cleanChunks, null, 2),
      'utf-8'
    );
  }

  async addDocuments(newChunks: DocumentChunk[]): Promise<void> {
    this.loadIfNeeded();

    // Upsert chunks by chunkId
    const map = new Map<string, DocumentChunk>();
    for (const c of this.chunks) {
      map.set(c.chunkId, c);
    }
    for (const c of newChunks) {
      map.set(c.chunkId, c);
    }

    this.chunks = Array.from(map.values());
    this.save();
  }

  async search(queryVector: number[], topK = 5): Promise<SearchResult[]> {
    this.loadIfNeeded();

    if (this.chunks.length === 0 || !queryVector || queryVector.length === 0) {
      return [];
    }

    const scored: SearchResult[] = [];

    for (const chunk of this.chunks) {
      if (chunk.embedding && chunk.embedding.length > 0) {
        const score = cosineSimilarity(queryVector, chunk.embedding);
        scored.push({ chunk, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  async deleteDocument(source: string): Promise<void> {
    this.loadIfNeeded();
    this.chunks = this.chunks.filter((c) => c.source !== source);
    this.save();
  }

  async rebuild(): Promise<void> {
    this.chunks = [];
    this.isLoaded = true;
    this.save();
  }

  async count(): Promise<number> {
    this.loadIfNeeded();
    return this.chunks.length;
  }

  getChunks(): DocumentChunk[] {
    this.loadIfNeeded();
    return [...this.chunks];
  }
}

export const vectorStore = new LocalJsonVectorStore();
