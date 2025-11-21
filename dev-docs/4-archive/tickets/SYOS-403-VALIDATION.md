# SYOS-403 Validation Guide

## Quick Validation (Browser Dev Tools)

### Step 1: Open Browser Dev Tools

1. Start dev server: `npm run dev`
2. Open any page with buttons (e.g., `/meetings`, `/inbox`, `/admin/rbac`)
3. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows) to open Dev Tools

### Step 2: Check CSS Token Value

**Method 1: Inspect CSS Variable**

1. Right-click any button (e.g., "Join meeting", "Start", "Export to Docs")
2. Select "Inspect Element"
3. In Dev Tools, look at the "Computed" tab
4. Find `padding-inline` or `padding-left`/`padding-right`
5. **Expected**: Should show `24px` (not `48px`)

**Method 2: Check CSS Variable Directly**

1. Open Console tab in Dev Tools
2. Paste this command:

```javascript
getComputedStyle(document.documentElement).getPropertyValue('--spacing-button-x');
```

3. **Expected**: Should return `1.5rem` (which equals 24px)
4. **If wrong**: Would return `3rem` (48px) - indicates bug not fixed

**Method 3: Check Base Scale Token**

```javascript
getComputedStyle(document.documentElement).getPropertyValue('--spacing-6');
```

**Expected**: Should return `1.5rem` (24px)

### Step 3: Visual Comparison

**Before Fix**: Buttons had 48px horizontal padding (too wide)
**After Fix**: Buttons have 24px horizontal padding (correct per spec)

**What to Look For:**

- Buttons should look **narrower** (less padding on left/right)
- Text inside buttons should be closer to edges
- Buttons should still be readable and not too cramped

### Step 4: Verify Chip Tokens (No Visual Change Expected)

```javascript
// Check Chip tokens reference base scale
console.log(
	'Chip X:',
	getComputedStyle(document.documentElement).getPropertyValue('--spacing-chip-x')
);
console.log(
	'Chip Gap:',
	getComputedStyle(document.documentElement).getPropertyValue('--spacing-chip-gap')
);
console.log(
	'Base spacing-2:',
	getComputedStyle(document.documentElement).getPropertyValue('--spacing-2')
);
console.log(
	'Base spacing-1:',
	getComputedStyle(document.documentElement).getPropertyValue('--spacing-1')
);
```

**Expected Output:**

- `Chip X:` should equal `Base spacing-2:` (both `0.5rem` = 8px)
- `Chip Gap:` should equal `Base spacing-1:` (both `0.25rem` = 4px)

---

## Automated Validation Script

Copy this into browser console to validate all changes:

```javascript
// SYOS-403 Validation Script
const root = document.documentElement;
const styles = getComputedStyle(root);

console.log('=== SYOS-403 Validation ===\n');

// Part 1: Base Scale Tokens
console.log('Part 1: Base Spacing Scale');
const baseTokens = {
	'spacing-0': '0',
	'spacing-1': '0.25rem',
	'spacing-2': '0.5rem',
	'spacing-3': '0.75rem',
	'spacing-4': '1rem',
	'spacing-5': '1.25rem',
	'spacing-6': '1.5rem',
	'spacing-8': '2rem',
	'spacing-10': '2.5rem',
	'spacing-12': '3rem',
	'spacing-16': '4rem',
	'spacing-20': '5rem',
	'spacing-24': '6rem',
	'spacing-28': '7rem',
	'spacing-32': '8rem'
};

let baseScalePass = true;
for (const [token, expected] of Object.entries(baseTokens)) {
	const actual = styles.getPropertyValue(`--${token}`).trim();
	const pass = actual === expected;
	console.log(`${pass ? '✅' : '❌'} --${token}: ${actual} (expected: ${expected})`);
	if (!pass) baseScalePass = false;
}

// Part 2: Button Bug Fix
console.log('\nPart 2: Button Width Bug Fix');
const buttonX = styles.getPropertyValue('--spacing-button-x').trim();
const spacing6 = styles.getPropertyValue('--spacing-6').trim();
const buttonFixPass = buttonX === spacing6 && buttonX === '1.5rem';
console.log(
	`${buttonFixPass ? '✅' : '❌'} --spacing-button-x: ${buttonX} (should equal --spacing-6: ${spacing6})`
);
console.log(`${buttonFixPass ? '✅' : '❌'} Button padding: 24px (was 48px bug)`);

// Part 3: Chip Token Conversion
console.log('\nPart 3: Chip Token Conversion');
const chipX = styles.getPropertyValue('--spacing-chip-x').trim();
const chipGap = styles.getPropertyValue('--spacing-chip-gap').trim();
const chipXPass =
	chipX === 'var(--spacing-2)' || chipX === styles.getPropertyValue('--spacing-2').trim();
const chipGapPass =
	chipGap === 'var(--spacing-1)' || chipGap === styles.getPropertyValue('--spacing-1').trim();
console.log(`${chipXPass ? '✅' : '❌'} --spacing-chip-x: ${chipX} (should reference --spacing-2)`);
console.log(
	`${chipGapPass ? '✅' : '❌'} --spacing-chip-gap: ${chipGap} (should reference --spacing-1)`
);

// Summary
console.log('\n=== Summary ===');
console.log(`Base Scale: ${baseScalePass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Button Fix: ${buttonFixPass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Chip Conversion: ${chipXPass && chipGapPass ? '✅ PASS' : '❌ FAIL'}`);

const allPass = baseScalePass && buttonFixPass && chipXPass && chipGapPass;
console.log(`\n${allPass ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}`);
```

---

## Expected Results

### ✅ All Checks Should Pass:

1. **Base Scale**: All 15 tokens present with correct values
2. **Button Fix**: `--spacing-button-x` = `var(--spacing-6)` = `1.5rem` (24px)
3. **Chip Conversion**: `--spacing-chip-x` and `--spacing-chip-gap` reference base scale

### Visual Changes:

- **Buttons**: Narrower (24px padding instead of 48px)
- **Chips**: No visual change (same values, just converted to references)

---

## Rollback (If Issues Found)

If buttons look broken or too narrow:

```bash
git checkout src/app.css
```

Then restart dev server.
