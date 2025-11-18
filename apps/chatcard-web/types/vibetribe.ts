/**
 * VibeTribe TypeScript types
 * Compatible with ChatCard extensions
 */

export type VibeEnergy = 'low' | 'medium' | 'high';

export interface VibeProfile {
  /** Optional label for this vibe, e.g. "Soft Lab", "Fast Ship", "Quiet Garden" */
  label?: string;

  /** Tone adjectives that describe the emotional feel of the space. */
  tone: string[]; // e.g. ["playful", "serious", "contemplative"]

  /** Values this person/room prioritizes. */
  values: string[]; // e.g. ["rigor", "care", "experimentation"]

  /** Work style preferences. */
  workStyle: string[]; // e.g. ["async", "deep-focus", "short sprints"]

  /** How this space prefers to handle tension and disagreement. */
  conflictStyle: string; // e.g. "gentle-direct", "facilitated", "high candor"

  /** Approximate energy level in this room. */
  energy?: VibeEnergy; // optional, default "medium"

  /** Free-form notes about the vibe. */
  notes?: string;
}

export interface VibeRoom {
  /** Stable identifier for the room (slug or UUID). */
  id: string;

  /** Human name for the room, e.g. "Soft Lab: Post-tribal Design Sprint". */
  name: string;

  /** The core problem or mission this room exists to work on. */
  problem: string;

  /** The vibe profile that defines how this room feels and behaves. */
  vibe: VibeProfile;

  /** Optional dealbreakers / "this room is not for..." statements. */
  dealbreakers?: string[];

  /** Optional metadata: creator DID, created date, member count, etc. */
  metadata?: {
    creatorDid?: string;
    createdAt?: string;
    memberCount?: number;
    status?: 'active' | 'archived' | 'dissolved';
  };
}

export interface VibeCard {
  /** ID of the underlying human, if known in the system. */
  humanId?: string;

  /** Optional link to a base ChatCard or identity card. */
  chatCardId?: string;

  /** The person's preferred default vibe profile. */
  defaultVibe: VibeProfile;

  /** Optional room-specific overrides keyed by room id. */
  roomOverrides?: Record<string, VibeProfile>;
}

export interface VibeMatchRequest {
  /** The problem or mission we're trying to assemble a tribe for. */
  problem: string;

  /** Desired vibe characteristics. */
  desiredVibe: Partial<VibeProfile>;

  /** Vibe traits that are hard no's. */
  avoid?: string[];

  /** Optional constraints (time zones, languages, etc.). */
  constraints?: Record<string, string | number | boolean>;
}

/**
 * ChatCard extension types
 */
export interface ChatCardExtensions {
  /** VibeRoom extension (for room cards) */
  vibeRoom?: VibeRoom;

  /** VibeCard extension (for person cards) */
  vibeCard?: VibeCard;
}

/**
 * Extended ChatCard structure with VibeTribe support
 */
export interface ChatCardWithVibe {
  version: string;
  card: {
    handle: string;
    did: string;
    name?: string;
    langs: string[];
    links: Array<{ type: string; title: string; url: string }>;
    sections: {
      creations: any[];
      collabs: any[];
      inspired: any[];
      capabilities: string[];
    };
    policies: {
      allowed_uses: string[];
      disallowed_uses: string[];
      rate_limit_per_agent_per_day: number;
    };
    agent: {
      inbox: string;
      events?: string;
      pubkey?: string;
    };
    updated_at: string;
  };
  extensions?: ChatCardExtensions;
}

