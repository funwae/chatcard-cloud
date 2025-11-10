# design.md — chatcard.cloud

## 1. Purpose

chatcard.cloud is the **home page for ChatCard**.

Goals:

- Explain **what ChatCard is** in plain language.
- Show why a **portable chat card** is better than “a new chat box in every app”.
- Give clear paths for:
  - **People** who want a card.
  - **Providers** who want usage pattern data.
  - **Builders** who want to plug their page/app into Carditecture.
- Keep vocabulary tight: **ChatCard**, **Carditecture**, and **powered by glyphd labs** as the default lab line.

No extra product names, no historical nouns.

---

## 2. Brand & tone

**Tone**

- Calm, confident, and slightly technical.
- Cross-cultural friendly: avoid slang, avoid jargon where possible.
- Sounds like a serious product, not a toy.

**Voice rules**

- Say “card” more than “assistant”.
- Say “your AI provider” or “the AI you trust” instead of specific names, unless in examples.
- Emphasize “goes with you”, “across apps and sites”, “remembers how you talk”.

---

## 3. Visual design

**Overall feel**

- Light, breathable, and precise.
- Think: **clean product landing**, not over-branded SaaS or dark dashboard.
- Strong focus on the **card** as the main visual motif.

**Layout**

- Single-page (or very short multi-section) layout.
- Generous spacing, clearly separated sections.
- On mobile, everything should read in a simple scroll with clear hierarchy.

**Color**

- Light background: soft off-white / very light gray.
- Accent palette: muted blues and subtle highlights (no neon).
- Use one primary accent color for CTAs and key highlights; keep everything else quiet.
- Avoid harsh pure black / pure white; slightly softened values are preferred.

**Typography**

- Clean, modern sans-serif.
- Hierarchy:
  - H1: strong but not shouting.
  - H2/H3: used to structure the storyline.
  - Body: comfortable line length and spacing.

**Card motif**

- Show **one main ChatCard** visual in the hero.
  - Compact, rounded rectangle.
  - Shows a name, avatar, a “Provider linked” indicator, and one or two sample “page actions”.
- Optionally show a small cluster of sites/apps behind or around it (blurred / generic), to imply “this card moves between them” — no specific brands needed.

**“Powered by glyphd labs”**

- Always small and subtle.
- Appears in the site footer and optionally in a tiny label near the card visual.
- Never the main logo.

---

## 4. Page structure

### 4.1 Header

- Simple header with:
  - **Logo / wordmark**: “ChatCard”.
  - Minimal nav: `Why`, `How it works`, `For providers`, `For builders`.
  - A primary button: **Get your ChatCard** (or similar CTA).

### 4.2 Hero section

**Content**

- H1 (examples, refine in copy):

  > Your chat, on a card.

- Subhead (refine but keep the meaning):

  > ChatCard is a portable chat card you can carry across apps and sites.  
  > It remembers how you talk, links to the AI you trust, and clicks into AI-enabled content on the web.

- Supporting line:

  > Instead of starting over in every product, you bring one card with your name, tone, and history — and let apps plug into it through Carditecture.

**Hero CTAs**

- Primary: **Get your ChatCard**
- Secondary: **See how Carditecture works**

**Hero visual**

- The card itself as the focal point.
- Show:
  - Name, avatar, language flags or tags (e.g. “EN · 中文”).
  - A “Linked provider” indicator (no vendor logos needed).
  - One or two “page actions” (e.g. “Summarize this page”, “Explain this chart”).

### 4.3 “Why a ChatCard?” section

Goal: explain *why* this exists in 3–4 bullets.

Key ideas to cover:

- Every product is shipping its own chat box; users restart their history everywhere.
- ChatCard gives you **one card** that remembers your preferences.
- Apps and sites can **plug into** that card instead of rebuilding chat from scratch.
- Providers see **structured usage patterns** (with user consent) instead of isolated logs.

Structure:

- Short intro paragraph.
- 3–4 feature cards, e.g.:
  - “One card, many apps.”
  - “Remembers how you talk.”
  - “Your provider, your choice.”
  - “Clear, structured usage events.”

### 4.4 “How Carditecture works” section

Goal: introduce **Carditecture** simply.

Three columns or steps:

1. **The Card**
   - “You carry a ChatCard with your name, avatar, languages, and tone.”
   - “You link it to the AI provider you trust.”

2. **The Pages & Apps**
   - “Pages and apps declare simple ‘do this with your card’ actions.”
   - “Your card can see those actions and fetch just enough context.”

3. **The Providers**
   - “Your provider sees a clean stream of events: which card acted, where, and what kind of context it used.”
   - “They don’t need to own every UI — they just plug into Carditecture once.”

No deep implementation detail; keep it conceptual.

### 4.5 “For providers” strip

Short, direct, 2–3 paragraphs max.

Content to cover:

- “Plug into Carditecture once; your models can appear anywhere a ChatCard does.”
- “Get a clean event feed: which card acted, on what surface, with what kind of context.”
- “You don’t own the UI; the card handles consent, prefs, and presentation.”

Include a small secondary CTA like **Provider docs (soon)** or **Talk to us** (even if it’s placeholder).

### 4.6 “For builders” strip

Short section for people building sites / apps.

Key points:

- “Add a tiny JSON snippet declaring what your page can do with a ChatCard.”
- “Optionally expose a context endpoint.”
- “The card does the rest: it discovers actions, fetches context, and talks to the provider.”

CTA: **Builder docs (soon)** or **Join early builders**.

### 4.7 Optional “Nerd corner” / technical note

Small, collapsible or low-emphasis block.

- Title like: **If you’re curious how it works**
- One paragraph mentioning:

  > Under the hood, Carditecture uses a cross-language brain and a history layer — built by glyphd labs — to make sure your card can move between cultures and remember what happened. You don’t need to care about that to use it.

No explicit mentions of **Glyphd**, **GlyphdIR**, **Tongbuku**, or **Buoychong** unless you really need them here; if added, they must be framed as “internal components”. Do not expand into their own brands on this site.

### 4.8 Footer

- Simple, compact.

Includes:

- “powered by **glyphd labs**”
- Minimal links (e.g. `Contact`, `Privacy`, `Status` placeholder if applicable).

---

## 5. Content rules (very important)

- **Allowed public nouns** on this site:
  - ChatCard
  - Carditecture
  - glyphd labs (only in “powered by glyphd labs” and short lab explanation)
- Optional, but only in a small technical note:
  - Glyphd, GlyphdIR, Tongbuku, Buoychong — and only as “internal components” or examples, not as primary CTAs.

- **Do NOT introduce**:
  - Atmos ID
  - AURA
  - FTIX
  - Celeste (as infra)
  - JIJING (as city/street layer)
  - Any legacy project names unless explicitly told to.

- Use **“card”** rather than “assistant” as the primary metaphor.

---

## 6. UX & responsiveness

- Mobile-first: hero and sections must read well on small screens.
- CTAs always visible within 1–2 scrolls.
- Avoid clutter; prefer 2–3 strong sections over many small ones.
- Keep interaction simple: no heavy animations, no complex scroll magic.

