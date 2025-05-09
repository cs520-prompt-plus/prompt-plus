import pytest
from pydantic import ValidationError
from datetime import datetime

from app.types.response import (
    UserCreate,
    UserRead,
    ResponseCreate,
    PatternRead,
    CategoryRead,
    ResponseRead,
    ResponseOutputUpdate,
    PatternUpdate,
    CategoryPatternUpdate,
    MergePreviewPrompts
)

#standard user create test
def test_user_create_valid():
    payload = {"name": "user", "email": "user@example.com", "password": "pass"}
    user = UserCreate(**payload)
    assert user.name == "user"
    assert user.email == "user@example.com"
    assert user.password == "pass"

#incomplete payload
@pytest.mark.parametrize("bad_payload", [
    {},
    {"name": "bad"},
    {"email": "bad@example.com"},
    {"password": "badpass"},
])

#create user with payload that's incomplete
def test_user_create_invalid(bad_payload):
    with pytest.raises(ValidationError):
        UserCreate(**bad_payload)

def test_user_read_requires_fields():
    data = {"user_id": "u1", "name": "blah", "email": "blah@example.com"}
    user_read = UserRead(**data)
    assert user_read.user_id == "u1"
    assert user_read.name == "blah"
    assert user_read.email == "blah@example.com"


def test_response_create_valid():
    payload = {"input": "Test prompt"}
    rc = ResponseCreate(**payload)
    assert rc.input == "Test prompt"

#create response with empty payload
@pytest.mark.parametrize("bad_payload", [
    {},
])

def test_response_create_invalid(bad_payload):
    with pytest.raises(ValidationError):
        ResponseCreate(**bad_payload)

def test_pattern_read_valid():
    data = {"pattern_id": "p1", "pattern": "Pat", "feedback": "Good", "applied": True}
    pat = PatternRead(**data)
    assert pat.pattern_id == "p1"
    assert pat.pattern == "Pat"
    assert pat.feedback == "Good"
    assert pat.applied is True

@pytest.mark.parametrize("bad_payload", [
    {},
    {"pattern_id": "p1"},
    {"pattern": "Pat"},
    {"feedback": "Good"},
    {"applied": True},
])

def test_pattern_read_invalid(bad_payload):
    with pytest.raises(ValidationError):
        PatternRead(**bad_payload)

def test_category_read_valid_and_default_patterns():
    data = {
        "category_id": "c1",
        "category": "Cat",
        "input": "orig",
        "preview": "prev",
    }
    cat = CategoryRead(**data)
    assert cat.category_id == "c1"
    assert cat.category == "Cat"
    assert cat.input == "orig"
    assert cat.preview == "prev"
    assert len(cat.patterns) == 0

def test_response_read_valid():
    data = {
        "response_id": "r1",
        "user_id": "u1",
        "input": "inp",
        "output": "out",
        "created_at": datetime.utcnow(),
        "categories": []
    }
    rr = ResponseRead(**data)
    assert rr.response_id == "r1"
    assert rr.user_id == "u1"
    assert rr.input == "inp"
    assert rr.output == "out"
    assert isinstance(rr.created_at, datetime)
    assert rr.categories == []

def test_response_output_update():
    upd = ResponseOutputUpdate(**{"output": "new output"})
    assert upd.output == "new output"

@pytest.mark.parametrize("bad_payload", [
    {},
    {"output": 123}
])
def test_response_output_update_invalid(bad_payload):
    with pytest.raises(ValidationError):
        ResponseOutputUpdate(**bad_payload)


def test_pattern_update_and_category_pattern_update():
    pat_up = PatternUpdate(**{"pattern_id": "p1", "applied": False})
    assert pat_up.pattern_id == "p1"
    assert pat_up.applied is False

    cat_up = CategoryPatternUpdate(**{"patterns": [{"pattern_id": "p1", "applied": True}]})
    assert isinstance(cat_up.patterns, list)
    assert cat_up.patterns[0].pattern_id == "p1"
    assert cat_up.patterns[0].applied is True

@pytest.mark.parametrize("bad_payload", [
    {},
    {"patterns": "notalist"},
    {"patterns": [{}]},
])
def test_category_pattern_update_invalid(bad_payload):
    with pytest.raises(ValidationError):
        CategoryPatternUpdate(**bad_payload)

def test_merge_preview_prompts():
    mp = MergePreviewPrompts(**{"previews": ["a","b"]})
    assert mp.previews == ["a","b"]

@pytest.mark.parametrize("bad_payload", [
    {},
    {"previews": "notalist"},
    {"previews": [123]}
])
def test_merge_preview_prompts_invalid(bad_payload):
    with pytest.raises(ValidationError):
        MergePreviewPrompts(**bad_payload)
