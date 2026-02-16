#!/bin/bash
# Start both the FastAPI backend and the React frontend.
# Usage: ./start.sh

set -e

# Find the Python executable (venv or system)
PYTHON="${PYTHON:-$(dirname "$0")/.venv-1/bin/python}"
if [ ! -f "$PYTHON" ]; then
  PYTHON="python3"
fi

echo "=== Starting FastAPI backend on :8000 ==="
cd "$(dirname "$0")"
$PYTHON -m uvicorn api.main:app --host 0.0.0.0 --port 8000 &
API_PID=$!

echo "=== Starting React frontend on :5173 ==="
cd frontend
npx vite --port 5173 &
VITE_PID=$!

trap "kill $API_PID $VITE_PID 2>/dev/null; exit" SIGINT SIGTERM
echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both."
wait
