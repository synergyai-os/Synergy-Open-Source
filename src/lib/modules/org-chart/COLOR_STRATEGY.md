# Org Chart Color Strategy

**Purpose**: Document the color system for the org chart visualization.

**Audience**: AI agents, human developers

**Last Updated**: 2024-12-XX

---

## Design Philosophy

The org chart visualization uses a **container vs entity** pattern:

| Type        | Purpose                         | Visual Treatment                  |
| ----------- | ------------------------------- | --------------------------------- |
| **Circles** | Containers (teams, departments) | Light, subtle, background-like    |
| **Roles**   | Entities (positions, people)    | Solid, prominent, foreground-like |

This creates immediate visual distinction between "what holds things" and "what you interact with".

---

## Why Single Color for All Circle Depths?

### Previous Approach (Problematic)

```typescript
// ❌ OLD: Different color per depth
const colors = [
	'var(--color-brand-primary)', // Level 0
	'var(--color-brand-secondary)', // Level 1
	'var(--color-status-success)', // Level 2 - WRONG: semantic misuse
	'var(--color-status-info)', // Level 3
	'var(--color-status-warning)' // Level 4+ - WRONG: semantic misuse
];
```

**Problems:**

1. **Limited to 5 levels** - what happens at depth 10?
2. **Semantic confusion** - success/warning colors don't mean "level"
3. **Visual noise** - rainbow effect creates cognitive load
4. **Brand dilution** - secondary color competes with primary

### Current Approach (Recommended)

```typescript
// ✅ NEW: Single color for all depths (uses semantic tokens for dark mode)
export function getCircleColor(): string {
	return 'var(--color-component-orgChart-circle-fill)';
}
```

**Benefits:**

1. **Unlimited depth** - scales to any hierarchy level
2. **No semantic confusion** - colors don't imply meaning they shouldn't have
3. **Visual clarity** - hierarchy shown through nesting/size/stroke
4. **Brand cohesion** - all on-brand teal family

---

## Color Tokens

### Base Tokens (`design-tokens-base.json`)

```json
"orgChart": {
  "circle": {
    "fill": "oklch(90% 0.05 195)",        // Very light teal
    "stroke": "oklch(70% 0.10 195)",      // Medium teal
    "strokeHover": "oklch(60% 0.12 195)" // Darker teal
  },
  "role": {
    "fill": "oklch(55% 0.15 195)",        // Brand primary
    "fillHover": "oklch(60% 0.13 195)",   // Lighter on hover
    "text": "oklch(100% 0 0)",            // White
    "stroke": "oklch(100% 0 0)"           // White
  },
  "label": {
    "onCircle": "oklch(25% 0.03 195)",        // Dark text
    "onCircleStroke": "oklch(95% 0.02 195)"  // Light stroke
  }
}
```

### Semantic Tokens (`design-tokens-semantic.json`)

Light/dark mode variants reference base tokens with dark mode overrides.

---

## Interactive States

### Circles (Containers)

| State               | Fill                        | Stroke            | Stroke Style    |
| ------------------- | --------------------------- | ----------------- | --------------- |
| **Default**         | Light teal (70-85% opacity) | Medium teal       | Solid, 1.5px    |
| **Hover**           | Light teal (70-85% opacity) | Darker teal       | **Dashed**, 2px |
| **Active/Selected** | Light teal (70-85% opacity) | **Brand primary** | **Solid**, 3px  |
| **Focus**           | Same as active              | + Focus ring      | Solid           |

### Roles (Entities)

| State               | Fill                | Text         | Stroke                      |
| ------------------- | ------------------- | ------------ | --------------------------- |
| **Default**         | Brand primary       | White        | White (30% opacity)         |
| **Hover**           | Brand primary light | White        | White (50% opacity)         |
| **Active/Selected** | Brand primary       | White        | White (100% opacity, 2.5px) |
| **Focus**           | Same as active      | + Focus ring | White                       |

---

## Helper Functions

All color functions are in `src/lib/utils/orgChartTransform.ts`:

```typescript
// Circle colors
getCircleColor()                    // Fill (same for all depths)
getCircleStrokeColor(state)         // 'default' | 'hover' | 'active'

// Role colors
getRoleFillColor(state?)            // 'default' | 'hover'
getRoleTextColor()                  // White text
getRoleStrokeColor()                // White stroke

// Label colors
getCircleLabelColor()               // Dark text on light circles
getCircleLabelStrokeColor()         // Light stroke for readability
```

---

## Usage in Components

### OrgChart.svelte

```svelte
{@const circleFill = getCircleColor()}
{@const circleStroke = isActive
	? getCircleStrokeColor('active')
	: isHovered
		? getCircleStrokeColor('hover')
		: getCircleStrokeColor('default')}

<circle
	fill={circleFill}
	fill-opacity={hasChildren ? 0.7 : 0.85}
	stroke={circleStroke}
	stroke-width={isActive ? 3 : isHovered ? 2 : hasChildren ? 1.5 : 0}
	stroke-dasharray={isHovered && !isActive ? '6 3' : 'none'}
/>
```

### Role Circles

```svelte
<circle
	fill={getRoleFillColor()}
	fill-opacity="1"
	stroke={getRoleStrokeColor()}
	stroke-width={isSelected ? 2.5 : 1}
	stroke-opacity={isSelected ? 1 : 0.3}
/>
<text fill={getRoleTextColor()}>Role Name</text>
```

---

## Dark Mode

Dark mode is handled automatically via semantic tokens:

| Element       | Light Mode            | Dark Mode             |
| ------------- | --------------------- | --------------------- |
| Circle fill   | `oklch(90% 0.05 195)` | `oklch(30% 0.06 195)` |
| Circle stroke | `oklch(70% 0.10 195)` | `oklch(45% 0.08 195)` |
| Role fill     | Brand primary         | Brand primary light   |
| Role text     | White                 | Dark gray             |

---

## Common Mistakes

### ❌ Using depth-based colors

```typescript
// DON'T: Limited to N levels, semantic confusion
getCircleColor(node.depth);
```

### ✅ Using single color for all depths

```typescript
// DO: Unlimited depth, clear hierarchy through nesting/size
getCircleColor();
```

### ❌ Using status colors for hierarchy

```typescript
// DON'T: success/warning don't mean "level 2/4"
'var(--color-status-success)';
```

### ✅ Using dedicated org chart tokens

```typescript
// DO: Semantic tokens with clear purpose and dark mode support
'var(--color-component-orgChart-circle-fill)';
```

---

## Related Files

- `design-tokens-base.json` - Base color definitions
- `design-tokens-semantic.json` - Light/dark mode variants
- `src/lib/utils/orgChartTransform.ts` - Color helper functions
- `src/lib/modules/org-chart/components/OrgChart.svelte` - Main component
- `src/lib/modules/org-chart/components/CircleNode.svelte` - Isolated circle
- `src/lib/modules/org-chart/components/RoleNode.svelte` - Isolated role

---

## Visual Summary

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Light Teal Container                   │   │
│   │                                                     │   │
│   │    ┌─────────────────────┐                          │   │
│   │    │  Light Teal Nested  │    ●●●                   │   │
│   │    │                     │    Solid Primary Roles   │   │
│   │    │    ●●●              │    (White Text)          │   │
│   │    │    Roles            │                          │   │
│   │    └─────────────────────┘                          │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   Hover: Dashed stroke ┄┄┄                                  │
│   Active: Solid primary stroke ───                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Maintained by**: SynergyOS Design System Team
