const CITIES = {
  cordoba: { label: "Córdoba", lat: -31.4201, lng: -64.1888 },
  caba: { label: "CABA", lat: -34.6037, lng: -58.3816 },
  rosario: { label: "Rosario", lat: -32.9442, lng: -60.6505 },
  mendoza: { label: "Mendoza", lat: -32.8895, lng: -68.8458 },
  tucuman: { label: "Tucumán", lat: -26.8083, lng: -65.2176 },
};

const CATEGORIES = [
  { id: "todos", label: "Todos" },
  { id: "belleza", label: "Belleza" },
  { id: "salud", label: "Salud" },
  { id: "fitness", label: "Fitness" },
  { id: "mascotas", label: "Mascotas" },
  { id: "oficios", label: "Oficios" },
];

const PLACES = [
  {
    id: "oasis",
    name: "Oasis MultiSpa",
    slug: "oasis",
    category: "belleza",
    service: "Masaje relajante",
    city: "cordoba",
    lat: -31.416,
    lng: -64.183,
    km: 0.8,
    featured: true,
    nextSlot: "Hoy 16:30",
  },
  {
    id: "norte",
    name: "Consultorio Norte",
    slug: "consultorio-norte",
    category: "salud",
    service: "Kinesiología",
    city: "cordoba",
    lat: -31.408,
    lng: -64.196,
    km: 1.4,
    featured: true,
    nextSlot: "Mañana 09:00",
  },
  {
    id: "paws",
    name: "Paws Córdoba",
    slug: "paws",
    category: "mascotas",
    service: "Baño y corte",
    city: "cordoba",
    lat: -31.428,
    lng: -64.175,
    km: 2.1,
    featured: false,
    nextSlot: "Hoy 18:00",
  },
  {
    id: "estudio",
    name: "Estudio López",
    slug: "estudio-lopez",
    category: "oficios",
    service: "Consulta contable",
    city: "cordoba",
    lat: -31.433,
    lng: -64.19,
    km: 2.6,
    featured: false,
    nextSlot: "Mié 11:00",
  },
  {
    id: "box",
    name: "Box 9 Training",
    slug: "box-9",
    category: "fitness",
    service: "Entrenamiento personal",
    city: "cordoba",
    lat: -31.402,
    lng: -64.17,
    km: 3.2,
    featured: false,
    nextSlot: "Hoy 19:15",
  },
  {
    id: "corte",
    name: "Corte Barrio Güemes",
    slug: "corte-guemes",
    category: "belleza",
    service: "Corte y barba",
    city: "cordoba",
    lat: -31.425,
    lng: -64.188,
    km: 1.1,
    featured: false,
    nextSlot: "Hoy 17:00",
  },
  {
    id: "palermo",
    name: "Clínica Palermo Sur",
    slug: "palermo-sur",
    category: "salud",
    service: "Odontología",
    city: "caba",
    lat: -34.588,
    lng: -58.43,
    km: 1.2,
    featured: true,
    nextSlot: "Hoy 15:00",
  },
  {
    id: "recoleta",
    name: "Atelier Recoleta",
    slug: "atelier-recoleta",
    category: "belleza",
    service: "Color y brushing",
    city: "caba",
    lat: -34.5889,
    lng: -58.392,
    km: 0.9,
    featured: false,
    nextSlot: "Mañana 10:30",
  },
  {
    id: "rosario-vet",
    name: "Vet Pichincha",
    slug: "vet-pichincha",
    category: "mascotas",
    service: "Control general",
    city: "rosario",
    lat: -32.936,
    lng: -60.655,
    km: 1.7,
    featured: true,
    nextSlot: "Jue 12:00",
  },
  {
    id: "mza-yoga",
    name: "Sala Andes",
    slug: "sala-andes",
    category: "fitness",
    service: "Yoga",
    city: "mendoza",
    lat: -32.89,
    lng: -68.847,
    km: 0.6,
    featured: false,
    nextSlot: "Hoy 20:00",
  },
  {
    id: "tuc-abog",
    name: "Estudio Mercado",
    slug: "estudio-mercado",
    category: "oficios",
    service: "Consulta legal",
    city: "tucuman",
    lat: -26.824,
    lng: -65.222,
    km: 1.5,
    featured: false,
    nextSlot: "Vie 16:00",
  },
];

const state = {
  city: "cordoba",
  query: "",
  category: "todos",
  selectedId: null,
  userLat: null,
  userLng: null,
};

let map;
let markers = [];
let youMarker = null;

function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return earth * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function nearestCity(lat, lng) {
  return Object.entries(CITIES).reduce(
    (best, [id, city]) => {
      const km = distanceKm(lat, lng, city.lat, city.lng);
      if (!best || km < best.km) return { id, km };
      return best;
    },
    null,
  ).id;
}

function setLocationStatus(text) {
  const node = document.getElementById("location-status");
  if (node) node.textContent = text;
}

function matchesPlace(place) {
  if (place.city !== state.city) return false;
  if (state.category !== "todos" && place.category !== state.category) return false;
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  return [place.name, place.service, place.category].some((value) =>
    value.toLowerCase().includes(q),
  );
}

const PIN_OFFSETS = [
  [0.008, 0.006],
  [-0.006, 0.01],
  [0.01, -0.007],
  [-0.009, -0.005],
  [0.004, 0.012],
  [-0.012, 0.003],
];

function placeCoords(place, index) {
  if (state.userLat == null) {
    return { lat: place.lat, lng: place.lng };
  }
  const km = distanceKm(state.userLat, state.userLng, place.lat, place.lng);
  if (km <= 18) {
    return { lat: place.lat, lng: place.lng };
  }
  const [dLat, dLng] = PIN_OFFSETS[index % PIN_OFFSETS.length];
  return { lat: state.userLat + dLat, lng: state.userLng + dLng };
}

function withDistance(places) {
  return places
    .map((place, index) => {
      const coords = placeCoords(place, index);
      const km =
        state.userLat == null
          ? place.km
          : Number(
              distanceKm(state.userLat, state.userLng, coords.lat, coords.lng).toFixed(1),
            );
      return { ...place, ...coords, km };
    })
    .sort((a, b) => a.km - b.km);
}

function extraPlaces() {
  try {
    return JSON.parse(memoryGet("turnoya-places") ?? "[]");
  } catch {
    return [];
  }
}

function allPlaces() {
  return [...PLACES, ...extraPlaces()];
}

function saveExtraPlace(place) {
  const list = extraPlaces().filter((row) => row.id !== place.id);
  list.push(place);
  memorySet("turnoya-places", JSON.stringify(list));
}

function loadOverrides() {
  try {
    return JSON.parse(memoryGet("turnoya-overrides") ?? "{}");
  } catch {
    return {};
  }
}

function saveOverrides(map) {
  memorySet("turnoya-overrides", JSON.stringify(map));
}

function placeView(place) {
  const extra = extraPlaces().find((row) => row.id === place.id);
  const base = extra ? { ...place, ...extra } : place;
  const override = loadOverrides()[place.id] ?? {};
  return {
    ...base,
    featured: override.featured ?? base.featured,
    suspended: override.suspended === true,
    status: override.status ?? base.status ?? "live",
    plan: override.plan ?? base.plan ?? "base",
    nota: override.nota ?? base.nota ?? "",
  };
}

function patchPlaceView(placeId, patch) {
  const overrides = loadOverrides();
  overrides[placeId] = { ...overrides[placeId], ...patch };
  saveOverrides(overrides);
  const extra = extraPlaces().find((row) => row.id === placeId);
  if (extra) saveExtraPlace({ ...extra, ...patch });
}

function publicPlaces() {
  return allPlaces()
    .map(placeView)
    .filter((place) => place.status === "live" && !place.suspended);
}

function filteredPlaces() {
  return withDistance(publicPlaces().filter(matchesPlace));
}

function pinIcon(place) {
  const kind = place.featured ? "featured" : "organic";
  const { average, count } = ratingOf(place.id);
  const score = count ? average.toFixed(1) : "–";
  return L.divIcon({
    className: "place-pin",
    html: `<span class="pin-wrap pin-${kind}"><span class="pin-pulse"></span><span class="pin"></span><span class="pin-score">★ ${score}</span></span>`,
    iconSize: [52, 70],
    iconAnchor: [26, 66],
  });
}

function youIcon() {
  return L.divIcon({
    className: "you-pin",
    html: '<span class="you-wrap"><span class="you-pulse"></span><span class="you-dot"></span></span>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function nextSlotOf(place) {
  if (typeof placeServices !== "function" || typeof freeSlots !== "function") {
    return place.nextSlot || "Ver horarios";
  }
  const service = placeServices(place)[0];
  const first = freeSlots(place.id, service)[0];
  if (!first) return "Sin horarios";
  const [date, time] = first.split("T");
  const today = typeof dayKey === "function" ? dayKey(new Date()) : "";
  const label = date === today ? "Hoy" : date.slice(5).replace("-", "/");
  return `${label} ${time}`;
}

function renderFilters() {
  const root = document.getElementById("filters");
  root.innerHTML = CATEGORIES.map(
    (cat) =>
      `<button class="chip" type="button" data-category="${cat.id}" aria-pressed="${
        state.category === cat.id
      }">${cat.label}</button>`,
  ).join("");
}

function renderReco(places) {
  const featured = places.filter((place) => place.featured);
  const root = document.getElementById("reco-track");
  const wrap = document.getElementById("reco");
  if (!featured.length) {
    wrap.hidden = true;
    return;
  }
  wrap.hidden = false;
  root.innerHTML = featured
    .map(
      (place) => `
      <button class="reco-card" type="button" data-id="${place.id}">
        <span class="badge">Destacado</span>
        <strong>${place.name}</strong>
        ${starsMarkup(ratingOf(place.id).average, ratingOf(place.id).count)}
        <span class="meta">${place.service} · ${place.km} km</span>
      </button>`,
    )
    .join("");
}

function renderResults(places) {
  const organic = places.filter((place) => !place.featured);
  const sponsored = places.find((place) => place.featured);
  const list = sponsored ? [sponsored, ...organic] : organic;
  const root = document.getElementById("results-list");
  const count = document.getElementById("results-count");
  count.textContent = `${places.length} cerca en ${CITIES[state.city].label}`;
  if (!list.length) {
    root.innerHTML =
      "<p class=\"meta\">No hay negocios con eso en esta ciudad. Probá otro servicio o mirá el mapa.</p>";
    return;
  }
  root.innerHTML = list
    .map((place, index) => {
      const sponsoredSlot = index === 0 && place.featured;
      return `
      <button class="place-card${sponsoredSlot ? " sponsored" : ""}" type="button" data-id="${place.id}">
        <span class="thumb" aria-hidden="true">${place.name.slice(0, 1)}</span>
        <span>
          ${sponsoredSlot ? '<span class="badge">Patrocinado</span>' : place.featured ? '<span class="badge">Destacado</span>' : `<span class="badge badge-soft">${place.category}</span>`}
          <strong>${place.name}</strong>
          ${starsMarkup(ratingOf(place.id).average, ratingOf(place.id).count)}
          <span class="meta">${place.service} · a ${place.km} km · ${nextSlotOf(place)}</span>
        </span>
      </button>`;
    })
    .join("");
}

function renderMap(places) {
  const city = CITIES[state.city];
  const centerLat = state.userLat ?? city.lat;
  const centerLng = state.userLng ?? city.lng;
  map.setView([centerLat, centerLng], 14);
  markers.forEach((marker) => marker.remove());
  markers = places.map((place) => {
    const marker = L.marker([place.lat, place.lng], {
      icon: pinIcon(place),
    }).addTo(map);
    marker.on("click", () => selectPlace(place.id));
    return marker;
  });
  if (youMarker) {
    youMarker.remove();
    youMarker = null;
  }
  if (state.userLat != null) {
    youMarker = L.marker([state.userLat, state.userLng], { icon: youIcon() }).addTo(map);
  }
  map.invalidateSize();
}

function selectPlace(id) {
  const place = filteredPlaces().find((item) => item.id === id);
  if (!place) return;
  state.selectedId = id;
  const drawer = document.getElementById("drawer");
  drawer.hidden = false;
  const rating = ratingOf(place.id);
  const href = `./ficha.html?id=${place.id}`;
  drawer.innerHTML = `
    <button class="drawer-close" type="button" id="close-drawer" aria-label="Cerrar">×</button>
    <a class="drawer-link" href="${href}">
      ${place.featured ? '<span class="badge">Destacado</span>' : ""}
      <h3>${place.name}</h3>
      ${starsMarkup(rating.average, rating.count)}
      <p class="meta">${place.service} · ${place.km} km · próximo ${nextSlotOf(place)}</p>
      <p class="meta">turnoya.com/${place.slug}</p>
      <span class="btn btn-enamel">Ir al negocio</span>
    </a>
  `;
  map.panTo([place.lat, place.lng]);
}

function render() {
  const places = filteredPlaces();
  renderFilters();
  renderReco(places);
  renderResults(places);
  renderMap(places);
}

function applyCity(cityId) {
  state.city = cityId;
  document.getElementById("city").value = cityId;
  render();
}

function requestLocation() {
  if (!navigator.geolocation) {
    setLocationStatus("Tu navegador no comparte ubicación. Elegí la ciudad a mano.");
    return;
  }

  setLocationStatus("Pedimos tu ubicación para mostrarte lo más cercano.");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      state.userLat = position.coords.latitude;
      state.userLng = position.coords.longitude;
      const cityId = nearestCity(state.userLat, state.userLng);
      setLocationStatus(`Usando tu ubicación · ${CITIES[cityId].label}`);
      applyCity(cityId);
    },
    () => {
      setLocationStatus("No pudimos usar tu ubicación. Elegí la ciudad a mano.");
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
  );
}

function boot() {
  const city = CITIES[state.city];
  map = L.map("map", { zoomControl: false, attributionControl: false }).setView(
    [city.lat, city.lng],
    13,
  );
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
  }).addTo(map);
  L.control.zoom({ position: "topright" }).addTo(map);
  requestAnimationFrame(() => map.invalidateSize());

  document.getElementById("city").value = state.city;
  document.getElementById("city").addEventListener("change", (event) => {
    state.city = event.target.value;
    render();
  });
  document.getElementById("query").addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });
  document.getElementById("filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    render();
  });
  document.getElementById("search-btn").addEventListener("click", () => {
    document.getElementById("results-count").scrollIntoView({ behavior: "smooth" });
  });
  document.getElementById("reco-track").addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (button) location.href = `./ficha.html?id=${button.dataset.id}`;
  });
  document.getElementById("results-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (button) location.href = `./ficha.html?id=${button.dataset.id}`;
  });
  document.getElementById("drawer").addEventListener("click", (event) => {
    if (event.target.id === "close-drawer") {
      document.getElementById("drawer").hidden = true;
    }
  });

  render();
  requestLocation();
}

function startMarket() {
  if (document.getElementById("map")) boot();
}
