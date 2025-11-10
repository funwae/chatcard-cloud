# ChatCard Protocol v0 — Technical Spec (Draft)

## 0. Purpose

**ChatCard** is a portable chat identity and interaction protocol.

* Users carry a single **ChatCard** across apps and sites.
* Sites declare **ChatCard affordances** for AI-enabled actions.
* Providers receive **structured usage events** without owning the whole frontend.

Celeste is a **reference implementation** of a ChatCard, not the protocol itself.

---

## 1. Core Concepts

### ChatCard

A portable chat identity + preference profile, addressable by a globally unique `cardId`.

### Provider

A model/operator (OpenAI, z.ai, local runtime, etc.) that:

* holds the actual model / orchestration, and
* consumes **ChatCard Events** for usage patterns and analytics.

### Page / Surface

Any web surface (site, app, widget) that:

* exposes **ChatCardPageSpec** (affordances), and
* optionally exposes a **context endpoint**.

### Broker (optional)

A middle layer (e.g., Funwae) that:

* routes events,
* applies additional policy (worlds, GlyphdIR, etc.),
* but still speaks the same protocol outward.

---

## 2. Data Model v0

### 2.1 Card Profile

```typescript
export type ChatCardProviderLinkStatus =
  | "linked"
  | "pending"
  | "revoked";

export type ChatCardProviderLink = {
  providerId: string;         // e.g. "openai", "zai", "local"
  status: ChatCardProviderLinkStatus;
  eventUrl?: string;          // HTTPS endpoint for ChatCardEvent
  // optional: opaque provider-side token or handle
  providerHandle?: string;
};

export type ChatCardProfile = {
  cardId: string;             // "card_...", globally unique
  displayName: string;        // human-facing
  handle?: string;            // @handle, not required
  avatarUrl?: string;

  languages: string[];        // e.g. ["en", "zh-CN"]
  tone?: "casual" | "formal" | "playful";
  register?: "everyday" | "professional" | "technical";

  // cross-culture prefs are logically here, even if modeled later
  crossCulture?: {
    primaryLocale?: string;   // e.g. "US"
    bridgeLocales?: string[]; // e.g. ["CN"]
  };

  providerLinks: ChatCardProviderLink[];
};
```

**Guarantees:**

* `cardId` is stable and unique.
* A site that "speaks ChatCard" can:
  * read prefs and linked providers,
  * choose a provider,
  * emit events to that provider.

---

### 2.2 Event Envelope

```typescript
export type ChatCardEventKind =
  | "message"      // user or assistant message
  | "tool"         // tool/skill use
  | "page-action"; // action invoked from a page affordance

export type ChatCardEventMode =
  | "text"
  | "voice"
  | "avatar";

export type ChatCardEventPayload = {
  // deliberately minimal
  length?: number;            // characters or tokens
  language?: string;          // e.g. "en", "zh-CN"

  // page-action specific
  actionId?: string;          // from ChatCardPageSpec
  domain?: string;            // origin or hostname

  // optional: semantic hints (hashes, embeddings)
  // never raw secrets or PII by protocol design
  embeddingHash?: string;
};

export type ChatCardEvent = {
  eventId: string;            // UUID
  cardId: string;
  providerId: string;
  timestamp: string;          // ISO 8601

  kind: ChatCardEventKind;
  mode: ChatCardEventMode;

  payload: ChatCardEventPayload;
};
```

**Provider contract:**

* Event receiver **MUST** accept `ChatCardEvent` POST at `eventUrl`.
* Provider may extend payload internally but **MUST NOT** require extra fields for basic operation.

---

### 2.3 Page Affordance Descriptor

```typescript
export type ChatCardPageAction = {
  id: string;                 // stable ID: "summarize-article"
  label: string;              // UI label
  description?: string;       // optional longer hint
};

export type ChatCardPageSpec = {
  actions: ChatCardPageAction[];
  contextUrl?: string;        // optional: where the card can fetch scoped context

  // optional metadata
  version?: string;           // "0.1.0"
  sourceId?: string;          // internal page/component ID
};
```

**Where it lives (v0 guidance):**

* Inline on the page as `window.chatcard = { ... }`, or
* In a `<script type="application/json" data-chatcard>` block, or
* At a well-known endpoint: `/.well-known/chatcard.json`.

---

## 3. Flows

### 3.1 Card Provisioning

1. User visits a ChatCard-aware site or app.
2. They either:
   * create a new card (generate `cardId` + profile), or
   * import an existing card (QR, link, Atmos ID, etc.).
3. Client stores the profile (local storage, Atmos ID, etc.).

> Protocol view: v0 only cares that a valid `ChatCardProfile` exists on the client.

---

### 3.2 Provider Link Flow (OAuth-ish)

**Goal:** allow providers to get usage events without owning the frontend.

1. User taps **"Link to X"** inside their card.

2. Client opens provider's authorize URL, e.g.:

   `https://provider.com/chatcard/link?cardId=card_123&redirect_uri=...`

3. Provider shows consent UI:

   * "Allow ChatCard card_123 to send usage telemetry to [Provider]?"

4. On consent, provider issues a provider-side token / handle, then redirects back:

   `https://app.com/chatcard/linked?providerId=zai&status=linked`

5. ChatCard updates `providerLinks`:

   * add or update `providerId`, `status: "linked"`, `eventUrl`, `providerHandle`.

> v0: token exchange details are **out-of-scope**; protocol only requires `providerLinks` reflect link state and usable `eventUrl`.

---

### 3.3 Using ChatCard on a Page

1. **Discover affordances**

   * Card loads the page.
   * It checks:
     * `window.chatcard`, or
     * `<script data-chatcard>`, or
     * `/.well-known/chatcard.json`.

2. **Render actions**

   * Card shows actions as buttons/chips, e.g.:
     * "Summarize this article"
     * "Explain this chart"

3. **Execute action**

   * On action click:
     1. Card optionally fetches `contextUrl` if present.
     2. Card chooses a `providerId` (default, user preference, or UI).
     3. Card sends a request to that provider / orchestrator (implementation-specific) to get a response.
     4. Card emits a `ChatCardEvent` to `eventUrl` with:
        * `kind: "page-action"`,
        * `payload.actionId`,
        * `payload.domain` from location.origin,
        * `payload.length` based on context size.
     5. Card displays the provider's reply in its own UI.

> The **user experience**: "My card can talk to this page."
> The **page** only provided a tiny JSON descriptor + context endpoint.

---

### 3.4 Revocation

* From the card:
  * User taps "Disconnect X" → set `status: "revoked"` and stop sending events.
* From the provider:
  * Provider may expose a revocation UI; on revoke, it may:
    * stop accepting events, and/or
    * send a callback to mark `status: "revoked"` on the card (future).

---

## 4. Implementation Surfaces (v0)

### 4.1 Card Client Responsibilities

* Store & update `ChatCardProfile`.
* Render UI:
  * identity (avatar, name),
  * prefs (language, tone),
  * provider link states.
* Discover and render `ChatCardPageSpec`.
* Orchestrate:
  * context fetch,
  * provider call (text / tools / avatar),
  * event emission to providers.

### 4.2 Provider Responsibilities

* Expose:
  * **Link endpoint** (for OAuth-ish consent).
  * **Event endpoint** (`eventUrl`) for `ChatCardEvent` POST.
* Optionally:
  * provide **model recommendations** based on card prefs,
  * correlate `cardId` with internal user profiles.

### 4.3 Page / Site Responsibilities

* Add a `ChatCardPageSpec` somewhere discoverable.

* Optionally implement `contextUrl` to return scoped context, e.g.:

  ```json
  {
    "title": "The Future of AI",
    "excerpt": "This article explores...",
    "contentHash": "sha256:..."
  }
  ```

* Don't need to know anything about providers.

---

## 5. Security & Privacy (v0 Principles)

* **No raw secrets** in events by design.
* `ChatCardEvent.payload` is:
  * minimal,
  * aggregate-friendly,
  * safe to log.
* `cardId` is:
  * stable identifier,
  * not inherently PII (PII is a higher-layer concern).
* For more sensitive contexts:
  * use hashes and embeddings instead of raw text,
  * leave full text only in provider-side logs if needed.

---

## 6. Versioning & Extensibility

* Protocol version: `chatcard.v0`
* Backwards-compatible changes:
  * add optional fields,
  * add new `kind` / `mode` values with safe defaults.
* Breaking changes:
  * bump to `v1`, maintain a migration note.

---

## 7. Celeste in This World

* **Celeste** = "default ChatCard client implementation."
* Speaks ChatCard Protocol v0.
* Internally can use:
  * Funwae runtime,
  * GlyphdIR for cross-language intent,
  * Worlds / AURA / FTIX, etc.
* But to partners, it's:

> "Here's our ChatCard-compliant card you can drop into your site today."

---

## Appendix: TypeScript Reference

See `types/chatcard-protocol.ts` for complete TypeScript definitions.

---

**Protocol Version:** v0 (Draft)  
**Last Updated:** 2025  
**Status:** Active Development

