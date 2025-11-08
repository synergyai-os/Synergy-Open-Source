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
        
        // Only check when document content changes (user typing)
        if (tr.docChanged) {
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
            
            return {
              active: true,
              query,
              from: matchStart,
              to: from,
              coords: null, // Will be set by view
            };
          }
        }
        
        // Deactivate if selection changed without :
        if (!prev.active) {
          return prev;
        }
        
        const { selection, doc } = tr;
        const { from } = selection;
        const $pos = doc.resolve(from);
        const textBefore = $pos.parent.textBetween(
          Math.max(0, $pos.parentOffset - 20),
          $pos.parentOffset,
          null,
          "\ufffc"
        );
        
        if (!textBefore.includes(":")) {
          return {
            active: false,
            query: "",
            from: 0,
            to: 0,
            coords: null,
          };
        }
        
        return prev;
      },
    },
    
    props: {
      handleKeyDown(view: EditorView, event: KeyboardEvent) {
        const state = emojiPluginKey.getState(view.state);
        
        if (!state?.active) {
          return false;
        }
        
        // Prevent ProseMirror from handling these keys
        // EmojiMenu component will handle via DOM events
        if (["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(event.key)) {
          return true; // Tell ProseMirror we handled this event
        }
        
        return false;
      },
    },
  });
}

// Helper to insert emoji
export function insertEmoji(view: EditorView, emoji: string, from: number, to: number) {
  // Insert emoji and deactivate plugin
  const tr = view.state.tr
    .insertText(emoji, from, to)
    .setMeta("deactivateEmoji", true);
  
  view.dispatch(tr);
  view.focus();
}

