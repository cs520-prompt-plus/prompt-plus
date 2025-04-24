import os
import re
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage
from app.config import Category, Pattern, CATEGORY_TO_PATTERNS, PATTERN_TO_CONTEXT, TEMPLATE_PROMPT, EVALUATION_PROMPT, IMPROVEMENT_PROMPT, STANDARDIZATION_PROMPT

load_dotenv()

OPENAI_KEY = os.getenv("OPENAI_KEY")
MODEL = os.getenv("MODEL")

async def improve_prompt(user_input: str):
    output = []

    for category in CATEGORY_TO_PATTERNS.keys():
        if category == Category.INPUT_SEMANTICS.value:
            output.append(await apply_category(user_input, category))
        else:
            output.append({
                "original_prompt": user_input,
                "category": category,
                "patterns": [],
                "new_prompt": user_input
            })

    return await _standardize_category_outputs(output)

async def apply_category(user_input: str, category: str):
    patterns = CATEGORY_TO_PATTERNS.get(category)

    if patterns is None:
        raise Exception("Unknown Prompting Category")

    output = []

    for pattern in patterns:
        output.append(await _apply_pattern(user_input, category, pattern))

    return await _standardize_pattern_outputs(output, category)

async def _apply_pattern(user_input: str, category: str, pattern: str):
    output = { "original_prompt": user_input, "pattern": pattern } 
    pattern_prompt = _build_pattern_prompt(user_input, category, pattern)

    feedback_input = HumanMessage(content=pattern_prompt)
    feedback_response = await _generate_response(feedback_input)

    evaluation_input = HumanMessage(content=EVALUATION_PROMPT)
    evaluation_history = [feedback_input, AIMessage(content=feedback_response)]
    evaluation_response = await _generate_response(evaluation_input, evaluation_history)

    output["applied"] = "yes" in evaluation_response.strip().lower()
    output["feedback"] = feedback_response

    if not output["applied"]:
        output["new_prompt"] = user_input
        return output

    improvement_input = HumanMessage(content=IMPROVEMENT_PROMPT)
    improvement_history = [feedback_input, AIMessage(content=feedback_response)]
    improvement_response = await _generate_response(improvement_input, improvement_history)

    output["new_prompt"] = _extract_prompt(improvement_response)

    return output

async def _standardize_category_outputs(output: list[dict]):
    original_prompt = output[0]["original_prompt"]
    partial_prompts = [f"\"\"\"{original_prompt}\"\"\""]
    categories = []

    for o in output:
        if o["original_prompt"] != o["new_prompt"]:
            p = o["new_prompt"]
            partial_prompts.append(f"\"\"\"{p}\"\"\"")

        categories.append({
            "name": o["category"],
            "patterns": o["patterns"],
            "new_prompt": o["new_prompt"]
        })

    if len(partial_prompts):
        response = await _generate_response(STANDARDIZATION_PROMPT.format(prompts="\n\n".join(partial_prompts)))
        new_prompt = _extract_prompt(response)
    else:
        new_prompt = original_prompt

    return {
        "original_prompt": original_prompt,
        "categories": categories,
        "new_prompt": new_prompt
    }

async def _standardize_pattern_outputs(output: list[dict], category: str):
    original_prompt = output[0]["original_prompt"]
    partial_prompts = [f"\"\"\"{original_prompt}\"\"\""]
    patterns = []

    for o in output:
        if o["applied"]:
            p = o["new_prompt"]
            partial_prompts.append(f"\"\"\"{p}\"\"\"")
        
        patterns.append({
            "name": o["pattern"], 
            "applied": o["applied"], 
            "feedback": o["feedback"]
        })

    if len(partial_prompts):
        response = await _generate_response(STANDARDIZATION_PROMPT.format(prompts="\n\n".join(partial_prompts)))
        new_prompt = _extract_prompt(response)
    else:
        new_prompt = original_prompt

    return {
        "original_prompt": original_prompt,
        "category": category,
        "patterns": patterns,
        "new_prompt": new_prompt
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