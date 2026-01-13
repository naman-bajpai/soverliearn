"""
Kairo MCP Server
Model Context Protocol server for educational tools and guardrails
"""

import asyncio
import json
import os
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys

# Add parent directory to path to import compliance_check
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from compliance_check import ComplianceChecker, ComplianceResult


app = FastAPI(title="Kairo MCP Server", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize compliance checker
compliance_checker = ComplianceChecker()


class CheckRequest(BaseModel):
    """Request model for compliance checking"""
    user_input: str
    ai_output: str
    context: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None


class CheckResponse(BaseModel):
    """Response model for compliance checking"""
    is_compliant: bool
    violations: List[Dict]
    action: str
    message: Optional[str] = None
    confidence: float = 1.0


class JailbreakCheckRequest(BaseModel):
    """Request model for jailbreak detection"""
    user_input: str


class StepByStepCheckRequest(BaseModel):
    """Request model for step-by-step reasoning check"""
    ai_output: str


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Kairo MCP Server",
        "version": "1.0.0",
        "status": "running",
        "guardrails": len(compliance_checker.rules)
    }


@app.post("/check", response_model=CheckResponse)
async def check_compliance(request: CheckRequest):
    """
    Check if AI output complies with Kairo guardrails
    
    This is the main endpoint for compliance checking.
    It validates both user input and AI output against all configured rules.
    """
    try:
        result: ComplianceResult = compliance_checker.check_compliance(
            user_input=request.user_input,
            ai_output=request.ai_output,
            context=request.context
        )
        
        return CheckResponse(
            is_compliant=result.is_compliant,
            violations=result.violations,
            action=result.action.value,
            message=result.message,
            confidence=result.confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/check/jailbreak")
async def check_jailbreak(request: JailbreakCheckRequest):
    """
    Quick check for jailbreak attempts in user input
    """
    is_jailbreak = compliance_checker.check_jailbreak_attempt(request.user_input)
    
    return {
        "is_jailbreak_attempt": is_jailbreak,
        "user_input": request.user_input
    }


@app.post("/check/step-by-step")
async def check_step_by_step(request: StepByStepCheckRequest):
    """
    Check if AI output includes step-by-step reasoning
    """
    has_reasoning = compliance_checker.requires_step_by_step(request.ai_output)
    
    return {
        "has_step_by_step": has_reasoning,
        "output_length": len(request.ai_output)
    }


@app.get("/guardrails")
async def get_guardrails():
    """
    Get all configured guardrails
    """
    return {
        "guardrails": compliance_checker.guardrails,
        "rules_count": len(compliance_checker.rules)
    }


@app.get("/guardrails/{rule_id}")
async def get_guardrail_rule(rule_id: str):
    """
    Get a specific guardrail rule by ID
    """
    for rule in compliance_checker.rules:
        if rule["id"] == rule_id:
            return rule
    
    raise HTTPException(status_code=404, detail=f"Rule {rule_id} not found")


@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "Kairo MCP Server",
        "guardrails_loaded": len(compliance_checker.rules),
        "compliance_checker": "operational"
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("MCP_SERVER_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
