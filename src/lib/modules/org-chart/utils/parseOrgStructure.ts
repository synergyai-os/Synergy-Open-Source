/**
 * Org Structure Parser
 *
 * Parses indented text markup (Mermaid-inspired syntax) into a tree structure
 * representing circles and roles for organizational structure import.
 *
 * Syntax:
 * - `root: Name` - Root circle (optional, uses existing)
 * - `- circle: Name` - Top-level circle (child of root)
 * - `-- circle: Name` - Nested circle
 * - `-- role: Name` - Role in parent circle
 * - `purpose: Text` - Purpose for circle/role (indented line)
 * - `# Comment` - Comment (ignored)
 */

export type ParsedNode = {
	type: 'circle' | 'role';
	name: string;
	purpose?: string;
	depth: number; // Number of dashes (1, 2, 3, etc.)
	lineNumber: number; // For error reporting
	children: ParsedNode[];
};

export type ParseError = {
	lineNumber: number;
	message: string;
	type: 'syntax' | 'validation' | 'business-rule';
};

export type ParseWarning = {
	lineNumber: number;
	message: string;
	type?: 'core-role' | 'duplicate' | 'general';
};

export type CoreTemplate = {
	_id: string;
	name: string;
	description?: string;
	isCore: boolean;
	isRequired?: boolean;
};

export type ParseResult = {
	success: boolean;
	root: ParsedNode | null;
	errors: ParseError[];
	warnings: ParseWarning[];
	coreRoleWarnings: ParseWarning[]; // Separated for easier UI handling
};

/**
 * Parse org structure from indented text markup
 * @param text - The text markup to parse
 * @param coreTemplates - Optional array of core role templates to validate against
 */
export function parseOrgStructure(text: string, coreTemplates: CoreTemplate[] = []): ParseResult {
	const errors: ParseError[] = [];
	const warnings: ParseWarning[] = [];
	const coreRoleWarnings: ParseWarning[] = [];

	// Create case-insensitive map of core template names for fast lookup
	const coreTemplateMap = new Map<string, CoreTemplate>();
	for (const template of coreTemplates) {
		const normalizedName = template.name.toLowerCase().trim();
		// Workspace templates take precedence over system templates
		// (assuming workspace templates come after system templates in array)
		if (!coreTemplateMap.has(normalizedName)) {
			coreTemplateMap.set(normalizedName, template);
		}
	}

	// Handle empty input
	if (!text.trim()) {
		return {
			success: false,
			root: null,
			errors: [
				{
					lineNumber: 1,
					message: 'Input is empty',
					type: 'validation'
				}
			],
			warnings: []
		};
	}

	const lines = text.split('\n');
	const root: ParsedNode = {
		type: 'circle',
		name: 'Root',
		depth: 0,
		lineNumber: 0,
		children: []
	};

	const stack: ParsedNode[] = [root];
	let rootNameSet = false;
	let lastAddedNode: ParsedNode | null = null; // Track last node added (circle or role) for purpose lines

	// Process each line
	for (let i = 0; i < lines.length; i++) {
		const lineNumber = i + 1;
		const line = lines[i].trimEnd(); // Preserve leading whitespace, remove trailing

		// Skip empty lines and comments
		if (!line || line.startsWith('#')) {
			continue;
		}

		// Parse root declaration
		if (line.trim().startsWith('root:')) {
			if (rootNameSet) {
				errors.push({
					lineNumber,
					message: 'Root circle can only be declared once',
					type: 'syntax'
				});
				continue;
			}
			const name = line.trim().slice(5).trim();
			if (!name) {
				errors.push({
					lineNumber,
					message: 'Root circle name cannot be empty',
					type: 'syntax'
				});
				continue;
			}
			root.name = name;
			rootNameSet = true;
			lastAddedNode = root;
			continue;
		}

		// Check for purpose line (may start with dashes/spaces, but contains "purpose:")
		const trimmedLine = line.trim();
		// Check if line contains "purpose:" after removing dashes
		const withoutDashes = trimmedLine.replace(/^-+/, '').trim();
		if (withoutDashes.startsWith('purpose:')) {
			// Purpose line found - attach to last added node
			if (lastAddedNode) {
				const purpose = withoutDashes.slice(8).trim();
				if (purpose) {
					if (lastAddedNode.purpose) {
						warnings.push({
							lineNumber,
							message: `Purpose already set for ${lastAddedNode.name}, overwriting`
						});
					}
					lastAddedNode.purpose = purpose;
				}
			} else {
				errors.push({
					lineNumber,
					message: 'Purpose line must follow a circle or role declaration',
					type: 'syntax'
				});
			}
			continue;
		}

		// Count leading dashes to determine depth
		const depth = countLeadingDashes(line);
		if (depth === 0) {
			// Invalid line format (not root, not purpose, not circle/role)
			errors.push({
				lineNumber,
				message: `Invalid line format. Expected "circle:", "role:", or "purpose:"`,
				type: 'syntax'
			});
			continue;
		}

		// Parse circle or role declaration
		const parseResult = parseLine(line, lineNumber);
		if (parseResult.error) {
			errors.push(parseResult.error);
			continue;
		}

		if (!parseResult.type || !parseResult.name) {
			continue; // Skip invalid lines
		}

		// Business rule: Roles cannot have children
		// Check BEFORE popping stack - if lastAddedNode is a role and current depth is greater, error
		if (lastAddedNode && lastAddedNode.type === 'role' && depth > lastAddedNode.depth) {
			errors.push({
				lineNumber,
				message: `Role "${lastAddedNode.name}" cannot have children. Roles must be leaf nodes.`,
				type: 'business-rule'
			});
			continue;
		}

		// Validate depth progression (can't skip levels)
		if (depth > stack.length) {
			errors.push({
				lineNumber,
				message: `Invalid indentation: depth ${depth} exceeds parent depth ${stack.length - 1}. Cannot skip levels.`,
				type: 'syntax'
			});
			continue;
		}

		// Pop stack until we find correct parent
		while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
			stack.pop();
		}

		if (stack.length === 0) {
			errors.push({
				lineNumber,
				message: 'No valid parent found for this node',
				type: 'validation'
			});
			continue;
		}

		const parent = stack[stack.length - 1];

		// Create new node
		const node: ParsedNode = {
			type: parseResult.type,
			name: parseResult.name,
			purpose: parseResult.purpose,
			depth,
			lineNumber,
			children: []
		};

		// Check for duplicate names within same parent
		const duplicateName = parent.children.find(
			(child) => child.name === node.name && child.type === node.type
		);
		if (duplicateName) {
			warnings.push({
				lineNumber,
				type: 'duplicate',
				message: `Duplicate ${node.type} name "${node.name}" in same parent. This is allowed but may cause confusion.`
			});
		}

		// Validate against core role templates
		if (node.type === 'role' && coreTemplateMap.size > 0) {
			const normalizedRoleName = node.name.toLowerCase().trim();
			const matchingTemplate = coreTemplateMap.get(normalizedRoleName);

			if (matchingTemplate) {
				const warning: ParseWarning = {
					lineNumber,
					type: 'core-role',
					message: `"${node.name}" is a core role that will be automatically created for every circle. Remove this line to avoid duplicates.`
				};
				warnings.push(warning);
				coreRoleWarnings.push(warning);
			}
		}

		// Legacy warning about Lead roles (keep for backward compatibility, but core template check above is more accurate)
		if (
			node.type === 'role' &&
			node.name.toLowerCase().includes('lead') &&
			coreTemplateMap.size === 0
		) {
			warnings.push({
				lineNumber,
				type: 'general',
				message: `Role "${node.name}" may conflict with auto-created Circle Lead role. Circle Lead roles are automatically created by the system.`
			});
		}

		parent.children.push(node);

		// Track last added node for purpose line attachment
		lastAddedNode = node;

		// Only circles can have children (add to stack)
		if (node.type === 'circle') {
			stack.push(node);
		}
	}

	// Validate business rules
	const businessRuleErrors = validateBusinessRules(root);
	errors.push(...businessRuleErrors);

	// Success if no errors (warnings are OK)
	const success = errors.length === 0;

	return {
		success,
		root: success ? root : null,
		errors,
		warnings,
		coreRoleWarnings
	};
}

/**
 * Count leading dashes in a line
 * Skips whitespace (spaces and tabs) before counting dashes
 */
function countLeadingDashes(line: string): number {
	let count = 0;
	let foundDash = false;
	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (char === '-') {
			foundDash = true;
			count++;
		} else if (char === ' ' || char === '\t') {
			// Skip whitespace before dashes
			if (!foundDash) {
				continue;
			}
			// If we've found dashes, stop counting (spaces after dashes are part of content)
			break;
		} else {
			break;
		}
	}
	return count;
}

/**
 * Parse a single line into type, name, and optional purpose
 */
function parseLine(
	line: string,
	lineNumber: number
): {
	type?: 'circle' | 'role';
	name?: string;
	purpose?: string;
	error?: ParseError;
} {
	// Remove leading dashes and spaces
	const trimmed = line.trimStart();
	const withoutDashes = trimmed.replace(/^-+/, '').trim();

	// Parse circle or role declaration
	if (withoutDashes.startsWith('circle:')) {
		const name = withoutDashes.slice(7).trim();
		if (!name) {
			return {
				error: {
					lineNumber,
					message: 'Circle name cannot be empty',
					type: 'syntax'
				}
			};
		}
		return { type: 'circle', name };
	}

	if (withoutDashes.startsWith('role:')) {
		const name = withoutDashes.slice(5).trim();
		if (!name) {
			return {
				error: {
					lineNumber,
					message: 'Role name cannot be empty',
					type: 'syntax'
				}
			};
		}
		return { type: 'role', name };
	}

	// Invalid format
	return {
		error: {
			lineNumber,
			message: `Invalid line format. Expected "circle:" or "role:" after dashes`,
			type: 'syntax'
		}
	};
}

/**
 * Validate business rules on the parsed tree
 */
function validateBusinessRules(root: ParsedNode): ParseError[] {
	const errors: ParseError[] = [];

	function validateNode(node: ParsedNode): void {
		// Roles cannot have children (already checked during parsing, but double-check)
		if (node.type === 'role' && node.children.length > 0) {
			errors.push({
				lineNumber: node.lineNumber,
				message: `Role "${node.name}" has children, but roles cannot have children`,
				type: 'business-rule'
			});
		}

		// Recursively validate children
		for (const child of node.children) {
			validateNode(child);
		}
	}

	// Validate all nodes except root
	for (const child of root.children) {
		validateNode(child);
	}

	return errors;
}
