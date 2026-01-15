from openai import OpenAI
import requests

def generate_embeddings(text: str, api_key: str, provider: str = "openai"):
    if provider == "openai":
        return _openai_embeddings(text, api_key)
    elif provider == "gemini":
        return _gemini_embeddings(text, api_key)
    else:
        raise ValueError("Unsupported provider: must be 'openai' or 'gemini'")


def _openai_embeddings(text: str, api_key: str):
    client = OpenAI(api_key=api_key)
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return {"embedding": response.data[0].embedding}


def _gemini_embeddings(text: str, api_key: str):

    url = f"https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key={api_key}"
    payload = {
        "content": {
            "parts": [{"text": text}]
        }
    }

    headers = {"Content-Type": "application/json"}
    response = requests.post(url, json=payload, headers=headers)
    result = response.json()
    print(response)
    print(result)


    # Correct parsing based on official Gemini spec
    try:
        embedding = result["embedding"]["values"]  # ✅ Correct key is "values", not "value"
        return {"embedding": embedding}
    except KeyError as e:
        raise Exception(f"Gemini Error: {result.get('error', result)}")
