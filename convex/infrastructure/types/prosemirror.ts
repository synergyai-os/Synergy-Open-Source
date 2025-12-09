/**
 * Minimal ProseMirror JSON node shape for server-side parsing.
 * Kept in infrastructure to avoid application-layer imports in Convex features.
 */
export type ProseMirrorNode = {
	type: string;
	attrs?: Record<string, unknown>;
	content?: ProseMirrorNode[];
	marks?: { type: string; attrs?: Record<string, unknown> }[];
	text?: string;
};
