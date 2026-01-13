# SEDA Contracts

This directory contains Solidity smart contracts for the SEDA layer of SoveriLearn.

## Contracts

### TruthOracle.sol
The TruthOracle contract provides verified educational content from trusted sources.

**Key Features:**
- Registers verified educational content from authorized verifiers
- Verifies facts against on-chain records
- Tracks content sources (Khan Academy, OpenStax, etc.)
- Allows invalidation of incorrect content

**Main Functions:**
- `registerContent()` - Register verified content
- `verifyFact()` - Verify if a fact matches verified content
- `getContent()` - Retrieve content by ID
- `invalidateContent()` - Mark content as invalid

### TutorRegistry.sol
The TutorRegistry contract maps student IDs to tutoring session hashes.

**Key Features:**
- Registers tutoring sessions with metadata
- Links sessions to verified facts
- Maintains immutable audit trail
- Auto-verifies facts used in sessions

**Main Functions:**
- `registerSession()` - Register a new tutoring session
- `getSession()` - Retrieve session data
- `getStudentSessions()` - Get all sessions for a student
- `getSessionVerification()` - Check verification status

## Deployment

1. Install dependencies (Hardhat or Foundry)
2. Configure `.env` with SEDA network details
3. Run `./scripts/deploy_contracts.sh`

## Usage

After deployment, update your `.env` with the deployed contract addresses:
```
TRUTH_ORACLE_ADDRESS=0x...
TUTOR_REGISTRY_ADDRESS=0x...
```

## Testing

Contracts can be tested using Hardhat or Foundry test frameworks.
