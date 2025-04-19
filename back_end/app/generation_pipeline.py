import os
import re
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage

load_dotenv()

OPENAI_KEY = os.getenv("OPENAI_KEY")
MODEL = os.getenv("MODEL")
EVALUATE_PROMPT = os.getenv("EVALUATE_PROMPT")
GET_IMPROVED_PROMPT = os.getenv("GET_IMPROVED_PROMPT")

async def improve_prompt(user_input, subject):
    if user_input == os.getenv("INPUT_SEMANTICS"):
        base_prompt = os.getenv("INPUT_SEMANTICS_FEEDBACK")
    else:
        raise Exception("Unknown Prompting Category")

    return await _improve_prompt(base_prompt, user_input)

async def _generate_response(query, history=[]):
    llm = ChatOpenAI(model=MODEL, openai_api_key=OPENAI_KEY, temperature=0.0)
    messages = history
    
    messages.append(query)
    response = await llm.ainvoke(messages)
    
    return response.content

def _extract_prompt(response):
    match = re.search(r"<PROMPT>(.*?)</PROMPT>", response, re.DOTALL)

    if not match:
        raise Exception("Error Generating New Prompt")
        
    return match.group(1).strip()

async def _improve_prompt(base_prompt, user_input):
    output = { "original_prompt": user_input }

    feedback_input = HumanMessage(content=base_prompt.format(user_input))
    feedback_response = await _generate_response(feedback_input)

    evaluation_input = HumanMessage(content=EVALUATE_PROMPT)
    evaluation_history = [feedback_input, AIMessage(content=feedback_response)]
    evaluation_response = await _generate_response(evaluation_input, evaluation_history)

    generate_new_prompt = "yes" in evaluation_response.strip().lower()

    if not generate_new_prompt:
        output["feedback"] = "Changes are not needed/applicable for this category."
        output["new_prompt"] = user_input

        return output

    improvement_input = HumanMessage(content=GET_IMPROVED_PROMPT)
    improvement_history = [feedback_input, AIMessage(content=feedback_response)]
    improvement_response = await _generate_response(improvement_input, improvement_history)

    output["feedback"] = feedback_response
    output["new_prompt"] = _extract_prompt(improvement_response)

    return output['new_prompt'] # Must return a string to match db schema
