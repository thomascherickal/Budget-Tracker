#!/usr/bin/env bash
# Sovereign Budget - Universal Local Launcher for Linux & macOS
# Ensures unrestricted origin-bound storage permissions on all modern browsers.

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

PORT=8000
URL="http://127.0.0.1:${PORT}"

echo "=========================================================="
echo " Starting Sovereign Budget with Local Storage Access..."
echo " Platform: $(uname -s) ($(uname -m))"
echo "=========================================================="

# 1. Prefer Node.js serve.js if node is installed
if command -v node >/dev/null 2>&1; then
    echo "Launching via Node.js server (serve.js)..."
    node serve.js "$PORT"
    exit 0
fi

# 2. Prefer Python 3 if installed
if command -v python3 >/dev/null 2>&1; then
    echo "Launching via Python 3 (http.server)..."
    if command -v xdg-open >/dev/null 2>&1; then
        (sleep 1 && xdg-open "$URL") &
    elif command -v open >/dev/null 2>&1; then
        (sleep 1 && open "$URL") &
    fi
    python3 -m http.server "$PORT"
    exit 0
fi

# 3. Fallback to Python 2
if command -v python >/dev/null 2>&1; then
    echo "Launching via Python 2 (SimpleHTTPServer)..."
    if command -v xdg-open >/dev/null 2>&1; then
        (sleep 1 && xdg-open "$URL") &
    elif command -v open >/dev/null 2>&1; then
        (sleep 1 && open "$URL") &
    fi
    python -m SimpleHTTPServer "$PORT"
    exit 0
fi

# 4. Fallback to opening file directly
echo "No local runtime detected. Opening index.html directly..."
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open index.html
elif command -v open >/dev/null 2>&1; then
    open index.html
else
    echo "Please open $DIR/index.html in your preferred web browser."
fi
