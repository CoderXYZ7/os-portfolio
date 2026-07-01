#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Headless-safe Qt env (some native deps/binaries require this on servers without a display)
export QT_QPA_PLATFORM=offscreen
export DISPLAY="${DISPLAY:-:0}"

# Ensure local node_modules/.bin takes priority over system binaries (e.g. system 'vite' Qt app)
export PATH="$SCRIPT_DIR/client/node_modules/.bin:$SCRIPT_DIR/server/node_modules/.bin:$PATH"

# Install / sync dependencies
echo "[portfolio] Syncing dependencies..."
(cd "$SCRIPT_DIR/client" && npm install --prefer-offline 2>&1 | grep -v "^npm warn\|^added\|^up to date\|^changed" || true)
(cd "$SCRIPT_DIR/server" && npm install --prefer-offline 2>&1 | grep -v "^npm warn\|^added\|^up to date\|^changed" || true)

# Build client (always rebuild to pick up any source changes)
echo "[portfolio] Building client..."
(cd "$SCRIPT_DIR/client" && npm run build)

# Try port 443 first; if EACCES fall back with instructions
if node -e "require('net').createServer().listen(443, () => process.exit(0))" 2>/dev/null; then
  PORT=443
  echo "[portfolio] Starting on http://localhost:443/portfolio"
  exec node "$SCRIPT_DIR/server/src/index.js"
else
  echo ""
  echo "  Port 443 requires elevated privileges."
  echo "  Options:"
  echo "    sudo node server/src/index.js"
  echo "    sudo setcap cap_net_bind_service=+ep \$(which node)  # permanent, then re-run"
  echo ""
  echo "  Starting on http://localhost:4443/portfolio instead..."
  echo ""
  PORT=4443 exec node "$SCRIPT_DIR/server/src/index.js"
fi
