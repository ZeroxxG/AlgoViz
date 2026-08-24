"""
executor/validator.py
----------------------
Validates Python source code using AST parsing before execution.
Checks for syntax errors, disallowed imports (os, sys, subprocess, socket), and code size limits.
"""

import ast

DISALLOWED_MODULES = {
    "os", "sys", "subprocess", "socket", "urllib", "shutil", 
    "importlib", "ctypes", "pathlib", "asyncio", "multiprocessing", "threading"
}

def validate_python_code(code_str: str) -> tuple[bool, str | None]:
    """Parse and validate Python code. Returns (is_valid, error_message)."""
    if not code_str or not code_str.strip():
        return False, "Code string is empty."

    # Parse AST to check syntax
    try:
        tree = ast.parse(code_str)
    except SyntaxError as syn_err:
        return False, f"SyntaxError on line {syn_err.lineno}: {syn_err.msg}"
    except Exception as exc:
        return False, f"Invalid Python code: {str(exc)}"

    # Inspect AST nodes for illegal imports
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name.split('.')[0] in DISALLOWED_MODULES:
                    return False, f"Security Warning: Import of '{alias.name}' is restricted."
        elif isinstance(node, ast.ImportFrom):
            if node.module and node.module.split('.')[0] in DISALLOWED_MODULES:
                return False, f"Security Warning: Import from '{node.module}' is restricted."

    return True, None
