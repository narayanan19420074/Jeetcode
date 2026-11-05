import { JS_LITERALS } from './valueLiterals';

// A trace value is a primitive or a tagged object: { t: 'list' | 'dict' | 'obj' | 'raw', ... } (see the server tracers).

function primitiveToText(value, literals) {
  if (value === null) return literals.nothing;
  if (typeof value === 'boolean') return value ? literals.yes : literals.no;
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

const joinItems = (parts, more) => (more ? [...parts, '…'] : parts).join(', ');

// One-line text for a value, used in sentences ("Returns [0, 1]") and tooltips.
export function valueToText(value, literals = JS_LITERALS) {
  if (value === null || typeof value !== 'object') return primitiveToText(value, literals);
  const text = (item) => valueToText(item, literals);
  if (value.t === 'list') return `[${joinItems(value.v.map(text), value.more)}]`;
  if (value.t === 'dict') return `{${joinItems(value.v.map(([key, item]) => `${text(key)}: ${text(item)}`), value.more)}}`;
  if (value.t === 'obj') return `${value.k}(${value.v.map(([name, item]) => `${name}=${text(item)}`).join(', ')})`;
  return String(value.v);
}

export const currentFrame = (step) => step?.stack[step.stack.length - 1];

export function describeStep(step, literals) {
  if (!step) return '';
  const functionName = currentFrame(step)?.fn;
  if (step.event === 'return') return `Returns ${valueToText(step.ret, literals)} from ${functionName}`;
  if (step.event === 'exception') return `Raises ${step.exc}`;
  return functionName ? `Line ${step.line} in ${functionName}` : `Line ${step.line}`;
}

// Variables whose value differs from the previous step are highlighted. Frames are matched by position and name.
export function findChangedVariables(previousStep, step) {
  const changed = new Set();
  if (!previousStep || !step) return changed;
  step.stack.forEach((frame, index) => {
    const before = previousStep.stack[index];
    const earlier = new Map(before && before.fn === frame.fn ? before.vars.map(([name, value]) => [name, JSON.stringify(value)]) : []);
    frame.vars.forEach(([name, value]) => {
      if (earlier.get(name) !== JSON.stringify(value)) changed.add(`${index}|${name}`);
    });
  });
  return changed;
}

export const outputUpToStep = (trace, step) => (trace && step ? trace.stdout.slice(0, step.out) : '');
