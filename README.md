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

### Prerequisites

- Node.js 18+ 
- npm (or pnpm/yarn)
- Convex account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SynergyOS
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file:
```env
PUBLIC_CONVEX_URL=your_convex_deployment_url
```

4. Set up Convex:
```bash
npx convex dev
```

5. Set backend environment variables (for Resend):
```bash
npx convex env set RESEND_API_KEY your-resend-api-key
```

### Development

Start the development server:
```bash
npm run dev
```

Start Convex development (in a separate terminal):
```bash
npx convex dev
```

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

## License

MIT
