#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Headless-safe: suppress Qt apps that crash without a display (e.g. system 'vite' binary)
export QT_QPA_PLATFORM=offscreen
export DISPLAY="${DISPLAY:-:0}"

# Local node_modules/.bin before system PATH so npm scripts use the right binaries
export PATH="$SCRIPT_DIR/client/node_modules/.bin:$SCRIPT_DIR/server/node_modules/.bin:$PATH"

# Sync dependencies
echo "[portfolio] Syncing dependencies..."
(cd "$SCRIPT_DIR/client" && npm install --prefer-offline 2>&1 | grep -v "^npm warn\|^added\|^up to date\|^changed\|^found\|funding" || true)
(cd "$SCRIPT_DIR/server" && npm install --prefer-offline 2>&1 | grep -v "^npm warn\|^added\|^up to date\|^changed\|^found\|funding" || true)

# Build client
echo "[portfolio] Building client..."
(cd "$SCRIPT_DIR/client" && npm run build)

# Start server (auto-selects port: 443 → 8443 → 4443 → 3000)
exec node "$SCRIPT_DIR/server/src/index.js"
