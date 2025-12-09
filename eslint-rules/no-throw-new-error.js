/**
 * ESLint rule: no-throw-new-error
 *
 * Blocks raw `throw new Error(...)` in runtime code.
 * Use `invariant(...)` (frontend) or structured error helpers instead.
 *
 * Allowed/exempt paths:
 * - Tests/stories/docs/backups/fixtures
 * - The core invariant helper: src/lib/utils/invariant.ts
 */

const allowedFilePatterns = [
	/src\/lib\/utils\/invariant\.ts$/,
	/\.stories\./,
	/\.test\./,
	/\.spec\./,
	/\/tests?\//,
	/\/stories\//,
	/\/dev-docs\//,
	/\/docs\//,
	/\.backup(\.|$)/,
	/\/backup\//,
	/\/backups\//,
	/\/__fixtures__\//,
	/\/fixtures?\//,
	/\/__snapshots__\//
];

export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow raw throw new Error in runtime code; use invariant or structured errors.',
			category: 'Best Practices',
			recommended: false
		},
		messages: {
			noThrowNewError:
				'Use invariant(...) or a structured error helper instead of raw "throw new Error" in runtime code.'
		},
		schema: []
	},
	create(context) {
		const filename = context.getFilename();

		const isAllowedFile = allowedFilePatterns.some((pattern) => pattern.test(filename));
		if (isAllowedFile) {
			return {};
		}

		return {
			ThrowStatement(node) {
				if (
					node.argument &&
					node.argument.type === 'NewExpression' &&
					node.argument.callee &&
					node.argument.callee.type === 'Identifier' &&
					node.argument.callee.name === 'Error'
				) {
					context.report({ node, messageId: 'noThrowNewError' });
				}
			}
		};
	}
};

