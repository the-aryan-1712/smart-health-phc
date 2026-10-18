"""pytest backend tests — burn rate and stock validators."""
import math
import pytest

from backend.services.validators import (
    calculate_burn_rate,
    days_to_stockout,
    stock_status,
    calculate_reorder_quantity,
    estimate_wait_minutes,
)


class TestCalculateBurnRate:
    def test_standard_depletion(self):
        assert calculate_burn_rate(100, 70, 15) == pytest.approx(2.0)

    def test_zero_days(self):
        assert calculate_burn_rate(100, 70, 0) == 0.0

    def test_no_depletion(self):
        assert calculate_burn_rate(100, 100, 10) == 0.0

    def test_full_depletion(self):
        assert calculate_burn_rate(100, 0, 10) == pytest.approx(10.0)

    def test_negative_depletion_clamped(self):
        """Stock higher than initial (restocking happened) — should return 0."""
        assert calculate_burn_rate(50, 80, 10) == 0.0


class TestDaysToStockout:
    def test_standard_case(self):
        assert days_to_stockout(60, 2.0) == pytest.approx(30.0)

    def test_zero_burn_rate(self):
        assert days_to_stockout(60, 0) == float("inf")

    def test_negative_burn_rate(self):
        assert days_to_stockout(60, -1) == float("inf")

    def test_zero_stock(self):
        assert days_to_stockout(0, 5.0) == pytest.approx(0.0)

    def test_fractional_result(self):
        assert days_to_stockout(10, 3) == pytest.approx(3.333, rel=1e-2)


class TestStockStatus:
    def test_ok_status(self):
        assert stock_status(current=200, minimum_threshold=50, dts=30.0) == "ok"

    def test_low_by_threshold(self):
        assert stock_status(current=40, minimum_threshold=50, dts=15.0) == "low"

    def test_low_by_dts(self):
        assert stock_status(current=100, minimum_threshold=20, dts=6.0) == "low"

    def test_critical_by_dts(self):
        assert stock_status(current=10, minimum_threshold=20, dts=2.0) == "critical"

    def test_critical_zero_stock(self):
        assert stock_status(current=0, minimum_threshold=20, dts=0.0) == "critical"


class TestCalculateReorderQuantity:
    def test_standard_reorder(self):
        qty = calculate_reorder_quantity(daily_rate=2.0, lead_time_days=7, cover_days=30, current_stock=10)
        # Required = 2 * (7 + 30) = 74; reorder = 74 - 10 = 64
        assert qty == 64

    def test_no_reorder_needed(self):
        qty = calculate_reorder_quantity(daily_rate=1.0, lead_time_days=7, cover_days=30, current_stock=200)
        assert qty == 0

    def test_zero_burn_rate(self):
        qty = calculate_reorder_quantity(daily_rate=0.0, cover_days=30)
        assert qty == 0


class TestEstimateWaitMinutes:
    def test_p1_immediate(self):
        assert estimate_wait_minutes("P1", 20) == 0

    def test_p2_capped_at_3_ahead(self):
        # Even with 50 ahead, P2 is capped at 3
        assert estimate_wait_minutes("P2", 50, avg_service_minutes=8) == 24

    def test_p3_standard_queue(self):
        assert estimate_wait_minutes("P3", 5, avg_service_minutes=8) == 40

    def test_p4_pushed_to_back(self):
        # P4 with 0 ahead → 5 extra → 5 * 8 = 40
        assert estimate_wait_minutes("P4", 0, avg_service_minutes=8) == 40

    def test_p4_with_existing_queue(self):
        assert estimate_wait_minutes("P4", 3, avg_service_minutes=8) == 64
