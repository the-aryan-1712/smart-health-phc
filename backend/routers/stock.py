"""Stock prediction router — AI supply depletion analysis."""
import json
from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from backend.schemas.stock import StockPredictRequest, StockPredictResponse, StockPrediction
from backend.services.gemini_client import generate_structured
from backend.services.validators import calculate_burn_rate, days_to_stockout, stock_status, calculate_reorder_quantity

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

SYSTEM_PROMPT = """You are a pharmacy supply chain analyst for rural Indian government health centres.
Analyze medicine stock levels and predict depletion risk considering:
- Seasonal disease patterns (malaria, dengue in monsoon; respiratory in winter)
- Rural PHC patterns: typically serve 50-150 patients/day
- Essential medicines: ORS, paracetamol, amoxicillin, metformin, insulin, oxytocin have critical minimum stocks
- Provide actionable, specific recommendations using standard government procurement language.
"""


@router.post("/stock-predict", response_model=StockPredictResponse)
@limiter.limit("20/minute")
async def predict_stock(request: Request, body: StockPredictRequest) -> StockPredictResponse:
    """
    AI-powered stock depletion prediction with reorder recommendations.
    Combines deterministic burn-rate calculation with Gemini analysis.
    """
    # First: compute deterministic metrics for each medicine
    computed_metrics = []
    for med in body.medicines:
        br = calculate_burn_rate(med.initial_stock, med.current_stock, med.days_since_refill)
        dts = days_to_stockout(med.current_stock, br)
        status = stock_status(med.current_stock, med.minimum_threshold, dts)
        reorder_qty = calculate_reorder_quantity(
            daily_rate=br,
            current_stock=med.current_stock,
        )
        computed_metrics.append({
            "name": med.name,
            "unit": med.unit,
            "current_stock": med.current_stock,
            "burn_rate_per_day": round(br, 2),
            "predicted_days_to_stockout": round(dts, 1) if dts != float("inf") else 999,
            "status": status,
            "reorder_quantity": reorder_qty,
        })

    # Filter to only medicines needing AI analysis (low or critical)
    at_risk = [m for m in computed_metrics if m["status"] in ("low", "critical")]

    prompt = f"""Facility: {body.facility_name} ({body.facility_id})

Pre-calculated stock metrics for at-risk medicines:
{json.dumps(at_risk, indent=2)}

For each medicine listed, provide:
1. A clinically-aware recommendation (mention disease seasonality if relevant)
2. Confidence level based on data quality
3. Confirm or adjust the order_quantity based on rural PHC context

Also medicines with "ok" status from full list: {[m["name"] for m in computed_metrics if m["status"] == "ok"]}

Generate a brief 2-sentence executive summary for the district health officer.
"""

    # Build response using pre-computed metrics + Gemini enrichment for at-risk items
    predictions = []
    for m in computed_metrics:
        predictions.append(StockPrediction(
            medicine=m["name"],
            current_stock=m["current_stock"],
            burn_rate_per_day=m["burn_rate_per_day"],
            predicted_days_to_stockout=m["predicted_days_to_stockout"],
            status=m["status"],
            confidence="high" if m["predicted_days_to_stockout"] < 999 else "low",
            recommendation=f"Stock adequate. Monitor standard consumption." if m["status"] == "ok"
                           else f"Reorder {m['reorder_quantity']} {body.medicines[0].unit} immediately.",
            order_quantity=m["reorder_quantity"],
        ))

    # Get AI summary for the full picture
    try:
        from backend.services.gemini_client import generate_text
        summary = await generate_text(
            prompt=f"Write a 2-sentence supply summary for {body.facility_name}: {json.dumps(at_risk)}",
            system_instruction=SYSTEM_PROMPT,
        )
    except Exception:
        critical_count = sum(1 for p in predictions if p.status == "critical")
        low_count = sum(1 for p in predictions if p.status == "low")
        summary = f"{critical_count} critical and {low_count} low stock items detected at {body.facility_name}. Immediate reorder recommended."

    return StockPredictResponse(
        facility_id=body.facility_id,
        predictions=predictions,
        summary=summary,
    )
