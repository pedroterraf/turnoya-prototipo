function formatRangeLabel(from, to) {
  const fmt = (value) => {
    if (!value) return "";
    const date = new Date(`${value}T12:00:00`);
    return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  };
  if (from && to) return `${fmt(from)} – ${fmt(to)}`;
  if (from) return `Desde ${fmt(from)}`;
  return "Elegí un rango de fechas";
}

function isoDay(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function mountRangePicker(host, config) {
  if (!host) return null;
  let from = config.from || "";
  let to = config.to || "";
  let cursor = from ? new Date(`${from}T12:00:00`) : new Date();
  let open = false;
  const onChange = config.onChange || (() => {});

  host.classList.add("range-picker");
  host.innerHTML = `
    <button class="range-picker-toggle" type="button"></button>
    <div class="range-picker-panel" hidden></div>
  `;
  const toggle = host.querySelector(".range-picker-toggle");
  const panel = host.querySelector(".range-picker-panel");

  function syncLabel() {
    toggle.textContent = formatRangeLabel(from, to);
  }

  function paint() {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const start = new Date(year, month, 1);
    const lead = (start.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const title = cursor.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    const cells = [];
    for (let i = 0; i < lead; i += 1) cells.push("<span></span>");
    for (let day = 1; day <= days; day += 1) {
      const value = isoDay(new Date(year, month, day));
      const classes = ["range-picker-day"];
      if (from && value === from) classes.push("is-start");
      if (to && value === to) classes.push("is-end");
      if (from && to && value > from && value < to) classes.push("is-in");
      cells.push(`<button class="${classes.join(" ")}" type="button" data-day="${value}">${day}</button>`);
    }
    panel.innerHTML = `
      <div class="range-picker-head">
        <button class="week-arrow" type="button" data-shift="-1" aria-label="Mes anterior">‹</button>
        <strong>${title}</strong>
        <button class="week-arrow" type="button" data-shift="1" aria-label="Mes siguiente">›</button>
      </div>
      <div class="range-picker-grid">
        ${["L", "M", "M", "J", "V", "S", "D"].map((d) => `<span class="range-picker-dow">${d}</span>`).join("")}
        ${cells.join("")}
      </div>
      <div class="range-picker-actions">
        <button class="btn-link" type="button" data-clear>Borrar</button>
        <button class="btn btn-enamel" type="button" data-close>Listo</button>
      </div>
    `;
  }

  function pick(day) {
    if (!from || (from && to)) {
      from = day;
      to = "";
    } else if (day < from) {
      to = from;
      from = day;
    } else {
      to = day;
    }
    syncLabel();
    paint();
    onChange({ from, to });
  }

  function setOpen(next) {
    if (next === open) return;
    if (next) {
      open = true;
      panel.hidden = false;
      paint();
      return;
    }
    open = false;
    if (window.turnoyaMotion?.hide) {
      window.turnoyaMotion.hide(
        panel,
        { opacity: [1, 0], y: [0, -8] },
        { duration: 0.18, ease: window.turnoyaMotion.easeOut },
      );
      return;
    }
    panel.hidden = true;
  }

  panel.addEventListener("pointerdown", (event) => event.stopPropagation());
  panel.addEventListener("click", (event) => {
    event.stopPropagation();
    const shift = event.target.closest("[data-shift]");
    if (shift) {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + Number(shift.dataset.shift), 1);
      paint();
      return;
    }
    const day = event.target.closest("[data-day]");
    if (day) {
      pick(day.dataset.day);
      return;
    }
    if (event.target.closest("[data-clear]")) {
      from = "";
      to = "";
      syncLabel();
      paint();
      onChange({ from, to });
      return;
    }
    if (event.target.closest("[data-close]")) setOpen(false);
  });
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(!open);
  });
  document.addEventListener("pointerdown", (event) => {
    if (!open) return;
    if (host.contains(event.target)) return;
    setOpen(false);
  });
  syncLabel();
  return {
    setRange(nextFrom, nextTo) {
      from = nextFrom || "";
      to = nextTo || "";
      syncLabel();
    },
  };
}

function padTime(value) {
  return String(value).padStart(2, "0");
}

function formatDateTimeLabel(iso) {
  if (!iso) return "Elegí fecha y hora";
  const [day, clock = "00:00"] = iso.split("T");
  const date = new Date(`${day}T12:00:00`);
  const pretty = date.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
  return `${pretty} · ${clock.slice(0, 5)}`;
}

function mountDateTimePicker(host, config) {
  if (!host) return null;
  let value = config.value || "";
  let day = value.split("T")[0] || "";
  let time = (value.split("T")[1] || "10:00").slice(0, 5);
  let cursor = day ? new Date(`${day}T12:00:00`) : new Date();
  const onChange = config.onChange || (() => {});
  const hourStart = config.hourStart ?? 8;
  const hourEnd = config.hourEnd ?? 21;

  host.classList.add("datetime-picker");

  function emit() {
    value = day && time ? `${day}T${time}` : "";
    onChange(value);
  }

  function paint() {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const start = new Date(year, month, 1);
    const lead = (start.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const title = cursor.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    const cells = [];
    for (let i = 0; i < lead; i += 1) cells.push("<span></span>");
    for (let num = 1; num <= days; num += 1) {
      const next = isoDay(new Date(year, month, num));
      const classes = ["range-picker-day"];
      if (next === day) classes.push("is-start", "is-end");
      cells.push(`<button class="${classes.join(" ")}" type="button" data-day="${next}">${num}</button>`);
    }
    const hours = [];
    for (let hour = hourStart; hour <= hourEnd; hour += 1) {
      hours.push(`<option value="${padTime(hour)}"${time.startsWith(padTime(hour)) ? " selected" : ""}>${padTime(hour)}</option>`);
    }
    const mins = ["00", "15", "30", "45"]
      .map((min) => `<option value="${min}"${time.endsWith(min) ? " selected" : ""}>${min}</option>`)
      .join("");
    host.innerHTML = `
      <div class="range-picker-panel">
        <div class="range-picker-head">
          <button class="week-arrow" type="button" data-shift="-1" aria-label="Mes anterior">‹</button>
          <strong>${title}</strong>
          <button class="week-arrow" type="button" data-shift="1" aria-label="Mes siguiente">›</button>
        </div>
        <div class="range-picker-grid">
          ${["L", "M", "M", "J", "V", "S", "D"].map((d) => `<span class="range-picker-dow">${d}</span>`).join("")}
          ${cells.join("")}
        </div>
      </div>
      <div class="datetime-picker-time">
        <label>Hora
          <select data-hour>${hours.join("")}</select>
        </label>
        <label>Minutos
          <select data-minute>${mins}</select>
        </label>
      </div>
      <p class="meta">${formatDateTimeLabel(value)}</p>
    `;
  }

  host.addEventListener("click", (event) => {
    const shift = event.target.closest("[data-shift]");
    if (shift) {
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + Number(shift.dataset.shift), 1);
      paint();
      return;
    }
    const picked = event.target.closest("[data-day]");
    if (picked) {
      day = picked.dataset.day;
      emit();
      paint();
    }
  });
  host.addEventListener("change", (event) => {
    const hour = host.querySelector("[data-hour]");
    const minute = host.querySelector("[data-minute]");
    if (!hour || !minute) return;
    if (event.target === hour || event.target === minute) {
      time = `${hour.value}:${minute.value}`;
      emit();
      paint();
    }
  });
  paint();
  return {
    setValue(next) {
      value = next || "";
      day = value.split("T")[0] || "";
      time = (value.split("T")[1] || time).slice(0, 5);
      paint();
    },
    getValue() {
      return value;
    },
  };
}
