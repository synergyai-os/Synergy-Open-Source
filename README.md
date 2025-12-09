# Name

### synergyos

# Synopsis

Open Source Knowledge Retention System - Transform content into actionable knowledge

# Description

# Example

# Install:

`npm install synergyos`

# Test:

`npm test`

#License:

## Developer Notes

- Auth guard: run `npm run guard:auth` before pushing. It fails if Convex code uses legacy auth helpers (`getAuthUserId`, `getUserIdFromSession`) or exposes `userId` in public endpoint args; always require `sessionId` and derive user identity via `validateSessionAndGetUserId`. Known debt lives in `scripts/auth-guard-baseline.json`—burn it down over time.
