const BANNER_DESKTOP = { w: 1440, h: 480 };
const BANNER_MOBILE = { w: 1080, h: 720 };
const HOLD_MINUTES = 15;
const MP_FLOOR = 10;
const DEFAULT_MINIMO = 3000;
const CAPACITY_OPEN = 0;
const ARREPENTIMIENTO_DIAS = 10;
const HORAS_ANTES_CANCEL = 48;
const WAITLIST_CLAIM_MINUTES = 10;

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
        minutes: 75,
        price: 15000,
        capacity: CAPACITY_OPEN,
        hourStart: 9,
        hourEnd: 18,
        description: "Consulta de 75 min. No ocupa un consultorio: se puede pisar.",
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
      hourStart: 9,
      hourEnd: 19,
      description: "Sesión completa. El horario se tapa: no se pisa con otro turno.",
      includes: ["Entrevista breve", "Servicio de 60 min", "Agua y toalla"],
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
    },
    {
      id: `${place.id}-mid`,
      name: "Sesión 45 min",
      minutes: 45,
      price: 6500,
      capacity: 2,
      hourStart: 9,
      hourEnd: 20,
      description: "45 minutos. Se pisa hasta 2 personas en el mismo horario.",
      includes: ["Servicio de 45 min"],
      image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80",
    },
    {
      id: `${place.id}-short`,
      name: "Turno corto",
      minutes: 30,
      price: 4500,
      capacity: 3,
      hourStart: 9,
      hourEnd: 20,
      description: "30 minutos. Se pisa hasta 3 personas en el mismo horario.",
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

function serviceAllowsOverlap(service) {
  if (!service) return false;
  return isOpenCapacity(service) || serviceCapacity(service) > 1;
}

function capacityLabel(service) {
  if (isOpenCapacity(service)) return "Se pisa · ilimitado";
  const capacity = serviceCapacity(service);
  if (capacity === 1) return "No se pisa";
  return `Se pisa hasta ${capacity}`;
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

const WALK_KMH = 4.8;
const DRIVE_KMH = 22;
const TRANSIT_KMH = 16;

function travelMode() {
  const mode = typeof memoryGet === "function" ? memoryGet("turnoya-travel") : "";
  if (mode === "driving" || mode === "transit" || mode === "walking") return mode;
  return "walking";
}

function etaMinutes(km, mode) {
  const speed = mode === "driving" ? DRIVE_KMH : mode === "transit" ? TRANSIT_KMH : WALK_KMH;
  return Math.max(1, Math.round((Number(km) / speed) * 60));
}

function liveEtaText(place, origin, mode) {
  const used = mode || travelMode();
  if (!origin || origin.lat == null || !place) {
    return "Activá la ubicación para ver el tiempo en vivo.";
  }
  const km =
    typeof distanceKm === "function"
      ? distanceKm(origin.lat, origin.lng, place.lat, place.lng)
      : Number(place.km || 0);
  const mins = etaMinutes(km, used);
  const how = used === "driving" ? "en auto" : used === "transit" ? "en colectivo" : "a pie";
  return `En vivo · ${km.toFixed(1)} km · ${mins} min ${how}`;
}

function googleDirectionsUrl(place, origin, mode) {
  const used = mode || travelMode();
  const params = new URLSearchParams({
    api: "1",
    destination: `${place.lat},${place.lng}`,
    travelmode: used,
  });
  if (origin?.lat != null && origin?.lng != null) {
    params.set("origin", `${origin.lat},${origin.lng}`);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function wazeUrl(place) {
  return `https://waze.com/ul?ll=${place.lat},${place.lng}&navigate=yes`;
}

function parseSlotDate(slot) {
  const raw = String(slot || "");
  if (raw.length === 16) return new Date(`${raw}:00`);
  return new Date(raw);
}

function googleCalendarStamp(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}00`;
}

function googleCalendarUrl(turno) {
  const place = lookupPlace(turno.placeId);
  const start = parseSlotDate(turno.slot);
  const end = new Date(start.getTime() + (turno.minutes || 60) * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${turno.serviceName} · ${turno.placeName}`,
    dates: `${googleCalendarStamp(start)}/${googleCalendarStamp(end)}`,
    details: `TurnoYa · ${place ? `turnoya.com/${place.slug}` : ""}`,
    location: place ? placeAddress(place) : turno.placeName,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function directionsPanelHtml(place) {
  const mode = travelMode();
  const origin =
    typeof state === "object" && state.userLat != null
      ? { lat: state.userLat, lng: state.userLng }
      : null;
  return `<div class="go-card" data-go="${place.id}">
    <p class="go-live" data-go-eta>${liveEtaText(place, origin, mode)}</p>
    <p class="meta">${placeAddress(place)}</p>
    <div class="go-modes" role="group" aria-label="Cómo vas">
      <button class="chip" type="button" data-mode="walking" aria-pressed="${mode === "walking"}">A pie</button>
      <button class="chip" type="button" data-mode="driving" aria-pressed="${mode === "driving"}">Auto</button>
      <button class="chip" type="button" data-mode="transit" aria-pressed="${mode === "transit"}">Colectivo</button>
    </div>
    <div class="go-actions">
      <a class="btn btn-enamel" data-maps target="_blank" rel="noreferrer" href="${googleDirectionsUrl(
        place,
        origin,
        mode,
      )}">Cómo llegar</a>
      <a class="btn btn-ghost" target="_blank" rel="noreferrer" href="${wazeUrl(place)}">Waze</a>
    </div>
  </div>`;
}

function turnoGoLinks(turno) {
  if (!turno || turno.estado !== "confirmado") return "";
  const place = lookupPlace(turno.placeId);
  if (!place) return "";
  return `<div class="go-mini">
    <a class="btn-line" target="_blank" rel="noreferrer" href="${googleDirectionsUrl(
      place,
      null,
      travelMode(),
    )}">Cómo llegar</a>
    <a class="btn-line" target="_blank" rel="noreferrer" href="${googleCalendarUrl(turno)}">Agregar a Google</a>
  </div>`;
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
  if (activeHoliday(placeId, dayKey(date))) return false;
  const config = dayConfig(placeId, date.getDay());
  return config.open && hour >= config.start && hour < config.end;
}

function placeHourRange(placeId) {
  let start = 23;
  let end = 0;
  [0, 1, 2, 3, 4, 5, 6].forEach((weekday) => {
    const config = dayConfig(placeId, weekday);
    if (!config.open) return;
    start = Math.min(start, config.start);
    end = Math.max(end, config.end);
  });
  if (start > end) return { start: 9, end: 19 };
  return { start, end };
}

const AR_HOLIDAYS_2026 = [
  { fecha: "2026-01-01", tipo: "inamovible", nombre: "Año nuevo" },
  { fecha: "2026-02-16", tipo: "inamovible", nombre: "Carnaval" },
  { fecha: "2026-02-17", tipo: "inamovible", nombre: "Carnaval" },
  { fecha: "2026-03-23", tipo: "puente", nombre: "Puente turístico no laborable" },
  { fecha: "2026-03-24", tipo: "inamovible", nombre: "Día Nacional de la Memoria por la Verdad y la Justicia" },
  { fecha: "2026-04-02", tipo: "inamovible", nombre: "Día del Veterano y de los Caídos en la Guerra de Malvinas" },
  { fecha: "2026-04-03", tipo: "inamovible", nombre: "Viernes Santo" },
  { fecha: "2026-05-01", tipo: "inamovible", nombre: "Día del Trabajador" },
  { fecha: "2026-05-25", tipo: "inamovible", nombre: "Día de la Revolución de Mayo" },
  { fecha: "2026-06-15", tipo: "trasladable", nombre: "Paso a la Inmortalidad del General Martín Güemes (17/6)" },
  { fecha: "2026-06-20", tipo: "inamovible", nombre: "Paso a la Inmortalidad del General Manuel Belgrano" },
  { fecha: "2026-07-09", tipo: "inamovible", nombre: "Día de la Independencia" },
  { fecha: "2026-07-10", tipo: "puente", nombre: "Puente turístico no laborable" },
  { fecha: "2026-08-17", tipo: "trasladable", nombre: "Paso a la Inmortalidad del Gral. José de San Martín" },
  { fecha: "2026-10-12", tipo: "trasladable", nombre: "Día del Respeto a la Diversidad Cultural" },
  { fecha: "2026-11-23", tipo: "trasladable", nombre: "Día de la Soberanía Nacional (20/11)" },
  { fecha: "2026-12-07", tipo: "puente", nombre: "Puente turístico no laborable" },
  { fecha: "2026-12-08", tipo: "inamovible", nombre: "Día de la Inmaculada Concepción de María" },
  { fecha: "2026-12-25", tipo: "inamovible", nombre: "Navidad" },
];

function placeHolidays(placeId) {
  try {
    return JSON.parse(memoryGet(`turnoya-holidays-${placeId}`) ?? "[]");
  } catch {
    return [];
  }
}

function savePlaceHolidays(placeId, rows) {
  memorySet(
    `turnoya-holidays-${placeId}`,
    JSON.stringify(
      rows.sort((a, b) => String(a.date).localeCompare(String(b.date))),
    ),
  );
}

function activeHoliday(placeId, date) {
  return placeHolidays(placeId).find((row) => row.date === date && row.active !== false) ?? null;
}

function setHolidayActive(placeId, holidayId, active) {
  savePlaceHolidays(
    placeId,
    placeHolidays(placeId).map((row) => (row.id === holidayId ? { ...row, active } : row)),
  );
}

function removeHoliday(placeId, holidayId) {
  savePlaceHolidays(
    placeId,
    placeHolidays(placeId).filter((row) => row.id !== holidayId),
  );
}

function mergeImportedHolidays(placeId, incoming) {
  const current = placeHolidays(placeId);
  const byDate = new Map(current.map((row) => [row.date, row]));
  incoming.forEach((row) => {
    const date = String(row.fecha || row.date || "").slice(0, 10);
    if (!date || byDate.has(date)) return;
    byDate.set(date, {
      id: `h-${date}`,
      date,
      name: row.nombre || row.name || "Feriado",
      tipo: row.tipo || "inamovible",
      active: true,
      source: "ar",
    });
  });
  savePlaceHolidays(placeId, [...byDate.values()]);
  return placeHolidays(placeId);
}

async function fetchArgentinaHolidays(year) {
  try {
    const res = await fetch(`https://api.argentinadatos.com/v1/feriados/${year}`);
    if (!res.ok) throw new Error("api");
    const rows = await res.json();
    if (!Array.isArray(rows) || !rows.length) throw new Error("empty");
    return rows;
  } catch {
    return year === 2026 ? AR_HOLIDAYS_2026 : [];
  }
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
    exclusiveGapMinutes: 5,
    allowReprogram: true,
  };
}

function placeAllowsReprogram(placeId) {
  return placePolicy(placeId).allowReprogram !== false;
}

function exclusiveGapMinutes(placeId) {
  const raw = placePolicy(placeId).exclusiveGapMinutes;
  if (raw == null || raw === "") return 5;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : 5;
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
    return [
      { code: "RELAX10", type: "porcentaje", value: 10, active: true, visibility: "public", serviceId: "" },
      { code: "OASISVIP", type: "porcentaje", value: 20, active: true, visibility: "private", serviceId: "" },
    ];
  }
  return [];
}

function couponVisibility(coupon) {
  return coupon?.visibility === "private" ? "private" : "public";
}

function publicPlaceCoupons(placeId) {
  return placeCoupons(placeId).filter(
    (row) => row.active !== false && couponVisibility(row) === "public" && row.code,
  );
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
  notifyPlaceOwner(
    placeId,
    "Nueva consulta",
    `${inquiry.nombre || "Alguien"} escribió: ${inquiry.mensaje || ""}`,
    { type: NotificationMetadataType.INQUIRY, placeId },
  );
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
  return occupantsAt(placeId, key, exceptId).length;
}

function occupantsAt(placeId, key, exceptId) {
  const place = findPlace(placeId);
  const services = place ? placeServices(place) : [];
  const resolve = (row) => {
    const service = services.find((item) => item.id === row.serviceId);
    return { row, service, allowsOverlap: serviceAllowsOverlap(service) };
  };
  const booked = bookedSlots()
    .filter((row) => row.placeId === placeId && row.estado !== "cancelado" && row.id !== exceptId)
    .filter((row) => slotSpan(row.slot, row.minutes ?? 30).includes(key))
    .map(resolve);
  const holds = activeHolds()
    .filter((hold) => hold.placeId === placeId)
    .filter((hold) => slotSpan(hold.slot, hold.minutes ?? 30).includes(key))
    .map(resolve);
  return [...booked, ...holds];
}

function slotHasExclusive(placeId, key, exceptId) {
  return occupantsAt(placeId, key, exceptId).some((item) => !item.allowsOverlap);
}

function exclusiveBookings(placeId, exceptId) {
  const place = findPlace(placeId);
  const services = place ? placeServices(place) : [];
  const isExclusive = (row) => {
    const service = services.find((item) => item.id === row.serviceId);
    return !serviceAllowsOverlap(service);
  };
  const booked = bookedSlots()
    .filter((row) => row.placeId === placeId && row.estado !== "cancelado" && row.id !== exceptId)
    .filter(isExclusive);
  const holds = activeHolds().filter((hold) => hold.placeId === placeId).filter(isExclusive);
  return [...booked, ...holds];
}

function exclusiveGapOk(placeId, startMs, endMs, exceptId) {
  const gap = exclusiveGapMinutes(placeId) * 60000;
  return exclusiveBookings(placeId, exceptId).every((row) => {
    const from = slotStart(row.slot).getTime();
    const to = from + Number(row.minutes || 30) * 60000;
    return endMs + gap <= from || to + gap <= startMs;
  });
}

function canBook(placeId, service, startKey, exceptId) {
  const start = slotStart(startKey);
  if (Number.isNaN(start.getTime())) return false;
  const row = normalizeService(service);
  const end = new Date(start.getTime() + row.minutes * 60000);
  const config = dayConfig(placeId, start.getDay());
  if (!config.open) return false;
  if (activeHoliday(placeId, dayKey(start))) return false;
  if (start.getHours() + start.getMinutes() / 60 < Math.max(config.start, row.hourStart)) return false;
  const close = new Date(start);
  close.setHours(Math.min(config.end, row.hourEnd), 0, 0, 0);
  if (end > close) return false;
  if (serviceAllowsOverlap(row)) return true;
  const keys = slotSpan(startKey, row.minutes);
  if (!keys.every((key) => !slotHasExclusive(placeId, key, exceptId))) return false;
  return exclusiveGapOk(placeId, start.getTime(), end.getTime(), exceptId);
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
  const price = Number(draft.price || 0);
  const senia = Number(draft.senia || 0);
  const cobrado = draft.pagado ? senia : 0;
  const charge = Number(draft.serviceCharge ?? (typeof serviceChargeOf === "function" ? serviceChargeOf() : 0));
  const turno = {
    id: `ty-${Date.now()}`,
    ...draft,
    price,
    senia,
    serviceCharge: charge,
    cobrado,
    pagoEstado: senia <= 0 ? (cobrado ? "completo" : "sin_pago") : senia >= price ? "completo" : "senia",
    createdAt: Date.now(),
    estado: "confirmado",
  };
  rows.push(turno);
  memorySet("turnoya-booked", JSON.stringify(rows));
  memorySet("turnoya-last", JSON.stringify(turno));
  saveHolds(activeHolds().filter((hold) => hold.slot !== draft.slot || hold.placeId !== draft.placeId));
  dropWaitlistEmail(turno.placeId, turno.email);
  notifyUser(
    turno.email,
    "Turno confirmado",
    `Turno confirmado en ${turno.placeName}: ${turno.serviceName} · ${turno.slot.replace("T", " ")}. Seña ${money(turno.senia || 0)}.`,
    { type: NotificationMetadataType.TURNO, turnoId: turno.id, placeId: turno.placeId },
  );
  notifyPlaceOwner(
    turno.placeId,
    "Nuevo turno",
    `${turno.nombre || ""} ${turno.apellido || ""} · ${turno.serviceName} · ${turno.slot.replace("T", " ")}.`,
    { type: NotificationMetadataType.TURNO, turnoId: turno.id, placeId: turno.placeId },
  );
  pushPlaceNote(
    turno.placeId,
    `Nuevo turno: ${turno.nombre || ""} ${turno.apellido || ""} · ${turno.serviceName} · ${turno.slot.replace("T", " ")}.`,
  );
  if (typeof trackPixel === "function") {
    trackPixel(turno.placeId, "Schedule", { turnoId: turno.id });
    if (turno.pagado) trackPixel(turno.placeId, "Purchase", { turnoId: turno.id, value: senia });
  }
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

function countdownLabel(slot) {
  const start = slotStart(slot).getTime();
  const diff = start - Date.now();
  if (diff <= 0) return "Es ahora";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days) return `Faltan ${days} d ${hours} h`;
  if (hours) return `Faltan ${hours} h ${mins} min`;
  return `Faltan ${mins} min`;
}

function etaTripleHtml(place) {
  if (!place) return "";
  const origin =
    typeof state === "object" && state.userLat != null
      ? { lat: state.userLat, lng: state.userLng }
      : null;
  const km = origin
    ? distanceKm(origin.lat, origin.lng, place.lat, place.lng)
    : Number(place.km || 0);
  if (!origin) {
    return `<p class="meta">Activá la ubicación para ver a pie, auto y colectivo.</p>`;
  }
  return `<p class="meta">${km.toFixed(1)} km · ${etaMinutes(km, "walking")} min a pie · ${etaMinutes(
    km,
    "driving",
  )} min en auto · ${etaMinutes(km, "transit")} min en colectivo</p>`;
}

function homeTurnsHtml() {
  const user = typeof currentUser === "function" ? currentUser() : null;
  if (!user?.email || typeof bookedSlots !== "function") return "";
  const rows = bookedSlots()
    .filter((row) => row.email === user.email && row.slot)
    .sort((a, b) => String(a.slot).localeCompare(String(b.slot)));
  const pending = rows.filter(
    (row) => row.estado === "confirmado" && Date.now() < slotStart(row.slot).getTime(),
  );
  const recent = rows
    .filter((row) => row.estado === "concretado" || Date.now() >= slotStart(row.slot).getTime())
    .filter((row) => row.estado !== "cancelado")
    .slice(-3)
    .reverse();
  if (!pending.length && !recent.length) return "";
  const pendingHtml = pending
    .map((turno) => {
      const place = typeof lookupPlace === "function" ? lookupPlace(turno.placeId) : null;
      return `<article class="home-turn">
        <p class="meta">Pendiente</p>
        <strong>${turno.placeName}</strong>
        <p class="meta">${turno.serviceName} · ${String(turno.slot).replace("T", " ")}</p>
        <p class="meta">${countdownLabel(turno.slot)}</p>
        ${place ? etaTripleHtml(place) : ""}
        <a class="btn btn-enamel" href="./ficha.html?id=${turno.placeId}">Ver negocio</a>
        ${
          place
            ? `<a class="btn-line" target="_blank" rel="noreferrer" href="${googleDirectionsUrl(
                place,
                typeof state === "object" && state.userLat != null
                  ? { lat: state.userLat, lng: state.userLng }
                  : null,
                travelMode(),
              )}">Cómo llegar</a>`
            : ""
        }
      </article>`;
    })
    .join("");
  const recentHtml = recent
    .map((turno) => {
      const review =
        typeof canReviewTurno === "function" && canReviewTurno(turno, user)
          ? `<a class="btn-line" href="./mi-turno.html#turno-${turno.id}">Calificar</a>`
          : "";
      return `<article class="home-turn">
        <p class="meta">Último</p>
        <strong>Fuiste a ${turno.placeName}</strong>
        <p class="meta">Hiciste ${turno.serviceName} · ${String(turno.slot).replace("T", " ")}</p>
        <a class="btn btn-ticket" href="./reservar.html?id=${turno.placeId}&service=${
          turno.serviceId || ""
        }">Reservar de nuevo</a>
        ${review}
      </article>`;
    })
    .join("");
  return `${pending.length ? `<h2>Tus próximos turnos</h2>${pendingHtml}` : ""}${
    recent.length ? `<h2>Tus últimos turnos</h2>${recentHtml}` : ""
  }`;
}

function slotEndTime(turno) {
  return slotStart(turno.slot).getTime() + (Number(turno.minutes) || 60) * 60000;
}

function autoCompletePastTurnos() {
  bookedSlots().forEach((turno) => {
    if (turno.estado !== "confirmado" || !turno.slot) return;
    if (Date.now() < slotEndTime(turno)) return;
    patchTurno(turno.id, { estado: "concretado" });
    notifyTurnoChange(turno.id, "concretado");
  });
}

function serviceChargeSettings() {
  try {
    return (
      JSON.parse(memoryGet("turnoya-service-charge") ?? "null") || { enabled: true, amount: 200 }
    );
  } catch {
    return { enabled: true, amount: 200 };
  }
}

function saveServiceChargeSettings(data) {
  memorySet("turnoya-service-charge", JSON.stringify(data));
}

function serviceChargeOf() {
  const settings = serviceChargeSettings();
  if (!settings.enabled) return 0;
  const amount = Number(settings.amount);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
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
      cobrado: 3000,
      pagoEstado: "senia",
      slot: slotKey(day, 10, 0),
      email: "pedroterraf@gmail.com",
      nombre: "Pedro",
      apellido: "Terraf",
      dni: "30111222",
      createdAt: Date.now(),
      estado: "confirmado",
    },
    {
      id: `ty-seed-${placeId}-past`,
      placeId,
      placeName: place.name,
      slug: place.slug,
      serviceId: `${placeId}-main`,
      serviceName: place.service,
      minutes: 60,
      price: 9000,
      senia: 3000,
      cobrado: 3000,
      pagoEstado: "senia",
      slot: slotKey(new Date(Date.now() - 2 * 86400000), 11, 0),
      email: "pedroterraf@gmail.com",
      nombre: "Pedro",
      apellido: "Terraf",
      dni: "30111222",
      createdAt: Date.now() - 2 * 86400000,
      estado: "concretado",
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
      cobrado: 3000,
      pagoEstado: "senia",
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
  notifyUser(
    "pedroterraf@gmail.com",
    "Turno confirmado",
    `Turno confirmado en ${place.name}: ${place.service} · ${slotKey(day, 10, 0).replace("T", " ")}. Seña ${money(3000)}.`,
    { type: NotificationMetadataType.TURNO, turnoId: `ty-seed-${placeId}-1`, placeId },
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

function reprogramTurno(id, newSlot, fromOwner) {
  const turno = bookedSlots().find((row) => row.id === id);
  if (!turno || turno.estado !== "confirmado") return false;
  if (!fromOwner && !placeAllowsReprogram(turno.placeId)) return false;
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
  notifyUser(
    turno.email,
    "Turno reprogramado",
    `Turno reprogramado en ${turno.placeName}: ${newSlot.replace("T", " ")}.`,
    { type: NotificationMetadataType.TURNO, turnoId: turno.id, placeId: turno.placeId },
  );
  notifyPlaceOwner(
    turno.placeId,
    "Turno reprogramado",
    `${turno.nombre || "Cliente"} pasó a ${newSlot.replace("T", " ")}.`,
    { type: NotificationMetadataType.TURNO, turnoId: turno.id, placeId: turno.placeId },
  );
  return true;
}

function notifyTurnoChange(id, estado) {
  const turno = bookedSlots().find((row) => row.id === id);
  if (!turno?.email) return;
  const meta = { type: NotificationMetadataType.TURNO, turnoId: turno.id, placeId: turno.placeId };
  if (estado === "concretado") {
    notifyUser(
      turno.email,
      `Calificá tu visita en ${turno.placeName}`,
      `El turno de ${turno.serviceName} ya terminó. Contá cómo te fue.`,
      meta,
    );
    if (typeof trackPixel === "function") {
      trackPixel(turno.placeId, "Purchase", { turnoId: turno.id });
    }
  }
  if (estado === "no_show") {
    notifyUser(turno.email, "No te presentaste", `Marcaron que no fuiste a ${turno.placeName}.`, meta);
  }
  if (estado === "cancelado") {
    notifyUser(
      turno.email,
      "El local canceló tu turno",
      `El local canceló tu turno en ${turno.placeName}. Horario liberado.`,
      meta,
    );
    notifyWaitlist(turno.placeId, turno.serviceId, turno.slot);
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
    const meta = { type: NotificationMetadataType.TURNO, turnoId: turno.id, placeId: turno.placeId };
    notifyUser(
      turno.email,
      motivo === "arrepentimiento" ? "Arrepentimiento registrado" : "Turno cancelado",
      motivo === "arrepentimiento"
        ? `Arrepentimiento en ${turno.placeName}. Horario libre y seña a devolver.`
        : `Turno cancelado en ${turno.placeName}. Horario liberado.`,
      meta,
    );
    notifyPlaceOwner(
      turno.placeId,
      motivo === "arrepentimiento" ? "Cliente se arrepintió" : "Cliente canceló",
      motivo === "arrepentimiento"
        ? `${turno.nombre || "Cliente"} se arrepintió. Horario libre y seña a devolver.`
        : `${turno.nombre || "Cliente"} canceló. Horario liberado.`,
      meta,
    );
    pushPlaceNote(
      turno.placeId,
      motivo === "arrepentimiento"
        ? `${turno.nombre || "Cliente"} se arrepintió. Horario libre y seña a devolver.`
        : `${turno.nombre || "Cliente"} canceló. Horario liberado.`,
    );
  }
  if (turno) notifyWaitlist(turno.placeId, turno.serviceId, turno.slot);
}

function canReprogram(turno) {
  return (
    placeAllowsReprogram(turno.placeId) &&
    turno.estado === "confirmado" &&
    Date.now() < slotStart(turno.slot).getTime()
  );
}

function waitlistRows(placeId) {
  try {
    return JSON.parse(memoryGet(`turnoya-wait-${placeId}`) ?? "[]");
  } catch {
    return [];
  }
}

function saveWaitlist(placeId, rows) {
  memorySet(`turnoya-wait-${placeId}`, JSON.stringify(rows.slice(0, 40)));
}

function isOnWaitlist(placeId, email, serviceId) {
  const key = String(email || "").toLowerCase();
  if (!key) return false;
  return waitlistRows(placeId).some(
    (row) =>
      String(row.email || "").toLowerCase() === key &&
      (!serviceId || !row.serviceId || row.serviceId === serviceId),
  );
}

function dropWaitlistEmail(placeId, email) {
  const key = String(email || "").toLowerCase();
  if (!placeId || !key) return;
  saveWaitlist(
    placeId,
    waitlistRows(placeId).filter((row) => String(row.email || "").toLowerCase() !== key),
  );
}

function askNotifyPermission() {
  if (typeof Notification === "undefined" || Notification.permission !== "default") return;
  Notification.requestPermission().catch(() => {});
}

function joinWaitlist(placeId, payload) {
  const user = typeof currentUser === "function" ? currentUser() : null;
  const email = payload.email || user?.email;
  if (!email) return { ok: false, already: false };
  askNotifyPermission();
  if (isOnWaitlist(placeId, email, payload.serviceId)) return { ok: true, already: true };
  const rows = waitlistRows(placeId);
  rows.push({
    id: `w-${Date.now()}`,
    email,
    nombre: payload.nombre || user?.nombre || "",
    serviceId: payload.serviceId || "",
    serviceName: payload.serviceName || "",
    at: Date.now(),
  });
  saveWaitlist(placeId, rows);
  notifyUser(
    email,
    "Lista de espera",
    `Te avisamos en Notificaciones si se libera un horario en ${payload.placeName || "el local"}.`,
    { type: NotificationMetadataType.WAITLIST, placeId, serviceId: payload.serviceId || "" },
  );
  notifyPlaceOwner(
    placeId,
    "Lista de espera",
    `${payload.nombre || "Alguien"} se anotó en la lista de espera.`,
    { type: NotificationMetadataType.WAITLIST, placeId },
  );
  pushPlaceNote(placeId, `${payload.nombre || "Alguien"} se anotó en la lista de espera.`);
  return { ok: true, already: false };
}

function notifyWaitlist(placeId, serviceId, slot) {
  const now = Date.now();
  const rows = waitlistRows(placeId);
  const next = rows
    .filter((row) => !serviceId || !row.serviceId || row.serviceId === serviceId)
    .sort((left, right) => (left.at || 0) - (right.at || 0))
    .find((row) => !row.claimUntil || row.claimUntil <= now);
  if (!next) return;
  saveWaitlist(
    placeId,
    rows.map((row) =>
      row.id === next.id
        ? { ...row, claimUntil: now + WAITLIST_CLAIM_MINUTES * 60 * 1000, claimSlot: slot || "" }
        : row,
    ),
  );
  const place = findPlace(placeId);
  const when = slot ? String(slot).replace("T", " ") : "un horario";
  notifyUser(
    next.email,
    "Se liberó un horario",
    `Se liberó ${when} en ${place?.name || "el local"}. Tenés ${WAITLIST_CLAIM_MINUTES} minutos para reservar.`,
    {
      type: NotificationMetadataType.WAITLIST,
      placeId,
      serviceId: next.serviceId || serviceId || "",
      slot: slot || "",
    },
  );
}

function todayHuecos(placeId) {
  if (typeof planAllows === "function" && !planAllows(placeId, "huecos")) return [];
  const place = findPlace(placeId);
  const service = placeServices(place)[0];
  if (!service) return [];
  const today = dayKey(new Date());
  const now = new Date();
  const limitHour = now.getHours() + 6;
  return freeSlots(placeId, service).filter((key) => {
    if (!key.startsWith(today)) return false;
    const hour = Number(key.slice(11, 13));
    return hour <= limitHour;
  });
}

function clientTrust(email) {
  if (!email) return { label: "Sin dato", score: null };
  const rows = bookedSlots().filter((row) => row.email === email);
  const done = rows.filter((row) => row.estado === "concretado").length;
  const miss = rows.filter((row) => row.estado === "no_show").length;
  const total = done + miss;
  if (!total) return { label: "Nuevo en la red TurnoYa", score: null };
  const score = Math.round((done / total) * 100);
  return { label: `${score}% asistencia en la red`, score };
}

function reprogramLink(turno) {
  if (!canReprogram(turno)) return "";
  return `<a class="btn btn-line" href="./reservar.html?id=${turno.placeId}&service=${turno.serviceId || ""}&reprogram=${turno.id}">Reprogramar</a>`;
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
          ${starPickerHtml()}
          <div data-review-comment hidden>
            <label>Comentario <input name="text" required maxlength="160" /></label>
            <button class="btn btn-ticket" type="submit">Calificar</button>
          </div>
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
  return `<article class="quote" id="turno-${turno.id}" data-turno="${turno.id}">
    <strong>${turno.placeName}</strong>
    <p class="meta">${turno.serviceName} · ${when} · ${estadoLabel(turno.estado)}</p>
    ${turnoGoLinks(turno)}
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
    bindStarPicker(form);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const user = currentUser();
      const turno = bookedSlots().find((row) => row.id === form.dataset.review);
      const data = new FormData(form);
      const stars = clampStarValue(data.get("stars"));
      if (!Number(data.get("stars")) || stars < STAR_MIN) return;
      if (addTurnoReview(turno, user, stars, data.get("text"))) {
        onDone();
      }
    });
  });
}
