"""
executor/views.py
-----------------
POST /api/execute/ -> Validates with AST, executes code under tracer, returns trace + execution metrics
POST /api/git-push/ -> Commits and pushes changes to GitHub origin main
GET /api/health/ -> Returns backend operational status
"""

import json
import subprocess
import sys
import time
from pathlib import Path

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

from .validator import validate_python_code

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
            {"steps": [], "error": "Code exceeds 20,000 character limit."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate Python syntax and restricted imports using AST validator
    is_valid, validation_err = validate_python_code(code)
    if not is_valid:
        return Response(
            {"steps": [], "error": f"Validation Error: {validation_err}", "error_code": "VALIDATION_FAILED"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    start_time = time.perf_counter()

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
                "error": f"Execution timed out after {TIMEOUT} seconds. Check for infinite loops.",
            },
            status=status.HTTP_408_REQUEST_TIMEOUT,
        )

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
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

    return Response({
        "steps": steps,
        "execution_time_ms": elapsed_ms,
        "total_steps": len(steps),
        "error": None
    })


@api_view(["POST"])
def push_github(request):
    try:
        subprocess.run(["git", "add", "."], cwd=str(PROJECT_ROOT), check=True)
        msg = request.data.get("message", "Update AlgoViz Python Tutor memory visualizer and minimal dark UI")
        subprocess.run(["git", "commit", "-m", msg], cwd=str(PROJECT_ROOT), capture_output=True)
        push_res = subprocess.run(["git", "push", "origin", "main"], cwd=str(PROJECT_ROOT), capture_output=True, text=True)
        
        return Response({"status": "success", "output": push_res.stdout or push_res.stderr})
    except Exception as exc:
        return Response({"status": "error", "error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def health_check(request):
    """GET /api/health/ -> Returns backend status, python version, and system metrics."""
    return Response({
        "status": "healthy",
        "service": "AlgoViz Backend Execution & AI Engine",
        "python_version": sys.version,
        "max_trace_steps": 500,
        "timeout_seconds": TIMEOUT,
        "ast_validator": "active"
    })
