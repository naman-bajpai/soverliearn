#!/bin/bash
# Deploy SEDA contracts to the network

set -e

echo "🚀 Deploying SoveriLearn contracts to SEDA network..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check required variables
if [ -z "$SEDA_RPC_URL" ]; then
    echo "❌ Error: SEDA_RPC_URL not set in .env"
    exit 1
fi

if [ -z "$SEDA_PRIVATE_KEY" ]; then
    echo "❌ Error: SEDA_PRIVATE_KEY not set in .env"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile contracts (assuming Hardhat or Foundry)
echo "🔨 Compiling contracts..."
# For Hardhat:
# npx hardhat compile

# For Foundry:
# forge build

# Deploy TruthOracle
echo "📝 Deploying TruthOracle..."
# npx hardhat run scripts/deploy_truth_oracle.js --network seda
# OR
# forge script scripts/DeployTruthOracle.s.sol --rpc-url $SEDA_RPC_URL --broadcast

# Deploy TutorRegistry
echo "📝 Deploying TutorRegistry..."
# npx hardhat run scripts/deploy_tutor_registry.js --network seda
# OR
# forge script scripts/DeployTutorRegistry.s.sol --rpc-url $SEDA_RPC_URL --broadcast

echo "✅ Contracts deployed successfully!"
echo "📋 Update your .env file with the deployed contract addresses:"
echo "   TRUTH_ORACLE_ADDRESS=0x..."
echo "   TUTOR_REGISTRY_ADDRESS=0x..."
