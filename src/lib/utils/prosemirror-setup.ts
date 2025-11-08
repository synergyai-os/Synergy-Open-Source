/**
 * ProseMirror Editor Setup
 * 
 * Configures ProseMirror with basic schema, plugins, and commands
 */

import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { keymap } from "prosemirror-keymap";
import { history, undo, redo } from "prosemirror-history";
import { baseKeymap, toggleMark, setBlockType } from "prosemirror-commands";

/**
 * Extended schema with additional marks and nodes
 */
export const noteSchema = new Schema({
  nodes: basicSchema.spec.nodes,
  marks: basicSchema.spec.marks,
});

/**
 * Create keyboard shortcuts
 */
export function buildKeymap(schema: Schema, onEscape?: () => void) {
  const keys: { [key: string]: any } = { ...baseKeymap };

  // Bold: Cmd/Ctrl + B
  keys["Mod-b"] = toggleMark(schema.marks.strong);
  
  // Italic: Cmd/Ctrl + I
  keys["Mod-i"] = toggleMark(schema.marks.em);
  
  // Code: Cmd/Ctrl + `
  keys["Mod-`"] = toggleMark(schema.marks.code);

  // Heading 1: Cmd/Ctrl + Shift + 1
  keys["Mod-Shift-1"] = setBlockType(schema.nodes.heading, { level: 1 });
  
  // Heading 2: Cmd/Ctrl + Shift + 2
  keys["Mod-Shift-2"] = setBlockType(schema.nodes.heading, { level: 2 });
  
  // Heading 3: Cmd/Ctrl + Shift + 3
  keys["Mod-Shift-3"] = setBlockType(schema.nodes.heading, { level: 3 });

  // Paragraph: Cmd/Ctrl + Shift + 0
  keys["Mod-Shift-0"] = setBlockType(schema.nodes.paragraph);

  // Undo: Cmd/Ctrl + Z
  keys["Mod-z"] = undo;
  
  // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
  keys["Mod-Shift-z"] = redo;
  keys["Mod-y"] = redo;

  // ESC: Blur editor to allow global shortcuts
  keys["Escape"] = (state: any, dispatch: any, view: EditorView) => {
    if (view && view.dom) {
      view.dom.blur();
      // Notify parent (modal) to refocus itself
      if (onEscape) {
        setTimeout(() => onEscape(), 0);
      }
      // Returning true tells ProseMirror the event was handled and stops propagation
      return true;
    }
    return false;
  };

  return keymap(keys);
}

/**
 * Create paste handler plugin for AI content detection
 */
export function pasteHandlerPlugin(onPaste?: (text: string, view: EditorView) => void) {
  return new Plugin({
    props: {
      handlePaste(view, event) {
        if (!onPaste) return false;
        
        const text = event.clipboardData?.getData("text/plain");
        if (text && text.length > 100) { // Only detect on substantial pastes
          // Let the default paste happen first
          setTimeout(() => {
            onPaste(text, view);
          }, 10);
        }
        
        return false; // Let default paste behavior continue
      },
    },
  });
}

/**
 * Create editor state with plugins
 */
export function createEditorState(
  content?: string,
  onPaste?: (text: string, view: EditorView) => void,
  onEscape?: () => void
) {
  const doc = content 
    ? noteSchema.nodeFromJSON(JSON.parse(content))
    : noteSchema.nodes.doc.createAndFill();

  return EditorState.create({
    doc,
    plugins: [
      buildKeymap(noteSchema, onEscape),
      history(),
      pasteHandlerPlugin(onPaste),
    ],
  });
}

/**
 * Export editor content as JSON string
 */
export function exportEditorJSON(state: EditorState): string {
  return JSON.stringify(state.doc.toJSON());
}

/**
 * Check if editor is empty
 */
export function isEditorEmpty(state: EditorState): boolean {
  const doc = state.doc;
  return doc.childCount === 1 && 
         doc.firstChild?.isTextblock && 
         doc.firstChild.content.size === 0;
}

