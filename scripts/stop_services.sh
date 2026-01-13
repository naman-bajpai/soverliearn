#!/bin/bash
# Stop all SoveriLearn services

echo "🛑 Stopping SoveriLearn services..."

if [ -f .service_pids ]; then
    PIDS=$(cat .service_pids)
    for PID in $PIDS; do
        if ps -p $PID > /dev/null 2>&1; then
            echo "   Stopping process $PID..."
            kill $PID 2>/dev/null || true
        fi
    done
    rm .service_pids
    echo "✅ Services stopped"
else
    echo "⚠️  No service PIDs found. Services may have already stopped."
fi

# Also try to kill by process name
pkill -f "python.*mcp_server/server.py" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

echo "✅ Cleanup complete"
