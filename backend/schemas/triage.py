"""Pydantic schemas for triage module."""
from typing import Literal
from pydantic import BaseModel, Field, field_validator


class TriageRequest(BaseModel):
    token: str = Field(..., min_length=1, max_length=20, description="Queue token ID")
    symptoms: str = Field(..., min_length=2, max_length=1000, description="Patient-reported symptoms")
    age: int = Field(..., ge=0, le=120, description="Patient age in years")
    facility_id: str = Field(..., min_length=1, max_length=50)
    tokens_ahead: int = Field(default=0, ge=0, description="Number of patients ahead in queue")

    @field_validator("symptoms")
    @classmethod
    def sanitize_symptoms(cls, v: str) -> str:
        # Strip any potential prompt injection attempts
        forbidden = ["ignore previous", "system:", "assistant:", "###"]
        lower = v.lower()
        for phrase in forbidden:
            if phrase in lower:
                raise ValueError("Invalid input detected in symptoms field.")
        return v.strip()


class TriageResult(BaseModel):
    token: str
    priority: Literal["P1", "P2", "P3", "P4"]
    urgency_label: str  # "Emergency", "Urgent", "Semi-urgent", "Non-urgent"
    chief_complaint: str
    recommended_action: str
    estimated_wait_minutes: int
    confidence: Literal["high", "medium", "low"]
