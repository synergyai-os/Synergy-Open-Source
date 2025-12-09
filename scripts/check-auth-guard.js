import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { globSync } from 'glob';

const CONVEX_ROOT = path.join(process.cwd(), 'convex');
const GENERATED_SEGMENT = `${path.sep}_generated${path.sep}`;
const BASELINE_PATH = path.join(process.cwd(), 'scripts/auth-guard-baseline.json');
const isStrictMode = process.argv.includes('--strict');

const LEGACY_HELPERS = new Set(['getAuthUserId', 'getUserIdFromSession']);
const PUBLIC_ENDPOINT_NAMES = new Set(['query', 'mutation', 'action']);
const INTERNAL_ENDPOINT_NAMES = new Set(['internalQuery', 'internalMutation', 'internalAction']);

function isConvexFilePath(filePath) {
	return filePath.startsWith(CONVEX_ROOT) && !filePath.includes(GENERATED_SEGMENT);
}

function listConvexFiles() {
	return globSync('convex/**/*.ts', { ignore: ['convex/_generated/**'] })
		.map((file) => path.resolve(file))
		.filter(isConvexFilePath);
}

function findPropertyName(nameNode) {
	if (!nameNode) return undefined;

	if (ts.isIdentifier(nameNode)) return nameNode.text;
	if (ts.isStringLiteralLike(nameNode)) return nameNode.text;
	if (ts.isPrivateIdentifier(nameNode)) return nameNode.text;

	return undefined;
}

function resolveImportedName(localName, serverImports) {
	return serverImports.get(localName) ?? localName;
}

function isPublicEndpointCallee(calleeName, serverImports) {
	const resolvedName = resolveImportedName(calleeName, serverImports);
	return PUBLIC_ENDPOINT_NAMES.has(resolvedName);
}

function isInternalEndpointCallee(calleeName, serverImports) {
	const resolvedName = resolveImportedName(calleeName, serverImports);
	return INTERNAL_ENDPOINT_NAMES.has(resolvedName);
}

function hasUserIdProperty(objectExpression) {
	return objectExpression.properties.some((prop) => {
		if (ts.isPropertyAssignment(prop) || ts.isShorthandPropertyAssignment(prop)) {
			return findPropertyName(prop.name) === 'userId';
		}
		return false;
	});
}

function hasUserIdArgs(callExpression, serverImports) {
	if (!ts.isIdentifier(callExpression.expression)) return false;
	if (!isPublicEndpointCallee(callExpression.expression.text, serverImports)) return false;
	if (isInternalEndpointCallee(callExpression.expression.text, serverImports)) return false;

	const [firstArg] = callExpression.arguments;
	if (!firstArg || !ts.isObjectLiteralExpression(firstArg)) return false;

	const argsProperty = firstArg.properties.find(
		(prop) => ts.isPropertyAssignment(prop) && findPropertyName(prop.name) === 'args'
	);

	if (!argsProperty || !ts.isPropertyAssignment(argsProperty)) return false;

	const { initializer } = argsProperty;

	if (ts.isObjectLiteralExpression(initializer)) {
		return hasUserIdProperty(initializer);
	}

	if (ts.isCallExpression(initializer)) {
		const [maybeArgs] = initializer.arguments;
		if (maybeArgs && ts.isObjectLiteralExpression(maybeArgs)) {
			return hasUserIdProperty(maybeArgs);
		}
	}

	return false;
}

function listViolationsForFile(filePath) {
	const sourceText = fs.readFileSync(filePath, 'utf8');
	const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
	const relativePath = path.relative(process.cwd(), filePath);

	const serverImports = new Map();
	const violations = [];

	const addViolation = (code, message, node) => {
		const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
		violations.push({
			code,
			message,
			filePath,
			relativePath,
			line: line + 1,
			column: character + 1
		});
	};

	function visit(node) {
		if (ts.isImportDeclaration(node)) {
			const moduleText = node.moduleSpecifier.getText(sourceFile).replace(/['"]/g, '');
			if (moduleText.endsWith('_generated/server') || moduleText.includes('/_generated/server')) {
				for (const clause of node.importClause?.namedBindings?.elements ?? []) {
					const importedName = clause.propertyName ? clause.propertyName.text : clause.name.text;
					serverImports.set(clause.name.text, importedName);
				}
			}
		}

		if (ts.isIdentifier(node) && LEGACY_HELPERS.has(node.text)) {
			addViolation(
				'AUTH_GUARD_LEGACY_HELPER',
				`Legacy auth helper "${node.text}" is blocked. Use validateSessionAndGetUserId(ctx, sessionId).`,
				node
			);
		}

		if (ts.isCallExpression(node) && hasUserIdArgs(node, serverImports)) {
			addViolation(
				'AUTH_GUARD_USER_ID_ARG',
				'Public Convex endpoints must not accept client-provided userId. Derive identity via validateSessionAndGetUserId(ctx, sessionId).',
				node
			);
		}

		ts.forEachChild(node, visit);
	}

	ts.forEachChild(sourceFile, visit);

	return violations;
}

function listBaselineViolations() {
	try {
		const contents = fs.readFileSync(BASELINE_PATH, 'utf8');
		const parsed = JSON.parse(contents);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function makeKey(violation) {
	const file = violation.relativePath ?? violation.file ?? violation.filePath;
	return `${file}|${violation.code}|${violation.line}|${violation.column}`;
}

function summarizeViolations(newViolations, baselineHits, missingBaseline) {
	if (newViolations.length === 0) {
		console.log(
			`✅ Auth guard passed: no new legacy auth helpers or client userId args detected.` +
				(baselineHits.length > 0
					? ` (${baselineHits.length} known baseline violation${baselineHits.length === 1 ? '' : 's'} tracked in scripts/auth-guard-baseline.json)`
					: '')
		);
		if (missingBaseline.length > 0) {
			console.log(
				`ℹ️  Baseline entries no longer present (${missingBaseline.length}); consider cleaning scripts/auth-guard-baseline.json.`
			);
		}
		return;
	}

	console.error('❌ Auth guard violations found:');
	for (const violation of newViolations) {
		console.error(
			`${violation.filePath}:${violation.line}:${violation.column} ${violation.code}: ${violation.message}`
		);
	}

	process.exitCode = 1;
}

function runAuthGuard() {
	const files = listConvexFiles();
	const allViolations = files.flatMap(listViolationsForFile);

	const baselineEntries = (isStrictMode ? [] : listBaselineViolations()).map((entry) => ({
		...entry,
		relativePath: entry.file
	}));
	const baselineKeys = new Set(baselineEntries.map(makeKey));
	const seenBaselineKeys = new Set();
	const baselineHits = [];
	const newViolations = [];

	for (const violation of allViolations) {
		const key = makeKey(violation);
		if (baselineKeys.has(key)) {
			baselineHits.push(violation);
			seenBaselineKeys.add(key);
			continue;
		}
		newViolations.push(violation);
	}

	const missingBaseline = [...baselineKeys].filter((key) => !seenBaselineKeys.has(key));

	summarizeViolations(newViolations, baselineHits, missingBaseline);
}

runAuthGuard();

