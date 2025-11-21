# ADR 002: CMD+1/2/3 for Workspace Switching

**Status**: ✅ Accepted  
**Date**: 2025-11-10  
**Deciders**: Randy Hereman, Claude

---

## Context

Users need fast workspace switching. We considered several keyboard shortcut approaches:

- Sequential key presses (O then W for "Organization → Workspace")
- Single modifier + number (CMD+1/2/3)
- Command palette only (CMD+K → type workspace)

Randy's requirement: **"CMD+1/2/3 by default, like Slack"**

---

## Decision

Use **CMD+1/2/3/4/5** for direct workspace switching.

```
CMD+1 → Personal workspace (always)
CMD+2 → First organization (e.g., SynergyAI)
CMD+3 → Second organization (e.g., Agency Partner)
CMD+4 → Third organization (e.g., Client)
CMD+5 → Fourth organization (e.g., PurposePilot)
...and so on
```

**Plus** CMD+K integration:

- CMD+K → Type "switch" → See all workspaces
- CMD+K → Type workspace name → Quick filter

---

## Alternatives Considered

### Option A: Sequential Keys (O then W)

**Example**: Linear's keyboard shortcuts (G then I for "Go to Inbox")

**Pros:**

- Mnemonic (easier to remember)
- Unlimited combinations

**Cons:**

- ❌ Slower (two key presses)
- ❌ Randy prefers direct shortcuts
- ❌ Not familiar to most users

### Option B: CMD+1/2/3 (CHOSEN) ✅

**Example**: Slack, Linear (CMD+1/2/3 for sections)

**Pros:**

- ✅ Fast (single key press)
- ✅ Muscle memory from other apps
- ✅ Linear-style (we already follow Linear patterns)
- ✅ Randy's preference

**Cons:**

- Limited to ~9 workspaces (CMD+1 through CMD+9)
- But CMD+K handles overflow

### Option C: CMD+K Only

**Example**: Raycast, Spotlight

**Pros:**

- Unlimited workspaces
- Searchable

**Cons:**

- ❌ Slower than direct shortcuts
- ❌ Requires typing
- ❌ Not as fast for frequent switches

### Option D: Hybrid (CHOSEN + CMD+K) ✅

**Best of both worlds:**

- CMD+1/2/3 for top 5 workspaces (fast, direct)
- CMD+K for search (unlimited, flexible)

---

## Implementation Details

### Keyboard Event Handling

```typescript
// src/lib/composables/useKeyboardShortcuts.svelte.ts
export function useGlobalShortcuts() {
	$effect(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			// Skip if in input field
			const target = e.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
				return;
			}

			// CMD+1/2/3/4/5
			if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '9') {
				e.preventDefault();
				const index = parseInt(e.key) - 1;
				switchToWorkspaceByIndex(index);
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
}
```

### Workspace Index Mapping

```typescript
// Workspaces are ordered:
// 0: Personal (always first)
// 1: First org (by creation date or alphabetical)
// 2: Second org
// etc.

function switchToWorkspaceByIndex(index: number) {
	const workspaces = [
		{ type: 'personal', id: null, name: 'Private workspace' },
		...userOrganizations // From Convex query
	];

	const workspace = workspaces[index];
	if (workspace) {
		switchWorkspace(workspace.type, workspace.id);
	}
}
```

### CMD+K Integration

```typescript
// src/lib/components/CommandPalette.svelte
const workspaceActions = $derived(
	workspaces.map((ws, index) => ({
		id: `workspace-${ws.id}`,
		name: ws.name,
		shortcut: index < 9 ? `CMD+${index + 1}` : undefined,
		icon: ws.type === 'personal' ? '📁' : '🏢',
		action: () => switchWorkspace(ws.type, ws.id)
	}))
);
```

---

## User Experience

### Visual Feedback

When pressing CMD+2:

```
┌─────────────────────────────┐
│ 🏢 Switched to SynergyAI    │  ← Toast notification
└─────────────────────────────┘
```

### Shortcut Display

Show shortcuts in workspace switcher:

```
┌─────────────────────────────────────┐
│  ● Private workspace         CMD+1  │
│  ○ SynergyAI                 CMD+2  │
│  ○ Agency Partner                  CMD+3  │
│  ○ Client                      CMD+4  │
│  ○ PurposePilot              CMD+5  │
└─────────────────────────────────────┘
```

### Overflow Handling

If user has >9 workspaces:

- CMD+1 through CMD+9 → First 9 workspaces
- CMD+K → Search to access all workspaces

---

## Platform Considerations

### macOS

- Use `⌘` (Command) key
- Display as `CMD+1` in UI

### Windows/Linux

- Use `Ctrl` key
- Display as `Ctrl+1` in UI
- Detect with `e.ctrlKey` in code

### Implementation

```typescript
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const modKey = isMac ? 'CMD' : 'Ctrl';

// Event handling
if ((e.metaKey || e.ctrlKey) && e.key === '1') {
	// Works on both platforms
}
```

---

## Consequences

### Positive

- Fast workspace switching (single key press)
- Familiar to users (Slack, Linear, Discord)
- Muscle memory transfers from other apps
- Randy's preferred approach ✅

### Negative

- Limited to 9 workspaces for direct shortcuts
  - **Mitigation**: CMD+K for overflow
- Conflicts with browser shortcuts?
  - **Mitigation**: We prevent default, works fine

### Neutral

- Need to show shortcuts in UI (tooltip or in menu)
- Need to handle platform differences (CMD vs Ctrl)

---

## Future Enhancements

1. **Custom Shortcuts**: Let users remap CMD+1/2/3
2. **Recent Workspaces**: CMD+Tab style recent switcher
3. **Quick Switch**: CMD+O to show workspace picker (like CMD+K but focused)

---

## References

- [Slack Keyboard Shortcuts](https://slack.com/help/articles/201374536-Slack-keyboard-shortcuts)
- [Linear Documentation](https://linear.app/docs) (keyboard shortcuts available in Linear app)
- Related: [ADR 001: Workspace Context](./001-workspace-context.md)

---

**Last Updated**: 2025-11-10
