"""
Gemini API client wrapper using google-genai SDK.
All structured output calls go through this module.
"""
import os
from typing import Type, TypeVar
from google import genai
from google.genai import types
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

_client: genai.Client | None = None


def get_client() -> genai.Client:
    """Lazy singleton — avoids re-initialising on every request."""
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise EnvironmentError("GEMINI_API_KEY environment variable is not set.")
        _client = genai.Client(api_key=api_key)
    return _client


DEFAULT_MODEL = "gemini-2.0-flash"


async def generate_structured(
    prompt: str,
    response_schema: Type[T],
    model: str = DEFAULT_MODEL,
    system_instruction: str | None = None,
) -> T:
    """
    Generate a structured (JSON) response from Gemini with Pydantic validation.

    Args:
        prompt: The user-facing prompt string.
        response_schema: A Pydantic BaseModel class to parse the response into.
        model: Gemini model name (default: gemini-2.0-flash).
        system_instruction: Optional system prompt to prefix.

    Returns:
        A validated Pydantic model instance.
    """
    client = get_client()

    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=response_schema,
        temperature=0.2,  # Low temperature for reliable structured output
        max_output_tokens=2048,
    )

    if system_instruction:
        config.system_instruction = system_instruction

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config,
    )

    # Parse and validate with Pydantic
    return response_schema.model_validate_json(response.text)


async def generate_text(
    prompt: str,
    model: str = DEFAULT_MODEL,
    system_instruction: str | None = None,
    max_tokens: int = 1024,
) -> str:
    """Generate plain text from Gemini (used for district summaries)."""
    client = get_client()

    config = types.GenerateContentConfig(
        temperature=0.5,
        max_output_tokens=max_tokens,
    )
    if system_instruction:
        config.system_instruction = system_instruction

    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config,
    )
    return response.text.strip()
