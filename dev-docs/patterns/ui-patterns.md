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
**Related**: #L220 (Queue-based removal)

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

**Related**: #L680 (Atomic Design), #L400 (SSR browser libraries), svelte-reactivity.md#L450 ($ prefix collision)

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

**Pattern Count**: 17  
**Last Updated**: 2025-11-08  
**Design Token Reference**: `dev-docs/design-tokens.md`

