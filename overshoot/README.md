# Overshoot AI Compute Layer

Overshoot AI handles distributed inference and scaling for high-load scenarios.

## Components

### inference_worker.py
Main worker interface for Overshoot's distributed compute infrastructure.

**Features:**
- Test-time scaling (think longer for harder questions)
- Difficulty-based parameter adjustment
- Streaming inference support
- Batch processing
- Automatic retry logic
- Cluster status monitoring

**Key Classes:**
- `OvershootInferenceWorker` - Main worker class
- `InferenceRequest` - Request model
- `InferenceResponse` - Response model
- `DifficultyLevel` - Enum for difficulty levels

### scaling_config.yaml
Configuration for scaling, inference, and cluster management.

**Sections:**
- **scaling**: Auto-scaling and load balancing
- **inference**: Model settings and test-time scaling
- **clusters**: GPU cluster configuration
- **monitoring**: Metrics and alerts
- **rate_limiting**: Per-user and per-session limits
- **cost_optimization**: Spot instances and caching

## Usage

### Basic Inference
```python
from overshoot.inference_worker import OvershootInferenceWorker, InferenceRequest, DifficultyLevel

worker = OvershootInferenceWorker()

request = InferenceRequest(
    prompt="Explain the Pythagorean theorem step by step.",
    difficulty=DifficultyLevel.MEDIUM,
    session_id="session-123"
)

response = await worker.infer(request)
print(f"Response: {response.text}")
print(f"Latency: {response.latency_ms}ms")
print(f"Cluster: {response.cluster_id}")
```

### Streaming Inference
```python
async for token in worker.infer_stream(request):
    print(token, end='', flush=True)
```

### Batch Inference
```python
requests = [
    InferenceRequest(prompt="Question 1", difficulty=DifficultyLevel.EASY),
    InferenceRequest(prompt="Question 2", difficulty=DifficultyLevel.MEDIUM),
]

responses = await worker.batch_infer(requests)
```

## Test-Time Scaling

The system automatically adjusts inference parameters based on question difficulty:

- **Easy**: 1 pass, 256 tokens, 10s timeout
- **Medium**: 2 passes, 512 tokens, 20s timeout
- **Hard**: 3 passes, 1024 tokens, 40s timeout
- **Expert**: 5 passes, 2048 tokens, 60s timeout

## Configuration

Update `scaling_config.yaml` to adjust:
- Auto-scaling thresholds
- Cluster sizes and regions
- Difficulty-based parameters
- Rate limits
- Cost optimization settings

## Environment Variables

Required:
- `OVERSHOOT_API_KEY` - API key for Overshoot AI
- `OVERSHOOT_ENDPOINT` - API endpoint URL
- `OVERSHOOT_MODEL` - Model to use (default: llama-3-70b)
