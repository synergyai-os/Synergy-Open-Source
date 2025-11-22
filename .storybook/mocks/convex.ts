/**
 * Mock Convex API for Storybook
 * Returns empty/no-op implementations so components can render without Convex
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const api = {} as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const internal = {} as any;
export type Id<_T extends string> = string;
export type Doc<_T extends string> = {
	_id: Id<_T>;
	_creationTime: number;
	[key: string]: unknown;
};
