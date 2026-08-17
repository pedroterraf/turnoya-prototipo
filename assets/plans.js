const PLAN_ORDER = ["calle", "barrio", "ciudad", "red"];

const PLANS = {
  calle: {
    id: "calle",
    name: "Calle",
    tag: "Para empezar",
    price: 0,
    yearly: 0,
    branches: 1,
    staff: 1,
    services: 3,
    coupons: 1,
    bookings: 120,
    wa: 20,
    commission: 0,
    banner: false,
    waitlist: false,
    huecos: false,
    texts: false,
    featured: false,
    domain: false,
    pitch: "Pin en el mapa, ficha y seña. 0% de comisión de TurnoYa.",
    audience: "Unipersonal o local que recién se publica.",
    detail:
      "Entrás al mapa sin pagarle a TurnoYa. El cliente te encuentra, reserva y deja la seña en tu Mercado Pago: 0% de comisión. Un solo local, un usuario dueño, hasta 3 servicios y 1 cupón. Tope de 120 turnos confirmados por mes calendario; si lo pasás, hay que subir a Barrio. WhatsApp Cloud: 20 avisos al mes; el resto llega a Notificaciones en la web.",
  },
  barrio: {
    id: "barrio",
    name: "Barrio",
    tag: "El más elegido",
    price: 12900,
    yearly: 129000,
    branches: 1,
    staff: 3,
    services: 99,
    coupons: 99,
    bookings: 0,
    wa: 80,
    commission: 0,
    banner: true,
    waitlist: true,
    huecos: true,
    texts: true,
    featured: false,
    domain: false,
    pitch: "Lista de espera, huecos del día y landing con foto.",
    audience: "Local de barrio que ya llena la agenda y no quiere perder huecos.",
    detail:
      "Todo lo de Calle, sin tope de turnos, servicios ni cupones. Suma lista de espera (el primero de la cola tiene 10 minutos para tomar el horario), huecos del día en el mapa cuando se libera un turno, landing con foto y la elección de qué reseñas se leen en la ficha. Hasta 3 personas en el backoffice. 80 avisos WhatsApp al mes.",
  },
  ciudad: {
    id: "ciudad",
    name: "Ciudad",
    tag: "Con pin dorado",
    price: 22900,
    yearly: 229000,
    branches: 4,
    staff: 8,
    services: 99,
    coupons: 99,
    bookings: 0,
    wa: 250,
    commission: 0,
    banner: true,
    waitlist: true,
    huecos: true,
    texts: true,
    featured: true,
    domain: true,
    pitch: "Hasta 4 sucursales y Destacado en 1 ciudad + 1 rubro.",
    audience: "Marca con más de un local en la misma ciudad, o quien quiere el pin dorado.",
    detail:
      "Todo lo de Barrio, más hasta 4 sucursales y 8 personas en el backoffice. Incluye 1 Destacado (pin dorado y abre la lista) en 1 ciudad y 1 rubro. URL de marca. 250 avisos WhatsApp al mes. El Destacado extra en otra ciudad o rubro se compra aparte.",
  },
  red: {
    id: "red",
    name: "Red",
    tag: "Cadenas",
    price: 49900,
    yearly: 499000,
    branches: 99,
    staff: 99,
    services: 99,
    coupons: 99,
    bookings: 0,
    wa: 999,
    commission: 0,
    banner: true,
    waitlist: true,
    huecos: true,
    texts: true,
    featured: true,
    domain: true,
    pitch: "Multi-ciudad, dominio propio y trato con Ops.",
    audience: "Cadenas y redes que operan en más de una ciudad.",
    detail:
      "Sucursales y personal sin tope. Destacado y URL de marca incluidos. Multi-ciudad. Trato directo con Ops para altas, pines dorados y plata. 999 avisos WhatsApp al mes. El Patrocinado (slot fijo arriba de la lista) sigue siendo un extra.",
  },
};

const PLAN_ADDONS = {
  destacado: {
    id: "destacado",
    name: "Destacado",
    price: 9900,
    pitch: "Pin dorado y abre la lista. Se vende por ciudad + rubro.",
    detail:
      "El pin se ve dorado y tu ficha abre la lista de esa ciudad y ese rubro. El cliente lee Destacado: no se esconde. Ciudad y Red ya traen 1. En Calle o Barrio se compra suelto. No mueve el promedio de estrellas.",
  },
  patrocinado: {
    id: "patrocinado",
    name: "Patrocinado",
    price: 18900,
    pitch: "Un slot fijo arriba de la lista. Siempre dice Patrocinado.",
    detail:
      "Un lugar fijo arriba de los resultados de esa búsqueda. Siempre dice Patrocinado. No reemplaza al Destacado: se puede tener los dos. Ningún plan lo incluye de base.",
  },
};

function normalizePlanId(value) {
  const map = {
    base: "calle",
    starter: "calle",
    advanced: "barrio",
    plus: "ciudad",
    destacado: "ciudad",
    business: "red",
  };
  const key = map[value] || value;
  return PLANS[key] ? key : "calle";
}

function catalogPlan(id) {
  return PLANS[normalizePlanId(id)];
}

function placePlanId(placeId) {
  const place = typeof findPlace === "function" ? findPlace(placeId) : { id: placeId };
  const view = typeof placeView === "function" ? placeView(place) : place;
  const raw = view.plan;
  if (!raw || raw === "base") return view.featured ? "ciudad" : "calle";
  return normalizePlanId(raw);
}

function placePlan(placeId) {
  return catalogPlan(placePlanId(placeId));
}

function planAllows(placeId, feature) {
  return Boolean(placePlan(placeId)[feature]);
}

function planLimit(placeId, key) {
  return placePlan(placeId)[key];
}

function savePlacePlan(placeId, planId, extra) {
  const plan = catalogPlan(planId);
  const current = typeof placePlanId === "function" ? placePlanId(placeId) : "calle";
  const patch = { plan: plan.id, previousPlan: current, ...(extra || {}) };
  if (plan.featured) patch.featured = true;
  if (plan.id === "calle") patch.featured = false;
  if (typeof patchPlaceView === "function") patchPlaceView(placeId, patch);
}

function expirePlacePlans() {
  if (typeof allPlaces !== "function" || typeof placeView !== "function") return 0;
  let count = 0;
  allPlaces().forEach((place) => {
    const view = placeView(place);
    if (!view.planUntil || Number(view.planUntil) > Date.now()) return;
    const previous = normalizePlanId(view.previousPlan || "calle");
    const next = previous === view.plan ? "calle" : previous;
    savePlacePlan(place.id, next, { planUntil: 0, previousPlan: view.plan });
    count += 1;
  });
  return count;
}

function resignPlacePlan(placeId) {
  savePlacePlan(placeId, "calle", { planUntil: 0 });
}

function planPriceLabel(plan, yearly) {
  if (!plan.price) return "Gratis";
  const amount = yearly ? plan.yearly : plan.price;
  return `${money(amount)}${yearly ? " / año" : " / mes"}`;
}

function planCountLabel(value, one, many) {
  if (!value || value >= 99) return "Ilimitados";
  return `${value} ${value === 1 ? one : many}`;
}

function planLimitRows(plan) {
  return [
    ["Precio mensual", planPriceLabel(plan)],
    ["Precio anual", plan.yearly ? `${money(plan.yearly)} · 10 meses` : "Gratis"],
    ["Comisión TurnoYa", `${plan.commission}% · la seña va a tu Mercado Pago`],
    ["Sucursales", planCountLabel(plan.branches, "sucursal", "sucursales")],
    ["Personas en el backoffice", planCountLabel(plan.staff, "usuario", "usuarios")],
    ["Servicios", planCountLabel(plan.services, "servicio", "servicios")],
    ["Cupones", planCountLabel(plan.coupons, "cupón", "cupones")],
    ["Turnos confirmados / mes", plan.bookings ? `${plan.bookings} (después pide Barrio)` : "Ilimitados"],
    ["Avisos WhatsApp Cloud / mes", plan.wa >= 999 ? "Ilimitados en la práctica" : String(plan.wa)],
  ];
}

function planIncludeRows(plan) {
  const yes = [
    "Pin en el mapa de tu ciudad",
    "Ficha pública en turnoya.com/tu-local",
    "Calendario propio, seña y hold de 15 minutos",
    "Arrepentimiento Ley 24.240 (10 días si el servicio no se prestó)",
    "Cancelación según la política del local",
    "Cómo llegar en vivo (Google / Waze)",
    "Soporte WhatsApp y mail del local",
    "0% de comisión de TurnoYa",
  ];
  if (plan.banner) yes.push("Landing con foto y marca del local");
  if (plan.waitlist) yes.push("Lista de espera: el primero de la cola tiene 10 minutos");
  if (plan.huecos) yes.push("Huecos del día en el mapa cuando se libera un turno");
  if (plan.texts) yes.push("Elegís qué reseñas se leen en la ficha (no las estrellas)");
  if (plan.featured) yes.push("1 Destacado incluido: pin dorado en 1 ciudad + 1 rubro");
  if (plan.domain) yes.push("URL de marca");
  if (plan.id === "red") yes.push("Multi-ciudad y trato directo con Ops");
  return yes;
}

function planMissingRows(plan) {
  const no = [];
  if (!plan.waitlist) no.push("Lista de espera");
  if (!plan.huecos) no.push("Huecos del día en el mapa");
  if (!plan.banner) no.push("Landing con foto");
  if (!plan.texts) no.push("Elegir textos de reseñas");
  if (!plan.featured) no.push("Pin dorado / Destacado (se compra aparte)");
  if (!plan.domain) no.push("URL de marca");
  if (plan.id !== "red") no.push("Trato directo con Ops y multi-ciudad");
  no.push("Patrocinado (slot fijo arriba) · extra $18.900 / mes");
  return no;
}

function planMatrixRows() {
  return [
    ["Precio / mes", (plan) => planPriceLabel(plan)],
    ["Anual (10 meses)", (plan) => (plan.yearly ? money(plan.yearly) : "—")],
    ["Comisión", (plan) => `${plan.commission}%`],
    ["Sucursales", (plan) => planCountLabel(plan.branches, "sucursal", "sucursales")],
    ["Backoffice", (plan) => planCountLabel(plan.staff, "usuario", "usuarios")],
    ["Servicios", (plan) => planCountLabel(plan.services, "servicio", "servicios")],
    ["Cupones", (plan) => planCountLabel(plan.coupons, "cupón", "cupones")],
    ["Turnos / mes", (plan) => (plan.bookings ? String(plan.bookings) : "Ilimitados")],
    ["WhatsApp / mes", (plan) => (plan.wa >= 999 ? "Ilimitados" : String(plan.wa))],
    ["Lista de espera", (plan) => (plan.waitlist ? "Sí" : "No")],
    ["Huecos del día", (plan) => (plan.huecos ? "Sí" : "No")],
    ["Landing con foto", (plan) => (plan.banner ? "Sí" : "No")],
    ["Textos de reseñas", (plan) => (plan.texts ? "Sí" : "No")],
    ["Destacado incluido", (plan) => (plan.featured ? "1 ciudad + 1 rubro" : "No")],
    ["URL de marca", (plan) => (plan.domain ? "Sí" : "No")],
    ["Multi-ciudad / Ops", (plan) => (plan.id === "red" ? "Sí" : "No")],
  ];
}

function planUpgradeHref(placeId, feature) {
  return `./bo-plan.html?id=${placeId}${feature ? `&need=${feature}` : ""}`;
}

function monthBookings(placeId) {
  const now = new Date();
  const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  return bookedSlots().filter((row) => row.placeId === placeId && String(row.slot || "") >= start).length;
}

function planCapReached(placeId) {
  const cap = planLimit(placeId, "bookings");
  if (!cap) return false;
  return monthBookings(placeId) >= cap;
}
