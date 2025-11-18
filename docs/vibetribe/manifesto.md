# Vibe vs Vibe Manifesto

## From tribe vs tribe → vibe vs vibe

Humans are naturally tribal. We like teams, banners, and "us vs them" stories. That instinct isn't going away—and it doesn't have to. The problem isn't that we like tribes. The problem is when tribes become rigid, inherited, and weaponized.

**The VibeTribe model** is a different way to organize human effort:

> Your "tribe" is constructed per problem, not per lifetime.
> We move from **tribe vs tribe** to **vibe vs vibe**.

Instead of joining one big identity-tribe and staying there forever, you flow through many **short-lived, purpose-built vibe tribes**:

- You join for a **specific mission**.
- You align on a shared **vibe**: tone, values, working style, and conflict norms.
- You build, learn, and then **gracefully dissolve or remix** into new formations.

Identity becomes **stacked, overlapping, and fluid** instead of welded to one banner.

---

## Core ideas

### 1. Tribe per problem, not per lifetime

Traditional tribalism says:

- "You're one of us or you're one of them."
- "Leaving is betrayal."

VibeTribe says:

- "You're invited here **for this problem**, in **this vibe**."
- "When the problem is done or the vibe no longer fits, you drift elsewhere."

You still get belonging, story, and ritual—but **without the lock-in**.

---

### 2. Vibe as a first-class object

A **vibe** is not vague. In this model, each Vibe Tribe explicitly defines:

- **Tone** – playful, serious, contemplative, high-energy…
- **Values** – care, rigor, speed, experimentation, stability…
- **Work style** – async, synchronous bursts, deep-focus, highly social…
- **Conflict style** – direct, gentle, structured, facilitator-led…

That becomes a **Vibe Profile** attached to a person (VibeCard) or to a room (VibeRoom).

---

### 3. AI-assisted vibe matching

In a world of personal AIs, coordination becomes:

- Your AI knows your **vibe fingerprint** (how you like to work and relate).
- It scans open rooms and projects, looking for **problem + vibe fit**, not just "skills match."
- It helps you **enter and exit** rooms smoothly, carrying your history and preferences with you.

Over time, you build a **trajectory of vibes**: the pattern of spaces you show up in, not a single frozen identity-tribe.

---

### 4. From tribes as walls → vibes as bridges

When vibes are explicit and modular:

- You can belong to **many Vibe Tribes at once**.
- Cross-cutting memberships make it harder for any single group to become all-consuming and hostile.
- Conflict can be reframed as **"this vibe vs that vibe for this problem"**, instead of "these people vs those people forever."

We still keep our sports teams, fandoms, and cultural flavors. The difference is that the **serious work of the world** happens in **flexible, vibe-based coalitions**, not in permanent camps.

---

## What VibeTribe does

The VibeTribe module of ChatCard gives you:

1. A way to **design a VibeRoom**: name, mission, and Vibe Profile.
2. A **human-readable manifesto** for your tribe.
3. A **structured JSON block** (VibeRoom) that tools and protocols like ChatCard can use.
4. A **"paste this into your AI" card** so any large language model can understand the vibe and act accordingly.

The north star:

> **Use AI and better architecture to build worlds where people assemble into temporary "vibe tribes" around a goal, and then gracefully dissolve, remix, and re-form—so identity is soft, and collaboration is fluid.**

---

## ChatCard Integration

VibeRooms integrate with ChatCard in several ways:

1. **As Card Extensions**: A VibeRoom can be embedded in a `card.json` as an extension, allowing AI agents to understand the vibe context when interacting with a person's card.

2. **As Room Cards**: A VibeRoom can be its own card type (`card_type: "room"`), representing a collaborative space rather than an individual.

3. **As Collab Items**: VibeRooms can be added to a person's ChatCard in the `collabs` section, showing which vibe tribes they're currently part of.

4. **Vibe Matching**: When an AI agent reads a ChatCard, it can match the person's vibe preferences with available VibeRooms to suggest relevant collaborations.

See [schema.md](./schema.md) for technical details.

