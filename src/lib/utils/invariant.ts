/**
 * Lightweight assertion helper for runtime guard clauses.
 * Throws an Error with the provided message when the condition is falsy.
 */
export function invariant(condition: unknown, message: string): asserts condition {
	if (!condition) {
		throw new Error(message);
	}
}

/**
 * Exhaustiveness check for switch statements.
 * TypeScript will error if a case is unhandled.
 */
export function assertNever(value: never, message?: string): never {
	throw new Error(message ?? `Unexpected value: ${value}`);
}
