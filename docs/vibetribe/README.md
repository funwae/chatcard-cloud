# VibeTribe Integration

VibeTribe is a module for designing and managing **short-lived, problem-focused collaboration spaces** (VibeRooms) that integrate with ChatCard.

## What is VibeTribe?

VibeTribe implements the "vibe vs vibe" model: instead of permanent identity-tribes, people form temporary **vibe tribes** around specific problems. Each VibeRoom defines:

- A **problem/mission** to work on
- A **vibe profile** (tone, values, work style, conflict style)
- **Dealbreakers** (what this room is not for)

See the [Vibe vs Vibe Manifesto](./manifesto.md) for the full philosophy.

## Current Status

### On chatcard.cloud

- ✅ **Reference Implementation**: `/vibetribe` page that demonstrates the VibeTribe designer
- ✅ **Documentation**: Schema, manifesto, and integration guides
- ✅ **TypeScript Types**: VibeProfile, VibeRoom, VibeCard types
- ✅ **ChatCard Integration Plan**: How VibeRooms integrate with card.json

### On vibebible.org (Your Implementation)

The main VibeTribe site will be built at `vibebible.org/vibetribe`. This will be the primary interface for:

- Designing VibeRooms
- Managing room membership
- Discovering rooms by vibe
- Integrating with ChatCard for identity and portability

## Integration Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   vibebible.org     │         │   chatcard.cloud     │
│   /vibetribe        │────────▶│   (Identity Layer)   │
│                     │         │                      │
│ - VibeRoom Designer │         │ - card.json          │
│ - Room Management   │         │ - Proofs             │
│ - Vibe Matching     │         │ - Extensions API     │
└─────────────────────┘         └──────────────────────┘
```

**ChatCard's Role:**
- Provides user identity (DID, handle)
- Stores VibeCard (user's default vibe preferences)
- References VibeRooms in card.json extensions or collabs section
- Enables portable vibe preferences across platforms

**VibeBible's Role:**
- Hosts the VibeRoom designer UI
- Manages room creation and membership
- Provides room discovery and matching
- Can sync rooms to ChatCard via API

## Files in This Directory

- `manifesto.md` - The Vibe vs Vibe philosophy
- `schema.md` - Technical schema for VibeProfile, VibeRoom, VibeCard
- `paste-into-your-ai.md` - Template for AI prompts
- `INTEGRATION_PLAN.md` - Detailed integration approach for ChatCard
- `VIBEBIBLE_INTEGRATION.md` - Guide for integrating ChatCard into vibebible.org

## Quick Start for VibeBible Integration

1. **Read the Schema**: Start with `schema.md` to understand the data structures
2. **Review Integration Guide**: See `VIBEBIBLE_INTEGRATION.md` for API usage
3. **Reference Implementation**: Check `chatcard.cloud/vibetribe` for UI patterns
4. **Build Your Site**: Implement the main VibeTribe designer on vibebible.org

## ChatCard API Endpoints (Available/Planned)

### Current
- `GET /me/:handle/card.json` - Get user's card (supports extensions field)
- `POST /api/me/items` - Add items to card (can include VibeRoom in collabs)

### Planned
- `POST /api/me/vibe` - Set user's VibeCard (default vibe preferences)
- `GET /api/me/vibe` - Get user's VibeCard
- `POST /api/vibe/rooms` - Create VibeRoom (store on ChatCard)
- `GET /vibe/:roomId` - Get VibeRoom by ID
- `GET /vibe/:roomId/card.json` - Get VibeRoom as ChatCard-compatible JSON

## Example: VibeRoom JSON

```json
{
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
    "culture-war bait",
    "personal attacks",
    "humiliation as a tactic"
  ]
}
```

This JSON can be:
- Embedded in ChatCard's `extensions.vibeRoom`
- Stored on VibeBible and referenced from ChatCard
- Used directly in AI prompts
- Shared as a standalone room definition

## Questions?

- For ChatCard integration: See `VIBEBIBLE_INTEGRATION.md`
- For schema details: See `schema.md`
- For philosophy: See `manifesto.md`

