export type ViolationType =
	| 'unknown_prefix'
	| 'modifier_order'
	| 'get_returns_nullable'
	| 'find_missing_nullable'
	| 'list_not_array'
	| 'list_returns_nullable'
	| 'bool_not_boolean'
	| 'create_not_id'
	| 'delete_prefix'
	| 'upsert_prefix';

export interface Result {
	file: string;
	line: number;
	name: string;
	violations: ViolationType[];
}

export interface NameClassification {
	base: string | null;
	type: 'ok' | 'unknown' | 'modifier_order';
}

export type NamingResult = Result;
