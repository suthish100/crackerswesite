export interface DocumentChunk {
  chunkId: string;
  source: string;
  documentType: string;
  title: string;
  content: string;
  embedding?: number[];
  createdAt: string;
}

export interface SearchResult {
  chunk: DocumentChunk;
  score: number;
}

export interface VectorStore {
  addDocuments(chunks: DocumentChunk[]): Promise<void>;
  search(queryVector: number[], topK?: number): Promise<SearchResult[]>;
  deleteDocument(source: string): Promise<void>;
  rebuild(): Promise<void>;
  count(): Promise<number>;
}

export interface ProductRecommendation {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  discountPercent?: number;
  stockQty: number;
  imageUrl: string;
  categoryName?: string;
  quantity?: number;
  reason?: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
  productRecommendations?: ProductRecommendation[];
  quickActions?: string[];
}

export interface AiResponsePayload {
  message: string;
  products: ProductRecommendation[];
  suggestedQuestions: string[];
  sourceSnippets?: { source: string; score: number }[];
}

export interface BudgetRecommendationResult {
  budget: number;
  totalAmount: number;
  remainingBudget: number;
  products: ProductRecommendation[];
  summary: string;
}
