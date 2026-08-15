"""
tracer_script.py
----------------
Standalone subprocess script. Reads user code from stdin, executes it
under sys.settrace, and writes a JSON array of execution steps to stdout.

Run via:  python tracer_script.py < user_code.py
"""

import sys
import json
import io
import traceback
import builtins

# ─── Safety limits ────────────────────────────────────────────────────────────
MAX_STEPS = 500          # hard cap on trace steps to prevent infinite loops
MAX_REPR  = 200          # max chars for repr of any single value
MAX_LIST  = 50           # max list/set/tuple elements to serialise
MAX_DICT  = 30           # max dict entries to serialise


# ─── Value serialiser ─────────────────────────────────────────────────────────
def serialize_value(v, depth=0):
    """Convert a Python value to a JSON-safe dict with type information."""
    if depth > 3:
        return {"type": "...", "value": None, "repr": "..."}

    t = type(v).__name__

    if isinstance(v, bool):
        return {"type": "bool", "value": v, "repr": repr(v)}
    if isinstance(v, int):
        return {"type": "int", "value": v, "repr": repr(v)}
    if isinstance(v, float):
        return {"type": "float", "value": v, "repr": repr(v)}
    if isinstance(v, str):
        return {"type": "str", "value": v, "repr": repr(v)[:MAX_REPR]}
    if v is None:
        return {"type": "NoneType", "value": None, "repr": "None"}

    if isinstance(v, list):
        items = [serialize_value(x, depth + 1) for x in v[:MAX_LIST]]
        truncated = len(v) > MAX_LIST
        return {"type": "list", "value": items, "repr": repr(v)[:MAX_REPR],
                "length": len(v), "truncated": truncated}

    if isinstance(v, tuple):
        items = [serialize_value(x, depth + 1) for x in v[:MAX_LIST]]
        return {"type": "tuple", "value": items, "repr": repr(v)[:MAX_REPR],
                "length": len(v)}

    if isinstance(v, set):
        items = [serialize_value(x, depth + 1) for x in list(v)[:MAX_LIST]]
        return {"type": "set", "value": items, "repr": repr(v)[:MAX_REPR],
                "length": len(v)}

    if isinstance(v, dict):
        entries = {}
        for i, (k, val) in enumerate(v.items()):
            if i >= MAX_DICT:
                break
            entries[repr(k)] = serialize_value(val, depth + 1)
        return {"type": "dict", "value": entries, "repr": repr(v)[:MAX_REPR],
                "length": len(v)}

    # Fallback for custom objects / classes
    try:
        r = repr(v)[:MAX_REPR]
    except Exception:
        r = f"<{t}>"
    return {"type": t, "value": None, "repr": r}


# ─── Safe builtins whitelist ──────────────────────────────────────────────────
SAFE_BUILTINS = {
    name: getattr(builtins, name)
    for name in [
        "abs", "all", "any", "ascii", "bin", "bool", "bytearray", "bytes",
        "callable", "chr", "complex", "dict", "divmod", "enumerate",
        "filter", "float", "format", "frozenset", "getattr", "hasattr",
        "hash", "hex", "int", "isinstance", "issubclass", "iter",
        "len", "list", "map", "max", "min", "next", "oct", "ord",
        "pow", "print", "range", "repr", "reversed", "round",
        "set", "slice", "sorted", "str", "sum", "tuple", "type",
        "zip", "NotImplemented", "Ellipsis", "True", "False", "None",
        # Exceptions users typically need
        "Exception", "ValueError", "TypeError", "KeyError", "IndexError",
        "AttributeError", "RuntimeError", "StopIteration", "ArithmeticError",
        "ZeroDivisionError", "OverflowError", "RecursionError",
    ]
}


# ─── Tracer ───────────────────────────────────────────────────────────────────
def run_trace(code_str: str) -> list:
    steps   = []
    stdout  = io.StringIO()
    call_stack: list[str] = []

    class _Capture:
        def write(self, text):
            stdout.write(text)
        def flush(self):
            pass
        def fileno(self):
            raise io.UnsupportedOperation("fileno")

    def _tracer(frame, event, arg):
        # Hard-stop on step limit
        if len(steps) >= MAX_STEPS:
            raise RuntimeError(
                f"Execution halted: exceeded {MAX_STEPS} steps. "
                "Check for infinite loops."
            )

        # Only trace user code (compiled as '<string>')
        if frame.f_code.co_filename != "<string>":
            return _tracer

        # ── Maintain call stack ──────────────────────────────────────────────
        if event == "call":
            name = frame.f_code.co_name
            if name != "<module>":
                call_stack.append(name)
            return _tracer

        if event == "return":
            ret_val = serialize_value(arg) if arg is not None else None

            # Snapshot locals before popping
            loc = {}
            for k, v in frame.f_locals.items():
                if not k.startswith("__"):
                    try:
                        loc[k] = serialize_value(v)
                    except Exception:
                        loc[k] = {"type": "unknown", "value": None, "repr": "<error>"}

            steps.append({
                "step":         len(steps),
                "line":         frame.f_lineno,
                "event":        "return",
                "locals":       loc,
                "stdout":       stdout.getvalue(),
                "stack":        list(call_stack),
                "func_name":    frame.f_code.co_name,
                "return_value": ret_val,
            })

            if call_stack and call_stack[-1] == frame.f_code.co_name:
                call_stack.pop()
            return _tracer

        if event == "line":
            loc = {}
            for k, v in frame.f_locals.items():
                if not k.startswith("__"):
                    try:
                        loc[k] = serialize_value(v)
                    except Exception:
                        loc[k] = {"type": "unknown", "value": None, "repr": "<error>"}

            steps.append({
                "step":         len(steps),
                "line":         frame.f_lineno,
                "event":        "line",
                "locals":       loc,
                "stdout":       stdout.getvalue(),
                "stack":        list(call_stack),
                "func_name":    frame.f_code.co_name,
                "return_value": None,
            })

        return _tracer

    # ── Execute ────────────────────────────────────────────────────────────────
    safe_globals = {"__name__": "__main__", "__builtins__": SAFE_BUILTINS}
    old_stdout = sys.stdout
    sys.stdout = _Capture()
    sys.settrace(_tracer)

    try:
        compiled = compile(code_str, "<string>", "exec")
        exec(compiled, safe_globals)          # noqa: S102
    except Exception as exc:
        steps.append({
            "step":         len(steps),
            "line":         -1,
            "event":        "error",
            "locals":       {},
            "stdout":       stdout.getvalue(),
            "stack":        list(call_stack),
            "func_name":    "",
            "return_value": None,
            "error":        str(exc),
            "error_type":   type(exc).__name__,
            "traceback":    traceback.format_exc(),
        })
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout

    return steps


if __name__ == "__main__":
    code = sys.stdin.read()
    result = run_trace(code)
    # Write JSON to stdout — Django view reads this
    sys.stdout.write(json.dumps(result, ensure_ascii=False))
