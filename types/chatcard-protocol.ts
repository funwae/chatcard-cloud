// types/chatcard-protocol.ts
// TypeScript definitions for ChatCard Protocol v0

export type ChatCardProviderLinkStatus =
  | "linked"
  | "pending"
  | "revoked";

export interface ChatCardProviderLink {
  providerId: string;         // e.g. "openai", "zai", "local"
  status: ChatCardProviderLinkStatus;
  eventUrl?: string;          // HTTPS endpoint for ChatCardEvent
  // optional: opaque provider-side token or handle
  providerHandle?: string;
}

export interface ChatCardProfile {
  cardId: string;             // "card_...", globally unique
  displayName: string;        // human-facing
  handle?: string;            // @handle, not required
  avatarUrl?: string;

  languages: string[];        // e.g. ["en", "zh-CN"]
  tone?: "casual" | "formal" | "playful";
  register?: "everyday" | "professional" | "technical";

  // cross-culture prefs are logically here, even if modeled later
  crossCulture?: {
    primaryLocale?: string;   // e.g. "US"
    bridgeLocales?: string[]; // e.g. ["CN"]
  };

  providerLinks: ChatCardProviderLink[];
}

export type ChatCardEventKind =
  | "message"      // user or assistant message
  | "tool"         // tool/skill use
  | "page-action"; // action invoked from a page affordance

export type ChatCardEventMode =
  | "text"
  | "voice"
  | "avatar";

export interface ChatCardEventPayload {
  // deliberately minimal
  length?: number;            // characters or tokens
  language?: string;          // e.g. "en", "zh-CN"

  // page-action specific
  actionId?: string;          // from ChatCardPageSpec
  domain?: string;            // origin or hostname

  // optional: semantic hints (hashes, embeddings)
  // never raw secrets or PII by protocol design
  embeddingHash?: string;
}

export interface ChatCardEvent {
  eventId: string;            // UUID
  cardId: string;
  providerId: string;
  timestamp: string;          // ISO 8601

  kind: ChatCardEventKind;
  mode: ChatCardEventMode;

  payload: ChatCardEventPayload;
}

export interface ChatCardPageAction {
  id: string;                 // stable ID: "summarize-article"
  label: string;              // UI label
  description?: string;       // optional longer hint
}

export interface ChatCardPageSpec {
  actions: ChatCardPageAction[];
  contextUrl?: string;        // optional: where the card can fetch scoped context

  // optional metadata
  version?: string;           // "0.1.0"
  sourceId?: string;          // internal page/component ID
}

// Window global for page specs
declare global {
  interface Window {
    chatcard?: ChatCardPageSpec;
  }
}

