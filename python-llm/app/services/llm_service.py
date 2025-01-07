import os
from langchain_openai import OpenAI

class LLMService:
    def __init__(self):
        # Aqui assumimos que há uma variável de ambiente HF_TOKEN configurada.
        self.llm = OpenAI(
            temperature=0.5,
            top_p=0.7,
            api_key=os.getenv("HF_TOKEN"),  # type: ignore
            base_url="https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1",
        )

    def summarize_text(self, text: str, lang: str) -> str:
        prompt = f"Resuma o seguinte texto no idioma {lang}:\n\n{text}"
        
        try:
            response = self.llm.invoke(prompt)
            return response.strip()
        except Exception as e:
            print(f"Erro ao invocar o LLM: {e}")
            return ""