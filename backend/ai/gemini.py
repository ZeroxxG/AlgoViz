"""
backend/ai/gemini.py
--------------------
Wrapper for Gemini API using REST endpoint.
Uses GEMINI_API_KEY from environment or request fallback.
"""

import os
import json
import urllib.request
import urllib.error

DEFAULT_MODEL = "gemini-1.5-flash"

SYSTEM_PROMPT = """You are AlgoViz AI, an expert Data Structures & Algorithms (DSA) tutor and code analyst.
You help users understand their Python code execution line by line.

Your tasks:
1. Identify the algorithm or problem pattern (e.g. "Two Sum - Hash Map approach", "Binary Search", "Bubble Sort").
2. Provide Best and Worst Case Time & Space Complexity analysis with standard Big-O notation.
3. Detect potential bugs, edge cases, off-by-one errors, or infinite loop risks.
4. Explain clearly what is happening at the current execution step when asked.
5. Provide actionable, concise hints and recommendations without spoiling complete answers unless requested.

Formatting rules:
- Format your response in clean GitHub-flavored Markdown.
- Use bolding, short bullet points, and code snippets where helpful.
- Keep responses engaging, structured, and easy to digest.
"""

def call_gemini_api(prompt_text: str, current_context: dict = None, chat_history: list = None, api_key: str = None) -> str:
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key:
        return (
            "⚠️ **Gemini API Key Missing**\n\n"
            "Please provide a valid `GEMINI_API_KEY` in your backend `.env` file or via the settings header to enable AI features.\n\n"
            "Here is what I can tell you locally:\n"
            "- Code analyzed: Python\n"
            "- Tip: Add your API key from Google AI Studio (https://aistudio.google.com/)."
        )

    # Build prompt structure
    contents = []

    # System context block
    context_str = ""
    if current_context:
        code = current_context.get("code", "")
        step_info = current_context.get("step_info", {})
        context_str = f"\n\n--- CURRENT USER CODE ---\n```python\n{code}\n```\n"
        if step_info:
            context_str += f"\n--- CURRENT EXECUTION STEP CONTEXT ---\nStep: {step_info.get('step')}, Line: {step_info.get('line')}, Function: {step_info.get('func_name')}\nLocals: {json.dumps(step_info.get('locals', {}))}\nStdout: {step_info.get('stdout', '')}\n"

    full_system = SYSTEM_PROMPT + context_str

    # Process chat history
    if chat_history:
        for msg in chat_history:
            role = "user" if msg.get("sender") == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg.get("text", "")}]
            })

    # Append current user prompt
    contents.append({
        "role": "user",
        "parts": [{"text": prompt_text}]
    })

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": full_system}]
        },
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 1024,
        }
    }

    # Try gemini-1.5-flash endpoint first, fallback to gemini-2.0-flash if needed
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{DEFAULT_MODEL}:generateContent?key={key}"
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data_bytes, headers={"Content-Type": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            resp_body = json.loads(response.read().decode("utf-8"))
            try:
                text = resp_body["candidates"][0]["content"]["parts"][0]["text"]
                return text
            except (KeyError, IndexError):
                return "Received empty response from Gemini API."
    except urllib.error.HTTPError as e:
        error_content = e.read().decode("utf-8")
        try:
            err_json = json.loads(error_content)
            msg = err_json.get("error", {}).get("message", str(e))
            return f"❌ **Gemini API Error ({e.code})**: {msg}"
        except Exception:
            return f"❌ **Gemini API Error ({e.code})**: {error_content[:200]}"
    except Exception as exc:
        return f"❌ **Connection Error**: {str(exc)}"
