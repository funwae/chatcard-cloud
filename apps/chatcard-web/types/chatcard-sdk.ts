// types/chatcard-sdk.ts

export type ChatCardScopeLevel =
  | "read"
  | "suggest"
  | "act_with_confirmation"
  | "act_unconfirmed";

export interface ChatCardPersona {
  display_name: string;
  handle?: string;
  primary_language: string;
  secondary_languages?: string[];
  tone: "neutral" | "casual" | "formal" | "playful" | "direct";
  reading_level?: "basic" | "standard" | "expert";
}

export interface ChatCardProfile {
  card_id: string;
  sub: string; // pseudonymous subject
  persona: ChatCardPersona;
  ai_preferences?: {
    provider_hint?: string;
    model_hint?: string;
  };
  scope_level: ChatCardScopeLevel;
}

export type ChatCardStatus =
  | "unavailable"
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface RequestConnectionOptions {
  scopes: ChatCardScopeLevel[];
  rpId: string; // e.g. "https://app.example.com"
}

export interface ChatCardTokenResult {
  token: string;          // signed token (JWT or similar)
  profile: ChatCardProfile;
  expires_at: number;
}

export interface ChatCardSDK {
  getStatus(): ChatCardStatus;
  onStatusChange(cb: (status: ChatCardStatus) => void): () => void;
  isAvailable(): boolean;
  requestConnection(
    options: RequestConnectionOptions
  ): Promise<ChatCardTokenResult | null>;
  disconnect(): Promise<void>;
}

declare global {
  interface Window {
    chatcard?: ChatCardSDK;
  }
}

