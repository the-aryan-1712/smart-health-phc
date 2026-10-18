"""Incident logging router — AI-generated staff absence reports."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from backend.schemas.incident import IncidentRequest, IncidentReport
from backend.services.gemini_client import generate_structured

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

SYSTEM_PROMPT = """You are a district health administration assistant for rural Indian government health centres.
Generate formal, professional incident reports for staff attendance issues.
Consider the critical nature of healthcare staffing in rural areas where a single absent doctor 
can leave a PHC without medical coverage for an entire day.
Reports should be factual, non-accusatory, and actionable.
Escalate to district level if: (a) ICU/emergency coverage is affected, (b) it's the only doctor at the facility,
or (c) it's a repeated pattern.
"""


@router.post("/incident-log", response_model=IncidentReport)
@limiter.limit("10/minute")
async def log_incident(request: Request, body: IncidentRequest) -> IncidentReport:
    """
    Generate an AI-structured incident report for staff attendance violations.
    """
    prompt = f"""Generate a staff incident report for the following:

Facility: {body.facility_name} ({body.facility_id})
Staff Member: {body.staff_name}
Role: {body.staff_role}
Shift Start: {body.shift_start}
Incident Type: {body.incident_type.replace("_", " ").title()}
Additional Context: {body.additional_context or "None provided"}
Report Generated: {datetime.now(timezone.utc).isoformat()}

Determine severity (low/medium/high), write a concise professional summary, 
provide a recommended action, and decide if this should be escalated to the district officer.
"""

    result = await generate_structured(
        prompt=prompt,
        response_schema=IncidentReport,
        system_instruction=SYSTEM_PROMPT,
    )

    # Ensure deterministic fields
    result.incident_id = f"INC-{body.facility_id[:8].upper()}-{uuid.uuid4().hex[:8].upper()}"
    result.facility_id = body.facility_id
    result.staff_name = body.staff_name
    result.generated_at = datetime.now(timezone.utc).isoformat()

    return result
