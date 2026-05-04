
export interface ImagePrompt {
  id: string;
  text: string;
}

export interface GenerationResult {
  id: string;
  prompt: string;
  imageUrl: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
}

export interface AppState {
  prompts: ImagePrompt[];
  results: GenerationResult[];
  isGenerating: boolean;
}
