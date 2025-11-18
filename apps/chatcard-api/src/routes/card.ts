import { Router } from 'express';
import { prisma } from '../db/prisma.js';

export const cardRouter = Router();

// GET /me/:handle/card.json - Generate machine manifest from DB
cardRouter.get('/:handle/card.json', async (req, res) => {
  try {
    const { handle } = req.params;
    const user = await prisma.user.findUnique({
      where: { handle },
      include: {
        items: {
          where: { visibility: 'public' },
          orderBy: { createdAt: 'desc' },
        },
        keys: {
          where: { status: 'ACTIVE' },
          select: { publicKeyBase64: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Group items by section
    const sections: Record<string, any[]> = {
      creations: [],
      collabs: [],
      inspired: [],
      capabilities: [],
      links: [],
    };

    for (const item of user.items) {
      const sectionKey = item.section.toLowerCase() as keyof typeof sections;
      if (sections[sectionKey]) {
        sections[sectionKey].push({
          id: item.id,
          title: item.title,
          url: item.url,
          authors: [user.did], // TODO: Extract from metadata if collab
          authorship: item.authorship,
          status: item.status,
          tags: item.tags,
          license: item.license,
          proofs: item.proofs,
          visibility: item.visibility,
        });
      }
    }

    // Extract capabilities from items
    const capabilities = sections.capabilities.map(c => c.title);

    // Build card.json
    const cardJson: any = {
      version: 'cc-1.0',
      card: {
        handle: user.handle,
        did: user.did,
        name: user.name || undefined,
        langs: [], // TODO: Extract from user profile
        links: sections.links.map((l: any) => ({
          type: 'site',
          title: l.title,
          url: l.url,
        })),
        sections: {
          creations: sections.creations,
          collabs: sections.collabs,
          inspired: sections.inspired,
          capabilities,
        },
        policies: {
          allowed_uses: ['summarize', 'answer_questions', 'link_preview'],
          disallowed_uses: ['model_training'],
          rate_limit_per_agent_per_day: 200,
        },
        agent: {
          inbox: `/api/me/proposals`,
          events: `/api/me/events`,
          pubkey: user.keys[0]?.publicKeyBase64 || undefined,
        },
        updated_at: user.updatedAt.toISOString().split('T')[0],
      },
    };

    // Add extensions if user has VibeCard or VibeRooms
    // TODO: Query VibeCard and active VibeRooms from database when models are added
    // For now, extensions field is optional and can be populated by external services
    // Example structure:
    // extensions: {
    //   vibeCard: { defaultVibe: {...} },
    //   vibeRooms: [{ id: "...", name: "...", vibe: {...} }]
    // }

    // Set ETag for caching
    const etag = `"${user.updatedAt.getTime()}"`;
    res.set({
      'Content-Type': 'application/json',
      'ETag': etag,
      'Cache-Control': 'public, max-age=300', // 5 minutes
    });

    // Check If-None-Match
    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.json(cardJson);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

