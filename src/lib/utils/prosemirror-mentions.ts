/**
 * ProseMirror Mention Plugin
 *
 * Handles @ mentions with dropdown menu
 */

import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Decoration, DecorationSet } from 'prosemirror-view';

export type MentionItem = {
	id: string;
	label: string;
	icon?: string;
	description?: string;
};

export type MentionPluginState = {
	active: boolean;
	range: { from: number; to: number } | null;
	query: string;
	items: MentionItem[];
};

export const mentionPluginKey = new PluginKey<MentionPluginState>('mention');

export function createMentionPlugin(
	items: MentionItem[],
	_onMentionSelect?: (item: MentionItem, view: EditorView) => void
) {
	return new Plugin<MentionPluginState>({
		key: mentionPluginKey,

		state: {
			init() {
				return {
					active: false,
					range: null,
					query: '',
					items: []
				};
			},

			apply(tr, prev) {
				const meta = tr.getMeta(mentionPluginKey);
				if (meta) {
					return meta;
				}

				// Check if @ was typed
				if (tr.docChanged) {
					const { $from } = tr.selection;
					const textBefore = $from.parent.textBetween(
						Math.max(0, $from.parentOffset - 20),
						$from.parentOffset,
						undefined,
						'\ufffc'
					);

					const match = textBefore.match(/@(\w*)$/);
					if (match) {
						const query = match[1];
						const from = $from.pos - match[0].length;
						const to = $from.pos;

						// Filter items by query
						const filteredItems = items.filter((item) =>
							item.label.toLowerCase().includes(query.toLowerCase())
						);

						return {
							active: true,
							range: { from, to },
							query,
							items: filteredItems
						};
					}
				}

				// Deactivate if selection changed without @
				if (!prev.active) {
					return prev;
				}

				const { $from } = tr.selection;
				const textBefore = $from.parent.textBetween(
					Math.max(0, $from.parentOffset - 20),
					$from.parentOffset,
					undefined,
					'\ufffc'
				);

				if (!textBefore.includes('@')) {
					return {
						active: false,
						range: null,
						query: '',
						items: []
					};
				}

				return prev;
			}
		},

		props: {
			handleKeyDown(view, event) {
				const state = mentionPluginKey.getState(view.state);
				if (!state?.active) return false;

				// Let the component handle arrow keys and enter
				if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)) {
					return true; // Prevent default, let component handle
				}

				return false;
			},

			decorations(state) {
				const pluginState = mentionPluginKey.getState(state);
				if (!pluginState?.active || !pluginState.range) {
					return DecorationSet.empty;
				}

				const decoration = Decoration.inline(pluginState.range.from, pluginState.range.to, {
					class: 'mention-query'
				});

				return DecorationSet.create(state.doc, [decoration]);
			}
		}
	});
}

/**
 * Insert a mention at the current position
 */
export function insertMention(
	view: EditorView,
	item: MentionItem,
	range: { from: number; to: number }
) {
	const { schema } = view.state;
	const mentionText = `@${item.label}`;
	const node = schema.text(mentionText);

	view.dispatch(
		view.state.tr
			.replaceWith(range.from, range.to, node)
			.insertText(' ')
			.setMeta(mentionPluginKey, {
				active: false,
				range: null,
				query: '',
				items: []
			})
	);

	view.focus();
}
