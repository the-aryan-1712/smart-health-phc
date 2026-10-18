"""
Business logic validators — pure functions that are unit-tested independently.
No I/O, no side effects.
"""


def calculate_burn_rate(initial: int, current: int, days: int) -> float:
    """
    Calculate daily medicine consumption rate.

    Args:
        initial: Stock level at last refill.
        current: Current stock level.
        days: Days elapsed since last refill.

    Returns:
        Units consumed per day. Returns 0.0 if days == 0.
    """
    if days == 0:
        return 0.0
    consumed = max(0, initial - current)
    return consumed / days


def days_to_stockout(stock: int, burn_rate: float) -> float:
    """
    Predict days remaining before stock is depleted.

    Args:
        stock: Current stock quantity.
        burn_rate: Daily consumption rate (units/day).

    Returns:
        Number of days until stockout. Returns float('inf') if burn_rate <= 0.
    """
    if burn_rate <= 0:
        return float("inf")
    return stock / burn_rate


def stock_status(current: int, minimum_threshold: int, dts: float) -> str:
    """
    Classify stock health status.

    Returns: "ok", "low", or "critical"
    """
    if current <= 0 or dts <= 3:
        return "critical"
    if current <= minimum_threshold or dts <= 7:
        return "low"
    return "ok"


def calculate_reorder_quantity(
    daily_rate: float,
    lead_time_days: int = 7,
    cover_days: int = 30,
    current_stock: int = 0,
) -> int:
    """
    Calculate how much to reorder.

    Args:
        daily_rate: Consumption rate per day.
        lead_time_days: Days until delivery.
        cover_days: Target days of stock cover.
        current_stock: Current on-hand quantity.

    Returns:
        Integer reorder quantity (always >= 0).
    """
    required = daily_rate * (lead_time_days + cover_days)
    reorder = max(0, required - current_stock)
    return round(reorder)


def estimate_wait_minutes(
    priority: str,
    tokens_ahead: int,
    avg_service_minutes: int = 8,
) -> int:
    """
    Estimate patient wait time based on triage priority.

    P1 (Emergency) — immediate, bypasses queue.
    P2 (Urgent) — bumped ahead of P3/P4.
    P3 (Semi-urgent) — standard queue.
    P4 (Non-urgent) — end of queue.

    Args:
        priority: "P1", "P2", "P3", or "P4".
        tokens_ahead: Patients currently ahead.
        avg_service_minutes: Average consultation time.

    Returns:
        Estimated wait in minutes.
    """
    if priority == "P1":
        return 0
    if priority == "P2":
        effective_ahead = min(tokens_ahead, 3)
    elif priority == "P3":
        effective_ahead = tokens_ahead
    else:  # P4
        effective_ahead = tokens_ahead + 5  # pushed to end
    return effective_ahead * avg_service_minutes
