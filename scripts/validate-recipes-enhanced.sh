#!/bin/bash

# Enhanced Recipe Validation Script
# Purpose: Catch recipe-specific violations (opacity modifiers, missing tokens, visual distinction)
# Status: Manual checks (automation planned - SYOS-541)

echo "🔍 Enhanced Recipe Validation"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check #1: Opacity Modifiers on Custom Utilities
echo "Check #1: Opacity Modifiers on Custom Utilities"
echo "-----------------------------------------------"

OPACITY_MODIFIERS=$(grep -rn -E '(bg-|text-|border-)[a-z-]+/[0-9]+' src/lib/design-system/recipes/*.recipe.ts 2>/dev/null)

if [ -z "$OPACITY_MODIFIERS" ]; then
    echo -e "${GREEN}✓ No opacity modifiers found${NC}"
else
    echo -e "${RED}✗ Found opacity modifiers (unreliable in Tailwind CSS 4):${NC}"
    echo "$OPACITY_MODIFIERS"
    echo ""
    echo -e "${YELLOW}Fix: Remove /10, /20 modifiers. Use Tailwind built-in opacity instead:${NC}"
    echo "  - disabled:opacity-disabled"
    echo "  - opacity-50"
    echo "  - Or use solid background tokens: bg-accent-primary, bg-warning"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check #2: Missing Background Tokens
echo "Check #2: Background Token Existence"
echo "------------------------------------"

# Extract all bg-* classes from recipes
BG_CLASSES=$(grep -roh 'bg-[a-z-]*' src/lib/design-system/recipes/*.recipe.ts 2>/dev/null | sort -u)

MISSING_TOKENS=""
for CLASS in $BG_CLASSES; do
    # Check if @utility exists in src/app.css OR generated utility files
    if ! grep -q "^@utility $CLASS" src/app.css src/styles/utilities/*.css 2>/dev/null; then
        MISSING_TOKENS="$MISSING_TOKENS\n  - $CLASS"
    fi
done

if [ -z "$MISSING_TOKENS" ]; then
    echo -e "${GREEN}✓ All background tokens exist${NC}"
else
    echo -e "${RED}✗ Missing background tokens:${NC}"
    echo -e "$MISSING_TOKENS"
    echo ""
    echo -e "${YELLOW}Fix: Add missing tokens to design-tokens-base.json, then run npm run tokens:build${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check #3: Visual Distinction (manual inspection required)
echo "Check #3: Visual Distinction (Manual Inspection)"
echo "-----------------------------------------------"
echo -e "${YELLOW}⚠ Manual check required:${NC}"
echo "  1. Open each recipe file"
echo "  2. Verify variants have DISTINCT backgrounds"
echo "  3. No two variants should use identical bg-* classes"
echo ""

# Summary
echo "========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Enhanced validation passed!${NC}"
    echo ""
    echo -e "${YELLOW}Note: Check #3 (visual distinction) requires manual inspection${NC}"
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS issue(s)${NC}"
    echo ""
    echo "Please fix the issues above and re-run validation."
    exit 1
fi

