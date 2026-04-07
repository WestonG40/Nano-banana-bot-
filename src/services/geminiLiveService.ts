import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export interface LiveSession {
  sendRealtimeInput: (data: { media: { data: string; mimeType: string } }) => void;
  close: () => void;
}

export interface GeminiLiveCallbacks {
  onAudioData: (base64Audio: string) => void;
  onInterrupted: () => void;
  onTranscription: (text: string, isModelTurn: boolean) => void;
  onError: (error: any) => void;
  onOpen: () => void;
  onClose: () => void;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface VoiceSettings {
  voiceName: string;
  speechRate: number;
}

export const connectToGeminiLive = (
  callbacks: GeminiLiveCallbacks, 
  history: ChatMessage[] = [],
  settings: VoiceSettings = { voiceName: "Zephyr", speechRate: 1.0 }
): Promise<LiveSession> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const historyContext = history.length > 0 
    ? `\n\nRecent conversation history for context:\n${history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')}`
    : "";

  return ai.live.connect({
    model: "gemini-2.5-flash-native-audio-preview-12-2025",
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.voiceName } },
      },
      systemInstruction: `You are NanoBot, a helpful and witty computer nano bot assistant. You live inside the user's computer. Keep your responses concise, friendly, and slightly robotic but charming.${historyContext}`,
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
    callbacks: {
      onopen: () => {
        console.log("Gemini Live connection opened");
        callbacks.onOpen();
      },
      onmessage: async (message: LiveServerMessage) => {
        // Handle model turn (audio and text transcription)
        if (message.serverContent?.modelTurn?.parts) {
          for (const part of message.serverContent.modelTurn.parts) {
            if (part.inlineData?.data) {
              callbacks.onAudioData(part.inlineData.data);
            }
            if (part.text) {
              callbacks.onTranscription(part.text, true);
            }
          }
        }

        // Handle user turn (text transcription)
        const serverContent = message.serverContent as any;
        if (serverContent?.userTurn?.parts) {
          for (const part of serverContent.userTurn.parts) {
            if (part.text) {
              callbacks.onTranscription(part.text, false);
            }
          }
        }

        if (message.serverContent?.interrupted) {
          callbacks.onInterrupted();
        }
      },
      onerror: (error: any) => {
        console.error("Gemini Live error:", error);
        let userMessage = "An unexpected connection error occurred.";
        
        if (error?.message?.includes("429")) {
          userMessage = "Rate limit exceeded. Please wait a moment and try again.";
        } else if (error?.message?.includes("403")) {
          userMessage = "Authentication failed. Please check your API key.";
        } else if (error?.message?.includes("network") || error?.name === "NetworkError") {
          userMessage = "Network error. Please check your internet connection.";
        } else if (error?.message) {
          userMessage = error.message;
        }

        callbacks.onError({ ...error, userMessage });
      },
      onclose: () => {
        console.log("Gemini Live connection closed");
        callbacks.onClose();
      },
    },
  }) as Promise<LiveSession>;
};
