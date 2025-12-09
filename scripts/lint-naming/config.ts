import path from 'path';
import process from 'process';

export const CONVEX_ROOT = path.join(process.cwd(), 'convex');

export const ALLOWED_BASES = [
	'find',
	'get',
	'list',
	'create',
	'update',
	'archive',
	'restore',
	'start',
	'close',
	'advance',
	'submit',
	'approve',
	'reject',
	'withdraw',
	'add',
	'remove',
	'assign',
	'accept',
	'decline',
	'resend',
	'mark',
	'set',
	'import',
	'record',
	'normalize',
	'slugify',
	'calculate',
	'count',
	'describe',
	'seed',
	'reorder',
	'is',
	'has',
	'can',
	'require',
	'ensure',
	'validate',
	'assert',
	'with',
	'parse',
	'fetch'
] as const;

export const EXCLUDED_PATH_PATTERNS: RegExp[] = [
	new RegExp('^convex/admin/'),
	new RegExp('^convex/infrastructure/'),
	new RegExp('seed.*\\.ts$'),
	new RegExp('migrate.*\\.ts$'),
	new RegExp('\\.test\\.ts$'),
	new RegExp('Triggers\\.ts$'),
	new RegExp('orgVersionHistory\\.ts$'),
	new RegExp('promptUtils\\.ts$'),
	new RegExp('cryptoActions\\.ts$'),
	new RegExp('verification\\.ts$'),
	new RegExp('waitlist\\.ts$'),
	new RegExp('blogExport\\.ts$'),
	new RegExp('validateApiKeys\\.ts$'),
	new RegExp('workspaceSettings\\.ts$'),
	new RegExp('settings\\.ts$'),
	new RegExp('users\\.ts$'),
	new RegExp('circleItems\\.ts$'),
	new RegExp('roleTemplates\\.ts$'),
	new RegExp('workspaceAliases\\.ts$'),
	new RegExp('workspaceRoles\\.ts$'),
	new RegExp('docs/'),
	new RegExp('rbac/'),
	new RegExp('prompts/')
];

export const ALLOWLIST = new Set<string>([
	'listFlashcardsByCollection',
	'listInboxItems',
	'listNotes',
	'listAllTags',
	'listUserTags',
	'createError'
]);

export const MODIFIER = 'my';
export const STRICT_FLAGS = new Set(['--strict', '--fail']);

export function isStrictMode(argv: string[] = process.argv): boolean {
	return argv.some((arg) => STRICT_FLAGS.has(arg));
}

export const STRICT = isStrictMode();

export const EXPORT_PATTERN = /export (?:const|function) (\w+)/;
export const NULL_TYPE_PATTERN = /\|\s*null/;
export const RETURN_NULL_PATTERN = /\breturn\s+null\b/;
export const BOOLEAN_PATTERN = /:\s*boolean/;
export const RETURN_BOOL_PATTERN = /return (true|false)/;
export const ARRAY_TYPE_PATTERN = /:\s*[^;=]*\[\]/;
export const ARRAY_GENERIC_PATTERN = /\bArray<[^>]+>/;
export const QUERY_ARRAY_PATTERN = /\bQuery<[^>]*,\s*[^>]*\[\]\s*>/;
export const ID_PATTERN = /Id<.*>/;
export const INSERT_PATTERN = /ctx\.db\.insert/;
export const EXPORT_WINDOW = 60;
export const NEARBY_WINDOW = 12;
