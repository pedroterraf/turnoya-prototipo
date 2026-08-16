function navBellSvg() {
  return `<svg class="nav-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Zm4 9a2 2 0 0 0 4 0"/></svg>`;
}

function navLogoutSvg() {
  return `<svg class="nav-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M15 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2M10 12h11m0 0-3.5-3.5M21 12l-3.5 3.5"/></svg>`;
}

function clientAccountHtml() {
  const user = typeof currentUser === "function" ? currentUser() : null;
  const next = encodeURIComponent(location.pathname.split("/").pop() + location.search);
  if (!user) {
    return `<a href="./login.html?next=${next}">Entrar</a>`;
  }
  const unread = typeof unreadCount === "function" ? unreadCount(user.email) : 0;
  return `<a class="nav-bell" href="./avisos.html" aria-label="${unread ? `${unread} avisos sin leer` : "Avisos"}">
      ${navBellSvg()}
      ${unread ? `<span class="nav-unread">${unread}</span>` : ""}
    </a>
    <a href="./perfil.html">Perfil</a>
    <button class="nav-logout" type="button" data-logout>Salir ${navLogoutSvg()}</button>`;
}

function paintClientAccount() {
  const host = document.querySelector("[data-client-account]");
  if (!host) return;
  host.innerHTML = clientAccountHtml();
  host.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      logoutUser();
      location.href = "./index.html";
    });
  });
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

paintClientAccount();
paintDemoFoot();
