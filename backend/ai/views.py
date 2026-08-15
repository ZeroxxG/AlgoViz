"""
backend/ai/views.py
-------------------
POST /api/chat/
  Body: {
    "prompt": "Explain step 3",
    "context": { "code": "...", "step_info": {...} },
    "chat_history": [...],
    "api_key": "optional_override_key"
  }
  Returns: { "reply": "markdown text" }
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .gemini import call_gemini_api

@api_view(["POST"])
def chat_ai(request):
    data = request.data
    prompt = data.get("prompt", "").strip()
    context = data.get("context", {})
    chat_history = data.get("chat_history", [])
    api_key = data.get("api_key", None)

    if not prompt:
        return Response({"error": "Prompt cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

    reply = call_gemini_api(prompt_text=prompt, current_context=context, chat_history=chat_history, api_key=api_key)
    return Response({"reply": reply})
