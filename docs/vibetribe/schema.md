# VibeTribe Schema

This document defines the minimal schema for Vibe Profiles and Vibe Rooms. It is intentionally simple and JSON-friendly, and can be embedded into other protocols such as ChatCard.

## VibeProfile

A **VibeProfile** captures the "how we are together" layer.

```ts
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
```

## VibeRoom

A **VibeRoom** is a problem-oriented, time-bounded tribe plus its vibe.

```ts
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
```

## VibeCard (person-level)

A **VibeCard** captures a person's vibe fingerprint. In a ChatCard-based system, this can be attached as an extension.

```ts
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
```

## VibeMatchRequest (optional)

A **VibeMatchRequest** describes what kind of vibe a person or room is seeking in collaborators.

```ts
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
```

## ChatCard Integration

In a ChatCard implementation, VibeProfile and VibeRoom can be integrated as **extensions** to the card.json structure.

### Option 1: VibeRoom as Card Extension

```jsonc
{
  "version": "cc-1.0",
  "card": {
    "handle": "soft-lab",
    "did": "did:cc:soft-lab",
    "name": "Soft Lab",
    // ... existing ChatCard fields ...
  },
  "extensions": {
    "vibeRoom": {
      "id": "soft-lab-post-tribal",
      "name": "Soft Lab: Post-tribal Design Sprint",
      "problem": "Design patterns for post-tribal, vibe-based collaboration.",
      "vibe": {
        "tone": ["playful", "serious"],
        "values": ["curiosity", "care", "rigor"],
        "workStyle": ["async", "deep-focus"],
        "conflictStyle": "gentle-direct",
        "energy": "medium"
      },
      "dealbreakers": [
        "No culture-war bait.",
        "No personal attacks.",
        "We prioritize psychological safety over speed."
      ]
    }
  }
}
```

### Option 2: VibeProfile as Person Extension

```jsonc
{
  "version": "cc-1.0",
  "card": {
    "handle": "alice",
    "did": "did:cc:alice",
    // ... existing ChatCard fields ...
  },
  "extensions": {
    "vibeCard": {
      "defaultVibe": {
        "tone": ["playful", "curious"],
        "values": ["care", "rigor"],
        "workStyle": ["async", "deep-focus"],
        "conflictStyle": "gentle-direct",
        "energy": "medium"
      }
    }
  }
}
```

### Option 3: VibeRoom as Collab Item

A VibeRoom can be added to a person's ChatCard in the `collabs` section:

```jsonc
{
  "version": "cc-1.0",
  "card": {
    "sections": {
      "collabs": [
        {
          "id": "vibe-soft-lab",
          "title": "Soft Lab: Post-tribal Design Sprint",
          "url": "https://chatcard.cloud/vibe/soft-lab-post-tribal",
          "authorship": "collab",
          "metadata": {
            "vibeRoom": {
              "id": "soft-lab-post-tribal",
              "problem": "Design patterns for post-tribal collaboration.",
              "vibe": { /* VibeProfile */ }
            }
          }
        }
      ]
    }
  }
}
```

## API Endpoints (Proposed)

For full integration, ChatCard could expose:

- `GET /vibe/:roomId` - Fetch a VibeRoom by ID
- `GET /vibe/:roomId/card.json` - Get VibeRoom as ChatCard-compatible JSON
- `POST /api/vibe/rooms` - Create a new VibeRoom (requires auth)
- `GET /api/me/vibe` - Get user's VibeCard (default vibe + room overrides)
- `POST /api/me/vibe` - Update user's VibeCard
- `GET /api/vibe/match` - Find VibeRooms matching a VibeMatchRequest

These endpoints would allow VibeRooms to be stored, discovered, and linked from ChatCards.

