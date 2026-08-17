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
    `Demo · mail <b>123456</b> · WhatsApp <b>0000</b> · dueño oasis@turnoya.com · ops@turnoya.com · <a href="./recorrido.html">Guía del prototipo</a>`;
}

if (typeof seedPlaceAgenda === "function") {
  seedPlaceAgenda("oasis");
}

function showNotifyToast(row) {
  let host = document.getElementById("notify-toast");
  if (!host) {
    host = document.createElement("aside");
    host.id = "notify-toast";
    host.className = "notify-toast";
    document.body.append(host);
  }
  const href =
    (typeof notificationHref === "function" && notificationHref(row)) || notificationsPageHref();
  host.innerHTML = `<strong>${row.title}</strong><p>${row.body}</p><a class="btn btn-ticket" href="${href}">Ver</a>`;
  host.hidden = false;
  window.clearTimeout(host._hide);
  host._hide = window.setTimeout(() => {
    host.hidden = true;
  }, 8000);
}

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

fitViewport();
if (typeof seedListedUsers === "function") seedListedUsers();
if (typeof runPlatformCron === "function") runPlatformCron();
if (typeof autoCompletePastTurnos === "function") autoCompletePastTurnos();
paintClientAccount();
paintOwnerBell();
paintDemoFoot();
paintAppDock();
bindNotifyLive();
if (location.hash && document.querySelector(location.hash)) {
  document.querySelector(location.hash).scrollIntoView({ block: "start" });
}
