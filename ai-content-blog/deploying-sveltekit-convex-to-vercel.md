# Deploying SvelteKit + Convex to Vercel: A 4-Hour Debugging Journey

**What we learned from 7+ failed attempts and one simple fix**

---

## The Context

This was supposed to be simple. Step 1 of implementing [trunk-based deployment](../dev-docs/3-resources/trunk-based-deployment-implementation-summary.md) for our product team. Just get the app deployed to Vercel, connect the domain, and move on to feature flags.

**Estimated time**: 30 minutes  
**Actual time**: 4 hours  
**Attempts**: 7+  
**The fix**: 3 lines of code

This became my longest debugging session in my Cursor AI journey. Here's what actually happened.

---

## The Error That Wouldn't Die

```
[vite]: Rollup failed to resolve import "$convex/_generated/api"
```

Simple, right? Just a missing import. Surely one of the first attempts will fix it.

## The Problem

**What's happening:**

- Convex generates TypeScript types in `convex/_generated/`
- These files are gitignored (as they should be)
- Vercel builds your app without these generated files
- Vite tries to import `$convex/_generated/api` and fails

**The challenge:**

- You need to generate types BEFORE building
- But also deploy your Convex functions
- And authenticate with your production deployment
- All in the right order

## The 7-Attempt Journey (aka "Why You Plan But Never Know")

You plan. You estimate. You think "this should be straightforward." But deployment infrastructure is complex, and you never know what you'll uncover.

### ❌ Attempt 1: Wrong Output Directory

**Hypothesis**: Vercel is looking in the wrong place.

```
Output Directory: public → www
```

**Result**: Still failed. The output directory wasn't the issue.

---

### ❌ Attempt 2: Add Convex Codegen to Build

**Hypothesis**: Types aren't being generated.

```json
// package.json
"build": "npx convex codegen && vite build"
```

**Result**: `MissingAccessToken: An access token is required for this command`

Progress! We need authentication.

---

### ❌ Attempt 3: Switch to `adapter-vercel`

**Hypothesis**: Static adapter isn't handling the build correctly.

```javascript
import adapter from '@sveltejs/adapter-vercel';
```

**Result**: Same error. But this was still a good change - SSR works better.

---

### ❌ Attempt 4: Add `CONVEX_DEPLOY_KEY`

**Hypothesis**: Now that we have authentication, codegen will work.

```
Environment Variables:
- CONVEX_DEPLOY_KEY=prod_xxxx
```

**Result**: Still the same Rollup error. But Convex is deploying now!

---

### ❌ Attempt 5: Fix Environment Variables

**Hypothesis**: Wrong Convex deployment URLs (dev instead of prod).

```
OLD: PUBLIC_CONVEX_URL=https://blissful-lynx-970.convex.cloud (dev)
NEW: PUBLIC_CONVEX_URL=https://prestigious-whale-251.convex.cloud (prod)
```

**Result**: Same error. At least we're pointing to the right database now.

---

### ❌ Attempt 6: Use `vercel.json` with `--cmd`

**Hypothesis**: Build order is wrong. Use `--cmd` flag.

```json
{
	"buildCommand": "npx convex deploy --cmd 'npm run build'"
}
```

**Result**: Same error. Convex deploys successfully, but Vite still can't find the types.

---

### ❌ Attempt 7: Filesystem Mismatch (`CONVEX_TMPDIR`)

**Hypothesis**: The Convex warning about different filesystems is the issue.

```json
{
	"buildCommand": "mkdir -p /vercel/path0/tmp && export CONVEX_TMPDIR=/vercel/path0/tmp && npx convex deploy && npm run build"
}
```

**Result**: STILL THE SAME ERROR.

At this point, we're 3+ hours in. Everything seems right:

- ✅ Convex deploys successfully
- ✅ Types are being generated
- ✅ Build command runs in correct order
- ❌ But Rollup STILL can't resolve `$convex/_generated/api`

---

### ✅ Attempt 8: The Missing Piece

**Hypothesis**: Wait... does SvelteKit even know what `$convex` means?

Check `svelte.config.js`:

```javascript
kit: {
  adapter: adapter(),
  // ... where's the $convex alias?
}
```

**IT'S MISSING.**

The import uses `$convex/_generated/api`, but there's no alias definition. SvelteKit has no idea what `$convex` points to.

**The fix:**

```javascript
kit: {
  adapter: adapter(),
  alias: {
    $convex: './convex'  // ← 3 lines of code
  }
}
```

**Result**: ✅ BUILD SUCCESSFUL. DOMAIN CONNECTED. 🎉

---

## What Actually Works ✅

After 7 attempts and 4 hours, here's the complete solution. All the pieces matter, but **the missing alias was the blocker**.

---

### Step 1: Configure SvelteKit (THE CRITICAL STEP)

**Install the Vercel adapter:**

```bash
npm install -D @sveltejs/adapter-vercel
```

**Update `svelte.config.js`:**

```javascript
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	kit: {
		adapter: adapter(),
		alias: {
			$convex: './convex' // ⚠️ CRITICAL: Without this, Rollup can't resolve imports
		}
	}
};

export default config;
```

**Why this matters:**

- SvelteKit needs explicit `alias` definitions for `$` prefixed paths
- Your code imports `$convex/_generated/api`
- Without the alias, Rollup has no idea where to find `$convex`
- This was the blocker that cost us 4 hours

**This is not in the official Convex docs.** We discovered it the hard way.

---

### Step 2: Set Environment Variables in Vercel

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these 3 variables:**

| Name                | Value                                  | Where to Get It                                     |
| ------------------- | -------------------------------------- | --------------------------------------------------- |
| `CONVEX_DEPLOY_KEY` | `prod:happy-otter-123\|abc123...`      | Convex Dashboard → Settings → Deploy Key → Generate |
| `CONVEX_DEPLOYMENT` | `happy-otter-123`                      | Convex Dashboard → Settings (Deployment Name)       |
| `PUBLIC_CONVEX_URL` | `https://happy-otter-123.convex.cloud` | Convex Dashboard → Settings (Deployment URL)        |

**Important:**

- Use your **Production** deployment values (not dev)
- The deploy key starts with `prod:`
- The URL ends with `.convex.cloud`
- Set environment to **Production** ✓

**What these do:**

- `CONVEX_DEPLOY_KEY`: Authenticates the build process
- `CONVEX_DEPLOYMENT`: Tells Convex which deployment to use
- `PUBLIC_CONVEX_URL`: Your app's connection URL (exposed to browser)

---

### Step 3: Configure Vercel Build Command

**Option A: Use `vercel.json` (Recommended)**

Create `vercel.json` in your project root:

```json
{
	"buildCommand": "mkdir -p /vercel/path0/tmp && export CONVEX_TMPDIR=/vercel/path0/tmp && npx convex deploy && npm run build"
}
```

**Option B: Set in Vercel Dashboard**

Go to: Vercel Dashboard → Project → Settings → General → Build & Development Settings

Set "Build Command" to the same command above.

**What this does:**

1. Creates a temp directory on Vercel's filesystem
2. Exports `CONVEX_TMPDIR` so Convex uses the right filesystem
3. Deploys Convex functions and generates types
4. Builds your SvelteKit app (which can now find the types)

**Why `&&` instead of `--cmd`:**

- `&&` ensures sequential execution
- Each command completes fully before the next starts
- More reliable than the `--cmd` flag

---

### Step 4: Update Your `package.json`

**Keep your build script simple:**

```json
{
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview"
	}
}
```

**What changed:**

- ❌ Remove `npx convex codegen` from build script
- ✅ Let Vercel's build command handle it
- ✅ Keep local dev simple with `npm run dev`

**Why:**

- Vercel runs the full `npx convex deploy --cmd` command
- That handles codegen automatically
- Your `package.json` stays clean

---

### Step 5: Deploy

**Trigger a redeploy:**

1. Go to Vercel Dashboard → Deployments
2. Click "Redeploy" on latest deployment
3. Watch the build logs

**What success looks like:**

```
✓ Running build in Washington, D.C., USA (East) – iad1
✓ Installing dependencies...
✓ Finding component definitions...
✓ Generating server code...
✓ Uploading functions to Convex...
✓ Generating TypeScript bindings...
✓ vite v7.1.12 building SSR bundle for production...
✓ ✓ 207 modules transformed.
✓ Build completed successfully.
```

**Your app is now live!** 🎉

---

## Troubleshooting

### Issue 1: Vercel Keeps Deploying Old Commit

**Symptom:**

- You pushed new code
- Vercel builds an old commit
- Changes don't appear

**Fix:**
Your Git integration webhook might be broken.

1. Go to: Vercel → Project → Settings → Git
2. Click "Disconnect" (removes old webhook)
3. Click "Connect Git Repository" again
4. Select your repo
5. Trigger a new deployment

**Why this happens:**

- You renamed your GitHub repo
- The webhook URL is now incorrect
- Vercel can't detect new commits

---

### Issue 2: "MissingAccessToken" Error

**Symptom:**

```
error: MissingAccessToken: An access token is required for this command.
```

**Fix:**

1. Check you added `CONVEX_DEPLOY_KEY` to Vercel
2. Verify it starts with `prod:` (not `dev:`)
3. Make sure you generated it from **Production** deployment

**How to regenerate:**

1. Go to: https://dashboard.convex.dev
2. Select your **Production** deployment (not dev)
3. Settings → URL & Deploy Key
4. Click "Generate Deploy Key"
5. Copy and add to Vercel environment variables

---

### Issue 3: Build Works but App Shows Wrong Data

**Symptom:**

- Build succeeds
- App loads
- But shows dev data instead of production data

**Fix:**
Check your `PUBLIC_CONVEX_URL`:

1. Should end with `.convex.cloud` (production)
2. Should NOT be a dev deployment URL
3. Should match your production deployment name

**In Vercel environment variables:**

```bash
# ❌ WRONG (dev deployment)
PUBLIC_CONVEX_URL=https://funny-lynx-456.convex.cloud

# ✅ CORRECT (production deployment)
PUBLIC_CONVEX_URL=https://blissful-lynx-970.convex.cloud
```

---

### Issue 4: "Rollup failed to resolve import" Still Happening

**Symptom:**

- You followed all steps
- Build still fails with import error

**Checklist:**

- [ ] Using `@sveltejs/adapter-vercel` (not `-static`)
- [ ] Build command is `npx convex deploy --cmd ...` (not just `npm run build`)
- [ ] `CONVEX_DEPLOY_KEY` is set in Vercel
- [ ] `PUBLIC_CONVEX_URL` is set in Vercel
- [ ] All values are from **Production** deployment
- [ ] You cleared Vercel's cache and redeployed

**If still failing:**
Check the build logs for:

1. "Generating TypeScript bindings..." ✓
2. "vite v7.x.x building..." appears AFTER Convex logs
3. No errors between Convex and Vite steps

---

## The Complete Checklist

**Before you deploy:**

### Files Changed:

- [ ] `svelte.config.js` - Using `adapter-vercel`
- [ ] `package.json` - Build script is just `vite build`

### Vercel Settings:

- [ ] Build Command: `npx convex deploy --cmd-url-env-var-name PUBLIC_CONVEX_URL --cmd 'npm run build'`
- [ ] Output Directory: Leave empty (adapter handles it)
- [ ] Install Command: `npm install` (default)

### Vercel Environment Variables:

- [ ] `CONVEX_DEPLOY_KEY` - From Production deployment
- [ ] `CONVEX_DEPLOYMENT` - Your production deployment name
- [ ] `PUBLIC_CONVEX_URL` - Your production URL (ends in `.convex.cloud`)

### Convex Dashboard:

- [ ] Production deployment exists
- [ ] Deploy key generated
- [ ] All functions deployed

**Then:** Click "Redeploy" in Vercel.

---

## Why This Works

The key insight: **Convex needs to deploy BEFORE your app builds.**

**Wrong approach:**

```
npm run build → npx convex codegen → vite build → ❌ (no types yet)
```

**Correct approach:**

```
npx convex deploy → generates types → npm run build → vite build → ✅
```

**The `--cmd` flag is the secret:**

- It tells Convex: "After you deploy, run this command"
- Convex deploys functions, generates types, THEN builds your app
- Your app builds with types already present

**From Convex docs:**

> "Use `npx convex deploy --cmd 'npm run build'` to deploy your backend and build your frontend in one command."

---

## Local Development vs. Production

**Local development:**

```bash
# Terminal 1: Convex dev server
npx convex dev

# Terminal 2: SvelteKit dev server
npm run dev
```

**What happens locally:**

- `npx convex dev` watches for changes
- Generates types automatically on save
- `npm run dev` picks up the types
- Hot reload works perfectly

**Production deployment:**

- Vercel runs ONE command
- `npx convex deploy --cmd 'npm run build'`
- Types generated, then app built
- Deploy happens once, not continuously

---

## What We Learned

### 1. Read the Official Docs First

I tried multiple workarounds before checking [Convex's deployment docs](https://docs.convex.dev/production/hosting/vercel). The solution was documented all along.

### 2. Adapters Matter

Using the right SvelteKit adapter (`adapter-vercel` vs. `adapter-static`) makes a huge difference. Platform-specific adapters exist for a reason.

### 3. Build Order is Critical

The sequence matters:

1. Deploy backend (Convex)
2. Generate types
3. Build frontend (SvelteKit)

Get this wrong, and nothing works.

### 4. Production vs. Dev Keys

Using dev deployment keys in production causes subtle bugs. Always use production keys for production builds.

### 5. Environment Variables Need Context

`PUBLIC_CONVEX_URL` is exposed to the browser. `CONVEX_DEPLOY_KEY` is server-only. Understanding this prevents security issues.

---

## Resources

**Official Docs:**

- [Convex Production Deployment](https://docs.convex.dev/production)
- [Convex + SvelteKit](https://docs.convex.dev/quickstart/sveltekit)
- [SvelteKit Adapters](https://kit.svelte.dev/docs/adapters)
- [Vercel SvelteKit Guide](https://vercel.com/docs/frameworks/sveltekit)

**Code Examples:**

- [Convex Svelte Template](https://github.com/get-convex/convex-svelte)
- [SvelteKit + Vercel Adapter](https://github.com/sveltejs/kit/tree/master/packages/adapter-vercel)

**Secret Management:**

- See our [Secrets Management Guide](../dev-docs/2-areas/secrets-management.md) for 1Password CLI setup

---

## Quick Reference

**Copy-paste commands:**

```bash
# Install Vercel adapter
npm install -D @sveltejs/adapter-vercel

# Generate production deploy key
# (Do this in Convex Dashboard UI)

# Vercel build command (paste in Vercel settings)
npx convex deploy --cmd-url-env-var-name PUBLIC_CONVEX_URL --cmd 'npm run build'
```

**Environment variables template:**

```env
CONVEX_DEPLOY_KEY=prod:your-deployment-name|abc123xyz...
CONVEX_DEPLOYMENT=your-deployment-name
PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
```

---

## The Bigger Picture: What We Actually Learned

### 1. You Plan, But You Never Know

**The plan**: 30 minutes to deploy, then move on to feature flags.  
**The reality**: 4 hours debugging a 3-line configuration issue.

This was my longest debugging session in my Cursor AI journey so far. And here's the thing: **you can't predict this**.

You can't estimate "finding the missing SvelteKit alias" because you don't know it's missing. You think it's a Convex issue. Or a Vercel issue. Or an environment variable issue. You systematically eliminate possibilities until you find the real problem.

This is why velocity-based estimation fails for infrastructure work. You're navigating a maze, not laying bricks.

---

### 2. Build Tech is Complex - Good Practices Make It Manageable

**What we were trying to do**: Step 1 of [trunk-based deployment](../dev-docs/3-resources/trunk-based-deployment-implementation-summary.md).

**Why this matters**: Modern DevOps requires:

- Automated deployments (Vercel + GitHub webhooks)
- Environment separation (dev vs. production)
- Secret management (deploy keys, URLs)
- Build orchestration (Convex → types → Vite)
- Path resolution (SvelteKit aliases)

**Each layer adds complexity.** But also capability.

The alternative - manual FTP uploads to a shared host - is "simpler" but can't support:

- Feature flags
- Instant rollbacks
- Multiple deployments per day
- Progressive rollouts
- Real-time collaboration

**Good practices don't make things easy. They make hard things possible.**

---

### 3. Documentation Gaps Are Real

The missing `$convex` alias isn't in:

- ❌ Convex's official deployment docs
- ❌ SvelteKit's adapter-vercel guide
- ❌ Vercel's SvelteKit documentation
- ❌ Any blog post we could find

**Why?** Because most examples don't use the `$convex` alias pattern. They use relative imports:

```typescript
// Most examples use this:
import { api } from '../convex/_generated/api';

// Our codebase uses this:
import { api } from '$convex/_generated/api';
```

The alias pattern is cleaner (no `../../../` counting), but requires explicit configuration.

**Lesson**: The intersection of technologies (SvelteKit + Convex + Vercel) creates edge cases that aren't documented anywhere. You become the documentation.

---

### 4. Building World-Class Tech with Product Model Tools

**Context**: We're a product team, not a platform team.

We don't have dedicated DevOps engineers. We don't have infrastructure specialists. We have product builders who need world-class deployment practices.

**The tools we use:**

- **SvelteKit**: Modern web framework with great DX
- **Convex**: Reactive backend that eliminates API boilerplate
- **Vercel**: Zero-config deployments (mostly 😅)
- **Cursor + AI**: Pair programming with Claude

**The goal**: Ship features fast, deploy confidently, rollback instantly.

This debug session was painful, but it unlocked:

- ✅ Automated deployments (GitHub → Vercel → Live)
- ✅ Production domain connected (`staging.synergyos.ai`)
- ✅ Foundation for feature flags
- ✅ Path to trunk-based development
- ✅ Knowledge captured for next time

**The celebration moment**: Seeing "Build Successful" after 7 failed attempts. Clicking "Visit" and seeing our app on the production domain. That's what we're here for.

---

## What's Next

This was **Step 1** of our trunk-based deployment implementation.

**Completed** ✅:

- Vercel continuous deployment
- Domain connection
- Production environment

**Next steps**:

1. Feature flag infrastructure
2. Error boundaries & monitoring
3. Progressive rollout process
4. Deploy 2-5x per day

See our [full plan](../dev-docs/3-resources/trunk-based-deployment-implementation-summary.md).

---

## For Product Teams Like Us

**If you're building with modern tools but feeling overwhelmed by DevOps:**

You're not alone. This stuff is genuinely complex. But it's also genuinely worth it.

**Some encouragement:**

- ✅ 4 hours of debugging is normal (even expected)
- ✅ Systematic elimination works (even if it's slow)
- ✅ AI pairing helps (Claude caught issues we missed)
- ✅ You don't need a platform team (good tools + persistence)
- ✅ Capture knowledge as you go (future you will thank you)

**The ultimate goal**: Ship world-class products without a 50-person engineering org.

We're learning in public. Follow along at [synergyai-os/Synergy-Open-Source](https://github.com/synergyai-os/Synergy-Open-Source).

---

## Conclusion

**The fix**: 3 lines of code in `svelte.config.js`  
**The journey**: 7 attempts, 4 hours, 1 insight  
**The lesson**: You plan, but you never know  
**The celebration**: `staging.synergyos.ai` is live 🎉

Deploying SvelteKit + Convex to Vercel isn't complicated once you know the pieces. But finding the pieces? That's the journey.

Hopefully, this guide saves you 4 hours. Use them wisely.

---

**Next Steps:**

- [Trunk-Based Deployment Implementation](../dev-docs/3-resources/trunk-based-deployment-implementation-summary.md)
- [Set up feature flags](../dev-docs/2-areas/patterns/feature-flags.md)
- [Configure your development environment](../dev-docs/2-areas/start-me.md)

---

**Tags**: #SvelteKit #Convex #Vercel #Deployment #DevOps #LearningInPublic

---

_Last updated: November 9, 2025_  
_Tested with: SvelteKit 2.x, Convex 1.28.0, Vercel, adapter-vercel 6.0.0_  
_Build time: 4 hours • Attempts: 7+ • The fix: 3 lines of code_
