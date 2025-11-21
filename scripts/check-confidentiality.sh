#!/bin/bash
# Confidentiality check script
# Scans documentation files for confidential client names
# Used by pre-commit hooks and CI workflows

set -e

echo "🔒 Checking for confidential client information..."
echo ""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Track if we found any violations
VIOLATIONS_FOUND=0

# Client names to check (case-insensitive)
# ⚠️ IMPORTANT: Keep in sync with scripts/confidentiality-config.ts
# To add new clients, update both files:
# 1. scripts/confidentiality-config.ts (add to CONFIDENTIAL_NAMES + SANITIZATION_MAP)
# 2. This array (add to CONFIDENTIAL_NAMES)
CONFIDENTIAL_NAMES=(
	"Saprolab"
	"ZDHC"
	# Add more client names here as needed
)

# Directories to scan
DOC_DIRS=("dev-docs" "marketing-docs")

# File extensions to check
MARKDOWN_EXTENSIONS=(".md" ".mdc")

# Find all markdown files
FILES_TO_CHECK=()

for dir in "${DOC_DIRS[@]}"; do
	if [ -d "$dir" ]; then
		while IFS= read -r -d '' file; do
			FILES_TO_CHECK+=("$file")
		done < <(find "$dir" -type f \( -name "*.md" -o -name "*.mdc" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/backup/*" -not -path "*/.backup/*" -print0)
	fi
done

if [ ${#FILES_TO_CHECK[@]} -eq 0 ]; then
	echo -e "${YELLOW}⚠️  No markdown files found to check${NC}"
	echo ""
	exit 0
fi

echo "📋 Scanning ${#FILES_TO_CHECK[@]} markdown files..."
echo ""

# Check each file
for file in "${FILES_TO_CHECK[@]}"; do
	for name in "${CONFIDENTIAL_NAMES[@]}"; do
		# Use grep to find matches (case-insensitive, word boundaries)
		MATCHES=$(grep -n -i "\b${name}\b" "$file" 2>/dev/null || true)
		
		if [ ! -z "$MATCHES" ]; then
			if [ $VIOLATIONS_FOUND -eq 0 ]; then
				echo -e "${RED}❌ Confidential client names found:${NC}"
				echo ""
			fi
			
			echo -e "${RED}  File: $file${NC}"
			echo "$MATCHES" | while IFS= read -r line; do
				echo -e "    ${YELLOW}Line ${line}${NC}"
			done
			echo ""
			
			VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
		fi
	done
done

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $VIOLATIONS_FOUND -eq 0 ]; then
	echo -e "${GREEN}✅ No confidential information detected!${NC}"
	echo ""
	echo "All documentation files are clean."
	echo ""
	exit 0
else
	echo -e "${RED}❌ Found $VIOLATIONS_FOUND file(s) with confidential client names${NC}"
	echo ""
	echo "Please sanitize these files before committing:"
	echo "  Run: npx tsx scripts/sanitize-docs.ts --apply"
	echo ""
	echo "See: dev-docs/2-areas/confidentiality-guidelines.md for details"
	echo ""
	exit 1
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

