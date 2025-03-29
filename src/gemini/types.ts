import type {
  Content,
  FunctionCall,
  GenerationConfig,
  GenerativeContentBlob,
  Part,
  Tool,
} from "@google/generative-ai";

// Type-definitions for Gemini API
export type LiveConfig = {
  model: string;
  systemInstruction?: { parts: Part[] };
  generationConfig?: Partial<LiveGenerationConfig>;
  tools?: Array<Tool | { googleSearch: {} } | { codeExecution: {} }>;
};

export type LiveGenerationConfig = GenerationConfig & {
  responseModalities: "text" | "audio" | "image";
  speechConfig?: {
    voiceConfig?: {
      prebuiltVoiceConfig?: {
        voiceName: string;
      };
    };
  };
};

export type ModelTurn = {
  modelTurn: {
    parts: Part[];
  };
};

export type TurnComplete = { turnComplete: boolean };
export type ToolCall = {
  functionCalls: any[];
};
