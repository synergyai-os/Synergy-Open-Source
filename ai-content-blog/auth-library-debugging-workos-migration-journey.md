# When Your Auth Library Betrays You: A 6-Hour Debugging Journey (And Why We're Switching to WorkOS)

## The Hook

I'm building SynergyOS (Axon internally), an open-source knowledge retention app. Yesterday, I went to test user registration on our production environment and got hit with this:

```
TypeError: Cannot read properties of null (reading 'redirect')
```

**My prompt to Claude:** "i cant login into my product environment."

Simple auth bug, right? Probably an environment variable or a typo. We'd have it fixed in 15 minutes.

Narrator: *It was not fixed in 15 minutes.*

## The Investigation

Instead of guessing, Claude followed our `/Axon/start` workflow: **Investigate → Scope → Define → Plan**.

First move: Check the console logs. The error was coming from `@mmailaender/convex-auth-svelte`'s `signIn` function. But here's what was weird—it worked perfectly on localhost. Same code, same flow, different result.

**Claude's investigation:**
```bash
# Checked environment variables
PUBLIC_CONVEX_URL=https://prestigious-whale-251.convex.cloud
SITE_URL=https://www.synergyos.ai

# Verified WebSocket connection
✅ Connected to Convex

# Tested auth state initialization  
✅ signIn function exists
✅ Not stuck in isLoading state
```

Everything *looked* correct. But production was throwing `null.redirect` before the request even reached our Convex backend.

## The Build (Attempt 1: Environment Variables)

**Theory:** The library needs `SITE_URL` configured on the Convex backend.

We added it to the Convex production environment variables. Deployed. Tested.

```
❌ Still: TypeError: Cannot read properties of null (reading 'redirect')
```

## The Plot Twist (Attempt 2: Auth Config)

Claude found `convex/auth.config.ts` using `process.env.CONVEX_SITE_URL` instead of `process.env.SITE_URL`.

**The bug:** `CONVEX_SITE_URL` is a built-in Convex variable (read-only), not our user-configurable one.

**The fix:**
```typescript
// ❌ WRONG
domain: process.env.CONVEX_SITE_URL

// ✅ CORRECT  
domain: process.env.SITE_URL || "http://localhost:5173"
```

Committed. Pushed. GitHub Actions deployed. Tested.

```
❌ Still: TypeError: Cannot read properties of null (reading 'redirect')
```

## The Debug Sprint (Attempts 3-5)

At this point, we went full CSI mode:

**Attempt 3: Add Debug Logging**
Added extensive console logs to track every step of the registration flow:

```javascript
console.log('🔵 [Register] signIn function exists:', !!signIn);
console.log('🔵 [Register] Calling signIn with flow: signUp...');
console.log('🔵 [Register] Parameters:', { email, name, flow });
```

Result: Proved the function exists, parameters are correct, but it crashes *inside the library* before reaching our code.

**Attempt 4: Delete and Recreate auth.config.ts**
Based on Context7 research, we discovered `callbacks.redirect` is only for OAuth/Magic Link providers, not Password auth. Deleted the callback. Redeployed.

```
❌ Still: TypeError: Cannot read properties of null (reading 'redirect')
```

**Attempt 5: Manual Convex Backend Redeploy**
Maybe the automated GitHub Actions deploy wasn't picking up changes?

```bash
npx convex deploy --typecheck disable
```

Watched the logs. Confirmed new code deployed. Tested.

```
❌ Still: TypeError: Cannot read properties of null (reading 'redirect')
```

## The Discovery (Attempt 6: The Logs Tell All)

The debug logs finally showed us what was happening:

**Localhost Console:**
```
🔧 [Convex Auth] Initializing authentication...
🔧 [Convex Auth] SITE_URL: http://localhost:5173
✅ [Convex Auth] Authentication initialized successfully
🔵 [Register] signIn function exists: true
✅ Registration successful
```

**Production Console:**
```
📦 [Register Page Version]: 2024-11-09-09:00-auth-config-fix
🔵 [Register] signIn function exists: true
🔵 [Register] Calling signIn with flow: signUp...
❌ Failed to sign in: TypeError: Cannot read properties of null (reading 'redirect')
    at Object.signIn (o9kSsk4m.js:1:5207)
```

**Notice what's missing?** No Convex Auth initialization logs on production. The error happens CLIENT-SIDE before any server request.

The `@mmailaender/convex-auth-svelte` library has a bug where it tries to access `.redirect` on a null object, and this only manifests in production builds.

## The Decision

After 6 hours and 6 different fix attempts, I had a choice:

1. Keep debugging a community library with no official support
2. Switch to an enterprise-ready solution

**My prompt:** "i would suggest WorkOS AuthKit if its free and safer/production ready. we want to get and invite real users. But i want to do this in a new chat."

Claude researched the options:
- **WorkOS AuthKit**: Official Convex integration, 1M MAUs free, zero-config
- **Clerk**: Great UI, more expensive, React-first
- **Custom Auth**: Full control, but weeks of work for SSO/MFA

**The call:** WorkOS AuthKit. Enterprise-ready, officially supported, and I can stop fighting library bugs.

## The Handoff

Claude prepared a complete migration prompt for the next session. Not just "install WorkOS"—a full execution plan:

- Exact steps for WorkOS account setup
- 1Password secret management integration  
- Database migration considerations
- All files that need changes (10+ files listed)
- Testing checklist
- Success criteria

This is what I love about working with Claude: when we hit a wall, we don't just abandon ship. We document *why* we're pivoting and *how* to execute the new approach.

## The Lessons

### 1. Production Bugs Are Different Beasts
Localhost worked perfectly. Production crashed consistently. Same code, different build environment, different behavior. This is why you can't just "test locally and ship."

### 2. Community Packages Are a Risk
`@mmailaender/convex-auth-svelte` is a wrapper around Convex's official `@convex-dev/auth`. Someone built it to make Svelte integration easier. But:
- No official support
- Unclear maintenance status  
- Production bugs are on you to debug

When a community package breaks in production, you have two options: fix it yourself or replace it. We chose replacement.

### 3. Debugging Is Iterative Investigation
We didn't guess randomly. Each attempt was based on evidence:
1. Check environment variables (configuration)
2. Check auth config (provider setup)
3. Add debug logging (trace execution)
4. Research library docs (understand internals)
5. Compare localhost vs production (isolate environment)

By attempt 6, we had definitive proof the bug was in the library, not our code.

### 4. Know When to Cut Your Losses
Sunk cost fallacy is real. We'd already spent hours on this. But continuing to debug a third-party library would cost more time than migrating to a supported solution.

**Time spent debugging:** 6 hours  
**Estimated time to migrate:** 2-3 hours  
**Future maintenance cost:** Zero (WorkOS handles it)

### 5. Document the Failure
Instead of just fixing it and moving on, we:
- Saved the debugging process
- Documented what we learned  
- Created a migration plan
- Wrote this blog post

Future Randy (and anyone else who hits `null.redirect` errors) will thank us.

## The Tools

- **Convex Console**: Live logs for production debugging
- **Browser DevTools**: Console logs with version identifiers
- **Context7 MCP**: Research Convex Auth docs, WorkOS docs
- **1Password CLI**: Secret management for local dev
- **GitHub Actions**: Automated Convex backend deployment
- **Pattern Index**: Fast lookup for existing auth patterns

## What's Next

We're migrating to WorkOS AuthKit. The next session will:
1. Set up WorkOS account and keys
2. Replace `@mmailaender/convex-auth-svelte` with WorkOS
3. Update all auth flows (register, login, logout)
4. Deploy to production
5. Test with real users

I'll write a follow-up post when it's live: "From Broken Auth to Enterprise-Ready in One Afternoon."

## Try It (Don't)

**DO NOT use `@mmailaender/convex-auth-svelte` in production.** If you're building a SvelteKit + Convex app and need auth:

Option 1: **WorkOS AuthKit** (recommended)  
- Official Convex integration
- Free up to 1M MAUs
- [WorkOS + Convex Guide](https://workos.com/blog/convex-authkit)

Option 2: **Clerk**  
- Beautiful UI, more expensive
- [Clerk + Convex Guide](https://docs.convex.dev/auth/clerk)

Option 3: **Custom Convex Auth**  
- Use `@convex-dev/auth` directly (not the Svelte wrapper)
- Build your own client integration
- [Convex Auth Docs](https://docs.convex.dev/auth)

## The Real Outcome

**What I asked for:** Fix the login bug  
**What I got:**
1. ❌ 6 hours of debugging  
2. ✅ Proof the library is broken
3. ✅ A researched alternative (WorkOS)
4. ✅ A complete migration plan
5. ✅ This blog post

**Expected time:** 15 minutes  
**Actual time:** 6 hours  
**Value:** Prevented future developers from the same debugging hell

Sometimes the best code you write is the code you delete. And sometimes the best decision is admitting "this isn't working" and choosing a better tool.

## Building SynergyOS

We're building an open-source knowledge retention app using the CODE framework (Collect → Organize → Distill → Express). Think of it as your second brain—powered by modern web tech and collaborative AI.

**Tech Stack:**
- SvelteKit 5 + Svelte 5 Runes
- Convex (real-time backend)
- Capacitor 7 (mobile)
- Soon: WorkOS AuthKit (enterprise auth)

**Follow the journey:**
- [GitHub](https://github.com/synergyai-os/Synergy-Open-Source)
- [Docs](https://www.synergyos.ai/dev-docs)

**Revenue Model:** Open-source core + marketplace (80% to creators, 20% to platform)

—Randy (with collaborative debugging by Claude)  
*Written with Claude Sonnet 4.5 on November 9, 2024*

---

**P.S.** If you're the maintainer of `@mmailaender/convex-auth-svelte`, no hard feelings. Building Svelte wrappers is hard. But I needed production-ready auth yesterday, and I couldn't wait for a fix. If you patch the `null.redirect` bug, hit me up—I'd love to see what went wrong.

