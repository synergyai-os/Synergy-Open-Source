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
import { baseKeymap, toggleMark, setBlockType, chainCommands } from "prosemirror-commands";
import { inputRules, wrappingInputRule, textblockTypeInputRule, InputRule } from "prosemirror-inputrules";
import { splitListItem, liftListItem, sinkListItem, addListNodes } from "prosemirror-schema-list";

/**
 * Extended schema with additional marks and nodes
 */
export const noteSchema = new Schema({
  nodes: addListNodes(
    basicSchema.spec.nodes,
    "paragraph block*", // list_item content
    "block" // group for lists
  )
    .addToEnd("task_list", {
      group: "block",
      content: "task_item+",
      toDOM() {
        return ["ul", { class: "task-list" }, 0];
      },
      parseDOM: [{ tag: "ul.task-list" }],
    })
    .addToEnd("task_item", {
      content: "paragraph block*",
      defining: true,
      attrs: {
        checked: { default: false },
      },
      toDOM(node) {
        return [
          "li",
          { class: "task-item", "data-checked": node.attrs.checked },
          [
            "input",
            {
              type: "checkbox",
              checked: node.attrs.checked ? "checked" : undefined,
              class: "task-item-checkbox",
            },
          ],
          ["div", { class: "task-item-content" }, 0],
        ];
      },
      parseDOM: [
        {
          tag: "li.task-item",
          getAttrs(dom) {
            if (typeof dom === "string") return false;
            return {
              checked: dom.getAttribute("data-checked") === "true",
            };
          },
        },
      ],
    })
    .update("code_block", {
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
  
  // Inline Code: Cmd/Ctrl + E (overrides browser search via handleKeyDown plugin)
  keys["Mod-e"] = toggleMark(schema.marks.code);
  
  // Code: Cmd/Ctrl + ` (alternative)
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

  // List commands: Enter to continue (or normal Enter if not in list)
  keys["Enter"] = chainCommands(
    splitListItem(schema.nodes.list_item),
    baseKeymap["Enter"] // Fallback to default Enter behavior
  );
  keys["Shift-Enter"] = liftListItem(schema.nodes.list_item);
  keys["Tab"] = sinkListItem(schema.nodes.list_item);
  keys["Shift-Tab"] = liftListItem(schema.nodes.list_item);

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

  // Task list: [] or [ ] at start of line
  if (schema.nodes.task_list && schema.nodes.task_item) {
    rules.push(
      wrappingInputRule(
        /^\s*\[\s?\]\s$/,
        schema.nodes.task_list,
        undefined,
        (match, node) => ({ checked: false })
      )
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
      
      // Explicitly handle keyboard events to override browser defaults
      handleKeyDown(view, event) {
        // Force override CMD/CTRL+E for inline code (browser search/spotlight)
        if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
          event.preventDefault(); // Explicit preventDefault at DOM level
          return false; // Let keymap handle the command
        }
        return false;
      },
      
      // Handle DOM events
      handleDOMEvents: {
        click: (view: EditorView, event: Event) => {
          const target = event.target as HTMLElement;
          
          // Check if click was on a task item checkbox
          if (target.tagName === 'INPUT' && 
              target.getAttribute('type') === 'checkbox' &&
              target.classList.contains('task-item-checkbox')) {
            event.preventDefault(); // Prevent default checkbox behavior
            
            // Find the task-item element
            const taskItem = target.closest('.task-item');
            if (!taskItem) return false;
            
            // Find the task_item node in the document
            const pos = view.posAtDOM(taskItem, 0);
            if (pos === null) return false;
            
            const $pos = view.state.doc.resolve(pos);
            let taskItemNode = null;
            let taskItemPos = -1;
            
            // Search for the task_item node
            for (let depth = $pos.depth; depth >= 0; depth--) {
              const node = $pos.node(depth);
              if (node.type.name === 'task_item') {
                taskItemNode = node;
                taskItemPos = $pos.before(depth);
                break;
              }
            }
            
            if (taskItemNode && taskItemPos >= 0) {
              // Toggle the checked attribute
              const tr = view.state.tr.setNodeMarkup(
                taskItemPos,
                undefined,
                { checked: !taskItemNode.attrs.checked }
              );
              
              view.dispatch(tr);
              return true; // Event handled
            }
          }
          
          return false; // Let ProseMirror handle other clicks
        },
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
  codeBlockPlugin?: Plugin,
  emojiPlugin?: Plugin
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

  if (emojiPlugin) {
    plugins.push(emojiPlugin);
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

