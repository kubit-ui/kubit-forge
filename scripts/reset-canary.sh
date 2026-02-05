#!/bin/bash

# Script to reset canary prerelease state
# Run this to fix broken canary versions

echo "🔧 Resetting canary prerelease state..."

# 1. Exit prerelease mode if active
if [ -f ".changeset/pre.json" ]; then
  echo "📦 Exiting prerelease mode..."
  pnpm changeset pre exit
  rm -f .changeset/pre.json
fi

# 2. Remove any canary changesets
echo "🗑️  Removing canary changesets..."
rm -f .changeset/canary-*.md

# 3. Reset package.json version to base version
echo "📝 Resetting package.json version..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '0.0.1';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

echo "✅ Canary state reset complete!"
echo ""
echo "Next steps:"
echo "1. git add ."
echo "2. git commit -m 'chore: reset canary prerelease state'"
echo "3. git push"
echo ""
echo "The next push to develop/next will start fresh with 0.0.1-canary.0"
