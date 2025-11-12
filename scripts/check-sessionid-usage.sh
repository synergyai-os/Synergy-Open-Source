#!/bin/bash
# Script to detect potential sessionId migration issues
# Run this before committing to catch missed userId → sessionId conversions

set -e

echo "🔍 Checking for potential sessionId migration issues..."
echo ""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Track if we found any issues
ISSUES_FOUND=0

# 1. Check for userId being passed to migrated Convex functions
echo "📋 Checking for userId passed to migrated functions..."
echo ""

MIGRATED_FUNCTIONS=(
  "createNote"
  "updateNote"
  "deleteNote"
  "listNotes"
  "getNote"
  "getUserSettings"
  "updateTheme"
  "deleteClaudeApiKey"
  "deleteReadwiseApiKey"
  "listInboxItems"
  "getInboxItem"
  "markProcessed"
  "getSyncProgress"
  "createNoteInInbox"
  "createFlashcardInInbox"
  "createHighlightInInbox"
)

for func in "${MIGRATED_FUNCTIONS[@]}"; do
  # Search for userId being passed to these functions in client code
  MATCHES=$(grep -rn "api\.$func.*userId" src/ 2>/dev/null || true)
  MATCHES2=$(grep -rn "$func.*{.*userId" src/ 2>/dev/null || true)
  
  if [ ! -z "$MATCHES" ] || [ ! -z "$MATCHES2" ]; then
    echo -e "${RED}❌ Found userId passed to $func (should use sessionId):${NC}"
    echo "$MATCHES"
    echo "$MATCHES2"
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi
done

# 2. Check for components that might need sessionId prop
echo "📦 Checking component props..."
echo ""

# Find components that use Convex mutations/queries
COMPONENTS_WITH_CONVEX=$(grep -rl "api\." src/lib/components/ src/routes/ 2>/dev/null || true)

for file in $COMPONENTS_WITH_CONVEX; do
  # Check if component has userId prop but uses migrated functions
  HAS_USERID_PROP=$(grep "userId.*:" "$file" | grep -v "convexUserId" || true)
  USES_MIGRATED=$(grep -E "(createNote|updateNote|listNotes|listInboxItems|markProcessed)" "$file" || true)
  
  if [ ! -z "$HAS_USERID_PROP" ] && [ ! -z "$USES_MIGRATED" ]; then
    echo -e "${YELLOW}⚠️  Component may need sessionId instead of userId: $file${NC}"
    echo ""
  fi
done

# 3. Check Convex function args still using userId
echo "🔧 Checking Convex function signatures..."
echo ""

CONVEX_FILES=$(find convex/ -name "*.ts" ! -name "*.test.ts" ! -path "convex/_generated/*" 2>/dev/null || true)

for file in $CONVEX_FILES; do
  # Look for functions with userId in args that aren't internal functions
  USERID_ARGS=$(grep -n "userId: v.id('users')" "$file" | grep -v "internalQuery\|internalMutation" || true)
  
  if [ ! -z "$USERID_ARGS" ]; then
    echo -e "${YELLOW}⚠️  Found userId arg (may need migration): $file${NC}"
    echo "$USERID_ARGS"
    echo ""
  fi
done

# 4. Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ No sessionId migration issues detected!${NC}"
  echo ""
  echo "All checks passed. Safe to commit."
else
  echo -e "${RED}❌ Found $ISSUES_FOUND potential issues${NC}"
  echo ""
  echo "Please review the issues above before committing."
  echo "These may cause ArgumentValidationError at runtime."
  exit 1
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

