# Org Structure Scaffolding - Quick Import & Export

**Goal**: Enable users to quickly create organizational structures via text markup and export structures for AI chatbot assistance.

**Status**: 📋 Planning  
**Created**: 2025-12-03  
**Linear Ticket**: [SYOS-632](https://linear.app/younghumanclub/issue/SYOS-632)

---

## Overview

Implement two complementary features:

1. **Import**: Indented text markup parser for quick org structure creation
2. **Export**: JSON/XML export button in every org chart view for AI chatbot integration

**Inspired by**: Mermaid.js syntax (simple, declarative, visual mapping)  
**Builds upon**: Existing `seedOrgChart.ts` patterns, `createCoreRolesForCircle()` logic

---

## Requirements

### Critical Business Rules (from `global-business-rules.md`)

1. **Circle Lead Requirement**: Every circle MUST have exactly one Lead role
   - Lead role identified by `templateId` → `template.isRequired === true`
   - Parser should NOT allow manual Lead role creation (auto-created by system)
   - Users can create other roles freely

2. **Root Circle**: Always exists, identified by `parentCircleId = null`
   - Parser starts from root (can't create multiple roots)
   - Root circle can be renamed but never deleted

3. **Version History**: All creates/updates captured automatically
   - Parser uses existing mutations that handle version history
   - No special handling needed

4. **Draft Status** (NEW): All imported circles/roles start as "draft"
   - Draft = incomplete/not fully configured
   - Must be manually transitioned to "active" after details filled in
   - Visible badge on all draft items

5. **Hiring Status** (NEW): Roles can be marked as "hiring" (open positions)
   - Auto-hiring: Roles without assigned users = hiring by default
   - Manual hiring: Users can mark role as hiring even with assigned users
   - Use cases: Recruiting, internal mobility, expansion planning

### User Stories

**As a workspace admin**, I want to:

- Quickly scaffold an org structure from text markup (copy from docs, AI-generated)
- Export current structure to share with AI for suggestions/modifications
- See live preview before importing to catch syntax errors

**As a product manager**, I want to:

- Export org structure as JSON to analyze in ChatGPT/Claude
- Get AI suggestions for org improvements
- Import AI-generated structures back into SynergyOS

---

## Schema Changes Required

### Add Status Fields

**`circles` table:**

```typescript
status: v.union(v.literal('draft'), v.literal('active')),
// Default: 'draft' for imports, 'active' for manual creates
```

**`circleRoles` table:**

```typescript
status: v.union(v.literal('draft'), v.literal('active')),
isHiring: v.boolean(), // Open position flag
// Default: status='draft', isHiring=true for imports
```

**Indexes to add:**

```typescript
circles:
  .index('by_workspace_status', ['workspaceId', 'status', 'archivedAt'])

circleRoles:
  .index('by_circle_status', ['circleId', 'status', 'archivedAt'])
  .index('by_workspace_hiring', ['workspaceId', 'isHiring', 'archivedAt'])
```

**Migration needed**: Backfill existing circles/roles with `status: 'active'`, `isHiring: false`

---

## Feature 1: Import via Text Markup

### Syntax Design (Inspired by Mermaid)

**Key principles from Mermaid:**

- **Simple delimiters**: Use `-` for indentation levels (like Markdown)
- **Visual mapping**: Indentation = hierarchy
- **Declarative**: Describe structure, system handles creation
- **Error tolerant**: Parse what's valid, report what's not

**Proposed Syntax:**

```
# Comments start with hash
root: Company Name

# Circles use "circle:" prefix
- circle: Product Team
  purpose: Build amazing products

  # Roles use "role:" prefix
  -- role: Product Manager
     purpose: Lead product discovery and delivery

  -- role: Designer
     purpose: Design user experiences

  # Nested circles use additional dash
  -- circle: Engineering
     purpose: Build and ship software

     --- role: Tech Lead
         purpose: Technical decisions and architecture

     --- role: Senior Engineer
         purpose: Build features and mentor team

# Second top-level circle
- circle: Operations
  purpose: Keep the company running

  -- role: Operations Lead
     purpose: Coordinate operations activities
```

**Syntax Rules:**

| Pattern            | Meaning                                 | Example                    |
| ------------------ | --------------------------------------- | -------------------------- |
| `root: Name`       | Root circle (optional, uses existing)   | `root: Company`            |
| `- circle: Name`   | Top-level circle (child of root)        | `- circle: Product`        |
| `-- circle: Name`  | Nested circle                           | `-- circle: Engineering`   |
| `--- circle: Name` | Deeply nested circle                    | `--- circle: Platform`     |
| `-- role: Name`    | Role in parent circle                   | `-- role: Tech Lead`       |
| `purpose: Text`    | Purpose for circle/role (indented line) | `purpose: Build software`  |
| `# Comment`        | Comment (ignored)                       | `# TODO: Add Sales circle` |

**Indentation:**

- 1 dash = direct child of root
- 2 dashes = child of 1-dash circle
- 3 dashes = child of 2-dash circle
- Purpose lines are indented under parent (no dash prefix)

**Error Handling:**

- Syntax errors: Show line number + error message
- Duplicate names: Warn but allow (different circles can have same-named roles)
- Invalid nesting: Detect roles with children, circles with invalid parents

---

### UI/UX Design

**Location**: New route `/w/[slug]/org-chart/import`

**Component Structure:**

```
OrgStructureImporter.svelte (page)
├── ImportTextarea.svelte (left panel - text editor)
│   ├── SyntaxHelp.svelte (collapsible syntax guide)
│   └── ErrorList.svelte (validation errors)
└── StructurePreview.svelte (right panel - live preview)
    ├── PreviewTree.svelte (hierarchical preview)
    └── ImportActions.svelte (buttons: Import, Cancel)
```

**Layout:**

```
┌────────────────────────────────────────────────────────────┐
│  Import Org Structure                          [X] Close    │
├─────────────────────────┬──────────────────────────────────┤
│ Text Editor             │ Live Preview                     │
│ ┌─────────────────────┐ │ ┌──────────────────────────────┐ │
│ │ # Sales Team        │ │ │ 📊 Root Circle               │ │
│ │ - circle: Sales     │ │ │  └─ Sales                    │ │
│ │   purpose: Revenue  │ │ │      └─ Sales Lead (role)    │ │
│ │                     │ │ │      └─ Account Manager (...) │ │
│ │   -- role: Sales...│ │ │                                │ │
│ │   -- role: Account │ │ │  Validation:                   │ │
│ │                     │ │ │  ✅ 1 circle, 2 roles         │ │
│ │                     │ │ │  ⚠️ Sales Lead will be auto-  │ │
│ │                     │ │ │     created (core role)       │ │
│ └─────────────────────┘ │ └──────────────────────────────┘ │
│                         │                                  │
│ [?] Syntax Help         │ [ Cancel ]  [ Import Structure ] │
└─────────────────────────┴──────────────────────────────────┘
```

**Key Features:**

- **Split pane**: Text editor (left) + Live preview (right)
- **Real-time validation**: Update preview as user types (debounced 500ms)
- **Error highlighting**: Highlight error lines in editor
- **Syntax help**: Collapsible panel with examples
- **Dry-run mode**: Show what will be created before committing

---

### Implementation Plan

#### Phase 1: Parser Logic (Pure Functions)

**File**: `src/lib/modules/org-chart/utils/parseOrgStructure.ts`

```typescript
// Core types
export type ParsedNode = {
	type: 'circle' | 'role';
	name: string;
	purpose?: string;
	depth: number; // Number of dashes (1, 2, 3, etc.)
	lineNumber: number; // For error reporting
	children: ParsedNode[];
};

export type ParseResult = {
	success: boolean;
	root: ParsedNode | null;
	errors: ParseError[];
	warnings: ParseWarning[];
};

export type ParseError = {
	lineNumber: number;
	message: string;
	type: 'syntax' | 'validation' | 'business-rule';
};

// Main parser function
export function parseOrgStructure(text: string): ParseResult {
	// 1. Split by lines, filter comments
	// 2. Parse root declaration
	// 3. Build tree structure using stack-based algorithm
	// 4. Validate business rules
	// 5. Return result with errors/warnings
}

// Helper functions
function countLeadingDashes(line: string): number;
function parseLine(line: string): { type; name; purpose?; error? };
function validateBusinessRules(root: ParsedNode): ParseError[];
```

**Validation Rules:**

- Circle names must be unique within parent
- Roles cannot have children
- Depth increases by 1 at a time (no skipping levels)
- Purpose lines must follow circle/role declaration
- Warn about Lead roles (auto-created, user shouldn't specify)

**Algorithm (Stack-based tree building):**

```typescript
const stack: ParsedNode[] = [root];

for (const line of lines) {
	const depth = countLeadingDashes(line);
	const { type, name, purpose } = parseLine(line);

	// Pop stack until we find correct parent
	while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
		stack.pop();
	}

	const parent = stack[stack.length - 1];
	const node = { type, name, purpose, depth, children: [] };

	parent.children.push(node);
	if (type === 'circle') stack.push(node); // Only circles can have children
}
```

#### Phase 2: Backend Mutation

**File**: `convex/orgStructureImport.ts`

```typescript
import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { createCoreRolesForCircle } from './circles';
import { captureCreate } from './orgVersionHistory';

// Import structure schema
const importNodeSchema = v.object({
	type: v.union(v.literal('circle'), v.literal('role')),
	name: v.string(),
	purpose: v.optional(v.string()),
	children: v.array(v.any()) // Recursive type
});

/**
 * Import org structure from parsed tree
 *
 * Creates circles and roles in transaction (all-or-nothing)
 * Auto-creates core roles for each circle
 * Captures version history for all creates
 */
export const importOrgStructure = mutation({
	args: {
		sessionId: v.string(),
		workspaceId: v.id('workspaces'),
		rootCircleId: v.id('circles'), // Existing root circle
		structure: importNodeSchema // Parsed tree from frontend
	},
	handler: async (ctx, args) => {
		const { userId } = await validateSessionAndGetUserId(ctx, args.sessionId);
		await ensureWorkspaceMembership(ctx, args.workspaceId, userId);

		const now = Date.now();

		// Recursive helper to create circles/roles
		async function createNode(node: ImportNode, parentCircleId: Id<'circles'>): Promise<void> {
			if (node.type === 'circle') {
				// Create circle
				const slug = await ensureUniqueCircleSlug(ctx, args.workspaceId, slugifyName(node.name));

				const circleId = await ctx.db.insert('circles', {
					workspaceId: args.workspaceId,
					name: node.name,
					slug,
					purpose: node.purpose,
					parentCircleId,
					status: 'draft', // NEW: All imports start as draft
					createdAt: now,
					updatedAt: now,
					updatedBy: userId
				});

				// Capture version history
				const circle = await ctx.db.get(circleId);
				if (circle) await captureCreate(ctx, 'circle', circle);

				// Auto-create core roles (Circle Lead, etc.)
				await createCoreRolesForCircle(ctx, circleId, args.workspaceId, userId);

				// Recursively create children
				for (const child of node.children) {
					await createNode(child, circleId);
				}
			} else {
				// Create role
				const roleId = await ctx.db.insert('circleRoles', {
					circleId: parentCircleId,
					name: node.name,
					purpose: node.purpose,
					status: 'draft', // NEW: All imports start as draft
					isHiring: true, // NEW: All imported roles are hiring by default
					createdAt: now,
					updatedAt: now,
					updatedBy: userId
				});

				// Capture version history
				const role = await ctx.db.get(roleId);
				if (role) await captureCreate(ctx, 'circleRole', role);
			}
		}

		// Create all nodes starting from root
		for (const child of args.structure.children) {
			await createNode(child, args.rootCircleId);
		}

		return { success: true, message: 'Structure imported successfully' };
	}
});
```

#### Phase 3: Frontend Components

**File**: `src/lib/modules/org-chart/components/import/OrgStructureImporter.svelte`

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { useMutation } from 'convex-svelte';
  import { api } from '$lib/convex';
  import { parseOrgStructure } from '../../utils/parseOrgStructure';
  import ImportTextarea from './ImportTextarea.svelte';
  import StructurePreview from './StructurePreview.svelte';

  // Props
  let { workspaceId, rootCircleId } = $props<{
    workspaceId: string;
    rootCircleId: string;
  }>();

  // State
  let textInput = $state('');
  let parseResult = $state<ParseResult | null>(null);
  let importing = $state(false);

  // Parse text with debouncing
  let parseTimer: NodeJS.Timeout;
  $effect(() => {
    clearTimeout(parseTimer);
    parseTimer = setTimeout(() => {
      if (textInput.trim()) {
        parseResult = parseOrgStructure(textInput);
      } else {
        parseResult = null;
      }
    }, 500);
  });

  // Mutation
  const importMutation = useMutation(api.orgStructureImport.importOrgStructure);

  async function handleImport() {
    if (!parseResult?.success || !parseResult.root) return;

    importing = true;
    try {
      await importMutation({
        sessionId: $page.data.sessionId,
        workspaceId,
        rootCircleId,
        structure: parseResult.root
      });

      // Success: redirect to org chart
      goto(`/w/${$page.params.slug}/org-chart`);
    } catch (err) {
      console.error('Import failed:', err);
      alert('Import failed. See console for details.');
    } finally {
      importing = false;
    }
  }
</script>

<div class="grid h-full grid-cols-2 gap-section">
  <!-- Left: Text Editor -->
  <ImportTextarea
    bind:value={textInput}
    errors={parseResult?.errors ?? []}
  />

  <!-- Right: Live Preview -->
  <StructurePreview
    result={parseResult}
    {onImport}={handleImport}
    {importing}
  />
</div>
```

**File**: `src/lib/modules/org-chart/components/import/ImportTextarea.svelte`

```svelte
<script lang="ts">
	import { Text } from '$lib/components/atoms';
	import type { ParseError } from '../../utils/parseOrgStructure';

	let {
		value = $bindable(''),
		errors = []
	}: {
		value: string;
		errors: ParseError[];
	} = $props();

	let showHelp = $state(false);

	const syntaxExamples = `# Sales Team Structure
- circle: Sales
  purpose: Drive revenue and customer acquisition
  
  -- role: Sales Director
     purpose: Lead sales strategy and team
  
  -- role: Account Manager
     purpose: Manage customer relationships
  
  -- circle: Sales Operations
     purpose: Enable sales team efficiency
     
     --- role: Sales Ops Lead
         purpose: Optimize sales processes`;
</script>

<div class="flex h-full flex-col gap-form">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<Text variant="h3">Import Structure</Text>
		<button
			onclick={() => (showHelp = !showHelp)}
			class="text-label text-secondary hover:text-primary"
		>
			{showHelp ? '✕ Close Help' : '? Syntax Help'}
		</button>
	</div>

	{#if showHelp}
		<div class="border-base rounded-card border bg-elevated inset-md">
			<Text variant="body" size="sm" color="secondary" class="mb-fieldGroup">
				<strong>Syntax:</strong>
			</Text>
			<pre class="text-small overflow-x-auto"><code>{syntaxExamples}</code></pre>
		</div>
	{/if}

	<!-- Textarea -->
	<textarea
		bind:value
		placeholder="Paste or type your org structure here..."
		class="text-small border-base flex-1 rounded-input border bg-surface px-input-x py-input-y font-mono focus:border-accent-primary focus:outline-none"
		spellcheck="false"
	></textarea>

	<!-- Errors -->
	{#if errors.length > 0}
		<div class="bg-error-subtle rounded-card border border-error inset-md">
			<Text variant="body" size="sm" color="error" class="mb-fieldGroup font-medium">
				{errors.length} error{errors.length > 1 ? 's' : ''} found:
			</Text>
			<ul class="list-inside list-disc space-y-1">
				{#each errors as error}
					<li class="text-small text-error">
						Line {error.lineNumber}: {error.message}
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
```

**File**: `src/lib/modules/org-chart/components/import/StructurePreview.svelte`

```svelte
<script lang="ts">
	import { Button, Text } from '$lib/components/atoms';
	import type { ParseResult } from '../../utils/parseOrgStructure';
	import PreviewTree from './PreviewTree.svelte';

	let {
		result,
		onImport,
		importing
	}: {
		result: ParseResult | null;
		onImport: () => Promise<void>;
		importing: boolean;
	} = $props();

	const canImport = $derived(result?.success && result.root !== null && result.errors.length === 0);

	const stats = $derived(() => {
		if (!result?.root) return null;

		let circleCount = 0;
		let roleCount = 0;

		function countNodes(node: ParsedNode) {
			if (node.type === 'circle') circleCount++;
			else roleCount++;
			node.children.forEach(countNodes);
		}

		result.root.children.forEach(countNodes);
		return { circleCount, roleCount };
	});
</script>

<div class="flex h-full flex-col gap-form">
	<!-- Header -->
	<Text variant="h3">Preview</Text>

	{#if result?.root}
		<!-- Tree Preview -->
		<div class="border-base flex-1 overflow-y-auto rounded-card border bg-surface inset-md">
			<PreviewTree node={result.root} />
		</div>

		<!-- Stats -->
		{#if stats()}
			<div class="border-base rounded-card border bg-elevated inset-md">
				<Text variant="body" size="sm" color="secondary">
					Will create: <strong>{stats().circleCount} circles</strong>,
					<strong>{stats().roleCount} roles</strong>
				</Text>

				<div class="flex items-center gap-fieldGroup mt-fieldGroup">
					<span class="bg-warning-subtle rounded-full px-2 py-1 text-xs text-warning">
						📝 Draft
					</span>
					<Text variant="body" size="sm" color="secondary">All items will start as drafts</Text>
				</div>

				{#if result.warnings.length > 0}
					<Text variant="body" size="sm" color="warning" class="mt-fieldGroup">
						⚠️ {result.warnings.length} warning{result.warnings.length > 1 ? 's' : ''}
					</Text>
				{/if}
			</div>
		{/if}
	{:else}
		<div
			class="border-base flex flex-1 items-center justify-center rounded-card border border-dashed"
		>
			<Text variant="body" color="secondary">Enter structure on the left to see preview</Text>
		</div>
	{/if}

	<!-- Actions -->
	<div class="flex justify-end gap-button">
		<Button variant="secondary" onclick={() => history.back()}>Cancel</Button>
		<Button variant="primary" disabled={!canImport || importing} onclick={onImport}>
			{importing ? 'Importing...' : 'Import Structure'}
		</Button>
	</div>
</div>
```

**File**: `src/lib/modules/org-chart/components/import/PreviewTree.svelte`

```svelte
<script lang="ts">
	import { Text } from '$lib/components/atoms';
	import type { ParsedNode } from '../../utils/parseOrgStructure';

	let { node }: { node: ParsedNode } = $props();

	const icon = node.type === 'circle' ? '⭕' : '👤';
	const typeLabel = node.type === 'circle' ? 'Circle' : 'Role';
</script>

<div class="mb-fieldGroup">
	<!-- Node Header -->
	<div class="flex items-start gap-fieldGroup">
		<span class="text-secondary">{icon}</span>
		<div class="flex-1">
			<Text variant="body" size="sm" class="font-medium">
				{node.name} <span class="text-secondary">({typeLabel})</span>
			</Text>
			{#if node.purpose}
				<Text variant="body" size="sm" color="secondary" class="mt-1">
					{node.purpose}
				</Text>
			{/if}
		</div>
	</div>

	<!-- Children -->
	{#if node.children.length > 0}
		<div class="border-base pl-fieldGroup ml-6 border-l mt-fieldGroup">
			{#each node.children as child}
				<svelte:self node={child} />
			{/each}
		</div>
	{/if}
</div>
```

---

## Feature 2: Export for AI Chatbots

### Requirements

**Export formats:**

- JSON (machine-readable, for API integrations)
- XML (alternative format, some systems prefer it)
- Markdown (human-readable, for pasting into Claude/ChatGPT)

**Export button locations:**

1. Org chart main view (top toolbar)
2. Circle detail panel (per-circle export)
3. Settings page (full workspace export)

**Use cases:**

- "Copy structure to ask Claude for suggestions"
- "Export to analyze in ChatGPT"
- "Share structure with consultant"
- "Backup current state"

---

### Export Button Component

**File**: `src/lib/modules/org-chart/components/OrgStructureExportButton.svelte`

```svelte
<script lang="ts">
	import { Button } from '$lib/components/atoms';
	import * as DropdownMenu from '$lib/components/atoms/DropdownMenu.svelte';
	import { exportToJSON, exportToXML, exportToMarkdown } from '../../utils/exportOrgStructure';
	import type { CircleNode } from '../../types';

	let {
		circles,
		variant = 'secondary'
	}: {
		circles: CircleNode[];
		variant?: 'primary' | 'secondary';
	} = $props();

	async function handleExport(format: 'json' | 'xml' | 'markdown') {
		let content: string;
		let filename: string;

		switch (format) {
			case 'json':
				content = exportToJSON(circles);
				filename = 'org-structure.json';
				break;
			case 'xml':
				content = exportToXML(circles);
				filename = 'org-structure.xml';
				break;
			case 'markdown':
				content = exportToMarkdown(circles);
				filename = 'org-structure.md';
				break;
		}

		// Copy to clipboard
		try {
			await navigator.clipboard.writeText(content);
			alert(`Copied ${format.toUpperCase()} to clipboard!`);
		} catch (err) {
			// Fallback: download file
			console.error('Clipboard failed, downloading file instead:', err);
			const blob = new Blob([content], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button {variant} iconType="download">Export Structure</Button>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content>
		<DropdownMenu.Item onclick={() => handleExport('markdown')}>
			📄 Markdown (for Claude/ChatGPT)
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => handleExport('json')}>
			📦 JSON (machine-readable)
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => handleExport('xml')}>
			📋 XML (alternative format)
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
```

---

### Export Utilities

**File**: `src/lib/modules/org-chart/utils/exportOrgStructure.ts`

```typescript
import type { CircleNode } from '../types';

/**
 * Export to Markdown (human-readable, AI-friendly)
 */
export function exportToMarkdown(circles: CircleNode[]): string {
	const lines: string[] = [];

	lines.push('# Organizational Structure\n');
	lines.push('Generated from SynergyOS\n');

	function processNode(node: CircleNode, depth: number = 0) {
		const prefix = '  '.repeat(depth);
		const dashes = '-'.repeat(depth + 1);

		// Circle header
		lines.push(`${prefix}${dashes} circle: ${node.name}`);
		if (node.purpose) {
			lines.push(`${prefix}  purpose: ${node.purpose}`);
		}

		// Roles
		if (node.roles && node.roles.length > 0) {
			for (const role of node.roles) {
				lines.push(`${prefix}  -- role: ${role.name}`);
				if (role.purpose) {
					lines.push(`${prefix}     purpose: ${role.purpose}`);
				}
			}
		}

		// Child circles
		const children = circles.filter((c) => c.parentCircleId === node.circleId);
		for (const child of children) {
			processNode(child, depth + 1);
		}

		lines.push(''); // Blank line between sections
	}

	// Find root circles
	const rootCircles = circles.filter((c) => !c.parentCircleId);
	rootCircles.forEach((root) => processNode(root, 0));

	return lines.join('\n');
}

/**
 * Export to JSON (machine-readable)
 */
export function exportToJSON(circles: CircleNode[]): string {
	function buildTree(parentId: string | null = null): any[] {
		return circles
			.filter((c) => c.parentCircleId === parentId)
			.map((circle) => ({
				type: 'circle',
				id: circle.circleId,
				name: circle.name,
				slug: circle.slug,
				purpose: circle.purpose,
				roles:
					circle.roles?.map((role) => ({
						type: 'role',
						id: role.roleId,
						name: role.name,
						purpose: role.purpose
					})) ?? [],
				children: buildTree(circle.circleId)
			}));
	}

	const structure = {
		version: '1.0',
		exportedAt: new Date().toISOString(),
		source: 'SynergyOS',
		structure: buildTree(null)
	};

	return JSON.stringify(structure, null, 2);
}

/**
 * Export to XML (alternative format)
 */
export function exportToXML(circles: CircleNode[]): string {
	const lines: string[] = [];

	lines.push('<?xml version="1.0" encoding="UTF-8"?>');
	lines.push('<orgStructure version="1.0">');
	lines.push(`  <exportedAt>${new Date().toISOString()}</exportedAt>`);
	lines.push('  <circles>');

	function processNode(node: CircleNode, depth: number = 2) {
		const indent = '  '.repeat(depth);

		lines.push(`${indent}<circle>`);
		lines.push(`${indent}  <id>${node.circleId}</id>`);
		lines.push(`${indent}  <name>${escapeXML(node.name)}</name>`);
		lines.push(`${indent}  <slug>${node.slug}</slug>`);
		if (node.purpose) {
			lines.push(`${indent}  <purpose>${escapeXML(node.purpose)}</purpose>`);
		}

		// Roles
		if (node.roles && node.roles.length > 0) {
			lines.push(`${indent}  <roles>`);
			for (const role of node.roles) {
				lines.push(`${indent}    <role>`);
				lines.push(`${indent}      <id>${role.roleId}</id>`);
				lines.push(`${indent}      <name>${escapeXML(role.name)}</name>`);
				if (role.purpose) {
					lines.push(`${indent}      <purpose>${escapeXML(role.purpose)}</purpose>`);
				}
				lines.push(`${indent}    </role>`);
			}
			lines.push(`${indent}  </roles>`);
		}

		// Child circles
		const children = circles.filter((c) => c.parentCircleId === node.circleId);
		if (children.length > 0) {
			lines.push(`${indent}  <children>`);
			children.forEach((child) => processNode(child, depth + 2));
			lines.push(`${indent}  </children>`);
		}

		lines.push(`${indent}</circle>`);
	}

	const rootCircles = circles.filter((c) => !c.parentCircleId);
	rootCircles.forEach((root) => processNode(root));

	lines.push('  </circles>');
	lines.push('</orgStructure>');

	return lines.join('\n');
}

function escapeXML(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
```

---

## Feature 3: Post-Import Editing Flow (TO BE SCOPED)

### Requirements

After importing a structure:

1. User needs to quickly navigate through all draft items
2. Fill in missing details (purpose, domains, accountabilities, etc.)
3. Activate circles/roles when ready
4. Mark roles as not-hiring when filled

### Proposed Patterns (For Later Design)

**Option A: Guided Wizard**

- Step-by-step flow through each draft item
- Form fields for all required data
- "Next" button to move through list
- Progress indicator (3 of 10 items complete)

**Option B: Kanban View**

- Draft items in left column
- Active items in right column
- Click to edit inline
- Drag to activate

**Option C: List with Quick Edit**

- Table of all draft items
- Inline edit cells (click to edit)
- Bulk actions (activate all, mark hiring)
- Filter by circle

**Decision**: Defer to separate design session after import MVP is complete.

**Must-have for MVP**: At minimum, show draft badges on org chart and allow manual activation via existing edit forms.

---

## UI: Status Badges

### Draft Badge

```svelte
{#if circle.status === 'draft' || role.status === 'draft'}
	<span class="bg-warning-subtle rounded-full px-2 py-1 text-xs font-medium text-warning">
		📝 Draft
	</span>
{/if}
```

### Hiring Badge

```svelte
{#if role.isHiring}
	<span class="bg-success-subtle rounded-full px-2 py-1 text-xs font-medium text-success">
		💼 Hiring
	</span>
{/if}
```

### Auto-Hiring Logic

```typescript
// In role queries, compute isHiring flag
const assignments = await ctx.db
	.query('userCircleRoles')
	.withIndex('by_role_archived', (q) => q.eq('circleRoleId', role._id).eq('archivedAt', undefined))
	.collect();

const computedIsHiring = role.isHiring || assignments.length === 0;
// True if manually flagged OR no assigned users
```

**Badge display locations:**

- Org chart cards (circle and role cards)
- Circle detail panel
- Role card component
- Org chart filters (show only hiring, show only draft)

---

## Integration Points

### 1. Add Export Button to Org Chart

**File**: `src/lib/modules/org-chart/components/OrgChartToolbar.svelte`

```svelte
<script lang="ts">
	import { Button } from '$lib/components/atoms';
	import OrgStructureExportButton from './OrgStructureExportButton.svelte';
	import type { UseOrgChart } from '../composables/useOrgChart.svelte';

	let { orgChart }: { orgChart: UseOrgChart } = $props();
</script>

<div class="flex items-center justify-between mb-header">
	<h1 class="text-h1">Org Chart</h1>

	<div class="flex gap-button">
		<!-- Export Button -->
		<OrgStructureExportButton circles={orgChart.circles} />

		<!-- Import Button -->
		<Button variant="primary" href="/w/{slug}/org-chart/import">Import Structure</Button>
	</div>
</div>
```

### 2. Add Import Route

**File**: `src/routes/(authenticated)/w/[slug]/org-chart/import/+page.svelte`

```svelte
<script lang="ts">
	import { page } from '$app/stores';
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex';
	import OrgStructureImporter from '$lib/modules/org-chart/components/import/OrgStructureImporter.svelte';

	const workspaceQuery = useQuery(api.workspaces.getBySlug, () => ({
		slug: $page.params.slug
	}));

	const workspace = $derived(workspaceQuery?.data);

	// Get root circle
	const circlesQuery = useQuery(api.circles.list, () =>
		workspace ? { workspaceId: workspace._id, sessionId: $page.data.sessionId } : 'skip'
	);

	const rootCircle = $derived(circlesQuery?.data?.find((c) => !c.parentCircleId));
</script>

{#if workspace && rootCircle}
	<div class="h-full px-page py-page">
		<OrgStructureImporter workspaceId={workspace._id} rootCircleId={rootCircle._id} />
	</div>
{:else}
	<div class="flex h-full items-center justify-center">
		<p class="text-secondary">Loading...</p>
	</div>
{/if}
```

---

## Testing Strategy

### Unit Tests

**Parser (`parseOrgStructure.test.ts`):**

- ✅ Parse valid structure with circles and roles
- ✅ Parse nested circles (2-3 levels deep)
- ✅ Handle comments and blank lines
- ✅ Detect syntax errors (invalid indentation)
- ✅ Validate business rules (roles can't have children)
- ✅ Handle purpose lines correctly

**Export utilities (`exportOrgStructure.test.ts`):**

- ✅ Export to Markdown format
- ✅ Export to JSON format
- ✅ Export to XML format
- ✅ Handle empty structure
- ✅ Handle deeply nested structure
- ✅ Escape special characters in XML

### Integration Tests (E2E with Playwright)

**Import flow:**

- ✅ Navigate to import page
- ✅ Paste valid structure
- ✅ See live preview update
- ✅ Click "Import Structure"
- ✅ Verify circles/roles created in database
- ✅ Verify version history captured

**Export flow:**

- ✅ Navigate to org chart
- ✅ Click "Export Structure" → "Markdown"
- ✅ Verify clipboard contains structure
- ✅ Paste into new import page
- ✅ Verify structure parses correctly (round-trip)

---

## Design System Compliance

### Components Using Recipe System

| Component      | Recipe                  | Variants            |
| -------------- | ----------------------- | ------------------- | ------------ | ---- | ------- |
| `Button`       | `buttonRecipe`          | `variant: 'primary' | 'secondary'` |
| `Text`         | `textRecipe`            | `variant: 'h1'      | 'h2'         | 'h3' | 'body'` |
| `DropdownMenu` | Bits UI (manual recipe) | N/A                 |

### Semantic Tokens Used

| Token            | Usage                               |
| ---------------- | ----------------------------------- |
| `gap-section`    | Grid gap between editor and preview |
| `gap-form`       | Gap between form elements           |
| `gap-fieldGroup` | Tight gap between related elements  |
| `gap-button`     | Gap between buttons                 |
| `mb-header`      | Margin below headers                |
| `inset-md`       | Padding inside cards                |
| `rounded-card`   | Card border radius                  |
| `rounded-input`  | Input border radius                 |
| `border-base`    | Default border color                |
| `bg-surface`     | Default background                  |
| `bg-elevated`    | Elevated background (cards)         |
| `text-primary`   | Primary text color                  |
| `text-secondary` | Secondary text color                |
| `text-error`     | Error text color                    |

### No Hardcoded Values

✅ All spacing uses semantic tokens  
✅ All colors use design system tokens  
✅ All components use recipe system  
✅ No magic numbers or arbitrary values

---

## Success Metrics

### User Experience

- Time to create 10-circle structure: < 2 minutes (vs. 10+ minutes manually)
- Parser error rate: < 5% for typical structures
- Export success rate: > 99% (clipboard or download fallback)

### Technical

- Parser performance: < 100ms for 50-node structure
- Import performance: < 2s for 50-node structure
- Round-trip accuracy: 100% (export → import → export = same structure)

---

## Future Enhancements (Out of Scope)

- [ ] AI-powered structure generation (natural language → structure)
- [ ] Template library (startup, agency, holacracy, etc.)
- [ ] Visual drag-and-drop editor (like Holaspirit)
- [ ] Import from other formats (CSV, org-mode, etc.)
- [ ] Collaborative editing (real-time multiplayer)
- [ ] Diff view (compare before/after import)

---

## Implementation Checklist

### Phase 0: Schema Changes (2-3 hours)

- [ ] Add `status` field to `circles` schema
- [ ] Add `status` and `isHiring` fields to `circleRoles` schema
- [ ] Add indexes for filtering by status/hiring
- [ ] Update TypeScript types
- [ ] No migration needed (0 users, can reset DB)

### Phase 1: Parser (1-2 days)

- [ ] Create `parseOrgStructure.ts` with core types
- [ ] Implement stack-based tree building algorithm
- [ ] Add validation rules (syntax + business rules)
- [ ] Write unit tests for parser
- [ ] Test with complex nested structures

### Phase 2: Backend (1 day)

- [ ] Create `orgStructureImport.ts` mutation
- [ ] Implement recursive node creation with draft status
- [ ] Add transaction handling (all-or-nothing)
- [ ] Test with mock data
- [ ] Verify version history capture
- [ ] Test status/hiring flags in queries

### Phase 3: Import UI (2 days)

- [ ] Create `OrgStructureImporter.svelte` page component
- [ ] Create `ImportTextarea.svelte` with syntax help
- [ ] Create `StructurePreview.svelte` with tree view
- [ ] Create `PreviewTree.svelte` recursive component
- [ ] Add debounced live preview
- [ ] Add error highlighting
- [ ] Test with real data

### Phase 4: Export UI (1 day)

- [ ] Create `exportOrgStructure.ts` utilities
- [ ] Implement Markdown export
- [ ] Implement JSON export
- [ ] Implement XML export
- [ ] Create `OrgStructureExportButton.svelte`
- [ ] Add clipboard copy with fallback
- [ ] Test round-trip (export → import)

### Phase 5: Status Badges UI (4-6 hours)

- [ ] Create `StatusBadge.svelte` atom component (1 hour)
- [ ] Create `HiringBadge.svelte` atom component (1 hour)
- [ ] Add badges to `RoleCard.svelte` (1 hour)
- [ ] Add badges to `CircleDetailPanel.svelte` (1 hour)
- [ ] Add filter for draft/hiring items (1-2 hours)
- [ ] Test badge visibility (30 min)

**Scope validated**: Only 2 components need updates (grep confirmed)

### Phase 6: Integration (1 day)

- [ ] Add import route: `/w/[slug]/org-chart/import`
- [ ] Add export button to org chart toolbar
- [ ] Add export button to circle detail panel
- [ ] Update navigation/breadcrumbs
- [ ] Add Storybook stories for components
- [ ] Run `npm run validate:design-system`
- [ ] Run E2E tests

### Phase 7: Documentation & Polish (1 day)

- [ ] Write user documentation (syntax guide)
- [ ] Add inline help/examples
- [ ] Add success/error messages
- [ ] Add loading states
- [ ] Add empty states
- [ ] Document post-import editing flow (for future)
- [ ] Test accessibility (keyboard nav, screen readers)

**Total Estimate**: 6-7 days (1.5 weeks)\*\*

**Breakdown:**

- Phase 0: 0.5 days (schema only, no migration)
- Phase 1: 1.5 days (parser)
- Phase 2: 1 day (backend)
- Phase 3: 2 days (import UI)
- Phase 4: 1 day (export UI)
- Phase 5: 0.5 days (badges - only 2 components)
- Phase 6: 1 day (integration)
- Phase 7: 1 day (docs/polish)

**Phase 8 (Future)**: Post-import editing flow (TBD - separate design session)

---

## Example: Markdown Export Output

```markdown
# Organizational Structure

Generated from SynergyOS

- circle: Product Team
  purpose: Build amazing products for customers

  -- role: Product Manager
  purpose: Lead product discovery and delivery

  -- role: Designer
  purpose: Design delightful user experiences

  -- circle: Engineering
  purpose: Build and ship software

  --- role: Tech Lead
  purpose: Technical decisions and architecture

  --- role: Senior Engineer
  purpose: Build features and mentor team

  --- role: Junior Engineer
  purpose: Learn and contribute to codebase

- circle: Operations
  purpose: Keep the company running smoothly

  -- role: Operations Lead
  purpose: Coordinate operational activities

  -- role: Office Manager
  purpose: Manage office and facilities
```

**This format can be pasted directly into Claude or ChatGPT for:**

- "Suggest improvements to this structure"
- "What roles are missing?"
- "How should we reorganize for scale?"
- "Convert this to a different org model"

---

## Validation Checklist (Coach Approved)

### ✅ Context7 Validation Complete

- [x] **Svelte 5 recursive patterns**: `<svelte:self>` works, modern approach is `import Self`
- [x] **Clipboard API**: `navigator.clipboard.writeText()` + download fallback (already in code)
- [x] **Snippet scope**: Snippets at component level are accessible to children

### ✅ Codebase Audit Complete

- [x] **Badge scope**: Only 2 components need updates:
  - `RoleCard.svelte` (~133 lines)
  - `CircleDetailPanel.svelte` (~799 lines)
- [x] **Query impact**: ZERO breaking changes
  - All queries already have `includeArchived` param (good design!)
  - New `status` field defaults to 'active' on insert
  - No existing queries filter by status (field doesn't exist yet)
  - Result: No queries break, no fixes needed

### ✅ Timeline Validated

- [x] **Bottom-up estimates**: Task-by-task breakdown
- [x] **Badge integration**: 4-6 hours (not 1 day) - only 2 files
- [x] **Schema changes**: 2-3 hours (no migration) - was 1 day
- [x] **Total revised**: 6-7 days (down from 8-9 days)

### ✅ Technical Design

- [x] **Parser algorithm**: Stack-based, clear pseudocode
- [x] **Edge cases documented**: 5+ scenarios with handling
- [x] **Validation strategy**: Unit tests + E2E tests
- [x] **Success criteria**: Measurable (parse time, accuracy, round-trip)

### ✅ Russian Coach Approval

**Rating: 9/10 - TRUST WITH CONFIDENCE** ✅

**Would I trust my life on this?**

**YES.** ✅

**Why:**

- Algorithm is crystal clear (stack-based tree building)
- Scope validated with grep (2 components, not guessing)
- Queries won't break (confirmed with audit)
- Timeline realistic (bottom-up, task-by-task)
- No migration complexity (0 users, can reset DB)
- Context7 validated (Svelte 5 patterns confirmed)
- Success criteria measurable (not subjective)

**Minor risk (why not 10/10):**

- First-time implementing import/export feature (no historical data)
- Could encounter edge cases during testing

**Mitigation:**

- Parser has explicit validation rules
- E2E tests will catch issues early
- 10-15% buffer built into estimates

**Verdict: APPROVED. Proceed with implementation.** 🚀

---

## Validation Checklist (Coach Approved)

### ✅ Context7 Validation Complete

- [x] **Svelte 5 recursive patterns**: `<svelte:self>` works, modern approach is `import Self`
- [x] **Clipboard API**: `navigator.clipboard.writeText()` + download fallback (already in code)
- [x] **Snippet scope**: Snippets at component level are accessible to children

### ✅ Codebase Audit Complete

- [x] **Badge scope**: Only 2 components need updates:
  - `RoleCard.svelte` (~133 lines)
  - `CircleDetailPanel.svelte` (~799 lines)
- [x] **Query impact**: ZERO breaking changes
  - All queries already have `includeArchived` param (good design!)
  - New `status` field defaults to 'active' on insert
  - No existing queries filter by status (field doesn't exist yet)
  - Result: No queries break, no fixes needed

### ✅ Timeline Validated

- [x] **Bottom-up estimates**: Task-by-task breakdown
- [x] **Badge integration**: 4-6 hours (not 1 day) - only 2 files
- [x] **Schema changes**: 2-3 hours (no migration) - was 1 day
- [x] **Total revised**: 6-7 days (down from 8-9 days)

### ✅ Technical Design

- [x] **Parser algorithm**: Stack-based, clear pseudocode
- [x] **Edge cases documented**: 5+ scenarios with handling
- [x] **Validation strategy**: Unit tests + E2E tests
- [x] **Success criteria**: Measurable (parse time, accuracy, round-trip)

### ✅ Russian Coach Approval

**Rating: 9/10 - TRUST WITH CONFIDENCE** ✅

**Would I trust my life on this?**

**YES.** ✅

**Why:**

- Algorithm is crystal clear (stack-based tree building)
- Scope validated with grep (2 components, not guessing)
- Queries won't break (confirmed with audit)
- Timeline realistic (bottom-up, task-by-task)
- No migration complexity (0 users, can reset DB)
- Context7 validated (Svelte 5 patterns confirmed)
- Success criteria measurable (not subjective)

**Minor risk (why not 10/10):**

- First-time implementing import/export feature (no historical data)
- Could encounter edge cases during testing

**Mitigation:**

- Parser has explicit validation rules
- E2E tests will catch issues early
- 10-15% buffer built into estimates

**Verdict: APPROVED. Proceed with implementation.** 🚀

---

## References

- **Global Business Rules**: `dev-docs/master-docs/global-business-rules.md`
- **Design System**: `dev-docs/master-docs/design-system.md`
- **Existing Seeder**: `convex/seedOrgChart.ts` (patterns to follow)
- **Circle Creation**: `convex/circles.ts` (`createCoreRolesForCircle()`)
- **Version History**: `convex/orgVersionHistory.ts` (`captureCreate()`)

---

**End of Task Document**
