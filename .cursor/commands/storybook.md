# Storybook Best Practices

**Purpose**: Best practices for creating and maintaining Storybook stories for Svelte components, including common pitfalls and solutions learned from real-world usage.

---

## Critical Rules

### 1. HTML Comments in Svelte Components
**Problem**: HTML comments with nested comments break Storybook rendering
- Nested `<!-- -->` inside outer HTML comments causes parsing errors
- Storybook renders the text after the nested comment as visible content

**Solution**: 
- Remove nested comments from HTML comment blocks
- Use single-level comments or move documentation to JSDoc comments

**Example**:
```svelte
<!-- ❌ BAD: Nested comment breaks parsing -->
<!--
  Usage: <Icon type="add" />
  <Icon type="payment" /> <!-- Future: icon library -->
  More text here...
-->

<!-- ✅ GOOD: Single-level comment -->
<!--
  Usage: <Icon type="add" />
  <Icon type="payment" />
  More text here...
-->
```

### 2. TypeScript Type Imports in `<script module>` Blocks
**Problem**: `import type { IconType } from './iconRegistry'` in Storybook `<script module>` causes parsing errors
- Storybook's Svelte CSF parser doesn't handle TypeScript type imports in module scripts
- Error: `SB_SVELTE_CSF_PARSER_EXTRACT_SVELTE_0009`

**Solution**: 
- Remove unused type imports from module scripts
- Use string literals directly in `options` arrays instead of importing types

**Example**:
```svelte
<!-- ❌ BAD -->
<script module>
  import type { IconType } from './iconRegistry';
  const { Story } = defineMeta({
    argTypes: {
      type: { options: ['add', 'edit'] }
    }
  });
</script>

<!-- ✅ GOOD -->
<script module>
  const { Story } = defineMeta({
    argTypes: {
      type: { options: ['add', 'edit'] }
    }
  });
</script>
```

### 3. JavaScript Object Keys with Hyphens Must Be Quoted
**Problem**: Object keys with hyphens (e.g., `chevron-right`) cause esbuild transform errors
- Error: `Expected "}" but found "-"`

**Solution**: Quote object keys containing hyphens

**Example**:
```typescript
// ❌ BAD
export const iconRegistry = {
  chevron-right: { path: '...' }
};

// ✅ GOOD
export const iconRegistry = {
  'chevron-right': { path: '...' }
};
```

---

## Conditional argTypes

**Pattern**: Show/hide controls based on other arg values using the `if` property.

**Syntax**:
```typescript
argTypes: {
  iconPosition: {
    control: { type: 'select' },
    options: ['left', 'right'],
    if: { arg: 'iconType', exists: true } // Only show when iconType exists
  },
  iconOnly: {
    control: { type: 'boolean' },
    if: { arg: 'iconType', exists: true } // Only show when iconType exists
  }
}
```

**Available Conditions**:
- `if: { arg: 'name', exists: true }` - Show when arg exists
- `if: { arg: 'name', exists: false }` - Show when arg doesn't exist
- `if: { arg: 'name' }` - Show when arg is truthy (shorthand)
- `if: { arg: 'name', truthy: true }` - Show when arg is truthy
- `if: { arg: 'name', truthy: false }` - Show when arg is falsy
- `if: { arg: 'name', eq: 'value' }` - Show when arg equals value
- `if: { arg: 'name', neq: 'value' }` - Show when arg doesn't equal value

**Note**: Storybook doesn't support multiple conditions in a single `if` property (no AND/OR logic). If you need complex conditions, handle them in the story template logic instead.

---

## Dynamic Component Rendering in Stories

**Pattern**: Use `args` to dynamically render components and content.

**Key Points**:
- Define snippets at template level for proper scope (not inside conditionals)
- Use `{@const}` to compute derived values
- Check for existence before rendering

**Example**:
```svelte
<Story name="Primary" args={{ variant: 'primary', iconType: 'add' }}>
  {#snippet template(args)}
    {@const hasIcon = !!args.iconType}
    {@const isIconOnly = args.iconOnly || false}
    
    {#snippet icon()}
      {#if hasIcon}
        <Icon type={args.iconType} size="md" />
      {/if}
    {/snippet}
    
    <Button
      variant={args.variant}
      size={args.size}
      iconOnly={isIconOnly}
      ariaLabel={isIconOnly ? (args.ariaLabel || 'Icon button') : undefined}
    >
      {#snippet children()}
        {#if hasIcon}
          {#if isIconOnly}
            {@render icon()}
          {:else}
            <div class="flex items-center gap-button">
              {#if args.iconPosition === 'left' || (!args.iconPosition && hasIcon)}
                {@render icon()}
              {/if}
              <span>Button</span>
              {#if args.iconPosition === 'right'}
                {@render icon()}
              {/if}
            </div>
          {/if}
        {:else}
          Button
        {/if}
      {/snippet}
    </Button>
  {/snippet}
</Story>
```

**Common Mistakes**:
- ❌ Defining snippets inside conditional blocks (scope issues)
- ❌ Not checking for existence before rendering
- ✅ Define snippets at template level, check conditions inside snippet

---

## Component API vs Storybook Args

**Key Insight**: Storybook args don't have to match component props exactly.

**Pattern**:
- Component props: `iconOnly: boolean` (actual component API)
- Storybook args: `iconType`, `iconPosition`, `iconOnly` (convenience controls)
- Story logic maps args to component props

**Benefits**:
- Better UX in Storybook (icon selection + position controls)
- Component API stays clean and simple
- Stories handle the mapping logic

**Example**:
```typescript
// Component API (Button.svelte)
type Props = {
  iconOnly?: boolean;
  // No iconType or iconPosition props
};

// Storybook args (Button.stories.svelte)
argTypes: {
  iconType: { control: { type: 'select' }, options: ['add', 'edit', ...] },
  iconPosition: { control: { type: 'select' }, options: ['left', 'right'] },
  iconOnly: { control: { type: 'boolean' } }
}

// Story template maps args to props
<Button iconOnly={args.iconOnly} ...>
```

---

## Story Caching and Dynamic Imports

**Problem**: "Failed to fetch dynamically imported module" errors
- Often caused by bundler cache issues
- Can be triggered by syntax errors in imported modules

**Solutions**:
1. Clear Storybook cache: `rm -rf node_modules/.cache/.storybook`
2. Restart Storybook dev server
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
4. Check for syntax errors in imported modules

**Prevention**:
- Fix syntax errors immediately (they break dynamic imports)
- Use `npm run check` before starting Storybook
- Clear cache when switching branches or after major refactors

---

## Best Practices Summary

### Storybook Stories
1. ✅ Remove unused TypeScript type imports from `<script module>`
2. ✅ Use string literals in `options` arrays
3. ✅ Define snippets at template level for proper scope
4. ✅ Use `{@const}` for derived values
5. ✅ Use conditional `argTypes` to show/hide controls
6. ✅ Avoid nested HTML comments
7. ✅ Quote object keys with hyphens in TypeScript/JavaScript

### Control Design
1. ✅ Use boolean props for binary states (`iconOnly`)
2. ✅ Use enum props for multi-choice positioning (`iconPosition: left/right`)
3. ✅ Avoid redundant ways to express the same state (no `'only'` in position enum)
4. ✅ Hide controls when they don't apply (use `if` property)
5. ✅ Add descriptions to clarify control behavior

### Story Structure
1. ✅ Keep story templates focused and readable
2. ✅ Use `{@const}` for computed values
3. ✅ Map Storybook args to component props in template
4. ✅ Handle all conditional rendering in template logic

---

## Troubleshooting

### Story Not Rendering
1. Check for syntax errors in component or story file
2. Clear Storybook cache: `rm -rf node_modules/.cache/.storybook`
3. Restart Storybook dev server
4. Check browser console for errors

### Controls Not Showing/Hiding
1. Verify `if` property syntax is correct
2. Check that arg names match exactly (case-sensitive)
3. Remember: Storybook doesn't support multiple conditions in single `if`

### Type Errors in Stories
1. Remove `import type` statements from `<script module>` blocks
2. Use string literals in `options` arrays
3. Check component prop types match story args

### Dynamic Import Errors
1. Clear Storybook cache
2. Check for syntax errors in imported modules
3. Restart Storybook dev server
4. Hard refresh browser

---

## Related Documentation

- **Storybook Docs**: [Storybook for Svelte](https://storybook.js.org/docs/svelte/get-started/introduction)
- **Svelte CSF**: [Svelte CSF Format](https://storybook.js.org/docs/svelte/writing-stories/introduction)
- **Design System**: `.cursor/commands/match-design-system.md` - Component refactoring workflow

---

**Last Updated**: 2024-11-26  
**Purpose**: Storybook best practices for Svelte components  
**Status**: Active workflow
