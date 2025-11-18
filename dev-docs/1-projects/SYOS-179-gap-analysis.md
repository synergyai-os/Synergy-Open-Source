# SYOS-179: Org Chart UI/UX Gap Analysis

**Date**: November 17, 2025

---

## Current State vs. Expected State

### Expected Behavior (Holaspirit-style)

Based on your table data:
```
Active Platforms (parent)
└─ Guidelines API.. (child)
   └─ Sub Circle (grandchild)

New Circle (separate root)
```

**Should Display:**
1. **Large circle** for "Active Platforms"
2. **Medium circle INSIDE** "Active Platforms" for "Guidelines API.."
3. **Small circle INSIDE** "Guidelines API.." for "Sub Circle"
4. **Separate large circle** for "New Circle"

**Visual Nesting**: Child circles are physically positioned INSIDE parent circles (like Russian nesting dolls).

### Current Behavior (What You See)

**Screenshot 1 shows:**
- Two circles side-by-side: "Sub Circle" (purple) and "New Circle" (green)
- NO nesting - all circles at same level
- Missing "Active Platforms" and "Guidelines API.." parent circles

**This means:** The hierarchy transformation is broken!

---

## Root Cause Analysis

Looking at the Holaspirit example (Screenshot 2), the D3 Pack Layout SHOULD create:
- **Parent circles**: Large, semi-transparent containers
- **Child circles**: Smaller, positioned inside parents
- **Visual hierarchy**: Immediately apparent through nesting

### The Bug

The issue is likely in `transformToHierarchy()` function. The hierarchy is not being built correctly from the flat Convex data.

**Expected hierarchy structure:**
```typescript
{
  name: "Active Platforms",
  children: [
    {
      name: "Guidelines API..",
      children: [
        { name: "Sub Circle", children: [] }
      ]
    }
  ]
}

{
  name: "New Circle",
  children: []
}
```

**Current behavior suggests:**
- All circles are being treated as roots (no parent-child relationships)
- Or, only leaf nodes are being rendered (missing parent circles)

---

## Holaspirit UX Patterns

### Key Visual Features

1. **Nested Circle Packing**
   - Parent circles are CONTAINERS (visible outlines)
   - Child circles sit INSIDE parents (visually nested)
   - Multiple hierarchy levels visible simultaneously

2. **Color Coding**
   - Different shades indicate depth level
   - Parents: Light/pastel colors
   - Children: Darker/saturated colors
   - Consistency within same level

3. **Labels**
   - Parent circles: Large labels (container names)
   - Child circles: Smaller labels (team names)
   - Member counts visible

4. **Transparency & Depth**
   - Parent circles: More transparent (show children inside)
   - Child circles: More opaque (stand out)
   - Creates visual hierarchy through opacity

5. **Size Variation**
   - Parents sized to contain ALL children
   - Children sized by member count or importance
   - Padding between nested levels

---

## Gap Summary

| Feature | Expected (Holaspirit) | Current Implementation | Status |
|---------|----------------------|------------------------|--------|
| **Nested Circles** | Children INSIDE parents | All circles side-by-side | ❌ BROKEN |
| **Parent Visibility** | Parent circles visible as containers | Missing parent circles | ❌ BROKEN |
| **Hierarchy Depth** | Multiple levels (3+) visible | Only showing leaf nodes | ❌ BROKEN |
| **Color Coding** | By depth level | By depth level | ✅ CORRECT |
| **Size Calculation** | Logarithmic by members | Logarithmic by members | ✅ CORRECT |
| **Click Interaction** | Detail panel on click | Detail panel on click | ✅ CORRECT |
| **Transparency** | Parents semi-transparent | All circles same opacity | ⚠️ NEEDS FIX |

---

## Required Fixes

### 1. Fix Hierarchy Transformation (CRITICAL)

**Problem**: `transformToHierarchy()` is not building parent-child relationships correctly.

**Debug Steps:**
1. Add console logging to see what hierarchy is being built
2. Verify `parentCircleId` is being read from Convex correctly
3. Check if `buildHierarchy()` recursive function is working

**Expected Output:**
```javascript
// For your data, should create:
Root 1: Active Platforms
  └─ Child: Guidelines API..
     └─ Grandchild: Sub Circle

Root 2: New Circle
```

### 2. Render ALL Nodes (Not Just Leafs)

**Current Issue**: Only rendering leaf nodes or missing parent circles.

**Fix**: Ensure `visibleNodes` includes:
- All parent circles (styled as containers)
- All child circles (styled as content)

### 3. Visual Styling for Hierarchy

**Holaspirit Pattern:**
- **Parents**: `fill-opacity: 0.2` (very transparent)
- **Children**: `fill-opacity: 0.6` (semi-transparent)
- **Leaves**: `fill-opacity: 0.9` (mostly opaque)

**Apply depth-based styling:**
```typescript
const opacity = node.depth === 0 ? 0.2 : // Root/parent
                node.depth === 1 ? 0.4 : // Level 1
                node.depth === 2 ? 0.6 : // Level 2
                0.8; // Deeper levels
```

### 4. Stroke for Parent Circles

Parents should have visible borders to show containment:
```typescript
stroke: node.children ? "currentColor" : "none"
stroke-width: node.children ? 2 : 0
```

---

## Testing Checklist

Once fixed, you should see:

- [ ] "Active Platforms" as a LARGE circle
- [ ] "Guidelines API.." as a MEDIUM circle INSIDE "Active Platforms"
- [ ] "Sub Circle" as a SMALL circle INSIDE "Guidelines API.."
- [ ] "New Circle" as a separate LARGE circle
- [ ] Parent circles are semi-transparent (can see children inside)
- [ ] Child circles are more opaque (stand out inside parents)
- [ ] Clicking any circle opens detail panel
- [ ] Labels visible on all circles (size permitting)

---

## Next Steps

1. **Debug hierarchy transformation** - Add logging to see actual tree structure
2. **Verify Convex data** - Check if `parentCircleId` is correct in database
3. **Fix rendering** - Ensure all nodes (parents + children) are rendered
4. **Apply Holaspirit styling** - Transparency, strokes, depth-based colors

---

**Status**: 🔴 CRITICAL BUG - Hierarchy not rendering correctly  
**Impact**: Core feature non-functional  
**Priority**: P0 - Fix immediately

