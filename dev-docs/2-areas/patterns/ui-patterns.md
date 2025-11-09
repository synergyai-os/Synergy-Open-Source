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
    <span class="font-medium text-sm text-primary">
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
<button class="p-inbox-card">  <!-- 12px padding -->
  <div class="mb-3">            <!-- 12px margin -->
    <svg class="w-4 h-4 text-secondary">...</svg>  <!-- Small icon -->
    <h3 class="text-sm font-semibold">{name}</h3>  <!-- Small text -->
  </div>
  <div class="text-sm text-secondary">{count} cards</div>
</button>

<!-- ✅ CORRECT: Generous spacing (design token mandate) -->
<button class="p-inbox-container">  <!-- 16px padding ✅ -->
  <div class="mb-4">                 <!-- 16px margin ✅ -->
    <svg class="w-5 h-5 text-accent-primary">...</svg>  <!-- Larger icon ✅ -->
    <h3 class="text-lg font-semibold text-primary">{name}</h3>  <!-- Clear hierarchy ✅ -->
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
<div class="py-system-header border-b">  <!-- Height varies -->
  <h2>Page Title</h2>
</div>

<!-- ✅ CORRECT: Fixed height + padding (design token mandate) -->
<div
  class="h-system-header py-system-header border-b border-base flex items-center justify-between flex-shrink-0"
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
<!-- ❌ WRONG: Always editable -->
<FlashcardComponent editable={true} />

<!-- ✅ CORRECT: User-controlled edit mode -->
<script>
  let editMode = $state(false);
</script>

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
    <span class="text-accent-primary font-medium">• Editing...</span>
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
// ❌ WRONG: Index-based navigation
let currentIndex = $state(0);
let approvedIndices = $state<Set<number>>(new Set());

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
  <div class="absolute inset-0 z-10 flex items-center justify-center rounded-lg
    {showFeedback === 'approved' ? 'bg-green-500/20' : 'bg-red-500/20'}">
    <svg class="w-20 h-20 {showFeedback === 'approved' ? 'text-green-500' : 'text-red-500'}">
      {#if showFeedback === 'approved'}
        <path d="M5 13l4 4L19 7" />  <!-- Checkmark -->
      {:else}
        <path d="M6 18L18 6M6 6l12 12" />  <!-- X -->
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
<div class="w-full h-full">
  <textarea class="w-full h-full" />  <!-- ❌ Constrained -->
</div>

<!-- ✅ CORRECT: Remove h-full, use field-sizing-content -->
<div class="w-full flex items-center justify-center min-w-0">
  <textarea
    class="field-sizing-content"
    style="overflow: hidden;"
  />
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
<div class="flex-1 flex items-center justify-center p-inbox-container overflow-auto">
  <div style="width: 500px; height: 700px; max-width: calc(100% - 2rem); max-height: calc(100% - 2rem);">
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
<Dialog.Overlay class="fixed inset-0 z-50 bg-overlay" />
<Dialog.Content class="fixed ... shadow-modal">
  <!-- content -->
</Dialog.Content>

<!-- ✅ CORRECT: Premium "spotlight" effect -->
<Dialog.Overlay
  class="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm 
    data-[state=open]:animate-in data-[state=closed]:animate-out 
    data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
/>
<Dialog.Content
  class="fixed left-1/2 top-1/2 z-50 max-w-[600px] -translate-x-1/2 -translate-y-1/2 
    shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out 
    data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 
    data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]"
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
  class="w-full px-4 py-2 border border-gray-300"
  placeholder="Search for something to create..."
/>

<!-- ✅ CORRECT: Premium command palette input -->
<div class="flex items-center border-b border-base/50 px-4 py-3">
  <!-- Icon on left (search/logo) -->
  <svg class="w-5 h-5 text-tertiary mr-3 flex-shrink-0">
    <!-- search icon -->
  </svg>
  
  <!-- Minimal, transparent input -->
  <Command.Input
    class="placeholder:text-tertiary bg-transparent focus:outline-hidden 
      flex-1 text-base transition-colors focus:ring-0 border-0 p-0"
    placeholder="Type a command or search..."
  />
</div>

<!-- Items with keyboard shortcuts on right -->
<Command.Item class="flex items-center justify-between px-3 py-2.5">
  <div class="flex items-center gap-icon">
    <span class="text-xl">📝</span>
    <span>Note</span>
  </div>
  <span class="text-xs text-tertiary bg-base/50 px-2 py-1 rounded font-mono">N</span>
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
  handler: () => openCreateModal(), // Same modal
});
shortcuts.register({
  key: 'c', 
  handler: () => openCreateModal(), // Same modal
});

// ✅ CORRECT: Clear separation of intent
shortcuts.register({
  key: 'n',
  handler: () => quickCreateNote(), // Direct action (fast)
  description: 'New note (quick)',
});
shortcuts.register({
  key: 'c',
  handler: () => openCommandCenter(), // Full palette (options)
  description: 'Command Center',
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
<span class="text-xs text-tertiary bg-base/50 px-2 py-1 rounded">(C)</span>

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
  isAIGenerated: noteIsAIGenerated || undefined,
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
    customCodeBlockPlugin, // ← Then custom plugins
  ],
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
--color-code-keyword: oklch(69% 0.17 10);     /* Warm red */
--color-code-string: oklch(75% 0.12 220);     /* Blue */
--color-code-function: oklch(75% 0.15 290);   /* Purple */
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
  background: #4F46E5;
  border-radius: 6px;
}
</style>

<!-- ✅ CORRECT - Design tokens via Tailwind utility classes -->
<div class="sticky top-0 z-10 bg-surface border-b border-base px-inbox-header py-system-header h-system-header flex items-center justify-between">
  <h2 class="text-sm font-normal text-secondary">{title}</h2>
  <button class="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover">
    Save
  </button>
</div>
```

**Apply when**:
- Creating new components (check existing components for patterns)
- Component has `<style>` block with custom classes
- Spacing/colors don't match rest of app

**Design Token Checklist**:
- ✅ Spacing: Use `px-inbox-header`, `py-system-header`, `gap-icon` (never `px-4`, `py-2`)
- ✅ Colors: Use `bg-surface`, `text-secondary`, `border-base` (never `#1a1a1a`, `#999`)
- ✅ Typography: Use `text-sm`, `text-label` (never `text-[14px]`)
- ✅ Border Radius: Use `rounded-md`, `rounded-input` (never `rounded-[6px]`)
- ✅ Heights: Use `h-system-header` (never `h-[64px]`)

**How to Fix**:
1. Find similar component (e.g., `ReadwiseDetail.svelte` for detail views)
2. Copy structure and token usage
3. Remove `<style>` block entirely
4. Reference `dev-docs/design-tokens.md` for token list

**Why Critical**: 
- Breaks light/dark mode consistency
- Makes global design changes impossible
- Creates maintenance debt
- New team members learn wrong patterns

**Related**: #L60 (Generous Padding), #L120 (Fixed Height Header)

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
  background: rgba(var(--color-bg-base-rgb, 255, 255, 255), 0.95); /* ❌ Overrides above, always white */
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
<nav class="sticky top-0 z-10 bg-surface border-b border-base">
  ...
</nav>

<!-- Page Header (content header) -->
<div class="sticky top-0 z-10 bg-surface border-b border-base px-inbox-header py-system-header">
  ...
</div>

<!-- Modal Header -->
<div class="bg-elevated border-b border-base px-header py-header">
  ...
</div>
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

## #L830: Compact Modal Input Design - Linear Style [🟢 REFERENCE]

**Symptom**: Modal has huge whitespace, title looks like header not input, disconnected feel  
**Root Cause**: Oversized typography (text-3xl), excessive min-heights (400px), large gaps  
**Fix**: 

```svelte
<!-- ❌ WRONG - Oversized title, massive void -->
<input
  placeholder="Untitled note..."
  class="text-3xl font-bold mb-content-spacing"
/>
<div class="min-h-[400px]">
  <Editor />
</div>

<!-- ✅ CORRECT - Compact, input-sized, tight spacing -->
<input
  placeholder="Untitled note..."
  class="text-xl font-semibold mb-3 focus:placeholder:text-surface-secondary transition-colors"
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
    const isInputFocused = activeElement?.tagName === 'INPUT' || 
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
      const isInputFocused = activeElement?.tagName === 'INPUT' || 
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
keys["Escape"] = (state, dispatch, view: EditorView) => {
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
     <div class="absolute top-4 right-4 bg-accent-primary text-white px-3 py-2 rounded-md shadow-lg">
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
   [role="dialog"]:focus-visible {
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
  ],
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
  const tr = view.state.tr
    .insertText(emoji, from, to)
    .setMeta("deactivateEmoji", true);
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
  <Breadcrumbs />  <!-- Location context -->
  <TOC />          <!-- On-page navigation -->
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
    'patterns': 'Patterns',
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
  <TableOfContents {headings} /> <!-- Floats left: 2rem -->
  
  <main class="docs-content">
    <div class="docs-content-inner">
      <Breadcrumb /> <!-- Location context -->
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

**Pattern Count**: 24  
**Last Updated**: 2025-11-09  
**Design Token Reference**: `dev-docs/design-tokens.md`

