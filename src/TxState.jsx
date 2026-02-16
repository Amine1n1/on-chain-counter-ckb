let status = "idle";
const listeners = new Set();

export function setTxStatus(newStatus) {
  status = newStatus;
  listeners.forEach(fn => fn(status));
}

export function subscribeTxStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getTxStatus() {
  return status;
}
