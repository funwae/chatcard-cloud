import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { requireOwner } from '../middleware/auth.js';
import { CreateItemSchema, UpdateItemSchema } from '../schemas.js';
import type { AuthRequest } from '../middleware/auth.js';

export const itemsRouter = Router();

// GET /api/me/items - List all items (owner)
itemsRouter.get('/', requireOwner, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const items = await prisma.cardItem.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/me/sections/:section/items - Direct add (owner)
itemsRouter.post('/sections/:section/items', requireOwner, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { section } = req.params;
    const validated = CreateItemSchema.parse({
      ...req.body,
      section: section.toUpperCase(),
    });

    const item = await prisma.cardItem.create({
      data: {
        userId: req.userId,
        title: validated.title,
        url: validated.url,
        section: validated.section,
        authorship: validated.authorship,
        visibility: validated.visibility,
        status: validated.status,
        tags: validated.tags,
        license: validated.license,
        proofs: validated.proofs as any,
        metadata: validated.metadata as any,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request', details: error });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/me/items/:id - Update item
itemsRouter.patch('/:id', requireOwner, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const validated = UpdateItemSchema.parse(req.body);

    const item = await prisma.cardItem.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updated = await prisma.cardItem.update({
      where: { id },
      data: validated as any,
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid request', details: error });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/me/items/:id - Delete item
itemsRouter.delete('/:id', requireOwner, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const item = await prisma.cardItem.findFirst({
      where: {
        id,
        userId: req.userId,
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await prisma.cardItem.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

