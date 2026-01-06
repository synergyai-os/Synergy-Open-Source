# Name

### synergyos

# Synopsis

The Product OS - Privacy-first platform for product teams integrating discovery, delivery, and AI coaching

## Development Setup

```bash
# Install dependencies
npm install

# Build design tokens (required before first run)
npm run tokens:build

# Start development server
npm run dev
```

**Note**: Design tokens must be built before running the app. The `tokens:build` command generates CSS files from JSON token definitions. See `dev-docs/master-docs/design-system.md` for details.

# Description

# Example

# Install:

`npm install synergyos`

# Test:

`npm test`

#License:

## Developer Notes

- Auth guard: run `npm run guard:auth` before pushing. It fails if Convex code uses legacy auth helpers (`getAuthUserId`, `getUserIdFromSession`) or exposes `userId` in public endpoint args; always require `sessionId` and derive user identity via `validateSessionAndGetUserId`. Known debt lives in `scripts/auth-guard-baseline.json`—burn it down over time.
