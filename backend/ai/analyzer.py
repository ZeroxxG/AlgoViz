"""
backend/ai/analyzer.py
-----------------------
Backend static code complexity analyzer.
Parses AST to count loop nest depth, recursive calls, function definitions,
and estimates Big-O time and space complexity.
"""

import ast

def analyze_complexity(code_str: str) -> dict:
    """Analyze Python source code and calculate complexity metrics."""
    metrics = {
        "time_complexity": "O(N)",
        "space_complexity": "O(1)",
        "max_loop_depth": 0,
        "is_recursive": False,
        "function_count": 0,
        "explanation": "Linear time complexity based on code structure."
    }

    try:
        tree = ast.parse(code_str)
    except Exception:
        return metrics

    max_depth = 0
    func_names = set()
    recursive_found = False

    # Collect function names first
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            func_names.add(node.name)
            metrics["function_count"] += 1

    def calc_loop_depth(node, current_depth=0):
        nonlocal max_depth, recursive_found
        
        if isinstance(node, (ast.For, ast.While)):
            current_depth += 1
            if current_depth > max_depth:
                max_depth = current_depth

        # Check for recursive function calls
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id in func_names:
                recursive_found = True

        for child in ast.iter_child_nodes(node):
            calc_loop_depth(child, current_depth)

    calc_loop_depth(tree, 0)

    metrics["max_loop_depth"] = max_depth
    metrics["is_recursive"] = recursive_found

    # Classify Big-O
    if recursive_found:
        metrics["time_complexity"] = "O(2ⁿ)"
        metrics["space_complexity"] = "O(N)"
        metrics["explanation"] = "Recursive call structure detected (exponential/tree call stack)."
    elif max_depth >= 2:
        metrics["time_complexity"] = "O(N²)"
        metrics["space_complexity"] = "O(1)"
        metrics["explanation"] = f"Nested loop depth of {max_depth} detected (quadratic time)."
    elif max_depth == 1:
        metrics["time_complexity"] = "O(N)"
        metrics["space_complexity"] = "O(1)"
        metrics["explanation"] = "Single loop traversal detected (linear time)."
    else:
        metrics["time_complexity"] = "O(1)"
        metrics["space_complexity"] = "O(1)"
        metrics["explanation"] = "Sequential execution with constant time operations."

    return metrics
