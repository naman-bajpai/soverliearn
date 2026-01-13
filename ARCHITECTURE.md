# SoveriLearn Architecture

## Overview

SoveriLearn is a sovereign tutoring architecture that combines three key layers to create a verifiable, secure, and scalable educational AI system:

1. **SEDA Layer** - Ground truth verification via blockchain
2. **Kairo Layer** - Security and governance enforcement
3. **Overshoot AI Layer** - Distributed compute and scaling

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Chat UI    │  │ Verification │  │   Hooks      │      │
│  │              │  │   Badge     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────┬───────────────┬───────────────┬────────────────┘
             │               │               │
             ▼               ▼               ▼
    ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
    │  SEDA Network  │ │ Kairo MCP    │ │ Overshoot   │
    │  (Blockchain)  │ │ Server       │ │ AI          │
    └────────────────┘ └──────────────┘ └──────────────┘
             │               │               │
             ▼               ▼               ▼
    ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
    │ TruthOracle    │ │ Guardrails   │ │ Inference   │
    │ TutorRegistry  │ │ Compliance   │ │ Worker      │
    └────────────────┘ └──────────────┘ └──────────────┘
```

## Data Flow

### 1. Student Asks Question

```
Student Input → Frontend → Overshoot AI (Inference)
```

### 2. Response Generation with Verification

```
Overshoot AI Response
    ↓
Kairo Compliance Check (blocks if violation)
    ↓
SEDA Fact Verification (checks against TruthOracle)
    ↓
Frontend displays with Verification Badge
```

### 3. Session Registration

```
Session Data → TutorRegistry Contract
    ↓
Links to verified facts
    ↓
Immutable audit trail on-chain
```

## Component Details

### SEDA Layer (Blockchain)

**Purpose**: Provides verifiable ground truth for educational content

**Contracts**:
- `TruthOracle.sol`: Stores verified educational facts from trusted sources
- `TutorRegistry.sol`: Maps student sessions to verified facts

**Key Features**:
- On-chain fact verification
- Immutable audit trail
- Source attribution (Khan Academy, OpenStax, etc.)

### Kairo Layer (Security)

**Purpose**: Prevents jailbreaks and enforces educational guardrails

**Components**:
- `guardrails.json`: Rule definitions
- `compliance_check.py`: Compliance checking logic
- `mcp_server/`: REST API for compliance checks

**Key Features**:
- Real-time violation detection
- Step-by-step reasoning enforcement
- Jailbreak attempt blocking
- Academic dishonesty prevention

### Overshoot AI Layer (Compute)

**Purpose**: Handles distributed inference and scaling

**Components**:
- `inference_worker.py`: Main inference interface
- `scaling_config.yaml`: Scaling and configuration

**Key Features**:
- Test-time scaling (think longer for harder questions)
- Auto-scaling for traffic spikes
- Distributed GPU clusters
- Streaming inference support

### Frontend Layer

**Purpose**: Student interface with verification transparency

**Components**:
- `ChatUI.tsx`: Main chat interface
- `VerificationBadge.tsx`: Proof display component
- `useSedaProof.ts`: SEDA integration hook
- `useOvershootStream.ts`: Streaming hook

**Key Features**:
- Real-time chat interface
- Verification badge with expandable details
- SEDA proof display
- Kairo audit results
- Overshoot compute status

## Security Model

### Defense in Depth

1. **Input Validation**: Kairo checks user input for jailbreak attempts
2. **Output Validation**: Kairo validates AI responses for compliance
3. **Fact Verification**: SEDA verifies facts against trusted sources
4. **Audit Trail**: All sessions recorded on-chain via TutorRegistry

### Verification Badge States

- ✅ **Sovereign Verified**: All checks passed
- ⚠️ **Warning**: Minor violations detected
- ❌ **Verification Failed**: Critical violations or unverified facts

## Scaling Strategy

### Horizontal Scaling
- Auto-scaling based on CPU/memory utilization
- Multiple GPU clusters across regions
- Load balancing with health checks

### Test-Time Scaling
- Easy questions: 1 inference pass, 256 tokens
- Medium questions: 2 passes, 512 tokens
- Hard questions: 3 passes, 1024 tokens
- Expert questions: 5 passes, 2048 tokens

### Cost Optimization
- Spot instances for non-critical workloads
- Model caching and request deduplication
- Batch processing for similar requests

## Deployment

### Prerequisites
- Node.js 18+
- Python 3.8+
- Access to SEDA network
- Overshoot AI API key
- Kairo API key (optional)

### Setup Steps

1. **Initial Setup**:
   ```bash
   ./scripts/setup.sh
   ```

2. **Configure Environment**:
   - Copy `.env.example` to `.env`
   - Add API keys and contract addresses

3. **Deploy Contracts**:
   ```bash
   ./scripts/deploy_contracts.sh
   ```

4. **Start Services**:
   ```bash
   ./scripts/start_services.sh
   ```

## Monitoring

### Key Metrics
- Request rate and latency (P50, P95, P99)
- Error rate
- GPU utilization
- Queue depth
- Compliance violation rate
- SEDA verification success rate

### Alerts
- High latency (>5s P95)
- High error rate (>5%)
- Queue overflow (>800)
- Critical compliance violations

## Future Enhancements

1. **Multi-chain Support**: Support for multiple blockchain networks
2. **Advanced Fact Extraction**: ML-based fact extraction from responses
3. **Adaptive Difficulty**: ML-based difficulty assessment
4. **Multi-modal Support**: Image and diagram understanding
5. **Collaborative Learning**: Multi-student sessions
6. **Progress Tracking**: On-chain learning progress records
