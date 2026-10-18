"""Triage router — AI patient urgency classification."""
import json
from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from backend.schemas.triage import TriageRequest, TriageResult
from backend.services.gemini_client import generate_structured
from backend.services.validators import estimate_wait_minutes

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

SYSTEM_PROMPT = """You are a clinical triage assistant for rural Indian Primary Health Centres (PHCs) and 
Community Health Centres (CHCs). Your role is to classify patient urgency strictly and accurately.

Priority levels:
- P1 (Emergency): Life-threatening conditions requiring immediate intervention. Examples: chest pain, 
  severe breathing difficulty, stroke symptoms, unconsciousness, active seizures, severe bleeding, 
  obstetric emergencies.
- P2 (Urgent): Serious conditions requiring care within 30 minutes. Examples: high fever >39°C, 
  moderate breathing difficulty, suspected fractures, severe dehydration, severe abdominal pain.
- P3 (Semi-urgent): Conditions that can wait 1-2 hours. Examples: moderate pain, mild fever, 
  wounds needing sutures, urinary complaints.
- P4 (Non-urgent): Routine care. Examples: prescription refills, minor colds, routine check-ups, 
  minor skin conditions.

IMPORTANT: Always err on the side of caution. If unsure between two levels, assign the more urgent one.
"""


@router.post("/triage", response_model=TriageResult)
@limiter.limit("30/minute")
async def triage_patient(request: Request, body: TriageRequest) -> TriageResult:
    """
    AI-powered patient triage using Gemini structured output.
    Classifies urgency and predicts wait time.
    """
    prompt = f"""Triage the following patient:

Token: {body.token}
Age: {body.age} years
Reported symptoms: {body.symptoms}
Facility: {body.facility_id}
Patients currently ahead in queue: {body.tokens_ahead}

Classify this patient into P1/P2/P3/P4 urgency. 
Provide chief_complaint (1 concise sentence), recommended_action (specific next step), 
and confidence level based on symptom clarity.
"""

    result = await generate_structured(
        prompt=prompt,
        response_schema=TriageResult,
        system_instruction=SYSTEM_PROMPT,
    )

    # Override wait-time with our deterministic formula for consistency
    result.estimated_wait_minutes = estimate_wait_minutes(
        priority=result.priority,
        tokens_ahead=body.tokens_ahead,
    )
    result.token = body.token  # Ensure token matches request

    return result
