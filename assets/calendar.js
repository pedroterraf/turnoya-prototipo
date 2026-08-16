const GRID_SLOT_MINUTES = 30;
const GRID_SLOT_PX = 40;

function gridHourRange(service, placeId) {
  const place = placeId ? placeHourRange(placeId) : { start: 9, end: 19 };
  if (!service) return place;
  const row = normalizeService(service);
  return {
    start: Math.min(Number(row.hourStart) || place.start, place.start),
    end: Math.max(Number(row.hourEnd) || place.end, place.end),
  };
}

function eventRange(event) {
  const start = slotStart(event.slot).getTime();
  return { start, end: start + Number(event.minutes || GRID_SLOT_MINUTES) * 60000 };
}

function eventsOverlap(left, right) {
  const a = eventRange(left);
  const b = eventRange(right);
  return a.start < b.end && b.start < a.end;
}

function placeCalendarEvents(placeId, exceptId, view) {
  const place = findPlace(placeId);
  const services = placeServices(place);
  const booked = bookedSlots()
    .filter((row) => row.placeId === placeId && row.estado !== "cancelado" && row.id !== exceptId)
    .map((row) => {
      const service = services.find((item) => item.id === row.serviceId);
      const capacity = service ? serviceCapacity(service) : 1;
      const open = service ? isOpenCapacity(service) : false;
      const owner = view === "owner";
      return {
        id: row.id,
        kind: owner ? "owner" : open ? "open" : capacity > 1 ? "parallel" : "busy",
        slot: row.slot,
        minutes: row.minutes || service?.minutes || GRID_SLOT_MINUTES,
        title: owner
          ? `${row.nombre || ""} ${row.apellido || ""} · ${row.serviceName}`
          : open
            ? row.serviceName
            : capacity > 1
              ? "Ocupado · se pisa"
              : "Ocupado",
      };
    });
  const holds = activeHolds()
    .filter((hold) => hold.placeId === placeId)
    .map((hold) => ({
      id: `hold-${hold.slot}`,
      kind: "hold",
      slot: hold.slot,
      minutes: hold.minutes || GRID_SLOT_MINUTES,
      title: view === "owner" ? `${hold.nombre || "Alguien"} · pagando` : "Reservando…",
    }));
  return [...booked, ...holds];
}

function stackDayEvents(events) {
  const sorted = [...events].sort((a, b) => eventRange(a).start - eventRange(b).start);
  return sorted.map((event, index) => {
    let stack = 0;
    sorted.slice(0, index).forEach((other) => {
      if (eventsOverlap(event, other)) stack += 1;
    });
    return { ...event, stack };
  });
}

function eventBlockStyle(event, rangeStartHour) {
  const start = slotStart(event.slot);
  const fromMidnight = start.getHours() * 60 + start.getMinutes();
  const top = ((fromMidnight - rangeStartHour * 60) / GRID_SLOT_MINUTES) * GRID_SLOT_PX;
  const height = Math.max((event.minutes / GRID_SLOT_MINUTES) * GRID_SLOT_PX - 3, 22);
  const left = 4 + event.stack * 16;
  return `top:${top}px;height:${height}px;left:${left}px;right:4px;z-index:${2 + event.stack}`;
}

function offHoursHtml(config, range) {
  if (!config.open) return "";
  const before = Math.max(0, (config.start - range.start) * 2 * GRID_SLOT_PX);
  const afterTop = Math.max(0, (config.end - range.start) * 2 * GRID_SLOT_PX);
  const after = Math.max(0, (range.end - config.end) * 2 * GRID_SLOT_PX);
  return `${
    before ? `<div class="tg-off" style="top:0;height:${before}px"></div>` : ""
  }${after ? `<div class="tg-off" style="top:${afterTop}px;height:${after}px"></div>` : ""}`;
}

function renderTimeGrid(options) {
  const { place, service, days, exceptId, selection, view } = options;
  const range = options.hourRange || gridHourRange(service, place.id);
  const hours = [];
  for (let hour = range.start; hour < range.end; hour += 1) hours.push(hour);
  const today = dayKey(new Date());
  const now = new Date();
  const labels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const events = placeCalendarEvents(place.id, exceptId, view);
  const height = hours.length * 2 * GRID_SLOT_PX;

  const head = days
    .map((day) => {
      const key = dayKey(day);
      const holiday = activeHoliday(place.id, key);
      const closed = !dayConfig(place.id, day.getDay()).open || Boolean(holiday);
      const past = key < today;
      return `<div class="tg-head${key === today ? " is-today" : ""}${closed ? " is-closed" : ""}${
        holiday ? " is-holiday" : ""
      }${past ? " is-past" : ""}">${labels[day.getDay()]}<b>${day.getDate()}</b>${
        holiday ? `<em>${holiday.name}</em>` : ""
      }</div>`;
    })
    .join("");

  const gutter = hours
    .map((hour) => `<div class="tg-hour" style="height:${GRID_SLOT_PX * 2}px">${pad(hour)}:00</div>`)
    .join("");

  const cols = days
    .map((day) => {
      const key = dayKey(day);
      const config = dayConfig(place.id, day.getDay());
      const holiday = activeHoliday(place.id, key);
      const closed = !config.open || Boolean(holiday);
      const pastDay = key < today;
      const dayEvents = stackDayEvents(events.filter((event) => event.slot.startsWith(key)));
      const selected =
        selection && selection.startsWith(key) && service
          ? {
              slot: selection,
              minutes: service.minutes,
              kind: "pick",
              title: `Tu turno · ${service.minutes} min`,
              stack: 0,
            }
          : null;
      const blocks = [...dayEvents, selected].filter(Boolean);
      const lines = hours
        .flatMap((hour) =>
          [0, 30].map((minute) => {
            const sameDay = key === today;
            const pastHour =
              sameDay &&
              (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes()));
            const off = !config.open || hour < config.start || hour >= config.end;
            return `<div class="tg-line${pastHour ? " is-past" : ""}${off ? " is-off" : ""}" style="height:${GRID_SLOT_PX}px"></div>`;
          }),
        )
        .join("");
      return `<div class="tg-col${closed ? " is-closed" : ""}${holiday ? " is-holiday" : ""}${
        pastDay ? " is-past" : ""
      }" data-day="${key}" style="height:${height}px">
        ${lines}
        ${offHoursHtml(config, range)}
        ${
          holiday
            ? `<p class="tg-closed-label">${holiday.name}</p>`
            : !config.open
              ? `<p class="tg-closed-label">Cerrado</p>`
              : ""
        }
        ${blocks
          .map(
            (event) =>
              `<button class="tg-event is-${event.kind}" type="button" data-event="${event.id || ""}" style="${eventBlockStyle(
                event,
                range.start,
              )}"><span>${event.title}</span><em>${String(event.slot).slice(11)} · ${event.minutes} min</em></button>`,
          )
          .join("")}
      </div>`;
    })
    .join("");

  return `<div class="tg" id="calendar" style="--slot:${GRID_SLOT_PX}px">
    <div class="tg-corner"></div>
    <div class="tg-heads">${head}</div>
    <div class="tg-gutter">${gutter}</div>
    <div class="tg-cols">${cols}</div>
  </div>`;
}

function bindTimeGrid(root, options) {
  const { place, service, days, exceptId, onPick, onBlocked, onEvent } = options;
  const range = options.hourRange || gridHourRange(service, place.id);
  root.querySelectorAll(".tg-event[data-event]").forEach((button) => {
    if (!button.dataset.event || button.classList.contains("is-pick")) return;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (onEvent) onEvent(button.dataset.event);
    });
  });
  if (!onPick) return;
  root.querySelectorAll(".tg-col").forEach((col) => {
    col.addEventListener("click", (event) => {
      if (event.target.closest(".tg-event:not(.is-pick)")) {
        if (onBlocked) onBlocked("Ese bloque ya está tomado. Si el servicio se pisa, clickeá al lado.");
        return;
      }
      if (col.classList.contains("is-closed") || col.classList.contains("is-past")) return;
      const rect = col.getBoundingClientRect();
      const index = Math.max(0, Math.floor((event.clientY - rect.top) / GRID_SLOT_PX));
      const minutes = range.start * 60 + index * GRID_SLOT_MINUTES;
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const day = days.find((row) => dayKey(row) === col.dataset.day);
      if (!day) return;
      const key = slotKey(day, hour, minute);
      const today = dayKey(new Date());
      const now = new Date();
      if (key.slice(0, 10) === today && slotStart(key) <= now) {
        if (onBlocked) onBlocked("Ese horario ya pasó.");
        return;
      }
      if (!canBook(place.id, service, key, exceptId)) {
        if (onBlocked) {
          onBlocked("No entra: dura " + service.minutes + " min, está fuera del horario hábil o el cupo está lleno.");
        }
        return;
      }
      onPick(key);
    });
  });
}
