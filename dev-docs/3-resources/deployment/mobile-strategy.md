# Mobile Strategy: iOS Native vs Mobile Web

## Overview

Axon supports three distinct platforms with different UI/UX patterns:

1. **iOS Native App** (`platform === 'ios'`) - Full native app experience
2. **Mobile Web** (`platform === 'mobile-web'`) - Optimized web experience for mobile browsers
3. **Desktop Web** (`platform === 'desktop-web'`) - Full desktop web experience

## Platform Detection

Use the platform utilities from `$lib/utils/platform.ts`:

```svelte
<script>
	import { getPlatform, isIOS, isNativeApp } from '$lib/utils/platform';

	const platform = getPlatform();
	// Returns: 'ios' | 'mobile-web' | 'desktop-web'

	// Helper checks
	const isNative = isNativeApp(); // true if iOS or Android native
	const isIOSNative = isIOS(); // true if iOS native app only
</script>

{#if platform === 'ios'}
	<!-- iOS native app UI -->
{:else if platform === 'mobile-web'}
	<!-- Mobile web browser UI -->
{:else}
	<!-- Desktop web UI -->
{/if}
```

## UI/UX Strategy

### iOS Native App (`ios`)

**Goal**: Native iOS app experience using iOS design patterns

**Characteristics**:

- ✅ Use iOS Human Interface Guidelines
- ✅ Native navigation patterns (Tab Bar, Navigation Stack)
- ✅ iOS-specific gestures and interactions
- ✅ Focus on consumption/learning: Read, study, collect info
- ❌ Minimize management/organization features
- ❌ Avoid web-specific patterns (hover, complex multi-panel layouts)

**Recommended UI Patterns**:

- Bottom Tab Bar for main navigation (Inbox, Flashcards, Study, Settings)
- Native iOS navigation stack with back buttons
- Card-based content views
- Native iOS modals and sheets
- Haptic feedback
- Native iOS sharing

**Use Cases**:

- Quick review of inbox items
- Flashcard study sessions
- Reading highlights and notes
- Collecting new information (photo notes, manual entries)
- Light organization (tagging, basic categorization)

### Mobile Web (`mobile-web`)

**Goal**: Optimized web experience, full feature parity with desktop

**Characteristics**:

- ✅ Responsive design adapting desktop features for mobile
- ✅ Touch-optimized but web-native patterns
- ✅ Full feature set (management, organization, etc.)
- ✅ Collapsible/expandable sidebars
- ✅ Mobile-optimized multi-panel layouts

**Recommended UI Patterns**:

- Hamburger menu for sidebar
- Bottom sheet modals
- Swipe gestures for actions
- Responsive breakpoints
- Touch-friendly targets (min 44x44px)

**Use Cases**:

- Full inbox management
- Complex filtering and organization
- Category management
- Settings configuration
- All desktop features, mobile-optimized

### Desktop Web (`desktop-web`)

**Goal**: Full-featured web application

**Characteristics**:

- ✅ Multi-column layouts
- ✅ Resizable panels
- ✅ Keyboard shortcuts
- ✅ Hover states
- ✅ Full management/organization features

**Current State**: ✅ Fully implemented

## Implementation Strategy

### Phase 1: Mobile Web Optimization (Current Priority)

**Goal**: Make the current web app work well on mobile browsers

**Tasks**:

1. ✅ Fix sidebar hover behavior (DONE)
2. ⏳ Make mobile menu functional (sidebar toggle)
3. ⏳ Implement mobile inbox list/detail view switching
4. ⏳ Add mobile-optimized layouts for inbox
5. ⏳ Touch-friendly interactions
6. ⏳ Mobile breakpoint testing

**Approach**: Optimize existing components for mobile while keeping desktop features

### Phase 2: iOS Native App UI (Future)

**Goal**: Create iOS-specific UI patterns for native app experience

**Tasks**:

1. Create iOS-specific layout components
2. Implement iOS Tab Bar navigation
3. Build iOS-native card views
4. Add iOS-specific gestures
5. Implement native iOS sharing
6. iOS-specific onboarding

**Approach**: Build new iOS-specific components alongside web components, conditionally render based on platform

## Component Structure

### Platform-Conditional Rendering

```svelte
<script>
	import { getPlatform } from '$lib/utils/platform';

	const platform = getPlatform();
</script>

{#if platform === 'ios'}
	<iOSInboxView />
{:else}
	<!-- Web version (mobile + desktop) -->
	<WebInboxView />
{/if}
```

### Shared Components

Some components work across all platforms:

- API calls (Convex)
- Data models
- Business logic
- Design tokens (with platform-specific overrides)

### Platform-Specific Components

Create platform-specific versions when patterns diverge:

```
src/lib/components/
├── inbox/
│   ├── InboxView.svelte (web - desktop + mobile)
│   └── iOSInboxView.svelte (iOS native)
├── navigation/
│   ├── WebSidebar.svelte (web)
│   └── iOSTabBar.svelte (iOS)
```

## Decision Framework

**When to create iOS-specific UI?**

- Pattern doesn't make sense on iOS (e.g., hover-based sidebar)
- iOS has a better native pattern (Tab Bar vs Sidebar)
- Use case differs significantly (read-only vs management)
- Native iOS features needed (haptics, sharing, widgets)

**When to optimize for mobile web?**

- Feature parity needed across all web platforms
- Desktop feature works but needs mobile optimization
- Responsive design can handle it

## Current State

- ✅ Platform detection utilities created
- ✅ Desktop web fully functional
- ✅ Basic mobile detection (viewport-based)
- ⏳ Mobile web optimization needed
- ⏳ iOS native UI not started

## Next Steps

1. **Immediate**: Fix mobile web sidebar/menu
2. **Short-term**: Complete mobile web optimization
3. **Long-term**: Design and implement iOS native UI patterns
