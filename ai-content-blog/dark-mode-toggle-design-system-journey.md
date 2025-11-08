# Building a Dark Mode Toggle: How a Simple Button Revealed a Design System Bug

**Author**: Randy Hereman (with Claude AI)  
**Date**: January 2025  
**Time**: 15 minutes from request to documented solution

---

## The Request (That Seemed Simple)

I'm building SynergyOS, an open-source Product OS. I was looking at our documentation homepage and thought: "We need a dark mode toggle next to the GitHub icon."

Simple, right?

**My prompt to Claude:**
> "add darkmode next to github. This is one of our reusable components. if it doesnt exist, create it."

That's it. One sentence. No specs, no design mocks, no detailed requirements.

Here's what happened next.

---

## What Claude Did First (The Smart Part)

Instead of jumping straight to code, Claude searched for existing theme components:

```bash
# Searches Claude ran:
**/*theme*.svelte
**/*Theme*.svelte  
**/*toggle*.svelte
```

**Result**: Found a `ToggleSwitch.svelte` but no `ThemeToggle`. 

Claude also checked how other components handle browser state (like `InboxHeader.svelte`) and saw the theme detection script in `app.html`.

**Why this matters**: Claude didn't just build something new. It investigated first, following our `/start` workflow: **Investigate → Scope → Plan → Confirm**.

---

## Building the Component (The Fun Part)

Claude created `ThemeToggle.svelte` with:

✅ **Sun/moon icons** that swap based on current theme  
✅ **localStorage sync** (`axon-theme` key)  
✅ **Reactive state** using Svelte 5 runes (`$state`)  
✅ **Design system tokens** (`bg-hover-solid`, `text-secondary`)  
✅ **Reusable props** (`showLabel={true}` for settings pages)  

**The Code**:
```svelte
<script lang="ts">
  let isDark = $state(false);
  
  onMount(() => {
    if (browser) {
      isDark = document.documentElement.classList.contains('dark');
    }
  });

  function toggleTheme() {
    const newTheme = isDark ? 'light' : 'dark';
    isDark = !isDark;
    
    // Update DOM
    document.documentElement.classList.toggle('dark');
    
    // Persist
    localStorage.setItem('axon-theme', newTheme);
  }
</script>

<button onclick={toggleTheme}>
  {#if isDark}
    <!-- Sun icon -->
  {:else}
    <!-- Moon icon -->
  {/if}
</button>
```

Simple. Clean. Works.

Claude added it to the navbar, tested it in the browser with screenshots, and it worked perfectly.

**Light mode → Dark mode → Light mode.** ✅

I thought we were done.

---

## The Plot Twist (The Learning Part)

I looked at the page and something felt off.

**My feedback:**
> "it looks like header is not using our design system correclty."

I couldn't quite articulate *what* was wrong, just that it didn't match the rest of the app.

Claude investigated the navbar CSS and found this:

```css
.docs-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-bg-base);
  border-bottom: 1px solid var(--color-border-base);
  backdrop-filter: blur(8px);
  background: rgba(var(--color-bg-base-rgb, 255, 255, 255), 0.95); /* ❌ */
}
```

**The bug**: Line 381 was using a CSS variable that **doesn't exist** in our design system: `--color-bg-base-rgb`.

**What this meant**:
- The fallback value `255, 255, 255` (white) always applied
- Dark mode never activated for the navbar
- It looked fine in light mode, so we never caught it
- The second `background:` declaration overrode the first

**In other words**: The navbar was always white, even in dark mode, because of a non-existent CSS variable with a hardcoded fallback.

---

## The Fix (The Simple Part)

Claude compared our navbar to `InboxHeader.svelte` (which follows the design system perfectly) and found the correct pattern:

```css
/* ❌ WRONG - Non-existent variable */
background: rgba(var(--color-bg-base-rgb, 255, 255, 255), 0.95);

/* ✅ CORRECT - Semantic token from design system */
background: var(--color-bg-surface);
```

**Why `bg-surface` and not `bg-base`?**
- `bg-base`: Page background
- `bg-surface`: Elevated surfaces (cards, navbars)
- `bg-elevated`: Modals, popovers (most elevated)

The fix was literally deleting 2 lines and trusting the design system.

**Result**: Navbar now adapts to light/dark mode automatically, matches the rest of the app, and uses the same pattern as every other header.

---

## The Documentation (The Important Part)

Here's where it gets interesting.

**My prompt:**
> "Great! lets save this."

Claude didn't just commit the code. It documented the **pattern** so this never happens again:

**What got saved:**
1. **New pattern in `ui-patterns.md#L828`**: "Navbar/Header Using Non-Existent CSS Variables"
2. **Updated symptom index**: Added to `patterns/INDEX.md` lookup table
3. **Reference implementations**: Linked to `InboxHeader.svelte` as the correct example

**The pattern includes**:
- **Symptom**: Navbar stays white in dark mode
- **Root cause**: Non-existent CSS variable with fallback
- **Fix**: Use semantic tokens from design system
- **Why it breaks**: Fallback value overrides dark mode
- **How to prevent**: Check `src/app.css` for available variables

Now, the next time someone (human or AI) encounters "navbar stays white in dark mode," they run `/root-cause`, load `patterns/INDEX.md`, and instantly find the fix at line #L828.

---

## What I Learned (The Meta Part)

### 1. **Design Systems Are Documentation**
I thought I had a design system because I had tokens defined in `app.css`. But having tokens isn't enough—you need **patterns that show how to use them**.

Claude found the bug by comparing the navbar to `InboxHeader.svelte`. The correct pattern was already there, just not being followed.

### 2. **AI Can Catch Systemic Issues**
I saw "something feels off" but couldn't articulate what. Claude investigated, found the root cause, and traced it back to a systemic pattern violation.

This wasn't just fixing a bug—it was catching a **design debt pattern** that could have spread across the codebase.

### 3. **The Real Work Is Documentation**
Building the toggle took 5 minutes. Fixing the navbar took 2 minutes. Documenting the pattern took 10 minutes.

But that 10 minutes of documentation means:
- Future developers won't make the same mistake
- AI agents can fix it automatically
- Code reviews catch violations instantly
- Onboarding is faster (patterns are explicit)

### 4. **Investigate Before Building**
Claude's first action was to search for existing components, check the design system, and understand the current patterns.

**No guessing. No assumptions. Just investigation.**

This is the workflow we've codified in `/start`:
1. **Investigate** - What exists? What's the current state?
2. **Scope** - What are we actually building?
3. **Plan** - How will we build it?
4. **Confirm** - Get approval before writing code

---

## The Tools We Used

**Context7 MCP**: Up-to-date library documentation (would've used it for Svelte 5 if needed)  
**Browser Tools**: Live testing with screenshots to verify dark mode worked  
**Pattern Index**: Fast lookup for existing solutions (`patterns/INDEX.md`)  
**Design System**: Semantic tokens in `src/app.css` as single source of truth  

---

## Try It Yourself

**The Component**: [`src/lib/components/ThemeToggle.svelte`](https://github.com/synergyai-os/Synergy-Open-Source/blob/main/src/lib/components/ThemeToggle.svelte)

**Usage**:
```svelte
<!-- Icon only (navbar) -->
<ThemeToggle />

<!-- With label (settings) -->
<ThemeToggle showLabel={true} />
```

**The Pattern**: [ui-patterns.md#L828](https://github.com/synergyai-os/Synergy-Open-Source/blob/main/dev-docs/2-areas/patterns/ui-patterns.md#L828)

---

## The Real Outcome

I asked for a dark mode toggle. I got:
1. ✅ A reusable component
2. ✅ A fixed design system bug
3. ✅ A documented pattern for future reference
4. ✅ A validated workflow (investigate → scope → plan → confirm)

**Time**: 15 minutes from request to documented solution.  
**Lines of code**: ~100 (component + docs)  
**Future hours saved**: Countless (pattern prevents recurring bugs)

This is why I build in public. Not to show off the wins, but to document the **messy, iterative, collaborative process** of figuring it out.

---

## What's Next?

We're building SynergyOS—an open-source Product OS for teams who want to accelerate the smart use of AI.

**Follow along**:
- [GitHub](https://github.com/synergyai-os/Synergy-Open-Source)
- [Documentation](https://github.com/synergyai-os/Synergy-Open-Source/tree/main/dev-docs)
- [Pattern Index](https://github.com/synergyai-os/Synergy-Open-Source/blob/main/dev-docs/2-areas/patterns/INDEX.md)

Built in public. Always open source. 80/20 revenue split with builders.

— Randy (with help from Claude)

