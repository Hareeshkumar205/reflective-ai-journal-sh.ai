export type ReflectionMode = 'reflect' | 'brainstorm' | 'summarize' | 'continue';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  summary: string;
  initialPrompt: string;
  messages: ChatMessage[];
  mode: ReflectionMode;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface GeminiReflectRequest {
  prompt: string;
  mode?: ReflectionMode;
  history?: Array<{ role: 'user' | 'model'; content: string }>;
  title?: string;
}

export interface GeminiReflectResponse {
  response: string;
  summary?: string;
  suggestedTitle?: string;
  modelUsed: string;
}
