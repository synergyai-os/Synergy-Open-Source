#!/bin/bash

# Documentation Cleanup Script
# Moves files to archive and deletes obsolete docs
# Based on DOCUMENTATION-AUDIT-2025.md

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ARCHIVE_DIR="$PROJECT_ROOT/dev-docs/archive/2025-01"

echo "📚 Documentation Cleanup Script"
echo "================================"
echo ""

# Create archive structure
echo "Creating archive directory structure..."
mkdir -p "$ARCHIVE_DIR"/{analysis,tickets,drafts,domain-alignment,implementation,ai-docs,modules,admin}

# Function to move file with confirmation
move_to_archive() {
    local src="$1"
    local dest_dir="$2"
    local filename=$(basename "$src")
    
    if [ -f "$PROJECT_ROOT/$src" ]; then
        echo "  📦 $src → archive/$dest_dir/"
        mkdir -p "$ARCHIVE_DIR/$dest_dir"
        mv "$PROJECT_ROOT/$src" "$ARCHIVE_DIR/$dest_dir/$filename"
    else
        echo "  ⚠️  Not found: $src"
    fi
}

# Function to delete file
delete_file() {
    local file="$1"
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo "  🗑️  Deleting: $file"
        rm "$PROJECT_ROOT/$file"
    else
        echo "  ⚠️  Not found: $file"
    fi
}

echo ""
echo "Phase 1: Moving root-level analysis files..."
move_to_archive "CONVEX-ARCHITECTURE-ALIGNMENT-ANALYSIS.md" "analysis"
move_to_archive "CORE-ARCHITECTURE-GAP-ANALYSIS.md" "analysis"
move_to_archive "FEATURE-FLAGS-ANALYSIS.md" "analysis"
move_to_archive "IMPLEMENTATION-STATE-RESEARCH.md" "analysis"
move_to_archive "INVARIANTS-IMPLEMENTATION-ANALYSIS.md" "analysis"
move_to_archive "LEGACY-FILES-AUDIT.md" "analysis"
move_to_archive "ONBOARDING-STATE-MANAGEMENT-PROPOSAL.md" "analysis"
move_to_archive "ORG-CHART-SIZING-SOLUTION.md" "analysis"
move_to_archive "PRE-COMMIT-DIAGNOSTIC.md" "analysis"
move_to_archive "SEED-SCRIPTS-ANALYSIS.md" "analysis"
move_to_archive "WORKSPACE-INITIALIZATION-RESEARCH.md" "analysis"

echo ""
echo "Phase 2: Moving ticket-specific docs..."
move_to_archive "SYOS-636-IMPLEMENTATION-SUMMARY.md" "tickets"
move_to_archive "SYOS-636-QUICK-START.md" "tickets"
move_to_archive "SYOS-842-VIOLATIONS.md" "tickets"
move_to_archive "convex/admin/SYOS-839-DECISIONS.md" "tickets"

echo ""
echo "Phase 3: Moving draft documentation..."
if [ -d "$PROJECT_ROOT/dev-docs/draft_claude" ]; then
    echo "  📦 dev-docs/draft_claude/ → archive/drafts/"
    mv "$PROJECT_ROOT/dev-docs/draft_claude" "$ARCHIVE_DIR/drafts/"
fi

echo ""
echo "Phase 4: Moving domain-specific analysis files..."
move_to_archive "convex/core/circles/ARCHITECTURE-ALIGNMENT-ANALYSIS.md" "domain-alignment"
move_to_archive "convex/core/circles/ARCHITECTURE-ALIGNMENT-PLAN.md" "domain-alignment"
move_to_archive "convex/core/circles/CONSTANTS-ANALYSIS.md" "domain-alignment"
move_to_archive "convex/core/circles/CONSTANTS-MIGRATION.md" "domain-alignment"
move_to_archive "convex/core/circles/ESLINT-VIOLATIONS-REPORT.md" "domain-alignment"
move_to_archive "convex/core/circles/FINAL-REVIEW.md" "domain-alignment"
move_to_archive "convex/core/circles/PHASE-1-COMPLETE.md" "domain-alignment"
move_to_archive "convex/core/circles/PHASE-2-COMPLETE.md" "domain-alignment"
move_to_archive "convex/core/proposals/ARCHITECTURE-ALIGNMENT-ANALYSIS.md" "domain-alignment"
move_to_archive "convex/core/proposals/ARCHITECTURE-ALIGNMENT-PLAN.md" "domain-alignment"
move_to_archive "convex/core/roles/ARCHITECTURE-ALIGNMENT-ANALYSIS.md" "domain-alignment"
move_to_archive "convex/core/users/ARCHITECTURE-ALIGNMENT-ANALYSIS.md" "domain-alignment"
move_to_archive "convex/core/users/ARCHITECTURE-ALIGNMENT-PLAN.md" "domain-alignment"

echo ""
echo "Phase 5: Moving AI documentation..."
move_to_archive "ai-docs/audits/architecture-baseline.md" "ai-docs"
move_to_archive "ai-docs/audits/naming-baseline.md" "ai-docs"
move_to_archive "ai-docs/lessons-learned/patterns-and-lessons.md" "ai-docs"
move_to_archive "ai-docs/reference/ANALYSIS-mem-ai-documentation-system.md" "ai-docs"
move_to_archive "ai-docs/reference/ANALYSIS-save-command-pattern-documentation.md" "ai-docs"

echo ""
echo "Phase 6: Moving module implementation plans..."
move_to_archive "src/lib/modules/meetings/docs/architecture_audit.md" "modules"
move_to_archive "src/lib/modules/meetings/docs/implementation-plan.md" "modules"
move_to_archive "src/lib/modules/meetings/docs/nice-to-have.md" "modules"
move_to_archive "src/lib/modules/org-chart/DESIGN_SYSTEM_FIX_PLAN.md" "modules"
move_to_archive "src/lib/modules/org-chart/components/import/COMPONENT_STRUCTURE.md" "modules"
move_to_archive "src/lib/modules/org-chart/components/import/TEST_PLAN.md" "modules"
move_to_archive "src/lib/modules/org-chart/docs/EDIT_CIRCLE_IMPLEMENTATION.md" "modules"

echo ""
echo "Phase 7: Moving script & migration docs..."
move_to_archive "scripts/REFACTOR-ORGS-TO-WORKSPACES.md" "implementation"
move_to_archive "scripts/validate-phase2c.md" "implementation"
move_to_archive "scripts/tests/bug-catalog-analysis.md" "implementation"
move_to_archive "scripts/tests/bug-catalog-summary.md" "implementation"

echo ""
echo "Phase 8: Moving admin docs..."
move_to_archive "convex/admin/LEGACY-CLEANUP.md" "admin"
move_to_archive "convex/admin/RESET-WORKSPACE.md" "admin"
move_to_archive "convex/admin/invariants/VIOLATIONS-LOG.md" "admin"

echo ""
echo "Phase 9: Moving technical-design docs..."
move_to_archive "dev-docs/technical-design/architectural-validation-system.md" "implementation"
move_to_archive "dev-docs/technical-design/locale-preferences-analysis.md" "implementation"
move_to_archive "dev-docs/technical-design/operating-modes-customizable-labels.md" "implementation"

echo ""
echo "Phase 10: Moving org-chart implementation detail..."
move_to_archive "src/lib/modules/org-chart/navigation-control.md" "modules"

echo ""
echo "Phase 11: Auto-archiving SYOS ticket files (dynamic discovery)..."
# Find all SYOS-*.md files in root and archive them
SYOS_COUNT=0
ROOT_COUNT=0
OTHER_COUNT=0
while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    # Skip if already in archive
    if [ ! -f "$ARCHIVE_DIR/tickets/$filename" ]; then
        echo "  📦 $filename → archive/tickets/"
        mkdir -p "$ARCHIVE_DIR/tickets"
        mv "$file" "$ARCHIVE_DIR/tickets/$filename"
        ((SYOS_COUNT++))
    fi
done < <(find "$PROJECT_ROOT" -maxdepth 1 -name "SYOS-*.md" -type f -print0 2>/dev/null)
if [ $SYOS_COUNT -eq 0 ]; then
    echo "  ℹ️  No new SYOS-*.md files found (already archived)"
else
    echo "  ✅ Archived $SYOS_COUNT SYOS ticket file(s)"
fi

echo ""
echo "Phase 12: Auto-archiving ROOT-*.md analysis files (dynamic discovery)..."
# Find all ROOT-*.md files in root and archive them
while IFS= read -r -d '' file; do
    filename=$(basename "$file")
    # Skip if already in archive
    if [ ! -f "$ARCHIVE_DIR/analysis/$filename" ]; then
        echo "  📦 $filename → archive/analysis/"
        mkdir -p "$ARCHIVE_DIR/analysis"
        mv "$file" "$ARCHIVE_DIR/analysis/$filename"
        ((ROOT_COUNT++))
    fi
done < <(find "$PROJECT_ROOT" -maxdepth 1 -name "ROOT-*.md" -type f -print0 2>/dev/null)
if [ $ROOT_COUNT -eq 0 ]; then
    echo "  ℹ️  No new ROOT-*.md files found (already archived)"
else
    echo "  ✅ Archived $ROOT_COUNT ROOT-*.md file(s)"
fi

echo ""
echo "Phase 13: Auto-archiving other analysis/report files (dynamic discovery)..."
# Archive other common analysis patterns (excluding README.md)
OTHER_PATTERNS=(
    "*-ANALYSIS.md"
    "*-REPORT.md"
    "*-investigation.md"
    "*-implementation-summary.md"
    "*-refactoring-summary.md"
    "*-manual-testing-guide.md"
    "*-ALIGNMENT-PROPOSAL.md"
    "*-URL-ALIGNMENT-FIX.md"
    "*-FIXES.md"
    "*-COMPLETE.md"
    "*-dataflow-report.md"
    "CIRCLES-PAGE-ANALYSIS.md"
    "FLOW-CHART-TO-PURPOSE-EDIT.md"
    "INVESTIGATION-REPORT.md"
    "root-cause.md"
    "template-usage-analysis-report.md"
    "openModal-createWorkspace-dataflow-report.md"
    "STACKED-PANEL-DOCUMENTATION.md"
)
OTHER_COUNT=0
for pattern in "${OTHER_PATTERNS[@]}"; do
    while IFS= read -r -d '' file; do
        filename=$(basename "$file")
        # Skip README.md and files already in archive
        if [ "$filename" != "README.md" ] && [ ! -f "$ARCHIVE_DIR/analysis/$filename" ]; then
            echo "  📦 $filename → archive/analysis/"
            mkdir -p "$ARCHIVE_DIR/analysis"
            mv "$file" "$ARCHIVE_DIR/analysis/$filename"
            ((OTHER_COUNT++))
        fi
    done < <(find "$PROJECT_ROOT" -maxdepth 1 -name "$pattern" -type f -print0 2>/dev/null)
done
if [ $OTHER_COUNT -eq 0 ]; then
    echo "  ℹ️  No new analysis/report files found (already archived)"
else
    echo "  ✅ Archived $OTHER_COUNT analysis/report file(s)"
fi

echo ""
echo "Phase 14: Deleting obsolete files..."
delete_file ".ci-test.md"
delete_file "dev-docs/2-areas/patterns/patterns-and-lessons.md"  # Duplicate

# Delete empty directories if they exist
echo ""
echo "Cleaning up empty directories..."
find "$PROJECT_ROOT/ai-docs" -type d -empty -delete 2>/dev/null || true
find "$PROJECT_ROOT/src/lib/modules/org-chart/components/import" -type d -empty -delete 2>/dev/null || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Summary:"
echo "  - Files archived: See dev-docs/archive/2025-01/"
echo "  - SYOS tickets: $SYOS_COUNT file(s)"
echo "  - ROOT analysis: $ROOT_COUNT file(s)"
echo "  - Other analysis/reports: $OTHER_COUNT file(s)"
echo "  - Files deleted: See Phase 14 above"
echo ""
echo "Archive structure:"
echo "  📁 dev-docs/archive/2025-01/"
echo "    ├── tickets/     → SYOS-*.md files"
echo "    ├── analysis/    → ROOT-*.md and analysis files"
echo "    ├── modules/     → Module implementation docs"
echo "    ├── implementation/ → Script & migration docs"
echo "    └── ...          → Other categories"
echo ""
echo "Next steps:"
echo "  1. Review archived files"
echo "  2. Update AI project context to exclude archive/"
echo "  3. Verify no broken links"
echo "  4. Commit changes"

exit 0                                                                                                                                                                                                                                                                  