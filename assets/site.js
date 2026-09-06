function navBellSvg() {
  return `<svg class="nav-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Zm4 9a2 2 0 0 0 4 0"/></svg>`;
}

function navLogoutSvg() {
  return `<svg class="nav-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M15 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2M10 12h11m0 0-3.5-3.5M21 12l-3.5 3.5"/></svg>`;
}

function notificationsPageHref(query) {
  return query ? `./notificaciones.html?${query}` : "./notificaciones.html";
}

function setNavBellOpen(wrap, panel, button, open) {
  if (!wrap || !panel || !button) return;
  button.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    panel.hidden = false;
    panel.removeAttribute("inert");
    requestAnimationFrame(() => wrap.classList.add("is-open"));
    return;
  }
  wrap.classList.remove("is-open");
  panel.setAttribute("inert", "");
  const hide = () => {
    if (!wrap.classList.contains("is-open")) panel.hidden = true;
  };
  panel.addEventListener("transitionend", hide, { once: true });
  window.setTimeout(hide, 300);
}

function closeNavBellPanels(except) {
  document.querySelectorAll(".nav-bell-wrap").forEach((wrap) => {
    if (wrap === except) return;
    const panel = wrap.querySelector(".nav-bell-panel");
    const button = wrap.querySelector(".nav-bell");
    setNavBellOpen(wrap, panel, button, false);
  });
}

function bindNavBellDoc() {
  if (window.__navBellDocBound) return;
  window.__navBellDocBound = true;
  document.addEventListener("click", (event) => {
    if (event.target.closest(".nav-bell-wrap")) return;
    closeNavBellPanels();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavBellPanels();
  });
}

function guestNavBellHtml() {
  const next = encodeURIComponent(location.pathname.split("/").pop() + location.search);
  const login = `./login.html?next=${next}`;
  return `<div class="nav-bell-wrap">
      <button class="nav-bell" type="button" aria-expanded="false" aria-haspopup="true" aria-label="Notificaciones">
        ${navBellSvg()}
      </button>
      <div class="nav-bell-panel" hidden>
        <p class="nav-bell-login">Para recibir avisos de tus reservas, <a href="${login}">ingresá a tu cuenta</a>.</p>
        <p class="nav-bell-sample-label">Ejemplo · así se verían</p>
        <div class="nav-bell-item is-sample is-unread">
          <strong>Oasis MultiSpa confirmó tu turno</strong>
          <span>Mañana 11:30 · Masaje relajante</span>
        </div>
        <div class="nav-bell-item is-sample">
          <strong>Recordatorio</strong>
          <span>Tu turno es en 2 horas. Llegá 10 minutos antes.</span>
        </div>
        <a class="nav-bell-all" href="${login}">Entrar para activar avisos</a>
      </div>
    </div>`;
}

function navBellHtml(userKey, href) {
  if (!userKey) return guestNavBellHtml();
  const unread = typeof unreadCount === "function" ? unreadCount(userKey) : 0;
  const rows = typeof findMyNotifications === "function" ? findMyNotifications(userKey).slice(0, 3) : [];
  const items = rows.length
    ? rows
        .map((row) => {
          const target = (typeof notificationHref === "function" && notificationHref(row)) || href;
          return `<a class="nav-bell-item${row.isRead ? "" : " is-unread"}" href="${target}" data-note="${row.id}">
            <strong>${row.title}</strong>
            <span>${row.body}</span>
          </a>`;
        })
        .join("")
    : `<p class="nav-bell-empty">No hay notificaciones</p>`;
  return `<div class="nav-bell-wrap">
      <button class="nav-bell" type="button" aria-expanded="false" aria-haspopup="true" aria-label="${
        unread ? `${unread} notificaciones sin leer` : "Notificaciones"
      }">
        ${navBellSvg()}
        ${unread ? `<span class="nav-unread">${unread}</span>` : ""}
      </button>
      <div class="nav-bell-panel" hidden>
        ${items}
        <a class="nav-bell-all" href="${href}">Ver todos los avisos</a>
      </div>
    </div>`;
}

function bindNavBell(host, userKey) {
  const wrap = host.querySelector(".nav-bell-wrap");
  const button = host.querySelector(".nav-bell");
  const panel = host.querySelector(".nav-bell-panel");
  if (!wrap || !button || !panel) return;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = !wrap.classList.contains("is-open");
    closeNavBellPanels(willOpen ? wrap : null);
    setNavBellOpen(wrap, panel, button, willOpen);
  });
  host.querySelectorAll("[data-note]").forEach((link) => {
    link.addEventListener("click", () => {
      if (typeof setReadState === "function") setReadState(link.dataset.note, userKey, true);
    });
  });
}

function themeToggleHtml() {
  const dark = document.documentElement.dataset.theme === "dark";
  return `<button class="theme-toggle" type="button" aria-pressed="${dark}" aria-label="${
    dark ? "Modo claro" : "Modo oscuro"
  }"><span class="theme-toggle-knob" aria-hidden="true">${
    dark
      ? '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12.4 4.2a8.2 8.2 0 1 0 7.4 12.1A6.6 6.6 0 0 1 12.4 4.2z"/></svg>'
      : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>'
  }</span></button>`;
}

function persistThemeOnUser(dark) {
  if (typeof currentUser !== "function" || typeof saveUser !== "function") return;
  const user = currentUser();
  if (!user || user.darkMode === dark) return;
  saveUser({ ...user, darkMode: dark });
}

function refreshThemeToggles() {
  const dark = document.documentElement.dataset.theme === "dark";
  document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", dark ? "Modo claro" : "Modo oscuro");
    const knob = button.querySelector(".theme-toggle-knob");
    if (!knob) return;
    knob.innerHTML = dark
      ? '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12.4 4.2a8.2 8.2 0 1 0 7.4 12.1A6.6 6.6 0 0 1 12.4 4.2z"/></svg>'
      : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
  });
}

function applyTheme(theme) {
  const user = typeof currentUser === "function" ? currentUser() : null;
  const fromUser =
    user && typeof user.darkMode === "boolean" ? (user.darkMode ? "dark" : "light") : "";
  const next = theme || fromUser || memoryGet("turnoya-theme") || "light";
  document.documentElement.dataset.theme = next;
  memorySet("turnoya-theme", next);
  persistThemeOnUser(next === "dark");
}

function themeReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function paintTheme(next) {
  applyTheme(next);
  refreshThemeToggles();
}

function themeOrigin(event) {
  const button =
    event?.currentTarget?.closest?.(".theme-toggle") || document.querySelector(".theme-toggle");
  const box = button?.getBoundingClientRect();
  const x = box ? box.left + box.width / 2 : window.innerWidth - 40;
  const y = box ? box.top + box.height / 2 : 28;
  const radius =
    Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 48;
  const root = document.documentElement;
  root.style.setProperty("--theme-x", `${x}px`);
  root.style.setProperty("--theme-y", `${y}px`);
  root.style.setProperty("--theme-r", `${radius}px`);
  return { x, y, radius };
}

function wipeThemeFallback(next, origin) {
  const root = document.documentElement;
  const veil = document.createElement("div");
  veil.className = "theme-wipe-veil";
  veil.style.background = next === "dark" ? "#101412" : "#e6ebe4";
  veil.style.clipPath = `circle(0px at ${origin.x}px ${origin.y}px)`;
  root.appendChild(veil);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      veil.style.clipPath = `circle(${origin.radius}px at ${origin.x}px ${origin.y}px)`;
    });
  });
  window.setTimeout(() => {
    paintTheme(next);
    veil.remove();
  }, 820);
}

function toggleTheme(event) {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  if (themeReducedMotion()) {
    paintTheme(next);
    return;
  }
  const origin = themeOrigin(event);
  const root = document.documentElement;
  if (typeof document.startViewTransition === "function") {
    root.classList.add("theme-wipe-on");
    const transition = document.startViewTransition(() => paintTheme(next));
    const clear = () => root.classList.remove("theme-wipe-on");
    if (transition.finished) transition.finished.finally(clear);
    else window.setTimeout(clear, 820);
    return;
  }
  wipeThemeFallback(next, origin);
}

function clientAccountHtml() {
  const user = typeof currentUser === "function" ? currentUser() : null;
  const next = encodeURIComponent(location.pathname.split("/").pop() + location.search);
  if (!user) {
    return `${themeToggleHtml()}${guestNavBellHtml()}<a href="./login.html?next=${next}">Entrar</a>`;
  }
  return `${themeToggleHtml()}${navBellHtml(user.email, notificationsPageHref())}
    <a href="./perfil.html">Perfil</a>
    <button class="nav-logout" type="button" data-logout>Salir ${navLogoutSvg()}</button>`;
}

function paintClientAccount() {
  const host = document.querySelector("[data-client-account]");
  if (!host) return;
  const user = typeof currentUser === "function" ? currentUser() : null;
  host.innerHTML = clientAccountHtml();
  bindNavBell(host, user?.email || "");
  bindNavBellDoc();
  host.querySelector("[class='theme-toggle'], .theme-toggle")?.addEventListener("click", toggleTheme);
  host.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      logoutUser();
      location.href = "./index.html";
    });
  });
}

function paintOwnerBell() {
  const host = document.querySelector("[data-nav-bell]");
  if (!host) return;
  const owner = typeof currentOwner === "function" ? currentOwner() : null;
  const userKey = owner?.email || host.dataset.user || "";
  if (!userKey) return;
  const href = host.dataset.inbox || notificationsPageHref("rol=dueno");
  host.innerHTML = navBellHtml(userKey, href);
  bindNavBell(host, userKey);
  bindNavBellDoc();
}

function paintDemoFoot() {
  const host = document.querySelector("[data-demo-foot]");
  if (!host) return;
  host.innerHTML =
    `© 2026 TurnoYa · <a href="./negocios.html">Para negocios</a> · <a href="./planes.html">Planes</a> · <a href="./alta.html">Publicar mi local</a>`;
}

if (typeof seedPlaceAgenda === "function") {
  seedPlaceAgenda("oasis");
}

const TOAST_DURATION_MS = 4200;

function toastIcon(tone) {
  if (tone === "success") {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  }
  if (tone === "error") {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9 9 15M9 9l6 6"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Zm4 9a2 2 0 0 0 4 0"/></svg>';
}

function toastHost() {
  let host = document.getElementById("app-toasts");
  if (host) return host;
  host = document.createElement("div");
  host.id = "app-toasts";
  host.className = "app-toasts";
  host.setAttribute("aria-live", "polite");
  document.body.append(host);
  return host;
}

function showAppToast(input) {
  const data =
    typeof input === "string"
      ? { title: input, tone: "info" }
      : input || {};
  const tone = data.tone || (data.href ? "notice" : "info");
  const card = document.createElement("aside");
  card.className = `app-toast is-${tone}`;
  card.setAttribute("role", "status");
  const action = data.href
    ? `<a class="btn btn-ticket" href="${data.href}">${data.actionLabel || "Ver"}</a>`
    : "";
  card.innerHTML = `
    <span class="app-toast-ico" aria-hidden="true">${toastIcon(tone)}</span>
    <div>
      <strong>${data.title || "Aviso"}</strong>
      ${data.body ? `<p>${data.body}</p>` : ""}
    </div>
    ${action}
    <button class="app-toast-close" type="button" aria-label="Cerrar">×</button>
  `;
  toastHost().prepend(card);
  const hide = () => {
    if (card.dataset.leaving) return;
    card.dataset.leaving = "1";
    const done = () => card.remove();
    if (window.turnoyaMotion?.exit) {
      window.turnoyaMotion
        .exit(card, { opacity: [1, 0], y: [0, 10] }, { duration: 0.2, ease: window.turnoyaMotion.easeOut })
        .then(done);
      return;
    }
    card.classList.add("is-leaving");
    window.setTimeout(done, 200);
  };
  card.querySelector(".app-toast-close")?.addEventListener("click", hide);
  window.setTimeout(hide, data.duration || TOAST_DURATION_MS);
  return card;
}

function showNotifyToast(row) {
  const href =
    (typeof notificationHref === "function" && notificationHref(row)) ||
    (typeof notificationsPageHref === "function" ? notificationsPageHref() : "./notificaciones.html");
  showAppToast({
    title: row.title,
    body: row.body,
    href,
    tone: "notice",
    actionLabel: "Abrir",
    duration: 7000,
  });
}

window.showAppToast = showAppToast;

function bindNotifyLive() {
  if (window.__notifyLiveBound) return;
  window.__notifyLiveBound = true;
  const onRow = (row) => {
    paintClientAccount();
    paintOwnerBell();
    const user = typeof currentUser === "function" ? currentUser() : null;
    if (!user || !row || String(row.userKey || "") !== String(user.email || "").toLowerCase()) return;
    showNotifyToast(row);
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(row.title, { body: row.body });
      } catch {
        /* ignore */
      }
    }
  };
  window.addEventListener("turnoya-notify", (event) => {
    onRow(event.detail);
    const dock = document.querySelector(".app-dock");
    if (dock) {
      dock.remove();
      document.body.classList.remove("has-app-dock");
      paintAppDock();
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== "turnoya-notify-ping" && event.key !== "turnoya-notifications") return;
    paintClientAccount();
    paintOwnerBell();
    const user = typeof currentUser === "function" ? currentUser() : null;
    if (!user || typeof findMyNotifications !== "function") return;
    const latest = findMyNotifications(user.email)[0];
    if (latest && !latest.isRead) showNotifyToast(latest);
  });
}

function fitViewport() {
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta) {
    meta.content =
      "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content";
  }
}

function visualKeyboard() {
  const vv = window.visualViewport;
  if (!vv) {
    return { inset: 0, height: window.innerHeight, top: 0, open: false };
  }
  const inset = Math.max(0, Math.round(window.innerHeight - vv.offsetTop - vv.height));
  return {
    inset,
    height: Math.round(vv.height),
    top: Math.round(vv.offsetTop),
    open: inset > 90,
  };
}

function applyVisualKeyboard() {
  if (document.documentElement.classList.contains("theme-wipe-on")) {
    return visualKeyboard();
  }
  const kb = visualKeyboard();
  const root = document.documentElement;
  root.style.setProperty("--kb-inset", `${kb.inset}px`);
  root.style.setProperty("--vv-height", `${kb.height}px`);
  root.style.setProperty("--vv-top", `${kb.top}px`);
  document.body.classList.toggle("is-keyboard-open", kb.open);
  root.classList.toggle("is-keyboard-open", kb.open);
  if (document.body.classList.contains("map-home") && (kb.open || kb.top > 0)) {
    window.scrollTo(0, 0);
  }
  return kb;
}

window.visualKeyboard = visualKeyboard;
window.applyVisualKeyboard = applyVisualKeyboard;

function keepFocusAboveKeyboard() {
  applyVisualKeyboard();

  function reveal(target) {
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches("input, textarea, select, [contenteditable='true']")) return;
    if (document.body.classList.contains("map-home")) {
      applyVisualKeyboard();
      return;
    }
    const vv = window.visualViewport;
    const visibleTop = vv ? vv.offsetTop + 12 : 12;
    const visibleBottom = vv ? vv.offsetTop + vv.height - 16 : window.innerHeight - 16;
    const form = target.closest("form, .auth-card, .band, .turno-card") || document;
    const action =
      form.querySelector("button[type='submit'], .btn-ticket, .btn-enamel, #go-pay, #confirm-slot") ||
      document.querySelector("#pick-bar .btn, #go-pay, #confirm-slot");
    const box = target.getBoundingClientRect();
    if (box.top < visibleTop || box.bottom > visibleBottom - 72) {
      target.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    }
    if (action) {
      const actionBox = action.getBoundingClientRect();
      if (actionBox.bottom > visibleBottom) {
        window.scrollBy({ top: actionBox.bottom - visibleBottom + 12, behavior: "smooth" });
      }
    }
  }

  document.addEventListener("focusin", (event) => reveal(event.target));
  document.addEventListener("focusout", () => {
    window.setTimeout(applyVisualKeyboard, 80);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      applyVisualKeyboard();
      reveal(document.activeElement);
    });
    window.visualViewport.addEventListener("scroll", () => {
      if (document.body.classList.contains("map-home")) {
        window.scrollTo(0, 0);
        applyVisualKeyboard();
      }
    });
  }
}

function dockIcon(d) {
  return `<svg class="dock-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="${d}"/></svg>`;
}

function currentPageName() {
  const name = location.pathname.split("/").pop();
  return name && name !== "" ? name : "index.html";
}

function paintAppDock() {
  if (document.querySelector(".app-dock")) return;
  if (!document.querySelector("[data-client-account]")) return;
  const page = currentPageName();
  if (["login.html", "alta.html", "bo-login.html", "ops-login.html", "mp.html"].includes(page)) {
    return;
  }
  const user = typeof currentUser === "function" ? currentUser() : null;
  const unread = user && typeof unreadCount === "function" ? unreadCount(user.email) : 0;
  const next = encodeURIComponent(page + location.search);
  const items = [
    {
      href: "./index.html",
      label: "Mapa",
      on: page === "index.html",
      icon: dockIcon("M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"),
    },
    {
      href: "./mi-turno.html",
      label: "Turnos",
      on: page === "mi-turno.html",
      icon: dockIcon("M7 4v2M17 4v2M5 8h14M6 6h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm3 6h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01"),
    },
    {
      href: "./notificaciones.html",
      label: "Avisos",
      on: page === "notificaciones.html",
      badge: unread,
      icon: dockIcon("M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Zm4 9a2 2 0 0 0 4 0"),
    },
    {
      href: typeof currentOwner === "function" && currentOwner()
        ? `./bo.html?id=${currentOwner().placeId || (typeof ownedPlaceIds === "function" ? ownedPlaceIds()[0] : "") || "oasis"}`
        : user
          ? "./perfil.html"
          : `./login.html?next=${next}`,
      label: typeof currentOwner === "function" && currentOwner() ? "Empresa" : user ? "Perfil" : "Entrar",
      on:
        (typeof currentOwner === "function" && currentOwner() && page.startsWith("bo") && page !== "bo-login.html") ||
        page === "perfil.html",
      icon: dockIcon("M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0"),
    },
  ];
  const nav = document.createElement("nav");
  nav.className = "app-dock";
  nav.setAttribute("aria-label", "App");
  nav.innerHTML = items
    .map(
      (item) =>
        `<a class="dock-item${item.on ? " is-on" : ""}" href="${item.href}">
          ${item.icon}
          ${item.badge ? `<span class="dock-unread">${item.badge}</span>` : ""}
          <span>${item.label}</span>
        </a>`,
    )
    .join("");
  document.body.append(nav);
  document.body.classList.add("has-app-dock");
}

function closeCustomSelect(wrap, instant) {
  wrap.classList.remove("is-open");
  const toggle = wrap.querySelector(".custom-dropdown-toggle");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
  const menu = wrap.querySelector(".custom-dropdown-menu") || wrap._dropdownMenu;
  if (!menu) return;
  const finish = () => {
    menu.hidden = true;
    menu.classList.remove("is-portaled");
    if (menu.parentElement !== wrap) wrap.appendChild(menu);
    menu.style.opacity = "";
    menu.style.transform = "";
  };
  if (instant || menu.hidden || !window.turnoyaMotion?.exit) {
    finish();
    return;
  }
  window.turnoyaMotion
    .exit(menu, { opacity: [1, 0], y: [0, -6] }, { duration: 0.16, ease: window.turnoyaMotion.easeOut })
    .then(finish);
}

function closeAllCustomSelects(except, instant) {
  document.querySelectorAll(".custom-dropdown.is-open").forEach((wrap) => {
    if (wrap === except) return;
    closeCustomSelect(wrap, instant);
  });
}

function enhanceSelect(select) {
  if (!select || select.dataset.customEnhanced) return;
  select.dataset.customEnhanced = "true";

  select.classList.add("custom-select-native-hidden");
  select.setAttribute("tabindex", "-1");
  select.setAttribute("aria-hidden", "true");

  const wrap = document.createElement("div");
  wrap.className = "custom-dropdown";
  if (select.closest(".place-switch")) {
    wrap.classList.add("custom-dropdown-pill");
  }

  select.parentNode.insertBefore(wrap, select);
  wrap.appendChild(select);

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "custom-dropdown-toggle";
  toggle.setAttribute("aria-haspopup", "listbox");
  toggle.setAttribute("aria-expanded", "false");

  const label = document.createElement("span");
  label.className = "custom-dropdown-label";

  const chevron = document.createElement("span");
  chevron.className = "custom-dropdown-chevron";
  chevron.innerHTML = `<svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 1.5 6 6 10.5 1.5"/></svg>`;

  toggle.appendChild(label);
  toggle.appendChild(chevron);
  wrap.appendChild(toggle);

  const menu = document.createElement("ul");
  menu.className = "custom-dropdown-menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;
  wrap.appendChild(menu);
  wrap._dropdownMenu = menu;

  function sync() {
    const selected = select.options[select.selectedIndex];
    label.textContent = selected ? selected.textContent : (select.getAttribute("placeholder") || "Seleccionar...");
    menu.querySelectorAll(".custom-dropdown-item").forEach((item) => {
      const isSelected = item.dataset.value === select.value;
      item.classList.toggle("is-selected", isSelected);
      item.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  }

  function renderOptions() {
    menu.innerHTML = "";
    Array.from(select.options).forEach((opt) => {
      const li = document.createElement("li");
      li.className = "custom-dropdown-item" + (opt.value === select.value ? " is-selected" : "");
      li.setAttribute("role", "option");
      li.setAttribute("data-value", opt.value);
      li.setAttribute("aria-selected", opt.value === select.value ? "true" : "false");

      const itemText = document.createElement("span");
      itemText.className = "custom-dropdown-text";
      itemText.textContent = opt.textContent;
      li.appendChild(itemText);

      const check = document.createElement("span");
      check.className = "custom-dropdown-check";
      check.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
      li.appendChild(check);

      li.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        select.value = opt.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        select.dispatchEvent(new Event("input", { bubbles: true }));
        sync();
        close();
        toggle.focus();
      });

      menu.appendChild(li);
    });
    sync();
  }

  function pinTopbarMenu() {
    if (!select.closest(".topbar, .agenda-modal")) {
      if (menu.parentElement !== wrap) wrap.appendChild(menu);
      menu.classList.remove("is-portaled");
      menu.style.removeProperty("top");
      menu.style.removeProperty("left");
      menu.style.removeProperty("right");
      menu.style.removeProperty("width");
      menu.style.removeProperty("max-width");
      menu.style.removeProperty("max-height");
      return;
    }
    if (menu.parentElement !== document.body) document.body.appendChild(menu);
    menu.classList.add("is-portaled");
    const box = toggle.getBoundingClientRect();
    const view = window.visualViewport;
    const viewW = view ? view.width : window.innerWidth;
    const viewL = view ? view.offsetLeft : 0;
    const viewH = view ? view.height : window.innerHeight;
    const pad = 10;
    const roomRight = viewL + viewW - box.left - pad;
    const roomLeft = box.right - viewL - pad;
    const maxWidth = Math.min(260, viewW - pad * 2);
    menu.style.top = `${Math.round(box.bottom + 6)}px`;
    menu.style.width = "max-content";
    menu.style.minWidth = `${Math.min(Math.round(box.width), maxWidth)}px`;
    if (roomRight < 168 && roomLeft > roomRight) {
      menu.style.left = "auto";
      menu.style.right = `${Math.round(window.innerWidth - box.right)}px`;
      menu.style.maxWidth = `${Math.round(Math.min(maxWidth, roomLeft))}px`;
    } else {
      menu.style.right = "auto";
      menu.style.left = `${Math.round(Math.max(pad, box.left))}px`;
      menu.style.maxWidth = `${Math.round(Math.min(maxWidth, roomRight))}px`;
    }
    menu.style.maxHeight = `${Math.max(160, Math.min(280, viewH - box.bottom - pad))}px`;
  }

  function open() {
    closeAllCustomSelects(wrap, true);
    wrap.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    pinTopbarMenu();
    requestAnimationFrame(pinTopbarMenu);
  }

  function close() {
    closeCustomSelect(wrap);
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (wrap.classList.contains("is-open")) {
      close();
    } else {
      open();
    }
  });

  toggle.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!wrap.classList.contains("is-open")) {
        open();
      }
    }
  });

  const descriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
  if (descriptor && descriptor.set) {
    const originalSet = descriptor.set;
    Object.defineProperty(select, "value", {
      get() {
        return descriptor.get.call(this);
      },
      set(v) {
        originalSet.call(this, v);
        sync();
      },
      configurable: true,
    });
  }

  select.addEventListener("change", sync);
  select.addEventListener("input", sync);

  const observer = new MutationObserver(() => {
    renderOptions();
  });
  observer.observe(select, { childList: true, subtree: true, characterData: true });

  renderOptions();
}

function initCustomSelects() {
  document.querySelectorAll("select").forEach((select) => {
    if (select.closest(".search-select")) return;
    enhanceSelect(select);
  });
}

if (!window.__customSelectDocBound) {
  window.__customSelectDocBound = true;
  document.addEventListener("click", (e) => {
    if (e.target.closest(".custom-dropdown") || e.target.closest(".custom-dropdown-menu")) {
      return;
    }
    closeAllCustomSelects();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllCustomSelects();
    }
  });
}

window.enhanceSelect = enhanceSelect;
window.initCustomSelects = initCustomSelects;

function bindBookingGate() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href*='reservar.html']");
    if (!link) return;
    const user = typeof currentUser === "function" ? currentUser() : null;
    if (typeof bookingReady === "function" && bookingReady(user)) return;
    event.preventDefault();
    const href = link.getAttribute("href");
    location.href = `./perfil.html?next=${encodeURIComponent(href)}`;
  });
}

function paintTour() {
  if (currentPageName() !== "index.html") return;
  const tourVersion = "5";
  if (memoryGet("turnoya-tour-version") !== tourVersion) {
    memoryRemove("turnoya-tour-done");
    memorySet("turnoya-need-tour", "1");
    memorySet("turnoya-tour-version", tourVersion);
  }
  if (memoryGet("turnoya-tour-done") === "1" || memoryGet("turnoya-need-tour") !== "1") return;
  if (document.querySelector(".app-tour")) return;
  const desktop = window.matchMedia("(min-width: 901px)").matches;
  const steps = [
    {
      title: "Mapa",
      body: "Abrí la lista, buscá lo que necesitás y tocá un local en el mapa o en la lista para reservar.",
      selectors: ["#rail-toggle"],
      pad: desktop ? 0 : 6,
      radius: desktop ? 0 : 16,
      openRail: desktop,
    },
    {
      title: "Tus turnos",
      body: "Acá ves tus reservas. Podés cancelar, cambiar el horario o dejar una opinión.",
      selectors: [".app-dock a[href*='mi-turno.html']", ".topbar-nav a[href='./mi-turno.html']"],
      pad: 4,
      radius: 12,
    },
    {
      title: "Avisos",
      body: "La campanita te avisa si confirman, cancelan o te escriben. Si todavía no ingresaste, te mostramos un ejemplo.",
      selectors: [".app-dock a[href*='notificaciones.html']", ".account-slot .nav-bell", ".nav-bell"],
      pad: 4,
      radius: 12,
    },
    {
      title: "Perfil",
      body: "Completá tus datos. Sin eso no se puede reservar.",
      selectors: [
        ".app-dock a[href*='login.html']",
        ".app-dock a[href*='perfil.html']",
        ".app-dock .dock-item:last-child",
        ".account-slot a[href*='login.html']",
        ".account-slot a[href='./perfil.html']",
      ],
      pad: 4,
      radius: 12,
    },
  ];
  let index = 0;
  const overlay = document.createElement("div");
  overlay.className = "app-tour";
  overlay.innerHTML = `
    <div class="app-tour-spot" hidden></div>
    <div class="app-tour-pointer" hidden aria-hidden="true">
      <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 16.5 5.5 9h13z"/></svg>
    </div>
    <div class="app-tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <p class="meta" id="tour-kicker"></p>
      <h2 id="tour-title"></h2>
      <p id="tour-body"></p>
      <div class="app-tour-nav">
        <button class="btn btn-line" type="button" data-tour="skip">Saltar</button>
        <button class="btn btn-enamel" type="button" data-tour="next">Siguiente</button>
      </div>
    </div>`;
  document.body.append(overlay);
  const spot = overlay.querySelector(".app-tour-spot");
  const pointer = overlay.querySelector(".app-tour-pointer");
  const card = overlay.querySelector(".app-tour-card");

  function isOnScreen(node) {
    if (!node) return false;
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
      return false;
    }
    const box = node.getBoundingClientRect();
    return box.width > 2 && box.height > 2;
  }

  function findTarget(step) {
    return (step.selectors || []).map((sel) => document.querySelector(sel)).find(isOnScreen) || null;
  }

  function clearLit() {
    document.querySelectorAll(".app-tour-lit").forEach((node) => node.classList.remove("app-tour-lit"));
  }

  function placeTour(step) {
    if (step.openRail) {
      const rail = document.getElementById("rail");
      if (rail) rail.style.transition = "none";
      document.body.classList.add("is-rail-open");
      document.getElementById("market")?.classList.add("is-rail-open");
      if (rail) void rail.offsetWidth;
    }
    const target = findTarget(step);
    overlay.classList.toggle("is-centered", !target);
    clearLit();
    if (!target) {
      overlay.querySelector("#tour-body").textContent = step.body;
      spot.hidden = true;
      pointer.hidden = true;
      card.style.removeProperty("top");
      card.style.removeProperty("left");
      return;
    }
    const href = target.getAttribute("href") || "";
    const label = (target.textContent || "").replace(/\s+/g, " ").trim();
    const needsLogin = /login\.html/i.test(href) || /^entrar$/i.test(label);
    overlay.querySelector("#tour-body").textContent = needsLogin
      ? "Tenés que acceder para ver tu perfil. Completá tus datos. Sin eso no se puede reservar."
      : step.body;
    if (!step.openRail) target.classList.add("app-tour-lit");
    const box = target.getBoundingClientRect();
    const railBox = step.openRail ? document.getElementById("rail")?.getBoundingClientRect() : null;
    const pad = step.pad || 8;
    const useRail = Boolean(railBox && railBox.width > box.width + 8);
    const rawW = (useRail ? railBox.width : box.width) + pad * 2;
    const rawH = box.height + pad * 2;
    const width = Math.min(window.innerWidth - 8, rawW);
    const height = Math.min(window.innerHeight - 8, rawH);
    const centerX = useRail ? railBox.left + railBox.width / 2 : box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const hole = {
      width,
      height,
      left: Math.max(4, Math.min(centerX - width / 2, window.innerWidth - width - 4)),
      top: Math.max(4, Math.min(centerY - height / 2, window.innerHeight - height - 4)),
    };
    spot.hidden = false;
    spot.style.top = `${hole.top}px`;
    spot.style.left = `${hole.left}px`;
    spot.style.width = `${hole.width}px`;
    spot.style.height = `${hole.height}px`;
    spot.style.borderRadius = `${step.radius || 16}px`;

    const cardW = Math.min(320, window.innerWidth - 24);
    const cardH = card.offsetHeight || 160;
    const gap = 32;
    const spaceAbove = hole.top;
    const spaceBelow = window.innerHeight - (hole.top + hole.height);
    const placeAbove = spaceAbove >= cardH + gap || spaceAbove > spaceBelow;
    let cardTop = placeAbove ? hole.top - cardH - gap : hole.top + hole.height + gap;
    cardTop = Math.max(12, Math.min(cardTop, window.innerHeight - cardH - 12));
    let cardLeft = hole.left + hole.width / 2 - cardW / 2;
    cardLeft = Math.max(12, Math.min(cardLeft, window.innerWidth - cardW - 12));
    card.style.top = `${cardTop}px`;
    card.style.left = `${cardLeft}px`;

    const pointerSize = 28;
    const midX = hole.left + hole.width / 2 - pointerSize / 2;
    if (placeAbove) {
      pointer.style.top = `${hole.top - 20}px`;
      pointer.style.setProperty("--tour-rot", "0deg");
      pointer.style.setProperty("--tour-nudge", "7px");
    } else {
      pointer.style.top = `${Math.max(4, hole.top + hole.height - 12)}px`;
      pointer.style.setProperty("--tour-rot", "180deg");
      pointer.style.setProperty("--tour-nudge", "-7px");
    }
    pointer.style.left = `${Math.max(8, Math.min(midX, window.innerWidth - 36))}px`;
    pointer.hidden = false;
  }

  function paintStep() {
    const step = steps[index];
    overlay.querySelector("#tour-kicker").textContent = `${index + 1} / ${steps.length}`;
    overlay.querySelector("#tour-title").textContent = step.title;
    overlay.querySelector("[data-tour='next']").textContent =
      index === steps.length - 1 ? "Listo" : "Siguiente";
    requestAnimationFrame(() => requestAnimationFrame(() => placeTour(step)));
  }

  function closeTour() {
    memorySet("turnoya-tour-done", "1");
    memoryRemove("turnoya-need-tour");
    window.removeEventListener("resize", paintStep);
    clearLit();
    const done = () => overlay.remove();
    if (window.turnoyaMotion?.exit) {
      window.turnoyaMotion
        .exit(overlay, { opacity: [1, 0] }, { duration: 0.22, ease: window.turnoyaMotion.easeOut })
        .then(done);
      return;
    }
    overlay.classList.add("is-exiting");
    window.setTimeout(done, 200);
  }

  overlay.addEventListener("click", (event) => {
    const action = event.target.dataset.tour;
    if (action === "skip") closeTour();
    if (action === "next") {
      if (index >= steps.length - 1) closeTour();
      else {
        index += 1;
        paintStep();
      }
    }
  });
  window.addEventListener("resize", paintStep);
  paintStep();
}

applyTheme();
fitViewport();
keepFocusAboveKeyboard();
if (typeof seedListedUsers === "function") seedListedUsers();
if (typeof runPlatformCron === "function") runPlatformCron();
if (typeof autoCompletePastTurnos === "function") autoCompletePastTurnos();
function paintThemeSlot() {
  const slot = document.querySelector("[data-theme-slot]");
  if (!slot) return;
  slot.innerHTML = themeToggleHtml();
  slot.querySelector(".theme-toggle")?.addEventListener("click", toggleTheme);
}

function paintThemeButton() {
  paintThemeSlot();
  const nav = document.querySelector(".topbar-nav");
  if (!nav || nav.querySelector(".theme-toggle")) return;
  if (nav.querySelector("[data-client-account]")) return;
  nav.insertAdjacentHTML("afterbegin", themeToggleHtml());
  nav.querySelector(".theme-toggle")?.addEventListener("click", toggleTheme);
}

paintClientAccount();
paintOwnerBell();
paintThemeButton();
paintDemoFoot();
paintAppDock();
bindNotifyLive();
bindBookingGate();
paintTour();
initCustomSelects();
if (location.hash && document.querySelector(location.hash)) {
  document.querySelector(location.hash).scrollIntoView({ block: "start" });
}
