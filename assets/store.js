(function bootTheme() {
  try {
    const stored = localStorage.getItem("turnoya-theme");
    const user = JSON.parse(localStorage.getItem("turnoya-user") || "null");
    const dark =
      user && typeof user.darkMode === "boolean" ? user.darkMode : stored === "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  } catch {
    document.documentElement.dataset.theme =
      localStorage.getItem("turnoya-theme") === "dark" ? "dark" : "light";
  }
})();

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
