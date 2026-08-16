function memoryGet(key) {
  if (localStorage.getItem(key) == null) {
    const old = sessionStorage.getItem(key);
    if (old != null) localStorage.setItem(key, old);
  }
  return localStorage.getItem(key);
}

function memorySet(key, value) {
  localStorage.setItem(key, value);
}

function memoryRemove(key) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

const REVIEW_SEED = {
  oasis: [
    { id: "o1", author: "Lucía M.", stars: 5, text: "El masaje fue puntual y el lugar está impecable.", shownByBusiness: true },
    { id: "o2", author: "Diego R.", stars: 4, text: "Muy bien, un poco de espera en recepción.", shownByBusiness: false },
    { id: "o3", author: "Ana P.", stars: 5, text: "Salí otra. Ya saqué el próximo turno.", shownByBusiness: true },
    { id: "o4", author: "Marcos T.", stars: 3, text: "Bien el servicio, el estacionamiento es un lío.", shownByBusiness: false },
  ],
  norte: [
    { id: "n1", author: "Sofía G.", stars: 5, text: "La kinesióloga explicó todo. Volví a caminar al toque.", shownByBusiness: true },
    { id: "n2", author: "Julián C.", stars: 4, text: "Turno puntual. La sala es chica.", shownByBusiness: false },
    { id: "n3", author: "Elena V.", stars: 2, text: "Me reprogramaron dos veces.", shownByBusiness: false },
  ],
  paws: [
    { id: "p1", author: "Camila S.", stars: 5, text: "Mi perro salió feliz. Los tratan bien.", shownByBusiness: true },
    { id: "p2", author: "Nico A.", stars: 4, text: "Buen corte, un poco caro.", shownByBusiness: false },
  ],
  estudio: [
    { id: "e1", author: "Paula D.", stars: 5, text: "Me resolvieron el monotributo en una hora.", shownByBusiness: true },
    { id: "e2", author: "Leo F.", stars: 3, text: "Correctos, la espera fue larga.", shownByBusiness: false },
  ],
  box: [
    { id: "b1", author: "Rocío L.", stars: 5, text: "El trainer no te suelta. Se nota en dos semanas.", shownByBusiness: true },
    { id: "b2", author: "Tomás H.", stars: 4, text: "Buena energía, el aire a veces no da abasto.", shownByBusiness: false },
  ],
  corte: [
    { id: "c1", author: "Agus B.", stars: 4, text: "Corte prolijo, sin vueltas.", shownByBusiness: true },
    { id: "c2", author: "Mati Q.", stars: 5, text: "El de siempre. No cambio más.", shownByBusiness: true },
    { id: "c3", author: "Iña K.", stars: 2, text: "Me dejaron el flequillo raro.", shownByBusiness: false },
  ],
  palermo: [
    { id: "cl1", author: "Valen R.", stars: 5, text: "Limpio y sin dolor. Recomiendo.", shownByBusiness: true },
    { id: "cl2", author: "Flor N.", stars: 4, text: "Bien, tardan en dar turno.", shownByBusiness: false },
  ],
  recoleta: [
    { id: "r1", author: "Meli S.", stars: 5, text: "El color quedó exacto.", shownByBusiness: true },
    { id: "r2", author: "Caro J.", stars: 3, text: "Lindo lugar, me apuraron.", shownByBusiness: false },
  ],
  "rosario-vet": [
    { id: "v1", author: "Pato M.", stars: 5, text: "Atendieron a mi gato con calma.", shownByBusiness: true },
    { id: "v2", author: "Luli E.", stars: 4, text: "Buenos, un poco de espera.", shownByBusiness: false },
  ],
  "mza-yoga": [
    { id: "y1", author: "Inés P.", stars: 5, text: "La clase de las 20 es un respiro.", shownByBusiness: true },
  ],
  "tuc-abog": [
    { id: "a1", author: "Hugo C.", stars: 4, text: "Claros con los honorarios.", shownByBusiness: true },
    { id: "a2", author: "Nora B.", stars: 5, text: "Me sacaron un problema de encima.", shownByBusiness: true },
    { id: "a3", author: "Fede Z.", stars: 2, text: "Tardaron en contestar el mail.", shownByBusiness: false },
  ],
};

function loadReviewBook() {
  const raw = memoryGet("turnoya-reviews");
  if (!raw) return JSON.parse(JSON.stringify(REVIEW_SEED));
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(JSON.stringify(REVIEW_SEED));
  }
}

function saveReviewBook(book) {
  memorySet("turnoya-reviews", JSON.stringify(book));
}

function reviewsFor(placeId) {
  const book = loadReviewBook();
  if (!book || typeof book !== "object") return [];
  const list = book[placeId];
  return Array.isArray(list) ? list : [];
}

function ratingOf(placeId) {
  const list = reviewsFor(placeId).filter((review) => review.turnoId);
  if (!list.length) return { average: 0, count: 0 };
  const sum = list.reduce((acc, review) => acc + review.stars, 0);
  return { average: Math.round((sum / list.length) * 10) / 10, count: list.length };
}

function publishedQuotes(placeId) {
  return reviewsFor(placeId).filter((review) => review.shownByBusiness && review.text);
}

function reviewAuthor(user) {
  const last = String(user?.apellido || "?").charAt(0);
  return `${user?.nombre || "Cliente"} ${last}.`;
}

function alreadyReviewedTurno(turnoId) {
  return Object.values(loadReviewBook())
    .flat()
    .filter(Boolean)
    .some((review) => review.turnoId === turnoId);
}

function canReviewTurno(turno, user) {
  return Boolean(
    user &&
      turno &&
      turno.estado === "concretado" &&
      turno.email === user.email &&
      !alreadyReviewedTurno(turno.id),
  );
}

function addTurnoReview(turno, user, stars, text) {
  if (!canReviewTurno(turno, user)) return false;
  const book = loadReviewBook();
  const list = book[turno.placeId] ?? [];
  list.push({
    id: `new-${Date.now()}`,
    turnoId: turno.id,
    email: user.email,
    author: reviewAuthor(user),
    stars,
    text: String(text).trim(),
    shownByBusiness: false,
  });
  book[turno.placeId] = list;
  saveReviewBook(book);
  return true;
}

function setQuoteVisible(placeId, reviewId, visible) {
  const book = loadReviewBook();
  const review = (book[placeId] ?? []).find((item) => item.id === reviewId);
  if (!review) return;
  review.shownByBusiness = visible;
  saveReviewBook(book);
}

function reviewsHref(placeId) {
  return `./ficha.html?id=${placeId}#resenas`;
}

function starsMarkup(average, count, placeId) {
  const full = Math.round(average);
  const glyphs = Array.from({ length: 5 }, (_, i) => (i < full ? "★" : "☆")).join("");
  const inner = count
    ? `${glyphs} <b>${average}</b> <em>(${count})</em>`
    : "☆☆☆☆☆";
  const label = count ? `${average} de 5. Ver reseñas` : "Sin calificaciones. Ver reseñas";
  if (!placeId) {
    return `<span class="stars" aria-label="${label}">${inner}</span>`;
  }
  return `<a class="stars" href="${reviewsHref(placeId)}" aria-label="${label}" onclick="event.stopPropagation()">${inner}</a>`;
}
