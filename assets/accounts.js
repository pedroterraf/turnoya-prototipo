function placeArca(placeId) {
  try {
    return JSON.parse(memoryGet(`turnoya-arca-${placeId}`) ?? "null") || {
      connected: false,
      cuit: "",
      puntoVenta: "1",
      razonSocial: "",
      condicion: "monotributo",
    };
  } catch {
    return { connected: false, cuit: "", puntoVenta: "1", razonSocial: "", condicion: "monotributo" };
  }
}

function savePlaceArca(placeId, data) {
  memorySet(`turnoya-arca-${placeId}`, JSON.stringify(data));
}

function placeInvoices(placeId) {
  try {
    return JSON.parse(memoryGet(`turnoya-invoices-${placeId}`) ?? "[]");
  } catch {
    return [];
  }
}

function savePlaceInvoices(placeId, rows) {
  memorySet(`turnoya-invoices-${placeId}`, JSON.stringify(rows));
}

function invoiceOfTurno(placeId, turnoId) {
  return placeInvoices(placeId).find((row) => row.turnoId === turnoId) ?? null;
}

function invoiceLetter(arca, destinatario) {
  if (arca.condicion !== "ri") return "C";
  return destinatario === "cuit" ? "A" : "B";
}

function emitInvoice(placeId, turno, payload) {
  const arca = placeArca(placeId);
  if (!arca.connected) return null;
  const letter = invoiceLetter(arca, payload.destinatario);
  const invoice = {
    id: `fa-${Date.now()}`,
    turnoId: turno.id,
    placeId,
    letter,
    destinatario: payload.destinatario,
    nombre: payload.destinatario === "cf" ? "Consumidor final" : payload.nombre,
    doc: payload.destinatario === "cf" ? payload.doc || "CF" : payload.cuit,
    amount: Number(payload.amount ?? turnoCobrado(turno)),
    cae: String(70000000000000 + (Date.now() % 999999999999)),
    at: Date.now(),
  };
  savePlaceInvoices(placeId, [invoice, ...placeInvoices(placeId)]);
  patchTurno(turno.id, { facturaId: invoice.id });
  pushPlaceNote(placeId, `Factura ${letter} ${invoice.cae} · ${invoice.nombre} · ${money(invoice.amount)}`);
  notifyPlaceOwner(
    placeId,
    "Factura emitida",
    `Factura ${letter} ${invoice.cae} · ${invoice.nombre} · ${money(invoice.amount)}`,
    { type: NotificationMetadataType.PLACE, placeId },
  );
  return invoice;
}

function turnoCobrado(turno) {
  if (turno.cobrado != null) return Number(turno.cobrado);
  if (turno.pagado) return Number(turno.senia || 0);
  if (turno.estado !== "cancelado" && turno.senia) return Number(turno.senia);
  return 0;
}

function turnoSaldo(turno) {
  if (turno.estado === "cancelado") return 0;
  return Math.max(0, Number(turno.price || 0) - turnoCobrado(turno));
}

function pagoLabel(turno) {
  if (turno.estado === "cancelado") return "Cancelado";
  const estado = turno.pagoEstado || (turnoSaldo(turno) ? "senia" : turnoCobrado(turno) ? "completo" : "sin_pago");
  return (
    {
      senia: `Seña ${money(turnoCobrado(turno))} · saldo ${money(turnoSaldo(turno))}`,
      completo: `Cobrado completo ${money(turnoCobrado(turno))}`,
      olvidado: `Seña ${money(turnoCobrado(turno))} · se olvidaron de cobrar ${money(turnoSaldo(turno))}`,
      sin_pago: "Sin cobro",
    }[estado] || estado
  );
}

function markTurnoCharge(id, kind) {
  const turno = bookedSlots().find((row) => row.id === id);
  if (!turno) return null;
  const price = Number(turno.price || 0);
  const senia = Number(turno.senia || 0);
  if (kind === "completo") {
    return patchTurno(id, { pagoEstado: "completo", cobrado: price, pagado: true });
  }
  if (kind === "senia") {
    return patchTurno(id, { pagoEstado: "senia", cobrado: senia, pagado: senia > 0 });
  }
  if (kind === "olvidado") {
    return patchTurno(id, { pagoEstado: "olvidado", cobrado: senia, pagado: senia > 0 });
  }
  return patchTurno(id, { pagoEstado: "sin_pago", cobrado: 0, pagado: false });
}

function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start: start.getTime(), end: end.getTime(), key: `${start.getFullYear()}-${pad(start.getMonth() + 1)}` };
}

function inMonth(turno, bounds) {
  const at = turno.createdAt || slotStart(turno.slot).getTime();
  return at >= bounds.start && at < bounds.end;
}

function placeMetrics(placeId, bounds = monthBounds()) {
  const rows = placeTurnos(placeId).filter((row) => inMonth(row, bounds));
  const live = rows.filter((row) => row.estado !== "cancelado");
  const cancel = rows.filter((row) => row.estado === "cancelado");
  const cobrado = live.reduce((sum, row) => sum + turnoCobrado(row), 0);
  const saldo = live.reduce((sum, row) => sum + turnoSaldo(row), 0);
  const reembolso = cancel.reduce((sum, row) => sum + turnoCobrado(row), 0);
  const olvidado = live.filter((row) => row.pagoEstado === "olvidado").length;
  return {
    bounds,
    turnos: rows.length,
    confirmados: rows.filter((row) => row.estado === "confirmado").length,
    concretados: rows.filter((row) => row.estado === "concretado").length,
    noShow: rows.filter((row) => row.estado === "no_show").length,
    cancelados: cancel.length,
    cobrado,
    saldo,
    reembolso,
    olvidado,
    facturas: placeInvoices(placeId).filter((row) => row.at >= bounds.start && row.at < bounds.end).length,
  };
}

function placeHealthMetrics(placeId, bounds = monthBounds()) {
  const base = placeMetrics(placeId, bounds);
  const rows = placeTurnos(placeId);
  const month = rows.filter((row) => inMonth(row, bounds));
  const todayKey = new Date().toISOString().slice(0, 10);
  const today = rows.filter((row) => String(row.slot || "").startsWith(todayKey) && row.estado !== "cancelado");
  const keys = new Map();
  month.forEach((row) => {
    const key = String(row.celular || row.email || "").trim().toLowerCase();
    if (!key) return;
    keys.set(key, (keys.get(key) || 0) + 1);
  });
  const repeat = [...keys.values()].filter((count) => count > 1).length;
  const done = base.concretados + base.noShow;
  return {
    ...base,
    hoy: today.length,
    noShowPct: month.length ? Math.round((base.noShow / month.length) * 100) : 0,
    ocupacionPct: month.length ? Math.round((base.concretados / month.length) * 100) : 0,
    seniaPct: base.cobrado + base.saldo ? Math.round((base.cobrado / (base.cobrado + base.saldo)) * 100) : 0,
    recompra: repeat,
    atencionPct: done ? Math.round((base.concretados / done) * 100) : 0,
  };
}

function accountRows(placeId, bounds = monthBounds()) {
  return placeTurnos(placeId)
    .filter((row) => inMonth(row, bounds))
    .map((row) => ({
      fecha: String(row.slot || "").replace("T", " "),
      cliente: `${row.nombre || ""} ${row.apellido || ""}`.trim(),
      servicio: row.serviceName || "",
      estado: estadoLabel(row.estado),
      precio: row.price || 0,
      cobrado: turnoCobrado(row),
      saldo: turnoSaldo(row),
      pago: pagoLabel(row),
      factura: invoiceOfTurno(placeId, row.id)?.cae || "",
    }));
}

function downloadSheet(rows, filename, kind) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const line = (row) =>
    keys
      .map((key) => `"${String(row[key] ?? "").replace(/"/g, '""')}"`)
      .join(";");
  const body = `\uFEFF${[keys.join(";"), ...rows.map(line)].join("\n")}`;
  const type = kind === "excel" ? "application/vnd.ms-excel;charset=utf-8" : "text/csv;charset=utf-8";
  const blob = new Blob([body], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function createWalkIn(place, data) {
  const service = placeServices(place).find((row) => row.id === data.serviceId) || placeServices(place)[0];
  const slot = data.slot;
  if (!canBook(place.id, service, slot)) return null;
  const price = Number(service.price || 0);
  const senia = seniaOf(place.id, price);
  const kind = data.pago || "senia";
  const cobrado = kind === "completo" ? price : kind === "sin_pago" ? 0 : senia;
  const turno = {
    id: `ty-${Date.now()}`,
    placeId: place.id,
    placeName: place.name,
    slug: place.slug,
    serviceId: service.id,
    serviceName: service.name,
    minutes: service.minutes,
    price,
    senia,
    cobrado,
    pagado: cobrado > 0,
    pagoEstado: kind === "completo" ? "completo" : kind === "sin_pago" ? "sin_pago" : "senia",
    slot,
    email: data.email || `walkin-${Date.now()}@turnoya.local`,
    nombre: data.nombre || "Cliente",
    apellido: data.apellido || "Mostrador",
    dni: data.dni || "",
    celular: data.celular || "",
    createdAt: Date.now(),
    estado: "confirmado",
    origen: "mostrador",
  };
  saveBooked([...bookedSlots(), turno]);
  pushPlaceNote(
    place.id,
    `Turno de mostrador: ${turno.nombre} ${turno.apellido} · ${turno.serviceName} · ${turno.slot.replace("T", " ")}.`,
  );
  notifyPlaceOwner(
    place.id,
    "Turno de mostrador",
    `${turno.nombre} ${turno.apellido} · ${turno.serviceName} · ${turno.slot.replace("T", " ")}.`,
    { type: NotificationMetadataType.TURNO, turnoId: turno.id, placeId: place.id },
  );
  return turno;
}
