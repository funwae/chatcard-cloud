# Go-Live Checklist

This checklist ensures ChatCard is ready to accept users in production. Complete all **Must-do blockers** before opening signups.

## Must-do Blockers (Ship Gate)

### Security & Auth

- [ ] **Rotate any test keys** ever pasted in chat/console; set short TTL & alerts. ⚠️ MANUAL
- [x] **CORS allowlist**: `chatcard.cloud`, `www.chatcard.cloud`, `zekechat.com`, `www.zekechat.com`, staging subdomains only. ✅
- [x] **Helmet CSP** locked (script/connect/img/style) with SSE + WS origins whitelisted. ✅
- [x] **Session/JWT**: exp ≤ 24h, refresh ≤ 30d; clock-skew ±2m; JWT aud/iss checked. ✅
- [x] **Magic-link**: 15m expiry, one-time, IP/UA soft bind, per-IP/email cooldown; add optional CAPTCHA after 3 fails. ✅
- [ ] **Passkeys plan**: keep `@simplewebauthn` stubbed; block UI behind feature flag. ⚠️ Need feature flag
- [x] **Abuse guards**: per-IP & per-user **rate limits** by route; bot heuristics on auth & write endpoints. ⚠️ Rate limits ✅, bot heuristics ❌

### Data & Privacy

- [x] **PII map** (email, IP, UA, DID, keys); purge strategy & retention table (90d logs, 30d magic links). ⚠️ Log redaction ✅, automated purge ❌
- [x] **User export/delete** endpoints: `/api/me/export`, `/api/me/delete` + admin hold for 7d. ✅
- [x] **Privacy Policy / ToS / AUP** published; capture **ToS version** at signup in DB. ✅

### Proofs / Anchors / Co-sign

- [x] Canon spec **cc-html-1** frozen & versioned; return `specVersion` in public proof. ✅
- [x] **Replay guard**: messageHash unique; `issuedAt` within ±10m. ✅
- [x] **Anchor quotas**: max N/day/user; backoff with jitter; **worker** runs as separate proc. ⚠️ Quota ✅, jitter ⚠️, worker ✅
- [x] **Public proof** never leaks emails/IPs; includes `tier`, anchors, cosigns only. ✅

### Reliability & Ops

- [x] **/healthz** checks Postgres + Redis (with ping + version). ✅
- [x] **/metrics** Prometheus: anchor job counts, magic-link req/used/expired, cosign totals, API latency p95. ✅
- [x] **PM2** (or Procfile) with two procs: `api`, `anchor-worker`; graceful SIGTERM/SIGINT. ✅
- [x] **Backups**: Postgres PITR enabled; nightly restore test documented. Redis AOF on. ⚠️ Documented, needs infrastructure
- [x] **SLOs** set: API p95 < 300ms, 99.9% uptime app; alert rules wired. ⚠️ Metrics ✅, alerts need config

### Frontend & UX

- [x] **Public pages**: `/p/[mh]` shows Anchored / Co-signed / Tier chips; no PII. ✅
- [x] **Proof Studio**: Anchor & Co-sign buttons; modal with canonical text + QR + copy + .txt download. ✅
- [x] **Onboarding**: first-run demo proof (read-only) + 90-sec QuickStart. ✅
- [ ] **Accessibility** WCAG 2.2 AA on auth & proof pages (focus order, labels, contrast). ⚠️ Partial, needs audit
- [ ] **i18n** en/zh string coverage ≥ 95%; Noto Sans SC loaded correctly. ❌ Not implemented

---

## Launch-day Runbook

### 1) Migrate, seed, warm-up

```bash
pnpm -w install
cd apps/chatcard-api && pnpm db:migrate
pnpm build
pm2 start ecosystem.config.js  # api + anchor-worker
```

- [ ] Verify `/healthz` (200) & `/metrics` non-empty.
- [ ] Seed one **demo proof** + owner to validate flows.

### 2) Secrets & env (final)

- [ ] `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `MAIL_FROM`, `WEB_BASE_URL`, `ANCHOR_*`, `ZAI_*` set in prod store.
- [ ] Rotate `JWT_SECRET` canary to confirm reload path.
- [ ] DNS: `chatcard.cloud`, `zekechat.com` A/AAAA + `TXT` for **DID** (optional ownership signal).

### 3) Smoke tests (copy/paste)

Run `./scripts/smoke-tests.sh` or see [Smoke Tests](#smoke-tests) section below.

- [ ] Magic-link: request → consume → token invalid on 2nd use.
- [ ] Anchor: POST queue → status progresses → public proof shows anchor.
- [ ] Co-sign: valid signature → 200 + `tier:"L4"`; duplicate → 409; stale timestamp → 400.
- [ ] Rate limits: exceed auth requests → 429 (cooldown resets).
- [ ] Logs: redaction works (no secrets/PII).

### 4) Observability

- [ ] Grafana dashboard: p95 latency, error rate, queue depth, worker failures.
- [ ] Alerts: Slack/Email on `5xx>1% 5m`, anchor failures spike, Redis disconnect, DB conn errors.
- [ ] Status page (simple): `/status` with component list & incidents.

### 5) Docs & developer surface

- [x] `/docs` OpenAPI (zod-to-openapi) for public endpoints. ✅
- [x] `README` QuickStart (90 sec), `SETUP.md`, **Abuse & Support** page. ✅
- [x] `robots.txt` + `ai.txt` present; `.well-known/chatcard-proof` returns example. ⚠️ Need to verify well-known endpoint

---

## First 48 Hours (Stabilize)

- [ ] Enable **canary** (5–10% traffic) with rollback script.
- [ ] Watch queue depths; raise worker concurrency only if CPU < 60% & Redis OK.
- [ ] Triage bucket for user reports (support@, simple form).
- [ ] Sample 20 public proofs; manual QA of anchors/cosigns.
- [ ] Bake first **release notes** (what's live, limits, how to report issues).
- [ ] Schedule key rotation reminders (Z.ai, JWT, mailer) every 90 days.

---

## Nice-to-have (Fast Wins, Not Blockers)

- [ ] **Email provider** (Resend/Postmark) + DKIM/SPF; deliverability score ≥ 90.
- [ ] **Captcha** only after repeated auth failures (avoid user friction).
- [ ] **OpenTimestamps** provider implementation; EVM-L2 contract with `Anchored(bytes mh)` event.
- [ ] **Export bundles**: user can download `card.json` + proofs + anchors as ZIP.
- [ ] **Admin** `/admin` mini-panel: queues, last errors, user search, ban.

---

## Acceptance Criteria (Green Check to Open Signups)

- [ ] All **Blockers** complete and verified in prod.
- [ ] Smoke tests pass; anchor worker stable for 2h.
- [ ] Alerts firing to your channel; dry-run acknowledged.
- [ ] Privacy/ToS visible; ToS version stored at signup.
- [ ] Backups tested & documented restore.
- [ ] Public proof page + Proof Studio UX verified on desktop & mobile.

---

## Smoke Tests

See `scripts/smoke-tests.sh` for automated tests, or run manually:

```bash
# Set base URL
API_URL="http://localhost:3001"

# 1. Health check
curl -f $API_URL/healthz

# 2. Magic-link flow
EMAIL="test@example.com"
curl -X POST $API_URL/api/auth/magic/request -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\"}"
# Check console for link, then consume it
TOKEN="<from_console_output>"
curl -X POST $API_URL/api/auth/magic/consume -H "Content-Type: application/json" -d "{\"token\":\"$TOKEN\"}"
# Verify 2nd use fails
curl -X POST $API_URL/api/auth/magic/consume -H "Content-Type: application/json" -d "{\"token\":\"$TOKEN\"}"

# 3. Anchor flow (requires authenticated session)
# POST /api/proofs/:mh/anchor
# GET /api/anchors/:mh
# GET /p/:mh (verify anchor appears)

# 4. Co-sign flow
# POST /api/proofs/:mh/cosign with valid signature
# POST /api/proofs/:mh/cosign with duplicate (should 409)
# POST /api/proofs/:mh/cosign with stale timestamp (should 400)

# 5. Rate limits
# Make 11 auth requests rapidly, verify 429 on 11th
```

---

## Related Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [API Documentation](./apps/chatcard-api/README.md) - API endpoint reference
- [Abuse & Support](./docs/ABUSE_AND_SUPPORT.md) - Reporting and support channels
- [Backup & Restore](./docs/BACKUP_RESTORE.md) - Backup procedures

