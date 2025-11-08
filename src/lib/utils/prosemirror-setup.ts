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
import { inputRules, wrappingInputRule, textblockTypeInputRule, InputRule } from "prosemirror-inputrules";

/**
 * Extended schema with additional marks and nodes
 */
export const noteSchema = new Schema({
  nodes: basicSchema.spec.nodes.update("code_block", {
    content: "text*",
    marks: "",
    group: "block",
    code: true,
    defining: true,
    attrs: {
      language: { default: null },
    },
    parseDOM: [
      {
        tag: "pre",
        preserveWhitespace: "full",
        getAttrs: (node) => {
          if (typeof node === "string") return null;
          const lang = node.getAttribute("data-language");
          return { language: lang };
        },
      },
    ],
    toDOM(node) {
      const attrs: any = {};
      if (node.attrs.language) {
        attrs["data-language"] = node.attrs.language;
        attrs.class = `language-${node.attrs.language}`;
      }
      return ["pre", attrs, ["code", 0]];
    },
  }),
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
 * Create markdown-style input rules
 * Allows typing markdown syntax that auto-converts to rich text
 */
export function buildInputRules(schema: Schema) {
  const rules: InputRule[] = [];

  // Heading rules: # → H1, ## → H2, ### → H3
  rules.push(textblockTypeInputRule(/^#\s$/, schema.nodes.heading, { level: 1 }));
  rules.push(textblockTypeInputRule(/^##\s$/, schema.nodes.heading, { level: 2 }));
  rules.push(textblockTypeInputRule(/^###\s$/, schema.nodes.heading, { level: 3 }));

  // Code block: ``` converts immediately, ```language converts on space/enter
  rules.push(
    new InputRule(/^```$/, (state, match, start, end) => {
      const { tr } = state;
      tr.replaceWith(
        start,
        end,
        schema.nodes.code_block.create({ language: null })
      );
      return tr;
    })
  );

  // Code block with language: ```typescript + space
  rules.push(
    new InputRule(/^```(\w+)\s$/, (state, match, start, end) => {
      const language = match[1];
      const { tr } = state;
      tr.replaceWith(
        start,
        end,
        schema.nodes.code_block.create({ language })
      );
      return tr;
    })
  );

  // Horizontal rule: --- at start of line
  if (schema.nodes.horizontal_rule) {
    rules.push(
      new InputRule(/^---$/, (state, match, start, end) => {
        const { tr } = state;
        tr.replaceWith(start - 1, end, schema.nodes.horizontal_rule.create());
        return tr;
      })
    );
  }

  // Bullet list: - or * at start of line
  rules.push(wrappingInputRule(/^\s*([-*])\s$/, schema.nodes.bullet_list));

  // Ordered list: 1. at start of line
  rules.push(wrappingInputRule(/^(\d+)\.\s$/, schema.nodes.ordered_list));

  // Blockquote: > at start of line
  if (schema.nodes.blockquote) {
    rules.push(wrappingInputRule(/^\s*>\s$/, schema.nodes.blockquote));
  }

  // Bold: **text**
  rules.push(
    new InputRule(/\*\*([^*]+)\*\*$/, (state, match, start, end) => {
      const { tr } = state;
      if (match[1]) {
        tr.replaceWith(start, end, schema.text(match[1], [schema.marks.strong.create()]));
        return tr;
      }
      return null;
    })
  );

  // Italic: *text* or _text_
  rules.push(
    new InputRule(/(?:^|[^*])(\*([^*]+)\*)$/, (state, match, start, end) => {
      const { tr } = state;
      if (match[2]) {
        const asteriskStart = start + match[0].indexOf('*');
        tr.replaceWith(asteriskStart, end, schema.text(match[2], [schema.marks.em.create()]));
        return tr;
      }
      return null;
    })
  );

  rules.push(
    new InputRule(/_([^_]+)_$/, (state, match, start, end) => {
      const { tr } = state;
      if (match[1]) {
        tr.replaceWith(start, end, schema.text(match[1], [schema.marks.em.create()]));
        return tr;
      }
      return null;
    })
  );

  // Code: `text`
  rules.push(
    new InputRule(/`([^`]+)`$/, (state, match, start, end) => {
      const { tr } = state;
      if (match[1]) {
        tr.replaceWith(start, end, schema.text(match[1], [schema.marks.code.create()]));
        return tr;
      }
      return null;
    })
  );

  // Strikethrough: ~~text~~
  if (schema.marks.strikethrough) {
    rules.push(
      new InputRule(/~~([^~]+)~~$/, (state, match, start, end) => {
        const { tr } = state;
        if (match[1]) {
          tr.replaceWith(start, end, schema.text(match[1], [schema.marks.strikethrough.create()]));
          return tr;
        }
        return null;
      })
    );
  }

  return inputRules({ rules });
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
  onEscape?: () => void,
  mentionPlugin?: Plugin,
  syntaxHighlightPlugin?: Plugin,
  codeBlockPlugin?: Plugin
) {
  const doc = content 
    ? noteSchema.nodeFromJSON(JSON.parse(content))
    : noteSchema.nodes.doc.createAndFill();

  const plugins = [
    buildInputRules(noteSchema),
    buildKeymap(noteSchema, onEscape),
    history(),
    pasteHandlerPlugin(onPaste),
  ];

  // Add syntax highlighting first (prosemirror-highlight)
  if (syntaxHighlightPlugin) {
    plugins.push(syntaxHighlightPlugin);
  }

  // Then add our custom plugins
  if (mentionPlugin) {
    plugins.push(mentionPlugin);
  }

  if (codeBlockPlugin) {
    plugins.push(codeBlockPlugin);
  }

  return EditorState.create({
    doc,
    plugins,
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

