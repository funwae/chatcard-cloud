# agents.md — instructions for Codex (Cursor)

## 1. Your role

You are polishing and finishing the **chatcard.cloud** site according to `design.md` and the naming canon.

Your job:

- Respect the current codebase structure.
- Improve layout, copy, and styling so the site clearly explains ChatCard and Carditecture.
- Enforce the **vocabulary rules** and brand constraints.

Do **not** introduce new architecture or rename internal libraries unless it directly supports the site.

---

## 2. Source of truth

Before making changes:

1. Open and read `design.md` (this file is your visual and copy guideline).
2. Re-read this `agents.md`.
3. Scan the existing code for the chatcard.cloud app (routes, components, layout).

All decisions should align with:

- The **page structure** and **content rules** in `design.md`.
- The **canon terms**:
  - ChatCard
  - Carditecture
  - powered by glyphd labs

---

## 3. Tasks checklist

Follow this in order:

### Step 1 — Audit current site

- Identify:
  - Existing pages and sections.
  - Any outdated terms (Atmos ID, AURA, FTIX, Celeste, JIJING, etc.).
  - Inconsistent tone or redundant explanations.

Plan minimal changes to bring the site in line with `design.md`.

### Step 2 — Structure the page

- Ensure the main page includes, at minimum:

  1. Header with logo/wordmark and nav.
  2. Hero section:
     - H1, subhead, short supporting line.
     - Primary + secondary CTA.
     - Visual representation of a ChatCard.
  3. “Why a ChatCard?” section with 3–4 concise benefits.
  4. “How Carditecture works” section with 3 clear steps (Card, Pages/Apps, Providers).
  5. Short “For providers” strip.
  6. Short “For builders” strip.
  7. Simple footer with “powered by glyphd labs”.

- Use existing components and layout conventions from the repo where possible.

### Step 3 — Copy polish

- Rewrite or tighten text so it matches:

  - The tone in `design.md` (calm, confident, cross-cultural friendly).
  - The simple definitions of ChatCard and Carditecture.

- Enforce **vocabulary constraints**:

  - Allowed nouns:
    - ChatCard
    - Carditecture
    - glyphd labs (only in “powered by glyphd labs” and a brief lab sentence)
  - Optional, low-emphasis, only in a technical/nerd note:
    - Glyphd, GlyphdIR, Tongbuku, Buoychong.

  - Remove or rewrite any mentions of:
    - Atmos ID
    - AURA
    - FTIX
    - Celeste (as infra)
    - JIJING (as “street/city” layer)

  - If legacy names appear in code comments that do not surface to the user, you may leave them; prioritize the UI.

### Step 4 — Visual & layout polish

- Apply the visual direction from `design.md`:

  - Light, clean layout with generous spacing.
  - Clear hierarchy in type and sections.
  - Card-centric hero design.

- If the project uses Tailwind or a design system:
  - Reuse existing utility classes and components.
  - Avoid introducing a second, conflicting system.

- Check:

  - Hero section feels focused and uncluttered.
  - Sections are visually distinct but clearly part of the same page.
  - Mobile layout is readable and usable.

### Step 5 — Technical hygiene

- Ensure:

  - The main page has good semantic HTML (proper headings, landmarks).
  - Links and buttons are clearly labeled and accessible.
  - Basic SEO tags (title, description) reflect the current concept of ChatCard and Carditecture.

- Do not:

  - Add heavy dependencies just for visuals.
  - Introduce complex animation frameworks.

---

## 4. Constraints & non-goals

- **Do not**:

  - Re-architect the app.
  - Add routing complexity unless required by design.md.
  - Bring back legacy branding or subsystems from older eras.

- Treat all “under the hood” pieces (Glyphd, GlyphdIR, Tongbuku, Buoychong) as **optional, nerd-only mentions**. If included, they must be:

  - Short,
  - Clearly labeled as internal,
  - Not primary CTAs.

- The default lab credit is:

  > powered by **glyphd labs**

  Use this exact wording in the footer and wherever a small credit is needed.

---

## 5. Definition recap (for you)

- **ChatCard**: a portable chat card the user carries across apps and sites. It remembers how they talk, links to their chosen AI provider, and can interact with AI-enabled content.

- **Carditecture**: the system that lets apps, providers, and web pages plug into that same card instead of each building their own isolated chat bubble.

- **glyphd labs**: the lab credit line; use “powered by glyphd labs” as the default tagline, nothing more unless explicitly needed.

Keep everything you implement consistent with these definitions.

