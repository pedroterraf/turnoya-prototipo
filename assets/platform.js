function seedPendingAlta() {
  if (extraPlaces().some((place) => placeView(place).status === "pending")) return;
  saveExtraPlace({
    id: "spa-nueva",
    name: "Spa Nueva Córdoba",
    slug: "spa-nueva",
    category: "belleza",
    service: "Masaje",
    city: "cordoba",
    lat: -31.419,
    lng: -64.187,
    km: 0.4,
    featured: false,
    nextSlot: "Mañana 11:00",
    whatsapp: "3514440000",
    status: "pending",
    plan: "calle",
  });
}

function moneyKind(turno) {
  if (turno.reembolsado) return "reintegrado";
  if (turno.estado === "cancelado" && (turno.motivo === "arrepentimiento" || turno.motivo === "local" || turno.motivo === "cancelacion")) {
    return "reembolso";
  }
  if (turno.estado === "no_show") return "senia_retenida";
  if (turno.estado === "concretado") return "senia_cerrada";
  if (turno.estado === "confirmado") return "senia_activa";
  if (turno.estado === "cancelado") return "cancelado";
  return turno.estado;
}

function moneyLabel(kind) {
  return (
    {
      reembolso: "Reembolso MP",
      reintegrado: "Reintegrado",
      senia_retenida: "Seña retenida (no-show)",
      senia_cerrada: "Seña cerrada",
      senia_activa: "Seña cobrada",
      service_charge: "Cargo de servicio",
      cancelado: "Cancelado",
    }[kind] ?? kind
  );
}

function moneyLedger() {
  const rows = bookedSlots().flatMap((turno) => {
    const base = {
      ...turno,
      kind: moneyKind(turno),
      amount: turno.senia || 0,
    };
    if (!turno.serviceCharge) return [base];
    return [
      base,
      {
        ...turno,
        kind: "service_charge",
        amount: Number(turno.serviceCharge) || 0,
      },
    ];
  });
  return rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function lastCronReport() {
  try {
    return JSON.parse(memoryGet("turnoya-cron") ?? "null") || { users: 0, plans: 0, at: 0 };
  } catch {
    return { users: 0, plans: 0, at: 0 };
  }
}

function runPlatformCron() {
  const report = {
    users: typeof purgeUnverifiedUsers === "function" ? purgeUnverifiedUsers() : 0,
    plans: typeof expirePlacePlans === "function" ? expirePlacePlans() : 0,
    at: Date.now(),
  };
  memorySet("turnoya-cron", JSON.stringify(report));
  return report;
}

function placePixel(placeId) {
  try {
    return (
      JSON.parse(memoryGet(`turnoya-pixel-${placeId}`) ?? "null") || {
        pixelId: "",
        enabled: false,
      }
    );
  } catch {
    return { pixelId: "", enabled: false };
  }
}

function savePlacePixel(placeId, data) {
  memorySet(`turnoya-pixel-${placeId}`, JSON.stringify(data));
}

function pixelLog(placeId) {
  try {
    return JSON.parse(memoryGet(`turnoya-pixel-log-${placeId}`) ?? "[]");
  } catch {
    return [];
  }
}

function pushPixelEvent(placeId, eventName, payload) {
  const settings = placePixel(placeId);
  if (!settings.enabled || !settings.pixelId) return null;
  const row = {
    id: `px-${Date.now()}`,
    event: eventName,
    payload: payload || {},
    at: Date.now(),
    pixelId: settings.pixelId,
  };
  memorySet(`turnoya-pixel-log-${placeId}`, JSON.stringify([row, ...pixelLog(placeId)].slice(0, 40)));
  return row;
}

function trackPixel(placeId, eventName, payload) {
  return pushPixelEvent(placeId, eventName, payload);
}

function placeCrmNotes(placeId) {
  try {
    return JSON.parse(memoryGet(`turnoya-crm-${placeId}`) ?? "{}");
  } catch {
    return {};
  }
}

function saveCrmNote(placeId, email, patch) {
  const book = placeCrmNotes(placeId);
  book[email] = { ...(book[email] || {}), ...patch };
  memorySet(`turnoya-crm-${placeId}`, JSON.stringify(book));
}

function placeCrmRows(placeId) {
  const notes = placeCrmNotes(placeId);
  const groups = {};
  placeTurnos(placeId).forEach((turno) => {
    const key = String(turno.email || "").toLowerCase();
    if (!key) return;
    if (!groups[key]) {
      groups[key] = {
        email: turno.email,
        nombre: `${turno.nombre || ""} ${turno.apellido || ""}`.trim() || turno.email,
        visits: 0,
        noShows: 0,
        spent: 0,
        lastService: "",
        lastSlot: "",
        turnos: [],
      };
    }
    const row = groups[key];
    row.turnos.push(turno);
    if (turno.estado === "concretado") row.visits += 1;
    if (turno.estado === "no_show") row.noShows += 1;
    row.spent += Number(turno.cobrado || turno.senia || 0);
    if (!row.lastSlot || String(turno.slot) > row.lastSlot) {
      row.lastSlot = turno.slot;
      row.lastService = turno.serviceName;
      row.nombre = `${turno.nombre || ""} ${turno.apellido || ""}`.trim() || row.nombre;
    }
  });
  return Object.values(groups)
    .map((row) => ({
      ...row,
      note: notes[row.email]?.note || "",
      tag: notes[row.email]?.tag || "",
    }))
    .sort((a, b) => String(b.lastSlot).localeCompare(String(a.lastSlot)));
}

function statusLabel(status) {
  return (
    {
      live: "Publicado",
      pending: "En revisión",
      rejected: "Rechazado",
      datos: "Pide datos",
    }[status] ?? status
  );
}
