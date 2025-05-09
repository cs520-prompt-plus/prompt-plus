import pytest
from app.generation_pipeline import (
    _build_pattern_prompt,
    _extract_prompt,
    _apply_pattern,
    _standardize_pattern_outputs,
    _standardize_category_outputs,
    apply_category,
    improve_prompt,
    merge_prompts,
    manually_improve_prompt,
)
from app.config import (
    CATEGORY_TO_PATTERNS,
    EVALUATION_PROMPT,
    IMPROVEMENT_PROMPT,
    STANDARDIZATION_PROMPT,
    MANUAL_IMPROVEMENT_PROMPT,
)
from langchain.schema import HumanMessage, AIMessage

# ===========================
# Constants for Test Inputs
# ===========================

# Grab the first available category and pattern for generic tests
CATEGORY = next(iter(CATEGORY_TO_PATTERNS))
PATTERN = CATEGORY_TO_PATTERNS[CATEGORY][0]

# ===========================
# Mocking LLM Calls
# ===========================

async def _dummy_generate_response(query, history=None):
    """
    Mock replacement for _generate_response to simulate LLM behavior.
    Returns <PROMPT> tags or fallback values based on input.
    """
    txt = query.content if hasattr(query, "content") else query
    if EVALUATION_PROMPT in txt:
        return "Yes."
    if IMPROVEMENT_PROMPT in txt:
        return "<PROMPT>pattern‐improved</PROMPT>"
    if MANUAL_IMPROVEMENT_PROMPT.split("{")[0] in txt:
        return "<PROMPT>manual</PROMPT>"
    return f"<PROMPT>{txt}</PROMPT>"

@pytest.fixture(autouse=True)
def patch_generate(monkeypatch):
    """
    Automatically monkeypatch _generate_response in every test.
    """
    monkeypatch.setattr("app.generation_pipeline._generate_response", _dummy_generate_response)

# ===========================
# Unit Tests
# ===========================

@pytest.mark.asyncio
async def test_build_and_extract():
    """
    Verify prompt formatting and extraction from tags.
    """
    prompt = _build_pattern_prompt("hi", CATEGORY, PATTERN)
    assert CATEGORY in prompt and PATTERN in prompt

    assert _extract_prompt("<PROMPT>xyz</PROMPT>") == "xyz"

    with pytest.raises(Exception):
        _extract_prompt("no tags")  # Should raise because tags are missing

@pytest.mark.asyncio
async def test_apply_pattern_and_standardize_pattern_outputs():
    """
    Test pattern application logic and normalization output.
    """
    out = await _apply_pattern("foo", CATEGORY, PATTERN, force_applied=False)

    assert out["pattern"] == PATTERN
    assert out["applied"] is True
    assert out["output"] == "pattern‐improved"

    std = await _standardize_pattern_outputs(
        [{"input": "i", "pattern": "p", "applied": True, "feedback": "f", "output": "o"}],
        "CatX"
    )
    assert std["input"] == "i"
    assert std["category"] == "CatX"
    assert std["preview"] == "o"

@pytest.mark.asyncio
async def test_standardize_category_and_merge_prompts():
    """
    Test merging and standardizing categories into final output.
    """
    cats = [
        {"input": "orig", "category": CATEGORY, "patterns": [], "preview": "v1"},
        {"input": "orig", "category": CATEGORY, "patterns": [], "preview": "v2"},
    ]

    std = await _standardize_category_outputs(cats)
    assert std["input"] == "orig"
    assert isinstance(std["categories"], list)
    assert isinstance(std["output"], str)

    merged = await merge_prompts(["a", "b", "a"])  # tests deduplication + merge
    assert isinstance(merged, str)

@pytest.mark.asyncio
async def test_manual_and_full_pipeline():
    """
    End-to-end functional test of manual and full prompt improvement flow.
    """
    man_prompt = await manually_improve_prompt("fb", "base")
    assert man_prompt == "manual"

    apply_cat = await apply_category("start", CATEGORY)
    assert apply_cat["input"] == "start"
    assert apply_cat["category"] == CATEGORY

    improve = await improve_prompt("hello")
    assert improve["input"] == "hello"
    assert isinstance(improve["categories"], list)
    assert "output" in improve
