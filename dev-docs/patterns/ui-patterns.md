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

**Pattern Count**: 9  
**Last Updated**: 2025-11-07  
**Design Token Reference**: `dev-docs/design-tokens.md`

