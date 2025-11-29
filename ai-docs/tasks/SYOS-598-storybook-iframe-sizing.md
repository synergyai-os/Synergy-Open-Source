# Storybook Docs Iframe Dynamic Sizing - Failed Attempt

**Linear Ticket**: [SYOS-598](https://linear.app/younghumanclub/issue/SYOS-598)  
**Date**: 2025-01-27  
**Status**: ❌ Failed - Needs different approach  
**Priority**: Medium (affects Storybook Docs UX but not critical functionality)

## Problem Statement

Storybook Docs renders stories in iframes with a default height of `100px`. This makes the preview box too small and "useless" - components are cut off and don't match their actual rendered size. The goal was to:

1. Measure the actual component content height inside the iframe
2. Dynamically resize the wrapper div to match content + 24px bottom padding
3. Ensure the height persists even when Storybook tries to reset it

## What We Tried

### Attempt 1: CSS Overrides Only

- **Approach**: Added CSS in `storybook-overrides.css` and `base.css` to remove mobile padding and set full-size constraints
- **Result**: ❌ Failed - CSS couldn't override Storybook's inline `height: 100px` style
- **Lesson**: Inline styles have higher specificity than CSS rules, even with `!important` when set via JavaScript

### Attempt 2: Decorator-Based Full Height

- **Approach**: Created `FullHeightDecorator.svelte` wrapper with `height: 100vh` to wrap all stories
- **Result**: ❌ Failed - Decorator renders inside iframe, can't affect parent wrapper div outside iframe
- **Lesson**: Decorators wrap story content inside the iframe, but Storybook's wrapper div is in the manager frame (outside the iframe)

### Attempt 3: Manager-Level CSS + iframeHeight Parameter

- **Approach**:
  - Added `docs.story.iframeHeight: '100vh'` parameter
  - Injected CSS into manager frame via `managerHead` to override wrapper height
- **Result**: ⚠️ Partial - Height was set but too large, and didn't match actual content
- **Lesson**: Static height doesn't work - need dynamic measurement based on actual content

### Attempt 4: Dynamic Height Measurement + postMessage

- **Approach**:
  - Measure content height inside iframe (`preview.ts`)
  - Send height via `postMessage` to parent frame
  - Resize wrapper div in manager frame (`main.ts`)
  - Added padding (16px top/bottom, 24px left/right) via decorator
- **Result**: ⚠️ Partial - Measurement worked, but height kept getting reset
- **Lesson**: Storybook's internal code actively maintains wrapper height, overwriting our changes

### Attempt 5: MutationObserver to Prevent Resets

- **Approach**:
  - Added MutationObserver to watch wrapper div for style changes
  - Detect when Storybook resets height to `100px` or `60px`
  - Immediately restore correct height with `!important` CSS
  - Store target heights in WeakMap for restoration
  - Continuous monitoring every 300ms
- **Result**: ❌ Failed - Still not working, Storybook's code runs after ours or uses different mechanism
- **Lesson**: MutationObserver detects changes but restoration happens too late or Storybook uses a different reset mechanism

## Root Causes Identified

### 1. Decorator Not Found in Docs View

- **Issue**: Console logs show `[Storybook] Wrapper not found, using fallback height`
- **Cause**: Decorator `[data-storybook-wrapper="true"]` not found inside iframe
- **Possible Reasons**:
  - Decorators may not render in Docs iframe view (only in Canvas view)
  - Svelte hydration timing - script runs before decorator mounts
  - Storybook's iframe rendering doesn't include decorators in Docs view

### 2. Storybook Actively Resets Height

- **Issue**: Wrapper div keeps reverting to `height: 100px` even after we set it
- **Cause**: Storybook Docs has internal code that maintains wrapper div height
- **Evidence**:
  - HTML shows `<div style="width: 100%; height: 100px;">` persists
  - Our JavaScript sets height, but it gets reset
  - MutationObserver detects resets but restoration doesn't stick

### 3. Race Condition

- **Issue**: Our code runs, sets height, but Storybook's code runs after and resets it
- **Cause**: Storybook's internal height-setting mechanism has higher priority or runs later
- **Evidence**: Height is set correctly initially, but gets reset on next Storybook render cycle

### 4. Cross-Frame Communication Timing

- **Issue**: postMessage from iframe may not reach manager frame in time
- **Cause**: Iframe loads, measures, sends message, but manager frame may not be ready
- **Evidence**: Fallback measurement works but postMessage path may have timing issues

## Technical Details

### Files Modified

1. **`.storybook/preview.ts`**
   - Added measurement script that runs inside iframe
   - Measures content height and sends via postMessage
   - Retries up to 30 times with 200ms intervals
   - Uses multiple selectors to find content (decorator, #storybook-root, body)

2. **`.storybook/main.ts`**
   - Added `managerHead` with CSS and JavaScript
   - Listens for postMessage events from iframes
   - Resizes wrapper divs dynamically
   - MutationObserver watches for Storybook resets
   - Continuous fallback measurement every 300ms

3. **`.storybook/FullHeightDecorator.svelte`**
   - Wrapper component with `data-storybook-wrapper="true"` attribute
   - Adds padding (16px top/bottom, 24px left/right)
   - Uses `min-height: fit-content` to allow dynamic sizing

4. **`.storybook/storybook-overrides.css`**
   - Removes mobile safe-area-inset padding in Storybook iframe

### Configuration

- `docs.story.inline: false` - Stories render in iframes (required for SvelteKit compatibility)
- `layout: 'fullscreen'` - Fullscreen layout for components
- `docs.story.iframeHeight` - Removed (was static, not dynamic)

## What We Learned

### 1. Storybook Docs Architecture

- **Manager Frame**: Contains sidebar, toolbar, and wrapper divs for iframes
- **Preview Frame (iframe)**: Contains actual story content and decorators
- **Wrapper Div**: Created by Storybook in manager frame, wraps the iframe
- **Height Control**: Storybook maintains wrapper height via internal JavaScript

### 2. Decorators in Docs View

- Decorators wrap story content **inside** the iframe
- They cannot affect elements **outside** the iframe (like wrapper divs)
- Decorators may not render in Docs view, or render differently than Canvas view

### 3. Storybook's Height Management

- Storybook Docs sets wrapper div height dynamically via JavaScript
- Default height is `100px` (or `60px` in some frameworks)
- Storybook actively maintains this height, resetting it when changed
- Our MutationObserver detects resets but restoration doesn't prevent next reset

### 4. Svelte Hydration Timing

- Svelte components need time to hydrate
- Measurement scripts may run before decorators mount
- Need longer delays (500ms+) for Svelte hydration in iframes

### 5. MutationObserver Limitations

- MutationObserver detects attribute changes
- But can't prevent Storybook from setting new values
- Restoration happens after reset, creating a loop
- Storybook may use `requestAnimationFrame` or other async mechanisms

### 6. CSS `!important` Limitations

- `!important` in inline styles doesn't override JavaScript-set styles
- Storybook sets height via `element.style.height = '100px'`
- Our `!important` in style attribute gets overwritten by direct style property

## Why It Failed

### Primary Reason: Storybook's Internal Height Management

Storybook Docs has internal JavaScript that actively maintains the wrapper div height. This code:

- Runs after our code executes
- Uses direct style property assignment (`element.style.height = '100px'`)
- May use `requestAnimationFrame` or other async mechanisms
- Overrides our `!important` CSS and style attribute changes

### Secondary Reason: Decorator Not Found

The decorator (`[data-storybook-wrapper="true"]`) is not found inside the iframe, causing:

- Fallback to body measurement (less accurate)
- Potential timing issues with Svelte hydration
- May indicate decorators don't render in Docs iframe view

## Potential Solutions (Not Attempted)

### Option 1: Use Storybook's `docs.story.iframeHeight` Parameter

- **Approach**: Set static height per story or globally
- **Pros**: Uses Storybook's official API
- **Cons**: Not dynamic, doesn't match actual content height
- **Status**: Not attempted (user wants dynamic sizing)

### Option 2: Storybook Addon/Plugin

- **Approach**: Create custom Storybook addon that hooks into Storybook's rendering pipeline
- **Pros**: Can intercept Storybook's height-setting code
- **Cons**: Complex, requires addon development
- **Status**: Not attempted

### Option 3: Override Storybook's Internal Code

- **Approach**: Monkey-patch Storybook's height-setting functions
- **Pros**: Direct control over height management
- **Cons**: Fragile, breaks on Storybook updates
- **Status**: Not attempted

### Option 4: Use `docs.story.inline: true`

- **Approach**: Render stories inline instead of iframes
- **Pros**: No iframe height issues
- **Cons**: May break SvelteKit compatibility (user mentioned this was set to `false` for compatibility)
- **Status**: Not attempted (may break existing setup)

### Option 5: Custom Docs Container

- **Approach**: Use `docs.container` parameter to wrap docs page with custom component
- **Pros**: Can control rendering at container level
- **Cons**: May not affect individual story iframe heights
- **Status**: Not attempted

### Option 6: RequestAnimationFrame Loop

- **Approach**: Continuously check and restore height in `requestAnimationFrame` loop
- **Pros**: Runs every frame, catches resets immediately
- **Cons**: Performance impact, still may not prevent resets
- **Status**: Not attempted (similar to MutationObserver approach)

## Code Artifacts

### Current Implementation (Failed)

- **Location**: `.storybook/main.ts` (lines 30-200)
- **Location**: `.storybook/preview.ts` (lines 11-133)
- **Location**: `.storybook/FullHeightDecorator.svelte`
- **Status**: Code is in place but not working

### Key Functions

1. `resizeIframeWrapper()` - Sets wrapper height with MutationObserver
2. `measureAndReportHeight()` - Measures content inside iframe
3. `resizeIframesFallback()` - Direct measurement fallback
4. `setupManagerObserver()` - Watches for new iframes

## Console Logs Observed

```
[Storybook] Wrapper not found, using fallback height: 2911 px
[Storybook] Measured height from body: 2911 px
[Storybook] Total height (with 24px bottom): 2935 px
[Storybook Manager] Resized iframe wrapper to: 2935 px
[Storybook Manager] Set up MutationObserver for wrapper, target height: 2935 px
```

But wrapper div still shows `height: 100px` in HTML.

## Next Steps (When Picking Up Later)

1. **Investigate Storybook Source Code**
   - Find where Storybook sets wrapper div height
   - Identify the exact function/method that maintains height
   - Check if there's a hook or event we can use

2. **Test Decorator Rendering**
   - Verify if decorators actually render in Docs iframe view
   - Check if decorator appears in DOM after Svelte hydration
   - Add more aggressive retry logic if timing issue

3. **Try Storybook Addon Approach**
   - Research Storybook addon API for intercepting rendering
   - Check if there's an official way to customize iframe heights
   - Look for existing addons that solve this problem

4. **Consider Alternative Approaches**
   - Evaluate `docs.story.inline: true` with SvelteKit compatibility fixes
   - Test if custom Docs container can control iframe heights
   - Research if newer Storybook versions have better APIs

5. **Debug Storybook's Reset Mechanism**
   - Add breakpoints in browser DevTools
   - Trace when and how Storybook resets height
   - Identify if it's synchronous or async (setTimeout/requestAnimationFrame)

## References

- Storybook Docs API: `docs.story.iframeHeight` parameter
- Storybook Decorators: Work in Canvas view, behavior in Docs view unclear
- Storybook Docs Architecture: Manager frame vs Preview frame (iframe)
- Svelte Hydration: Takes time, especially in iframes

## Related Issues

- Storybook version: 10.0.8
- Framework: SvelteKit with Svelte 5
- Configuration: `docs.story.inline: false` (required for SvelteKit)

## Conclusion

The dynamic iframe sizing feature failed because Storybook's internal code actively maintains wrapper div heights and overrides our changes. Our MutationObserver approach detects resets but can't prevent them from happening. A different approach is needed - either:

1. Finding and intercepting Storybook's height-setting mechanism at a lower level
2. Using Storybook's official APIs if they exist
3. Creating a custom Storybook addon
4. Accepting static heights or finding workarounds

The code is preserved in the codebase but commented/disabled. When picking this up later, start by investigating Storybook's source code to understand how it manages iframe heights.
