declare module '@google/generative-ai' {
  export interface GenerationConfig {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  }

  export interface ModelParams {
    model: string;
    generationConfig?: GenerationConfig;
  }

  export interface GenerateContentResult {
    response: {
      text(): string;
    };
  }

  export interface GenerativeModel {
    generateContent(prompt: string): Promise<GenerateContentResult>;
  }

  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(params: ModelParams): GenerativeModel;
  }
}
