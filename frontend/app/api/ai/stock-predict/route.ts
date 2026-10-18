import { NextResponse } from "next/server";
import { calculateReorderQuantity, getStockStatus } from "@/lib/burnRate";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      medicine_name,
      current_stock = 0,
      burn_rate_per_day = 1,
      facility_id,
      days_since_refill = 10,
      minimum_threshold = 20,
    } = body;

    // Try forwarding to FastAPI backend
    try {
      const backendRes = await fetch(`${FASTAPI_URL}/ai/stock-predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Key": process.env.INTERNAL_API_KEY || "internal-dev-key",
        },
        body: JSON.stringify({
          medicine_name,
          current_stock,
          burn_rate_per_day,
          facility_id,
          days_since_refill,
          minimum_threshold,
        }),
        signal: AbortSignal.timeout(4000), // 4s timeout for fallback
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend not running or timed out — proceed to statistical fallback
    }

    // Local deterministic fallback
    const dts = burn_rate_per_day > 0 ? current_stock / burn_rate_per_day : 999;
    const status = getStockStatus(current_stock, minimum_threshold, dts);
    const orderQty = calculateReorderQuantity(burn_rate_per_day, 7, 30, current_stock);

    return NextResponse.json({
      medicine: medicine_name,
      current_stock: current_stock,
      burn_rate_per_day: burn_rate_per_day,
      predicted_days_to_stockout: Math.round(dts),
      status: status,
      confidence: "high",
      recommendation: `Recommended reorder of ${orderQty} units based on 7-day transit lead time and 30-day monsoon buffer (burn rate: ${burn_rate_per_day.toFixed(1)}/day).`,
      order_quantity: orderQty,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
