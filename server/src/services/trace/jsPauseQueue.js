// Hands out inspector pauses one at a time, in order, even when a pause arrives before anyone is waiting for it.
// next() resolves with null once the traced program has ended.
export function createPauseQueue() {
  const arrived = [];
  const waiting = [];
  let ended = false;

  return {
    push(pause) {
      const waiter = waiting.shift();
      if (waiter) waiter(pause);
      else arrived.push(pause);
    },
    end() {
      ended = true;
      waiting.splice(0).forEach((waiter) => waiter(null));
    },
    next() {
      if (arrived.length) return Promise.resolve(arrived.shift());
      if (ended) return Promise.resolve(null);
      return new Promise((resolve) => waiting.push(resolve));
    },
  };
}
