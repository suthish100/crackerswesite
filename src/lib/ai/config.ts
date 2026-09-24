import path from 'path';

export interface AiConfig {
  aiProvider: 'openai' | 'gemini' | 'anthropic' | 'local';
  aiModel: string;
  aiApiKey: string;
  aiBaseUrl?: string;

  embeddingProvider: 'openai' | 'gemini' | 'local';
  embeddingModel: string;

  vectorDatabaseUrl?: string;

  ragTopK: number;
  ragChunkSize: number;
  ragChunkOverlap: number;

  ragDocumentsDir: string;
  ragProcessedDir: string;
  ragEmbeddingsDir: string;
}

export function getAiConfig(): AiConfig {
  const rootDir = process.cwd();

  const aiProviderRaw = (process.env.AI_PROVIDER || '').toLowerCase();
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '';

  let aiProvider: 'openai' | 'gemini' | 'anthropic' | 'local' = 'local';
  if (aiProviderRaw === 'openai' || aiProviderRaw === 'gemini' || aiProviderRaw === 'anthropic') {
    aiProvider = aiProviderRaw;
  } else if (apiKey) {
    aiProvider = 'openai';
  }

  const embeddingProviderRaw = (process.env.EMBEDDING_PROVIDER || '').toLowerCase();
  let embeddingProvider: 'openai' | 'gemini' | 'local' = 'local';
  if (embeddingProviderRaw === 'openai' || embeddingProviderRaw === 'gemini') {
    embeddingProvider = embeddingProviderRaw;
  } else if (apiKey && aiProvider === 'openai') {
    embeddingProvider = 'openai';
  }

  const ragChunkSize = parseInt(process.env.RAG_CHUNK_SIZE || '800', 10);
  const ragChunkOverlap = parseInt(process.env.RAG_CHUNK_OVERLAP || '150', 10);
  const ragTopK = parseInt(process.env.RAG_TOP_K || '5', 10);

  return {
    aiProvider,
    aiModel: process.env.AI_MODEL || (aiProvider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini'),
    aiApiKey: apiKey,
    aiBaseUrl: process.env.AI_BASE_URL || undefined,

    embeddingProvider,
    embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',

    vectorDatabaseUrl: process.env.VECTOR_DATABASE_URL || undefined,

    ragTopK: isNaN(ragTopK) ? 5 : ragTopK,
    ragChunkSize: isNaN(ragChunkSize) ? 800 : ragChunkSize,
    ragChunkOverlap: isNaN(ragChunkOverlap) ? 150 : ragChunkOverlap,

    ragDocumentsDir: path.join(rootDir, 'data', 'rag', 'documents'),
    ragProcessedDir: path.join(rootDir, 'data', 'rag', 'processed'),
    ragEmbeddingsDir: path.join(rootDir, 'data', 'rag', 'embeddings'),
  };
}
