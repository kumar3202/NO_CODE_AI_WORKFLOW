from openai import OpenAI
import httpx
from app.models.schemas import LLMRequest

async def query_llm(payload: LLMRequest):
    # GPT-4 / GPT-4o
    if payload.model.startswith("gpt-"):
        client = OpenAI(api_key=payload.api_key)
        try:
            completion = client.chat.completions.create(
                model=payload.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": f"{payload.context}\n\n{payload.prompt}" if payload.context else payload.prompt}
                ]
            )
            return {"response": completion.choices[0].message.content}
        except Exception as e:
            return {"error": str(e)}

    # Gemini via REST API
    elif payload.model.startswith("gemini"):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{payload.model}:generateContent"
        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": payload.api_key,
        }
        data = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"{payload.context}\n\n{payload.prompt}" if payload.context else payload.prompt
                        }
                    ]
                }
            ]
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=data)

        if resp.status_code == 200:
            result = resp.json()
            try:
                return {"response": result['candidates'][0]['content']['parts'][0]['text']}
            except (KeyError, IndexError):
                return {"error": "Unexpected response format", "raw": result}
        else:
            return {"error": f"{resp.status_code} {resp.text}"}

    else:
        return {"error": "Unsupported model"}
