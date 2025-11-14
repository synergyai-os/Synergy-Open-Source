/**
 * ProseMirror Type Definitions
 *
 * Type definitions for ProseMirror editor state, commands, and view.
 * These types are re-exported from prosemirror packages for convenience.
 */

import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import type { Transaction } from 'prosemirror-state';
import type { Node, Schema, MarkSpec, NodeSpec } from 'prosemirror-model';

/**
 * ProseMirror command function type
 * Commands return true if they handled the action, false otherwise
 */
export type ProseMirrorCommand = (
	state: EditorState,
	dispatch?: ((tr: Transaction) => void) | null,
	view?: EditorView
) => boolean;

/**
 * ProseMirror keymap entry
 * Maps keyboard shortcuts to commands
 */
export type ProseMirrorKeymap = {
	[key: string]: ProseMirrorCommand;
};

/**
 * ProseMirror node attributes (for toDOM)
 */
export type ProseMirrorNodeAttrs = Record<string, string | undefined>;

/**
 * ProseMirror document node structure (ProseMirror JSON format)
 */
export type ProseMirrorDoc = {
	type: 'doc';
	content: ProseMirrorNode[];
};

/**
 * ProseMirror node structure (ProseMirror JSON format)
 */
export type ProseMirrorNode = {
	type: string;
	attrs?: Record<string, unknown>;
	content?: ProseMirrorNode[];
	marks?: ProseMirrorMark[];
	text?: string;
};

/**
 * ProseMirror mark structure (ProseMirror JSON format)
 */
export type ProseMirrorMark = {
	type: string;
	attrs?: Record<string, unknown>;
};

/**
 * ProseMirror paste handler function type
 */
export type ProseMirrorPasteHandler = (text: string, view: EditorView) => boolean;
