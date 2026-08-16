const BANNER_DESKTOP = { w: 1440, h: 480 };
const BANNER_MOBILE = { w: 1080, h: 720 };
const HOLD_MINUTES = 15;
const MP_FLOOR = 10;
const DEFAULT_MINIMO = 3000;
const CAPACITY_OPEN = 0;
const ARREPENTIMIENTO_DIAS = 10;
const HORAS_ANTES_CANCEL = 48;

function lookupPlace(id) {
  if (!id) return null;
  const list = typeof allPlaces === "function" ? allPlaces() : PLACES;
  return list.find((place) => place.id === id || place.slug === id) ?? null;
}

function findPlace(id) {
  return lookupPlace(id) ?? (typeof allPlaces === "function" ? allPlaces()[0] : PLACES[0]);
}

function missingPlaceHtml() {
  return `<section class="auth-shell"><div class="auth-card">
    <p class="meta">No encontramos el local</p>
    <h1>Ese negocio no existe</h1>
    <p class="band-lead">El enlace está incompleto o el alta todavía no está en este navegador.</p>
    <a class="btn btn-enamel" href="./index.html">Volver al mapa</a>
  </div></section>`;
}

function defaultServices(place) {
  if (place.category === "oficios") {
    return [
      {
        id: `${place.id}-main`,
        name: place.service,
        minutes: 60,
        price: 15000,
        capacity: CAPACITY_OPEN,
        hourStart: 9,
        hourEnd: 18,
        description: "Consulta con documentación. No ocupa un consultorio físico.",
        includes: ["Revisión de papeles", "Plan de acción", "Resumen por mail"],
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
      },
    ];
  }
  return [
    {
      id: `${place.id}-main`,
      name: place.service,
      minutes: 60,
      price: 9000,
      capacity: 1,
      hourStart: 10,
      hourEnd: 19,
      description: "Sesión completa. El horario se tapa: no se pisa con otro turno.",
      includes: ["Entrevista breve", "Servicio de 60 min", "Agua y toalla"],
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
    },
    {
      id: `${place.id}-short`,
      name: "Turno corto",
      minutes: 30,
      price: 4500,
      capacity: 3,
      hourStart: 9,
      hourEnd: 20,
      description: "Turno breve. Se puede pisar hasta 3 personas en el mismo horario.",
      includes: ["Servicio de 30 min"],
      image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80",
    },
  ];
}

function normalizeService(service) {
  let capacity = service.capacity;
  if (capacity == null) {
    capacity = service.overlap ? service.overlapLimit || 99 : 1;
  }
  return {
    ...service,
    capacity,
    description: service.description ?? "",
    includes: Array.isArray(service.includes) ? service.includes : [],
    hourStart: service.hourStart ?? 9,
    hourEnd: service.hourEnd ?? 19,
  };
}

function placeServices(place) {
  try {
    const stored = JSON.parse(memoryGet(`turnoya-services-${place.id}`) ?? "null");
    if (stored?.length) return stored.map(normalizeService);
  } catch {
    /* ignore */
  }
  return defaultServices(place);
}

function savePlaceServices(placeId, services) {
  memorySet(`turnoya-services-${placeId}`, JSON.stringify(services));
}

function serviceCapacity(service) {
  return normalizeService(service).capacity;
}

function isOpenCapacity(service) {
  const capacity = serviceCapacity(service);
  return capacity === CAPACITY_OPEN || capacity >= 99;
}

function capacityLabel(service) {
  if (isOpenCapacity(service)) return "No ocupa silla";
  const capacity = serviceCapacity(service);
  if (capacity === 1) return "1 a la vez · no se pisa";
  return `${capacity} en paralelo`;
}

function serviceHours(service) {
  const start = Number(normalizeService(service).hourStart);
  const end = Number(normalizeService(service).hourEnd);
  const hours = [];
  for (let hour = start; hour <= end; hour += 1) hours.push(hour);
  return hours.length ? hours : HOURS;
}

function hoursLabel(service) {
  const row = normalizeService(service);
  return `${pad(row.hourStart)}:00–${pad(row.hourEnd)}:00`;
}

function cityLabel(city) {
  return (typeof CITIES === "object" && CITIES[city]?.label) || city || "";
}

function placeAddress(place) {
  const street = String(place.address || "").trim();
  const city = cityLabel(place.city);
  return street ? `${street} · ${city}` : `${city} · turnoya.com/${place.slug}`;
}

function mapsEmbed(place) {
  const q = encodeURIComponent(`${place.name} ${cityLabel(place.city)}`);
  return `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
}

function money(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function dayKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function slotKey(date, hour, minute) {
  return `${dayKey(date)}T${pad(hour)}:${pad(minute)}`;
}

function slotStart(slot) {
  return new Date(`${slot}:00`);
}

function weekDays(from = new Date()) {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

function workingDays(placeId) {
  try {
    const stored = JSON.parse(memoryGet(`turnoya-days-${placeId}`) ?? "null");
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return { 0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: false };
}

function dayConfig(placeId, weekday) {
  const raw = workingDays(placeId)[weekday];
  if (raw === false) return { open: false, start: 9, end: 19 };
  if (raw && typeof raw === "object") {
    return {
      open: raw.open !== false,
      start: Number(raw.start ?? 9),
      end: Number(raw.end ?? 19),
    };
  }
  return { open: raw !== false, start: 9, end: 19 };
}

function dayAllowsHour(placeId, date, hour) {
  const config = dayConfig(placeId, date.getDay());
  return config.open && hour >= config.start && hour <= config.end;
}

function saveWorkingDays(placeId, days) {
  memorySet(`turnoya-days-${placeId}`, JSON.stringify(days));
}

function paymentRule(placeId) {
  const fallback = {
    mode: "minimo",
    minimo: DEFAULT_MINIMO,
    porcentaje: 30,
    piso: MP_FLOOR,
    techo: 0,
    mpConnected: true,
  };
  try {
    const stored = JSON.parse(memoryGet(`turnoya-pay-${placeId}`) ?? "null");
    if (stored) {
      return { ...fallback, ...stored, mpConnected: stored.mpConnected !== false };
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

function savePaymentRule(placeId, rule) {
  memorySet(`turnoya-pay-${placeId}`, JSON.stringify(rule));
}

function seniaOf(placeId, price) {
  const rule = paymentRule(placeId);
  if (rule.mode === "ninguno") return 0;
  if (rule.mode === "entero") return price;
  if (rule.mode === "porcentaje") {
    const raw = Math.round((price * (rule.porcentaje || 30)) / 100);
    const floored = Math.max(raw, rule.piso || MP_FLOOR, MP_FLOOR);
    if (rule.techo > 0) return Math.min(price, rule.techo, floored);
    return Math.min(price, floored);
  }
  return Math.min(price, Math.max(rule.minimo || DEFAULT_MINIMO, MP_FLOOR));
}

function placePolicy(placeId) {
  try {
    const stored = JSON.parse(memoryGet(`turnoya-policy-${placeId}`) ?? "null");
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return {
    arrepentimientoDias: ARREPENTIMIENTO_DIAS,
    horasAntesCancelacion: HORAS_ANTES_CANCEL,
  };
}

function savePlacePolicy(placeId, policy) {
  memorySet(`turnoya-policy-${placeId}`, JSON.stringify(policy));
}

function landingTheme(placeId) {
  try {
    return JSON.parse(memoryGet(`turnoya-theme-${placeId}`) ?? "null") ?? {};
  } catch {
    return {};
  }
}

function saveLandingTheme(placeId, theme) {
  memorySet(`turnoya-theme-${placeId}`, JSON.stringify(theme));
}

function defaultCoupons(placeId) {
  if (placeId === "oasis") {
    return [{ code: "RELAX10", type: "porcentaje", value: 10, active: true, serviceId: "" }];
  }
  return [];
}

function placeCoupons(placeId) {
  try {
    const stored = JSON.parse(memoryGet(`turnoya-coupons-${placeId}`) ?? "null");
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return defaultCoupons(placeId);
}

function savePlaceCoupons(placeId, coupons) {
  memorySet(`turnoya-coupons-${placeId}`, JSON.stringify(coupons));
}

function applyCoupon(placeId, code, price, serviceId) {
  const coupon = placeCoupons(placeId).find(
    (row) => row.active && row.code.toUpperCase() === String(code || "").trim().toUpperCase(),
  );
  if (!coupon) return { ok: false, price, discount: 0 };
  if (coupon.serviceId && coupon.serviceId !== serviceId) return { ok: false, price, discount: 0 };
  const discount =
    coupon.type === "fijo" ? Number(coupon.value) : Math.round((price * Number(coupon.value)) / 100);
  const next = Math.max(0, price - discount);
  return { ok: true, price: next, discount, coupon };
}

function defaultSupport(place) {
  return {
    whatsappEnabled: true,
    emailEnabled: true,
    whatsapp: place.whatsapp || "3515550000",
    email: `hola@${place.slug || place.id}.com`,
  };
}

function placeSupport(place) {
  try {
    const stored = JSON.parse(memoryGet(`turnoya-support-${place.id}`) ?? "null");
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return defaultSupport(place);
}

function savePlaceSupport(placeId, support) {
  memorySet(`turnoya-support-${placeId}`, JSON.stringify(support));
}

function whatsappHref(phone, text) {
  const digits = String(phone || "").replace(/\D/g, "");
  const local = digits.startsWith("54") ? digits : `54${digits}`;
  return `https://wa.me/${local}?text=${encodeURIComponent(text || "")}`;
}

function placeInquiries(placeId) {
  try {
    return JSON.parse(memoryGet(`turnoya-inbox-${placeId}`) ?? "[]");
  } catch {
    return [];
  }
}

function saveInquiry(placeId, inquiry) {
  const rows = placeInquiries(placeId);
  rows.unshift({ id: `in-${Date.now()}`, createdAt: Date.now(), ...inquiry });
  memorySet(`turnoya-inbox-${placeId}`, JSON.stringify(rows));
  pushPlaceNote(placeId, `Consulta de ${inquiry.nombre || "alguien"}: ${inquiry.mensaje || ""}`);
}

function seedPlaceInbox(placeId) {
  if (placeInquiries(placeId).length || placeId !== "oasis") return;
  saveInquiry(placeId, {
    nombre: "María Sol",
    email: "maria@correo.com",
    celular: "3515551111",
    mensaje: "¿El masaje de 60 incluye hidromasaje?",
  });
}

function seedOccupied(placeId) {
  const days = weekDays();
  const seed = placeId.length + placeId.charCodeAt(0);
  return [
    slotKey(days[1], 10 + (seed % 4), 0),
    slotKey(days[2], 15, 0),
    slotKey(days[3], 16, 30),
    slotKey(days[4], 11, 0),
  ];
}

function bookedSlots() {
  try {
    return JSON.parse(memoryGet("turnoya-booked") ?? "[]");
  } catch {
    return [];
  }
}

function activeHolds() {
  const now = Date.now();
  try {
    return JSON.parse(memoryGet("turnoya-holds") ?? "[]").filter(
      (hold) => hold.expiresAt > now,
    );
  } catch {
    return [];
  }
}

function saveHolds(holds) {
  memorySet("turnoya-holds", JSON.stringify(holds));
}

function slotSpan(startKey, minutes) {
  const [date, time] = startKey.split("T");
  const [h, m] = time.split(":").map(Number);
  const start = new Date(`${date}T${pad(h)}:${pad(m)}:00`);
  const keys = [];
  for (let passed = 0; passed < minutes; passed += 30) {
    const cursor = new Date(start.getTime() + passed * 60000);
    keys.push(slotKey(cursor, cursor.getHours(), cursor.getMinutes()));
  }
  return keys;
}

function occupancy(placeId, key, exceptId) {
  let count = 0;
  bookedSlots()
    .filter((row) => row.placeId === placeId && row.estado !== "cancelado" && row.id !== exceptId)
    .forEach((row) => {
      if (slotSpan(row.slot, row.minutes ?? 30).includes(key)) count += 1;
    });
  activeHolds()
    .filter((hold) => hold.placeId === placeId)
    .forEach((hold) => {
      if (slotSpan(hold.slot, hold.minutes ?? 30).includes(key)) count += 1;
    });
  return count;
}

function canBook(placeId, service, startKey, exceptId) {
  if (isOpenCapacity(service)) return true;
  const keys = slotSpan(startKey, service.minutes);
  const limit = serviceCapacity(service);
  return keys.every((key) => occupancy(placeId, key, exceptId) < limit);
}

function holdSlot(draft) {
  const holds = activeHolds().filter(
    (hold) => hold.placeId !== draft.placeId || hold.slot !== draft.slot,
  );
  holds.push({
    ...draft,
    expiresAt: Date.now() + HOLD_MINUTES * 60 * 1000,
  });
  saveHolds(holds);
}

function draftHold() {
  const draft = readDraft();
  if (!draft.placeId || !draft.slot) return null;
  return (
    activeHolds().find((hold) => hold.placeId === draft.placeId && hold.slot === draft.slot) ??
    null
  );
}

function holdMsLeft(hold) {
  return Math.max(0, (hold?.expiresAt ?? 0) - Date.now());
}

function formatHold(ms) {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${pad(total % 60)}`;
}

function ensureDemoDraft() {
  const draft = readDraft();
  if (draft.placeId && draft.slot) {
    if (!draftHold()) holdSlot(draft);
    return draft;
  }
  const place = findPlace("oasis");
  const service = placeServices(place)[0];
  const slot = freeSlots(place.id, service)[0];
  if (!slot) return draft;
  const next = {
    placeId: place.id,
    placeName: place.name,
    slug: place.slug,
    serviceId: service.id,
    serviceName: service.name,
    minutes: service.minutes,
    price: service.price,
    slot,
    senia: seniaOf(place.id, service.price),
    listPrice: service.price,
    nombre: "Pedro",
    apellido: "Terraf",
    email: "pedroterraf@gmail.com",
    dni: "30111222",
  };
  writeDraft(next);
  holdSlot(next);
  return next;
}

function watchHold(onTick, onExpire) {
  const tick = () => {
    let hold = draftHold();
    if (!hold) {
      const draft = readDraft();
      if (draft.placeId && draft.slot) {
        holdSlot(draft);
        hold = draftHold();
      }
    }
    const left = holdMsLeft(hold);
    if (!hold || left <= 0) {
      onExpire();
      return;
    }
    onTick(left);
    window.setTimeout(tick, 1000);
  };
  tick();
}

function readDraft() {
  try {
    return JSON.parse(memoryGet("turnoya-draft") ?? "{}");
  } catch {
    return {};
  }
}

function writeDraft(partial) {
  memorySet("turnoya-draft", JSON.stringify({ ...readDraft(), ...partial }));
}

function confirmDraft() {
  const draft = readDraft();
  if (!draft.placeId || !draft.slot) return null;
  const rows = bookedSlots();
  const turno = {
    id: `ty-${Date.now()}`,
    ...draft,
    createdAt: Date.now(),
    estado: "confirmado",
  };
  rows.push(turno);
  memorySet("turnoya-booked", JSON.stringify(rows));
  memorySet("turnoya-last", JSON.stringify(turno));
  saveHolds(activeHolds().filter((hold) => hold.slot !== draft.slot || hold.placeId !== draft.placeId));
  pushNote(
    turno.email,
    `Turno confirmado en ${turno.placeName}: ${turno.serviceName} · ${turno.slot.replace("T", " ")}. Seña ${money(turno.senia || 0)}.`,
  );
  pushPlaceNote(
    turno.placeId,
    `Nuevo turno: ${turno.nombre || ""} ${turno.apellido || ""} · ${turno.serviceName} · ${turno.slot.replace("T", " ")}.`,
  );
  return turno;
}

function lastTurno() {
  try {
    return JSON.parse(memoryGet("turnoya-last") ?? "null");
  } catch {
    return null;
  }
}

function userTurnos(email) {
  return bookedSlots().filter((row) => row.email === email);
}

function placeTurnos(placeId) {
  return bookedSlots()
    .filter((row) => row.placeId === placeId)
    .sort((a, b) => a.slot.localeCompare(b.slot));
}

function saveBooked(rows) {
  memorySet("turnoya-booked", JSON.stringify(rows));
}

function patchTurno(id, patch) {
  const rows = bookedSlots().map((row) => (row.id === id ? { ...row, ...patch } : row));
  saveBooked(rows);
  const last = lastTurno();
  if (last?.id === id) {
    memorySet("turnoya-last", JSON.stringify({ ...last, ...patch }));
  }
  return rows.find((row) => row.id === id) ?? null;
}

function nextOpenDay(placeId) {
  const today = dayKey(new Date());
  return (
    weekDays().find((day) => dayConfig(placeId, day.getDay()).open && dayKey(day) >= today) ??
    weekDays()[1]
  );
}

function seedPlaceAgenda(placeId) {
  if (placeTurnos(placeId).length) return;
  const place = findPlace(placeId);
  const day = nextOpenDay(placeId);
  const rows = bookedSlots();
  rows.push(
    {
      id: `ty-seed-${placeId}-1`,
      placeId,
      placeName: place.name,
      slug: place.slug,
      serviceId: `${placeId}-main`,
      serviceName: place.service,
      minutes: 60,
      price: 9000,
      senia: 3000,
      slot: slotKey(day, 10, 0),
      email: "pedroterraf@gmail.com",
      nombre: "Pedro",
      apellido: "Terraf",
      dni: "30111222",
      createdAt: Date.now(),
      estado: "confirmado",
    },
    {
      id: `ty-seed-${placeId}-2`,
      placeId,
      placeName: place.name,
      slug: place.slug,
      serviceId: `${placeId}-short`,
      serviceName: "Turno corto",
      minutes: 30,
      price: 4500,
      senia: 3000,
      slot: slotKey(day, 16, 0),
      email: "lucia@correo.com",
      nombre: "Lucía",
      apellido: "Mena",
      dni: "28444555",
      createdAt: Date.now(),
      estado: "confirmado",
    },
  );
  saveBooked(rows);
  pushNote(
    "pedroterraf@gmail.com",
    `Turno confirmado en ${place.name}: ${place.service} · ${slotKey(day, 10, 0).replace("T", " ")}. Seña ${money(3000)}.`,
  );
}

function freeSlots(placeId, service, exceptId, from) {
  const today = dayKey(new Date());
  const now = new Date();
  const keys = [];
  weekDays(from).forEach((day) => {
    serviceHours(service).forEach((hour) => {
      [0, 30].forEach((minute) => {
        const sameDay = dayKey(day) === today;
        const pastHour =
          sameDay &&
          (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes()));
        if (dayKey(day) < today || pastHour) return;
        if (!dayAllowsHour(placeId, day, hour)) return;
        const key = slotKey(day, hour, minute);
        if (canBook(placeId, service, key, exceptId)) keys.push(key);
      });
    });
  });
  return keys.slice(0, 12);
}

function reprogramTurno(id, newSlot) {
  const turno = bookedSlots().find((row) => row.id === id);
  if (!turno || turno.estado !== "confirmado") return false;
  const place = findPlace(turno.placeId);
  const service =
    placeServices(place).find((item) => item.id === turno.serviceId) ?? {
      minutes: turno.minutes,
      capacity: 1,
    };
  if (!canBook(turno.placeId, { ...service, minutes: turno.minutes }, newSlot, turno.id)) {
    return false;
  }
  patchTurno(id, {
    slot: newSlot,
    reprogramaciones: (turno.reprogramaciones || 0) + 1,
  });
  pushNote(
    turno.email,
    `Turno reprogramado en ${turno.placeName}: ${newSlot.replace("T", " ")}.`,
  );
  return true;
}

function notifyTurnoChange(id, estado) {
  const turno = bookedSlots().find((row) => row.id === id);
  if (!turno?.email) return;
  if (estado === "concretado") {
    pushNote(turno.email, `El local confirmó tu visita en ${turno.placeName}. Ya podés calificar.`);
  }
  if (estado === "no_show") {
    pushNote(turno.email, `Marcaron que no fuiste a ${turno.placeName}.`);
  }
  if (estado === "cancelado") {
    pushNote(turno.email, `El local canceló tu turno en ${turno.placeName}. Horario liberado.`);
  }
}

function estadoLabel(estado) {
  return (
    {
      confirmado: "Confirmado",
      concretado: "Concretado",
      no_show: "No vino",
      cancelado: "Cancelado",
    }[estado] ?? estado
  );
}

function canRepent(turno) {
  if (turno.estado !== "confirmado" || !turno.slot) return false;
  if (Date.now() >= slotStart(turno.slot).getTime()) return false;
  const days = placePolicy(turno.placeId).arrepentimientoDias ?? ARREPENTIMIENTO_DIAS;
  const bought = turno.createdAt ?? 0;
  return Date.now() - bought <= days * 24 * 60 * 60 * 1000;
}

function canCancelLocal(turno) {
  if (turno.estado !== "confirmado" || !turno.slot) return false;
  const hours = placePolicy(turno.placeId).horasAntesCancelacion ?? HORAS_ANTES_CANCEL;
  return (slotStart(turno.slot).getTime() - Date.now()) / 3600000 >= hours;
}

function cancelTurno(id, motivo) {
  const rows = bookedSlots().map((row) =>
    row.id === id ? { ...row, estado: "cancelado", motivo } : row,
  );
  memorySet("turnoya-booked", JSON.stringify(rows));
  const last = lastTurno();
  if (last?.id === id) {
    memorySet("turnoya-last", JSON.stringify({ ...last, estado: "cancelado", motivo }));
  }
  const turno = rows.find((row) => row.id === id);
  if (turno?.email) {
    pushNote(
      turno.email,
      motivo === "arrepentimiento"
        ? `Arrepentimiento en ${turno.placeName}. Horario libre y seña a devolver.`
        : `Turno cancelado en ${turno.placeName}. Horario liberado.`,
    );
    pushPlaceNote(
      turno.placeId,
      motivo === "arrepentimiento"
        ? `${turno.nombre || "Cliente"} se arrepintió. Horario libre y seña a devolver.`
        : `${turno.nombre || "Cliente"} canceló. Horario liberado.`,
    );
  }
}

function canReprogram(turno) {
  return turno.estado === "confirmado" && Date.now() < slotStart(turno.slot).getTime();
}

function reprogramLink(turno) {
  if (!canReprogram(turno)) return "";
  return `<a class="btn btn-line" href="./reservar.html?id=${turno.placeId}&service=${turno.serviceId || ""}&reprogram=${turno.id}">Reprogramar</a>`;
}

function userNotes(email) {
  try {
    return JSON.parse(memoryGet(`turnoya-notes-${email}`) ?? "[]");
  } catch {
    return [];
  }
}

function pushNote(email, text) {
  if (!email) return;
  const rows = userNotes(email);
  rows.unshift({ id: `n-${Date.now()}`, text, at: Date.now() });
  memorySet(`turnoya-notes-${email}`, JSON.stringify(rows.slice(0, 24)));
}

function placeNotes(placeId) {
  try {
    return JSON.parse(memoryGet(`turnoya-bo-notes-${placeId}`) ?? "[]");
  } catch {
    return [];
  }
}

function pushPlaceNote(placeId, text) {
  if (!placeId) return;
  const rows = placeNotes(placeId);
  rows.unshift({ id: `bn-${Date.now()}`, text, at: Date.now() });
  memorySet(`turnoya-bo-notes-${placeId}`, JSON.stringify(rows.slice(0, 24)));
}

function turnoCardHtml(turno) {
  if (!turno?.slot) return "";
  const when = String(turno.slot).replace("T", " ");
  const policy = placePolicy(turno.placeId);
  const user = typeof currentUser === "function" ? currentUser() : null;
  let actions = `<p class="meta">Cancelado. Horario libre${
    turno.motivo === "arrepentimiento" ? " y seña a reintegrar por Mercado Pago." : "."
  }</p>`;
  if (turno.estado === "concretado") {
    actions = canReviewTurno(turno, user)
      ? `<form class="review-form" data-review="${turno.id}">
          <label>Estrellas
            <select name="stars">
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
            </select>
          </label>
          <label>Comentario <input name="text" required maxlength="160" /></label>
          <button class="btn btn-ticket" type="submit">Calificar</button>
        </form>`
      : `<p class="meta">Turno concretado.${alreadyReviewedTurno(turno.id) ? " Ya calificaste." : ""}</p>`;
  } else if (turno.estado === "no_show") {
    actions = `<p class="meta">No te presentaste. El horario se consumió.</p>`;
  } else if (turno.estado === "confirmado" && canRepent(turno)) {
    actions = `${reprogramLink(turno)}<button class="btn btn-enamel" type="button" data-cancel="${turno.id}" data-motivo="arrepentimiento">Arrepentirme y devolver</button>
      <p class="meta">Ley 24.240 · ${policy.arrepentimientoDias} días · el servicio todavía no se prestó. Se libera el horario y se reintegra lo pagado.</p>`;
  } else if (turno.estado === "confirmado" && canCancelLocal(turno)) {
    actions = `${reprogramLink(turno)}<button class="btn btn-enamel" type="button" data-cancel="${turno.id}" data-motivo="cancelacion">Cancelar según el local</button>
      <p class="meta">Ya no aplica arrepentimiento. El local deja cancelar hasta ${policy.horasAntesCancelacion} h antes.</p>`;
  } else if (turno.estado === "confirmado") {
    actions = `${reprogramLink(turno)}<p class="meta">El local confirma cuando vas. Todavía no se puede calificar.</p>`;
  }
  return `<article class="quote" data-turno="${turno.id}">
    <strong>${turno.placeName}</strong>
    <p class="meta">${turno.serviceName} · ${when} · ${estadoLabel(turno.estado)}</p>
    ${actions}
  </article>`;
}

function bindTurnoActions(root, onDone) {
  root.querySelectorAll("[data-cancel]").forEach((button) => {
    button.addEventListener("click", () => {
      cancelTurno(button.dataset.cancel, button.dataset.motivo);
      onDone();
    });
  });
  root.querySelectorAll("[data-review]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const user = currentUser();
      const turno = bookedSlots().find((row) => row.id === form.dataset.review);
      const data = new FormData(form);
      if (addTurnoReview(turno, user, Number(data.get("stars")), data.get("text"))) {
        onDone();
      }
    });
  });
}
