import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

OPENAI_KEY = os.getenv("OPENAI_KEY")
MODEL = os.getenv("MODEL")
PROMPT = os.getenv("PROMPT")

async def generate_response(query):
    llm = ChatOpenAI(
        model=MODEL,
        openai_api_key=OPENAI_KEY,
        temperature=0.0
    )

    llm_input = PROMPT.format(query)
    response = await llm.ainvoke(llm_input)
    
    return response.content