# Bug Catalog Analysis

## Summary

- **Total Violations**: 41 (from analysis) vs 142 (from validation script)
- **Discrepancy**: Validation script may be counting duplicates or different contexts

## Violations by Context

### 1. Plain Text (14 violations) - CRITICAL BUG

**Root Cause**: Standalone regex not catching utilities in plain text
**Examples**:

- `px-button-x utility updates automatically` (line 53)
- `Usage: px-button-x utility class` (line 176)
- `- p-[12px] → p-button-icon (already exists)` (line 314)

**Why Fix Script Fails**:

- Standalone regex checks if inside quotes/backticks
- But plain text violations are NOT in quotes
- Regex should match but isn't

**Fix Required**: Improve standalone regex to catch plain text violations

### 2. Class Attribute (13 violations) - PARTIAL BUG

**Root Cause**: Class attribute regex not catching all cases
**Examples**:

- `<div class="px-2 py-1.5 bg-gray-900 text-white">` (line 189)
- `<button class="px-button-padding-md py-button-padding-sm">` (line 499)

**Why Fix Script Fails**:

- Class regex should work but may have edge cases
- Multiple utilities in one class attribute
- Utilities at start/middle/end of class attribute

**Fix Required**: Test class regex on all cases, fix edge cases

### 3. Unknown Context (11 violations) - INVESTIGATION NEEDED

**Root Cause**: Context detection failing
**Examples**:

- `<div class="flex items-center justify-between gap-icon-wide">` (line 243)
- `py-button-padding-sm` in unknown context

**Why Fix Script Fails**:

- Context detection logic may be wrong
- Need to investigate actual context

**Fix Required**: Improve context detection, investigate actual contexts

### 4. Inline Code (2 violations) - PARTIAL BUG

**Root Cause**: Inline code regex may not catch all cases
**Examples**:

- `` `gap-icon-wide` `` (line 286)

**Why Fix Script Fails**:

- Inline code regex should work but may have edge cases

**Fix Required**: Test inline code regex, fix edge cases

### 5. HTML Comment (1 violation) - EDGE CASE

**Root Cause**: HTML comments not handled
**Examples**:

- `<!-- Uses var(--spacing-button-x) -->` (line 276)

**Why Fix Script Fails**:

- HTML comments not in quotes/code blocks
- Standalone regex may skip HTML comments

**Fix Required**: Handle HTML comments explicitly

## Violations by Utility

### High Priority (5+ violations)

- `px-button-x`: 5 violations (plain-text, class-attribute)
- `py-button-y`: 4 violations (html-comment, plain-text, unknown)
- `p-button-icon`: 4 violations (plain-text, class-attribute)

### Medium Priority (2-4 violations)

- `gap-icon-wide`: 3 violations (unknown, inline-code)
- `text-sm`: 2 violations (class-attribute, plain-text)
- `text-lg`: 2 violations (class-attribute, plain-text)
- `border-b`: 2 violations (unknown)
- `border-2`: 2 violations (plain-text)
- `px-button-padding-md`: 2 violations (class-attribute)
- `py-button-padding-sm`: 2 violations (plain-text, unknown)
- `text-xl`: 2 violations (class-attribute, unknown)
- `text-center`: 2 violations (plain-text)

## Root Cause Analysis

### Bug #1: Plain Text Violations Not Caught

**Root Cause**: Standalone regex logic may be skipping plain text
**Impact**: 14 violations (34% of total)
**Priority**: CRITICAL

### Bug #2: Context Detection Failing

**Root Cause**: Context detection logic may be wrong
**Impact**: 11 violations (27% of total)
**Priority**: HIGH

### Bug #3: Class Attribute Edge Cases

**Root Cause**: Class regex may not handle all edge cases
**Impact**: 13 violations (32% of total)
**Priority**: HIGH

### Bug #4: HTML Comments Not Handled

**Root Cause**: HTML comments not explicitly handled
**Impact**: 1 violation (2% of total)
**Priority**: LOW

## Fix Strategy

### Phase 1: Fix Plain Text Violations (CRITICAL)

1. Debug standalone regex
2. Test on plain text violations
3. Fix root cause
4. Validate fixes

### Phase 2: Fix Context Detection (HIGH)

1. Investigate "unknown" contexts
2. Improve context detection logic
3. Test on all violations
4. Validate fixes

### Phase 3: Fix Class Attribute Edge Cases (HIGH)

1. Test class regex on all cases
2. Fix edge cases
3. Validate fixes

### Phase 4: Fix HTML Comments (LOW)

1. Handle HTML comments explicitly
2. Test
3. Validate fixes

## Success Criteria

- All 41 violations fixed
- Fix script catches all contexts
- No regressions
- Validation passes
