export type HealthStatus = 'ok' | 'warn' | 'bad';

export interface Plant {
  id: number;
  name: string;
  latin: string;
  category: string;
  note: string;
  health: HealthStatus;
  image_path: string;
}

export interface CorrectionFields {
  name: string;
  latin: string;
  category: string;
  note: string;
  health: HealthStatus;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export interface SuggestCorrectionInput {
  reasoning: string;
  name?: string;
  latin?: string;
  category?: string;
  note?: string;
  health?: string;
}
