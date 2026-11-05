import { MAX_TRACE_FRAMES, MAX_TRACE_VARIABLES } from './traceLimits.js';
import { SERIALIZER_DECLARATION } from './jsValueSerializer.js';

// Names the CommonJS wrapper adds to the module function; they are not the learner's variables.
const HIDDEN_NAMES = new Set(['arguments', 'exports', 'require', 'module', '__filename', '__dirname']);
const VARIABLE_SCOPE_TYPES = new Set(['local', 'block', 'catch']);
const MAX_TEXT = 80;

const raw = (text) => ({ t: 'raw', v: text });

// Turns an inspector RemoteObject into the shared value format (see jsValueSerializer.js).
export async function remoteToValue(cdp, remote) {
  if (remote.subtype === 'null') return null;
  if (remote.type === 'object' && remote.objectId) {
    const { result } = await cdp.send('Runtime.callFunctionOn', {
      objectId: remote.objectId,
      functionDeclaration: SERIALIZER_DECLARATION,
      returnByValue: true,
    });
    return result.value ?? raw(result.description || '[unreadable]');
  }
  if (remote.unserializableValue) return raw(remote.unserializableValue);
  if (remote.type === 'undefined') return raw('undefined');
  if (remote.type === 'string') return remote.value.length > MAX_TEXT ? `${remote.value.slice(0, MAX_TEXT)}…` : remote.value;
  if (remote.type === 'number' || remote.type === 'boolean') return remote.value;
  return raw(String(remote.description ?? remote.type));
}

async function readScopeProperties(cdp, scope) {
  const { result } = await cdp.send('Runtime.getProperties', { objectId: scope.object.objectId, ownProperties: true });
  return result.filter((property) => property.value && property.value.type !== 'function' && !HIDDEN_NAMES.has(property.name));
}

// Scopes are listed innermost first, so the first property seen for a name is the one in effect.
function keepFirstPerName(properties) {
  const seen = new Set();
  return properties.filter((property) => !seen.has(property.name) && seen.add(property.name));
}

async function captureFrame(cdp, callFrame) {
  const scopes = callFrame.scopeChain.filter((scope) => VARIABLE_SCOPE_TYPES.has(scope.type));
  const lists = await Promise.all(scopes.map((scope) => readScopeProperties(cdp, scope)));
  const properties = keepFirstPerName(lists.flat()).slice(0, MAX_TRACE_VARIABLES);
  const values = await Promise.all(properties.map((property) => remoteToValue(cdp, property.value)));
  return {
    fn: callFrame.functionName || 'anonymous',
    line: callFrame.location.lineNumber + 1,
    vars: properties.map((property, index) => [property.name, values[index]]),
  };
}

// Learner frames come innermost first from the inspector; the trace lists the outermost call first.
export async function captureStack(cdp, learnerFrames) {
  const innermost = learnerFrames.slice(0, MAX_TRACE_FRAMES);
  const stack = await Promise.all(innermost.map((callFrame) => captureFrame(cdp, callFrame)));
  return stack.reverse();
}
