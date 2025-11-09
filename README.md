# SynergyOS

**Open Source Knowledge Retention System**

A modern knowledge retention and learning platform built with SvelteKit, Convex, and ProseMirror. Transform content from any source into actionable knowledge through the CODE framework (Collect → Organise → Distill → Express).

## Tech Stack

- **Frontend**: SvelteKit 5 + TypeScript
- **UI Components**: Bits UI (headless components) + Tailwind CSS
- **Backend**: Convex (real-time database & serverless functions)
- **Email**: Resend
- **Testing**: Vitest + Testing Library + Playwright
- **Deployment**: Vercel

## Getting Started

**→ [Quick Setup Guide](dev-docs/2-areas/start-me.md)** - Get running in 5 minutes

### TL;DR

**1. Install dependencies:**
```bash
npm install
```

**2. Setup Convex & get your deployment URL:**
```bash
npx convex dev
```

**3. Create `.env.local` with your Convex URL:**
```env
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

**4. Run TWO terminals:**

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Database:
```bash
npx convex dev
```

**5. Open:** http://localhost:5173

**Having trouble?** See [Start Me Guide](dev-docs/2-areas/start-me.md) for detailed troubleshooting.

**Managing Secrets?** See [Secrets Management Guide](dev-docs/2-areas/secrets-management.md) for 1Password CLI setup.

### Testing

Run unit tests:
```bash
npm run test:unit
```

Run e2e tests:
```bash
npm run test:e2e
```

### Building

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
SynergyOS/
├── convex/          # Convex backend functions
├── src/              # SvelteKit application
│   ├── routes/       # Application routes
│   │   ├── inbox/    # Universal inbox UI
│   │   ├── flashcards/ # Flashcard study interface
│   │   ├── notes/    # Rich text note editor
│   │   └── login/    # Authentication pages
│   └── lib/          # Shared utilities & components
│       └── components/
│           └── inbox/ # Source-specific detail components
├── static/           # Static assets
├── ai-content-blog/  # Blog content exported from notes
└── e2e/              # End-to-end tests
```

## Current Status: Phase 1 Complete ✅

**Phase 1: UI/UX with Mock Data** - Complete
- ✅ Three-column inbox layout (Linear-style)
- ✅ Polymorphic source views (Readwise, Photo, Manual)
- ✅ Mock flashcard generation workflow
- ✅ Flashcard study interface (list & study modes)
- ✅ Full CODE workflow: Collect → Organise → Distill → Express
- ✅ **Design Token System**: Semantic spacing, colors, typography with light/dark mode
- ✅ **Theme System**: Persistent app-wide theming with workspace toggle

**Next: Phase 2** - Add Convex schema and connect to real data

**📖 For Full Product Vision & Development Plan:** See `dev-docs/product-vision-and-plan.md`

**Try it:** Visit `/inbox` and `/flashcards` to see the full workflow in action!

## Environment Variables

### Frontend (.env.local)
- `PUBLIC_CONVEX_URL` - Your Convex deployment URL

### Backend (set via `npx convex env set`)
- `RESEND_API_KEY` - Your Resend API key for sending emails

## Contributing

We're building SynergyOS in public and learning together. Whether you're fixing a bug, adding a feature, or just sharing a pattern you discovered, contributions are welcome.

**Quick Start:**
- Read our [Contributing Guidelines](CONTRIBUTING.md) for commit message format and workflow
- Check our [Core Values](CORE-VALUES.md) to understand how we make decisions
- Browse `dev-docs/patterns/INDEX.md` for existing patterns before building

We value clear documentation, authentic communication, and learning from mistakes. If you document what you learned while contributing, even better.

**First-time contributors:** We label "good first issues" and celebrate all contributions. Ask questions in discussions - we're figuring this out together.

## License

MIT
