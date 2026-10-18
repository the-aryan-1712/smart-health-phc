"""Pydantic schemas for supply/stock module."""
from typing import Literal
from pydantic import BaseModel, Field, field_validator


class MedicineStock(BaseModel):
    name: str
    unit: str  # e.g. "tablets", "vials", "sachets"
    current_stock: int = Field(..., ge=0)
    initial_stock: int = Field(..., gt=0)
    days_since_refill: int = Field(..., ge=0)
    minimum_threshold: int = Field(..., ge=0)


class StockPredictRequest(BaseModel):
    facility_id: str = Field(..., min_length=1, max_length=50)
    facility_name: str = Field(..., min_length=1, max_length=100)
    medicines: list[MedicineStock] = Field(..., min_length=1, max_length=50)


class StockPrediction(BaseModel):
    medicine: str
    current_stock: int
    burn_rate_per_day: float
    predicted_days_to_stockout: float
    status: Literal["ok", "low", "critical"]
    confidence: Literal["high", "medium", "low"]
    recommendation: str
    order_quantity: int


class StockPredictResponse(BaseModel):
    facility_id: str
    predictions: list[StockPrediction]
    summary: str
