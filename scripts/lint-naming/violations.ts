import fs from 'fs';
import path from 'path';

import {
	ALLOWLIST,
	ARRAY_GENERIC_PATTERN,
	ARRAY_TYPE_PATTERN,
	BOOLEAN_PATTERN,
	EXPORT_PATTERN,
	EXPORT_WINDOW,
	ID_PATTERN,
	INSERT_PATTERN,
	NEARBY_WINDOW,
	NULL_TYPE_PATTERN,
	QUERY_ARRAY_PATTERN,
	RETURN_BOOL_PATTERN,
	RETURN_NULL_PATTERN
} from './config';
import { parseNameClassification, isConstantName } from './classification';
import type { Result, ViolationType } from './types';

interface ExportedSymbol {
	name: string;
	line: number;
	windowText: string;
	nearbyText: string;
}

function listExportedSymbols(lines: string[]): ExportedSymbol[] {
	const symbols: ExportedSymbol[] = [];
	for (let i = 0; i < lines.length; i++) {
		const match = lines[i].match(EXPORT_PATTERN);
		if (!match) continue;
		symbols.push({
			name: match[1],
			line: i + 1,
			windowText: lines.slice(i, Math.min(lines.length, i + EXPORT_WINDOW)).join('\n'),
			nearbyText: lines.slice(i, Math.min(lines.length, i + NEARBY_WINDOW)).join(' ')
		});
	}
	return symbols;
}

function hasNullableReturn(text: string): boolean {
	return RETURN_NULL_PATTERN.test(text) || NULL_TYPE_PATTERN.test(text);
}

function hasArrayType(symbol: ExportedSymbol): boolean {
	return (
		ARRAY_TYPE_PATTERN.test(symbol.nearbyText) ||
		ARRAY_GENERIC_PATTERN.test(symbol.nearbyText) ||
		QUERY_ARRAY_PATTERN.test(symbol.windowText) ||
		symbol.windowText.includes('.collect(')
	);
}

function hasBooleanReturn(text: string): boolean {
	return BOOLEAN_PATTERN.test(text) || RETURN_BOOL_PATTERN.test(text);
}

function hasIdReference(text: string): boolean {
	return ID_PATTERN.test(text) || INSERT_PATTERN.test(text);
}

function listBaseViolations(name: string, classificationType: string): ViolationType[] {
	const violations: ViolationType[] = [];
	if (classificationType === 'unknown') violations.push('unknown_prefix');
	if (classificationType === 'modifier_order') violations.push('modifier_order');
	if (name.toLowerCase().startsWith('delete')) violations.push('delete_prefix');
	if (name.toLowerCase().startsWith('upsert')) violations.push('upsert_prefix');
	return violations;
}

function addGetViolations(
	base: string | null,
	windowText: string,
	violations: ViolationType[]
): void {
	if (base === 'get' && hasNullableReturn(windowText)) violations.push('get_returns_nullable');
}

function addFindViolations(
	base: string | null,
	windowText: string,
	violations: ViolationType[]
): void {
	if (base === 'find' && !hasNullableReturn(windowText)) violations.push('find_missing_nullable');
}

function addListViolations(
	base: string | null,
	symbol: ExportedSymbol,
	violations: ViolationType[]
): void {
	if (base !== 'list') return;
	if (!hasArrayType(symbol)) violations.push('list_not_array');
	if (hasNullableReturn(symbol.windowText)) violations.push('list_returns_nullable');
}

function addBooleanViolations(
	base: string | null,
	windowText: string,
	violations: ViolationType[]
): void {
	const isBooleanBase = base === 'is' || base === 'has' || base === 'can';
	if (isBooleanBase && !hasBooleanReturn(windowText)) violations.push('bool_not_boolean');
}

function addCreateViolations(
	base: string | null,
	windowText: string,
	violations: ViolationType[]
): void {
	if (base === 'create' && !hasIdReference(windowText)) violations.push('create_not_id');
}

function listViolationsForSymbol(symbol: ExportedSymbol): ViolationType[] {
	if (ALLOWLIST.has(symbol.name) || isConstantName(symbol.name)) return [];

	const classification = parseNameClassification(symbol.name);
	const violations = listBaseViolations(symbol.name, classification.type);
	addGetViolations(classification.base, symbol.windowText, violations);
	addFindViolations(classification.base, symbol.windowText, violations);
	addListViolations(classification.base, symbol, violations);
	addBooleanViolations(classification.base, symbol.windowText, violations);
	addCreateViolations(classification.base, symbol.windowText, violations);
	return violations;
}

export function listViolationsForFile(file: string): Result[] {
	const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
	return listExportedSymbols(lines)
		.map((symbol) => {
			const violations = listViolationsForSymbol(symbol);
			if (!violations.length) return null;
			return {
				file: path.relative(process.cwd(), file),
				line: symbol.line,
				name: symbol.name,
				violations
			};
		})
		.filter((result): result is Result => Boolean(result));
}
