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
      cancelado: "Cancelado",
    }[kind] ?? kind
  );
}

function moneyLedger() {
  return bookedSlots()
    .map((turno) => ({
      ...turno,
      kind: moneyKind(turno),
      amount: turno.senia || 0,
    }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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
