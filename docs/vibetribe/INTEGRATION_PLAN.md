# VibeTribe Integration Plan for ChatCard

This document outlines how VibeTribe integrates with the ChatCard system, based on the current implementation.

**Note:** The main VibeTribe site will be built at `vibebible.org/vibetribe`. ChatCard provides the identity and protocol layer that VibeBible can integrate with. This document explains how ChatCard supports VibeTribe integration.

## Current ChatCard Structure

ChatCard's `card.json` structure:
```json
{
  "version": "cc-1.0",
  "card": {
    "handle": "alice",
    "did": "did:cc:alice",
    "name": "Alice",
    "langs": [],
    "links": [],
    "sections": {
      "creations": [],
      "collabs": [],
      "inspired": [],
      "capabilities": []
    },
    "policies": {...},
    "agent": {...},
    "updated_at": "2025-01-15"
  }
}
```

## Integration Approaches

### Approach 1: Extensions Field (Recommended)

Add an `extensions` field to `card.json` to support VibeRoom and VibeCard:

```json
{
  "version": "cc-1.0",
  "card": {...},
  "extensions": {
    "vibeRoom": {
      "id": "soft-lab-post-tribal",
      "name": "Soft Lab: Post-tribal Design Sprint",
      "problem": "...",
      "vibe": {...},
      "dealbreakers": [...]
    },
    "vibeCard": {
      "defaultVibe": {...},
      "roomOverrides": {...}
    }
  }
}
```

**Implementation:**
- Update `apps/chatcard-api/src/routes/card.ts` to include extensions
- Extensions are optional and don't break existing cards
- Can be populated from database or computed on-the-fly

### Approach 2: VibeRoom as CardItem

Store VibeRooms as CardItems in the `collabs` section:

```json
{
  "card": {
    "sections": {
      "collabs": [
        {
          "id": "vibe-soft-lab",
          "title": "Soft Lab: Post-tribal Design Sprint",
          "url": "https://chatcard.cloud/vibe/soft-lab-post-tribal",
          "authorship": "collab",
          "metadata": {
            "type": "vibeRoom",
            "vibeRoom": {
              "id": "soft-lab-post-tribal",
              "problem": "...",
              "vibe": {...}
            }
          }
        }
      ]
    }
  }
}
```

**Implementation:**
- Use existing CardItem model
- Store VibeRoom JSON in `metadata` field
- Filter by `metadata.type === "vibeRoom"` when needed

### Approach 3: Separate VibeRoom Endpoints

Create dedicated endpoints for VibeRooms:

- `GET /vibe/:roomId` - Fetch VibeRoom
- `GET /vibe/:roomId/card.json` - VibeRoom as ChatCard-compatible JSON
- `POST /api/vibe/rooms` - Create VibeRoom (auth required)
- `GET /api/me/vibe` - Get user's VibeCard
- `POST /api/me/vibe` - Update user's VibeCard

**Implementation:**
- New Prisma models: `VibeRoom`, `VibeCard`
- New routes: `apps/chatcard-api/src/routes/vibe.ts`
- VibeRooms can be linked from person cards via URL

## Recommended Hybrid Approach

Combine all three approaches:

1. **VibeRoom Storage**: Use separate `VibeRoom` model in database
2. **Card Extensions**: Add `extensions.vibeRoom` to card.json when user is in a room
3. **Collab Items**: Add VibeRoom to `collabs` section for discoverability
4. **Dedicated Endpoints**: Provide `/vibe/:roomId` and `/vibe/:roomId/card.json`

## Database Schema (Proposed)

```prisma
model VibeRoom {
  id          String   @id @default(cuid())
  slug        String   @unique // URL-friendly identifier
  name        String
  problem     String
  vibe        Json     // VibeProfile JSON
  dealbreakers String[] @default([])
  creatorDid  String
  status      VibeRoomStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  archivedAt  DateTime?

  // Relations
  members     VibeRoomMember[]
  creator     User?    @relation(fields: [creatorDid], references: [did])

  @@index([slug])
  @@index([creatorDid])
  @@index([status])
}

model VibeRoomMember {
  id        String   @id @default(cuid())
  roomId    String
  userDid   String
  joinedAt  DateTime @default(now())
  leftAt    DateTime?
  role      String   @default("member") // member, facilitator, creator

  room      VibeRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@unique([roomId, userDid])
  @@index([userDid])
}

model VibeCard {
  id          String   @id @default(cuid())
  userDid     String   @unique
  defaultVibe Json     // VibeProfile JSON
  roomOverrides Json?  // Record<string, VibeProfile>
  updatedAt   DateTime @updatedAt

  user        User?    @relation(fields: [userDid], references: [did])

  @@index([userDid])
}

enum VibeRoomStatus {
  ACTIVE
  ARCHIVED
  DISSOLVED
}
```

## API Routes (Proposed)

### Public Routes
- `GET /vibe/:slug` - Get VibeRoom by slug
- `GET /vibe/:slug/card.json` - Get VibeRoom as ChatCard JSON

### Authenticated Routes
- `POST /api/vibe/rooms` - Create new VibeRoom
- `PATCH /api/vibe/rooms/:id` - Update VibeRoom (creator only)
- `POST /api/vibe/rooms/:id/join` - Join a VibeRoom
- `POST /api/vibe/rooms/:id/leave` - Leave a VibeRoom
- `GET /api/me/vibe` - Get user's VibeCard
- `POST /api/me/vibe` - Update user's VibeCard
- `GET /api/me/vibe/rooms` - Get user's active VibeRooms

## Implementation Steps

### Phase 1: Basic Integration (Current)
- ✅ Documentation (manifesto, schema, paste-into-ai)
- ✅ `/vibetribe` page with designer form
- ✅ JSON generation (VibeRoom, ChatCard extension format)

### Phase 2: Database & API
- [ ] Add Prisma models (VibeRoom, VibeRoomMember, VibeCard)
- [ ] Create API routes for VibeRoom CRUD
- [ ] Create API routes for VibeCard management
- [ ] Update card.json generation to include extensions

### Phase 3: UI Integration
- [ ] Add "My VibeRooms" section to dashboard
- [ ] Add VibeRoom creation from Proof Studio
- [ ] Show VibeRoom badges on public cards
- [ ] Vibe matching UI (suggest rooms based on vibe)

### Phase 4: Advanced Features
- [ ] Vibe matching algorithm
- [ ] Room discovery/search
- [ ] VibeRoom analytics
- [ ] Integration with proposals system

## Migration Path

1. **Immediate**: `/vibetribe` page works standalone, generates JSON
2. **Short-term**: Add database models, store generated VibeRooms
3. **Medium-term**: Integrate with card.json, show in user cards
4. **Long-term**: Full vibe matching, room discovery, analytics

## Compatibility

- **Backward Compatible**: Extensions field is optional, existing cards work unchanged
- **Forward Compatible**: New fields in VibeProfile can be added without breaking existing rooms
- **Protocol Agnostic**: VibeRoom JSON can be used outside ChatCard ecosystem

## Next Steps

1. Review and approve integration approach
2. Implement Phase 2 (database & API)
3. Test with real VibeRooms
4. Document API endpoints in OpenAPI spec
5. Add to go-live checklist

