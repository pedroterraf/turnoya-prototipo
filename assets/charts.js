const CHART_DAYS = 14;

function chartDayKeys(days = CHART_DAYS) {
  const keys = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    keys.push(typeof dayKey === "function" ? dayKey(day) : day.toISOString().slice(0, 10));
  }
  return keys;
}

function countBySlotDay(rows, days = CHART_DAYS) {
  const keys = chartDayKeys(days);
  const counts = Object.fromEntries(keys.map((key) => [key, 0]));
  rows.forEach((row) => {
    const key = String(row.slot || "").slice(0, 10);
    if (key in counts) counts[key] += 1;
  });
  return keys.map((key) => ({
    label: `${key.slice(8)}/${key.slice(5, 7)}`,
    value: counts[key],
  }));
}

function barChartHtml(title, rows, format) {
  const max = Math.max(...rows.map((row) => Number(row.value) || 0), 1);
  return `<section class="stat-chart">
    <h3 class="ficha-sub">${title}</h3>
    <div class="stat-bars">
      ${rows
        .map((row) => {
          const value = Number(row.value) || 0;
          const shown = format ? format(value) : String(value);
          return `<div class="stat-bar">
            <span class="stat-bar-label">${row.label}</span>
            <span class="stat-bar-track"><span class="stat-bar-fill" style="width:${(value / max) * 100}%"></span></span>
            <b class="stat-bar-value">${shown}</b>
          </div>`;
        })
        .join("")}
    </div>
  </section>`;
}

function sparkChartHtml(title, rows) {
  const values = rows.map((row) => Number(row.value) || 0);
  const total = values.reduce((sum, value) => sum + value, 0);
  const max = Math.max(...values, 1);
  const width = 320;
  const height = 76;
  const pad = 6;
  const step = (width - pad * 2) / Math.max(rows.length - 1, 1);
  const points = values
    .map((value, index) => {
      const x = pad + index * step;
      const y = height - pad - (value / max) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  return `<section class="stat-chart">
    <h3 class="ficha-sub">${title}</h3>
    <svg class="stat-spark" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
      <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" />
    </svg>
    <p class="meta">${total} en ${rows.length} días</p>
  </section>`;
}

function placeChartBlocks(placeId) {
  const metrics = placeMetrics(placeId);
  const rows = placeTurnos(placeId);
  const shown = metrics.concretados + metrics.noShow;
  const attendance = shown ? Math.round((metrics.concretados / shown) * 100) : 0;
  return `<div class="stat-grid">
    ${sparkChartHtml("Turnos · 14 días", countBySlotDay(rows))}
    ${barChartHtml("Este mes · estados", [
      { label: "Concretados", value: metrics.concretados },
      { label: "Confirmados", value: metrics.confirmados },
      { label: "No-show", value: metrics.noShow },
      { label: "Cancelados", value: metrics.cancelados },
    ])}
    ${barChartHtml(
      "Este mes · plata",
      [
        { label: "Recaudado", value: metrics.cobrado },
        { label: "Saldo", value: metrics.saldo },
        { label: "Cancelado", value: metrics.reembolso },
      ],
      money,
    )}
    <section class="stat-chart">
      <h3 class="ficha-sub">Asistencia</h3>
      <p class="stat-big">${attendance}%</p>
      <p class="meta">${metrics.concretados} concretados · ${metrics.noShow} no-show</p>
    </section>
  </div>`;
}

function platformChartBlocks() {
  const rows = bookedSlots();
  const users = listedUsers();
  const views = allPlaces().map(placeView);
  const ledger = moneyLedger();
  const sum = (kind) =>
    ledger.filter((row) => row.kind === kind).reduce((acc, row) => acc + (row.amount || 0), 0);
  return `<div class="stat-grid">
    ${sparkChartHtml("Reservas · 14 días", countBySlotDay(rows))}
    ${barChartHtml(
      "Negocios por plan",
      PLAN_ORDER.map((key) => ({
        label: PLANS[key].name,
        value: views.filter((place) => normalizePlanId(place.plan) === key).length,
      })),
    )}
    ${barChartHtml("Cuentas", [
      { label: "OTP ok", value: users.filter((row) => row.emailVerified).length },
      { label: "Sin OTP", value: users.filter((row) => !row.emailVerified).length },
    ])}
    ${barChartHtml(
      "Dinero de la red",
      [
        { label: "Señas activas", value: sum("senia_activa") },
        { label: "Cargo de servicio", value: sum("service_charge") },
        { label: "A devolver", value: sum("reembolso") },
      ],
      money,
    )}
  </div>`;
}
