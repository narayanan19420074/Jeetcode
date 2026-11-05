// Minimal Chrome DevTools Protocol client over a WebSocket (Node's built-in global WebSocket, Node 22+).
// Used by the JavaScript step tracer to drive the inspector of the program being visualized.

const CONNECT_TIMEOUT_MS = 5000;

function openSocket(url) {
  if (typeof WebSocket === 'undefined') {
    return Promise.reject(new Error('Step-by-step JavaScript needs Node.js 22 or newer on the judge server.'));
  }
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    const fail = () => reject(new Error('Could not attach to the inspector.'));
    const timer = setTimeout(fail, CONNECT_TIMEOUT_MS);
    socket.addEventListener('open', () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.addEventListener('error', () => {
      clearTimeout(timer);
      fail();
    });
  });
}

// Answers commands by id and forwards protocol events to the listeners registered for them.
function createMessageRouter(pending, listeners) {
  return (message) => {
    const payload = JSON.parse(String(message.data));
    if (payload.id === undefined) {
      (listeners.get(payload.method) || []).forEach((listener) => listener(payload.params));
      return;
    }
    const waiting = pending.get(payload.id);
    pending.delete(payload.id);
    if (!waiting) return;
    if (payload.error) waiting.reject(new Error(payload.error.message));
    else waiting.resolve(payload.result);
  };
}

export async function connectCdp(url) {
  const socket = await openSocket(url);
  const pending = new Map();
  const listeners = new Map();
  const closeListeners = [];
  let nextId = 1;

  socket.addEventListener('message', createMessageRouter(pending, listeners));
  socket.addEventListener('close', () => {
    pending.forEach(({ reject }) => reject(new Error('Inspector connection closed.')));
    pending.clear();
    closeListeners.forEach((listener) => listener());
  });

  return {
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    on(method, listener) {
      listeners.set(method, [...(listeners.get(method) || []), listener]);
    },
    onClose(listener) {
      closeListeners.push(listener);
    },
    close() {
      socket.close();
    },
  };
}
