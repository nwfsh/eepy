#!/usr/bin/env bash
# Pulls latest code, updates deps if needed, then starts the backend and the
# Expo app (tunnel mode) together. Ctrl+C stops both.
# Usage: ./dev.sh            (expo start --tunnel)
#        ./dev.sh --lan      (any expo flags you pass replace --tunnel)
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# pull latest code (fast-forward only, so it never makes a merge or touches your local changes)
echo "checking for updates..."
git -C "$ROOT" pull --ff-only || echo "couldn't pull automatically (offline or branches diverged), skipping"

# install deps if they're missing or package-lock.json changed since the last install
install_if_needed() {
  local dir="$1"
  if [ ! -d "$dir/node_modules" ] || [ "$dir/package-lock.json" -nt "$dir/node_modules/.package-lock.json" ]; then
    echo "updating deps in ${dir#$ROOT/}..."
    (cd "$dir" && npm install)
  fi
}
install_if_needed "$ROOT/backend"
install_if_needed "$ROOT/frontend/app"

# on exit, kill everything this script started (backend + expo)
cleanup() {
  trap - EXIT INT TERM
  echo "stopping everything..."
  kill 0 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# backend runs in the background, its logs prefixed with [backend]
(cd "$ROOT/backend" && npm run dev 2>&1 | sed -u 's/^/[backend] /') &

# expo runs in the foreground so the QR code and keyboard shortcuts still work
cd "$ROOT/frontend/app"
if [ $# -eq 0 ]; then
  set -- --tunnel
fi
npx expo start "$@"
