"""Step tracer for the code visualizer (Python).

Runs the full judged program (problem driver + learner code) under sys.settrace and records one step for every
line executed INSIDE the learner's code (source lines LO..HI). The problem driver itself is never recorded, so the
learner only sees their own function execute. Result: one JSON document written to the real stdout.

Usage: python3 -I pythonTracer.py <source file> <first learner line> <last learner line>
"""
import collections
import io
import json
import math
import sys
import types

SOURCE_PATH, FIRST_LINE, LAST_LINE = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
TRACE_FILENAME = '<learner-program>'
CO_OPTIMIZED = 0x1  # set only on real function bodies, never on module or class bodies

MAX_STEPS = 1500
MAX_FRAMES = 8
MAX_ITEMS = 30
MAX_DEPTH = 3
MAX_TEXT = 80
MAX_VARIABLES = 20
MAX_OUTPUT_CHARS = 20000
BYTE_BUDGET = 700000  # keeps the JSON below the judge's stdout cap
HIDDEN_VALUE_TYPES = (types.FunctionType, types.BuiltinFunctionType, types.MethodType, types.ModuleType, type)

real_stdout = sys.stdout
encoded_steps = []
budget_used = 0
captured_output = []
captured_length = 0


class StepLimitReached(BaseException):
    """Stops the learner's program once enough steps were recorded; BaseException so `except Exception` cannot hide it."""


class OutputCapture(io.TextIOBase):
    """Collects what the program prints so every step can show the output produced so far."""

    def writable(self):
        return True

    def write(self, text):
        global captured_length
        if captured_length < MAX_OUTPUT_CHARS:
            captured_output.append(text[: MAX_OUTPUT_CHARS - captured_length])
        captured_length = min(MAX_OUTPUT_CHARS, captured_length + len(text))
        return len(text)


def clip_text(text):
    return text if len(text) <= MAX_TEXT else text[:MAX_TEXT] + '…'


def serialize_number(value):
    if isinstance(value, float) and not math.isfinite(value):
        return {'t': 'raw', 'v': repr(value)}
    if isinstance(value, int) and abs(value) >= 2 ** 53:
        return {'t': 'raw', 'v': str(value)}  # JavaScript clients cannot represent it exactly
    return value


def serialize_sequence(value, depth):
    items = list(value)
    shown = [serialize_value(item, depth + 1) for item in items[:MAX_ITEMS]]
    return {'t': 'list', 'k': type(value).__name__, 'v': shown, 'more': max(0, len(items) - MAX_ITEMS)}


def serialize_mapping(value, depth):
    pairs = list(value.items())
    shown = [[serialize_value(key, depth + 1), serialize_value(item, depth + 1)] for key, item in pairs[:MAX_ITEMS]]
    return {'t': 'dict', 'v': shown, 'more': max(0, len(pairs) - MAX_ITEMS)}


def serialize_object(value, depth):
    fields = getattr(value, '__dict__', None)
    kind = type(value).__name__
    if not isinstance(fields, dict) or not fields:
        return {'t': 'raw', 'v': clip_text(safe_repr(value)), 'k': kind}
    shown = [[name, serialize_value(item, depth + 1)] for name, item in list(fields.items())[:MAX_VARIABLES]]
    return {'t': 'obj', 'k': kind, 'v': shown}


def safe_repr(value):
    try:
        return repr(value)
    except Exception:  # a broken __repr__ in learner code must not stop the trace
        return '<unprintable>'


def serialize_value(value, depth=0):
    if value is None or isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return serialize_number(value)
    if isinstance(value, str):
        return clip_text(value)
    if depth >= MAX_DEPTH:
        return {'t': 'raw', 'v': clip_text(safe_repr(value)), 'k': type(value).__name__}
    if isinstance(value, (list, tuple, set, frozenset, collections.deque)):
        return serialize_sequence(value, depth)
    if isinstance(value, dict):
        return serialize_mapping(value, depth)
    return serialize_object(value, depth)


def is_hidden_variable(name, value):
    if name.startswith('__') or isinstance(value, HIDDEN_VALUE_TYPES):
        return True
    # `self` of a plain Solution class carries no information; keep it for classes that hold state.
    return name in ('self', 'cls') and not getattr(value, '__dict__', None)


def frame_variables(frame):
    shown = []
    for name, value in list(frame.f_locals.items()):
        if is_hidden_variable(name, value):
            continue
        shown.append([name, serialize_value(value)])
        if len(shown) >= MAX_VARIABLES:
            break
    return shown


def is_learner_function(code):
    inside_learner_code = FIRST_LINE <= code.co_firstlineno <= LAST_LINE
    is_real_function = bool(code.co_flags & CO_OPTIMIZED) and not code.co_name.startswith('<')
    return code.co_filename == TRACE_FILENAME and inside_learner_code and is_real_function


def build_stack(frame):
    frames = []
    while frame is not None:
        if is_learner_function(frame.f_code):
            frames.append(frame)
        frame = frame.f_back
    frames.reverse()  # outermost call first, current call last
    return len(frames), [
        {'fn': item.f_code.co_name, 'line': item.f_lineno, 'vars': frame_variables(item)} for item in frames[-MAX_FRAMES:]
    ]


def record_step(frame, event, argument):
    global budget_used
    line = frame.f_lineno
    if not FIRST_LINE <= line <= LAST_LINE:
        return
    depth, stack = build_stack(frame)
    step = {'line': line, 'event': event, 'depth': depth, 'stack': stack, 'out': captured_length}
    if event == 'return':
        step['ret'] = serialize_value(argument)
    elif event == 'exception':
        step['exc'] = '%s: %s' % (argument[0].__name__, argument[1])
    encoded = json.dumps(step, separators=(',', ':'))
    budget_used += len(encoded)
    if len(encoded_steps) >= MAX_STEPS or budget_used > BYTE_BUDGET:
        raise StepLimitReached()
    encoded_steps.append(encoded)


def trace_lines(frame, event, argument):
    if event in ('line', 'return', 'exception'):
        record_step(frame, event, argument)
    return trace_lines


def trace_calls(frame, event, argument):
    # Only learner functions are traced line by line; driver code and library calls run at full speed.
    if event == 'call' and is_learner_function(frame.f_code):
        return trace_lines
    return None


def learner_error_line(error):
    line = None
    traceback = error.__traceback__
    while traceback is not None:
        if traceback.tb_frame.f_code.co_filename == TRACE_FILENAME:
            line = traceback.tb_lineno
        traceback = traceback.tb_next
    return line


def run_program():
    outcome = {'truncated': False, 'error': None, 'errorLine': None}
    namespace = {'__name__': '__main__', '__builtins__': __builtins__}
    sys.stdout = OutputCapture()
    try:
        with open(SOURCE_PATH, encoding='utf-8') as source_file:
            program = compile(source_file.read(), TRACE_FILENAME, 'exec')
        sys.settrace(trace_calls)
        exec(program, namespace)
    except StepLimitReached:
        outcome['truncated'] = True
    except SystemExit:
        pass
    except BaseException as error:  # the learner's exception is the result we want to show, not a tracer failure
        outcome['error'] = '%s: %s' % (type(error).__name__, error)
        outcome['errorLine'] = getattr(error, 'lineno', None) or learner_error_line(error)
    finally:
        sys.settrace(None)
        sys.stdout = real_stdout
    return outcome


def main():
    outcome = run_program()
    document = '{"steps":[%s],"stdout":%s,"truncated":%s,"error":%s,"errorLine":%s}' % (
        ','.join(encoded_steps),
        json.dumps(''.join(captured_output)),
        json.dumps(outcome['truncated']),
        json.dumps(outcome['error']),
        json.dumps(outcome['errorLine']),
    )
    real_stdout.write(document)
    real_stdout.flush()


main()
