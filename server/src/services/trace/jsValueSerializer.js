// Value serializer for the JavaScript step tracer.
//
// `serializeThisValue` is NOT called in this process. Its source text is sent to the traced program through the
// inspector (Runtime.callFunctionOn), where `this` is the value being inspected. It must therefore stay
// self-contained: no imports and no references to anything outside its own body.
// The output format matches pythonTracer.py (tags: list, dict, obj, raw) so the client has one renderer.

export function serializeThisValue() {
  const MAX_ITEMS = 30;
  const MAX_DEPTH = 3;
  const MAX_TEXT = 80;
  const ancestors = [];

  const clip = (text) => (text.length <= MAX_TEXT ? text : `${text.slice(0, MAX_TEXT)}…`);
  const raw = (text, kind) => (kind ? { t: 'raw', v: text, k: kind } : { t: 'raw', v: text });
  const constructorName = (value) => (value.constructor && value.constructor.name) || 'Object';

  function serializePrimitive(value) {
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'string') return clip(value);
    if (typeof value === 'number') return Number.isFinite(value) ? value : raw(String(value));
    if (typeof value === 'function') return raw(`ƒ ${value.name || 'anonymous'}`);
    return raw(String(value)); // undefined, bigint, symbol
  }

  function serializeList(items, kind, depth) {
    const shown = items.slice(0, MAX_ITEMS).map((item) => serialize(item, depth + 1));
    return { t: 'list', k: kind, v: shown, more: Math.max(0, items.length - MAX_ITEMS) };
  }

  function serializePairs(pairs, depth) {
    const shown = pairs.slice(0, MAX_ITEMS).map(([key, item]) => [serialize(key, depth + 1), serialize(item, depth + 1)]);
    return { t: 'dict', v: shown, more: Math.max(0, pairs.length - MAX_ITEMS) };
  }

  function serializeFields(value, depth) {
    const names = Object.keys(value);
    const shown = names.slice(0, MAX_ITEMS).map((name) => [name, serialize(value[name], depth + 1)]);
    const kind = constructorName(value);
    return kind === 'Object' ? { t: 'dict', v: shown, more: 0 } : { t: 'obj', k: kind, v: shown };
  }

  function serializeObject(value, depth) {
    if (Array.isArray(value)) return serializeList(value, 'array', depth);
    if (value instanceof Set) return serializeList([...value], 'Set', depth);
    if (value instanceof Map) return serializePairs([...value.entries()], depth);
    if (ArrayBuffer.isView(value)) return serializeList(Array.from(value), constructorName(value), depth);
    return serializeFields(value, depth);
  }

  function serialize(value, depth) {
    if (value === null || typeof value !== 'object') return serializePrimitive(value);
    if (ancestors.includes(value)) return raw('[circular]');
    if (depth >= MAX_DEPTH) return raw('…', constructorName(value));
    ancestors.push(value);
    try {
      return serializeObject(value, depth);
    } catch {
      return raw('[unreadable]'); // a throwing getter must not abort the trace
    } finally {
      ancestors.pop();
    }
  }

  return serialize(this, 0);
}

// `this` is boxed for primitives inside a sloppy function, so the declaration forces strict mode.
export const SERIALIZER_DECLARATION = `function () { 'use strict'; return (${serializeThisValue.toString()}).call(this); }`;
