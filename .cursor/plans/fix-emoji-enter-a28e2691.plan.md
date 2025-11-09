<!-- a28e2691-7efc-46b1-826b-a378aa6697da f507d26b-711f-43f6-a805-916d8d7b4b7b -->
# Fix Emoji Picker Enter Key Issue

## Problem

When the emoji picker is open and you press Enter to select an emoji, the global Enter handler in `NoteDetail.svelte` interferes and breaks the flow instead of allowing the emoji to be inserted.

## Root Cause

The global keyboard event listener in `NoteDetail.svelte` (lines 22-53) captures Enter key presses to activate edit mode. It doesn't check if the emoji menu is active, so it interferes with emoji selection.

## Solution

### Update `NoteDetail.svelte`

In the `handleKeyDown` function (line 25), add a check to detect if a menu/popup is active before processing the Enter key.

**Location**: `src/lib/components/inbox/NoteDetail.svelte` around line 25-46

**Change**: Add a check for active menus/popups by:

1. Checking if an element with `role="listbox"` (the emoji menu) exists in the DOM
2. Checking if an element with class `.emoji-menu` is visible
3. If either condition is true, return early and don't process the Enter key

**Code change** (around line 38):

```typescript
// Handle Enter key to enter edit mode
if (event.key === 'Enter') {
    // Check if emoji menu or other popup menus are active
    const emojiMenuActive = document.querySelector('.emoji-menu') !== null;
    if (emojiMenuActive) return; // Let the emoji menu handle Enter
    
    event.preventDefault();
    editMode = true;
    // Focus the editor title after a tick
    setTimeout(() => {
        editorRef?.focusTitle();
    }, 0);
}
```

## Testing

After the fix:

1. Open NoteDetail
2. Type ':' to open emoji picker
3. Type a query like 'fire' to filter emojis
4. Press Enter
5. Expected: The selected emoji (🔥) should be inserted at cursor position
6. The emoji menu should close
7. You should remain in the editor with the emoji visible

## Files to Modify

- `src/lib/components/inbox/NoteDetail.svelte` (lines ~38-45)

### To-dos

- [ ] Add emoji menu detection check to NoteDetail Enter key handler
- [ ] Test emoji picker Enter key functionality