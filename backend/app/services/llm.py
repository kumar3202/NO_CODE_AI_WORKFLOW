from openai import OpenAI
import httpx
from app.models.schemas import LLMRequest


def build_prompt(payload: LLMRequest) -> str:
    if not payload.context:
        return payload.prompt
    return (
        "Answer the question using only the context below. "
        "If the context does not contain the answer, say so.\n\n"
        f"Context:\n{payload.context}\n\n"
        f"Question: {payload.prompt}"
    )


async def query_llm(payload: LLMRequest):
    prompt = build_prompt(payload)

    if payload.model.startswith("gpt-"):
        client = OpenAI(api_key=payload.api_key)
        try:
            completion = client.chat.completions.create(
                model=payload.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt},
                ],
            )
            return {"response": completion.choices[0].message.content}
        except Exception as e:
            return {"error": str(e)}

    elif payload.model.startswith("gemini"):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{payload.model}:generateContent"
        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": payload.api_key,
        }
        data = {"contents": [{"parts": [{"text": prompt}]}]}

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(url, headers=headers, json=data)

        if resp.status_code == 200:
            result = resp.json()
            try:
                return {"response": result["candidates"][0]["content"]["parts"][0]["text"]}
            except (KeyError, IndexError):
                return {"error": "Unexpected response format", "raw": result}
        else:
            return {"error": f"{resp.status_code} {resp.text}"}

    return {"error": "Unsupported model"}
