"""
executor/views.py
-----------------
POST /api/execute/
  Body : { "code": "<python source>" }
  Returns: { "steps": [...], "error": null }

The user's code is piped to tracer_script.py in an isolated subprocess.
This keeps the tracer out of Django's process space and enforces a timeout.
"""

import json
import subprocess
import sys
from pathlib import Path

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from django.conf import settings

TRACER = Path(__file__).parent / "tracer_script.py"
TIMEOUT = getattr(settings, "CODE_EXEC_TIMEOUT", 8)


@api_view(["POST"])
def execute_code(request):
    code: str = request.data.get("code", "").strip()

    if not code:
        return Response(
            {"steps": [], "error": "No code provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(code) > 20_000:
        return Response(
            {"steps": [], "error": "Code exceeds the 20 000-character limit."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        result = subprocess.run(
            [sys.executable, str(TRACER)],
            input=code,
            capture_output=True,
            text=True,
            timeout=TIMEOUT,
        )
    except subprocess.TimeoutExpired:
        return Response(
            {
                "steps": [],
                "error": f"Execution timed out after {TIMEOUT} seconds. "
                         "Check for infinite loops.",
            },
            status=status.HTTP_408_REQUEST_TIMEOUT,
        )

    # tracer_script writes JSON to stdout on success, nothing on crash
    raw = result.stdout.strip()

    if not raw:
        stderr = result.stderr.strip() or "Unknown error in tracer."
        return Response(
            {"steps": [], "error": stderr},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        steps = json.loads(raw)
    except json.JSONDecodeError as exc:
        return Response(
            {"steps": [], "error": f"Tracer produced invalid JSON: {exc}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({"steps": steps, "error": None})
