import { ALLOWED_BASES, MODIFIER } from './config';
import type { NameClassification } from './types';

function normalizeCapitalization(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

export function parseNameClassification(name: string): NameClassification {
	if (name.startsWith(MODIFIER)) {
		const remainder = name.slice(MODIFIER.length);
		const base =
			ALLOWED_BASES.find(
				(candidate) =>
					remainder.startsWith(normalizeCapitalization(candidate)) ||
					remainder.startsWith(candidate)
			) ?? null;
		return { base, type: base ? 'ok' : 'unknown' };
	}

	if (/^listMy[A-Z]/.test(name)) return { base: 'list', type: 'modifier_order' };

	const base = ALLOWED_BASES.find((candidate) => name.startsWith(candidate)) ?? null;
	return { base, type: base ? 'ok' : 'unknown' };
}

export function isConstantName(name: string): boolean {
	return /^[A-Z][A-Z0-9_]*$/.test(name);
}
