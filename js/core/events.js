// Tiny event bus between the simulation and the interface.
const handlers = new Map();

export function on(evt, fn) {
  if (!handlers.has(evt)) handlers.set(evt, new Set());
  handlers.get(evt).add(fn);
  return () => handlers.get(evt).delete(fn);
}

export function emit(evt, data) {
  const set = handlers.get(evt);
  if (!set) return;
  for (const fn of set) {
    try {
      fn(data);
    } catch (err) {
      console.error(`[event:${evt}]`, err);
    }
  }
}
