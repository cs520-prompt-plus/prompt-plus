import os
import re
from typing import List
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage
from app.config import Category, Pattern, CATEGORY_TO_PATTERNS, PATTERN_TO_CONTEXT, TEMPLATE_PROMPT, EVALUATION_PROMPT, IMPROVEMENT_PROMPT, STANDARDIZATION_PROMPT, MANUAL_IMPROVEMENT_PROMPT

load_dotenv()

OPENAI_KEY = os.getenv("OPENAI_KEY")
MODEL = os.getenv("MODEL")

async def manually_improve_prompt(user_feedback: str, generated_prompt: str):
    response = await _generate_response(MANUAL_IMPROVEMENT_PROMPT.format(prompt=generated_prompt, feedback=user_feedback))

    return _extract_prompt(response)

async def merge_prompts(prompts: List[str]):
    unique_prompts = list(set(prompts))

    if len(unique_prompts) > 1:
        formatted_prompts = [f"\"\"\"{prompt}\"\"\"" for prompt in prompts] 
        response = await _generate_response(STANDARDIZATION_PROMPT.format(prompts="\n\n".join(formatted_prompts)))
        merged_prompt = _extract_prompt(response)
    else:
        merged_prompt = unique_prompts[0]

    return merged_prompt 

async def improve_prompt(user_input: str):
    output = []

    for category in CATEGORY_TO_PATTERNS.keys():
        output.append(await apply_category(user_input, category))

    return await _standardize_category_outputs(output)

async def apply_category(user_input: str, category: str, force_patterns=[]):
    patterns = CATEGORY_TO_PATTERNS.get(category)

    if patterns is None:
        raise Exception("Unknown Prompting Category")

    force_applied = (len(force_patterns) > 0)

    if force_applied:
        for pattern in force_patterns:
            if pattern not in patterns:
                raise Exception(f"Illegal Pattern for Category {category}")

        patterns = force_patterns

    output = []

    for pattern in patterns:
        output.append(await _apply_pattern(user_input, category, pattern, force_applied=force_applied))

    return await _standardize_pattern_outputs(output, category)

async def _apply_pattern(user_input: str, category: str, pattern: str, force_applied=False):
    output = { "input": user_input, "pattern": pattern } 
    pattern_prompt = _build_pattern_prompt(user_input, category, pattern)

    feedback_input = HumanMessage(content=pattern_prompt)
    feedback_response = await _generate_response(feedback_input)

    if not force_applied:
        evaluation_input = HumanMessage(content=EVALUATION_PROMPT)
        evaluation_history = [feedback_input, AIMessage(content=feedback_response)]
        evaluation_response = await _generate_response(evaluation_input, evaluation_history)
        output["applied"] = "yes" in evaluation_response.strip().lower()
    else:
        output["applied"] = True

    output["feedback"] = feedback_response

    if not output["applied"]:
        output["output"] = user_input
        return output

    improvement_input = HumanMessage(content=IMPROVEMENT_PROMPT)
    improvement_history = [feedback_input, AIMessage(content=feedback_response)]
    improvement_response = await _generate_response(improvement_input, improvement_history)

    output["output"] = _extract_prompt(improvement_response)

    return output

async def _standardize_category_outputs(output: list[dict]):
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
    original_prompt = output[0]["input"]

    partial_prompts = [o["output"] for o in output if o["applied"]]
    new_prompt = await merge_prompts(partial_prompts) if len(partial_prompts) else original_prompt

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
    return TEMPLATE_PROMPT.format(
        category=category,
        pattern=pattern,
        prompt=user_input,
        context=PATTERN_TO_CONTEXT[pattern]
    )

async def _generate_response(query, history=[]):
    llm = ChatOpenAI(model=MODEL, openai_api_key=OPENAI_KEY, temperature=0.0)
    messages = history
    
    messages.append(query)
    response = await llm.ainvoke(messages)
    
    return response.content

def _extract_prompt(response):
    match = re.search(r"<PROMPT>(.*?)</PROMPT>", response, re.DOTALL)

    if not match:
        raise Exception(response)
        
    return match.group(1).strip()