#!/bin/bash
set -e

# Build Storybook
echo "Building Storybook..."
npm run build-storybook

# Start server in background
echo "Starting Storybook server..."
npx serve storybook-static -p 6006 -s &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to be ready..."
sleep 5

# Run tests
echo "Running visual regression tests..."
npm run test:storybook:run || TEST_EXIT_CODE=$?

# Cleanup: kill server
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null || true

# Exit with test result
exit ${TEST_EXIT_CODE:-0}

