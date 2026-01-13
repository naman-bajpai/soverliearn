# SoveriLearn Scripts

This directory contains deployment and utility scripts for SoveriLearn.

## Setup Scripts

### `setup.sh`
Initial setup script that:
- Checks prerequisites (Node.js, Python)
- Creates `.env` from `.env.example`
- Sets up Python virtual environment
- Installs all dependencies
- Makes scripts executable

**Usage:**
```bash
./scripts/setup.sh
```

## Deployment Scripts

### `deploy_contracts.sh`
Deploys SEDA contracts (TruthOracle and TutorRegistry) to the SEDA network.

**Prerequisites:**
- `.env` file with `SEDA_RPC_URL` and `SEDA_PRIVATE_KEY`
- Hardhat or Foundry installed

**Usage:**
```bash
./scripts/deploy_contracts.sh
```

## Service Management

### `start_services.sh`
Starts all SoveriLearn services:
- Kairo MCP Server
- Frontend (Next.js)
- Overshoot AI worker (if configured)

**Usage:**
```bash
./scripts/start_services.sh
```

### `stop_services.sh`
Stops all running SoveriLearn services.

**Usage:**
```bash
./scripts/stop_services.sh
```

## Testing Scripts

### `test_compliance.py`
Tests the Kairo compliance checker with various scenarios.

**Usage:**
```bash
python scripts/test_compliance.py
```

## Notes

- All scripts should be run from the project root directory
- Make sure to set up your `.env` file before running deployment scripts
- Services run in the background; use `stop_services.sh` to clean up
