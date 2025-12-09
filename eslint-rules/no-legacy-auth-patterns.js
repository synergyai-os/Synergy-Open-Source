import fs from 'node:fs';
import path from 'node:path';

const LEGACY_HELPERS = new Set(['getAuthUserId', 'getUserIdFromSession']);
const PUBLIC_ENDPOINT_NAMES = new Set(['query', 'mutation', 'action']);
const INTERNAL_ENDPOINT_NAMES = new Set(['internalQuery', 'internalMutation', 'internalAction']);
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

function isConvexFile(filePath) {
	return filePath.includes(`${path.sep}convex${path.sep}`) &&
		!filePath.includes(`${path.sep}convex${path.sep}_generated${path.sep}`);
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

function hasUserIdInArgs(argsProperty) {
	if (!argsProperty || argsProperty.type !== 'Property') return false;

	const propertyValue = argsProperty.value;

	if (propertyValue.type === 'ObjectExpression') {
		return propertyValue.properties.some((prop) => {
			if (prop.type === 'Property') {
				const propName = getPropertyName(prop.key);
				if (propName === 'userId') return true;
			}

			if (prop.type === 'SpreadElement') return false;

			return false;
		});
	}

	if (propertyValue.type === 'CallExpression' && propertyValue.arguments.length > 0) {
		const [firstArg] = propertyValue.arguments;
		if (firstArg && firstArg.type === 'ObjectExpression') {
			return firstArg.properties.some((prop) => {
				if (prop.type !== 'Property') return false;
				return getPropertyName(prop.key) === 'userId';
			});
		}
	}

	return false;
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
	return BASELINE_KEYS.has(key);
}

export default {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Blocks legacy auth helpers and client-provided userId args in public Convex endpoints.',
			category: 'Security',
			recommended: true
		},
		messages: {
			legacyHelper:
				'AUTH_GUARD_LEGACY_HELPER: Legacy auth helper "{{name}}" is blocked. Use validateSessionAndGetUserId(ctx, sessionId).',
			userIdArg:
				'AUTH_GUARD_USER_ID_ARG: Public Convex endpoints must not accept client-provided userId. Derive user identity via validateSessionAndGetUserId(ctx, sessionId).'
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
				if (!modulePath.endsWith('_generated/server') && !modulePath.includes('/_generated/server')) {
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
					if (isBaselineViolation(context, node, 'AUTH_GUARD_LEGACY_HELPER')) {
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

				if (hasUserIdInArgs(argsProperty)) {
					if (isBaselineViolation(context, argsProperty, 'AUTH_GUARD_USER_ID_ARG')) {
						return;
					}
					context.report({
						node: argsProperty,
						messageId: 'userIdArg'
					});
				}
			}
		};
	}
};

