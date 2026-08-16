const GRID_SLOT_MINUTES = 30;
const GRID_SLOT_PX = 40;

function bookHourWindow(config, service) {
  const row = service ? normalizeService(service) : null;
  const start = Math.max(config.start, row ? Number(row.hourStart) || config.start : config.start);
  const end = Math.min(config.end, row ? Number(row.hourEnd) || config.end : config.end);
  return { start, end: end > start ? end : config.end };
}

function gridHourRange(service, placeId) {
  const place = placeId ? placeHourRange(placeId) : { start: 9, end: 19 };
  if (!service) return place;
  const row = normalizeService(service);
  const start = Math.max(Number(row.hourStart) || place.start, place.start);
  const end = Math.min(Number(row.hourEnd) || place.end, place.end);
  if (start >= end) return place;
  return { start, end };
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

function overlapNote(service) {
  if (!service || typeof isOpenCapacity !== "function") return "";
  if (isOpenCapacity(service)) return " · se pisa · ilimitado";
  const capacity = serviceCapacity(service);
  if (capacity <= 1) return "";
  return ` · se pisa · ${capacity}`;
}

function gapBufferEvents(placeId, exceptId) {
  const gap = typeof exclusiveGapMinutes === "function" ? exclusiveGapMinutes(placeId) : 0;
  if (!gap) return [];
  return exclusiveBookings(placeId, exceptId).map((row) => {
    const end = new Date(slotStart(row.slot).getTime() + Number(row.minutes || GRID_SLOT_MINUTES) * 60000);
    return {
      id: `gap-${row.id || row.slot}`,
      kind: "buffer",
      slot: slotKey(end, end.getHours(), end.getMinutes()),
      minutes: gap,
      title: `Margen ${gap} min`,
      allowsOverlap: false,
    };
  });
}

function ownerCalendarEvents(placeId, exceptId, services) {
  const booked = bookedSlots()
    .filter((row) => row.placeId === placeId && row.estado !== "cancelado" && row.id !== exceptId)
    .map((row) => {
      const service = services.find((item) => item.id === row.serviceId);
      const canOverlap = serviceAllowsOverlap(service);
      return {
        id: row.id,
        kind: canOverlap ? "owner-overlap" : "owner",
        slot: row.slot,
        minutes: row.minutes || service?.minutes || GRID_SLOT_MINUTES,
        title: `${row.nombre || ""} ${row.apellido || ""} · ${row.serviceName}${overlapNote(service)}`,
        allowsOverlap: canOverlap,
      };
    });
  const holds = activeHolds()
    .filter((hold) => hold.placeId === placeId)
    .map((hold) => ({
      id: `hold-${hold.slot}`,
      kind: "hold",
      slot: hold.slot,
      minutes: hold.minutes || GRID_SLOT_MINUTES,
      title: `${hold.nombre || "Alguien"} · pagando`,
      allowsOverlap: false,
    }));
  return [...booked, ...holds, ...gapBufferEvents(placeId, exceptId)];
}

function clientCalendarEvents(placeId, exceptId, bookingService) {
  if (bookingService && serviceAllowsOverlap(bookingService)) return [];
  const services = placeServices(findPlace(placeId));
  const booked = bookedSlots()
    .filter((row) => row.placeId === placeId && row.estado !== "cancelado" && row.id !== exceptId)
    .flatMap((row) => {
      const service = services.find((item) => item.id === row.serviceId);
      if (serviceAllowsOverlap(service)) return [];
      return [
        {
          id: row.id,
          kind: "busy",
          slot: row.slot,
          minutes: row.minutes || service?.minutes || GRID_SLOT_MINUTES,
          title: "Ocupado",
        },
      ];
    });
  const holds = activeHolds()
    .filter((hold) => hold.placeId === placeId)
    .flatMap((hold) => {
      const service = services.find((item) => item.id === hold.serviceId);
      if (serviceAllowsOverlap(service)) return [];
      return [
        {
          id: `hold-${hold.slot}`,
          kind: "hold",
          slot: hold.slot,
          minutes: hold.minutes || GRID_SLOT_MINUTES,
          title: "Reservando…",
        },
      ];
    });
  return [...booked, ...holds, ...gapBufferEvents(placeId, exceptId)];
}

function placeCalendarEvents(placeId, exceptId, view, bookingService) {
  const place = findPlace(placeId);
  const services = placeServices(place);
  if (view === "owner") return ownerCalendarEvents(placeId, exceptId, services);
  return clientCalendarEvents(placeId, exceptId, bookingService);
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
  const minHeight = event.kind === "buffer" ? 4 : 22;
  const height = Math.max((event.minutes / GRID_SLOT_MINUTES) * GRID_SLOT_PX - 3, minHeight);
  const left = 4 + event.stack * 16;
  return `top:${top}px;height:${height}px;left:${left}px;right:4px;z-index:${2 + event.stack}`;
}

function offHoursHtml(config, range, service) {
  if (!config.open) return "";
  const window = bookHourWindow(config, service);
  const before = Math.max(0, (window.start - range.start) * 2 * GRID_SLOT_PX);
  const afterTop = Math.max(0, (window.end - range.start) * 2 * GRID_SLOT_PX);
  const after = Math.max(0, (range.end - window.end) * 2 * GRID_SLOT_PX);
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
  const events = placeCalendarEvents(place.id, exceptId, view, service);
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
            const window = bookHourWindow(config, service);
            const off = !config.open || hour < window.start || hour >= window.end;
            return `<div class="tg-line${pastHour ? " is-past" : ""}${off ? " is-off" : ""}" style="height:${GRID_SLOT_PX}px"></div>`;
          }),
        )
        .join("");
      return `<div class="tg-col${closed ? " is-closed" : ""}${holiday ? " is-holiday" : ""}${
        pastDay ? " is-past" : ""
      }" data-day="${key}" style="height:${height}px">
        ${lines}
        ${offHoursHtml(config, range, service)}
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
              `<button class="tg-event is-${event.kind}" type="button" data-event="${event.id || ""}" data-slot="${
                event.slot || ""
              }" data-overlap="${event.allowsOverlap ? "1" : ""}" style="${eventBlockStyle(
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

function slotFromColPoint(col, clientY, range, days) {
  const rect = col.getBoundingClientRect();
  const index = Math.max(0, Math.floor((clientY - rect.top) / GRID_SLOT_PX));
  const minutes = range.start * 60 + index * GRID_SLOT_MINUTES;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const day = days.find((row) => dayKey(row) === col.dataset.day);
  if (!day) return "";
  return slotKey(day, hour, minute);
}

function tryPickSlot(options, key) {
  const { place, exceptId, onPick, onBlocked, getService } = options;
  const service = typeof getService === "function" ? getService() : options.service;
  if (!service || !onPick) return;
  const today = dayKey(new Date());
  const now = new Date();
  if (key.slice(0, 10) === today && slotStart(key) <= now) {
    if (onBlocked) onBlocked("Ese horario ya pasó.");
    return;
  }
  const start = slotStart(key);
  const config = dayConfig(place.id, start.getDay());
  const window = bookHourWindow(config, service);
  const hourValue = start.getHours() + start.getMinutes() / 60;
  if (hourValue < window.start) {
    if (onBlocked) onBlocked(`Este servicio atiende desde las ${pad(window.start)}:00.`);
    return;
  }
  const startMs = start.getTime();
  const endMs = startMs + Number(service.minutes || 30) * 60000;
  if (
    !serviceAllowsOverlap(service) &&
    typeof exclusiveGapOk === "function" &&
    !exclusiveGapOk(place.id, startMs, endMs, exceptId)
  ) {
    if (onBlocked) {
      onBlocked(`Entre turnos que no se pisan hay ${exclusiveGapMinutes(place.id)} min de margen.`);
    }
    return;
  }
  if (!canBook(place.id, service, key, exceptId)) {
    if (onBlocked) {
      onBlocked("No entra: dura " + service.minutes + " min, está fuera del horario hábil o el cupo está lleno.");
    }
    return;
  }
  onPick(key);
}

function bindTimeGrid(root, options) {
  const { days, onPick, onBlocked, onEvent } = options;
  const service = typeof options.getService === "function" ? options.getService() : options.service;
  const range = options.hourRange || gridHourRange(service, options.place.id);
  root.querySelectorAll(".tg-event[data-event]").forEach((button) => {
    if (!button.dataset.event || button.classList.contains("is-pick")) return;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (button.dataset.overlap === "1" && onPick) {
        const col = button.closest(".tg-col");
        const key = col ? slotFromColPoint(col, event.clientY, range, days) : button.dataset.slot;
        if (key) tryPickSlot(options, key);
        return;
      }
      if (onEvent) onEvent(button.dataset.event);
    });
  });
  if (!onPick) return;
  root.querySelectorAll(".tg-col").forEach((col) => {
    col.addEventListener("click", (event) => {
      if (event.target.closest(".tg-event:not(.is-pick)")) {
        if (onBlocked && !event.target.closest("[data-overlap='1']")) {
          onBlocked("Ese horario está tomado.");
        }
        return;
      }
      if (col.classList.contains("is-closed")) {
        if (onBlocked) {
          onBlocked(col.classList.contains("is-holiday") ? "Ese día es feriado." : "Ese día el local está cerrado.");
        }
        return;
      }
      if (col.classList.contains("is-past")) {
        if (onBlocked) onBlocked("Ese día ya pasó.");
        return;
      }
      const key = slotFromColPoint(col, event.clientY, range, days);
      if (key) tryPickSlot(options, key);
    });
  });
}
