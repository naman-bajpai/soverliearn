# SoveriLearn Frontend

Next.js React application for the SoveriLearn tutoring interface.

## Features

- **Chat UI**: Interactive chat interface for student-tutor conversations
- **Verification Badges**: Shows "Sovereign Verified" status with proof details
- **Real-time Streaming**: Live streaming of AI responses
- **SEDA Integration**: Displays on-chain verification proofs
- **Kairo Integration**: Shows compliance audit results
- **Overshoot Status**: Displays compute cluster information

## Components

### ChatUI
Main chat interface component with message history and input.

### VerificationBadge
Shows verification status with expandable details:
- SEDA Proof (fact verification)
- Kairo Audit (compliance check)
- Overshoot Status (compute info)

## Hooks

### useSedaProof
Hook for fetching and verifying SEDA proofs:
- `verifyFact(factHash)` - Verify a fact hash
- `getContentProof(contentId)` - Get content proof by ID

### useOvershootStream
Hook for streaming inference from Overshoot AI:
- `startStream(config)` - Start streaming inference
- `stopStream()` - Stop current stream
- `clear()` - Clear stream state

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SEDA_NETWORK=seda-testnet
NEXT_PUBLIC_SEDA_RPC_URL=https://rpc.seda.network
NEXT_PUBLIC_TRUTH_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_OVERSHOOT_API_URL=http://localhost:8001
```

3. Start development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Architecture

The frontend connects to:
- **SEDA Network**: For on-chain verification via ethers.js
- **Kairo MCP Server**: For compliance checking (http://localhost:8000)
- **Overshoot AI**: For inference streaming (configured via env)
