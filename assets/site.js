function clientAccountHtml() {
  const user = typeof currentUser === "function" ? currentUser() : null;
  const next = encodeURIComponent(location.pathname.split("/").pop() + location.search);
  if (!user) {
    return `<a href="./login.html?next=${next}">Entrar</a>`;
  }
  const notes = typeof userNotes === "function" ? userNotes(user.email).length : 0;
  const label = user.nombre || user.email.split("@")[0];
  return `<a href="./avisos.html">Avisos${notes ? ` · ${notes}` : ""}</a>
    <a href="./perfil.html">${label}</a>
    <button class="nav-logout" type="button" data-logout>Salir</button>`;
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
