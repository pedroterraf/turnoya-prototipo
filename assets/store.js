function memoryGet(key) {
  if (localStorage.getItem(key) == null) {
    const old = sessionStorage.getItem(key);
    if (old != null) localStorage.setItem(key, old);
  }
  return localStorage.getItem(key);
}

function memorySet(key, value) {
  localStorage.setItem(key, value);
}

function memoryRemove(key) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  import("./motion.js");
}
