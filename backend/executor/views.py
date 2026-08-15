"""
executor/views.py
-----------------
POST /api/execute/ -> Executes user code with sys.settrace
POST /api/git-push/ -> Commits and pushes changes to GitHub origin main
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
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


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
            {"steps": [], "error": "Code exceeds the 20,000-character limit."},
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


@api_view(["POST"])
def push_github(request):
    try:
        # git add .
        subprocess.run(["git", "add", "."], cwd=str(PROJECT_ROOT), check=True)
        # git commit
        msg = request.data.get("message", "Update AlgoViz Python Tutor memory visualizer and minimal dark UI")
        subprocess.run(["git", "commit", "-m", msg], cwd=str(PROJECT_ROOT), capture_output=True)
        # git push
        push_res = subprocess.run(["git", "push", "origin", "main"], cwd=str(PROJECT_ROOT), capture_output=True, text=True)
        
        return Response({"status": "success", "output": push_res.stdout or push_res.stderr})
    except Exception as exc:
        return Response({"status": "error", "error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
