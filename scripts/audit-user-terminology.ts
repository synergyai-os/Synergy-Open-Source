import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Scope = 'system_auth' | 'workspace' | 'unknown';
type MatchKind = 'doc' | 'comment' | 'string' | 'code';
type Confidence = 'high' | 'medium' | 'low';

type MatchRow = {
	filePath: string;
	lineNumber: number;
	lineText: string;
	matchCountOnLine: number;
	matchedText: string;
	scope: Scope;
	confidence: Confidence;
	kind: MatchKind;
	reason: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'dev-docs', 'audits', 'identity-user-terminology');

const OUTPUT_MD_PATH = path.join(OUTPUT_DIR, 'identity-user-terminology-audit.md');
const OUTPUT_WORKSPACE_MD_PATH = path.join(
	OUTPUT_DIR,
	'identity-user-terminology-audit.workspace.md'
);
const OUTPUT_SYSTEM_AUTH_MD_PATH = path.join(
	OUTPUT_DIR,
	'identity-user-terminology-audit.system-auth.md'
);
const OUTPUT_UNKNOWN_MD_PATH = path.join(OUTPUT_DIR, 'identity-user-terminology-audit.unknown.md');
const OUTPUT_SUMMARY_MD_PATH = path.join(OUTPUT_DIR, 'identity-user-terminology-audit.summary.md');
const OUTPUT_ACTIONABLE_MD_PATH = path.join(
	OUTPUT_DIR,
	'identity-user-terminology-audit.actionable.md'
);

// Focus: code + UI labels (not docs prose). We intentionally exclude dev-docs here.
const INCLUDED_ROOT_DIRS = ['src', 'convex', 'e2e', 'tests', 'eslint-rules', 'scripts'];

const EXCLUDED_DIR_NAMES = new Set([
	'node_modules',
	'.svelte-kit',
	'dist',
	'build',
	'storybook-static',
	'playwright-report',
	'test-results',
	'www',
	'ios',
	'android',
	'.git',
	'_generated'
]);

const INCLUDED_EXTENSIONS = new Set([
	'.ts',
	'.tsx',
	'.js',
	'.mjs',
	'.cjs',
	'.svelte',
	'.json',
	'.yml',
	'.yaml'
]);

// Intentionally not word-boundary: we want to catch identifier drift like availableUsers, useUsers, UserProfile, userId.
const USER_SUBSTRING_RE = /users?/gi;

const USER_TOKEN_RE = /[A-Za-z_][A-Za-z0-9_]*/g;
const STRING_LITERAL_WITH_USER_RE = /(['"`])[^'"`]*users?[^'"`]*\1/i;

const WORKSPACE_USER_TOKEN_EXCEPTIONS = new Set<string>([
	// Some workspace-adjacent code legitimately references global identity.
	'userId',
	'userIds',
	'actorUserId',
	'actingUserId',
	'targetUserId',
	'memberUserId',
	'assigneeUserId',
	'inviteeUserId',
	'invitedUserId',
	'ownerUserId',
	'candidateUserId',

	// Role assignment IDs are union-typed across systemRoles + workspaceRoles (kept for API compatibility).
	'userRoleId',
	'userRoleIds',

	// Common user-table/query helpers that should not be flagged as workspace terminology drift.
	'getUser',
	'getUserById',
	'findUser',
	'findUserById',
	'findUserByEmail',
	'validateUser',

	// Explicit provenance fields (these are sometimes intentionally user-sourced joins).
	'userEmail',
	'userName',
	'userEmails',
	'userNames'
]);

const WORKSPACE_USER_PATTERN_EXCEPTIONS: RegExp[] = [
	/^get.*User$/, // getActiveUser, getUserById
	/^find.*User$/, // findUserByEmail
	/^validate.*User$/, // validateUserSession
	/^create.*User$/, // createUser
	/^update.*User$/, // updateUser
	/^(User|Users)(Doc|Id|Type)s?$/, // UserDoc, UserId, UsersType
	/^(Doc|Id)<'?users'?>$/, // Doc<'users'> / Id<'users'> (best effort)

	// Bridge functions that take userId and return workspace-scoped data.
	/^(get|find|list)Person.*By.*User/i, // getPersonByUserAndWorkspace, findPersonByUserAndWorkspace
	/^(get|find|list).*ForUser$/i, // listWorkspacesForUser
	/^(get|find).*ByUserAndWorkspace$/i, // findPersonByUserAndWorkspace
	/^linkPersonToUser$/i,

	// User table field extractors
	/^find(User)?(Name|Email)Field$/i, // findUserNameField, findUserEmailField

	// Invite table field name variants
	/^invited(User)?Id$/i,

	// RBAC helpers commonly expose union ids as userRoleId for backwards compatibility
	/^(get|list|assign|revoke|update).*UserRole/i,
	/^(list|create|update)UserRoleAssignment/i,

	// Constants / schema helper tokens
	/^USER_ID_FIELD$/i,
	/^USER_.*_FIELD$/i
];

const AUTH_DOMAIN_FILE_PATTERNS: RegExp[] = [
	/^convex\/core\/users\//,
	/^convex\/infrastructure\/auth\//,
	/^src\/lib\/infrastructure\/auth\//,
	/^src\/routes\/auth\//,
	/^src\/routes\/.*\/auth\//,
	/\/audit-user-terminology(\.ts)?$/
];

function isAuthDomainFile(relPath: string): boolean {
	return AUTH_DOMAIN_FILE_PATTERNS.some((p) => p.test(relPath));
}

function isTestFile(relPath: string): boolean {
	return (
		relPath.includes('__tests__') ||
		relPath.includes('.test.') ||
		relPath.includes('.spec.') ||
		relPath.startsWith('tests/')
	);
}

// -----------------------------------------------------------------------------
// Actionable output helpers (UI-focused)
// -----------------------------------------------------------------------------

// Note: architecture.md says "Person" is the correct term in workspace context.
// If you want to experiment with "Member" in settings UI copy, flip this flag.
const PREFER_MEMBER_IN_SETTINGS_UI_COPY = false;

function isOrgChartModule(relPath: string): boolean {
	return relPath.includes('/modules/org-chart/') || relPath.includes('/org-chart/');
}

function isWorkspaceSettingsModule(relPath: string): boolean {
	return relPath.includes('/settings/') || relPath.includes('/infrastructure/workspaces/');
}

function getPreferredTerminology(relPath: string): 'Person' | 'Member' {
	if (PREFER_MEMBER_IN_SETTINGS_UI_COPY && isWorkspaceSettingsModule(relPath)) return 'Member';
	// Default to Person everywhere to match architecture terminology rules.
	return 'Person';
}

function replaceUserWithPreferredTerm(text: string, preferred: 'Person' | 'Member'): string {
	// Replace "User"/"user"/"Users"/"users" in UI copy only. Keep it conservative.
	const singular = preferred.toLowerCase();
	const plural = preferred === 'Person' ? 'people' : 'members';
	return text
		.replaceAll(/\bUsers\b/g, preferred === 'Person' ? 'People' : 'Members')
		.replaceAll(/\busers\b/g, plural)
		.replaceAll(/\bUser\b/g, preferred)
		.replaceAll(/\buser\b/g, singular);
}

function replaceUserInStringLiterals(lineText: string, preferred: 'Person' | 'Member'): string {
	// Apply replacements ONLY inside simple quoted literals to avoid rewriting code outside strings.
	// This is intentionally conservative (no multiline literals; no escaping awareness).
	return lineText.replaceAll(/(['"`])([^'"`]*\busers?\b[^'"`]*)\1/gi, (_m, quote, body) => {
		return `${quote}${replaceUserWithPreferredTerm(String(body), preferred)}${quote}`;
	});
}

function isUiCopyViolation(lineText: string): boolean {
	// Only care about very high-signal workspace UI strings (minimize noise).
	return (
		STRING_LITERAL_WITH_USER_RE.test(lineText) &&
		/\b(Add|Assign|Invite)\s+User(s)?\b/i.test(lineText)
	);
}

function listUiComponentNameViolations(): Array<{ filePath: string; suggestedFix: string }> {
	const srcRoot = path.join(REPO_ROOT, 'src');
	if (!fs.existsSync(srcRoot)) return [];
	const files = listAllFilesRecursively(srcRoot)
		.map((abs) => path.relative(REPO_ROOT, abs).replaceAll('\\', '/'))
		.filter((rel) => rel.endsWith('.svelte'));

	const out: Array<{ filePath: string; suggestedFix: string }> = [];
	for (const relPath of files) {
		// We focus on workspace UI modules; avoid auth routes and generic components churn.
		if (!isOrgChartModule(relPath)) continue;
		const base = path.basename(relPath);
		if (!base.includes('User')) continue;
		const preferred = getPreferredTerminology(relPath);
		const suggestedName = base.replaceAll('User', preferred);
		out.push({
			filePath: relPath,
			suggestedFix: `Rename file: ${base} → ${suggestedName}`
		});
	}
	return out.sort((a, b) => a.filePath.localeCompare(b.filePath));
}

function writeActionableReport(options: {
	rows: MatchRow[];
	workspaceProductionCode: MatchRow[];
	workspaceUiStrings: MatchRow[];
}): void {
	const createdAtIso = new Date().toISOString();
	const lines: string[] = [];

	lines.push('---');
	lines.push('title: Identity terminology audit - ACTIONABLE violations (workspace)');
	lines.push(`generatedAt: ${createdAtIso}`);
	lines.push('---');
	lines.push('');
	lines.push('## Scope');
	lines.push('');
	lines.push(
		'This report is intentionally narrow: it focuses on high-signal workspace UI terminology drift (\"User\" → \"Person\"), plus a short list of code identifier rename candidates.'
	);
	lines.push('');

	// P1: component filename violations (org-chart)
	const componentRenames = listUiComponentNameViolations();
	lines.push('## P1: Org-chart component file names containing "User"');
	lines.push('');
	lines.push(`Count: **${componentRenames.length}**`);
	lines.push('');
	if (componentRenames.length > 0) {
		lines.push('| File | Suggested fix |');
		lines.push('|---|---|');
		for (const r of componentRenames) {
			lines.push(`| \`${escapeMdCell(r.filePath)}\` | ${escapeMdCell(r.suggestedFix)} |`);
		}
		lines.push('');
	}

	// P2: UI copy violations (workspace strings)
	const uiCopy = options.workspaceUiStrings
		.filter((r) => r.filePath.startsWith('src/'))
		.filter((r) => r.filePath.endsWith('.svelte'))
		.filter((r) => !isTestFile(r.filePath))
		.filter((r) => !isAuthDomainFile(r.filePath))
		.filter((r) => isUiCopyViolation(r.lineText));

	lines.push('## P2: Workspace UI copy containing "User" (high-signal phrases only)');
	lines.push('');
	lines.push(`Count: **${uiCopy.length}**`);
	lines.push('');
	if (uiCopy.length > 0) {
		lines.push('| File | Line | Current | Suggested |');
		lines.push('|---|---:|---|---|');
		for (const r of uiCopy) {
			const preferred = getPreferredTerminology(r.filePath);
			const current = r.lineText.trim().slice(0, 120);
			const suggested = replaceUserInStringLiterals(current, preferred);
			lines.push(
				`| \`${escapeMdCell(r.filePath)}\` | ${r.lineNumber} | ${escapeMdCell(
					current
				)} | ${escapeMdCell(suggested)} |`
			);
		}
		lines.push('');
	}

	// P3: code identifier rename hints (org-chart only, very high signal)
	const orgChartCode = options.workspaceProductionCode
		.filter((r) => r.filePath.endsWith('.svelte') || r.filePath.endsWith('.ts'))
		.filter((r) => isOrgChartModule(r.filePath))
		.filter((r) => !isAuthDomainFile(r.filePath))
		.filter((r) => r.kind === 'code');

	type CodeRename = { filePath: string; lineNumber: number; token: string; suggestedFix: string };
	const codeRenames: CodeRename[] = [];
	for (const r of orgChartCode) {
		USER_TOKEN_RE.lastIndex = 0;
		const tokens = Array.from(r.lineText.matchAll(USER_TOKEN_RE)).map((m) => m[0] ?? '');
		const userTokens = tokens
			.filter(Boolean)
			// For actionable renames, focus on tokens that *actually* contain "User"/"Users" (case-sensitive),
			// so we don't suggest nonsense renames like userEvent → userEvent.
			.filter((t) => /User|Users/.test(t))
			.filter((t) => !WORKSPACE_USER_TOKEN_EXCEPTIONS.has(t))
			.filter((t) => !WORKSPACE_USER_PATTERN_EXCEPTIONS.some((re) => re.test(t)));

		for (const tok of Array.from(new Set(userTokens))) {
			const preferred = getPreferredTerminology(r.filePath);
			// Special-case: UI state flags like isUserUpdating are NOT identity terminology.
			// Better rename is to drop "User" entirely: isUserUpdating → isUpdating.
			const stateFlagMatch = /^isUser([A-Z][A-Za-z0-9_]*)$/.exec(tok);
			const renamed = stateFlagMatch
				? `is${stateFlagMatch[1]}`
				: tok.replaceAll(/User/g, preferred);
			if (renamed === tok) continue;
			codeRenames.push({
				filePath: r.filePath,
				lineNumber: r.lineNumber,
				token: tok,
				suggestedFix: `Rename "${tok}" → "${renamed}"`
			});
		}
	}

	const topCodeRenames = codeRenames
		.sort(
			(a, b) =>
				a.filePath.localeCompare(b.filePath) ||
				a.lineNumber - b.lineNumber ||
				a.token.localeCompare(b.token)
		)
		.slice(0, 200);

	lines.push('## P3: Org-chart code identifiers containing "User" (rename candidates)');
	lines.push('');
	lines.push(`Count: **${topCodeRenames.length}** (capped at 200)`);
	lines.push('');
	if (topCodeRenames.length > 0) {
		lines.push('| File | Line | Token | Suggested fix |');
		lines.push('|---|---:|---|---|');
		for (const r of topCodeRenames) {
			lines.push(
				`| \`${escapeMdCell(r.filePath)}\` | ${r.lineNumber} | \`${escapeMdCell(
					r.token
				)}\` | ${escapeMdCell(r.suggestedFix)} |`
			);
		}
		lines.push('');
	}

	fs.mkdirSync(path.dirname(OUTPUT_ACTIONABLE_MD_PATH), { recursive: true });
	fs.writeFileSync(OUTPUT_ACTIONABLE_MD_PATH, lines.join('\n'), 'utf8');
}

function hasOnlyExceptionUserTokens(lineText: string): boolean {
	USER_TOKEN_RE.lastIndex = 0;
	const tokens = Array.from(lineText.matchAll(USER_TOKEN_RE))
		.map((m) => m[0] ?? '')
		.filter(Boolean);
	const userTokens = tokens.filter((t) => t.toLowerCase().includes('user'));
	if (userTokens.length === 0) return false;

	for (const tok of userTokens) {
		if (WORKSPACE_USER_TOKEN_EXCEPTIONS.has(tok)) continue;
		if (WORKSPACE_USER_PATTERN_EXCEPTIONS.some((re) => re.test(tok))) continue;
		// Not an exception → actionable.
		return false;
	}
	return true;
}

function listAllFilesRecursively(absoluteRoot: string): string[] {
	const out: string[] = [];
	const stack: string[] = [absoluteRoot];

	while (stack.length > 0) {
		const current = stack.pop();
		if (!current) continue;

		let stat: fs.Stats;
		try {
			stat = fs.statSync(current);
		} catch {
			continue;
		}

		if (stat.isDirectory()) {
			const dirName = path.basename(current);
			if (EXCLUDED_DIR_NAMES.has(dirName)) continue;

			let entries: string[] = [];
			try {
				entries = fs.readdirSync(current);
			} catch {
				continue;
			}

			for (const entry of entries) {
				const abs = path.join(current, entry);
				const base = path.basename(abs);
				if (EXCLUDED_DIR_NAMES.has(base)) continue;
				stack.push(abs);
			}
			continue;
		}

		if (stat.isFile()) {
			// Prevent self-amplification: don't scan the generated audit output.
			const resolved = path.resolve(current);
			if (resolved === path.resolve(OUTPUT_MD_PATH)) continue;
			if (
				resolved.startsWith(path.resolve(OUTPUT_DIR)) &&
				path.basename(resolved).startsWith('identity-user-terminology-audit')
			) {
				continue;
			}
			const ext = path.extname(current).toLowerCase();
			if (!INCLUDED_EXTENSIONS.has(ext)) continue;
			out.push(current);
		}
	}

	return out;
}

function detectScope(
	filePath: string,
	lineText: string
): { scope: Scope; confidence: Confidence; reason: string } {
	const p = filePath.replaceAll('\\', '/');
	const t = lineText;
	const lower = `${p}\n${t}`.toLowerCase();

	// File-level hard override for auth domain.
	if (isAuthDomainFile(p)) {
		return { scope: 'system_auth', confidence: 'high', reason: 'Auth-domain file pattern match' };
	}

	const authSignals: Array<{ key: string; why: string }> = [
		{ key: '/auth/', why: 'auth path' },
		{ key: '/infrastructure/users/', why: 'users infra path' },
		{ key: '/admin/users/', why: 'admin users path' },
		{ key: 'workos', why: 'WorkOS' },
		{ key: 'authkit', why: 'AuthKit' },
		{ key: 'session', why: 'session' },
		{ key: 'login', why: 'login' },
		{ key: 'logout', why: 'logout' },
		{ key: 'verify-email', why: 'verify-email' },
		{ key: 'oauth', why: 'oauth' },
		{ key: 'api key', why: 'api key' },
		{ key: "v.id('users')", why: 'Convex users id type' },
		{ key: "id<'users'>", why: 'Convex users id type' },
		{ key: "db.query('users')", why: 'query users table' },
		{ key: "db.insert('users'", why: 'insert users table' },
		{ key: '/core/users/', why: 'users domain path' },
		{ key: 'users table', why: 'users table mention' },
		{ key: 'global auth', why: 'global auth mention' }
	];

	const workspaceSignals: Array<{ key: string; why: string }> = [
		{ key: 'personid', why: 'personId' },
		{ key: 'person', why: 'person/people' },
		{ key: 'people', why: 'people' },
		{ key: 'workspace', why: 'workspace' },
		{ key: '/org-chart/', why: 'org-chart path' },
		{ key: 'circle', why: 'circle' },
		{ key: 'role', why: 'role' },
		{ key: 'proposal', why: 'proposal' },
		{ key: 'member', why: 'member' },
		{ key: 'assignee', why: 'assignee' },
		{ key: '/core/people/', why: 'people domain path' },
		{ key: '/core/workspaces/', why: 'workspaces domain path' }
	];

	const matchedAuth = authSignals.filter((s) => lower.includes(s.key));
	const matchedWorkspace = workspaceSignals.filter((s) => lower.includes(s.key));

	// Treat userId itself as an auth/identity-chain signal (but don't overweight it).
	const hasUserId = /\buserid\b/i.test(lineText);
	const authCount = matchedAuth.length + (hasUserId ? 1 : 0);
	const workspaceCount = matchedWorkspace.length;

	if (authCount === 0 && workspaceCount === 0) {
		return {
			scope: 'unknown',
			confidence: 'low',
			reason: 'No strong auth/workspace signals detected'
		};
	}

	if (authCount > 0 && workspaceCount > 0) {
		// Mixed signal: avoid false positives by defaulting to unknown.
		return {
			scope: 'unknown',
			confidence: 'low',
			reason: `Mixed auth(${authCount}) + workspace(${workspaceCount}) signals`
		};
	}

	if (authCount > 0) {
		return {
			scope: 'system_auth',
			confidence: authCount >= 2 ? 'high' : 'medium',
			reason: `Auth signals: ${matchedAuth
				.map((s) => s.why)
				.slice(0, 4)
				.join(', ')}${hasUserId ? ', userId' : ''}`
		};
	}

	return {
		scope: 'workspace',
		confidence: workspaceCount >= 2 ? 'high' : 'medium',
		reason: `Workspace signals: ${matchedWorkspace
			.map((s) => s.why)
			.slice(0, 4)
			.join(', ')}`
	};
}

function detectKind(filePath: string, lineText: string): MatchKind {
	const ext = path.extname(filePath).toLowerCase();
	const trimmed = lineText.trim();

	if (ext === '.md' || ext === '.mdx') return 'doc';
	if (trimmed.startsWith('//')) return 'comment';
	if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/'))
		return 'comment';
	if (trimmed.startsWith('<!--') || trimmed.startsWith('-->')) return 'comment';
	if (STRING_LITERAL_WITH_USER_RE.test(lineText)) return 'string';
	return 'code';
}

function escapeMdCell(text: string): string {
	return text.replaceAll('|', '\\|').replaceAll('\n', '\\n');
}

function readTextFileIfSmallEnough(absPath: string): string | null {
	try {
		const stat = fs.statSync(absPath);
		// Avoid huge files
		if (stat.size > 2_000_000) return null;
		const buf = fs.readFileSync(absPath);
		// naive binary detection: NUL byte
		if (buf.includes(0)) return null;
		return buf.toString('utf8');
	} catch {
		return null;
	}
}

function listMatchesInFile(absPath: string): MatchRow[] {
	const text = readTextFileIfSmallEnough(absPath);
	if (!text) return [];

	const relPath = path.relative(REPO_ROOT, absPath).replaceAll('\\', '/');
	const lines = text.split(/\r?\n/);
	const rows: MatchRow[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] ?? '';
		USER_SUBSTRING_RE.lastIndex = 0;
		const matches = Array.from(line.matchAll(USER_SUBSTRING_RE));
		if (matches.length === 0) continue;

		const { scope, confidence, reason } = detectScope(relPath, line);
		const kind = detectKind(relPath, line);
		const matchedTexts = matches.map((m) => m[0] ?? '').filter(Boolean);
		const uniqueMatchedTexts = Array.from(new Set(matchedTexts));

		rows.push({
			filePath: relPath,
			lineNumber: i + 1,
			lineText: line.trimEnd(),
			matchCountOnLine: matches.length,
			matchedText: uniqueMatchedTexts.join(', '),
			scope,
			confidence,
			kind,
			reason
		});
	}

	return rows;
}

function listAllMatches(): MatchRow[] {
	const roots = INCLUDED_ROOT_DIRS.map((d) => path.join(REPO_ROOT, d)).filter((p) =>
		fs.existsSync(p)
	);
	const files = roots.flatMap((r) => listAllFilesRecursively(r));

	const rows: MatchRow[] = [];
	for (const f of files) {
		rows.push(...listMatchesInFile(f));
	}
	return rows;
}

function countByScope(rows: MatchRow[]): Record<Scope, number> {
	return rows.reduce(
		(acc, r) => {
			acc[r.scope] += 1;
			return acc;
		},
		{ system_auth: 0, workspace: 0, unknown: 0 } as Record<Scope, number>
	);
}

function countByScopeAndKind(rows: MatchRow[]): Record<Scope, Record<MatchKind, number>> {
	const init = () => ({ doc: 0, comment: 0, string: 0, code: 0 });
	return rows.reduce(
		(acc, r) => {
			acc[r.scope][r.kind] += 1;
			return acc;
		},
		{ system_auth: init(), workspace: init(), unknown: init() } as Record<
			Scope,
			Record<MatchKind, number>
		>
	);
}

function writeMarkdownRows(options: { outputPath: string; title: string; rows: MatchRow[] }): void {
	const totals = countByScope(options.rows);
	const totalsByKind = countByScopeAndKind(options.rows);
	const createdAtIso = new Date().toISOString();

	const lines: string[] = [];
	lines.push('---');
	lines.push(`title: ${options.title}`);
	lines.push(`generatedAt: ${createdAtIso}`);
	lines.push('---');
	lines.push('');
	lines.push('## Totals');
	lines.push('');
	lines.push('| Scope | Count | doc | comment | string | code |');
	lines.push('|---|---:|---:|---:|---:|---:|');
	for (const scope of ['system_auth', 'workspace', 'unknown'] as const) {
		const k = totalsByKind[scope];
		lines.push(
			`| ${scope} | ${totals[scope]} | ${k.doc} | ${k.comment} | ${k.string} | ${k.code} |`
		);
	}
	lines.push('');
	lines.push('## Instances');
	lines.push('');
	lines.push(
		'| File | Line | Kind | Match count | Matched text(s) | Scope | Confidence | Reason | Snippet |'
	);
	lines.push('|---|---:|---|---:|---|---|---|---|---|');

	const sorted = [...options.rows].sort((a, b) => {
		if (a.filePath !== b.filePath) return a.filePath.localeCompare(b.filePath);
		if (a.lineNumber !== b.lineNumber) return a.lineNumber - b.lineNumber;
		return a.matchedText.localeCompare(b.matchedText);
	});

	for (const r of sorted) {
		const fileCell = `\`${escapeMdCell(r.filePath)}\``;
		const lineCell = `${r.lineNumber}`;
		const kindCell = `\`${r.kind}\``;
		const countCell = `${r.matchCountOnLine}`;
		const matchedCell = `\`${escapeMdCell(r.matchedText)}\``;
		const scopeCell = `\`${r.scope}\``;
		const confidenceCell = `\`${r.confidence}\``;
		const reasonCell = escapeMdCell(r.reason);
		const snippetCell = escapeMdCell(r.lineText).slice(0, 240);
		lines.push(
			`| ${fileCell} | ${lineCell} | ${kindCell} | ${countCell} | ${matchedCell} | ${scopeCell} | ${confidenceCell} | ${reasonCell} | ${snippetCell} |`
		);
	}

	fs.mkdirSync(path.dirname(options.outputPath), { recursive: true });
	fs.writeFileSync(options.outputPath, lines.join('\n'), 'utf8');
}

function writeSummary(rows: MatchRow[]): void {
	const createdAtIso = new Date().toISOString();

	const lines: string[] = [];
	lines.push('---');
	lines.push('title: Identity terminology audit summary (user/users)');
	lines.push(`generatedAt: ${createdAtIso}`);
	lines.push('---');
	lines.push('');
	lines.push('## How to identify what is “correct” vs “incorrect”');
	lines.push('');
	lines.push(
		'- **Correct**: `user/users` when referring to global auth identity (`users` table, WorkOS, sessions, `userId`).'
	);
	lines.push(
		'- **Incorrect (to fix)**: `user/users` used in workspace/domain context where the entity is a `person`/`people` record (`personId`, circles/roles/workspace membership).'
	);
	lines.push(
		'- **Priority order**: workspace+`code` → workspace+`string` → workspace+docs/comments.'
	);
	lines.push('');

	type FileAgg = { filePath: string; workspace: number; unknown: number; systemAuth: number };
	const fileMap = new Map<string, FileAgg>();
	for (const r of rows) {
		const agg = fileMap.get(r.filePath) ?? {
			filePath: r.filePath,
			workspace: 0,
			unknown: 0,
			systemAuth: 0
		};
		if (r.scope === 'workspace') agg.workspace += 1;
		if (r.scope === 'unknown') agg.unknown += 1;
		if (r.scope === 'system_auth') agg.systemAuth += 1;
		fileMap.set(r.filePath, agg);
	}

	const topWorkspaceFiles = Array.from(fileMap.values())
		.sort(
			(a, b) =>
				b.workspace - a.workspace || b.unknown - a.unknown || a.filePath.localeCompare(b.filePath)
		)
		.slice(0, 50);

	lines.push('## Top files to fix first (workspace-scoped occurrences, top 50)');
	lines.push('');
	lines.push('| File | workspace | unknown | system_auth |');
	lines.push('|---|---:|---:|---:|');
	for (const f of topWorkspaceFiles) {
		lines.push(
			`| \`${escapeMdCell(f.filePath)}\` | ${f.workspace} | ${f.unknown} | ${f.systemAuth} |`
		);
	}
	lines.push('');

	lines.push('## Suggested workflow');
	lines.push('');
	lines.push(
		'- Start with **production code** (not tests), `scope=workspace`, `kind=code`, `confidence=high|medium`.'
	);
	lines.push(
		'- Then fix **UI labels** (workspace `kind=string`) where "Users" should be "People" (or "Members" when it truly means membership).'
	);
	lines.push(
		'- Apply mechanical renames (e.g. `availableUsers` → `availablePeople`) and re-run the script.'
	);
	lines.push(
		'- Use `identity-user-terminology-audit.unknown.md` only after the workspace list is shrinking (unknown becomes manageable).'
	);
	lines.push('');

	fs.mkdirSync(path.dirname(OUTPUT_SUMMARY_MD_PATH), { recursive: true });
	fs.writeFileSync(OUTPUT_SUMMARY_MD_PATH, lines.join('\n'), 'utf8');
}

function writeMarkdown(rows: MatchRow[]): void {
	const totals = countByScope(rows);
	const createdAtIso = new Date().toISOString();

	const lines: string[] = [];
	lines.push('---');
	lines.push(`title: Identity terminology audit (user/users)`);
	lines.push(`generatedAt: ${createdAtIso}`);
	lines.push('---');
	lines.push('');
	lines.push('## Purpose');
	lines.push('');
	lines.push(
		'Audit of `user` / `users` occurrences in code and UI labels (strings), including inside identifiers like `availableUsers`, `useUsers`, `UserProfile`, `userId`, with a heuristic scope classification:'
	);
	lines.push(
		'- **system_auth**: global auth identity / sessions / WorkOS / `userId` / `users` table'
	);
	lines.push(
		'- **workspace**: workspace-scoped organizational identity (`personId`, `people`), circles/roles/members in a workspace context'
	);
	lines.push('- **unknown**: needs manual review');
	lines.push('');
	lines.push('## Totals');
	lines.push('');
	lines.push('| Scope | Count |');
	lines.push('|---|---:|');
	lines.push(`| system_auth | ${totals.system_auth} |`);
	lines.push(`| workspace | ${totals.workspace} |`);
	lines.push(`| unknown | ${totals.unknown} |`);
	lines.push('');
	lines.push('## All instances');
	lines.push('');
	lines.push('| File | Line | Match count | Matched text(s) | Scope | Reason | Snippet |');
	lines.push('|---|---:|---:|---|---|---|---|');

	// Stable ordering: file then line then word
	const sorted = [...rows].sort((a, b) => {
		if (a.filePath !== b.filePath) return a.filePath.localeCompare(b.filePath);
		if (a.lineNumber !== b.lineNumber) return a.lineNumber - b.lineNumber;
		return a.matchedText.localeCompare(b.matchedText);
	});

	for (const r of sorted) {
		const fileCell = `\`${escapeMdCell(r.filePath)}\``;
		const lineCell = `${r.lineNumber}`;
		const countCell = `${r.matchCountOnLine}`;
		const matchedCell = `\`${escapeMdCell(r.matchedText)}\``;
		const scopeCell = `\`${r.scope}\``;
		const reasonCell = escapeMdCell(r.reason);
		const snippetCell = escapeMdCell(r.lineText).slice(0, 240);
		lines.push(
			`| ${fileCell} | ${lineCell} | ${countCell} | ${matchedCell} | ${scopeCell} | ${reasonCell} | ${snippetCell} |`
		);
	}

	lines.push('');
	lines.push('## Workspace-scoped tokens containing "user" (candidate renames)');
	lines.push('');
	lines.push(
		'This list is derived from lines classified as `workspace` and extracts identifier-like tokens containing `user`/`users` (case-insensitive).'
	);
	lines.push(
		'It is intended to drive a systematic rename plan toward **0 workspace-scoped `user` terminology**. Tokens in the exception allowlist are omitted.'
	);
	lines.push('');
	lines.push('| Token | Count | Recommendation | Example location |');
	lines.push('|---|---:|---|---|');

	type TokenAgg = { token: string; count: number; example: string };
	const tokenMap = new Map<string, TokenAgg>();

	for (const r of rows) {
		if (r.scope !== 'workspace') continue;
		// Candidate renames are primarily about identifiers, not UI text.
		if (r.kind !== 'code') continue;
		USER_TOKEN_RE.lastIndex = 0;
		const tokens = Array.from(r.lineText.matchAll(USER_TOKEN_RE)).map((m) => m[0] ?? '');
		for (const tok of tokens) {
			if (!tok) continue;
			if (!tok.toLowerCase().includes('user')) continue;
			if (WORKSPACE_USER_TOKEN_EXCEPTIONS.has(tok)) continue;
			const existing = tokenMap.get(tok);
			if (existing) {
				existing.count += 1;
			} else {
				tokenMap.set(tok, {
					token: tok,
					count: 1,
					example: `${r.filePath}:${r.lineNumber}`
				});
			}
		}
	}

	const tokenAggs = Array.from(tokenMap.values()).sort(
		(a, b) => b.count - a.count || a.token.localeCompare(b.token)
	);
	for (const agg of tokenAggs) {
		const lower = agg.token.toLowerCase();
		const recommendation = lower.includes('users')
			? 'Rename to People/Persons form'
			: lower.includes('user')
				? 'Rename to Person form'
				: 'Review';
		lines.push(
			`| \`${escapeMdCell(agg.token)}\` | ${agg.count} | ${recommendation} | \`${escapeMdCell(agg.example)}\` |`
		);
	}

	lines.push('');
	lines.push('## Workspace-scoped cleanup plan (draft)');
	lines.push('');
	lines.push(
		'Goal: reduce **workspace-scoped** `user/users` terminology to **0** in code + UI labels by renaming identifiers and UI copy to `person/people` (or `member` only when the domain truly means membership rather than identity).'
	);
	lines.push('');
	lines.push('### Recommended approach');
	lines.push('');
	lines.push(
		'- **Step 1: Define the “allowed user” carve-outs (prevents breaking identity model)**'
	);
	lines.push('  - Keep `userId` and the `users` table terminology for **System/Auth identity**.');
	lines.push(
		'  - Keep `*UserId` forms when they truly refer to global identity targets (invites, auth flows).'
	);
	lines.push('  - Everything else in workspace context should migrate to `person/people`.');
	lines.push('');
	lines.push('- **Step 2: Mechanical renames (safe, mostly-local)**');
	lines.push(
		'  - Rename variables/props like `availableUsers` → `availablePeople` or `availablePersons` (prefer `people/person` when backed by `people` table).'
	);
	lines.push(
		'  - Rename functions/hooks like `useUsers...` that actually query `people`/`personId` to `usePeople...` / `usePersons...`.'
	);
	lines.push(
		'  - Rename UI copy text in workspace screens: "Users" → "People" (or "Members" only when it refers to membership).'
	);
	lines.push('');
	lines.push('- **Step 3: File/module renames (medium risk, do after mechanical renames)**');
	lines.push(
		'  - Rename components/files like `AssignUserDialog` to `AssignPersonDialog` only after updating all imports + stories/tests.'
	);
	lines.push(
		'  - Prefer leaving purely-presentational legacy names for later only if churn risk is high, but the stated goal here is 0—so schedule them.'
	);
	lines.push('');
	lines.push('- **Step 4: API boundary verification (must stay consistent)**');
	lines.push('  - Ensure all workspace mutations/queries accept `personId` (not `userId`).');
	lines.push('  - Reserve `user/users` naming for global identity and auth tables only.');
	lines.push('');

	fs.mkdirSync(path.dirname(OUTPUT_MD_PATH), { recursive: true });
	fs.writeFileSync(OUTPUT_MD_PATH, lines.join('\n'), 'utf8');
}

function main(): void {
	const allRows = listAllMatches();
	// User request: only code + UI labels, not docs prose or comments.
	const rows = allRows.filter((r) => r.kind === 'code' || r.kind === 'string');

	// Actionable workspace candidates:
	// - exclude auth-domain files
	// - exclude lines where every "user*" token is an exception (identity chain / user-table helpers)
	const workspaceCandidates = rows.filter(
		(r) =>
			r.scope === 'workspace' &&
			!isAuthDomainFile(r.filePath) &&
			!(r.kind === 'code' && hasOnlyExceptionUserTokens(r.lineText))
	);

	const workspaceProductionCode = workspaceCandidates.filter(
		(r) => r.kind === 'code' && !isTestFile(r.filePath)
	);
	const workspaceTestCode = workspaceCandidates.filter(
		(r) => r.kind === 'code' && isTestFile(r.filePath)
	);
	const workspaceUiStrings = workspaceCandidates.filter((r) => r.kind === 'string');

	writeMarkdown(rows);
	writeActionableReport({ rows, workspaceProductionCode, workspaceUiStrings });
	writeMarkdownRows({
		outputPath: OUTPUT_WORKSPACE_MD_PATH,
		title: 'Identity terminology audit (workspace-only): user/users',
		rows: workspaceCandidates
	});
	writeMarkdownRows({
		outputPath: OUTPUT_SYSTEM_AUTH_MD_PATH,
		title: 'Identity terminology audit (system/auth-only): user/users',
		rows: rows.filter((r) => r.scope === 'system_auth')
	});
	writeMarkdownRows({
		outputPath: OUTPUT_UNKNOWN_MD_PATH,
		title: 'Identity terminology audit (unknown-only): user/users',
		rows: rows.filter((r) => r.scope === 'unknown')
	});

	// Extra actionable splits
	writeMarkdownRows({
		outputPath: path.join(
			OUTPUT_DIR,
			'identity-user-terminology-audit.workspace.production-code.md'
		),
		title: 'Identity terminology audit (workspace): production code candidates',
		rows: workspaceProductionCode
	});
	writeMarkdownRows({
		outputPath: path.join(OUTPUT_DIR, 'identity-user-terminology-audit.workspace.tests.md'),
		title: 'Identity terminology audit (workspace): test code candidates',
		rows: workspaceTestCode
	});
	writeMarkdownRows({
		outputPath: path.join(OUTPUT_DIR, 'identity-user-terminology-audit.workspace.ui-strings.md'),
		title: 'Identity terminology audit (workspace): UI label strings',
		rows: workspaceUiStrings
	});

	writeSummary(rows);
	console.log(`Wrote ${rows.length} rows to ${path.relative(REPO_ROOT, OUTPUT_MD_PATH)}`);
	console.log(`Wrote actionable report to ${path.relative(REPO_ROOT, OUTPUT_ACTIONABLE_MD_PATH)}`);
}

main();
