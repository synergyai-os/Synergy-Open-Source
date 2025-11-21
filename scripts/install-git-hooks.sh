#!/bin/bash
# Install git safety hooks
#
# This script installs pre-checkout and pre-push hooks to prevent
# accidental branch switching and validate branch naming conventions.

set -e

HOOKS_DIR=".git/hooks"
SCRIPTS_DIR="scripts/git-hooks"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
  echo "❌ Error: Not in a git repository"
  exit 1
fi

# Create hooks directory if needed
mkdir -p "$HOOKS_DIR"

# Copy hooks
if [ -f "$SCRIPTS_DIR/pre-checkout" ]; then
  cp "$SCRIPTS_DIR/pre-checkout" "$HOOKS_DIR/pre-checkout"
  chmod +x "$HOOKS_DIR/pre-checkout"
  echo "✅ Installed pre-checkout hook"
else
  echo "⚠️  Warning: pre-checkout hook not found at $SCRIPTS_DIR/pre-checkout"
fi

if [ -f "$SCRIPTS_DIR/pre-push" ]; then
  cp "$SCRIPTS_DIR/pre-push" "$HOOKS_DIR/pre-push"
  chmod +x "$HOOKS_DIR/pre-push"
  echo "✅ Installed pre-push hook"
else
  echo "⚠️  Warning: pre-push hook not found at $SCRIPTS_DIR/pre-push"
fi

echo ""
echo "✅ Git safety hooks installed successfully"
echo ""
echo "Hooks installed:"
echo "  - pre-checkout: Blocks branch switch with uncommitted changes"
echo "  - pre-push: Validates branch naming conventions"
echo ""
echo "To bypass hooks (not recommended):"
echo "  - Checkout: git checkout --no-verify branch-name"
echo "  - Push: git push --no-verify"

