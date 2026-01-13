#!/bin/bash
# Start all SoveriLearn services

set -e

echo "🚀 Starting SoveriLearn services..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check Python dependencies
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required"
    exit 1
fi

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

# Start Kairo MCP Server
echo "🛡️  Starting Kairo MCP Server..."
cd kairo/mcp_server
python server.py &
KAIRO_PID=$!
cd ../..
echo "   Kairo MCP Server started (PID: $KAIRO_PID)"

# Start Overshoot Inference Worker API (if needed)
# This would typically be a separate service
echo "⚡ Overshoot AI worker should be running separately"
echo "   Configure OVERSHOOT_API_URL in your .env"

# Start Frontend
echo "🎨 Starting Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!
cd ..
echo "   Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "✅ All services started!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Kairo MCP: http://localhost:${MCP_SERVER_PORT:-8000}"
echo ""
echo "🛑 To stop services, run: ./scripts/stop_services.sh"
echo "   Or manually kill PIDs: $KAIRO_PID $FRONTEND_PID"

# Save PIDs to file for easy cleanup
echo "$KAIRO_PID $FRONTEND_PID" > .service_pids
