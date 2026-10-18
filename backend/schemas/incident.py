"""Pydantic schemas for incident logging module."""
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class IncidentRequest(BaseModel):
    facility_id: str = Field(..., min_length=1, max_length=50)
    facility_name: str = Field(..., min_length=1, max_length=100)
    staff_name: str = Field(..., min_length=1, max_length=100)
    staff_role: str = Field(..., min_length=1, max_length=50)
    shift_start: str = Field(..., description="ISO 8601 shift start time")
    incident_type: Literal["unannounced_absence", "late_arrival", "early_departure", "duty_swap"]
    additional_context: str = Field(default="", max_length=500)


class IncidentReport(BaseModel):
    incident_id: str
    facility_id: str
    staff_name: str
    severity: Literal["low", "medium", "high"]
    summary: str
    recommended_action: str
    escalate_to_district: bool
    generated_at: str
