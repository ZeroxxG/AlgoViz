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
  Returns: { "reply": "markdown text", "complexity_analysis": {...} }
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .gemini import call_gemini_api
from .analyzer import analyze_complexity

@api_view(["POST"])
def chat_ai(request):
    data = request.data
    prompt = data.get("prompt", "").strip()
    context = data.get("context", {})
    chat_history = data.get("chat_history", [])
    api_key = data.get("api_key", None)

    if not prompt:
        return Response({"error": "Prompt cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)

    # Perform backend AST complexity analysis on code if provided
    code_str = context.get("code", "")
    complexity_analysis = analyze_complexity(code_str) if code_str else None

    # Inject static metrics into context for Gemini API
    if complexity_analysis and isinstance(context, dict):
        context["static_metrics"] = complexity_analysis

    reply = call_gemini_api(prompt_text=prompt, current_context=context, chat_history=chat_history, api_key=api_key)
    
    return Response({
        "reply": reply,
        "complexity_analysis": complexity_analysis
    })
