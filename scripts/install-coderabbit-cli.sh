#!/bin/bash
# Install CodeRabbit CLI
# https://www.coderabbit.ai/cli

set -e

echo "🚀 Installing CodeRabbit CLI..."
echo ""

# Install CodeRabbit CLI
curl -fsSL https://cli.coderabbit.ai/install.sh | sh

echo ""
echo "✅ CodeRabbit CLI installed successfully!"
echo ""
echo "Next steps:"
echo "  1. Run 'coderabbit review' to review uncommitted changes"
echo "  2. Run 'npm run review' for a quick review"
echo "  3. Run 'npm run review:staged' to review only staged changes"
echo "  4. Run 'npm run review:plain' for plain output (AI agent compatible)"
echo ""
echo "See dev-docs/2-areas/development/tools/coderabbit-integration.md for full documentation."

