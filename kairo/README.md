# Kairo Security & Governance Layer

Kairo acts as the "Digital Exorcist" - preventing jailbreaks and enforcing educational guardrails.

## Components

### guardrails.json
Configuration file defining all security rules and steering parameters.

**Key Rules:**
- **No Direct Answers**: Requires step-by-step reasoning
- **Jailbreak Detection**: Blocks attempts to bypass instructions
- **Educational Context**: Maintains focus on educational topics
- **Prevent Cheating**: Blocks academic dishonesty attempts
- **Pedagogical Quality**: Ensures minimum response quality
- **Factual Accuracy**: Requires SEDA verification

### compliance_check.py
Python module that performs compliance checking against guardrails.

**Features:**
- Real-time violation detection
- Multiple check types (regex, keyword, length, external)
- Severity-based actions (allow, warn, block)
- Jailbreak attempt detection
- Step-by-step reasoning validation

### mcp_server/
Model Context Protocol server exposing compliance checking via REST API.

**Endpoints:**
- `POST /check` - Main compliance check endpoint
- `POST /check/jailbreak` - Quick jailbreak detection
- `POST /check/step-by-step` - Step-by-step reasoning check
- `GET /guardrails` - Get all guardrails
- `GET /health` - Health check

## Usage

### Start MCP Server
```bash
cd kairo/mcp_server
python server.py
```

The server runs on port 8000 by default (configurable via `MCP_SERVER_PORT`).

### Check Compliance
```python
from kairo.compliance_check import ComplianceChecker

checker = ComplianceChecker()
result = checker.check_compliance(
    user_input="What is 6 * 7?",
    ai_output="The answer is 42."
)

if not result.is_compliant:
    print(f"Violation: {result.message}")
    print(f"Action: {result.action}")
```

### API Usage
```bash
curl -X POST http://localhost:8000/check \
  -H "Content-Type: application/json" \
  -d '{
    "user_input": "What is 6 * 7?",
    "ai_output": "The answer is 42."
  }'
```

## Testing

Run the test script:
```bash
python scripts/test_compliance.py
```
