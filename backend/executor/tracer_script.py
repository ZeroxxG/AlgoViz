"""
tracer_script.py
----------------
Python Tutor memory tracer script.
Executes code under sys.settrace and returns a step-by-step trace
containing Frames (Global frame & call stack) and Objects (Heap memory graph).
"""

import sys
import json
import io
import traceback
import builtins

MAX_STEPS = 500

class PythonTutorMemoryTracer:
    def __init__(self):
        self.heap = {}        # obj_id -> serialized object
        self.id_counter = 1
        self.obj_map = {}     # python id(v) -> obj_id

    def get_obj_id(self, obj):
        py_id = id(obj)
        if py_id not in self.obj_map:
            self.obj_map[py_id] = f"obj_{self.id_counter}"
            self.id_counter += 1
        return self.obj_map[py_id]

    def serialize(self, v, depth=0):
        if depth > 4:
            return {"type": "primitive", "value": "..."}

        # Primitives
        if v is None:
            return {"type": "primitive", "value": None, "repr": "None"}
        if isinstance(v, (bool, int, float)):
            return {"type": "primitive", "value": v, "repr": str(v)}
        if isinstance(v, str):
            return {"type": "primitive", "value": v, "repr": repr(v)}

        # Functions
        if callable(v):
            obj_id = self.get_obj_id(v)
            name = getattr(v, "__name__", "function")
            params = []
            if hasattr(v, "__code__"):
                params = list(v.__code__.co_varnames[:v.__code__.co_argcount])
            self.heap[obj_id] = {
                "id": obj_id,
                "type": "function",
                "name": name,
                "params": params,
                "repr": f"function {name}({', '.join(params)})"
            }
            return {"type": "ref", "ref": obj_id}

        # Lists / Tuples / Sets
        if isinstance(v, (list, tuple, set)):
            obj_id = self.get_obj_id(v)
            container_type = "list" if isinstance(v, list) else ("tuple" if isinstance(v, tuple) else "set")
            
            # Prevent infinite recursion for recursive structures
            if obj_id in self.heap:
                return {"type": "ref", "ref": obj_id}

            elements = []
            # Pre-register in heap to break cycles
            self.heap[obj_id] = {
                "id": obj_id,
                "type": container_type,
                "elements": elements,
                "length": len(v)
            }

            items_list = list(v)
            for item in items_list[:50]:
                elements.append(self.serialize(item, depth + 1))

            return {"type": "ref", "ref": obj_id}

        # Dictionaries
        if isinstance(v, dict):
            obj_id = self.get_obj_id(v)
            if obj_id in self.heap:
                return {"type": "ref", "ref": obj_id}

            entries = []
            self.heap[obj_id] = {
                "id": obj_id,
                "type": "dict",
                "entries": entries,
                "length": len(v)
            }

            for key, val in list(v.items())[:30]:
                entries.append({
                    "key": self.serialize(key, depth + 1),
                    "val": self.serialize(val, depth + 1)
                })

            return {"type": "ref", "ref": obj_id}

        # Custom class/object fallback
        obj_id = self.get_obj_id(v)
        if obj_id in self.heap:
            return {"type": "ref", "ref": obj_id}

        t_name = type(v).__name__
        self.heap[obj_id] = {
            "id": obj_id,
            "type": "instance",
            "class": t_name,
            "repr": repr(v)[:100]
        }
        return {"type": "ref", "ref": obj_id}


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
        "zip", "Exception", "ValueError", "TypeError", "KeyError", "IndexError",
        "AttributeError", "RuntimeError", "StopIteration", "ZeroDivisionError"
    ]
}


def run_trace(code_str: str) -> list:
    steps = []
    stdout = io.StringIO()
    tracer = PythonTutorMemoryTracer()
    frame_stack = []  # track frame metadata

    class _Capture:
        def write(self, text):
            stdout.write(text)
        def flush(self):
            pass

    def _tracer(frame, event, arg):
        if len(steps) >= MAX_STEPS:
            raise RuntimeError(f"Execution limit exceeded ({MAX_STEPS} steps). Check loops.")

        if frame.f_code.co_filename != "<string>":
            return _tracer

        func_name = frame.f_code.co_name

        # Extract frames & local bindings
        if event in ("line", "call", "return"):
            # Gather stack frames
            frames_snapshot = []
            curr = frame
            stack_chain = []
            
            while curr and curr.f_code.co_filename == "<string>":
                stack_chain.append(curr)
                curr = curr.f_back

            stack_chain.reverse() # Global frame first

            for idx, f in enumerate(stack_chain):
                f_name = f.f_code.co_name
                is_global = (f_name == "<module>")
                display_name = "Global frame" if is_global else f"f{idx}: {f_name}"
                
                bindings = {}
                for k, v in f.f_locals.items():
                    if not k.startswith("__"):
                        bindings[k] = tracer.serialize(v)

                frames_snapshot.append({
                    "frame_id": f"frame_{idx}",
                    "name": display_name,
                    "func_name": f_name,
                    "is_global": is_global,
                    "encoded_locals": bindings
                })

            ret_val = None
            if event == "return" and arg is not None:
                ret_val = tracer.serialize(arg)

            steps.append({
                "step": len(steps),
                "line": frame.f_lineno,
                "event": event,
                "func_name": func_name,
                "frames": frames_snapshot,
                "heap": dict(tracer.heap),
                "stdout": stdout.getvalue(),
                "return_value": ret_val
            })

        return _tracer

    safe_globals = {"__name__": "__main__", "__builtins__": SAFE_BUILTINS}
    old_stdout = sys.stdout
    sys.stdout = _Capture()
    sys.settrace(_tracer)

    try:
        compiled = compile(code_str, "<string>", "exec")
        exec(compiled, safe_globals)
    except Exception as exc:
        steps.append({
            "step": len(steps),
            "line": getattr(sys.exc_info()[2], 'tb_lineno', -1),
            "event": "error",
            "func_name": "",
            "frames": [],
            "heap": dict(tracer.heap),
            "stdout": stdout.getvalue(),
            "error": str(exc),
            "error_type": type(exc).__name__,
            "traceback": traceback.format_exc()
        })
    finally:
        sys.settrace(None)
        sys.stdout = old_stdout

    return steps


if __name__ == "__main__":
    code = sys.stdin.read()
    result = run_trace(code)
    sys.stdout.write(json.dumps(result, ensure_ascii=False))
