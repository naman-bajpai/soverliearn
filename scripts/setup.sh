#!/bin/bash
# Initial setup script for SoveriLearn

set -e

echo "🔧 Setting up SoveriLearn..."

# Check for required tools
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required. Please install Node.js 18+"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required. Please install Python 3.8+"
    exit 1
fi

echo "✅ Prerequisites met"

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your API keys and configuration"
else
    echo "✅ .env file already exists"
fi

# Setup Python environment
echo "🐍 Setting up Python environment..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Python dependencies installed"

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend
npm install
cd ..
echo "✅ Frontend dependencies installed"

# Make scripts executable
echo "🔐 Making scripts executable..."
chmod +x scripts/*.sh
chmod +x scripts/*.py
echo "✅ Scripts are now executable"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env with your API keys:"
echo "      - SEDA_PRIVATE_KEY"
echo "      - KAIRO_API_KEY"
echo "      - OVERSHOOT_API_KEY"
echo ""
echo "   2. Deploy contracts:"
echo "      ./scripts/deploy_contracts.sh"
echo ""
echo "   3. Start services:"
echo "      ./scripts/start_services.sh"
echo ""
echo "   4. Test compliance:"
echo "      python scripts/test_compliance.py"
