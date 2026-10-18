"""pytest configuration and fixtures."""
import pytest


# Configure asyncio mode for async tests
def pytest_configure(config):
    config.addinivalue_line(
        "markers", "asyncio: mark test as async"
    )
