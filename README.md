# SoveriLearn

A sovereign tutoring architecture that combines SEDA (ground truth verification), Kairo (security/governance), and Overshoot AI (distributed compute) to create a verifiable, secure, and scalable educational AI system.

## Architecture Overview

- **SEDA Layer**: Provides verified educational content from trusted sources (Khan Academy, OpenStax, etc.)
- **Kairo Layer**: Enforces security guardrails and prevents jailbreak attempts
- **Overshoot AI Layer**: Handles distributed inference and scaling for high-load scenarios
- **Frontend**: Student interface with verification badges showing proof of sovereignty

## Project Structure

```
soverilearn/
├── contracts/               # SEDA / Blockchain Layer
│   ├── TruthOracle.sol      # Pulls verified educational content from Seda
│   └── TutorRegistry.sol    # Maps student IDs to their session hashes
├── kairo/                   # Security & Governance Layer
│   ├── guardrails.json      # Kairo-defined "Expertise" steers (anti-jailbreak)
│   ├── compliance_check.py  # Script to run DAST/Security checks on outputs
│   └── mcp_server/          # Model Context Protocol for educational tools
├── overshoot/               # Compute & Scaling Layer
│   ├── inference_worker.py  # Interface for Overshoot's distributed compute
│   └── scaling_config.yaml  # Config for handling thousand-user spikes
├── frontend/                # Student Interface
│   ├── src/
│   │   ├── components/      # Chat UI, Verification Badges
│   │   └── hooks/           # useSedaProof, useOvershootStream
├── scripts/                 # Deployment and testing
└── .env                     # API Keys for Seda, Kairo, and Overshoot
```

## Setup

1. Run the setup script:
```bash
./scripts/setup.sh
```

Or manually:

1. Install dependencies:
```bash
npm install  # Frontend
python3 -m venv venv  # Create virtual environment
source venv/bin/activate  # Activate virtual environment
pip install -r requirements.txt  # Python dependencies
```

2. Configure environment variables in `.env`

3. Deploy contracts to SEDA network

4. Start the services:
```bash
# Option 1: Use the start script (recommended)
./scripts/start_services.sh

# Option 2: Start manually (activate venv first)
source venv/bin/activate
python kairo/mcp_server/server.py  # or python3 if venv not activated
python overshoot/inference_worker.py

# Start frontend (in another terminal)
cd frontend && npm run dev
```

## Features

- **Verifiable Answers**: Every response is checked against SEDA-verified educational records
- **Jailbreak Protection**: Kairo monitors and blocks attempts to bypass educational guidelines
- **Scalable Compute**: Overshoot AI handles traffic spikes with distributed GPU clusters
- **Transparency**: Verification badges show proof of sovereignty for each response
