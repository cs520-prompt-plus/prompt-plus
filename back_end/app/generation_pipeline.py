import os
import re
import asyncio
from typing import List
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage
from app.config import (
    Category,
    Pattern,
    CATEGORY_TO_PATTERNS,
    PATTERN_TO_CONTEXT,
    TEMPLATE_PROMPT,
    EVALUATION_PROMPT,
    IMPROVEMENT_PROMPT,
    STANDARDIZATION_PROMPT,
    MANUAL_IMPROVEMENT_PROMPT
)

# Load environment variables from .env file
load_dotenv()

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("MODEL")

# =============================
# Public API Functions
# =============================

async def manually_improve_prompt(user_feedback: str, generated_prompt: str):
    """
    Manually improve a prompt based on user feedback.

    Args:
        user_feedback (str): Feedback from the user about what to improve.
        generated_prompt (str): The original prompt to be refined.

    Returns:
        str: Improved prompt extracted from LLM response.
    """
    response = await _generate_response(MANUAL_IMPROVEMENT_PROMPT.format(prompt=generated_prompt, feedback=user_feedback))
    return _extract_prompt(response)


async def merge_prompts(prompts: List[str]):
    """
    Merge multiple prompts into a single unified prompt using a standardization prompt.

    Args:
        prompts (List[str]): List of prompt strings.

    Returns:
        str: Merged prompt if there are multiple; otherwise, return the single one.
    """
    unique_prompts = list(set(prompts))

    if len(unique_prompts) > 1:
        formatted_prompts = [f"\"\"\"{prompt}\"\"\"" for prompt in prompts]
        response = await _generate_response(STANDARDIZATION_PROMPT.format(prompts="\n\n".join(formatted_prompts)))
        merged_prompt = _extract_prompt(response)
    else:
        merged_prompt = unique_prompts[0]

    return merged_prompt 


async def improve_prompt(user_input: str):
    """
    Apply all categories to the input and generate an improved version with categorized previews.

    Args:
        user_input (str): Original user input prompt.

    Returns:
        dict: Contains original input, improved output, and applied categories.
    """
    tasks = [apply_category(user_input, category) for category in CATEGORY_TO_PATTERNS.keys()]
    output = await asyncio.gather(*tasks)

    return await _standardize_category_outputs(output)


async def apply_category(user_input: str, category: str, force_patterns=[]):
    """
    Apply all or specific patterns from a category to the user input.

    Args:
        user_input (str): Original prompt.
        category (str): Name of the category.
        force_patterns (List[str], optional): Explicit patterns to apply.

    Returns:
        dict: Standardized output for the category, with applied patterns and preview.
    """
    patterns = CATEGORY_TO_PATTERNS.get(category)

    if patterns is None:
        raise Exception("Unknown Prompting Category")

    force_applied = (len(force_patterns) > 0)

    if force_applied:
        for pattern in force_patterns:
            if pattern not in patterns:
                raise Exception(f"Illegal Pattern for Category {category}")
        patterns = force_patterns

    tasks = [_apply_pattern(user_input, category, pattern, force_applied=force_applied) for pattern in patterns]
    output = await asyncio.gather(*tasks)

    return await _standardize_pattern_outputs(output, category)


# =============================
# Internal Utilities
# =============================

async def _apply_pattern(user_input: str, category: str, pattern: str, force_applied=False):
    """
    Apply a single pattern to the input prompt and decide whether to use the result.

    Args:
        user_input (str): Original prompt.
        category (str): Category being applied.
        pattern (str): Pattern to apply.
        force_applied (bool): Skip evaluation and apply regardless.

    Returns:
        dict: Result containing pattern feedback, whether it was applied, and the output.
    """
    output = { "input": user_input, "pattern": pattern } 
    pattern_prompt = _build_pattern_prompt(user_input, category, pattern)

    # Step 1: Generate feedback based on the pattern
    feedback_input = HumanMessage(content=pattern_prompt)
    feedback_response = await _generate_response(feedback_input)

    # Step 2: Evaluate if the pattern should be applied (unless forced)
    if not force_applied:
        evaluation_input = HumanMessage(content=EVALUATION_PROMPT)
        evaluation_history = [feedback_input, AIMessage(content=feedback_response)]
        evaluation_response = await _generate_response(evaluation_input, evaluation_history)
        output["applied"] = "yes" in evaluation_response.strip().lower()
    else:
        output["applied"] = True

    output["feedback"] = feedback_response

    # Step 3: Generate improvement if applied
    if not output["applied"]:
        output["output"] = user_input
        return output

    improvement_input = HumanMessage(content=IMPROVEMENT_PROMPT)
    improvement_history = [feedback_input, AIMessage(content=feedback_response)]
    improvement_response = await _generate_response(improvement_input, improvement_history)

    output["output"] = _extract_prompt(improvement_response)

    return output


async def _standardize_category_outputs(output: list[dict]):
    """
    Merge outputs from different categories into a single final prompt.

    Args:
        output (list[dict]): List of standardized outputs per category.

    Returns:
        dict: Final merged prompt with category metadata.
    """
    original_prompt = output[0]["input"]
    partial_prompts = [o["preview"] for o in output]
    new_prompt = await merge_prompts(partial_prompts)

    categories = []
    for o in output:
        categories.append({
            "category": o["category"],
            "patterns": o["patterns"],
            "preview": o["preview"]
        })

    return {
        "input": original_prompt,
        "categories": categories,
        "output": new_prompt
    }


async def _standardize_pattern_outputs(output: list[dict], category: str):
    """
    Merge pattern-enhanced outputs and generate preview per category.

    Args:
        output (list[dict]): Pattern result dicts.
        category (str): The name of the category.

    Returns:
        dict: Contains preview prompt and metadata for all patterns in the category.
    """
    original_prompt = output[0]["input"]
    partial_prompts = [o["output"] for o in output if o["applied"]]
    new_prompt = await merge_prompts(partial_prompts) if partial_prompts else original_prompt

    patterns = []
    for o in output:
        patterns.append({
            "pattern": o["pattern"], 
            "applied": o["applied"], 
            "feedback": o["feedback"]
        })

    return {
        "input": original_prompt,
        "category": category,
        "patterns": patterns,
        "preview": new_prompt
    }


def _build_pattern_prompt(user_input: str, category: str, pattern: str):
    """
    Construct the prompt template for a specific pattern and category.

    Returns:
        str: Filled-in template prompt.
    """
    return TEMPLATE_PROMPT.format(
        category=category,
        pattern=pattern,
        prompt=user_input,
        context=PATTERN_TO_CONTEXT[pattern]
    )


async def _generate_response(query, history=[]):
    """
    Send a prompt (optionally with history) to the LLM and get a response.

    Args:
        query (str or HumanMessage): Input message to send to the LLM.
        history (list): List of prior messages for context.

    Returns:
        str: The LLM-generated message content.
    """
    llm = ChatOpenAI(model=MODEL, openai_api_key=OPENAI_KEY, temperature=0.0)
    messages = history
    messages.append(query)
    response = await llm.ainvoke(messages)
    return response.content


def _extract_prompt(response):
    """
    Extract content between <PROMPT>...</PROMPT> tags from the model response.

    Args:
        response (str): Raw response from LLM.

    Returns:
        str: Extracted prompt content.
    """
    match = re.search(r"<PROMPT>(.*?)</PROMPT>", response, re.DOTALL)
    if not match:
        raise Exception(response)
    return match.group(1).strip()
