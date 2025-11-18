# UI/UX Patterns

> **Design Token Mandate**: ALL spacing/colors must use semantic tokens. Never hardcode values.

---

## #L10: Interactive Components in DropdownMenu [🟡 IMPORTANT]

**Symptom**: Switch/toggle in dropdown menu not working  
**Root Cause**: `DropdownMenu.Item` intercepts all click events  
**Fix**:

```svelte
<!-- ❌ WRONG: DropdownMenu.Item intercepts clicks -->
<DropdownMenu.Item
	onSelect={(e) => {
		e.preventDefault();
		toggleTheme();
	}}
>
	<Switch.Root checked={$isDark} />
</DropdownMenu.Item>

<!-- ✅ CORRECT: Plain div wrapper (bits-ui pattern) -->
<div class="px-menu-item py-menu-item">
	<div class="flex items-center justify-between gap-icon-wide">
		<span class="text-sm font-medium text-primary">
			{$isDark ? 'Dark mode' : 'Light mode'}
		</span>
		<Switch.Root
			checked={$isDark}
			onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
			class="h-4 w-8 {$isDark ? 'bg-gray-900' : 'bg-gray-300'}"
		>
			<Switch.Thumb class="h-3 w-3 data-[state=checked]:translate-x-4" />
		</Switch.Root>
	</div>
</div>
```

**Why**: Plain div doesn't capture events, allowing children to be interactive.  
**Apply when**: Need interactive components inside bits-ui dropdown menus  
**Related**: #L60 (Spacing patterns)

---

## #L60: Generous Padding and Visual Hierarchy [🟢 REFERENCE]

**Symptom**: Cards feel cramped, no breathing room  
**Root Cause**: Insufficient padding and weak visual hierarchy  
**Fix**:

```svelte
<!-- ❌ WRONG: Cramped design -->
<button class="p-inbox-card">
	<!-- 12px padding -->
	<div class="mb-3">
		<!-- 12px margin -->
		<svg class="h-4 w-4 text-secondary">...</svg>
		<!-- Small icon -->
		<h3 class="text-sm font-semibold">{name}</h3>
		<!-- Small text -->
	</div>
	<div class="text-sm text-secondary">{count} cards</div>
</button>

<!-- ✅ CORRECT: Generous spacing (design token mandate) -->
<button class="p-inbox-container">
	<!-- 16px padding ✅ -->
	<div class="mb-4">
		<!-- 16px margin ✅ -->
		<svg class="h-5 w-5 text-accent-primary">...</svg>
		<!-- Larger icon ✅ -->
		<h3 class="text-lg font-semibold text-primary">{name}</h3>
		<!-- Clear hierarchy ✅ -->
	</div>
	<div class="text-sm text-secondary">{count} cards</div>
</button>
```

**Design Token Rules**:

- **Padding**: `p-inbox-container` (16px), not `p-inbox-card` (12px)
- **Margins**: `mb-4` (16px) for major elements, `mb-3` (12px) for minor
- **Icons**: `w-5 h-5` for prominence, `text-accent-primary` for emphasis
- **Typography**: `text-lg` for titles, `text-sm` for metadata

**Apply when**: Designing card/collection components  
**Related**: #L120 (Header alignment), #L170 (Edit modes)

---

## #L120: Fixed Height Header Alignment [🟢 REFERENCE]

**Symptom**: Page headers don't align with sidebar borders  
**Root Cause**: No fixed height constraint, only padding  
**Fix**:

```svelte
<!-- ❌ WRONG: No fixed height -->
<div class="border-b py-system-header">
	<!-- Height varies -->
	<h2>Page Title</h2>
</div>

<!-- ✅ CORRECT: Fixed height + padding (design token mandate) -->
<div
	class="flex h-system-header flex-shrink-0 items-center justify-between border-b border-base py-system-header"
>
	<h2 class="text-sm font-normal text-secondary">Page Title</h2>
</div>
```

**Design Token Rules**:

- **Height**: `h-system-header` (64px fixed)
- **Padding**: `py-system-header` (12px)
- **Layout**: `flex items-center` centers content vertically
- **Borders**: `border-base` for semantic color

**Apply when**: Creating page headers that should align with sidebar  
**Related**: #L60 (Spacing patterns)

---

## #L170: Separate Edit and View Modes [🟢 REFERENCE]

**Symptom**: Users accidentally edit during focused tasks  
**Root Cause**: Component always editable, no mode separation  
**Fix**:

```svelte
<!-- ✅ CORRECT: User-controlled edit mode -->
<script>
	let editMode = $state(false);
</script>

<!-- ❌ WRONG: Always editable -->
<FlashcardComponent editable={true} />

<FlashcardComponent editable={editMode} />
<Button onclick={() => (editMode = !editMode)}>
	{editMode ? 'Done Editing' : 'Edit'}
</Button>
```

**Visual Indicators** (for edit mode):

```svelte
<!-- Footer: Text + background change -->
<div class="transition-colors {isEditing ? 'bg-accent-primary/20' : 'bg-base/10'}">
	{#if isEditing}
		<span class="font-medium text-accent-primary">• Editing...</span>
	{:else}
		<span class="text-secondary">• Click to edit</span>
	{/if}
</div>

<!-- Textarea: Focus ring -->
<textarea class="focus:ring-2 focus:ring-accent-primary/50" />
```

**Apply when**: Editing should be optional during focused workflows  
**When not to use**: Editing is primary action (e.g., flashcard review during creation)  
**Related**: #L220 (Queue-based removal), #L880 (Keyboard-driven edit mode)

---

## #L220: Queue-Based Card Removal (Tinder-like) [🟢 REFERENCE]

**Symptom**: Cards remain visible after rating action  
**Root Cause**: Index-based navigation keeps cards in list  
**Fix**:

```typescript
// ❌ WRONG: Index-based navigation (also uses non-reactive Set)
let currentIndex = $state(0);
let approvedIndices = $state<Set<number>>(new Set()); // ❌ Use SvelteSet for reactivity

function handleApprove() {
	approvedIndices.add(currentIndex); // ❌ Card still in list
	currentIndex++;
}

// ✅ CORRECT: Queue-based removal
let reviewQueue = $state<Card[]>([...cards]);
let approvedCards = $state<Card[]>([]);
let isAnimating = $state(false);

function handleApprove() {
	if (isAnimating || reviewQueue.length === 0) return;

	const card = reviewQueue[0];
	approvedCards.push(card);
	isAnimating = true;

	setTimeout(() => {
		reviewQueue = reviewQueue.slice(1); // ✅ Remove from queue
		isAnimating = false;
	}, 400);
}

const currentCard = $derived(reviewQueue[0]); // Always first card
```

**Apply when**: Implementing swipe/review card interfaces  
**Related**: #L280 (Visual feedback)

---

## #L280: Visual Feedback Before Action [🟢 REFERENCE]

**Symptom**: No confirmation that action was registered  
**Root Cause**: Action processes instantly without feedback  
**Fix**:

```typescript
// ❌ WRONG: Instant action, no feedback
function handleApprove() {
	approvedCards.push(card);
	reviewQueue = reviewQueue.slice(1);
}

// ✅ CORRECT: Show feedback first
let showFeedback = $state<'approved' | 'rejected' | null>(null);

function handleApprove() {
	showFeedback = 'approved'; // ✅ Immediate visual feedback
	setTimeout(() => {
		approvedCards.push(card);
		reviewQueue = reviewQueue.slice(1);
		showFeedback = null;
	}, 400);
}
```

**Visual Overlay**:

```svelte
{#if showFeedback}
	<div
		class="absolute inset-0 z-10 flex items-center justify-center rounded-lg
    {showFeedback === 'approved' ? 'bg-green-500/20' : 'bg-red-500/20'}"
	>
		<svg class="h-20 w-20 {showFeedback === 'approved' ? 'text-green-500' : 'text-red-500'}">
			{#if showFeedback === 'approved'}
				<path d="M5 13l4 4L19 7" /> <!-- Checkmark -->
			{:else}
				<path d="M6 18L18 6M6 6l12 12" /> <!-- X -->
			{/if}
		</svg>
	</div>
{/if}
```

**Apply when**: User actions need visual confirmation  
**Related**: #L220 (Queue removal)

---

## #L330: Textarea Auto-Resize Pattern [🟢 REFERENCE]

**Symptom**: Textarea appears as small scrollable frame  
**Root Cause**: Height constraint prevents expansion  
**Fix**:

```svelte
<!-- ❌ WRONG: Height constraint -->
<div class="h-full w-full">
	<textarea class="h-full w-full" />
	<!-- ❌ Constrained -->
</div>

<!-- ✅ CORRECT: Remove h-full, use field-sizing-content -->
<div class="flex w-full min-w-0 items-center justify-center">
	<textarea class="field-sizing-content" style="overflow: hidden;" />
</div>
```

**Why**: Removing `h-full` allows natural expansion, `field-sizing-content` auto-resizes to content.  
**Apply when**: Textarea should match static text appearance  
**Related**: #L170 (Edit modes)

---

## #L380: Centered Card Layout with Fixed Size [🟢 REFERENCE]

**Symptom**: Cards not centered or breaking with long content  
**Root Cause**: No fixed default size with responsive constraints  
**Fix**:

```svelte
<!-- ❌ WRONG: No centering or fixed size -->
<div class="flex-1 p-inbox-container">
	<FlashcardComponent />
</div>

<!-- ✅ CORRECT: Fixed size, centered, responsive -->
<div class="flex flex-1 items-center justify-center overflow-auto p-inbox-container">
	<div
		style="width: 500px; height: 700px; max-width: calc(100% - 2rem); max-height: calc(100% - 2rem);"
	>
		<FlashcardComponent />
	</div>
</div>
```

**Why**: Fixed dimensions provide default size, max constraints handle responsiveness, flexbox centers.  
**Apply when**: Centering card/modal components  
**Related**: #L60 (Spacing), #L120 (Layout patterns)

---

## #L430: Keyboard Event Priority in Nested Components [🟡 IMPORTANT]

**Symptom**: Conflicting hotkeys (e.g., arrow keys flip card AND navigate dropdown)  
**Root Cause**: Multiple keyboard listeners compete, no priority handling  
**Fix**:

```typescript
// ❌ WRONG: No priority checks
$effect(() => {
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowUp') {
			flipCard(); // ❌ Always fires, even when dropdown is open
		}
	}
	window.addEventListener('keydown', handleKeyDown);
	return () => window.removeEventListener('keydown', handleKeyDown);
});

// ✅ CORRECT: Check for active dropdowns/inputs first
$effect(() => {
	function handleKeyDown(e: KeyboardEvent) {
		// Priority 1: Check if typing in input/textarea
		const activeElement = document.activeElement;
		const isInputFocused =
			activeElement?.tagName === 'INPUT' ||
			activeElement?.tagName === 'TEXTAREA' ||
			(activeElement instanceof HTMLElement && activeElement.isContentEditable);

		// Priority 2: Check if dropdown/combobox is open
		const isDropdownOpen =
			document.querySelector('[data-bits-combobox-content]') !== null ||
			document.querySelector('[role="listbox"]') !== null;

		// Skip card hotkeys if input or dropdown is active (except ESC)
		if ((isInputFocused || isDropdownOpen) && e.key !== 'Escape') return;

		// Priority 3: Card navigation (only when nothing else is active)
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			flipCard(); // ✅ Only fires when safe
		}
	}

	window.addEventListener('keydown', handleKeyDown);
	return () => window.removeEventListener('keydown', handleKeyDown);
});
```

**Priority Hierarchy**:

1. 🥇 **Dropdowns/Modals** - Check for `[data-bits-combobox-content]` or `[role="listbox"]`
2. 🥈 **Input Fields** - Check `activeElement.tagName` for INPUT/TEXTAREA
3. 🥉 **Component Hotkeys** - Only process when nothing else is active
4. ⚠️ **ESC Exception** - Always allow ESC to close dropdowns/dialogs

**Complementary Pattern** - Component-level hotkey (e.g., 'T' to open tags):

```typescript
// Parent component implements specific hotkeys
let tagComboboxOpen = $state(false);

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 't' || event.key === 'T') {
    event.preventDefault();
    tagComboboxOpen = true; // Opens dropdown
  }
}

$effect(() => {
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
});

// Bind state to component
<TagSelector bind:comboboxOpen={tagComboboxOpen} />
```

**Why**: Prevents hotkey conflicts by establishing clear priority order.  
**Apply when**: Multiple components have keyboard shortcuts in same context  
**Related**: #L10 (Interactive dropdowns), #L170 (Edit modes)

---

## #L480: Command Palette "Big Event" Design [🟢 REFERENCE]

**Symptom**: Modal feels flat, doesn't grab attention for frequent-use features  
**Root Cause**: Standard overlay/modal without dramatic visual treatment  
**Fix**:

```svelte
<!-- ❌ WRONG: Standard overlay -->
<Dialog.Overlay class="bg-overlay fixed inset-0 z-50" />
<Dialog.Content class="shadow-modal fixed ...">
	<!-- content -->
</Dialog.Content>

<!-- ✅ CORRECT: Premium "spotlight" effect -->
<Dialog.Overlay
	class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed 
    inset-0 z-50 
    bg-black/65 backdrop-blur-sm"
/>
<Dialog.Content
	class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%] fixed 
    top-1/2 left-1/2 z-50 
    max-w-[600px] -translate-x-1/2 
    -translate-y-1/2 shadow-2xl"
>
	<!-- content -->
</Dialog.Content>
```

**Key Elements**:

1. **Dark overlay** (65% black) - Creates spotlight effect
2. **Backdrop blur** (`backdrop-blur-sm`) - Premium feel (Raycast, macOS Spotlight)
3. **Scale animation** (`zoom-in-95`) - Modal "pops" into view
4. **Dramatic shadow** (`shadow-2xl`) - Adds depth
5. **Coordinated animations** - Fade + zoom + slide for polish

**Technical**:

- Hardware accelerated (transform, opacity)
- ~200ms total animation time
- Smooth 60fps transitions
- No layout shift (fixed positioning)

**Apply when**: Feature will be used frequently (command palettes, quick actions)  
**Inspiration**: Raycast, Linear, Superhuman, 1Password Quick Access  
**Related**: #L10 (Dropdowns), #L330 (Centered layout)

---

## #L530: Command Palette Input Design [🟢 REFERENCE]

**Symptom**: Search input feels generic, doesn't match premium command palette UX  
**Root Cause**: Missing visual patterns from leading command palettes  
**Fix**:

```svelte
<!-- ❌ WRONG: Generic input -->
<input
	class="w-full border border-gray-300 px-4 py-2"
	placeholder="Search for something to create..."
/>

<!-- ✅ CORRECT: Premium command palette input -->
<div class="border-base/50 flex items-center border-b px-4 py-3">
	<!-- Icon on left (search/logo) -->
	<svg class="mr-3 h-5 w-5 flex-shrink-0 text-tertiary">
		<!-- search icon -->
	</svg>

	<!-- Minimal, transparent input -->
	<Command.Input
		class="flex-1 border-0 bg-transparent 
      p-0 text-base transition-colors placeholder:text-tertiary focus:ring-0 focus:outline-hidden"
		placeholder="Type a command or search..."
	/>
</div>

<!-- Items with keyboard shortcuts on right -->
<Command.Item class="flex items-center justify-between px-3 py-2.5">
	<div class="flex items-center gap-icon">
		<span class="text-xl">📝</span>
		<span>Note</span>
	</div>
	<span class="bg-base/50 rounded px-2 py-1 font-mono text-xs text-tertiary">N</span>
</Command.Item>
```

**Key Patterns** (from 1Password, Raycast, Todoist, Slack):

1. ✅ **Icon on left** (search or app logo)
2. ✅ **Transparent background** with minimal border
3. ✅ **Short placeholder** (not verbose)
4. ✅ **Keyboard shortcuts on right** (visible, subtle badges)
5. ✅ **Larger text** (text-base, not text-sm)
6. ✅ **Immediate action list** (no search delay)

**Apply when**: Building command palettes or quick action interfaces  
**Related**: #L480 (Big event design)

---

## #L580: Command vs Quick Action Keyboard Workflow [🟢 REFERENCE]

**Symptom**: Unclear distinction between different keyboard shortcuts  
**Root Cause**: Multiple keys doing similar actions, no clear mental model  
**Fix**:

```typescript
// ❌ WRONG: Both keys do the same thing
shortcuts.register({
	key: 'n',
	handler: () => openCreateModal() // Same modal
});
shortcuts.register({
	key: 'c',
	handler: () => openCreateModal() // Same modal
});

// ✅ CORRECT: Clear separation of intent
shortcuts.register({
	key: 'n',
	handler: () => quickCreateNote(), // Direct action (fast)
	description: 'New note (quick)'
});
shortcuts.register({
	key: 'c',
	handler: () => openCommandCenter(), // Full palette (options)
	description: 'Command Center'
});
```

**Mental Model**:

- **N** = **N**ew (direct, specific, fast) - Creates default item type immediately
- **C** = **C**ommand (choose, search, explore) - Opens full palette with all options

**Benefits**:

- Muscle memory: N for speed, C for choice
- Clear naming: "Command Center" not "New Item"
- Scalable: Add more quick actions (F, H, etc.)
- Discoverable: Command Center teaches all shortcuts

**Apply when**: Designing keyboard-first workflows with multiple creation paths  
**Inspiration**: VSCode (Cmd+P vs Cmd+Shift+P), Notion (/ vs Cmd+K)  
**Related**: #L430 (Keyboard priority), #L530 (Command palette input)

---

## #L620: Control Panel Component System [🟢 REFERENCE]

**Use Case**: Toolbars, popovers, and control panels for documents/features

**Pattern**: Composable control panel using base components + slots

**Base Components**:

- `ControlPanel.Root` - Container (toolbar/popover/embedded)
- `ControlPanel.Group` - Groups related controls
- `ControlPanel.Button` - Icon button with active state
- `ControlPanel.Divider` - Visual separator between groups

**Design Token Usage**:

```svelte
<!-- Toolbar -->
<ControlPanel.Root variant="toolbar">
	<ControlPanel.Group>
		<ControlPanel.Button active={isBold} onclick={toggleBold}>
			<BoldIcon />
		</ControlPanel.Button>
	</ControlPanel.Group>
</ControlPanel.Root>

<!-- Popover (contextual) -->
<ControlPanel.Root variant="popover" bind:open={popoverOpen}>
	{#snippet trigger()}
		<button>Settings</button>
	{/snippet}

	<ControlPanel.Group label="Options">
		<ControlPanel.Button active={isActive} onclick={toggle}>
			<Icon />
		</ControlPanel.Button>
	</ControlPanel.Group>
</ControlPanel.Root>

<!-- Embedded (inline) -->
<ControlPanel.Root variant="embedded">
	<ControlPanel.Button onclick={handleAction}>
		<Icon /> Action
	</ControlPanel.Button>
</ControlPanel.Root>
```

**Three Variants**:

1. **toolbar** - Fixed header with border-bottom (notes editor)
2. **popover** - Contextual floating panel (Bits UI Popover)
3. **embedded** - Inline controls (sidebar actions)

**Product Team Ownership**:

- Teams own **control panel content** (buttons, groups, logic)
- Design system owns **base components** (Root, Button, etc.)
- All panels use same design tokens (consistency)

**Apply when**: Building feature controls (editor toolbar, media controls, settings panels)  
**Inspiration**: Notion blocks, Linear toolbar, Figma properties panel  
**Related**: #L10 (Interactive dropdowns), #L60 (Spacing), #L120 (Header alignment)

---

## #L680: Atomic Design Pattern - Reusable Components [🟢 REFERENCE]

**Symptom**: Hardcoded UI elements (shortcuts, inputs) duplicated across components  
**Root Cause**: No atomic component library for common UI elements  
**Fix**:

```svelte
// ❌ WRONG - Hardcoded keyboard shortcut
<span class="bg-base/50 rounded px-2 py-1 text-xs text-tertiary">(C)</span>

// ✅ CORRECT - Atomic component
<KeyboardShortcut keys="C" />
<KeyboardShortcut keys={['Cmd', 'K']} />

// ❌ WRONG - Hardcoded form input
<input class="rounded-input border border-base bg-input px-input-x py-input-y" />

// ✅ CORRECT - Atomic component
<FormInput label="Title" placeholder="Enter title..." bind:value={title} />
<FormTextarea label="Content" rows={4} bind:value={content} />
```

**Apply when**:

- Creating any UI element that appears in multiple places
- Building forms, modals, or repeating UI patterns
- Need to update styling/behavior across entire app

**Benefits**:

- Change shortcut 'C' → 'A' in one place, updates everywhere
- Consistent form styling via design tokens
- Self-documenting (semantic component names)

**Available Atomic Components**:

- `<KeyboardShortcut keys="C" />` - Keyboard shortcut badges
- `<FormInput>` - Text inputs with labels
- `<FormTextarea>` - Textareas with labels

**Related**: #L730 (ProseMirror Integration), design-tokens.md (Atomic Component Patterns)

---

## #L730: ProseMirror Rich Text Integration [🟢 REFERENCE]

**Symptom**: Need rich text editing with Notion-like feel and AI detection  
**Root Cause**: `<textarea>` doesn't support formatting, embeds, or change tracking  
**Fix**:

```svelte
// ❌ WRONG - Plain textarea for notes
<textarea bind:value={content} />

// ✅ CORRECT - ProseMirror with AI detection
<NoteEditorWithDetection
  content={noteContent}
  onContentChange={(content: string, markdown: string) => {
    noteContent = content;
    noteContentMarkdown = markdown;
  }}
  onAIFlagged={() => {
    noteIsAIGenerated = true;
  }}
  placeholder="Start writing..."
  showToolbar={true}
/>
```

**Apply when**:

- User needs to create/edit rich text notes
- AI-generated content detection required
- Export to markdown needed (e.g., blog posts)

**State Management**:

```typescript
// Store both ProseMirror JSON and markdown
let noteContent = $state(''); // ProseMirror JSON string
let noteContentMarkdown = $state(''); // Markdown version
let noteIsAIGenerated = $state(false);
```

**API Integration**:

```typescript
await convexClient.mutation(api.notes.createNote, {
	title: noteTitle || undefined,
	content: noteContent, // ProseMirror JSON
	contentMarkdown: noteContentMarkdown || undefined,
	isAIGenerated: noteIsAIGenerated || undefined
});
```

**Common Gotchas**:

- ProseMirror uses `$from`/`$to` properties → Svelte 5 reserves `$` prefix → rename with `{ $from: from }`
- See pattern: [svelte-reactivity.md#L450](../patterns/svelte-reactivity.md#L450)

**Related**: #L680 (Atomic Design), #L400 (SSR browser libraries), svelte-reactivity.md#L450 ($ prefix collision), #L760 (ProseMirror Syntax Highlighting)

---

## #L760: ProseMirror Syntax Highlighting Integration [🟡 IMPORTANT]

**Symptom**: Code blocks in ProseMirror show plain text without syntax colors  
**Root Cause**: ProseMirror `Decoration.node()` can only add CSS classes, not inject HTML with `<span>` elements  
**Fix**:

```typescript
// ❌ WRONG - Manual highlight.js with Decoration.node()
import hljs from 'highlight.js';
const highlighted = hljs.highlight(code, { language }).value; // Returns HTML string
const decoration = Decoration.node(pos, pos + node.nodeSize, {
	class: 'hljs' // Only adds class, doesn't inject HTML - NO COLORS!
});

// ✅ CORRECT - prosemirror-highlight plugin
import { createHighlightPlugin } from 'prosemirror-highlight';
import { createParser } from 'prosemirror-highlight/lowlight';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);
const parser = createParser(lowlight);
const syntaxHighlightPlugin = createHighlightPlugin({ parser });

// Add to editor state BEFORE custom plugins
EditorState.create({
	doc,
	plugins: [
		buildInputRules(schema),
		syntaxHighlightPlugin, // ← Add syntax highlighting first
		customCodeBlockPlugin // ← Then custom plugins
	]
});
```

**Install**:

```bash
npm install prosemirror-highlight lowlight
```

**Design Token Integration**:

```css
/* src/app.css - Define semantic code color tokens */
--color-code-bg: var(--color-sidebar-bg);
--color-code-text: var(--color-sidebar-text-primary);
--color-code-keyword: oklch(69% 0.17 10); /* Warm red */
--color-code-string: oklch(75% 0.12 220); /* Blue */
--color-code-function: oklch(75% 0.15 290); /* Purple */
--color-code-comment: var(--color-text-tertiary); /* Muted */

/* NoteEditor.svelte - Use tokens for highlighting */
:global(.ProseMirror pre) {
	background-color: var(--color-code-bg);
	color: var(--color-code-text);
}
:global(.ProseMirror .hljs-keyword) {
	color: var(--color-code-keyword);
}
```

**Apply when**:

- Code blocks need syntax highlighting
- Automatic language detection required
- Must match app's design system (light/dark mode)

**Why Not Manual highlight.js**:

- `Decoration.node()` only adds attributes/classes to existing DOM
- Cannot inject HTML structure (nested `<span>` tags with classes)
- highlight.js returns HTML string, but ProseMirror needs actual DOM manipulation
- `prosemirror-highlight` handles DOM rendering correctly

**Common Gotchas**:

- Plugin order matters: syntax highlight plugin MUST load before custom plugins
- Language attribute must be on code_block node schema
- CSS classes are `.hljs-keyword`, `.hljs-string`, etc. (from lowlight/highlight.js)
- Use design tokens, not hardcoded colors (ensures theme consistency)

**Related**: #L730 (ProseMirror Integration), #L780 (Design Tokens), convex-integration.md#L150 (Schema attributes)

---

## #L780: Component Using Custom CSS Instead of Design Tokens [🔴 CRITICAL]

**Symptom**: Component has large `<style>` block with hardcoded values, inconsistent spacing/colors  
**Root Cause**: Developer skipped design token system and wrote custom CSS  
**Fix**:

```svelte
<!-- ❌ WRONG - Custom CSS classes not in design system -->
<div class="note-header">
	<h2 class="note-title">{title}</h2>
	<button class="action-button">Save</button>
</div>

<!-- ✅ CORRECT - Design tokens via Tailwind utility classes -->
<div
	class="sticky top-0 z-10 flex h-system-header items-center justify-between border-b border-base bg-surface px-inbox-header py-system-header"
>
	<h2 class="text-sm font-normal text-secondary">{title}</h2>
	<button class="rounded-md bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover">
		Save
	</button>
</div>

<style>
	.note-header {
		padding: 16px 24px;
		background: #1a1a1a;
		border-bottom: 1px solid #333;
	}
	.note-title {
		font-size: 14px;
		color: #999;
	}
	.action-button {
		padding: 8px 16px;
		background: #4f46e5;
		border-radius: 6px;
	}
</style>
```

**Apply when**:

- Creating new components (check existing components for patterns)
- Component has `<style>` block with custom classes
- Spacing/colors don't match rest of app

**Design Token Checklist**:

**Application UI:**

- ✅ Spacing: Use `px-inbox-header`, `py-system-header`, `gap-icon` (never `px-4`, `py-2`)
- ✅ Colors: Use `bg-surface`, `text-secondary`, `border-base` (never `#1a1a1a`, `#999`)
- ✅ Typography: Use `text-sm`, `text-label` (never `text-[14px]`)
- ✅ Border Radius: Use `rounded-md`, `rounded-input` (never `rounded-[6px]`)
- ✅ Heights: Use `h-system-header` (never `h-[64px]`)

**Marketing Pages:**

- ✅ Section Padding: Use `py-marketing-section` (7rem) for all sections
- ✅ Spacing Hierarchy: Use `mb-marketing-title-to-lead` (1.5rem), `mt-marketing-content` (3rem)
- ✅ Card Spacing: Use `p-marketing-card` (2.5rem), `gap-marketing-card` (2rem)
- ✅ Hero Padding: Use `py-marketing-hero` (5rem), `pb-marketing-hero` (8rem)

**Two-Tier Approach**:

1. **Utility Classes (Recommended for most pages)**:

   ```html
   <section class="bg-surface py-marketing-section">
   	<div class="mx-auto max-w-4xl px-marketing-container">
   		<h2 class="mb-marketing-title-to-lead">Title</h2>
   		<p class="mb-marketing-content">Lead...</p>
   	</div>
   </section>
   ```

   ✅ Use for: Blog posts, docs, simple marketing pages  
   ✅ Benefits: No `<style>` blocks, fast development, consistent spacing

2. **CSS Variables (For complex custom sections)**:
   ```css
   .hero-section {
   	padding: var(--spacing-marketing-hero-y) 0 var(--spacing-marketing-hero-bottom) 0;
   	background: linear-gradient(...); /* Complex styling */
   }
   ```
   ✅ Use for: Landing pages with custom gradients, animations, unique layouts  
   ✅ Benefits: Full control when needed, still uses token system

**How to Fix**:

1. Find similar component (e.g., `ReadwiseDetail.svelte` for detail views)
2. Copy structure and token usage
3. Remove `<style>` block entirely (or use CSS variables if complex)
4. Reference `dev-docs/2-areas/design/design-tokens.md` for token list
5. For marketing pages, see `dev-docs/2-areas/design/marketing-spacing-guide.md`

**Why Critical**:

- Breaks light/dark mode consistency
- Makes global design changes impossible
- Creates maintenance debt (83+ hardcoded values = 83 places to update)
- New team members learn wrong patterns
- Marketing pages look inconsistent

**Related**: #L60 (Generous Padding), #L120 (Fixed Height Header), design-tokens.md (Marketing Tokens)

---

## #L828: Navbar/Header Using Non-Existent CSS Variables [🔴 CRITICAL]

**Symptom**: Navbar stays white in dark mode, or uses wrong background color  
**Root Cause**: Using `rgba(var(--color-bg-base-rgb), 0.95)` or other non-existent CSS variables with fallback values  
**Fix**:

```css
/* ❌ WRONG - Non-existent variable with hardcoded fallback */
.docs-navbar {
	position: sticky;
	top: 0;
	z-index: 100;
	background: var(--color-bg-base);
	border-bottom: 1px solid var(--color-border-base);
	backdrop-filter: blur(8px);
	background: rgba(
		var(--color-bg-base-rgb, 255, 255, 255),
		0.95
	); /* ❌ Overrides above, always white */
}

/* ✅ CORRECT - Use semantic surface token */
.docs-navbar {
	position: sticky;
	top: 0;
	z-index: 100;
	background: var(--color-bg-surface);
	border-bottom: 1px solid var(--color-border-base);
}
```

**Why This Breaks**:

1. `--color-bg-base-rgb` doesn't exist in design system
2. Fallback `255, 255, 255` (white) always applies
3. Second `background:` declaration overrides the first
4. Dark mode never activates for this component

**How to Fix**:

1. Check `src/app.css` for available CSS variables (all start with `--color-`)
2. Use `bg-surface` for elevated headers/navbars (provides contrast)
3. Use `bg-base` for page backgrounds
4. Never use RGB variables unless defined in design system
5. Remove backdrop-filter/blur unless explicitly in design system

**Available Background Tokens**:

- `--color-bg-base`: Page background
- `--color-bg-surface`: Card/surface background (slightly elevated)
- `--color-bg-elevated`: Modal/popover background (most elevated)
- `--color-bg-hover`: Hover state background
- `--color-bg-hover-solid`: Hover state (solid, no transparency)

**Pattern: Header/Navbar Backgrounds**:

```svelte
<!-- Navbar (top-level navigation) -->
<nav class="sticky top-0 z-10 border-b border-base bg-surface">...</nav>

<!-- Page Header (content header) -->
<div class="sticky top-0 z-10 border-b border-base bg-surface px-inbox-header py-system-header">
	...
</div>

<!-- Modal Header -->
<div class="border-b border-base bg-elevated px-header py-header">...</div>
```

**Reference Implementation**:

- `src/lib/components/inbox/InboxHeader.svelte` (perfect example)
- `src/lib/components/sidebar/SidebarHeader.svelte`

**Why Critical**:

- Breaks dark mode entirely for the component
- Users see jarring white flash in dark mode
- Creates accessibility issues (poor contrast)
- Hard to debug (looks fine in light mode)

**Related**: #L780 (Design Token Usage), #L120 (Fixed Height Header)

---

## #L950: CSS Warnings from svelte-check (Unused Selectors, Empty Rulesets, @apply) [🟡 IMPORTANT]

**Symptom**: `npm run check` shows CSS warnings: "Unused CSS selector", "Empty ruleset", "Unknown @apply rule"  
**Root Cause**: Unused CSS selectors from refactoring, empty rulesets with only comments, @apply rules incompatible with Tailwind 4  
**Fix**:

```svelte
<!-- ❌ WRONG - Unused CSS selectors, empty ruleset, @apply -->
<style>
	.old-action-card {
		position: relative;
		padding: 1rem;
	}
	
	.doc-content {
		/* Typography styling inherited from DocLayout */
	}
	
	.btn-primary {
		@apply bg-primary text-on-primary hover:bg-primary-hover;
	}
</style>

<!-- ✅ CORRECT - Remove unused, use design tokens, prefer component variants -->
<!-- Remove unused selectors entirely -->
<!-- Remove empty rulesets (comments don't count as styles) -->
<!-- Replace @apply with design tokens or use component variant prop -->
<PermissionButton variant="primary" {permissions} requires="teams.create">
	Create Team
</PermissionButton>
```

**Strategy**:

1. **Unused CSS Selectors**:
   - Search template for class usage: `grep -r "class=.*selector-name" src/`
   - If not found, delete entire CSS rule
   - Check if design tokens replaced it (e.g., `.action-card` → `.action-card-minimal`)

2. **Empty Rulesets**:
   - Remove rulesets with only comments
   - If inheritance needed, document in component comment, not CSS

3. **@apply Rules**:
   - **Option 1** (Preferred): Replace with design tokens
     ```css
     .btn-primary {
     	background: var(--color-accent-primary);
     	color: white;
     	border-radius: var(--border-radius-button);
     	padding: var(--spacing-button-y) var(--spacing-button-x);
     }
     ```
   - **Option 2**: Use component variant prop instead of custom CSS
     ```svelte
     <!-- Instead of class="btn-primary" -->
     <PermissionButton variant="primary">
     ```

**Apply when**:
- `npm run check` shows CSS warnings
- Refactoring components (old styles left behind)
- Migrating to Tailwind 4 (@apply behavior changed)

**Why Important**:
- Unused CSS bloats bundle (~2-5KB per file)
- Empty rulesets confuse developers
- @apply may not work with Tailwind 4
- Clean CSS improves maintainability

**Related**: #L780 (Design Tokens), #L828 (CSS Variables), dev-docs/design-tokens.md

---

## #L830: Compact Modal Input Design - Linear Style [🟢 REFERENCE]

**Symptom**: Modal has huge whitespace, title looks like header not input, disconnected feel  
**Root Cause**: Oversized typography (text-3xl), excessive min-heights (400px), large gaps  
**Fix**:

```svelte
<!-- ❌ WRONG - Oversized title, massive void -->
<input placeholder="Untitled note..." class="mb-content-spacing text-3xl font-bold" />
<div class="min-h-[400px]">
	<Editor />
</div>

<!-- ✅ CORRECT - Compact, input-sized, tight spacing -->
<input
	placeholder="Untitled note..."
	class="focus:placeholder:text-surface-secondary mb-3 text-xl font-semibold transition-colors"
/>
<div class="min-h-[120px]">
	<Editor />
</div>
```

**Typography Scale**:

- **Title input**: `text-xl` (20px) + `font-semibold` (600)
- **Body editor**: `text-base` (16px) + `font-regular` (400)
- **Gap**: `mb-3` (12px) between fields
- **Min-height**: `120px` (grows with content)

**Key Principles**:

1. **Input-sized title** - Should feel like a form field, not a header
2. **Compact spacing** - 12px gap keeps fields connected
3. **Minimal heights** - Start small, grow organically
4. **Clear affordances** - Focus states, transitions
5. **Information density** - Prioritize content over chrome

**Apply when**:

- Creating modal forms for quick capture (notes, issues, tasks)
- Building Linear/Notion-style focused input experiences
- User needs to stay in flow, minimal friction

**Anti-patterns**:

- ❌ Title > 24px (feels like page header)
- ❌ Gaps > 24px (fields feel disconnected)
- ❌ Min-height > 200px (creates empty void)
- ❌ Missing focus states (unclear interaction)

**Inspiration**: Linear issue creation, Notion page creation, Superhuman compose  
**Related**: #L480 (Command Palette Design), #L680 (Atomic Components), #L780 (Design Tokens)

---

## #L880: Keyboard-Driven Edit Mode Activation [🟡 IMPORTANT]

**Symptom**: J/K navigation shortcuts don't work when item selected, input auto-focused blocks global shortcuts  
**Root Cause**: Input fields auto-focus on mount, preventing global keyboard event handlers from triggering  
**Fix**:

```typescript
// ❌ WRONG: Auto-focus on mount blocks global shortcuts
onMount(() => {
	titleElement?.focus(); // Blocks J/K navigation
});

// ✅ CORRECT: Default unfocused, Enter to activate edit mode
type Props = {
	autoFocus?: boolean; // Control focus behavior
};

let { autoFocus = false }: Props = $props();
let editorRef: any = $state(null);
let editMode = $state(false);

// Mount without auto-focus
onMount(() => {
	if (autoFocus) {
		titleElement?.focus();
	}
});

// Handle Enter key to activate edit mode
$effect(() => {
	if (!browser) return;

	function handleKeyDown(event: KeyboardEvent) {
		if (editMode) return;

		// Check if any input is focused
		const activeElement = document.activeElement;
		const isInputFocused =
			activeElement?.tagName === 'INPUT' ||
			activeElement?.tagName === 'TEXTAREA' ||
			(activeElement instanceof HTMLElement && activeElement.isContentEditable);

		if (isInputFocused) return;

		// Enter activates edit mode
		if (event.key === 'Enter') {
			event.preventDefault();
			editMode = true;
			setTimeout(() => editorRef?.focusTitle(), 0);
		}
	}

	window.addEventListener('keydown', handleKeyDown);
	return () => window.removeEventListener('keydown', handleKeyDown);
});

// Track when user leaves edit mode (ESC already handled by input blur)
$effect(() => {
	if (!browser || !editMode) return;

	function handleFocusOut() {
		setTimeout(() => {
			const activeElement = document.activeElement;
			const isInputFocused =
				activeElement?.tagName === 'INPUT' ||
				activeElement?.tagName === 'TEXTAREA' ||
				(activeElement instanceof HTMLElement && activeElement.isContentEditable);

			if (!isInputFocused) {
				editMode = false;
			}
		}, 100);
	}

	document.addEventListener('focusout', handleFocusOut);
	return () => document.removeEventListener('focusout', handleFocusOut);
});
```

**Input Component Pattern** (expose focus method):

```typescript
// In NoteEditor.svelte
export function focusTitle() {
	titleElement?.focus();
}

// Handle ESC to exit edit mode
function handleTitleKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape') {
		(e.target as HTMLInputElement).blur(); // ✅ Exit edit mode
		e.preventDefault();
	}
}
```

**Keyboard Flow**:

1. **Navigation Mode** (default): J/K keys work, no input focused
2. **Press Enter**: Activate edit mode, focus input field
3. **Press ESC**: Exit edit mode, blur input, return to navigation
4. **Tab out**: Auto-exit edit mode when focus leaves

**Apply when**:

- List/detail views with keyboard navigation (inbox, cards, items)
- Global shortcuts conflict with input fields
- Need explicit navigation vs edit modes

**Anti-patterns**:

- ❌ Auto-focusing inputs on item selection (blocks shortcuts)
- ❌ No way to exit edit mode without mouse
- ❌ ESC key doesn't blur inputs

**Priority Order** (from INDEX.md):

1. Dropdown/Combobox (highest priority)
2. Input fields (when focused)
3. Component shortcuts (J/K navigation)

**Inspiration**: Gmail (J/K navigation + Enter to reply), Superhuman, Linear  
**Related**: #L170 (Edit mode toggle), #L430 (Keyboard shortcut conflicts)

---

## #L930: Hierarchical ESC Key Navigation with Visual Feedback [🟢 REFERENCE]

**Symptom**: ESC closes modal immediately, blocking access to modal shortcuts after typing  
**Root Cause**: Single-level ESC behavior - no intermediate blur step before modal close  
**Fix**:

```typescript
// ❌ WRONG: ESC closes modal immediately
function handleKeyDown(e: KeyboardEvent) {
	if (e.key === 'Escape') {
		closeModal();
	}
}

// ✅ CORRECT: Hierarchical ESC - blur first, then close
function handleKeyDown(e: KeyboardEvent) {
	if (e.key === 'Escape') {
		const activeElement = document.activeElement as HTMLElement;

		// Level 1: Close dropdown/combobox
		if (tagComboboxOpen) {
			return; // Let component handle it
		}

		// Level 2: Blur input/editor
		if (activeElement && isInputElement(activeElement)) {
			e.preventDefault();
			e.stopPropagation();
			activeElement.blur();

			// Refocus modal container for shortcuts
			setTimeout(() => modalContainerRef?.focus(), 0);
			return;
		}

		// Level 3: Close modal (nothing focused)
		closeModal();
	}
}

function isInputElement(el: HTMLElement): boolean {
	return (
		el.tagName === 'INPUT' ||
		el.tagName === 'TEXTAREA' ||
		el.isContentEditable ||
		el.getAttribute('role') === 'textbox'
	);
}
```

**Input-Level ESC Handler** (stop propagation to prevent modal from seeing event):

```typescript
// In input component (e.g., NoteEditor.svelte)
function handleTitleKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape') {
		(e.target as HTMLInputElement).blur();
		e.preventDefault();
		e.stopPropagation(); // ✅ Critical - prevent modal handler from firing

		// Notify parent to refocus modal container
		onEscape?.();
	}
}
```

**ProseMirror ESC Handler** (return true to stop propagation):

```typescript
// In prosemirror-setup.ts
keys['Escape'] = (state, dispatch, view: EditorView) => {
	if (view && view.dom) {
		view.dom.blur();
		// Notify parent to refocus
		if (onEscape) {
			setTimeout(() => onEscape(), 0);
		}
		return true; // ✅ Stops propagation in ProseMirror
	}
	return false;
};
```

**Callback Chain** (pass onEscape through component hierarchy):

```svelte
<!-- QuickCreateModal.svelte -->
<NoteEditorWithDetection
	onEscape={() => {
		// Refocus modal so keyboard shortcuts (T) work
		setTimeout(() => modalContainerRef?.focus(), 0);
	}}
/>

<!-- NoteEditorWithDetection.svelte -->
<NoteEditor {onEscape} />

<!-- NoteEditor.svelte -->
<input onkeydown={handleTitleKeydown} />
{@render editorWithEscape(onEscape)}
```

**Visual Feedback for Onboarding**:

1. **Tooltip on first ESC press** (educate user):

   ```svelte
   {#if showEscHint && !hasSeenEscHint}
   	<div
   		class="absolute top-4 right-4 rounded-md bg-accent-primary px-3 py-2 text-white shadow-lg"
   	>
   		Press <kbd>ESC</kbd> again to close
   	</div>
   {/if}
   ```

2. **Visual focus indicator** (show what's active):

   ```css
   /* Input focused: show focus ring */
   input:focus-visible {
   	outline: 2px solid var(--accent-primary);
   }

   /* Modal focused (no input): subtle glow */
   [role='dialog']:focus-visible {
   	box-shadow: 0 0 0 3px var(--accent-primary-alpha);
   }
   ```

3. **Keyboard shortcut hints** (contextual help):

   ```svelte
   {#if !inputFocused}
   	<div class="absolute bottom-4 left-4 flex gap-2 text-xs text-tertiary">
   		<kbd>T</kbd> Tags
   		<kbd>ESC</kbd> Close
   	</div>
   {:else}
   	<div class="absolute bottom-4 left-4 text-xs text-tertiary">
   		<kbd>ESC</kbd> Exit input
   	</div>
   {/if}
   ```

4. **Activation pattern** (progressive disclosure):
   - Session 1-3: Show all hints
   - Session 4-10: Show hints on hover
   - Session 11+: Hide hints (power user mode)

**User Flow**:

```
C → Modal opens, title focused
Type → User enters text
ESC #1 → Title blurs, modal refocuses, tooltip: "Press ESC again to close"
T → Tag selector opens (modal has focus, shortcut works!)
ESC #2 → Tag selector closes
ESC #3 → Modal closes
```

**Why**: Enables keyboard-first workflow - users can navigate between inputs and modal shortcuts without touching the mouse. Visual feedback helps users discover and learn the hierarchical behavior during onboarding.

**Apply when**:

- Modal with multiple inputs/editors
- Modal has its own keyboard shortcuts (T, S, etc.)
- Users need to switch between typing and navigation

**Anti-patterns**:

- ❌ ESC closes modal immediately (blocks shortcuts)
- ❌ No visual feedback on what's focused
- ❌ No hints for power users during onboarding
- ❌ ESC handler doesn't stop propagation (modal sees event and closes)

**Complementary Patterns**:

- Store `hasSeenEscHint` in localStorage for progressive disclosure
- Track shortcut usage for adaptive UI (hide hints for power users)
- Use `setTimeout(0)` for refocus to avoid timing conflicts

**Inspiration**: Gmail (ESC exits compose), Linear (hierarchical navigation), Superhuman (visual keyboard hints)  
**Related**: #L430 (Keyboard shortcut priority), #L880 (Enter/ESC edit mode), #L580 (N vs C shortcuts)

---

## #L1100: Raw Markdown Displayed Instead of Rendered HTML [🔴 CRITICAL]

**Symptom**: Documentation page shows raw markdown with broken emojis (e.g., `## δŸ~δi` instead of `## 🎯`)  
**Root Cause**: URL includes `.md` extension, bypassing SvelteKit dynamic route handler. Vite serves raw file directly.  
**Fix**:

```typescript
// vite.config.ts
export default defineConfig({
	plugins: [
		tailwindcss(),
		{
			name: 'redirect-markdown',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					// Redirect .md URLs to clean URLs (for documentation system)
					if (req.url?.endsWith('.md')) {
						const cleanUrl = req.url.replace(/\.md$/, '');
						res.writeHead(301, { Location: cleanUrl });
						res.end();
						return;
					}
					next();
				});
			}
		},
		sveltekit()
	]
	// ... rest of config
});
```

**Apply when**:

- Documentation system serves markdown files dynamically
- Raw markdown appears instead of rendered HTML
- URLs with `.md` extension should redirect to clean URLs
- Vite intercepts requests before SvelteKit hooks run

**Why it works**:

- Vite middleware runs before file serving
- 301 redirect preserves hash fragments for anchor links
- Browser automatically follows redirect to dynamic route
- Dynamic route handler renders markdown to HTML with proper UTF-8 encoding

**Correct Pattern**:

1. Add Vite plugin with `configureServer` hook
2. Intercept requests ending with `.md`
3. Issue 301 redirect to URL without extension
4. SvelteKit dynamic route handles rendering

**Related**: #L10 (Routing patterns), svelte-reactivity.md#L400 (SSR issues)

---

## #L1120: Directory-Aware Markdown Link Resolution [🟡 IMPORTANT]

**Symptom**: Relative markdown links break when navigating between directories (e.g., `../../architecture.md` returns 404)  
**Root Cause**: Link renderer prepends `./` to all relative paths, corrupting parent directory references (`../`)  
**Fix**:

```typescript
// ❌ WRONG: Prepends ./ to ALL relative paths (breaks ../)
renderer.link = function ({ href, text, title }: any) {
	if (href && !href.startsWith('http') && !href.startsWith('/')) {
		if (href.includes('.md')) {
			const [path, hash] = href.split('#');
			const cleanPath = path.replace(/\.md$/, '');
			const cleanHash = hash ? `#${hash.toLowerCase()}` : '';

			// This breaks ../parent.md → ./../../parent.md (wrong!)
			const relativePath = cleanPath.startsWith('./') ? cleanPath : `./${cleanPath}`;

			href = `${relativePath}${cleanHash}`;
		}
	}
	// ... build link HTML
};

// ✅ CORRECT: Preserve both ./ and ../ prefixes
renderer.link = function ({ href, text, title }: any) {
	if (href && !href.startsWith('http') && !href.startsWith('/')) {
		if (href.includes('.md')) {
			const [path, hash] = href.split('#');
			const cleanPath = path.replace(/\.md$/, '');
			const cleanHash = hash ? `#${hash.toLowerCase()}` : '';

			// Make relative links explicit for browser resolution
			// Preserve ./ and ../ prefixes, otherwise prepend ./
			const finalPath =
				cleanPath.startsWith('./') || cleanPath.startsWith('../') ? cleanPath : './' + cleanPath;

			href = `${finalPath}${cleanHash}`;
		}
	}

	const titleAttr = title ? ` title="${title}"` : '';
	return `<a href="${href}"${titleAttr}>${text}</a>`;
};
```

**Why it works**:

- Browser resolves `./file.md` relative to current directory ✅
- Browser resolves `../file.md` relative to parent directory ✅
- Browser resolves `../../file.md` correctly up two levels ✅
- Prepending `./` to bare filenames makes them explicitly relative ✅
- Hash fragments (`#L10`) still work with lowercase transformation ✅

**Apply when**:

- Building documentation systems with nested directories
- Markdown renderer needs to handle same-directory, subdirectory, and parent directory links
- SvelteKit dynamic routes with catch-all parameters (`[...path]`)
- Links include `.md` extensions that need stripping

**Test cases**:

```markdown
[Same directory](product-vision.md) → ./product-vision
[Subdirectory](patterns/INDEX.md) → ./patterns/INDEX
[Parent directory](../../architecture.md) → ../../architecture
[With hash](patterns/INDEX.md#L10) → ./patterns/INDEX#l10
```

**Common gotchas**:

- Don't forget to preserve existing `./` prefixes (avoid `././file`)
- Hash fragments should be lowercased for consistency
- External links (`http://`) should skip transformation entirely
- Absolute paths (`/`) should skip transformation entirely

**Related**: #L1100 (Raw markdown rendering), svelte-reactivity.md#L400 (SSR browser libraries)

---

## #L1150: ProseMirror List Support with addListNodes [🟡 IMPORTANT]

**Symptom**: Typing `-` or `1.` doesn't create lists, stays as plain text  
**Root Cause**: `prosemirror-schema-basic` doesn't include list nodes by default  
**Fix**:

```typescript
// ❌ WRONG - Lists don't exist in basicSchema
export const noteSchema = new Schema({
  nodes: basicSchema.spec.nodes
    .addToEnd("custom_node", { ... }),
  marks: basicSchema.spec.marks,
});

// Input rules fail silently:
rules.push(wrappingInputRule(/^\s*([-*])\s$/, schema.nodes.bullet_list)); // undefined!

// ✅ CORRECT - Add list nodes from prosemirror-schema-list
import { addListNodes, splitListItem, liftListItem, sinkListItem } from "prosemirror-schema-list";

export const noteSchema = new Schema({
  nodes: addListNodes(
    basicSchema.spec.nodes,
    "paragraph block*", // list_item content spec
    "block" // group name for lists
  )
    .addToEnd("custom_node", { ... }),
  marks: basicSchema.spec.marks,
});

// Now input rules work:
rules.push(wrappingInputRule(/^\s*([-*])\s$/, schema.nodes.bullet_list)); // ✅
rules.push(wrappingInputRule(/^(\d+)\.\s$/, schema.nodes.ordered_list)); // ✅

// And list commands work:
keys["Enter"] = chainCommands(
  splitListItem(schema.nodes.list_item),
  baseKeymap["Enter"]
);
keys["Shift-Enter"] = liftListItem(schema.nodes.list_item); // Exit list
keys["Tab"] = sinkListItem(schema.nodes.list_item); // Indent
keys["Shift-Tab"] = liftListItem(schema.nodes.list_item); // Outdent
```

**Apply when**:

- ProseMirror editor needs bullet or ordered lists
- Input rules for `-` or `1.` don't trigger
- List-related commands throw "undefined" errors
- Documentation says "list elements defined in prosemirror-schema-list module"

**Why it works**:

- `addListNodes()` adds three nodes: `bullet_list`, `ordered_list`, `list_item`
- Nodes follow standard HTML structure: `<ul><li><p>text</p></li></ul>`
- `wrappingInputRule` converts paragraph to wrapped list structure
- `splitListItem` enables Enter key continuation
- `liftListItem` enables Shift+Enter or double-Enter to exit

**Correct Pattern**:

1. Import `addListNodes` from `prosemirror-schema-list`
2. Wrap `basicSchema.spec.nodes` with `addListNodes(nodes, "paragraph block*", "block")`
3. Chain to your custom nodes with `.addToEnd()`
4. Use `wrappingInputRule` for input rules (no custom logic needed)
5. Use `splitListItem`, `liftListItem`, `sinkListItem` for keyboard commands

**Related**: #L730 (ProseMirror Integration), #L760 (Syntax Highlighting)

---

## #L1150: Svelte 5 Motion for Premium Animations [🟢 REFERENCE]

**Symptom**: Animations feel stiff, robotic, or lack polish  
**Root Cause**: Using only CSS transitions without physics-based motion  
**Fix**:

```typescript
// ❌ WRONG - CSS-only, no organic feel
<div style="transition: all 0.3s ease">

// ✅ CORRECT - Svelte 5 spring physics + staggered transitions
import { spring } from 'svelte/motion';
import { fade, fly } from 'svelte/transition';

let scale = spring(1, { stiffness: 0.3, damping: 0.8 });
let opacity = spring(1, { stiffness: 0.2, damping: 0.9 });

$effect(() => {
  if (isHovering) {
    scale.set(1.02);
    opacity.set(1);
  } else {
    scale.set(1);
    opacity.set(0.95);
  }
});

// Staggered entrance
{#each items as item, i}
  <div in:fly={{ x: 10, duration: 400, delay: i * 40 }}>
    {item}
  </div>
{/each}

// Spring-based transforms
<div style="transform: scale({$scale}); opacity: {$opacity};">
```

**Apply when**:

- Building premium UI components (TOC, modals, drawers)
- Micro-interactions need organic feel (hover, focus, active states)
- Sequential reveals enhance perceived performance
- Design requires Apple/Linear-quality polish

**Why it works**:

- `spring()` creates physics-based motion (mass, stiffness, damping)
- Transitions feel natural, not mechanical
- Staggered delays create elegant cascades
- GPU-accelerated (transform, opacity) = 60fps smooth
- Combines with CSS for best of both worlds

**Premium Animation Stack**:

1. **Spring physics**: `spring()` for organic scale/position changes
2. **Transition directives**: `in:fly`, `out:fade` for enter/exit
3. **Staggered timing**: `delay: i * 40ms` for sequential reveals
4. **CSS for basics**: `transition: all 0.2s ease-out` for simple states
5. **Elastic curves**: `cubic-bezier(0.34, 1.56, 0.64, 1)` for bounce

**Configuration Guide**:

- **Stiffness** (0.1-0.5): Lower = slower, bouncier
- **Damping** (0.5-1.0): Lower = more oscillation
- **Delay multiplier** (30-50ms): Faster for small lists, slower for impact

**Related**: #L680 (Atomic Design), svelte-reactivity.md#L220 (useQuery reactivity)

---

## #L1200: ProseMirror Plugin Menu State Management [🟡 IMPORTANT]

**Symptom**: Menu selection doesn't insert content - text remains, emoji/mention not inserted  
**Root Cause**: Plugin state deactivates before insertion function reads it  
**Fix**:

```typescript
// ❌ WRONG: Reading state when it might be deactivated
function insertEmoji(view: EditorView, emoji: string) {
	const state = emojiPluginKey.getState(view.state);
	if (!state?.active) return; // ❌ Fails! State already deactivated
	const { from, to } = state;
	view.dispatch(view.state.tr.insertText(emoji, from, to));
}

// ✅ CORRECT: Capture positions while state is active
let range = $state<{ from: number; to: number } | null>(null);

function updateMenu() {
	const state = emojiPluginKey.getState(editorView.state);
	if (state?.active) {
		range = { from: state.from, to: state.to }; // Store positions eagerly
	} else {
		range = null;
	}
}

function insertEmoji(view: EditorView, emoji: string, from: number, to: number) {
	// Accept positions as parameters (like insertMention pattern)
	const tr = view.state.tr.insertText(emoji, from, to).setMeta('deactivateEmoji', true);
	view.dispatch(tr);
	view.focus();
}

function selectEmoji(emoji: string) {
	if (editorView && range) {
		insertEmoji(editorView, emoji, range.from, range.to); // Use stored range
	}
}
```

**Key Pattern**: **Capture state positions eagerly, use them lazily**

1. ✅ Store `{ from, to }` positions when plugin state is active
2. ✅ Pass positions as function parameters (not read from state)
3. ✅ Match ProseMirror's `insertMention()` pattern (accepts range directly)
4. ❌ Never read plugin state inside insert function (may be deactivated)

**Why**: ProseMirror plugin state is reactive to document changes. Between capturing user input (Enter key) and executing the insertion, the state may deactivate (due to event propagation, focus changes, or plugin logic), causing reads to fail.

**Plugin Integration**:

```typescript
// Plugin must return true to prevent ProseMirror defaults
props: {
  handleKeyDown(view: EditorView, event: KeyboardEvent) {
    const state = emojiPluginKey.getState(view.state);
    if (!state?.active) return false;

    if (["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(event.key)) {
      return true; // ✅ Prevent ProseMirror from handling these keys
    }
    return false;
  }
}
```

**Apply when**:

- Building ProseMirror plugins with dropdown menus (emoji picker, mentions, slash commands)
- Any plugin where user selection happens after state changes
- Menu state must survive event propagation chain

**Related**: #L730 (ProseMirror integration), #L430 (Keyboard priority), svelte-reactivity.md#L80 (Reactive values)

---

## #L1260: Sidebar Removal + Breadcrumbs [🟢 REFERENCE]

**Symptom**: Documentation has 29-item left sidebar + top nav + TOC (violates Miller's Law)  
**Root Cause**: Redundant navigation systems created independently  
**Fix**: Remove sidebar, add breadcrumbs, keep top nav (10 items) + floating TOC

```svelte
// ❌ WRONG - Multiple redundant navigation systems
<DocLayout>
	<Sidebar><!-- 29 items --></Sidebar>
	<TopNav><!-- 10 items --></TopNav>
	<TOC />
	<Content />
</DocLayout>

// ✅ CORRECT - Single responsibility per navigation tier
<DocLayout>
	<TopNav><!-- 10 items: primary categories --></TopNav>
	<Breadcrumbs />
	<!-- Location context -->
	<TOC />
	<!-- On-page navigation -->
	<Content />
</DocLayout>
```

**Implementation**:

1. **Breadcrumb Component** (auto-generated from URL):

```svelte
<script lang="ts">
	import { page } from '$app/stores';

	// Map URL segments to readable names
	const segmentMap: Record<string, string> = {
		'dev-docs': 'Documentation',
		'2-areas': 'Core Areas',
		patterns: 'Patterns'
		// ... more mappings
	};

	const breadcrumbs = $derived.by(() => {
		const segments = $page.url.pathname.split('/').filter(Boolean);
		return segments.map((segment, index) => ({
			href: '/' + segments.slice(0, index + 1).join('/'),
			label: segmentMap[segment] || formatSegment(segment)
		}));
	});
</script>

<nav aria-label="Breadcrumb">
	<ol>
		<li><a href="/">🏠 Home</a></li>
		{#each breadcrumbs as crumb, i}
			<li>
				<span aria-hidden="true">/</span>
				{#if i === breadcrumbs.length - 1}
					<span aria-current="page">{crumb.label}</span>
				{:else}
					<a href={crumb.href}>{crumb.label}</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
```

2. **Layout Without Sidebar**:

```svelte
<div class="docs-layout">
	<TableOfContents {headings} />
	<!-- Floats left: 2rem -->

	<main class="docs-content">
		<div class="docs-content-inner">
			<Breadcrumb />
			<!-- Location context -->
			<article>{@render children?.()}</article>
		</div>
	</main>
</div>

<style>
	.docs-layout {
		display: flex;
		min-height: 100vh;
	}

	.docs-content {
		flex: 1;
		display: flex;
		justify-content: center;
		padding: 2rem var(--spacing-content-padding);
	}

	.docs-content-inner {
		width: 100%;
		max-width: 900px;
	}
</style>
```

3. **Navigation Hierarchy**:

```
Top Nav (7 items)     → Primary categories (Documentation, Design, About)
  ↓
Hub Pages            → Visual grids for discovery (/dev-docs/all)
  ↓
Breadcrumbs          → Current location context (Home > Design > Tokens)
  ↓
TOC (floating)       → On-page navigation (sections within doc)
```

**Why**:

- **Cognitive load**: 7 nav items < 29 sidebar items (Miller's Law)
- **Clarity**: Each navigation tier has single responsibility
- **Modern**: Follows Stripe/Vercel/Linear pattern
- **Mobile-first**: One less thing to hide on mobile
- **Accessible**: Breadcrumbs provide hierarchical context

**Apply when**:

- Documentation site with >20 pages
- Multiple navigation systems created independently
- Users report "can't find anything" or "too overwhelming"
- Analytics show low engagement with sidebar

**Implementation Details**:

- Breadcrumbs: `font-size: 0.875rem`, staggered entrance (40ms delay per item)
- TOC: Shifted from `left: 280px` (sidebar width) → `left: 2rem`
- Removed: 260px of horizontal space, 29 sidebar items, redundant scrolling

**Related**: navigation-philosophy.md (UX psychology), #L10 (Component architecture)

---

## #L1870: Always Use resolveRoute() for Navigation [🔴 CRITICAL]

**Symptom**: Navigation breaks in production with base path, ESLint errors `no-navigation-without-resolve`, routes don't prefetch  
**Root Cause**: Hardcoded paths don't respect SvelteKit's `base` configuration, breaking deployments with base paths  
**Fix**:

```typescript
// ❌ WRONG: Hardcoded paths break with base paths
import { goto } from '$app/navigation';
goto('/inbox');
<a href="/settings">Settings</a>

// ✅ CORRECT: Use resolveRoute() for all internal navigation
import { resolveRoute } from '$lib/utils/navigation';
import { goto } from '$app/navigation';

goto(resolveRoute('/inbox'));
<a href={resolveRoute('/settings')}>Settings</a>
```

**Centralized Utility** (`src/lib/utils/navigation.ts`):

```typescript
import { resolve as svelteResolve } from '$app/paths';
import type { RouteId } from '$app/types';

/**
 * Resolves a route path, handling type assertions for routes that may not be
 * in the strict TypeScript route manifest (e.g., dynamic routes, planned routes).
 */
export function resolveRoute(route: string): string {
	// Type assertion needed for routes that exist but aren't in the strict route type union
	// This allows routes like /settings/* subroutes that are handled by layouts
	// @ts-expect-error - SvelteKit's strict route typing doesn't include all valid routes
	return svelteResolve(route as RouteId);
}
```

**Why**: 
- SvelteKit 2.26+ uses `resolve()` (not deprecated `resolveRoute()`)
- Wraps `resolve()` with type assertions for routes not in strict type manifest
- Enables proper prefetching for better performance
- Handles routes like `/settings/*` subroutes that are valid at runtime but not in type union

**Exceptions** (use regular `href`):
- External links: `href="https://example.com"`
- Anchors: `href="#section"`
- Static files: `href="/CONTRIBUTING"` (not a route)
- Relative paths: `href="./file.md"`

**Apply when**:
- All `goto()` calls with internal routes
- All `href` attributes pointing to internal routes
- Any programmatic navigation (`replaceState`, `pushState`)

**Related**: #L1100 (Markdown link resolution), #L1120 (Parent directory links), #L1920 (Route type errors)

---

## #L1920: Fix Route Type Errors with Type Assertions [🔴 CRITICAL]

**Symptom**: TypeScript errors like `Argument of type '["/settings/account"]' is not assignable to parameter of type '[route: "/"] | [route: "/(authenticated)"] | ...'` when using `resolveRoute()`  
**Root Cause**: SvelteKit's strict route typing only includes routes in the generated type manifest. Routes handled by layouts (e.g., `/settings/*` subroutes) or planned routes aren't in the type union.  
**Fix**:

```typescript
// ❌ WRONG: Direct use of resolve() causes type errors
import { resolve } from '$app/paths';
resolve('/settings/account'); // Type error!

// ✅ CORRECT: Use wrapper with type assertion
import { resolveRoute } from '$lib/utils/navigation';
resolveRoute('/settings/account'); // Works!
```

**Implementation** (`src/lib/utils/navigation.ts`):

```typescript
import { resolve as svelteResolve } from '$app/paths';
import type { RouteId } from '$app/types';

export function resolveRoute(route: string): string {
	// Type assertion needed for routes that exist but aren't in the strict route type union.
	// SvelteKit's RouteId type is a strict union of generated routes, but doesn't include:
	// - Dynamic routes with catch-all segments (e.g., /dev-docs/[...path])
	// - Routes handled by layouts (e.g., /settings/* subroutes)
	// - Routes that are valid at runtime but not in the generated type manifest
	//
	// SvelteKit's resolve() function has overloads that TypeScript infers as requiring
	// specific RouteId tuples, but at runtime it accepts any valid route string.
	// We use a double assertion (as unknown as RouteId) to explicitly bypass TypeScript's
	// strict type checking while maintaining runtime safety. This is safe because:
	// 1. SvelteKit's resolve() function validates routes at runtime
	// 2. All routes passed to resolveRoute() are validated against actual route structure
	// 3. Invalid routes will fail at runtime, not silently break
	//
	// This is an acceptable limitation: SvelteKit's type system cannot statically verify
	// all runtime-valid routes, so we must use a type assertion here.
	// @ts-expect-error TS2345 - SvelteKit's resolve() has strict RouteId overloads that don't
	// include all runtime-valid routes. The double assertion (as unknown as RouteId) is safe
	// because resolve() validates routes at runtime. See: https://kit.svelte.dev/docs/kit/$app-paths#resolve
	return svelteResolve(route as unknown as RouteId);
}
```

**Why**: 
- SvelteKit 2.26+ deprecated `resolveRoute()` in favor of `resolve()`
- `resolve()` has strict typing that only accepts routes in the generated manifest
- Routes handled by layouts (e.g., `/settings/account` via `/settings/+layout.svelte`) are valid at runtime but not in types
- Type assertion with `@ts-expect-error` bypasses type checking while maintaining runtime correctness
- **Documentation required**: `@ts-expect-error` must include detailed explanation of why assertion is safe

**Apply when**:
- Route type errors with `resolve()` or `resolveRoute()`
- Routes that exist but aren't in the strict type manifest
- Dynamic routes or routes handled by layouts

**Related**: #L1870 (Always use resolveRoute for navigation)

---

## #L2000: Sanitize HTML with DOMPurify to Prevent XSS [🔴 CRITICAL]

**Symptom**: ESLint warnings `svelte/no-at-html-tags`, potential XSS vulnerabilities from user-generated content  
**Root Cause**: `{@html}` directive renders unsanitized HTML, allowing script injection attacks  
**Fix**:

```svelte
<!-- ❌ WRONG: Unsanitized HTML allows XSS attacks -->
<script lang="ts">
	let htmlContent = $derived(marked.parse(markdown));
</script>
{@html htmlContent}
```

```svelte
<!-- ✅ CORRECT: Sanitize HTML before rendering -->
<script lang="ts">
	import { sanitizeHtml } from '$lib/utils/htmlSanitize';
	let htmlContent = $derived(sanitizeHtml(marked.parse(markdown)));
</script>
{@html htmlContent}
```

**Implementation** (`src/lib/utils/htmlSanitize.ts`):

```typescript
import { browser } from '$app/environment';
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * SSR-safe: Returns unsanitized HTML on server, sanitized on client.
 */
export function sanitizeHtml(html: string): string {
	// SSR: Return unsanitized HTML on server (DOMPurify requires DOM)
	if (!browser) {
		return html;
	}

	const config = {
		ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'a', 'ul', 'ol', 'li', 'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'del', 'ins'],
		ALLOWED_ATTR: ['href', 'title', 'id', 'src', 'alt', 'class', 'lang', 'data-*'],
		KEEP_CONTENT: true,
		ALLOW_DATA_ATTR: true
	};

	// Type assertion needed due to DOMPurify type definition mismatch
	return DOMPurify.sanitize(html, config as unknown as Parameters<typeof DOMPurify.sanitize>[1]);
}
```

**Why**: 
- User-generated content (markdown, notes) can contain malicious scripts
- DOMPurify removes dangerous tags/attributes while preserving safe markdown HTML
- SSR-safe: Returns original HTML on server (DOMPurify requires DOM), sanitizes on client

**Apply when**:
- Rendering user-generated HTML content
- Rendering markdown → HTML (even from file system - defense in depth)
- Any `{@html}` directive with dynamic content

**Security Considerations**:
- **User-generated content**: MUST be sanitized (high risk)
- **File system content**: Should also be sanitized (defense in depth)
- DOMPurify config should allow markdown-safe tags only (h1-h6, p, code, pre, etc.)

**Related**: #L2005 (DOMPurify type compatibility), coding-standards.md (Security best practices)

---

## #L2100: Associate Form Labels with Controls for Accessibility [🟡 IMPORTANT]

**Symptom**: svelte-check warning: "A form label must be associated with a control"  
**Root Cause**: Form labels without `for` attribute or not wrapping controls violate accessibility standards (WCAG 2.1)  
**Fix**:

```svelte
<!-- ❌ WRONG: Label not associated with control -->
<label class="mb-2 block text-sm font-medium">Question</label>
<textarea bind:value={question} />

<!-- ✅ CORRECT: Label associated with id/for -->
<label for="question" class="mb-2 block text-sm font-medium">Question</label>
<textarea id="question" bind:value={question} />

<!-- ✅ CORRECT: Label wrapping control -->
<label class="mb-2 block text-sm font-medium">
	Question
	<textarea bind:value={question} />
</label>

<!-- ✅ CORRECT: Form groups use fieldset/legend -->
<fieldset class="flex flex-col gap-icon">
	<legend class="text-sm font-normal text-secondary">Select time range:</legend>
	<RadioGroup.Root bind:value={selectedRange}>
		<!-- RadioGroup items -->
	</RadioGroup.Root>
</fieldset>
```

**Why**: 
- Screen readers need label associations to announce form controls correctly
- Clicking labels should focus/activate associated controls
- `<fieldset>`/`<legend>` is proper semantic HTML for grouped form controls (radio groups, toggle groups)

**Apply when**:
- Form labels without `for` attribute
- Labels not wrapping their controls
- Form groups (radio buttons, toggle groups) need `<fieldset>`/`<legend>`
- svelte-check accessibility warnings

**Accessibility Standards**: WCAG 2.1 Level A requires labels to be programmatically associated with controls  
**Related**: #L680 (Atomic components - FormInput/FormTextarea handle this automatically)

---

## #L2130: Replace autofocus with Programmatic Focus [🟡 IMPORTANT]

**Symptom**: svelte-check warning: "Avoid using autofocus"  
**Root Cause**: `autofocus` attribute violates accessibility guidelines (WCAG 2.4.3) and can cause issues with screen readers and keyboard navigation  
**Fix**:

```svelte
<!-- ❌ WRONG: autofocus attribute -->
<input type="text" bind:value={searchQuery} autofocus />

<!-- ✅ CORRECT: Programmatic focus -->
<script>
	let searchInput = $state<HTMLInputElement | null>(null);
	
	function openSelector() {
		showSelector = true;
		// Focus after selector shows
		setTimeout(() => {
			searchInput?.focus();
		}, 0);
	}
</script>

<input type="text" bind:value={searchQuery} bind:this={searchInput} />
```

**Why**: 
- `autofocus` can interfere with screen reader navigation
- Programmatic focus gives more control over when focus happens
- `setTimeout` ensures DOM is ready before focusing

**Apply when**:
- Modal dialogs or popovers that should focus input on open
- Search inputs in dropdowns or selectors
- Any form that needs initial focus
- svelte-check autofocus warnings

**Accessibility**: Programmatic focus is preferred over `autofocus` as it can be controlled and doesn't interfere with screen reader navigation  
**Related**: #L1085 (Component refs with $state), #L500 ($effect browser checks)

---

## #L2005: Fix DOMPurify Type Compatibility Issues [🟡 IMPORTANT]

**Symptom**: TypeScript error `Argument of type 'DOMPurify.Config' is not assignable to parameter of type 'import(".../dompurify/dist/purify.es").Config'` when using DOMPurify  
**Root Cause**: DOMPurify has multiple type definitions (ESM vs CJS) causing type incompatibility between Config types  
**Fix**:

```typescript
// ❌ WRONG: Direct config causes type mismatch
const config: DOMPurify.Config = { ALLOWED_TAGS: ['p'] };
DOMPurify.sanitize(html, config); // Type error!

// ✅ CORRECT: Use type assertion with 'unknown' intermediate
const config = {
	ALLOWED_TAGS: ['p'],
	ALLOWED_ATTR: ['href', 'id']
};

// Type assertion needed due to DOMPurify type definition mismatch between Config types
// Using 'unknown' first to safely cast between incompatible Config type definitions
return DOMPurify.sanitize(html, config as unknown as Parameters<typeof DOMPurify.sanitize>[1]);
```

**Why**: 
- DOMPurify has separate type definitions for ESM (`purify.es`) and CJS (`purify.js`)
- TypeScript infers incompatible Config types between these definitions
- Using `unknown` as intermediate type allows safe casting between incompatible types

**Apply when**:
- DOMPurify type errors with Config parameter
- Type mismatch between DOMPurify Config types

**Related**: #L2000 (HTML sanitization), coding-standards.md (Type assertions)

---

## #L1660: Toast Notification System (svelte-sonner) [🟢 REFERENCE]

**Symptom**: Need consistent user feedback across the app (success, errors, loading states)  
**Root Cause**: No centralized toast notification system  
**Fix**:

**Setup** (one-time):

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';

	// Load Toaster client-side only (SSR workaround)
	let Toaster = $state<any>(null);

	onMount(async () => {
		const module = await import('svelte-sonner');
		Toaster = module.Toaster;
	});
</script>

{#if Toaster}
	<svelte:component this={Toaster} position="top-right" expand={false} richColors closeButton />
{/if}
```

**Why client-side only?** svelte-sonner imports `.svelte` files during SSR, causing `ERR_UNKNOWN_FILE_EXTENSION`. Loading in `onMount()` avoids this.

**Usage** (anywhere in app):

```typescript
import { toast } from '$lib/utils/toast';

// Success
toast.success('Organization created!');

// Error
toast.error('Failed to save changes');

// Warning
toast.warning('Changes not saved');

// Info
toast.info('Syncing with server...');

// Loading (with manual dismiss)
const toastId = toast.loading('Processing...', { id: 'process-toast' });
// Later: toast.dismiss(toastId);

// Promise (auto-updates based on state)
toast.promise(saveData(), {
	loading: 'Saving...',
	success: 'Saved successfully!',
	error: 'Failed to save'
});
```

**Custom Durations**:

```typescript
toast.success('Quick message', { duration: 2000 }); // 2s
toast.error('Important error', { duration: 5000 }); // 5s (errors stay longer)
toast.info('Read this', { duration: Infinity }); // Manual dismiss only
```

**Design Principles**:

- ✅ **Accessible by default**: ARIA labels, keyboard dismissible (ESC)
- ✅ **Consistent**: Uses `richColors` for semantic color coding (green=success, red=error)
- ✅ **Non-blocking**: Positioned top-right, auto-dismisses
- ✅ **Minimal cognitive load**: Max 1 toast visible at once (`expand={false}`)
- ✅ **Close button**: Always visible for user control

**When to Use**:

| Feedback Type                | Use Toast             | Alternative                |
| ---------------------------- | --------------------- | -------------------------- |
| Success confirmation         | ✅ Yes                | -                          |
| Error during async operation | ✅ Yes                | Modal (if action required) |
| Form validation error        | ❌ No                 | Inline validation          |
| Loading >2s                  | ✅ Yes (with promise) | Progress bar               |
| Loading <2s                  | ❌ No                 | Optimistic UI              |
| Delete confirmation          | ❌ No                 | Modal or inline confirm    |

**Duration Guidelines**:

- **Success**: 3s (default)
- **Error**: 4s (slightly longer to read)
- **Warning**: 3.5s
- **Info**: 3s
- **Loading**: Infinite (manual dismiss or promise resolution)

**Styling**:

- Uses `richColors` prop for semantic colors
- Inherits from design tokens (no custom CSS needed)
- Respects user's dark/light mode preference

**Why This Library**:

- ✅ Built for Svelte 5 (native runes)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Lightweight (~2KB)
- ✅ Promise support
- ✅ Customizable

**Apply when**: Need to notify users of async operation results, errors, or state changes  
**Related**: #L280 (Visual Feedback), design-principles.md (Accessibility First)

---

## #L1950: Contextual Loading Overlay with Progressive Messaging [🟢 REFERENCE]

**Symptom**: Generic "Loading..." messages feel unpolished, users uncertain what's happening  
**Root Cause**: Static loading text without context or progress indication  
**Fix**:

**Component Pattern** (`WorkspaceSwitchOverlay.svelte`):

```svelte
<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		show = false,
		workspaceName = 'workspace',
		workspaceType = 'personal' as 'personal' | 'organization'
	}: {
		show?: boolean;
		workspaceName?: string;
		workspaceType?: 'personal' | 'organization';
	} = $props();

	let stage = $state(0);

	// Main title showing the action
	const titleText = $derived(() => {
		return workspaceType === 'personal'
			? `Loading ${workspaceName}'s workspace`
			: `Loading ${workspaceName}`;
	});

	// Detailed progress steps - varied, actionable verbs
	const getStageMessage = (stageNum: number) => {
		if (stageNum === 0) {
			return workspaceType === 'personal' ? 'Gathering user data' : 'Gathering organization data';
		}
		if (stageNum === 1) {
			return workspaceType === 'personal'
				? 'Fetching your notes and highlights'
				: 'Syncing workspace settings';
		}
		return 'Preparing workspace';
	};

	// Progressive timing (1.5s, 3.5s intervals)
	$effect(() => {
		if (!show) {
			stage = 0;
			return;
		}
		stage = 0;
		const timer1 = setTimeout(() => {
			stage = 1;
		}, 1500);
		const timer2 = setTimeout(() => {
			stage = 2;
		}, 3500);
		return () => {
			clearTimeout(timer1);
			clearTimeout(timer2);
		};
	});

	const currentStageText = $derived(getStageMessage(stage));
</script>

{#if show}
	<div
		class="via-base fixed inset-0 z-50 flex items-center
		       justify-center bg-gradient-to-br from-accent-primary/10 to-accent-primary/5
		       backdrop-blur-xl"
		in:fade={{ duration: 0 }}
		out:fade={{ duration: 300 }}
	>
		<div class="flex flex-col items-center gap-content-section">
			<div class="relative h-12 w-12">
				<div
					class="absolute inset-0 animate-spin rounded-full border-4
				            border-border-base border-t-accent-primary"
				></div>
			</div>
			<div class="max-w-md text-center">
				<h2 class="text-2xl font-semibold text-primary">{titleText()}</h2>
			</div>
			<div class="text-center">
				<p class="text-sm text-secondary">{currentStageText}</p>
			</div>
		</div>
	</div>
{/if}
```

**Instant Display Pattern** (show before async action):

```typescript
// Sidebar.svelte - show overlay BEFORE API call/redirect
let accountSwitchOverlay = $state({
	show: false,
	targetName: null
});

onSwitchAccount={(targetUserId, redirectTo) => {
	const targetAccount = linkedAccounts.find(a => a.userId === targetUserId);
	const targetName = targetAccount?.firstName || targetAccount?.email;

	// Show overlay IMMEDIATELY (no delay)
	accountSwitchOverlay.show = true;
	accountSwitchOverlay.targetName = targetName;

	// Then perform async action
	authSession.switchAccount(targetUserId, redirectTo);
}}
```

**Prevent Flash on Page Reload** (inline script technique):

```html
<!-- app.html - Inject overlay BEFORE Svelte loads -->
<script>
	// Similar to theme FOUC prevention
	(function () {
		try {
			const switchingData = sessionStorage.getItem('switchingAccount');
			if (switchingData) {
				const data = JSON.parse(switchingData);
				const accountName = data.accountName || 'workspace';

				// Inject static overlay on DOMContentLoaded
				document.addEventListener('DOMContentLoaded', function () {
					const overlay = document.createElement('div');
					overlay.id = '__switching-overlay';
					overlay.innerHTML = `
						<div style="position: fixed; inset: 0; z-index: 9999; 
						            display: flex; align-items: center; justify-content: center;
						            background: linear-gradient(...); backdrop-filter: blur(24px);">
							<!-- Static spinner and text -->
							<h2>Loading ${accountName}'s workspace</h2>
						</div>
					`;
					document.body.appendChild(overlay);
					window.__hasStaticOverlay = true;
				});
			}
		} catch (e) {
			console.warn('Could not check switching state', e);
		}
	})();
</script>
```

```typescript
// +layout.svelte - Clean up static overlay when Svelte takes over
onMount(() => {
	if (window.__hasStaticOverlay) {
		const staticOverlay = document.getElementById('__switching-overlay');
		if (staticOverlay) {
			staticOverlay.remove();
		}
		delete window.__hasStaticOverlay;
	}
	// ... rest of onMount logic
});
```

**Key Principles**:

1. **Contextual Title**: Action-oriented ("Loading Saprolab" not "Saprolab")
2. **Progressive Stages**: Varied verbs (Gathering → Syncing → Preparing)
3. **Instant Feedback**: Show before async action, not after
4. **Zero Flash on Reload**: Inline script injects overlay before Svelte loads
5. **Workspace Context**: Different messages for personal vs organization
6. **Minimum Duration**: 5 seconds minimum for polish (prevents flash)
7. **Smooth Transitions**: Instant in (0ms), gradual out (300ms)
8. **Seamless Handoff**: Static overlay → Svelte reactive overlay with no gap

**Why This Works**:

- Removes redundancy (title ≠ subtitle)
- Creates sense of progress (3 distinct stages)
- Builds confidence (users see what's happening)
- Feels intentional (minimum duration prevents jarring flash)
- Zero visual discontinuity (inline script = same technique as theme FOUC)
- Continuous overlay from click → 5 seconds → completion

**Apply when**: Long-running operations (workspace switching, account changes, data migrations)  
**Related**: #L280 (Visual Feedback), #L480 (Command Palette), #L1660 (Toast Notifications), #L2200 (Reusable Loading Overlay)

---

## #L2200: Reusable Loading Overlay with Higher Z-Index [🟡 IMPORTANT]

**Symptom**: Loading overlay appears below toast notifications, overlay needs different messages for different flows  
**Root Cause**: Hardcoded overlay component with low z-index, not reusable across flows  
**Fix**:

**Reusable Component Pattern** (`LoadingOverlay.svelte`):

```svelte
<script lang="ts">
	import { fade } from 'svelte/transition';

	export type LoadingFlow =
		| 'account-registration'
		| 'account-linking'
		| 'workspace-creation'
		| 'workspace-switching'
		| 'workspace-joining'
		| 'onboarding'
		| 'custom';

	let {
		show = false,
		flow = 'custom' as LoadingFlow,
		title = '',
		subtitle = '',
		customStages = [] as string[]
	}: {
		show?: boolean;
		flow?: LoadingFlow;
		title?: string;
		subtitle?: string;
		customStages?: string[];
	} = $props();

	// Flow-specific configurations
	const flowConfigs = {
		'account-registration': {
			title: (name: string) => `Setting up ${name}'s account`,
			stages: [
				'Creating your account',
				'Preparing your workspace',
				'Setting up your first workspace'
			]
		},
		'workspace-creation': {
			title: (name: string) => `Creating ${name}`,
			stages: ['Setting up workspace', 'Configuring permissions', 'Preparing workspace']
		}
		// ... other flows
	};

	const config = $derived(flowConfigs[flow]);
	const displayTitle = $derived(title || config.title(subtitle || 'workspace'));
	const stages = $derived(customStages.length > 0 ? customStages : config.stages);
</script>

{#if show}
	<!-- z-[9999] ensures it's above toasts (which typically use z-50) -->
	<div
		class="via-base fixed inset-0 z-[9999] flex items-center
		       justify-center bg-gradient-to-br from-accent-primary/10 to-accent-primary/5
		       backdrop-blur-xl"
		in:fade={{ duration: 0 }}
		out:fade={{ duration: 300 }}
	>
		<!-- Spinner + title + progressive stages -->
	</div>
{/if}
```

**Composable Pattern** (`useLoadingOverlay.svelte.ts`):

```typescript
export function useLoadingOverlay() {
	const state = $state({
		show: false,
		flow: 'custom' as LoadingFlow,
		title: '',
		subtitle: '',
		customStages: [] as string[]
	});

	function showOverlay(config: {
		flow?: LoadingFlow;
		title?: string;
		subtitle?: string;
		customStages?: string[];
	}) {
		if (!browser) return;
		state.show = true;
		state.flow = config.flow ?? 'custom';
		state.title = config.title ?? '';
		state.subtitle = config.subtitle ?? '';
		state.customStages = config.customStages ?? [];
	}

	function hideOverlay() {
		if (!browser) return;
		state.show = false;
	}

	return {
		get show() {
			return state.show;
		},
		get flow() {
			return state.flow;
		},
		// ... other getters
		showOverlay,
		hideOverlay
	};
}
```

**Usage in Layout** (`+layout.svelte`):

```typescript
const loadingOverlay = useLoadingOverlay();
setContext('loadingOverlay', loadingOverlay);
```

```svelte
<LoadingOverlay
	show={loadingOverlay.show}
	flow={loadingOverlay.flow}
	title={loadingOverlay.title}
	subtitle={loadingOverlay.subtitle}
	customStages={loadingOverlay.customStages}
/>
```

**Usage in Flows**:

```typescript
// Account registration
loadingOverlay.showOverlay({
	flow: 'account-registration',
	subtitle: firstName || email
});

// Workspace creation
loadingOverlay.showOverlay({
	flow: 'workspace-creation',
	subtitle: workspaceName
});

// Custom flow
loadingOverlay.showOverlay({
	flow: 'custom',
	title: 'Custom Title',
	customStages: ['Step 1', 'Step 2', 'Step 3']
});
```

**Key Principles**:

1. **Higher Z-Index**: Use `z-[9999]` to ensure overlay appears above toasts (`z-50`)
2. **Flow-Based Messages**: Pre-configured messages per flow type (registration, linking, creation, etc.)
3. **Context-Aware**: Works in authenticated and non-authenticated contexts
4. **Centralized State**: Single composable manages overlay state globally
5. **Progressive Stages**: Each flow has 3 stages that progress over time
6. **Error Handling**: Hide overlay on errors to prevent stuck states

**Why This Works**:

- **Single Source of Truth**: One component handles all loading states
- **Consistent UX**: Same visual treatment across all flows
- **Easy to Extend**: Add new flows by updating `flowConfigs`
- **Above Everything**: Higher z-index ensures overlay is always visible
- **Context-Aware**: Can be used from any component via context

**Apply when**: Need loading overlay for account operations, workspace operations, or any long-running async action  
**Related**: #L1950 (Contextual Loading Overlay), #L1660 (Toast Notifications), #L280 (Visual Feedback)

---

## #L2000: Delightful Error States with Countdown Timer [🟢 REFERENCE]

**Symptom**: Rate limit errors shown as generic gray info boxes  
**Root Cause**: Missing error color tokens + no progress indication  
**Fix**:

```svelte
<!-- ❌ WRONG: Generic blue info box with static message -->
<div class="border-accent-primary bg-hover-solid text-primary">
  Too many requests. Please wait 52 seconds.
</div>

<!-- ✅ CORRECT: Red error box with live countdown -->
<script lang="ts">
  import RateLimitError from '$lib/components/ui/RateLimitError.svelte';

  let isRateLimited = $state(false);
  let rateLimitRetryAfter = $state(0);

  // On 429 response:
  if (response.status === 429) {
    isRateLimited = true;
    rateLimitRetryAfter = parseInt(data.retryAfter || '60');
  }
</script>

{#if isRateLimited}
  <RateLimitError
    retryAfter={rateLimitRetryAfter}
    actionLabel="logging in"  <!-- "creating accounts", "uploading files", etc. -->
  />
{/if}
```

**Design System Setup**:

```css
/* src/app.css - Error color tokens */
@theme {
	/* Light mode */
	--color-error-bg: oklch(97% 0.013 25);
	--color-error-border: oklch(64.8% 0.294 27.325);
	--color-error-text: oklch(50% 0.227 27.325);
	--color-error-text-secondary: oklch(41.2% 0.2 27.325);
}

/* Dark mode overrides */
html.dark {
	--color-error-bg: oklch(25% 0.05 27.325 / 0.3);
	--color-error-border: oklch(64.8% 0.294 27.325);
	--color-error-text: oklch(87.2% 0.204 27.271);
	--color-error-text-secondary: oklch(87.2% 0.204 27.271);
}

/* Utility classes */
@utility bg-error {
	background-color: var(--color-error-bg);
}
@utility border-error {
	border-color: var(--color-error-border);
}
@utility text-error {
	color: var(--color-error-text);
}
@utility text-error-secondary {
	color: var(--color-error-text-secondary);
}
```

**Component Implementation** (`src/lib/components/ui/RateLimitError.svelte`):

```svelte
<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		retryAfter: number; // seconds
		message?: string;
		actionLabel?: string;
	}

	let { retryAfter, message, actionLabel = 'making requests' }: Props = $props();
	let timeRemaining = $state(retryAfter);

	onMount(() => {
		const intervalId = setInterval(() => {
			timeRemaining--;
			if (timeRemaining <= 0) clearInterval(intervalId);
		}, 1000);

		return () => clearInterval(intervalId);
	});

	const defaultMessage = $derived(`Whoa, slow down! You've tried ${actionLabel} too many times.`);
</script>

<div class="rounded-input border border-error bg-error px-input-x py-input-y">
	<div class="flex items-start gap-icon">
		<!-- Warning icon -->
		<svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-error">...</svg>

		<div class="flex-1">
			<p class="text-sm font-medium text-error-secondary">
				{message || defaultMessage}
			</p>

			{#if timeRemaining > 0}
				<p class="mt-1 text-sm text-error">
					Please wait <span class="font-semibold tabular-nums">{timeRemaining}</span>
					{timeRemaining === 1 ? 'second' : 'seconds'} before trying again.
				</p>
			{:else}
				<p class="mt-1 text-sm text-error">You can try again now!</p>
			{/if}
		</div>
	</div>
</div>
```

**Why**:

- **Red = Error** (universal warning signal, not blue/gray info)
- **Live Countdown** (shows progress, reduces frustration)
- **Delight Factor** (unexpected animation creates positive emotion)
- **Clear Hierarchy** (error icon + bold primary message)

**Design Principles Applied**:

- **Delight in Details** - Countdown timer exceeds user expectations
- **Outcomes Over Outputs** - User understands when to retry (outcome), not just "error shown" (output)
- **Design System** - Reusable tokens enable consistent error states app-wide

**UX Best Practices**:

- Place errors **above form buttons** (natural reading order)
- Use `tabular-nums` for countdown (prevents layout shift)
- Show completion message ("You can try again now!")
- Accessible (semantic HTML, screen reader friendly)

**Reusability**:

```svelte
<!-- Login rate limit -->
<RateLimitError retryAfter={60} actionLabel="logging in" />

<!-- File upload limit -->
<RateLimitError retryAfter={30} actionLabel="uploading files" />

<!-- API rate limit -->
<RateLimitError retryAfter={120} actionLabel="making API requests" />
```

**Apply when**: Any rate-limited action (auth, API calls, file uploads, search queries)  
**Related**: #L280 (Visual Feedback), #L1660 (Toast Notifications), #L1950 (Contextual Loading)

---

## #L2750: E2E Testing Bits UI PinInput Components [🔴 CRITICAL]

**Symptom**: Playwright E2E test fails with "Test timeout exceeded" when trying to fill Bits UI PinInput fields  
**Root Cause**: Bits UI PinInput renders a hidden `<input>` element with `[data-pin-input-input]` attribute that handles all input. The visible cells are display-only divs that intercept pointer events  
**Solution**: Target the hidden input element directly instead of clicking visual cells

```typescript
// ❌ WRONG: Try to click individual cells (fails - cells intercept pointer events)
const pinInputs = page.locator('input[type="text"], input[type="number"]');
for (let i = 0; i < 6; i++) {
  await pinInputs.nth(i).fill(code[i]);
}

// ❌ WRONG: Try to click visual cells with data-testid (fails - hidden input intercepts)
const cell = page.locator('[data-testid="pin-input-cell-0"]');
await cell.click();
await cell.pressSequentially(code[0]);

// ✅ CORRECT: Target the hidden input element directly
const hiddenInput = page.locator('[data-pin-input-input]');
await hiddenInput.fill(code); // Enter all 6 digits at once
```

**Bits UI PinInput DOM Structure**:
```html
<div data-pin-input-root>
  <!-- Hidden input handles all keyboard input -->
  <input 
    data-pin-input-input 
    maxlength="6" 
    pattern="^\d+$" 
    inputmode="numeric" 
    autocomplete="one-time-code"
  />
  
  <!-- Visual cells for display only -->
  <div data-pin-input-cell data-testid="pin-input-cell-0">1</div>
  <div data-pin-input-cell data-testid="pin-input-cell-1">2</div>
  <!-- ... -->
</div>
```

**Why**:
- Bits UI uses single hidden input for accessibility (screen readers, autocomplete)
- Visual cells are presentational only
- Clicking cells fails because hidden input intercepts pointer events
- `.fill()` bypasses click detection and types directly into input

**Common Mistake**: Adding `data-testid` to cells and clicking them
- ❌ Cells don't accept input (they're `<div>` elements)
- ❌ Hidden input intercepts all clicks
- ✅ Use `[data-pin-input-input]` selector (Bits UI's native attribute)

**Related Test Fixes**:
If test also fails with backend validation errors (e.g., `lastName cannot be null`):
```typescript
// ✅ Fill ALL required form fields in tests
await page.fill('input[name="firstName"]', 'Test');
await page.fill('input[name="lastName"]', 'User'); // Don't forget!
```

**Apply when**: 
- E2E testing verification codes (email, SMS, 2FA)
- Testing Bits UI PinInput component
- Test times out searching for `input[type="text"]` or similar

**Testing Best Practices**:
1. Use native Bits UI attributes (`[data-pin-input-input]`) over custom test IDs
2. Type all digits at once with `.fill()` for speed
3. Verify complete registration/verification flows end-to-end

**Related**: #L250 (E2E test selectors), ci-cd.md#L280 (E2E environment setup), ci-cd.md#L290 (Playwright authentication)

---

## #L2800: Inline CRUD Form with Hover Actions [🟢 REFERENCE]

**Symptom**: Need add/edit/delete functionality in a list without separate modals  
**Root Cause**: Inline forms reduce friction and keep context visible  
**Fix**:

```svelte
<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/convex';
	
	const convexClient = browser ? useConvexClient() : null;
	const items = useQuery(api.items.list, () => ({ filter: 'active' }));
	
	// Single $state object for all form state
	const state = $state({
		isAdding: false,
		editingId: null as Id<'items'> | null,
		newTitle: '',
		editTitle: '',
		hoveredId: null as Id<'items'> | null
	});
	
	async function handleCreate() {
		await convexClient.mutation(api.items.create, {
			title: state.newTitle.trim()
		});
		state.isAdding = false;
		state.newTitle = '';
	}
	
	async function handleUpdate(itemId: Id<'items'>) {
		await convexClient.mutation(api.items.update, {
			itemId,
			title: state.editTitle.trim()
		});
		state.editingId = null;
	}
</script>

{#if state.isAdding}
	<div class="rounded-md border-2 border-accent-primary bg-elevated p-4">
		<input bind:value={state.newTitle} placeholder="Title..." />
		<button onclick={handleCreate}>Create</button>
		<button onclick={() => { state.isAdding = false; }}>Cancel</button>
	</div>
{:else}
	<button onclick={() => { state.isAdding = true; }}>Add Item</button>
{/if}

{#each items ?? [] as item (item._id)}
	<div
		role="region"
		aria-label="Item card"
		onmouseenter={() => { state.hoveredId = item._id; }}
		onmouseleave={() => { state.hoveredId = null; }}
	>
		{#if state.editingId === item._id}
			<!-- Edit mode -->
			<input bind:value={state.editTitle} />
			<button onclick={() => handleUpdate(item._id)}>Save</button>
		{:else}
			<!-- View mode -->
			<h5>{item.title}</h5>
			
			{#if state.hoveredId === item._id}
				<button onclick={() => { state.editingId = item._id; state.editTitle = item.title; }}>
					Edit
				</button>
				<button onclick={() => convexClient.mutation(api.items.remove, { itemId: item._id })}>
					Delete
				</button>
			{/if}
		{/if}
	</div>
{/each}
```

**Pattern Benefits**:
- ✅ No modals - keep context visible
- ✅ Immediate visual feedback (border highlight on add form)
- ✅ Hover-based actions reduce visual clutter
- ✅ Single `$state` object pattern (Svelte 5 best practice)
- ✅ Inline edit preserves list position
- ✅ ARIA roles for accessibility

**Polymorphic Assignment Extension** (for items with multiple assignee types):

```svelte
<script lang="ts">
	const state = $state({
		isAdding: false,
		assigneeType: 'user' as 'user' | 'role',
		assigneeUserId: null as Id<'users'> | null,
		assigneeRoleId: null as Id<'circleRoles'> | null
	});

	// Query options for both types
	const usersQuery = useQuery(api.organizations.getMembers, () => ({
		sessionId,
		organizationId
	}));

	const rolesQuery = circleId
		? useQuery(api.circleRoles.listByCircle, () => ({
				sessionId,
				circleId
			}))
		: null;

	const users = $derived(usersQuery?.data ?? []);
	const roles = $derived(rolesQuery?.data ?? []);
</script>

<!-- Assignee Type Toggle (only if roles available) -->
{#if roles.length > 0}
	<button onclick={() => (state.assigneeType = state.assigneeType === 'user' ? 'role' : 'user')}>
		{state.assigneeType === 'user' ? '👤 User' : '🎭 Role'}
	</button>
{/if}

<!-- Conditional Dropdown -->
{#if state.assigneeType === 'user'}
	<select bind:value={state.assigneeUserId}>
		<option value={null}>Select user...</option>
		{#each users as user (user.userId)}
			<option value={user.userId}>{user.name}</option>
		{/each}
	</select>
{:else}
	<select bind:value={state.assigneeRoleId}>
		<option value={null}>Select role...</option>
		{#each roles as role (role.roleId)}
			<option value={role.roleId}>{role.name}</option>
		{/each}
	</select>
{/if}
```

**Use polymorphic assignment when**:
- Assigning tasks to users OR organizational roles (action items, responsibilities)
- Supporting future flexibility (circles, teams, etc.)
- Schema has `assigneeType` + multiple optional ID fields

**Apply when**: Building CRUD interfaces where users need to see context (meetings, notes, decisions, comments, action items)  
**Related**: #L170 (Edit/view modes), #L220 (Card removal patterns), #L830 (Linear-style compact design), convex-integration.md#L1650 (useConvexClient)

---

## #L3120: Multi-Select Combobox with "Add More" Button [🟡 IMPORTANT]

**Symptom**: Users can't add more items after initial selection - combobox trigger disappears when items are selected  
**Root Cause**: Combobox trigger button only shown when selection is empty, no way to reopen dropdown  
**Fix**:

```svelte
<!-- ✅ CORRECT: Show "Add" button next to selected chips -->
{#if selectedItems.length > 0}
	<div class="flex flex-wrap items-center gap-2">
		{#each selectedItems as item (item.id)}
			<!-- Selected chip with remove button -->
			<div class="inline-flex items-center gap-2 rounded-md border border-border-base bg-surface-base px-2 py-1 text-sm">
				<span>{item.name}</span>
				<button
					type="button"
					onclick={() => removeItem(item)}
					class="ml-1 rounded p-0.5 text-text-tertiary hover:text-text-primary"
					aria-label={`Remove ${item.name}`}
				>
					<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/each}
		<!-- Add more button - always visible when items selected -->
		<button
			type="button"
			onclick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				comboboxOpen = true;
			}}
			class="inline-flex items-center gap-1.5 rounded-md border border-border-base bg-surface-base px-2 py-1 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
			aria-label="Add more items"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			<span>Add</span>
		</button>
	</div>
{/if}

<!-- Combobox with anchor for positioning -->
<Combobox.Root bind:open={comboboxOpen}>
	{#if selectedItems.length === 0}
		<!-- Empty state: full trigger button -->
		<div class="relative" bind:this={inputRef}>
			<button
				type="button"
				onclick={() => (comboboxOpen = true)}
				class="flex w-full items-center gap-icon rounded-md border border-border-base bg-surface-base px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				<span>Add items</span>
			</button>
		</div>
	{:else}
		<!-- Anchor element when items exist (for dropdown positioning) -->
		<div class="relative" bind:this={inputRef} aria-hidden="true"></div>
	{/if}

	<Combobox.Portal>
		<Combobox.Content customAnchor={inputRef} side="bottom" align="start">
			<!-- Search input and options -->
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>
```

**Key Points**:

1. **Selected chips** - Show inline with remove buttons
2. **"Add" button** - Always visible next to chips when items selected
3. **Anchor element** - Empty div for dropdown positioning when items exist
4. **Conditional trigger** - Full button when empty, anchor when items selected

**Why**: Users need to add/remove items after initial selection. "Add" button provides clear affordance.  
**Apply when**: Building multi-select components (attendees, tags, assignees)  
**Related**: #L10 (Interactive dropdowns), #L430 (Keyboard priority), TagSelector component pattern

---

---

## #L3200: RBAC Permission-Based UI Visibility [🟡 IMPORTANT]

**Symptom**: UI shows actions users can't perform, confusing UX, security concerns  
**Root Cause**: No permission checking in frontend, relying only on backend validation  
**Fix**:

```svelte
<script lang="ts">
	import { usePermissions } from '$lib/composables/usePermissions.svelte';
	import type { UseOrganizations } from '$lib/composables/useOrganizations.svelte';
	import { getContext } from 'svelte';
	import type { Id } from '$lib/convex';

	const organizations = getContext<UseOrganizations | undefined>('organizations');
	const getSessionId = () => $page.data.sessionId;
	const getOrganizationId = () => organizations?.activeOrganizationId ?? null;

	// Check permissions with organization context
	const permissions = usePermissions({
		sessionId: () => getSessionId() ?? null,
		organizationId: () => {
			const orgId = getOrganizationId();
			return orgId ? (orgId as Id<'organizations'>) : null;
		}
	});

	// Check if user can perform action (owner OR has permission)
	const canRemoveMembers = $derived(() => {
		// Owners can always perform action (bypass RBAC)
		if (organizations && organizations.activeOrganization?.role === 'owner') {
			return true;
		}
		// Non-owners need explicit permission
		return permissions.can('users.remove');
	});
</script>

<!-- Conditional button visibility -->
{#if member.role === 'owner'}
	<span class="text-sm text-secondary">—</span>
{:else if canRemoveMembers()}
	<button onclick={() => handleRemove(member)}>Remove</button>
{:else}
	<span class="text-sm text-secondary">—</span>
{/if}
```

**Backend Pattern** (complementary):

```typescript
// convex/organizations.ts
export const removeOrganizationMember = mutation({
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx, args.sessionId);
		
		// Check if user is owner (owners bypass RBAC)
		const userMembership = await ctx.db
			.query('organizationMembers')
			.withIndex('by_organization_user', (q) =>
				q.eq('organizationId', args.organizationId).eq('userId', userId)
			)
			.first();
		
		const isOwner = userMembership?.role === 'owner';
		
		// Only check RBAC if not owner
		if (!isOwner) {
			await requirePermission(ctx, userId, 'users.remove', {
				organizationId: args.organizationId
			});
		}
		
		// ... rest of mutation
	}
});
```

**Key Principles**:

1. **Owner Bypass**: Organization owners can always perform actions (bypass RBAC)
2. **Permission Context**: Pass `organizationId` or `teamId` to `usePermissions` for scoped permissions
3. **Reactive Checks**: Use `$derived` for permission checks that update when context changes
4. **UI + Backend**: Frontend hides buttons, backend validates (defense in depth)
5. **Graceful Degradation**: Show "—" or hide action when user lacks permission

**Why**: 
- Better UX (users don't see actions they can't use)
- Security (defense in depth - UI + backend validation)
- Extensible (change permissions in RBAC, UI updates automatically)

**Apply when**: Building admin interfaces, member management, resource actions  
**Related**: #L170 (Edit/view modes), convex-integration.md#L1175 (RBAC test patterns), `src/lib/composables/usePermissions.svelte.ts`  
**Reference**: `src/routes/(authenticated)/org/members/+page.svelte` (member removal with RBAC)

---

## #L3300: Email Validation with TLD Check [🟡 IMPORTANT]

**Symptom**: HTML5 email validation accepts invalid emails like `asdfasdf@asdfasdf` (no TLD)  
**Root Cause**: Browser `type="email"` only checks for `@` symbol, not valid domain structure  
**Fix**:

```svelte
<script lang="ts">
	let email = $state('');
	let emailError = $state<string | null>(null);

	// Email validation: requires valid domain with TLD (at least 2 chars)
	const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z0-9]{2,}$/;

	function validateEmail(emailValue: string): boolean {
		if (!emailValue.trim()) {
			emailError = 'Email is required';
			return false;
		}
		if (!emailRegex.test(emailValue.trim())) {
			emailError = 'Please enter a valid email address';
			return false;
		}
		emailError = null;
		return true;
	}
</script>

<input
	type="email"
	class="w-full rounded-md border px-nav-item py-nav-item text-sm text-primary focus:outline-none"
	class:border-base={!emailError}
	class:border-error={!!emailError}
	class:bg-elevated={!emailError}
	class:bg-error={!!emailError}
	class:focus:border-accent-primary={!emailError}
	class:focus:border-error={!!emailError}
	bind:value={email}
	onblur={() => validateEmail(email)}
	oninput={() => {
		if (emailError) validateEmail(email);
	}}
	required
/>
{#if emailError}
	<span class="text-sm text-error">{emailError}</span>
{/if}
```

**Backend Validation** (security layer):

```typescript
// convex/organizations.ts
if (args.email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z0-9]{2,}$/;
	if (!emailRegex.test(args.email.trim())) {
		throw new Error('Invalid email format. Please enter a valid email address.');
	}
}
```

**Why**: Frontend validation improves UX (immediate feedback), backend validation prevents security issues.  
**Apply when**: Email input fields (invites, registration, contact forms)  
**Related**: #L2000 (Error state design tokens), #L10 in convex-integration.md (Validation patterns)

**Source**: SYOS-211 (Member Invite Modal)

---

## #L3350: Inline Form Error Display Pattern [🟡 IMPORTANT]

**Symptom**: Errors only shown in toast, user doesn't see which field has the problem  
**Root Cause**: Error handling only at mutation level, not form field level  
**Fix**:

```svelte
<script lang="ts">
	let emailError = $state<string | null>(null);

	async function handleInvite() {
		const trimmedEmail = email.trim();
		if (!validateEmail(trimmedEmail)) return;

		try {
			const code = await members.inviteMember(trimmedEmail);
			// Success...
		} catch (error) {
			// Error already handled by composable toast
			// Also set inline error for better UX
			if (error instanceof Error && error.message.includes('already exists')) {
				emailError = 'This user has already been invited';
			}
			console.error('Failed to create invite:', error);
		}
	}
</script>

<!-- Error state styling -->
<input
	class:border-error={!!emailError}
	class:bg-error={!!emailError}
	class:focus:border-error={!!emailError}
/>
{#if emailError}
	<span class="text-sm text-error">{emailError}</span>
{/if}
```

**Why**: Dual feedback (toast + inline) provides better UX - toast for visibility, inline for context.  
**Apply when**: Form submissions with field-specific errors  
**Related**: #L2000 (Error state design tokens), #L1660 (Toast notifications)

**Source**: SYOS-211 (Member Invite Modal)

---

## #L3400: Org-Scoped URLs Must Include `?org={id}` Parameter [🟡 IMPORTANT]

**Symptom**: Redirecting to `/org/{organizationId}` results in 404 - route doesn't exist  
**Root Cause**: Organization routes use query parameter pattern (`/org/circles?org={id}`), not dynamic route segments  
**Fix**:

```typescript
// ❌ WRONG: Non-existent route
await goto(resolveRoute(`/org/${organizationId}`)); // 404 error

// ❌ WRONG: Missing org param (not shareable)
await goto(resolveRoute(`/org/circles/${circleId}`));

// ✅ CORRECT: Use query parameter pattern for all org-scoped URLs
await goto(resolveRoute(`/org/circles?org=${organizationId}`));
await goto(resolveRoute(`/org/circles/${circleId}?org=${organizationId}`));
await goto(resolveRoute(`/org/teams/${teamId}?org=${organizationId}`));
```

**Why**: 
- The authenticated layout reads `org` from URL search params via `orgFromUrl` callback
- The `useOrganizations` composable automatically sets the active organization from the `org` query parameter
- URLs with explicit org context are shareable/bookmarkable
- Prevents race conditions where queries run before org context is set

**Apply when**: 
- Redirecting users to organizations after invite acceptance, account creation, or organization switching
- Navigating between org-scoped routes (circles, teams, members)
- Creating links in navigation components (Sidebar, breadcrumbs)

**Examples**:
```typescript
// Navigation from list to detail
function handleRowClick(circleId: string) {
  const orgId = organizationId();
  if (!orgId) return;
  goto(resolveRoute(`/org/circles/${circleId}?org=${orgId}`));
}

// Back button navigation
onclick={() => {
  const orgId = organizationId();
  if (orgId) {
    goto(resolveRoute(`/org/circles?org=${orgId}`));
  } else {
    goto(resolveRoute('/org/circles'));
  }
}}

// Sidebar links
href={resolveRoute(activeOrgId() ? `/org/circles?org=${activeOrgId()}` : '/org/circles')}
```

**Related**: #L1870 (resolveRoute pattern), #L850 in convex-integration.md (Session validation), `dev-docs/2-areas/architecture/url-patterns.md`

**Source**: SYOS-233 (Invite Acceptance Page), SYOS-235 (URL Patterns Validation)

---

## #L3500: D3 Pack Layout with Synthetic Nodes for Sibling Packing [🟡 IMPORTANT]

**Symptom**: Roles appear underneath child circles instead of alongside them in nested bubble chart  
**Root Cause**: Two-level pack layout (main for circles, separate mini-pack for roles) doesn't naturally position roles alongside child circles  
**Fix**:

```typescript
// ❌ WRONG: Separate pack layouts (roles don't pack alongside circles)
const packedCircles = packLayout(circles);
const packedRoles = packRolesInsideCircle(roles, parentRadius); // Separate pack

// ✅ CORRECT: Include roles as synthetic circle nodes in main hierarchy
export function transformToHierarchy(circles: CircleNode[]): HierarchyNode<CircleNode> {
  const childrenMap = new Map<Id<'circles'>, CircleNode[]>();
  
  // Add child circles
  circles.forEach((circle) => {
    if (circle.parentCircleId) {
      const parent = circle.parentCircleId;
      if (!childrenMap.has(parent)) {
        childrenMap.set(parent, []);
      }
      childrenMap.get(parent)!.push(circle);
    }
  });
  
  // Add roles as synthetic circle nodes (so they pack alongside child circles)
  circles.forEach((circle) => {
    if (circle.roles && circle.roles.length > 0) {
      if (!childrenMap.has(circle.circleId)) {
        childrenMap.set(circle.circleId, []);
      }
      const roleCircles: CircleNode[] = circle.roles.map((role) => ({
        circleId: `__role__${role.roleId}` as Id<'circles'>, // Synthetic ID
        organizationId: circle.organizationId,
        name: role.name,
        slug: `role-${role.roleId}`,
        parentCircleId: circle.circleId,
        memberCount: 0,
        roleCount: 0,
        createdAt: circle.createdAt,
        roles: [{ roleId: role.roleId, name: role.name }]
      }));
      childrenMap.get(circle.circleId)!.push(...roleCircles);
    }
  });
  
  // Build hierarchy with both circles and synthetic role nodes
  return d3Hierarchy(buildHierarchy(rootCircles[0]));
}

// After packing, extract role positions relative to parent
const nodesWithRoles = nodes.map((node) => {
  if (isSyntheticRole(node.data.circleId) && node.parent) {
    const parentNode = node.parent as CircleHierarchyNode;
    const roleData = node.data.roles?.[0];
    if (roleData && node.r && node.r > 0) {
      const relativeX = node.x - parentNode.x;
      const relativeY = node.y - parentNode.y;
      
      if (!parentNode.data.packedRoles) {
        parentNode.data.packedRoles = [];
      }
      
      parentNode.data.packedRoles.push({
        roleId: roleData.roleId,
        name: roleData.name,
        x: relativeX,
        y: relativeY,
        r: node.r
      });
    }
  }
  return node;
});

// Filter out synthetic roles from visible nodes (render via packedRoles)
const visibleNodes = packedNodes.filter(
  (node) => !isSyntheticRoot(node.data.circleId) && !isSyntheticRole(node.data.circleId)
);
```

**Why**: 
- D3 pack layout naturally positions siblings (children + synthetic roles) alongside each other
- Single pack layout ensures roles and child circles are positioned together within parent bounds
- Synthetic nodes allow roles to participate in main layout without breaking type system
- Extract positions after packing, filter out synthetic nodes before rendering

**Apply when**: 
- Building nested bubble charts (org charts, hierarchical visualizations)
- Need to pack different entity types (circles + roles) alongside each other
- Roles should appear next to child circles, not underneath them

**Related**: #L780 (Design tokens), D3.js pack layout documentation

**Source**: SYOS-179 (Org Chart Design)

---

---

## #L3570: D3 Pack Layout Role Sizing Based on Hierarchy Depth [🟡 IMPORTANT]

**Symptom**: Roles in nested bubble chart all appear same size, despite hierarchy depth  
**Root Cause**: D3 pack layout scales circles proportionally - with many siblings, need much larger `baseSize` values to achieve desired visual sizes  
**Fix**:

```typescript
// ❌ WRONG: Fixed size for all roles (doesn't reflect hierarchy)
if (isSyntheticRole(circle.circleId)) {
  return 15; // All roles same size
}

// ✅ CORRECT: Scale role sizes based on parent circle depth
if (isSyntheticRole(circle.circleId)) {
  // Store parent depth during hierarchy building
  let parentDepth = circle._parentDepth ?? Math.max(0, (node?.depth ?? 1) - 1);
  
  // Adjust for synthetic root (multiple root circles)
  if (node) {
    let current = node.parent;
    while (current) {
      if (isSyntheticRoot(current.data.circleId)) {
        parentDepth = Math.max(0, parentDepth - 1);
        break;
      }
      current = current.parent;
    }
  }
  
  // Base sizes: larger for higher hierarchy levels
  // D3 pack layout scales circles proportionally - with many siblings, need much larger values
  // Depth 0: Much bigger (500 → r ~80-100) - big green circle roles (11 roles need large values)
  // Depth 1: Slightly bigger (140 → r ~35-40) - sub-circle roles (circles inside green circle)
  // Depth 2: Match previous depth 1 (55 → r ~22-23) - sub-sub-circle roles
  // Depth 3+: Keep current (35 → r ~17-18) - smallest roles (good as-is)
  const baseSizes = [500, 140, 55, 35]; // depth 0, 1, 2, 3+
  const baseSize = baseSizes[Math.min(parentDepth, baseSizes.length - 1)];
  
  return baseSize;
}

// Store parent depth during hierarchy building
function buildHierarchy(circle: CircleNode, depth: number = 0): CircleNode {
  const children = childrenMap.get(circle.circleId);
  if (children) {
    const mappedChildren = children.map((child) => {
      if (isSyntheticRole(child.circleId)) {
        // Store parent depth in role node data
        return {
          ...child,
          _parentDepth: depth
        };
      }
      return buildHierarchy(child, depth + 1);
    });
    return { ...circle, children: mappedChildren };
  }
  return circle;
}
```

**Why**: 
- D3 pack layout calculates radius proportionally based on `value` parameter
- With many siblings (e.g., 11 roles), D3 scales all circles down to fit parent
- Need much larger `baseSize` values (500 vs 15) to achieve desired visual sizes
- Store `_parentDepth` during hierarchy building (not available during `root.sum()` traversal)
- Adjust for synthetic root when multiple root circles exist

**Apply when**: 
- Building nested bubble charts with roles at different hierarchy levels
- Roles should visually reflect their hierarchical position (larger = higher level)
- D3 pack layout scales circles proportionally, requiring larger values for many siblings

**Related**: #L3500 (D3 Pack Layout with Synthetic Nodes), D3.js pack layout documentation

**Source**: SYOS-179 (Org Chart Design)

---

## #L3650: Z-Index Conflicts with Bits UI Portal in Modal Panels [🔴 CRITICAL]

**Symptom**: Buttons/dropdowns in modal panels don't work, clicks don't register, menus don't open  
**Root Cause**: Z-index conflict between backdrop and Bits UI Portal content  
**Fix**:

```svelte
<!-- ❌ WRONG: Backdrop z-index conflicts with portalled dropdowns -->
{#if isOpen}
	<div class="fixed inset-0 z-[50] bg-black/50" onclick={handleClose}></div>
{/if}
<aside class="fixed top-0 right-0 z-[60] ...">
	<!-- Panel content with DropdownMenu -->
	<DropdownMenu.Portal>
		<DropdownMenu.Content class="z-50 ...">
			<!-- Dropdown content portalled to body -->
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</aside>

<!-- ✅ CORRECT: Backdrop lower than panel and dropdowns -->
{#if isOpen}
	<div class="fixed inset-0 z-40 bg-black/50" onclick={handleClose}></div>
{/if}
<aside class="fixed top-0 right-0 z-50 ...">
	<!-- Panel content with DropdownMenu -->
	<DropdownMenu.Portal>
		<DropdownMenu.Content class="z-50 ...">
			<!-- Dropdown content portalled to body -->
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</aside>
```

**Z-Index Stacking Order**:
1. **Backdrop**: `z-40` (lowest - closes panel on click)
2. **Panel**: `z-50` (middle - contains interactive elements)
3. **DropdownMenu.Content**: `z-50` (same level, portalled to body, appears above panel)

**Why**: 
- Bits UI `DropdownMenu.Portal` renders content to `document.body`, outside panel DOM tree
- If backdrop has same/higher z-index as dropdowns (`z-[50]` vs `z-50`), backdrop intercepts clicks
- Backdrop's `onclick={handleClose}` handler captures events intended for dropdowns
- Standard modal pattern: backdrop `z-40`, content `z-50`, dropdowns `z-50`

**Also Avoid**: Don't use `stopPropagation()` on panel wrapper - it breaks Bits UI event handling

```svelte
<!-- ❌ WRONG: stopPropagation() blocks Bits UI events -->
<aside>
	<div onclick={(e) => e.stopPropagation()}>
		<!-- Content -->
	</div>
</aside>

<!-- ✅ CORRECT: Z-index handles click isolation naturally -->
<aside class="z-50">
	<!-- Content - no stopPropagation needed -->
</aside>
```

**Apply when**: 
- Creating modal panels/slide-outs with Bits UI dropdowns inside
- Buttons/dropdowns don't respond to clicks
- DropdownMenu content doesn't appear or is blocked

**Related**: #L10 (Interactive Components in DropdownMenu), #L480 (Command Palette Design)

**Source**: SYOS-240 (Role Detail Panel Implementation)

---

**Pattern Count**: 37  
**Last Updated**: 2025-11-17  
**Design Token Reference**: `dev-docs/design-tokens.md`
