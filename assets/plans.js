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
  },
};

const PLAN_ADDONS = {
  destacado: {
    id: "destacado",
    name: "Destacado",
    price: 9900,
    pitch: "Pin dorado y abre la lista. Se vende por ciudad + rubro.",
  },
  patrocinado: {
    id: "patrocinado",
    name: "Patrocinado",
    price: 18900,
    pitch: "Un slot fijo arriba de la lista. Siempre dice Patrocinado.",
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
  const patch = { plan: plan.id, ...(extra || {}) };
  if (plan.featured) patch.featured = true;
  if (plan.id === "calle") patch.featured = false;
  if (typeof patchPlaceView === "function") patchPlaceView(placeId, patch);
}

function planPriceLabel(plan, yearly) {
  if (!plan.price) return "Gratis";
  const amount = yearly ? plan.yearly : plan.price;
  return `${money(amount)}${yearly ? " / año" : " / mes"}`;
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
