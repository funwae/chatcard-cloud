# ChatCard Proofs — NEXT_STEPS.md

This document enumerates **concrete, code-ready next steps** to take the current implementation to a production-quality launch. Each section includes:

- **Why** (goal)
- **Exact tasks** (checklist you can hand to Cursor/CI)
- **Code stubs / interface contracts** (where helpful)
- **Success criteria** (what to demo/verify)

It assumes the monorepo structure you’ve already created:

```
/
  packages/
    chatcard-proof/        # SDK (ESM/CJS)
    types/                 # (optional) shared types
  apps/
    chatcard-api/          # Express + Prisma + Pino + Zod
    chatcard-web/          # Next.js (public /me pages + Proof Studio)
  docs/
```

---

## 0) Prereqs & Environment

**Why:** ensure stable, reproducible local/staging/prod.

**Tasks**
- [ ] Add `.env.example` for **API** and **WEB** with:
  - `DATABASE_URL`
  - `SESSION_SECRET`
  - `WEB_BASE_URL` (e.g. https://chatcard.cloud)
  - `API_BASE_URL` (e.g. https://api.chatcard.cloud)
  - `PASSKEY_RP_ID` (chatcard.cloud)
  - `PASSKEY_ORIGIN` (https://chatcard.cloud)
  - `AGENT_JWT_ISS` (did:cc:registry)
  - `AGENT_JWT_JWKS_URL` (https://chatcard.cloud/.well-known/chatcard/agent-keys.json)
  - `RATE_LIMIT_RPM`, `BUDGET_DAILY_TOKENS`
- [ ] Create `docker-compose.yml` for Postgres + Redis (if you’ll use rate/budget in Redis).
- [ ] Seed script to create an initial **owner** user + key.

**Success**
- `pnpm dev` spins everything up with hot reload. DB + seeds succeed.

---

## 1) WebAuthn Passkeys (owner login)

**Why:** strong, phishing-resistant auth. “You = your device key”.

**Tasks (API)**
- [ ] Install `@simplewebauthn/server`.
- [ ] Add Prisma models:
  ```prisma
  model WebAuthnCredential {
    id           String   @id
    userId       String
    user         User     @relation(fields: [userId], references: [id])
    publicKey    String
    counter      Int
    transports   String[]
    aaguid       String?
    createdAt    DateTime @default(now())
  }
  ```
- [ ] Add routes:
  - `POST /auth/passkey/register/options` → `generateRegistrationOptions()`
  - `POST /auth/passkey/register/verify`  → `verifyRegistrationResponse()`
  - `POST /auth/passkey/login/options`    → `generateAuthenticationOptions()`
  - `POST /auth/passkey/login/verify`     → `verifyAuthenticationResponse()`
- [ ] Store **RPID** = `PASSKEY_RP_ID`, **origin** = `PASSKEY_ORIGIN`.
- [ ] On verify-success: create session/JWT; update credential counter.
- [ ] CSRF/Replay: tie challenges to server session or short-lived store by `userId`.

**Tasks (WEB)**
- [ ] Use `@simplewebauthn/browser` from Proof Studio and Dashboard:
  - “Create passkey” button → calls register options → `startRegistration()`
  - “Sign in with passkey” → calls login options → `startAuthentication()`

**Success**
- Register + login using passkey on desktop+mobile Safari/Chrome. Counter increments. Sessions work.

---

## 2) Magic Link Fallback (optional)

**Why:** onboard users before they have passkeys.

**Tasks**
- [ ] Prisma:
  ```prisma
  model MagicLink {
    id         String   @id @default(cuid())
    userId     String
    token      String   @unique
    expiresAt  DateTime
    usedAt     DateTime?
    createdAt  DateTime @default(now())
  }
  ```
- [ ] Routes:
  - `POST /auth/magic/request { email }` → send email with `token`
  - `POST /auth/magic/consume { token }` → exchange for session, mark used
- [ ] TTL 15 min; one-time use; IP/rate limits.

**Success**
- Can sign in on a fresh device, then upgrade to passkey from dashboard.

---

## 3) Agent JWT (bot writes)

**Why:** allow **agents** to propose identity items or register proofs without owning passkeys.

**Spec**
- JWS (EdDSA/Ed25519). Header: `{ alg:"EdDSA", typ:"JWT", kid:"<key-id>" }`.
- Claims: `{ iss, sub:"did:cc:<agentOrUser>", aud:"chatcard-api", scope:["proof:write","propose"], iat, exp }`.
- JWKS published at `/.well-known/chatcard/agent-keys.json`.

**Tasks (API)**
- [ ] Implement `GET /.well-known/chatcard/agent-keys.json` serving active public keys.
- [ ] Middleware `requireAgentOrOwner`:
  - Accepts Owner session **or** Agent JWT with valid scope.
  - Verify `iss`, `aud`, `exp`, `kid`; fetch JWKS and cache.
- [ ] Add `scope → route` guard map:
  - `proof:write` → `/api/proofs`, `/api/proofs/:mh/cosign`
  - `propose`    → `/api/me/proposals`

**Success**
- CLI (or unit test) signs JWT with Ed25519; API accepts.

---

## 4) Co‑signing workflow

**Why:** validate collaborations/platform attestations → boost proof tier.

**Tasks**
- [ ] Complete `POST /api/proofs/:mh/cosign`:
  - Validate cosigner DID and signature over `{ multihash | ownerDid | timestamp }`.
  - Enforce: cosigner must be listed as author **or** be a verified platform DID.
- [ ] UI in Proof Studio: “Request co‑sign” → sends signed payload (email/webhook) to collaborator.
- [ ] Store cosignatures in `document.cosignatures[]`.

**Success**
- Cosign raises Verify tier from L1/L2 → L4. Verify endpoint reflects tier.

---

## 5) Anchors (L2/L3) — plugin

**Why:** optional timestamp/immutability without forcing chains on every user.

**Design**
```ts
export interface AnchorProvider {
  name: string;
  queue(proofMh: string): Promise<string>; // returns provider jobId
  status(jobId: string): Promise<{state:"queued"|"posted"|"confirmed", txid?:string}>;
}
```

**Tasks**
- [ ] Add `apps/chatcard-api/src/anchors/` with providers:
  - `none.ts` (no‑op)
  - `opentimestamps.ts` (HTTP bridge style; stub)
  - `evm-l2.ts` (ethers.js; write MH to cheap L2 via event/log)
- [ ] Job queue (BullMQ) to process anchor postings.
- [ ] `POST /api/proofs/:mh/anchor` → enqueue; later update `document.anchors[]`.

**Success**
- Anchor job completes; `/p/:mh` shows `anchors: [{chain, txid, at}]` and Verify tier ≥ L3.

---

## 6) Canonicalization modes v1.1

**Why:** cover common media with safe, stable digests.

**Tasks**
- [ ] **cc-svg-1**: strip comments/metadata, sort attrs, collapse decimals to 4 places; preserve `viewBox`.
- [ ] **cc-md-1**: parse via remark, normalize headings/lists/code fences, collapse whitespace.
- [ ] **cc-pdf-1 (MVP)**: run through `qpdf --qdf --object-streams=disable`, drop XMP/DocInfo volatile fields, then hash bytes.
- [ ] Expose in SDK: `canonicalize(bytes, contentType, mode)` with tests + golden fixtures.

**Success**
- Golden‑file tests pass across OS/Node versions.

---

## 7) Media embedders (non‑blocking)

**Why:** portable proofs when files leave the web.

**Tasks**
- [ ] HTML: `<link rel="cardproof" href="https://chatcard.cloud/p/<mh>">`
- [ ] SVG: add `<metadata><cardproof href="..."/></metadata>`; keep under 1KB.
- [ ] PNG: tEXt chunk `cardproof=https://.../p/<mh>`.
- [ ] JPEG: EXIF UserComment with the URL; keep ASCII.
- [ ] MP4: `udta` atom entry `ccpf` with URL.
- [ ] XMP: custom namespace `cc:Proof` with `cc:url` and `cc:hash`.

**Success**
- `sdk.embed.*` writes/reads these without corrupting files (round‑trip tests).

---

## 8) API documentation (OpenAPI 3.1)

**Why:** partner integrations and self‑serve agent onboarding.

**Tasks**
- [ ] Use `zod-to-openapi` on existing Zod schemas.
- [ ] Add `/docs/openapi.json` (+ Swagger UI at `/docs` in non‑prod).
- [ ] Include auth examples (Agent JWT + Owner session).

**Success**
- Partners can generate typed clients automatically.

---

## 9) Testing strategy

**Why:** correctness + guardrails for canonicalization and verification tiers.

**Tasks**
- [ ] **Unit**: SDK canon/sign/verify (incl. corrupted bytes, mixed encodings).
- [ ] **Property**: fuzz HTML whitespace/attribute order → same digest.
- [ ] **Integration**: API register/GET/cosign/anchor lifecycles.
- [ ] **E2E (Playwright)**: create account → create passkey → sign/host proof → cosign → list on `/me`.
- [ ] **Golden fixtures** per mode with locked digests.

**Success**
- CI runs < 6 min, deterministic across Node LTS.

---

## 10) Security & threat model (v1)

**Why:** preempt abuse, protect keys, keep proofs credible.

**Checklist (STRIDE‑style)**
- **Spoofing**: passkeys for owners; Agent JWT with JWKS pin + `aud` check.
- **Tampering**: immutable `/p/:mh` with `Cache-Control: immutable`; DB row locked by PK.
- **Repudiation**: structured logs (pino), `X-Request-Id`, idempotency keys.
- **Info Disclosure**: never store content bytes by default; redact logs.
- **DoS**: global/IP rate limits; queue budgets; fetch timeouts.
- **Elevation**: route‑scoped permissions; cosign requires author/platform DID membership.

**Extras**
- SSRF guard on remote fetches: allowlist protocols, 5s timeout, 5MB cap.
- Hash‑prefix abuse: verify full digest; forbid `data:` URLs with >1MB.

---

## 11) Performance & caching

**Why:** make verification cheap and instant.

**Tasks**
- [ ] CDN on `/p/:mh` with `Cache-Control: public, max-age=31536000, immutable` and `ETag`.
- [ ] Stale‑if‑error on CDN for 24h.
- [ ] ISR for `/me/[handle]` (revalidate tag when card items change).

**Success**
- First verify < 200ms (CDN hit) once warmed.

---

## 12) Observability & ops

**Why:** see failures early; debug provenance disputes fast.

**Tasks**
- [ ] Prom metrics: `proof_register_total`, `proof_verify_total{tier}`, `proof_anchor_seconds`.
- [ ] Alerts: high 5xx, verify invalid rate > 2%, anchor backlog > 30m.
- [ ] Structured logs (pino) with redaction + correlation IDs.
- [ ] Runbooks: rotate agent keys; revoke compromised user key; anchor requeue.

**Success**
- On-call can resolve most incidents in < 30 minutes.

---

## 13) Public identity pages (/me)

**Why:** human‑readable identity; machine‑readable card.json.

**Tasks**
- [ ] JSON‑LD (`Person` or `Organization`) in page head; link to `card.json`.
- [ ] Tabs: **Creations**, **Collabs**, **Inspired** (filters by tags).
- [ ] “Add to my card” button (owner only) → opens proposal sheet.
- [ ] Privacy toggles per item; unlisted support.

**Success**
- Lighthouse ≥ 95; SSR paths render without JS; `card.json` validates.

---

## 14) CLI (optional, but great DX)

**Why:** creators sign proofs locally.

**Tasks**
- [ ] `packages/chatcard-proof-cli`: `chatcard sign <file|url> --mode cc-html-1 --author mine` → emits JSON + POST to API.
- [ ] `chatcard embed <file> --proof <url>` to add metadata.

**Success**
- Works offline for hashing; posts when online.

---

## 15) Versioning & compatibility

**Why:** evolve without breaking.

**Tasks**
- [ ] `proof.version` stays at "1"; add `meta.compat=["1"]` when you introduce v2.
- [ ] SDK exposes `canVerify(version)`.
- [ ] Deprecation policy doc (6 months).

**Success**
- v2 clients still verify v1 proofs.

---

## 16) DID method & registry (did:cc)

**Why:** map handles to DIDs and keys in a stable, public way.

**Tasks**
- [ ] Minimal resolver: `GET /.well-known/did-cc/:handle` → `{ did, keys[], updatedAt }`.
- [ ] `did:cc:<hash(handle)>` convention; secure canonicalization of handle (lowercase NFC).
- [ ] `ownerCardUrlFromProof(did)` → `https://chatcard.cloud/.well-known/did-cc/<id>.json`.

**Success**
- `verify({ ownerCardUrl })` step upgrades tier to L2 when key matches.

---

## 17) Deployment plan

**Why:** clean separation, rollbackable deploys.

**Tasks**
- [ ] **API** → Fly.io/Render: 2 instances, sticky sessions off, HPA 50% CPU, Postgres managed.
- [ ] **WEB** → Vercel: Edge CDN, ISR for `/me/[handle]`.
- [ ] Domains:
  - `api.chatcard.cloud` → API
  - `chatcard.cloud`     → WEB
- [ ] WAF rules: block non‑GET on `/p/*`, throttle `/api/*` auth routes.

**Success**
- Blue/green deploys; rollbacks < 1 min.

---

## 18) Acceptance checklist (ship v1)

- [ ] Passkey login works on desktop/mobile
- [ ] Proof sign → register → public at `/p/:mh`
- [ ] Co‑sign raises tier to L4
- [ ] Optional anchor recorded and visible
- [ ] `/me/<handle>` renders items; `card.json` matches keys
- [ ] OpenAPI served and accurate
- [ ] Unit + integration + E2E green in CI
- [ ] CDN + caching headers correct
- [ ] Runbooks and on‑call alerts configured

---

## Appendix — Code snippets

### A) Passkey register options (API)
```ts
// apps/chatcard-api/src/routes/auth.passkey.ts
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

r.post('/auth/passkey/register/options', async (req, res) => {
  const user = /* lookup by session/email */;
  const opts = await generateRegistrationOptions({
    rpName: 'ChatCard', rpID: process.env.PASSKEY_RP_ID!,
    userID: user.id, userName: user.handle,
    attestationType: 'none',
    timeout: 60000,
  });
  // persist opts.challenge bound to user
  res.json(opts);
});

r.post('/auth/passkey/register/verify', async (req, res) => {
  const expectedChallenge = /* load from store */;
  const verification = await verifyRegistrationResponse({
    response: req.body, expectedChallenge,
    expectedOrigin: process.env.PASSKEY_ORIGIN!,
    expectedRPID: process.env.PASSKEY_RP_ID!,
  });
  if (!verification.verified) return res.status(400).json({ error: 'invalid' });
  // store credential.publicKey, counter, transports
  res.json({ ok: true });
});
```

### B) Agent JWT verifier (API)
```ts
// apps/chatcard-api/src/middleware/agent.ts
import { createRemoteJWKSet, jwtVerify } from 'jose';

const jwks = createRemoteJWKSet(new URL(process.env.AGENT_JWT_JWKS_URL!));
export async function requireAgentOrOwner(req, res, next) {
  // if owner session present → next()
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).end();
  const token = auth.slice(7);
  const { payload } = await jwtVerify(token, jwks, {
    issuer: process.env.AGENT_JWT_ISS,
    audience: 'chatcard-api'
  });
  req.agent = { did: payload.sub, scope: payload.scope || [] };
  next();
}
```

### C) Canon SVG mode (SDK)
```ts
// packages/chatcard-proof/src/canonSvg.ts
export function normalizeSvg(svg: string): string {
  return svg
    .replace(/<!--[^]*?-->/g, '')
    .replace(/\s+/g, ' ') // collapse whitespace
    .replace(/(\d+\.\d{5,})/g, (_, n) => Number(n).toFixed(4));
}
```

---

**Owner’s note:** this plan is intentionally modular. If you need to ship faster, launch with **Passkeys + L1 proofs** and add **co‑sign + anchors** iteratively. The SDK/API contracts above won’t need to break.

