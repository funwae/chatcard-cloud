# ChatCard Integration Guide for vibebible.org

This guide explains how to integrate ChatCard into vibebible.org's VibeTribe module.

## Overview

- **ChatCard site**: `chatcard.cloud` - Provides the card.json protocol, proof system, and identity infrastructure
- **VibeBible site**: `vibebible.org/vibetribe` - The main VibeTribe designer and room management interface
- **Integration**: VibeBible uses ChatCard's APIs and card.json structure to store and reference VibeRooms

## Integration Points

### 1. VibeRoom as ChatCard Extension

When a user creates a VibeRoom on vibebible.org, you can:

**Option A: Store as ChatCard Extension**
- POST the VibeRoom JSON to ChatCard's API
- ChatCard stores it and exposes it via `card.json` with `extensions.vibeRoom`
- VibeBible links to: `https://chatcard.cloud/vibe/:roomId` or `https://chatcard.cloud/me/:handle/card.json` (with extension)

**Option B: Store on VibeBible, Reference from ChatCard**
- Store VibeRoom on VibeBible's own database
- Reference it from ChatCard's card.json via URL: `"extensions": { "vibeRoomUrl": "https://vibebible.org/vibetribe/:roomId" }`
- ChatCard acts as the identity layer, VibeBible hosts the room data

### 2. User Identity

Users on vibebible.org can:

1. **Link their ChatCard**: Connect their ChatCard handle/DID to their VibeBible account
2. **Create VibeRooms**: Rooms are associated with their ChatCard DID
3. **Join Rooms**: Room membership is tracked via ChatCard DID

### 3. API Integration

ChatCard provides these endpoints that VibeBible can use:

```
# Get user's card (includes extensions if they have VibeRooms)
GET https://chatcard.cloud/me/:handle/card.json

# Create/update user's VibeCard (default vibe preferences)
POST https://chatcard.cloud/api/me/vibe
GET https://chatcard.cloud/api/me/vibe

# (Future) VibeRoom endpoints
POST https://chatcard.cloud/api/vibe/rooms
GET https://chatcard.cloud/vibe/:roomId
GET https://chatcard.cloud/vibe/:roomId/card.json
```

### 4. Card.json Structure for VibeRooms

When a user is in a VibeRoom, their card.json can include:

```json
{
  "version": "cc-1.0",
  "card": {
    "handle": "alice",
    "did": "did:cc:alice",
    // ... standard ChatCard fields ...
    "sections": {
      "collabs": [
        {
          "id": "vibe-soft-lab",
          "title": "Soft Lab: Post-tribal Design Sprint",
          "url": "https://vibebible.org/vibetribe/soft-lab-post-tribal",
          "authorship": "collab",
          "metadata": {
            "type": "vibeRoom",
            "vibeRoomId": "soft-lab-post-tribal"
          }
        }
      ]
    }
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

## Implementation Steps for VibeBible

### Phase 1: Basic Integration

1. **User Authentication**
   - Allow users to sign in with ChatCard (magic link or passkey)
   - Store their ChatCard DID/handle in VibeBible's user model

2. **VibeRoom Creation**
   - User creates VibeRoom on vibebible.org
   - Store VibeRoom in VibeBible's database
   - Optionally: POST to ChatCard API to add to user's `collabs` section

3. **Card.json Reference**
   - When displaying a VibeRoom, link to user's ChatCard: `https://chatcard.cloud/me/:handle`
   - Show "View ChatCard" button on VibeRoom pages

### Phase 2: Full Integration

1. **VibeCard Management**
   - Allow users to set their default VibeProfile
   - POST to ChatCard's `/api/me/vibe` endpoint
   - Display user's vibe on their VibeBible profile

2. **Room Discovery**
   - Query ChatCard's card.json files to find users in VibeRooms
   - Match users by vibe preferences
   - Suggest rooms based on vibe fit

3. **Cross-Platform Identity**
   - User's ChatCard becomes their portable identity
   - VibeRooms they're in show up in their ChatCard's `collabs` section
   - Other sites can discover their vibe preferences via card.json

## Example: Creating a VibeRoom on VibeBible

```typescript
// On vibebible.org
async function createVibeRoom(roomData: VibeRoom, userChatCardDid: string) {
  // 1. Store on VibeBible
  const room = await vibebibleDB.vibeRooms.create({
    ...roomData,
    creatorDid: userChatCardDid,
  });

  // 2. Optionally add to ChatCard's collabs section
  await fetch('https://chatcard.cloud/api/me/items', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${chatCardJWT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      section: 'collabs',
      title: roomData.name,
      url: `https://vibebible.org/vibetribe/${roomData.id}`,
      authorship: 'collab',
      metadata: {
        type: 'vibeRoom',
        vibeRoomId: roomData.id,
        vibeRoom: roomData, // Full VibeRoom JSON
      },
    }),
  });

  return room;
}
```

## Example: Reading User's Vibe from ChatCard

```typescript
// On vibebible.org
async function getUserVibe(chatCardHandle: string) {
  const card = await fetch(
    `https://chatcard.cloud/me/${chatCardHandle}/card.json`
  ).then(r => r.json());

  // Extract VibeCard from extensions
  const vibeCard = card.extensions?.vibeCard;

  if (vibeCard) {
    return vibeCard.defaultVibe;
  }

  return null; // User hasn't set their vibe yet
}
```

## Benefits of This Architecture

1. **Separation of Concerns**
   - ChatCard = identity and protocol layer
   - VibeBible = application layer (VibeTribe designer and rooms)

2. **Portability**
   - User's vibe preferences travel with their ChatCard
   - Other sites can read their vibe from card.json
   - VibeRooms can be referenced from multiple platforms

3. **Interoperability**
   - VibeRoom JSON is standardized and can be used anywhere
   - ChatCard's proof system can attest to room membership
   - AI agents can understand vibe context from card.json

## Next Steps

1. **ChatCard Side** (Current):
   - ✅ VibeTribe types and schema defined
   - ✅ Example `/vibetribe` page on chatcard.cloud (reference)
   - ⏳ Add `extensions` field support to card.json generation
   - ⏳ Add `/api/me/vibe` endpoint for VibeCard management
   - ⏳ (Future) Add `/api/vibe/rooms` endpoints

2. **VibeBible Side** (Your Implementation):
   - Build the main `/vibetribe` page on vibebible.org
   - Implement VibeRoom storage and management
   - Integrate ChatCard authentication
   - Add ChatCard API calls for syncing rooms to card.json

## Questions?

- ChatCard API docs: `https://chatcard.cloud/docs`
- VibeTribe schema: See `docs/vibetribe/schema.md`
- Example implementation: `chatcard.cloud/vibetribe` (reference page)

