// types/chatcard.ts

export type ChatCardStatus = 'idle' | 'connecting' | 'connected' | 'revoked' | 'error';

export type ChatCardScopeLevel =
  | 'read'
  | 'suggest'
  | 'act_with_confirmation'
  | 'act_unconfirmed';

export interface ChatCardScope {
  id: string;
  label: string;
  level: ChatCardScopeLevel;
  description: string;
  required?: boolean;
}

export interface ChatCardAccessibility {
  highContrast?: boolean;
  largeText?: boolean;
  prefersAudio?: boolean;
}

export type ChatCardTone = 'neutral' | 'casual' | 'formal' | 'playful' | 'direct';

export interface ChatCardModelPreferences {
  provider?: string; // e.g. "openai", "anthropic"
  model?: string;    // e.g. "gpt-5-thinking"
}

export interface ChatCardProfile {
  id: string; // pseudonymous card ID
  displayName: string;
  handle?: string; // e.g. "@hayden"
  avatarUrl?: string;
  primaryLanguage: string; // "en", "zh", "en-US", etc.
  secondaryLanguages?: string[];
  tone: ChatCardTone;
  readingLevel?: 'basic' | 'standard' | 'expert';
  accessibility?: ChatCardAccessibility;
  modelPreferences?: ChatCardModelPreferences;
  createdAt: string;
  updatedAt: string;
}

