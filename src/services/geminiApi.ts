import { GoogleGenAI } from "@google/genai";

/**
 * Gemini API Configuration and Client Management
 */

export interface GeminiApiConfig {
  apiKey: string;
  model: string;
  timeout?: number;
}

const DEFAULT_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";

/**
 * Initialize and return a GoogleGenAI client instance
 * @param apiKey - The Gemini API key
 * @returns GoogleGenAI instance
 */
export const initializeGeminiClient = (apiKey?: string): GoogleGenAI => {
  const key = apiKey || process.env.GEMINI_API_KEY;
  
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not defined. Please set it in your environment variables or pass it as a parameter."
    );
  }

  return new GoogleGenAI({ apiKey: key });
};

/**
 * Validate Gemini API configuration
 * @param config - Gemini API configuration object
 * @returns true if valid, throws error if invalid
 */
export const validateGeminiConfig = (config: Partial<GeminiApiConfig>): boolean => {
  if (!config.apiKey) {
    throw new Error("API key is required");
  }

  if (config.apiKey.length < 20) {
    throw new Error("Invalid API key format");
  }

  return true;
};

/**
 * Get the current Gemini API configuration
 * @returns Configuration object
 */
export const getGeminiConfig = (): GeminiApiConfig => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  return {
    apiKey,
    model: DEFAULT_MODEL,
    timeout: 30000,
  };
};

/**
 * Check if Gemini API is properly configured
 * @returns true if API is ready to use, false otherwise
 */
export const isGeminiApiConfigured = (): boolean => {
  return !!process.env.GEMINI_API_KEY;
};

/**
 * Get the default model name for Gemini
 * @returns Model identifier string
 */
export const getDefaultGeminiModel = (): string => {
  return DEFAULT_MODEL;
};
