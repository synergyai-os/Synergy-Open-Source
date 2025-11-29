# Refactoring Script: workspaces → workspaces

## Overview

This script safely automates the refactoring from `workspaces` to `workspaces` across the entire codebase. It handles:

- ✅ Table names: `'workspaces'` → `'workspaces'`
- ✅ Type references: `Id<'workspaces'>` → `Id<'workspaces'>`
- ✅ Field names: `workspaceId` → `workspaceId`
- ✅ Variable names: `workspace` → `workspace` (context-aware)
- ✅ File names: `workspaces.ts` → `workspaces.ts`
- ✅ Directory names: `workspaces/` → `workspaces/`
- ✅ API endpoints: `api.workspaces.*` → `api.workspaces.*`
- ✅ Function names: `useWorkspaces` → `useWorkspaces`
- ✅ Interface names: `WorkspacesModuleAPI` → `WorkspacesModuleAPI`

## Why Use This Script?

**Safer than manual find-replace:**

- Uses word boundaries to avoid partial matches
- Context-aware replacements (avoids false positives)
- Dry-run mode to preview changes
- Detailed reporting of all changes
- Optional backup creation

**Faster than manual changes:**

- Processes 967+ references automatically
- Handles file/directory renames
- Consistent replacements across codebase

**Better than manual changes:**

- Reduces human error
- Ensures consistency
- Provides detailed audit trail

## Usage

### 1. Preview Changes (Dry Run) ⭐ **RECOMMENDED FIRST**

```bash
npm run refactor:orgs-to-workspaces:dry-run
```

This shows what **would** be changed without modifying any files. Review the output carefully.

### 2. Run with Backups (Safer)

```bash
npm run refactor:orgs-to-workspaces:backup
```

This creates `.backup` files for all modified files, allowing easy rollback if needed.

### 3. Run the Refactoring

```bash
npm run refactor:orgs-to-workspaces
```

This applies all changes. Make sure you've:

- ✅ Reviewed the dry-run output
- ✅ Committed your current work (or created backups)
- ✅ Are on a feature branch

### 4. Verbose Mode (See Details)

Add `--verbose` flag to see detailed replacement information:

```bash
npx tsx scripts/refactor-workspaces-to-workspaces.ts -- --dry-run --verbose
```

## What Gets Changed

### Code Replacements

| Pattern               | Replacement           | Example               |
| --------------------- | --------------------- | --------------------- |
| `'workspaces'`        | `'workspaces'`        | Table name in queries |
| `Id<'workspaces'>`    | `Id<'workspaces'>`    | TypeScript type       |
| `api.workspaces.*`    | `api.workspaces.*`    | API endpoint calls    |
| `workspaceId`         | `workspaceId`         | Field/variable name   |
| `workspaces`          | `workspaces`          | Variable name         |
| `workspace`           | `workspace`           | Variable name         |
| `useWorkspaces`       | `useWorkspaces`       | Composable function   |
| `WorkspacesModuleAPI` | `WorkspacesModuleAPI` | Interface name        |

### File/Directory Renames

- `convex/workspaces.ts` → `convex/workspaces.ts`
- `convex/workspaceSettings.ts` → `convex/workspaceSettings.ts`
- `src/lib/modules/core/workspaces/` → `src/lib/modules/core/workspaces/`
- Component files within the module directory

## What Gets Excluded

The script automatically excludes:

- `node_modules/`
- `.git/`
- `www/` (build output)
- `storybook-static/`
- `*.log` files
- `*.json` files (config files)
- The impact analysis document

## After Running

### 1. Review Changes

```bash
git diff
```

Review all changes carefully. The script is thorough but may need manual adjustments for:

- Comments that intentionally reference "workspace"
- External API documentation
- User-facing strings (if you want to keep "workspace" in UI)

### 2. Run Tests

```bash
npm test
```

Ensure all tests pass after the refactoring.

### 3. Type Check

```bash
npm run check
```

Verify TypeScript compilation succeeds.

### 4. Lint Check

```bash
npm run lint
```

Ensure code style is maintained.

### 5. Schema Migration ⚠️ **CRITICAL**

**Important**: The script updates code, but you'll need to handle the Convex schema migration separately:

1. **Update schema.ts** manually (or the script will handle it)
2. **Deploy schema changes first** before deploying code changes
3. **Run Convex migration** if needed (Convex handles some migrations automatically)

See `ai-docs/tasks/workspaces-to-workspaces-impact-analysis.md` for detailed migration strategy.

### 6. Clean Up Backups (if created)

```bash
find . -name "*.backup" -delete
```

## Troubleshooting

### Script reports errors

Check the error messages. Common issues:

- File permissions
- Files locked by editor
- Path issues

### TypeScript errors after refactoring

1. Run `npm run check` to see all errors
2. Some may require manual fixes (e.g., comments, external APIs)
3. Check if Convex schema was updated correctly

### Tests failing

1. Check if schema migration was completed
2. Verify API endpoints are updated
3. Check if test mocks need updating

### Want to rollback?

If you used `--backup`:

```bash
# Restore from backups
find . -name "*.backup" -exec sh -c 'mv "$1" "${1%.backup}"' _ {} \;
```

Or use git:

```bash
git checkout -- .
```

## Safety Features

1. **Dry-run mode**: Preview changes before applying
2. **Backup option**: Create `.backup` files for easy rollback
3. **Word boundaries**: Avoids partial matches (e.g., won't change "organizational")
4. **Context-aware**: Handles different code contexts correctly
5. **Detailed reporting**: Shows exactly what changed

## Limitations

The script handles most cases automatically, but you may need to manually update:

1. **Comments**: If comments intentionally reference "workspace"
2. **User-facing strings**: UI text that should say "workspace" not "workspace"
3. **External API docs**: Documentation for external consumers
4. **Database migrations**: Schema changes need separate handling
5. **Route paths**: `/org/*` routes may need manual consideration

## Example Output

```
╔══════════════════════════════════════════════════════════╗
║  workspaces → workspaces Refactoring Script          ║
╚══════════════════════════════════════════════════════════╝

Found 1247 files to check

Would update convex/schema.ts (45 replacements)
Would update convex/workspaces.ts (123 replacements)
Would update src/lib/modules/core/workspaces/api.ts (12 replacements)
...

File/Directory Renames:
Would rename convex/workspaces.ts → convex/workspaces.ts
Would rename src/lib/modules/core/workspaces → src/lib/modules/core/workspaces

╔══════════════════════════════════════════════════════════╗
║  Summary                                                  ║
╚══════════════════════════════════════════════════════════╝
  Files processed: 1247
  Files would be changed: 156
  Total replacements: 2847
```

## Related Documentation

- `ai-docs/tasks/workspaces-to-workspaces-impact-analysis.md` - Full impact analysis
- `scripts/refactor-workspaces-to-workspaces.ts` - Script source code

## Support

If you encounter issues:

1. Check the error messages
2. Review the impact analysis document
3. Run in dry-run mode first to preview changes
4. Use git to track changes and enable easy rollback
