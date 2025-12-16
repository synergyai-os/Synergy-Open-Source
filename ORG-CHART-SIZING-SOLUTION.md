# Org Chart Sizing Solution: Circles vs Roles

## 🟢 CURRENT STATUS (SYOS-905 - 2025-12-16)

**Issue**: Sub-circles appear smaller than or equal in size to sibling roles.

**Status**: ✅ SOLVED - Visual hierarchy is enforced without breaking D3 pack invariants.

**What works**:

- ✅ Sub-circles are reliably larger than sibling roles (visual hierarchy enforced)
- ✅ Circles are properly distributed (no stacking/overlap)
- ✅ All elements stay within parent boundaries
- ✅ D3 pack layout produces valid, non-overlapping layout

**What doesn't work**:

- ⚠️ Follow-ups (separate from SYOS-905): role packing aesthetics, semantic zoom for non-SVG elements (e.g. `foreignObject` text)

---

## 🧪 Debugging Session Summary (SYOS-905)

### Phase 1: Diagnosis

Added extensive diagnostic logging to understand D3's behavior:

**Key Discovery**: D3 pack layout **IGNORES the `value` property for internal nodes**. It sizes internal nodes purely by enclosure (just large enough to contain their children).

```
Console output showed:
- "Hierarchy" circle: value=23200, r=159.27
- "Team Lead" role: value=2250, r=162.33
```

The role was LARGER than the sub-circle despite having a smaller value!

**Root Cause**: D3's pack algorithm uses `value` only for LEAF nodes. For internal nodes (circles with children), it calculates radius as `just enough to enclose children + padding`.

### Phase 2: Failed Fix Attempts

#### ❌ Attempt 1: Post-pack scaling + pushing siblings

**Approach**: After D3 pack, scale up sub-circles and push sibling roles_group nodes away.

**Code** (removed):

```typescript
// Scale up the sub-circle
node.r = targetSubCircleRadius;
// Push roles_group away
rolesGroup.x += dirX * pushDistance;
```

**Result**: Sub-circles overflowed parent boundaries.

---

#### ❌ Attempt 2: Add containment checks + centering

**Approach**: Check if pushing would overflow, move sub-circle toward parent center instead.

**Code** (removed):

```typescript
// Calculate max we can push without overflow
const maxPushDistance = parent.r - rolesGroup.r - padding - currentRolesGroupDistFromParent;
```

**Result**: Sub-circles became too small again (no room to push siblings because D3 already packs tightly).

---

#### ❌ Attempt 3: Rebalance space allocation + repositioning

**Approach**: Instead of pushing, shrink roles and enlarge sub-circles, then reposition both.

**Code** (removed):

```typescript
// Split: 50% sub-circle, 40% roles, 10% gap
const targetSubCircleRadius = (totalAvailableDiameter * 0.5) / 2;
const targetRolesGroupRadius = (totalAvailableDiameter * 0.4) / 2;

// Reposition both
const newNodeX = parent.x - totalNeededWidth / 2 + node.r;
const newRolesGroupX = parent.x + totalNeededWidth / 2 - rolesGroup.r;
node.descendants().forEach((desc) => (desc.x += nodeDeltaX));
```

**Result**: 🔴 **ALL CIRCLES STACKED ON TOP OF EACH OTHER!**

The repositioning broke D3's carefully calculated layout. When processing nested circles (Hierarchy → Sub Sub Circle), position changes compounded and caused everything to stack at the center.

---

### Phase 3: Final Solution (works with D3, not against it)

**Final Solution**: **Add invisible “phantom” leaf nodes inside circles that must appear larger**, then re-run pack (iterative, convergent).

**Why this works**:

- D3 pack sizes **leaf nodes** from `value` (or `pack.radius`), but sizes **internal nodes** by **enclosing their children**
- Therefore, the only reliable way to make a circle bigger is to make its children require more enclosure
- Phantom leaves are invisible and never rendered; they exist purely to force a larger enclosing radius

**Critical implementation detail**: phantom injection must be **recursive**, so nested circles (sub-circle inside a sub-circle) can also receive phantoms.

---

## 🎯 Why D3 Pack Ignores Values for Internal Nodes

D3's circle packing algorithm works as follows:

1. **Leaf nodes** (roles): Sized by `value` property → `radius ∝ √value`
2. **Internal nodes** (circles): Sized by **enclosure** → `radius = smallest circle that contains all children + padding`

This means:

- Setting `value = 99999` for a sub-circle has NO EFFECT on its rendered size
- The sub-circle will only be as large as needed to contain its children
- If children are small, the sub-circle will be small

**This is D3's intended behavior, not a bug.**

---

## 💡 Possible Solutions Going Forward

### Option A: Accept D3's Layout (Recommended Short-term)

Use visual styling (colors, stroke weights, opacity) to differentiate circles from roles instead of sizing.

**Pros**:

- Layout is already correct
- No risk of breaking D3's invariants
- Simple to implement

**Cons**:

- Sub-circles won't be visually larger than roles

---

### Option B: Inflate Sub-circle Children's Values

Give children of sub-circles artificially larger values to force D3 to allocate more space.

**Approach**: In `calculateCircleValue()`, multiply children's values by a factor based on parent depth.

```typescript
// Pseudocode
if (parentIsSubCircle) {
	return baseValue * INFLATION_FACTOR; // e.g., 3x
}
```

**Pros**:

- Works with D3's natural algorithm
- No post-processing needed

**Cons**:

- Affects ALL descendants, may cause cascading size issues
- Complex to tune correctly

---

### Option C: Add "Phantom" Children to Sub-circles

Add invisible leaf nodes to sub-circles with large values to force D3 to allocate more space.

**Approach**: In `transformToHierarchy()`, add synthetic children to circles that need inflation.

```typescript
// Pseudocode
if (circleNeedsInflation) {
	circle.children.push({
		circleId: '__phantom__' + circle.circleId,
		value: PHANTOM_VALUE,
		invisible: true
	});
}
```

**Pros** (this is the approach we implemented):

- Precise control over inflation
- Doesn't affect real children

**Cons**:

- Adds complexity to hierarchy transformation
- Phantom nodes take up space (may push real children around)

---

### Option D: Use D3's `pack.radius()` Override

D3 allows overriding the radius calculation with `pack.radius(fn)`.

**Approach**: Provide a custom radius function that enforces minimum sizes.

```typescript
const pack = d3Pack<CircleNode>()
	.size([width, height])
	.padding(3)
	.radius((node) => {
		if (isSubCircle(node)) {
			return Math.max(calculateDefaultRadius(node), MIN_SUBCIRCLE_RADIUS);
		}
		return calculateDefaultRadius(node);
	});
```

**Pros**:

- Direct control over sizing
- Works within D3's framework

**Cons**:

- In D3 pack, `pack.radius(...)` applies to **leaf nodes**, not internal nodes; it doesn’t directly solve “minimum size for circles”
- If you go this route, you still need a leaf-level inflation strategy (which Option C does explicitly)

---

## ✅ Implementation Notes (current code)

The shipped solution is effectively “Option C, implemented safely”:

- **Iterative re-pack**: run pack once → compute phantom sizes from observed leaf scale → inject phantoms → re-run pack (bounded passes)
- **Two constraints**:
  - **Parent-sibling constraint**: child circle must exceed sibling role size in its parent
  - **Subtree constraint**: circle must be large enough relative to roles anywhere in its subtree (supports nested circles)
- **No post-pack coordinate edits**: avoid any algorithm that changes `x/y` after pack

---

## 📁 Current File State

### `src/lib/modules/org-chart/utils/orgChartTransform.ts`

Contains hierarchy transformation and synthetic-node helpers (`roles_group`, synthetic roles, phantom leaves).

---

### `src/lib/modules/org-chart/components/OrgChart.svelte`

Rendering + interaction layer. It consumes packed nodes and filters phantom nodes so they are never visible.

---

### `src/lib/modules/org-chart/utils/orgChartPackLayout.ts`

Implements the phantom + iterative re-pack strategy:

- Adds phantoms as **children** of the circles that need inflation (not siblings)
- Re-runs pack in bounded passes until constraints converge

---

## 🚨 Critical Lessons Learned

1. **D3 pack ignores values for internal nodes** - This is by design. Internal nodes are sized by enclosure only.

2. **Never modify positions after D3 pack** - D3's layout is mathematically consistent. Modifying x/y coordinates breaks containment and causes overlaps/stacking.

3. **Leaf-level inputs are the correct lever** - To change a circle’s size in pack, change what it must enclose (e.g. phantom leaves), then re-run pack.

4. **Test with nested hierarchies** - Issues compound at deeper levels. A fix that works for 1-level nesting may break at 2+ levels.

---

## 📋 Next Steps for Future Agent

1. **Keep SYOS-905 solution intact**: phantom leaves + iterative re-pack; do not reintroduce post-pack edits.
2. **Follow-up (UX)**: role sizing/packing aesthetics should be handled as separate work.
3. **Follow-up (Zoom)**: semantic scaling for non-SVG elements (`foreignObject` labels, stroke expectations) should be tracked separately.
4. **Always verify invariants**:
   - All circles stay within parent boundaries
   - No sibling overlap
   - Visual hierarchy: circles > sibling roles (including nested cases)

---

## Understanding the roles_group Architecture

The org chart uses **synthetic `roles_group` nodes** to group roles together in D3's pack layout:

```
Root Circle (depth 0)
├── roles_group (depth 1) ← INVISIBLE container
│   ├── Team Lead (depth 2)
│   └── Facilitator (depth 2)
└── Sub-circle (depth 1) ← VISIBLE circle, but sized by enclosure!
    └── roles_group (depth 2) ← INVISIBLE container
        └── Circle Lead (depth 3)
```

**Key insight**: `roles_group` nodes are **invisible containers** - they return `0` as their own value. D3's `.sum()` accumulates children's values.

---

## Related Files

- `src/lib/modules/org-chart/utils/orgChartTransform.ts` - Hierarchy transformation, synthetic node helpers
- `src/lib/modules/org-chart/utils/orgChartPackLayout.ts` - Phantom + iterative re-pack enforcement
- `src/lib/modules/org-chart/components/OrgChart.svelte` - Rendering
- `src/lib/modules/org-chart/utils/orgChartLayout.ts` - Layout utilities

---

## Related Documentation

- D3 Pack Layout: https://d3js.org/d3-hierarchy/pack
- D3 Hierarchy: https://d3js.org/d3-hierarchy
- Circle packing algorithm: radius ∝ √value (for leaf nodes only!)
