import sys
from dotenv import load_dotenv

load_dotenv()
sys.path = sys.path + ["./app"]

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.llm_service import LLMService

app = FastAPI()
llm_service = LLMService()


class TextData(BaseModel):
    text: str
    lang: str

@app.get("/")
async def root():
    return {"message": "API is running"}

@app.post("/summarize")
async def summarize(data: TextData):
    text = data.text
    lang = data.lang

    # Validar idiomas suportados
    supported_languages = ["pt", "en", "es"]
    if lang not in supported_languages:
        raise HTTPException(status_code=400, detail="Language not supported")

    summary = llm_service.summarize_text(text, lang)

    if not summary:
        raise HTTPException(status_code=500, detail="Failed to generate summary")

    return {"summary": summary}
