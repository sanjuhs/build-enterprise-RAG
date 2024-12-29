import OpenAI from "openai";

// Type definitions for messages
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Add type for OpenAI streaming response
type OpenAIStreamResponse =
  AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;

// Interface for model configurations
export interface ModelConfig {
  baseURL?: string;
  apiKey?: string;
  models: string[];
  createClient: () => OpenAI;
  createCompletion: (
    client: OpenAI,
    messages: ChatMessage[],
    model: string
  ) => Promise<OpenAIStreamResponse>;
}

// OpenAI Provider implementation
const openAIProvider: ModelConfig = {
  baseURL: "https://api.openai.com/v1",
  apiKey: process.env.OPENAI_API_KEY,
  models: ["gpt-3.5-turbo", "gpt-4"],
  createClient: () =>
    new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.openai.com/v1",
    }),
  createCompletion: async (client, messages, model) => {
    return client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      stream: true,
    });
  },
};

// Deepseek Provider implementation
const deepseekProvider: ModelConfig = {
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
  models: ["deepseek-chat"],
  createClient: () =>
    new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com/v1",
    }),
  createCompletion: async (client, messages, model) => {
    return client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      stream: true,
    });
  },
};

// Export only OpenAI for now
export const PROVIDER_CONFIGS: Record<string, ModelConfig> = {
  openai: openAIProvider,
  deepseek: deepseekProvider,
  /* Commenting out other providers for now
  deepseek: { ... },
  mistral: { ... },
  together: { ... },
  */
};
