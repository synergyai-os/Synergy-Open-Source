/**
 * Emoji Picker Plugin for ProseMirror
 * 
 * Triggers emoji menu on ':' input
 */

import { Plugin, PluginKey } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";

export interface EmojiPluginState {
  active: boolean;
  query: string;
  from: number;
  to: number;
  coords: { left: number; top: number } | null;
}

export const emojiPluginKey = new PluginKey<EmojiPluginState>("emoji");

export function createEmojiPlugin() {
  return new Plugin<EmojiPluginState>({
    key: emojiPluginKey,
    
    state: {
      init() {
        return {
          active: false,
          query: "",
          from: 0,
          to: 0,
          coords: null,
        };
      },
      
      apply(tr, prev) {
        // Check if plugin was explicitly deactivated
        const deactivate = tr.getMeta("deactivateEmoji");
        if (deactivate) {
          return {
            active: false,
            query: "",
            from: 0,
            to: 0,
            coords: null,
          };
        }
        
        const { selection, doc } = tr;
        const { from, to } = selection;
        
        // Only work with cursor (not selection)
        if (from !== to) {
          return prev;
        }
        
        // Get text before cursor
        const $pos = doc.resolve(from);
        const textBefore = $pos.parent.textBetween(
          Math.max(0, $pos.parentOffset - 20),
          $pos.parentOffset,
          null,
          "\ufffc"
        );
        
        // Match : followed by optional word characters
        const match = textBefore.match(/:(\w*)$/);
        
        if (match) {
          const query = match[1];
          const matchStart = from - match[0].length;
          
          console.log('🎯 Emoji plugin activated:', { query, textBefore });
          
          return {
            active: true,
            query,
            from: matchStart,
            to: from,
            coords: null, // Will be set by view
          };
        }
        
        return {
          active: false,
          query: "",
          from: 0,
          to: 0,
          coords: null,
        };
      },
    },
    
    props: {
      handleKeyDown(view: EditorView, event: KeyboardEvent) {
        const state = emojiPluginKey.getState(view.state);
        
        if (!state?.active) {
          return false;
        }
        
        // Let the EmojiMenu component handle arrow keys and Enter
        if (["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(event.key)) {
          // Prevent default to stop ProseMirror from handling
          // EmojiMenu component will handle via DOM events
          return false;
        }
        
        return false;
      },
    },
  });
}

// Helper to insert emoji
export function insertEmoji(view: EditorView, emoji: string) {
  const state = emojiPluginKey.getState(view.state);
  
  if (!state?.active) {
    return;
  }
  
  const { from, to } = state;
  const tr = view.state.tr
    .insertText(emoji, from, to)
    .setMeta("deactivateEmoji", true);
  
  view.dispatch(tr);
  view.focus();
}

