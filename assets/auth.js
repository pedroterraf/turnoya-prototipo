const OTP_DEMO = "123456";
const OTP_PHONE_DEMO = "0000";

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

function listedUsers() {
  try {
    return JSON.parse(memoryGet("turnoya-users") ?? "[]");
  } catch {
    return [];
  }
}

function saveListedUsers(rows) {
  memorySet("turnoya-users", JSON.stringify(rows));
}

function upsertListedUser(user) {
  if (!user?.email) return;
  const rows = listedUsers();
  const key = String(user.email).toLowerCase();
  const index = rows.findIndex((row) => String(row.email || "").toLowerCase() === key);
  const next = {
    email: user.email,
    nombre: user.nombre || "",
    apellido: user.apellido || "",
    role: user.role || (index >= 0 ? rows[index].role : "cliente"),
    placeId: user.placeId || (index >= 0 ? rows[index].placeId : ""),
    emailVerified: user.emailVerified === true || (index >= 0 && rows[index].emailVerified),
    phoneVerified: user.phoneVerified === true,
    darkMode: typeof user.darkMode === "boolean" ? user.darkMode : index >= 0 && rows[index].darkMode === true,
    suspended: user.suspended === true,
    createdAt: index >= 0 ? rows[index].createdAt : user.createdAt || Date.now(),
  };
  if (user.role) next.role = user.role;
  if (user.placeId != null) next.placeId = user.placeId;
  if (index >= 0) rows[index] = { ...rows[index], ...next };
  else rows.push(next);
  saveListedUsers(rows);
}

function seedListedUsers() {
  const rows = listedUsers();
  const seeds = [
    {
      email: "pedroterraf@gmail.com",
      nombre: "Pedro",
      apellido: "Terraf",
      role: "cliente",
      emailVerified: true,
      phoneVerified: true,
      createdAt: Date.now() - 20 * 86400000,
    },
    {
      email: "oasis@turnoya.com",
      nombre: "Oasis",
      apellido: "Dueño",
      role: "dueno",
      placeId: "oasis",
      emailVerified: true,
      createdAt: Date.now() - 40 * 86400000,
    },
    {
      email: "ops@turnoya.com",
      nombre: "Ops",
      apellido: "TurnoYa",
      role: "ops",
      emailVerified: true,
      createdAt: Date.now() - 60 * 86400000,
    },
    {
      email: "sinotp@correo.com",
      nombre: "Ana",
      apellido: "Nueva",
      role: "cliente",
      emailVerified: false,
      createdAt: Date.now() - 10 * 86400000,
    },
  ];
  seeds.forEach((row) => {
    if (!rows.some((item) => item.email === row.email)) rows.push(row);
  });
  saveListedUsers(rows);
}

function purgeUnverifiedUsers() {
  const week = 7 * 86400000;
  const now = Date.now();
  const rows = listedUsers();
  const keep = rows.filter((row) => row.emailVerified || now - (row.createdAt || now) <= week);
  const removed = rows.length - keep.length;
  saveListedUsers(keep);
  return removed;
}

function saveUser(user) {
  memorySet("turnoya-user", JSON.stringify(user));
  upsertListedUser(user);
}

function logoutUser() {
  memoryRemove("turnoya-user");
}

function profileComplete(user) {
  if (!user) return false;
  return Boolean(user.nombre && user.apellido && user.dni && user.pais && user.provincia && user.ciudad);
}

function bookingReady(user) {
  if (!profileComplete(user)) return false;
  const email = String(user.email || "");
  const phone = String(user.celular || "").replace(/\D/g, "");
  return Boolean(email.includes("@") && phone.length >= 8);
}

function looksLikeEmail(value) {
  return /@/.test(String(value || ""));
}

function looksLikePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 8 && !looksLikeEmail(value);
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

function sendOtp(identifier) {
  const value = String(identifier || "").trim();
  const phone = looksLikePhone(value);
  memorySet("turnoya-otp-email", phone ? "" : value);
  memorySet("turnoya-otp-phone", phone ? value.replace(/\D/g, "") : "");
  memorySet("turnoya-otp-code", phone ? OTP_PHONE_DEMO : OTP_DEMO);
  return phone ? OTP_PHONE_DEMO : OTP_DEMO;
}

function checkOtp(code) {
  const expected = memoryGet("turnoya-otp-code");
  const email = memoryGet("turnoya-otp-email");
  const phone = memoryGet("turnoya-otp-phone");
  return Boolean((email || phone) && code.trim() === expected);
}

function verifyOtp(code) {
  if (!checkOtp(code)) return false;
  const email = memoryGet("turnoya-otp-email");
  const phone = memoryGet("turnoya-otp-phone");
  const existing = currentUser();
  const next = {
    phoneVerified: existing?.phoneVerified ?? Boolean(phone),
    emailVerified: existing?.emailVerified ?? Boolean(email),
    role: existing?.role || "cliente",
    ...(existing ?? {}),
  };
  if (email) next.email = email;
  if (phone) next.celular = phone;
  if (!next.email && phone) next.email = `${phone}@turnoya.local`;
  saveUser(next);
  if (!memoryGet("turnoya-tour-done")) memorySet("turnoya-need-tour", "1");
  if (typeof trackPixel === "function" && existing?.placeId) {
    trackPixel(existing.placeId, "CompleteRegistration", { email: next.email });
  }
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
    clear: () => {
      cells.forEach((cell) => {
        cell.value = "";
      });
      hidden.value = "";
    },
    focus: () => {
      cells[0].focus();
    },
  };
}

function ownerPlaceId() {
  return currentOwner()?.placeId || ownedPlaceIds()[0] || new URLSearchParams(location.search).get("id") || "oasis";
}

function paintBoNav() {
  const page = (location.pathname.split("/").pop() || "").toLowerCase();
  const isBo =
    (page.startsWith("bo") && page !== "bo-login.html") || page === "negocio-resenas.html";
  const isOwnerFicha = page === "ficha.html" && Boolean(currentOwner());
  if (!isBo && !isOwnerFicha) return;
  document.body.classList.add("bo-page");
  ensureBoTopbar();
  if (document.querySelector("[data-bo-nav]")) return;
  const id = new URLSearchParams(location.search).get("id") || ownerPlaceId();
  const bar = document.createElement("nav");
  bar.className = "bo-subnav";
  bar.setAttribute("data-bo-nav", "");
  bar.innerHTML = [
    ["./bo.html", "Panel"],
    ["./bo-agenda.html", "Agenda"],
    ["./bo-servicios.html", "Servicios"],
    ["./bo-pagos.html", "Pagos"],
    ["./bo-whatsapp.html", "WhatsApp"],
    ["./bo-landing.html", "Ficha"],
    ["./ficha.html", "Ver ficha"],
  ]
    .map(([href, label]) => {
      const url = `${href}?id=${id}`;
      const here = page === href.replace("./", "");
      return `<a href="${url}"${here ? ' aria-current="page"' : ""}>${label}</a>`;
    })
    .join("");
  const after = document.querySelector(".topbar");
  if (after) after.after(bar);
  else document.body.prepend(bar);
}

function ensureBoTopbar() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  topbar.querySelectorAll("a#back").forEach((node) => node.remove());
  let nav = topbar.querySelector(".topbar-nav");
  if (!nav) {
    nav = document.createElement("nav");
    nav.className = "topbar-nav";
    topbar.append(nav);
  }
  if (!nav.querySelector("[data-theme-slot]")) {
    const slot = document.createElement("span");
    slot.className = "theme-slot";
    slot.setAttribute("data-theme-slot", "");
    nav.prepend(slot);
  }
  if (currentOwner() && !nav.querySelector("#out")) {
    const out = document.createElement("button");
    out.id = "out";
    out.className = "btn btn-ghost";
    out.type = "button";
    out.textContent = "Salir";
    out.addEventListener("click", () => {
      const id = ownerPlaceId();
      logoutOwner();
      location.href = `./bo-login.html?id=${id}`;
    });
    nav.append(out);
  }
}

function paintOpsNav() {
  const page = (location.pathname.split("/").pop() || "").toLowerCase();
  if (!page.startsWith("ops") || page === "ops-login.html") return;
  if (document.querySelector("[data-ops-nav]")) return;
  const bar = document.createElement("nav");
  bar.className = "bo-subnav";
  bar.setAttribute("data-ops-nav", "");
  bar.innerHTML = [
    ["./ops.html", "Panel"],
    ["./ops-altas.html", "Altas"],
    ["./ops-locales.html", "Negocios"],
    ["./ops-dinero.html", "Dinero"],
    ["./ops-usuarios.html", "Usuarios"],
  ]
    .map(([href, label]) => {
      const here = page === href.replace("./", "");
      return `<a href="${href}"${here ? ' aria-current="page"' : ""}>${label}</a>`;
    })
    .join("");
  const after = document.querySelector(".topbar");
  if (after) after.after(bar);
  else document.body.prepend(bar);
}

paintBoNav();
paintOpsNav();
