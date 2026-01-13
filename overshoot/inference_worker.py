"""
Overshoot AI Inference Worker
Interface for Overshoot's distributed compute infrastructure
Handles routing, scaling, and test-time scaling for educational AI
"""

import asyncio
import os
import yaml
import httpx
import json
from typing import Dict, List, Optional, AsyncGenerator, Any
from enum import Enum
from dataclasses import dataclass
from datetime import datetime
import hashlib


class DifficultyLevel(Enum):
    """Difficulty levels for test-time scaling"""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"


@dataclass
class InferenceRequest:
    """Request for inference"""
    prompt: str
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    stream: bool = False
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None


@dataclass
class InferenceResponse:
    """Response from inference"""
    text: str
    model: str
    cluster_id: str
    latency_ms: float
    tokens_generated: int
    difficulty_used: DifficultyLevel
    timestamp: datetime


class OvershootInferenceWorker:
    """Main worker for Overshoot AI distributed inference"""
    
    def __init__(self, config_path: str = "overshoot/scaling_config.yaml"):
        """Initialize the inference worker with configuration"""
        self.config = self._load_config(config_path)
        self.api_key = os.getenv("OVERSHOOT_API_KEY")
        self.endpoint = os.getenv("OVERSHOOT_ENDPOINT", "https://api.overshoot.ai")
        self.model = os.getenv("OVERSHOOT_MODEL", self.config["inference"]["model"]["default"])
        
        if not self.api_key:
            raise ValueError("OVERSHOOT_API_KEY environment variable is required")
        
        self.client = httpx.AsyncClient(
            base_url=self.endpoint,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            timeout=120.0
        )
    
    def _load_config(self, config_path: str) -> Dict:
        """Load scaling configuration from YAML"""
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    
    def _determine_difficulty(self, prompt: str, context: Optional[Dict] = None) -> DifficultyLevel:
        """
        Determine difficulty level based on prompt characteristics
        In production, this could use ML models or heuristics
        """
        prompt_lower = prompt.lower()
        
        # Simple heuristics for difficulty
        expert_keywords = ["prove", "derive", "theorem", "advanced", "complex"]
        hard_keywords = ["solve", "calculate", "explain", "why", "how"]
        medium_keywords = ["what", "define", "describe"]
        
        if any(keyword in prompt_lower for keyword in expert_keywords):
            return DifficultyLevel.EXPERT
        elif any(keyword in prompt_lower for keyword in hard_keywords):
            return DifficultyLevel.HARD
        elif any(keyword in prompt_lower for keyword in medium_keywords):
            return DifficultyLevel.MEDIUM
        else:
            return DifficultyLevel.EASY
    
    def _get_inference_params(self, difficulty: DifficultyLevel) -> Dict[str, Any]:
        """Get inference parameters based on difficulty level"""
        difficulty_config = self.config["inference"]["test_time_scaling"]["difficulty_levels"][difficulty.value]
        
        return {
            "temperature": difficulty_config["temperature"],
            "max_tokens": difficulty_config["max_tokens"],
            "num_passes": difficulty_config["num_passes"],
            "timeout": difficulty_config["timeout"]
        }
    
    async def infer(
        self,
        request: InferenceRequest,
        retries: int = 3
    ) -> InferenceResponse:
        """
        Perform inference with test-time scaling
        
        Args:
            request: Inference request
            retries: Number of retry attempts
        
        Returns:
            InferenceResponse with generated text and metadata
        """
        # Auto-determine difficulty if not specified
        if request.difficulty is None:
            request.difficulty = self._determine_difficulty(request.prompt, request.context)
        
        # Get inference parameters based on difficulty
        params = self._get_inference_params(request.difficulty)
        
        # Override with request-specific params if provided
        if request.temperature is not None:
            params["temperature"] = request.temperature
        if request.max_tokens is not None:
            params["max_tokens"] = request.max_tokens
        
        # Prepare request payload
        payload = {
            "model": self.model,
            "prompt": request.prompt,
            "temperature": params["temperature"],
            "max_tokens": params["max_tokens"],
            "stream": request.stream,
            "num_passes": params["num_passes"],
            "context": request.context or {},
            "session_id": request.session_id,
            "user_id": request.user_id
        }
        
        start_time = datetime.now()
        
        # Retry logic
        last_error = None
        for attempt in range(retries):
            try:
                response = await self.client.post(
                    "/v1/inference",
                    json=payload,
                    timeout=float(params["timeout"].replace("s", ""))
                )
                response.raise_for_status()
                
                data = response.json()
                
                latency = (datetime.now() - start_time).total_seconds() * 1000
                
                return InferenceResponse(
                    text=data["text"],
                    model=data.get("model", self.model),
                    cluster_id=data.get("cluster_id", "unknown"),
                    latency_ms=latency,
                    tokens_generated=data.get("tokens_generated", 0),
                    difficulty_used=request.difficulty,
                    timestamp=datetime.now()
                )
            
            except httpx.HTTPError as e:
                last_error = e
                if attempt < retries - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    raise
        
        raise Exception(f"Inference failed after {retries} attempts: {last_error}")
    
    async def infer_stream(
        self,
        request: InferenceRequest
    ) -> AsyncGenerator[str, None]:
        """
        Stream inference results token by token
        
        Args:
            request: Inference request (stream will be set to True)
        
        Yields:
            Token chunks as they are generated
        """
        request.stream = True
        
        # Auto-determine difficulty
        if request.difficulty is None:
            request.difficulty = self._determine_difficulty(request.prompt, request.context)
        
        params = self._get_inference_params(request.difficulty)
        
        payload = {
            "model": self.model,
            "prompt": request.prompt,
            "temperature": params["temperature"],
            "max_tokens": params["max_tokens"],
            "stream": True,
            "num_passes": params["num_passes"],
            "context": request.context or {},
            "session_id": request.session_id,
            "user_id": request.user_id
        }
        
        try:
            async with self.client.stream(
                "POST",
                "/v1/inference/stream",
                json=payload,
                timeout=float(params["timeout"].replace("s", ""))
            ) as response:
                response.raise_for_status()
                
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            if "token" in data:
                                yield data["token"]
                            elif "error" in data:
                                raise Exception(f"Stream error: {data['error']}")
                        except json.JSONDecodeError:
                            # Skip non-JSON lines
                            continue
        
        except httpx.HTTPError as e:
            raise Exception(f"Stream inference failed: {e}")
    
    async def batch_infer(
        self,
        requests: List[InferenceRequest]
    ) -> List[InferenceResponse]:
        """
        Perform batch inference for multiple requests
        
        Args:
            requests: List of inference requests
        
        Returns:
            List of inference responses
        """
        # Group requests by difficulty for optimal batching
        grouped_requests = {}
        for req in requests:
            if req.difficulty is None:
                req.difficulty = self._determine_difficulty(req.prompt, req.context)
            
            difficulty = req.difficulty.value
            if difficulty not in grouped_requests:
                grouped_requests[difficulty] = []
            grouped_requests[difficulty].append(req)
        
        # Process each group
        all_responses = []
        for difficulty, req_group in grouped_requests.items():
            # Process in batches according to config
            batch_size = self.config["inference"]["batching"]["batch_size"]
            
            for i in range(0, len(req_group), batch_size):
                batch = req_group[i:i + batch_size]
                
                # Create batch payload
                batch_payload = {
                    "model": self.model,
                    "requests": [
                        {
                            "prompt": req.prompt,
                            "temperature": self._get_inference_params(req.difficulty)["temperature"],
                            "max_tokens": self._get_inference_params(req.difficulty)["max_tokens"],
                            "context": req.context or {},
                            "session_id": req.session_id,
                            "user_id": req.user_id
                        }
                        for req in batch
                    ]
                }
                
                try:
                    response = await self.client.post(
                        "/v1/inference/batch",
                        json=batch_payload,
                        timeout=60.0
                    )
                    response.raise_for_status()
                    
                    data = response.json()
                    for j, result in enumerate(data["results"]):
                        all_responses.append(InferenceResponse(
                            text=result["text"],
                            model=result.get("model", self.model),
                            cluster_id=result.get("cluster_id", "unknown"),
                            latency_ms=result.get("latency_ms", 0),
                            tokens_generated=result.get("tokens_generated", 0),
                            difficulty_used=batch[j].difficulty,
                            timestamp=datetime.now()
                        ))
                
                except httpx.HTTPError as e:
                    # Fallback to individual requests if batch fails
                    for req in batch:
                        try:
                            resp = await self.infer(req)
                            all_responses.append(resp)
                        except Exception as e2:
                            # Create error response
                            all_responses.append(InferenceResponse(
                                text=f"Error: {str(e2)}",
                                model=self.model,
                                cluster_id="error",
                                latency_ms=0,
                                tokens_generated=0,
                                difficulty_used=req.difficulty,
                                timestamp=datetime.now()
                            ))
        
        return all_responses
    
    async def get_cluster_status(self) -> Dict[str, Any]:
        """Get status of all clusters"""
        try:
            response = await self.client.get("/v1/clusters/status")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            return {"error": str(e), "clusters": []}
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Example usage
async def main():
    """Example usage of the inference worker"""
    worker = OvershootInferenceWorker()
    
    # Simple inference
    request = InferenceRequest(
        prompt="Explain the Pythagorean theorem step by step.",
        difficulty=DifficultyLevel.MEDIUM,
        session_id="test-session-123"
    )
    
    try:
        response = await worker.infer(request)
        print(f"Response: {response.text}")
        print(f"Latency: {response.latency_ms}ms")
        print(f"Cluster: {response.cluster_id}")
        print(f"Difficulty: {response.difficulty_used.value}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await worker.close()


if __name__ == "__main__":
    asyncio.run(main())
