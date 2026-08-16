const OTP_DEMO = "123456";

const DEMO_CLIENT = {
  email: "pedroterraf@gmail.com",
  nombre: "Pedro",
  apellido: "Terraf",
  dni: "30111222",
  pais: "Argentina",
  provincia: "Córdoba",
  ciudad: "Córdoba",
  celular: "3515550000",
  phoneVerified: true,
};

function ensureDemoUser() {
  const existing = currentUser() || {};
  const user = {
    ...DEMO_CLIENT,
    ...existing,
    nombre: existing.nombre || DEMO_CLIENT.nombre,
    apellido: existing.apellido || DEMO_CLIENT.apellido,
    dni: existing.dni || DEMO_CLIENT.dni,
    pais: existing.pais || DEMO_CLIENT.pais,
    provincia: existing.provincia || DEMO_CLIENT.provincia,
    ciudad: existing.ciudad || DEMO_CLIENT.ciudad,
    email: existing.email || DEMO_CLIENT.email,
  };
  saveUser(user);
  return user;
}

function ensureDemoOwner(placeId) {
  const id = placeId || "oasis";
  const owner = {
    email: id === "oasis" ? "oasis@turnoya.com" : `hola@${id}.com`,
    placeId: id,
  };
  saveOwner(owner);
  return owner;
}

function ensureDemoStaff() {
  const staff = currentStaff() || { email: "ops@turnoya.com" };
  saveStaff(staff);
  return staff;
}

function currentUser() {
  try {
    return JSON.parse(memoryGet("turnoya-user") ?? "null");
  } catch {
    return null;
  }
}

function saveUser(user) {
  memorySet("turnoya-user", JSON.stringify(user));
}

function logoutUser() {
  memoryRemove("turnoya-user");
}

function profileComplete(user) {
  if (!user) return false;
  return Boolean(user.nombre && user.apellido && user.dni && user.pais && user.provincia && user.ciudad);
}

function currentOwner() {
  try {
    return JSON.parse(memoryGet("turnoya-owner") ?? "null");
  } catch {
    return null;
  }
}

function ownedPlaceIds() {
  try {
    return JSON.parse(memoryGet("turnoya-owned") ?? "[]");
  } catch {
    return [];
  }
}

function rememberOwned(placeId) {
  if (!placeId) return;
  const ids = ownedPlaceIds();
  if (!ids.includes(placeId)) {
    ids.push(placeId);
    memorySet("turnoya-owned", JSON.stringify(ids));
  }
}

function saveOwner(owner) {
  rememberOwned(owner.placeId);
  memorySet("turnoya-owner", JSON.stringify(owner));
}

function logoutOwner() {
  memoryRemove("turnoya-owner");
}

function requireOwner(placeId, nextUrl) {
  const owner = currentOwner();
  if (!owner || owner.placeId !== placeId) {
    return ensureDemoOwner(placeId);
  }
  return owner;
}

function currentStaff() {
  try {
    return JSON.parse(memoryGet("turnoya-staff") ?? "null");
  } catch {
    return null;
  }
}

function saveStaff(staff) {
  memorySet("turnoya-staff", JSON.stringify(staff));
}

function logoutStaff() {
  memoryRemove("turnoya-staff");
}

function requireStaff(nextUrl) {
  return currentStaff() || ensureDemoStaff();
}

function requireUser(nextUrl) {
  const user = currentUser();
  if (!user || !profileComplete(user)) {
    return ensureDemoUser();
  }
  return user;
}

function sendOtp(email) {
  memorySet("turnoya-otp-email", email);
  memorySet("turnoya-otp-code", OTP_DEMO);
  return OTP_DEMO;
}

function checkOtp(code) {
  const expected = memoryGet("turnoya-otp-code");
  const email = memoryGet("turnoya-otp-email");
  return Boolean(email && code.trim() === expected);
}

function verifyOtp(code) {
  if (!checkOtp(code)) return false;
  const email = memoryGet("turnoya-otp-email");
  const existing = currentUser();
  saveUser({
    email,
    phoneVerified: existing?.phoneVerified ?? false,
    ...(existing ?? {}),
  });
  return true;
}

function mountOtp(form, onComplete, length = 6) {
  const host = form.querySelector(".otp");
  const hidden = form.querySelector('input[name="code"], input[name="sms"]');
  host.innerHTML = Array.from({ length }, (_, i) => {
    const auto = i === 0 ? "one-time-code" : "off";
    return `<input class="otp-cell" type="text" inputmode="numeric" autocomplete="${auto}" maxlength="1" aria-label="Dígito ${i + 1}" />`;
  }).join("");
  const cells = [...host.querySelectorAll(".otp-cell")];

  function read() {
    const code = cells.map((cell) => cell.value).join("");
    hidden.value = code;
    return code;
  }

  function fill(raw) {
    const digits = String(raw || "").replace(/\D/g, "").slice(0, length);
    cells.forEach((cell, i) => {
      cell.value = digits[i] || "";
    });
    const index = Math.min(digits.length, length - 1);
    cells[index].focus();
    cells[index].select();
    const code = read();
    if (code.length === length && onComplete) onComplete(code);
  }

  cells.forEach((cell, i) => {
    cell.addEventListener("focus", () => cell.select());
    cell.addEventListener("input", () => {
      const typed = cell.value.replace(/\D/g, "");
      if (typed.length > 1) {
        fill(typed);
        return;
      }
      cell.value = typed.slice(-1);
      if (cell.value && cells[i + 1]) {
        cells[i + 1].focus();
        cells[i + 1].select();
      }
      const code = read();
      if (code.length === length && onComplete) onComplete(code);
    });
    cell.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && !cell.value && cells[i - 1]) {
        cells[i - 1].value = "";
        cells[i - 1].focus();
        read();
      }
      if (event.key === "ArrowLeft" && cells[i - 1]) cells[i - 1].focus();
      if (event.key === "ArrowRight" && cells[i + 1]) cells[i + 1].focus();
    });
    cell.addEventListener("paste", (event) => {
      event.preventDefault();
      fill(event.clipboardData.getData("text"));
    });
  });

  host.addEventListener("paste", (event) => {
    event.preventDefault();
    fill(event.clipboardData.getData("text"));
  });

  return {
    read,
    focus: () => {
      cells[0].focus();
    },
  };
}

function paintFlujoNav() {
  if (document.querySelector("[data-flujo-nav]")) return;
  const bar = document.createElement("nav");
  bar.className = "flujo-nav";
  bar.setAttribute("data-flujo-nav", "");
  bar.innerHTML = [
    ["./index.html", "1. Mapa"],
    ["./ficha.html?id=oasis", "2. Ficha"],
    ["./reservar.html?id=oasis", "3. Horario"],
    ["./datos.html", "4. Confirmar"],
    ["./pago.html", "5. Pago"],
    ["./mi-turno.html", "6. Turnos"],
    ["./bo-agenda.html?id=oasis", "7. Agenda"],
    ["./ops.html", "8. Ops"],
  ]
    .map(([href, label]) => `<a href="${href}">${label}</a>`)
    .join("");
  const topbar = document.querySelector(".topbar");
  if (topbar) topbar.after(bar);
  else document.body.prepend(bar);
}

paintFlujoNav();

function paintBoNav() {
  const page = (location.pathname.split("/").pop() || "").toLowerCase();
  const isBo =
    (page.startsWith("bo") && page !== "bo-login.html") || page === "negocio-resenas.html";
  if (!isBo) return;
  if (document.querySelector("[data-bo-nav]")) return;
  const id = new URLSearchParams(location.search).get("id") || "oasis";
  const bar = document.createElement("nav");
  bar.className = "bo-subnav";
  bar.setAttribute("data-bo-nav", "");
  bar.innerHTML = [
    ["./bo.html", "Panel"],
    ["./bo-agenda.html", "Agenda"],
    ["./bo-caja.html", "Caja"],
    ["./bo-servicios.html", "Servicios"],
    ["./bo-cupones.html", "Cupones"],
    ["./bo-soporte.html", "Soporte"],
    ["./bo-landing.html", "Landing"],
    ["./bo-pagos.html", "Pagos"],
    ["./bo-plan.html", "Plan"],
    ["./negocio-resenas.html", "Textos"],
    ["./ficha.html", "Ver ficha"],
  ]
    .map(([href, label]) => {
      const url = `${href}?id=${id}`;
      const here = page === href.replace("./", "");
      return `<a href="${url}"${here ? ' aria-current="page"' : ""}>${label}</a>`;
    })
    .join("");
  const after = document.querySelector("[data-flujo-nav]") || document.querySelector(".topbar");
  if (after) after.after(bar);
  else document.body.prepend(bar);
}

paintBoNav();
