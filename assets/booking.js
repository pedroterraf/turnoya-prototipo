const BANNER_DESKTOP = { w: 1440, h: 480 };
const BANNER_MOBILE = { w: 1080, h: 720 };
const HOLD_MINUTES = 15;
const MP_FLOOR = 10;
const DEFAULT_MINIMO = 3000;
const CAPACITY_OPEN = 0;
const ARREPENTIMIENTO_DIAS = 10;
const HORAS_ANTES_CANCEL = 48;

function findPlace(id) {
  const list = typeof allPlaces === "function" ? allPlaces() : PLACES;
  return list.find((place) => place.id === id) ?? list[0];
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
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80",
    },
    {
      id: `${place.id}-short`,
      name: "Turno corto",
      minutes: 30,
      price: 4500,
      capacity: 3,
      image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80",
    },
  ];
}

function normalizeService(service) {
  if (service.capacity != null) return service;
  if (service.overlap) {
    return { ...service, capacity: service.overlapLimit || 99 };
  }
  return { ...service, capacity: 1 };
}

function placeServices(place) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(`turnoya-services-${place.id}`) ?? "null");
    if (stored?.length) return stored.map(normalizeService);
  } catch {
    /* ignore */
  }
  return defaultServices(place);
}

function savePlaceServices(placeId, services) {
  sessionStorage.setItem(`turnoya-services-${placeId}`, JSON.stringify(services));
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
  if (capacity === 1) return "1 a la vez";
  return `${capacity} en paralelo`;
}

function placeAddress(place) {
  return `${CITIES[place.city].label} · turnoya.com/${place.slug}`;
}

function mapsEmbed(place) {
  const q = encodeURIComponent(`${place.name} ${CITIES[place.city].label}`);
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
    const stored = JSON.parse(sessionStorage.getItem(`turnoya-days-${placeId}`) ?? "null");
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return { 0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: false };
}

function saveWorkingDays(placeId, days) {
  sessionStorage.setItem(`turnoya-days-${placeId}`, JSON.stringify(days));
}

function paymentRule(placeId) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(`turnoya-pay-${placeId}`) ?? "null");
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return {
    mode: "minimo",
    minimo: DEFAULT_MINIMO,
    porcentaje: 30,
    piso: MP_FLOOR,
    techo: 0,
  };
}

function savePaymentRule(placeId, rule) {
  sessionStorage.setItem(`turnoya-pay-${placeId}`, JSON.stringify(rule));
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
    const stored = JSON.parse(sessionStorage.getItem(`turnoya-policy-${placeId}`) ?? "null");
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
  sessionStorage.setItem(`turnoya-policy-${placeId}`, JSON.stringify(policy));
}

function landingTheme(placeId) {
  try {
    return JSON.parse(sessionStorage.getItem(`turnoya-theme-${placeId}`) ?? "null") ?? {};
  } catch {
    return {};
  }
}

function saveLandingTheme(placeId, theme) {
  sessionStorage.setItem(`turnoya-theme-${placeId}`, JSON.stringify(theme));
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
    return JSON.parse(sessionStorage.getItem("turnoya-booked") ?? "[]");
  } catch {
    return [];
  }
}

function activeHolds() {
  const now = Date.now();
  try {
    return JSON.parse(sessionStorage.getItem("turnoya-holds") ?? "[]").filter(
      (hold) => hold.expiresAt > now,
    );
  } catch {
    return [];
  }
}

function saveHolds(holds) {
  sessionStorage.setItem("turnoya-holds", JSON.stringify(holds));
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
  let count = seedOccupied(placeId).includes(key) ? 1 : 0;
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

function watchHold(onTick, onExpire) {
  const tick = () => {
    const hold = draftHold();
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
    return JSON.parse(sessionStorage.getItem("turnoya-draft") ?? "{}");
  } catch {
    return {};
  }
}

function writeDraft(partial) {
  sessionStorage.setItem("turnoya-draft", JSON.stringify({ ...readDraft(), ...partial }));
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
  sessionStorage.setItem("turnoya-booked", JSON.stringify(rows));
  sessionStorage.setItem("turnoya-last", JSON.stringify(turno));
  saveHolds(activeHolds().filter((hold) => hold.slot !== draft.slot || hold.placeId !== draft.placeId));
  return turno;
}

function lastTurno() {
  try {
    return JSON.parse(sessionStorage.getItem("turnoya-last") ?? "null");
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
  sessionStorage.setItem("turnoya-booked", JSON.stringify(rows));
}

function patchTurno(id, patch) {
  const rows = bookedSlots().map((row) => (row.id === id ? { ...row, ...patch } : row));
  saveBooked(rows);
  const last = lastTurno();
  if (last?.id === id) {
    sessionStorage.setItem("turnoya-last", JSON.stringify({ ...last, ...patch }));
  }
  return rows.find((row) => row.id === id) ?? null;
}

function nextOpenDay(placeId) {
  const today = dayKey(new Date());
  const daysOn = workingDays(placeId);
  return (
    weekDays().find((day) => daysOn[day.getDay()] !== false && dayKey(day) >= today) ?? weekDays()[1]
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
}

function freeSlots(placeId, service, exceptId) {
  const today = dayKey(new Date());
  const now = new Date();
  const daysOn = workingDays(placeId);
  const keys = [];
  weekDays().forEach((day) => {
    if (daysOn[day.getDay()] === false) return;
    HOURS.forEach((hour) => {
      [0, 30].forEach((minute) => {
        const sameDay = dayKey(day) === today;
        const pastHour =
          sameDay &&
          (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes()));
        if (dayKey(day) < today || pastHour) return;
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
  return true;
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
  sessionStorage.setItem("turnoya-booked", JSON.stringify(rows));
  const last = lastTurno();
  if (last?.id === id) {
    sessionStorage.setItem("turnoya-last", JSON.stringify({ ...last, estado: "cancelado", motivo }));
  }
}

function turnoCardHtml(turno) {
  const when = turno.slot.replace("T", " ");
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
    actions = `<button class="btn btn-enamel" type="button" data-cancel="${turno.id}" data-motivo="arrepentimiento">Arrepentirme y devolver</button>
      <p class="meta">Ley 24.240 · ${policy.arrepentimientoDias} días · el servicio todavía no se prestó. Se libera el horario y se reintegra lo pagado.</p>`;
  } else if (turno.estado === "confirmado" && canCancelLocal(turno)) {
    actions = `<button class="btn btn-enamel" type="button" data-cancel="${turno.id}" data-motivo="cancelacion">Cancelar según el local</button>
      <p class="meta">Ya no aplica arrepentimiento. El local deja cancelar hasta ${policy.horasAntesCancelacion} h antes.</p>`;
  } else if (turno.estado === "confirmado") {
    actions = `<p class="meta">El local confirma cuando vas. Todavía no se puede calificar.</p>`;
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
