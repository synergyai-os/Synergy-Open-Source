import fs from 'node:fs';
import path from 'node:path';

const LEGACY_HELPERS = new Set(['getAuthUserId', 'getUserIdFromSession']);
const PUBLIC_ENDPOINT_NAMES = new Set(['query', 'mutation', 'action']);
const INTERNAL_ENDPOINT_NAMES = new Set(['internalQuery', 'internalMutation', 'internalAction']);
const TARGET_ARG_WHITELIST = new Set([
	'memberUserId',
	'assigneeUserId',
	'targetUserId',
	'inviteeUserId',
	'ownerUserId',
	'candidateUserId'
]);
const SESSION_ID_ARG_NAME = 'sessionId';
const LEGACY_HELPER_CODE = 'AUTH_GUARD_LEGACY_HELPER';
const USER_ID_ARG_CODE = 'USER_ID_ARG_BLOCKED';
const MISSING_SESSION_ID_CODE = 'MISSING_SESSION_ID_ARG';
const TARGET_ARG_NOT_WHITELISTED_CODE = 'TARGET_ARG_NOT_WHITELISTED';
const BASELINE_PATH = path.join(process.cwd(), 'scripts/auth-guard-baseline.json');

function listBaselineViolations() {
	try {
		const contents = fs.readFileSync(BASELINE_PATH, 'utf8');
		const parsed = JSON.parse(contents);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

const BASELINE_KEYS = new Set(
	listBaselineViolations().map(
		(entry) => `${entry.file}|${entry.code}|${entry.line}|${entry.column}`
	)
);
const BASELINE_CODE_ALIASES = {
	[USER_ID_ARG_CODE]: ['AUTH_GUARD_USER_ID_ARG'],
	[LEGACY_HELPER_CODE]: [],
	[MISSING_SESSION_ID_CODE]: [],
	[TARGET_ARG_NOT_WHITELISTED_CODE]: []
};

function isConvexFile(filePath) {
	return (
		filePath.includes(`${path.sep}convex${path.sep}`) &&
		!filePath.includes(`${path.sep}convex${path.sep}_generated${path.sep}`)
	);
}

function getPropertyName(propertyName) {
	if (!propertyName) return undefined;

	if (
		propertyName.type === 'Identifier' ||
		propertyName.type === 'Literal' ||
		propertyName.type === 'PrivateIdentifier'
	) {
		return propertyName.name ?? propertyName.value;
	}

	return undefined;
}

function getArgsObjectExpression(argsProperty) {
	if (!argsProperty || argsProperty.type !== 'Property') return undefined;

	const propertyValue = argsProperty.value;

	if (propertyValue.type === 'ObjectExpression') {
		return propertyValue;
	}

	if (propertyValue.type === 'CallExpression' && propertyValue.arguments.length > 0) {
		const [firstArg] = propertyValue.arguments;
		if (firstArg && firstArg.type === 'ObjectExpression') {
			return firstArg;
		}
	}

	return undefined;
}

function hasSessionIdArg(argsObjectExpression) {
	return argsObjectExpression.properties.some(
		(prop) => prop.type === 'Property' && getPropertyName(prop.key) === SESSION_ID_ARG_NAME
	);
}

function findBlockedTargetArgs(argsObjectExpression) {
	const blocked = [];

	for (const prop of argsObjectExpression.properties) {
		if (prop.type !== 'Property') continue;

		const propName = getPropertyName(prop.key);
		if (typeof propName !== 'string') continue;

		const isTargetName =
			propName === 'userId' || propName === 'personId' || propName.endsWith('UserId');

		if (!isTargetName) continue;

		if (!TARGET_ARG_WHITELIST.has(propName)) {
			blocked.push({ prop, propName });
		}
	}

	return blocked;
}

function isPublicEndpointCallee(identifierName, serverImports) {
	const importedName = serverImports.get(identifierName) ?? identifierName;
	return PUBLIC_ENDPOINT_NAMES.has(importedName);
}

function isInternalEndpointCallee(identifierName, serverImports) {
	const importedName = serverImports.get(identifierName) ?? identifierName;
	return INTERNAL_ENDPOINT_NAMES.has(importedName);
}

function isBaselineViolation(context, node, code) {
	if (!node.loc) return false;
	const { line, column } = node.loc.start;
	const relativePath = path.relative(process.cwd(), context.getFilename());
	const key = `${relativePath}|${code}|${line + 1}|${column + 1}`;
	if (BASELINE_KEYS.has(key)) return true;

	const aliases = BASELINE_CODE_ALIASES[code] ?? [];
	return aliases.some((alias) =>
		BASELINE_KEYS.has(`${relativePath}|${alias}|${line + 1}|${column + 1}`)
	);
}

export default {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Blocks legacy auth helpers, enforces sessionId args, and restricts target identifiers in public Convex endpoints.',
			category: 'Security',
			recommended: true
		},
		messages: {
			legacyHelper:
				'AUTH_GUARD_LEGACY_HELPER: Legacy auth helper "{{name}}" is blocked. Use validateSessionAndGetUserId(ctx, sessionId).',
			missingSessionId:
				'MISSING_SESSION_ID_ARG: Public Convex endpoints must declare args.sessionId and validate via validateSessionAndGetUserId(ctx, sessionId).',
			userIdArg:
				'USER_ID_ARG_BLOCKED: Public Convex endpoints must not accept client-provided userId. Derive user identity via validateSessionAndGetUserId(ctx, sessionId).',
			targetArgNotAllowed:
				'TARGET_ARG_NOT_WHITELISTED: Use a whitelisted target identifier: targetUserId (general), memberUserId (membership), assigneeUserId (assignments), inviteeUserId (invites), ownerUserId (ownership), candidateUserId (recruiting).'
		},
		schema: []
	},
	create(context) {
		const filename = context.getFilename();

		if (!isConvexFile(filename)) {
			return {};
		}

		const serverImports = new Map();

		return {
			ImportDeclaration(node) {
				const modulePath = node.source.value;
				if (typeof modulePath !== 'string') return;
				if (
					!modulePath.endsWith('_generated/server') &&
					!modulePath.includes('/_generated/server')
				) {
					return;
				}

				for (const specifier of node.specifiers) {
					if (specifier.type === 'ImportSpecifier') {
						const importedName = specifier.imported.name;
						const localName = specifier.local.name;
						serverImports.set(localName, importedName);
					}
				}
			},

			Identifier(node) {
				if (LEGACY_HELPERS.has(node.name)) {
					if (isBaselineViolation(context, node, LEGACY_HELPER_CODE)) {
						return;
					}
					context.report({
						node,
						messageId: 'legacyHelper',
						data: { name: node.name }
					});
				}
			},

			CallExpression(node) {
				if (node.callee.type !== 'Identifier') return;

				const calleeName = node.callee.name;

				if (isInternalEndpointCallee(calleeName, serverImports)) {
					return;
				}

				if (!isPublicEndpointCallee(calleeName, serverImports)) {
					return;
				}

				const [firstArg] = node.arguments;
				if (!firstArg || firstArg.type !== 'ObjectExpression') {
					return;
				}

				const argsProperty = firstArg.properties.find(
					(prop) => prop.type === 'Property' && getPropertyName(prop.key) === 'args'
				);

				const argsObjectExpression = getArgsObjectExpression(argsProperty);
				const missingSessionId = !argsObjectExpression || !hasSessionIdArg(argsObjectExpression);

				if (missingSessionId) {
					const nodeForSession = argsProperty ?? firstArg;
					if (!isBaselineViolation(context, nodeForSession, MISSING_SESSION_ID_CODE)) {
						context.report({
							node: nodeForSession,
							messageId: 'missingSessionId'
						});
					}
				}

				if (!argsObjectExpression) {
					return;
				}

				for (const { prop, propName } of findBlockedTargetArgs(argsObjectExpression)) {
					const code = propName === 'userId' ? USER_ID_ARG_CODE : TARGET_ARG_NOT_WHITELISTED_CODE;

					if (isBaselineViolation(context, prop, code)) {
						continue;
					}

					context.report({
						node: prop,
						messageId: propName === 'userId' ? 'userIdArg' : 'targetArgNotAllowed',
						data: { name: propName }
					});
				}
			}
		};
	}
};
