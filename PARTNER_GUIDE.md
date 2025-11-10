# ChatCard Protocol — Partner Guide

*A portable chat card you can carry across apps and sites.*

---

## What is ChatCard?

ChatCard is a portable chat card you can carry across apps and sites. It remembers how you talk, links to the AI provider you trust, and can click into "AI-enabled" content on the web.

It's a card, not a full-screen app. It goes with you instead of being locked to one website. It can connect back to OpenAI / z.ai / whoever, so they can see real usage patterns (with your consent). Any page that speaks Carditecture can light up little "do this with your card" actions.

---

## Carditecture

**Carditecture** is the way apps, AIs, and websites plug into a shared chat card instead of each building their own little bubble.

**Three layers:**

* **The Card** — ChatCard = the thing the person sees and carries. Name, avatar, language, tone, preferences. Can link to providers (OpenAI, z.ai, etc.).

* **The Connectors** — Cards can connect to: apps (inside a product), providers (so they see usage patterns), AI-enabled pages (buttons like "summarize this" that feed context into the card).

* **The Lab Stuff** (hidden) — Under the hood, Carditecture uses Glyphd to understand cross-language intent, Tongbuku to remember what happened. You only mention this if someone clicks "how does it work?"

---

## What You Get as a Provider

By adopting the ChatCard protocol, you get:

### Portable Usage

Your models follow the user from app to app, site to site, as long as their card is linked to you.

### Structured Telemetry

A simple stream of `ChatCardEvent`s: which card, which page, which action, how big the context was — instead of opaque transcripts.

### Zero-UI Requirement

You don't have to ship or maintain your own widgets everywhere. You just define how you want to respond; the card handles the UX.

---

## What You Get as a Site / App

### Instant AI Affordances

Declare a small JSON descriptor:

```json
{
  "chatcard": {
    "actions": [
      { "id": "summarize-article", "label": "Summarize this article" },
      { "id": "explain-figure", "label": "Explain this chart" }
    ],
    "contextUrl": "https://site.com/api/chatcard/context?id=123"
  }
}
```

### Bring-Your-Own Models

Users choose which provider powers their card. You don't need to pick or host one.

### Respect User Prefs Automatically

The card carries language, tone, and cross-culture settings so you don't have to relearn them.

---

## How It Works (Simple Version)

1. **User gets a ChatCard**

   They create one card identity (name, avatar, prefs).

2. **They link it to a provider**

   Inside the card, they tap "Link to X," go through a familiar OAuth-style consent, and come back.

3. **Sites declare "ChatCard actions"**

   A page describes what the card can do there (summarize, explain, compare, annotate…) plus an optional `contextUrl`.

4. **Card does the rest**

   When the user opens their card:
   * it discovers page actions,
   * fetches context,
   * calls the linked provider, and
   * sends a lightweight **ChatCardEvent** to the provider so they can see what happened.

---

## Integration Steps

### For Providers

1. Implement a **link flow** (OAuth-ish) to attach cards to your account system.
2. Expose an **event endpoint** to receive `ChatCardEvent` POSTs.
3. (Optional) Use card prefs (languages, tone, register) to tune responses.

### For Sites

1. Add a **ChatCardPageSpec** (JSON) to your pages with the actions you want.
2. Optionally provide a **context endpoint** to give the card a scoped view of content.
3. Add a button: **"Open your ChatCard here"** (or let the browser/extension handle it).

---

## Where Celeste Fits

**Celeste** is a personality or default theme for a ChatCard, not infrastructure. It's a ready-made card UI that speaks ChatCard Protocol v0.

You don't have to adopt Celeste to adopt the protocol — but you can use it as the default card **today**.

---

## Next Steps

* Read the [Technical Spec](./CHATCARD_PROTOCOL.md) for complete protocol details
* Check out [Integration Examples](/examples) for code samples
* [Get in touch](#contact) to discuss your integration

---

**Questions?** See our [FAQ](/docs#faq) or reach out directly.

---

**Powered by glyphd labs**

Carditecture and the ChatCard protocol are research projects from glyphd labs, focused on cross-cultural AI and portable identity.

