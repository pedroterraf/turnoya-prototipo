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

function navBellHtml(userKey, href) {
  const unread = typeof unreadCount === "function" ? unreadCount(userKey) : 0;
  const rows = typeof findMyNotifications === "function" ? findMyNotifications(userKey).slice(0, 4) : [];
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
        <a class="nav-bell-all" href="${href}">Notificaciones</a>
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

function clientAccountHtml() {
  const user = typeof currentUser === "function" ? currentUser() : null;
  const next = encodeURIComponent(location.pathname.split("/").pop() + location.search);
  if (!user) {
    return `<a href="./login.html?next=${next}">Entrar</a>`;
  }
  return `${navBellHtml(user.email, notificationsPageHref())}
    <a href="./perfil.html">Perfil</a>
    <button class="nav-logout" type="button" data-logout>Salir ${navLogoutSvg()}</button>`;
}

function paintClientAccount() {
  const host = document.querySelector("[data-client-account]");
  if (!host) return;
  const user = typeof currentUser === "function" ? currentUser() : null;
  host.innerHTML = clientAccountHtml();
  if (user) bindNavBell(host, user.email);
  bindNavBellDoc();
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
    `mail <b>123456</b> · WhatsApp <b>0000</b> · dueño oasis@turnoya.com · ops@turnoya.com · <a href="./recorrido.html">Guía del prototipo</a>`;
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
    card.remove();
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
  if (meta) meta.content = "width=device-width, initial-scale=1, viewport-fit=cover";
}

function keepFocusAboveKeyboard() {
  function reveal(target) {
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches("input, textarea, select, [contenteditable]")) return;
    const form = target.closest("form") || document;
    const action =
      form.querySelector("button[type='submit'], .btn-ticket, .btn-enamel, #go-pay, #confirm-slot") ||
      document.querySelector("#pick-bar .btn, #go-pay, #confirm-slot");
    const cutoff = Math.min(window.visualViewport?.height || window.innerHeight, window.innerHeight - 300);
    target.scrollIntoView({ block: "center", inline: "nearest" });
    if (action) {
      const box = action.getBoundingClientRect();
      if (box.bottom > cutoff) {
        window.scrollBy({ top: box.bottom - cutoff + 16, behavior: "smooth" });
      }
    }
  }

  document.addEventListener("focusin", (event) => reveal(event.target));
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      reveal(document.activeElement);
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
      href: user ? "./perfil.html" : `./login.html?next=${next}`,
      label: user ? "Perfil" : "Entrar",
      on: page === "perfil.html",
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

function closeAllCustomSelects(except) {
  document.querySelectorAll(".custom-dropdown.is-open").forEach((wrap) => {
    if (wrap === except) return;
    wrap.classList.remove("is-open");
    const toggle = wrap.querySelector(".custom-dropdown-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    const menu = wrap.querySelector(".custom-dropdown-menu");
    if (menu) menu.hidden = true;
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
    if (!select.closest(".topbar")) {
      menu.style.removeProperty("top");
      menu.style.removeProperty("left");
      menu.style.removeProperty("right");
      menu.style.removeProperty("width");
      return;
    }
    const box = toggle.getBoundingClientRect();
    menu.style.top = `${Math.round(box.bottom + 6)}px`;
    menu.style.left = `${Math.round(box.left)}px`;
    menu.style.right = "auto";
    menu.style.width = `${Math.max(Math.round(box.width), 168)}px`;
  }

  function open() {
    closeAllCustomSelects(wrap);
    wrap.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    pinTopbarMenu();
  }

  function close() {
    wrap.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.hidden = true;
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
    if (!e.target.closest(".custom-dropdown")) {
      closeAllCustomSelects();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllCustomSelects();
    }
  });
}

window.enhanceSelect = enhanceSelect;
window.initCustomSelects = initCustomSelects;

fitViewport();
keepFocusAboveKeyboard();
if (typeof seedListedUsers === "function") seedListedUsers();
if (typeof runPlatformCron === "function") runPlatformCron();
if (typeof autoCompletePastTurnos === "function") autoCompletePastTurnos();
paintClientAccount();
paintOwnerBell();
paintDemoFoot();
paintAppDock();
bindNotifyLive();
initCustomSelects();
if (location.hash && document.querySelector(location.hash)) {
  document.querySelector(location.hash).scrollIntoView({ block: "start" });
}
