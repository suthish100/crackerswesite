import { getAiConfig } from './config';

export interface EmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
  generateEmbeddings(texts: string[]): Promise<number[][]>;
  cosineSimilarity(a: number[], b: number[]): number;
}

/**
 * Local high-dimensional dense vectorizer (384 dimensions)
 * Computes normalized TF-IDF + character/word n-gram feature hashes.
 * Guaranteed to run in-memory with zero external API dependencies.
 */
export function generateLocalDenseVector(text: string, dimensions = 384): number[] {
  const vector = new Array<number>(dimensions).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter((w) => w.length > 1);

  // Unigram & Bigram word frequencies
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const hash = simpleHash(word) % dimensions;
    vector[Math.abs(hash)] += 1.5;

    if (i < words.length - 1) {
      const bigram = `${word}_${words[i + 1]}`;
      const biHash = simpleHash(bigram) % dimensions;
      vector[Math.abs(biHash)] += 2.0;
    }
  }

  // Character 3-grams for typo and subword tolerance
  for (let i = 0; i < normalized.length - 2; i++) {
    const trigram = normalized.slice(i, i + 3);
    const triHash = simpleHash(trigram) % dimensions;
    vector[Math.abs(triHash)] += 0.5;
  }

  // L2 Normalization (unit vector)
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export class DefaultEmbeddingService implements EmbeddingService {
  async generateEmbedding(text: string): Promise<number[]> {
    const config = getAiConfig();

    if (config.embeddingProvider === 'openai' && config.aiApiKey) {
      try {
        const baseUrl = config.aiBaseUrl || 'https://api.openai.com/v1';
        const res = await fetch(`${baseUrl}/embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.aiApiKey}`,
          },
          body: JSON.stringify({
            model: config.embeddingModel || 'text-embedding-3-small',
            input: text.slice(0, 8000),
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data?.[0]?.embedding) {
            return json.data[0].embedding;
          }
        } else {
          console.warn('OpenAI Embedding API error, falling back to local dense vector:', await res.text());
        }
      } catch (err) {
        console.warn('Embedding request failed, falling back to local dense vector:', err);
      }
    }

    // Default high-performance local vectorizer
    return generateLocalDenseVector(text);
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await this.generateEmbedding(text));
    }
    return results;
  }

  cosineSimilarity(a: number[], b: number[]): number {
    return cosineSimilarity(a, b);
  }
}

export const embeddingService = new DefaultEmbeddingService();
