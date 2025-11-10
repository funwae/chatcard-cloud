# ChatCard

A portable chat identity and interaction protocol. ChatCard is a portable chat card you can carry across apps and sites. It remembers how you talk, links to the AI provider you trust, and can click into "AI-enabled" content on the web.

## What is ChatCard?

ChatCard is a portable chat card you can carry across apps and sites. It remembers how you talk, links to the AI provider you trust, and can click into "AI-enabled" content on the web.

It's a card, not a full-screen app. It goes with you instead of being locked to one website. It can connect back to OpenAI / z.ai / whoever, so they can see real usage patterns (with your consent). Any page that speaks Carditecture can light up little "do this with your card" actions.

## Features

- **Portable Identity**: Carry your AI persona across apps and sites
- **Provider Neutral**: Link to any AI provider you trust
- **Scoped Permissions**: Control what AIs can do on each site
- **Privacy First**: Your card, your data, your control

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Or run on a specific port (e.g., 3002):

```bash
npm run dev:3002
```

The app will be available at `http://localhost:3000` (or your specified port).

### Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

```
chatcard/
├── app/              # Next.js app directory
│   ├── connect/      # Connection flow pages
│   ├── docs/         # Documentation pages
│   └── examples/     # Example implementations
├── components/       # React components
│   ├── ChatCard.tsx  # Main ChatCard component
│   └── ...
├── hooks/           # React hooks
├── lib/             # Library code (SDK)
├── types/           # TypeScript type definitions
└── public/          # Static assets
```

## Documentation

- [ChatCard Protocol](./CHATCARD_PROTOCOL.md) - Technical specification
- [Partner Guide](./PARTNER_GUIDE.md) - Integration guide for partners

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 18** - UI library

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]

---

**Powered by glyphd labs**

Carditecture and the ChatCard protocol are research projects from glyphd labs, focused on cross-cultural AI and portable identity.

