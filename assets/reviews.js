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
  const raw = sessionStorage.getItem("turnoya-reviews");
  if (!raw) return structuredClone(REVIEW_SEED);
  try {
    return JSON.parse(raw);
  } catch {
    return structuredClone(REVIEW_SEED);
  }
}

function saveReviewBook(book) {
  sessionStorage.setItem("turnoya-reviews", JSON.stringify(book));
}

function reviewsFor(placeId) {
  return loadReviewBook()[placeId] ?? [];
}

function ratingOf(placeId) {
  const list = reviewsFor(placeId);
  if (!list.length) return { average: 0, count: 0 };
  const sum = list.reduce((acc, review) => acc + review.stars, 0);
  return { average: Math.round((sum / list.length) * 10) / 10, count: list.length };
}

function publishedQuotes(placeId) {
  return reviewsFor(placeId).filter((review) => review.shownByBusiness && review.text);
}

function reviewAuthor(user) {
  return `${user.nombre} ${user.apellido.charAt(0)}.`;
}

function alreadyReviewedTurno(turnoId) {
  return Object.values(loadReviewBook())
    .flat()
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

function starsMarkup(average, count) {
  const full = Math.round(average);
  const glyphs = Array.from({ length: 5 }, (_, i) => (i < full ? "★" : "☆")).join("");
  if (!count) return `<span class="stars" aria-label="Sin calificaciones">☆☆☆☆☆</span>`;
  return `<span class="stars" aria-label="${average} de 5">${glyphs} <b>${average}</b> <em>(${count})</em></span>`;
}
