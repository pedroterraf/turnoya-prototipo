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
    {
      id: "o-pedro",
      turnoId: "ty-seed-oasis-older",
      email: "pedroterraf@gmail.com",
      author: "Pedro T.",
      stars: 4.5,
      text: "Muy bien el masaje. Vuelvo.",
      shownByBusiness: true,
    },
  ],
  norte: [
    { id: "n1", author: "Sofía G.", stars: 5, text: "La kinesióloga explicó todo. Volví a caminar al toque.", shownByBusiness: true },
    { id: "n2", author: "Julián C.", stars: 4, text: "Turno puntual. La sala es chica pero atienden bárbaro.", shownByBusiness: true },
    { id: "n3", author: "Elena V.", stars: 2, text: "Me reprogramaron dos veces.", shownByBusiness: false },
    { id: "n4", author: "Martín L.", stars: 5, text: "Me solucionaron el dolor de espalda en tres sesiones.", shownByBusiness: true },
    { id: "n5", author: "Valentina R.", stars: 5, text: "Súper claras con los ejercicios para hacer en casa.", shownByBusiness: true },
    { id: "n6", author: "Diego P.", stars: 4, text: "Buen trato y horarios cómodos. Vuelvo seguro.", shownByBusiness: true },
    { id: "n7", author: "Carolina M.", stars: 5, text: "Después del torcedura volví a correr sin miedo.", shownByBusiness: true },
    { id: "n8", author: "Facundo S.", stars: 5, text: "Reservé online en un toque. Cero vueltas.", shownByBusiness: true },
    { id: "n9", author: "Luciana T.", stars: 4, text: "Lugar limpio, profesional y cerca del centro.", shownByBusiness: true },
    { id: "n10", author: "Agustín B.", stars: 5, text: "Me explicaron cada paso. Se nota la experiencia.", shownByBusiness: true },
    { id: "n11", author: "Paula N.", stars: 5, text: "Ideal post cirugía. Seguimiento impecable.", shownByBusiness: true },
    { id: "n12", author: "Romina K.", stars: 4, text: "La seña por MP fue fácil y el turno puntual.", shownByBusiness: true },
    { id: "n13", author: "Nicolás H.", stars: 5, text: "Pasé de no poder sentarme a laburar normal.", shownByBusiness: true },
    { id: "n14", author: "Florencia A.", stars: 5, text: "Ambiente tranquilo. Salís con otra cabeza.", shownByBusiness: true },
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
  const seed = JSON.parse(JSON.stringify(REVIEW_SEED));
  const raw = memoryGet("turnoya-reviews");
  if (!raw) return seed;
  try {
    const stored = JSON.parse(raw);
    Object.keys(seed).forEach((placeId) => {
      const have = new Set((stored[placeId] || []).map((row) => row.id));
      stored[placeId] = [...(stored[placeId] || []), ...seed[placeId].filter((row) => !have.has(row.id))];
    });
    return stored;
  } catch {
    return seed;
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
  const list = reviewsFor(placeId).filter((review) => Number(review.stars) > 0);
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function reviewForTurno(turnoId) {
  return (
    Object.values(loadReviewBook())
      .flat()
      .filter(Boolean)
      .find((review) => review.turnoId === turnoId) || null
  );
}

function alreadyReviewedTurno(turnoId) {
  return Boolean(reviewForTurno(turnoId));
}

function lockedReviewHtml(review) {
  const stars = Array.from({ length: STAR_MAX }, (_, i) => {
    const index = i + 1;
    return `<span class="star-pick" data-fill="${starFillOf(index, review.stars)}">
      <span class="star-pick-glyph" aria-hidden="true">★</span>
    </span>`;
  }).join("");
  return `<div class="star-picker is-locked">
    <p class="meta">${starValueLabel(review.stars)} · ya calificaste</p>
    <div class="star-picker-row" aria-hidden="true">${stars}</div>
    ${review.text ? `<p class="review-locked-text">${escapeHtml(review.text)}</p>` : ""}
  </div>`;
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
  if (typeof trackPixel === "function") {
    trackPixel(turno.placeId, "Rate", { turnoId: turno.id, stars });
  }
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

const STAR_MIN = 1;
const STAR_MAX = 5;
const STAR_STEP = 0.5;

function clampStarValue(value) {
  const raw = Math.round(Number(value) / STAR_STEP) * STAR_STEP;
  if (!Number.isFinite(raw)) return 0;
  return Math.min(STAR_MAX, Math.max(STAR_MIN, raw));
}

function starFillOf(index, value) {
  if (value >= index) return "full";
  if (value >= index - STAR_STEP) return "half";
  return "empty";
}

function starValueLabel(value) {
  if (!value) return "Elegí de 1 a 5";
  const label = Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
  return value === 1 ? "1 estrella" : `${label} estrellas`;
}

function starPickerHtml() {
  const stars = Array.from({ length: STAR_MAX }, (_, i) => {
    const index = i + 1;
    const left = clampStarValue(index - STAR_STEP);
    const right = index;
    return `<span class="star-pick" data-star="${index}" data-fill="empty">
      <button class="star-pick-half" type="button" data-stars="${left}" aria-label="${starValueLabel(left)}"></button>
      <button class="star-pick-half" type="button" data-stars="${right}" aria-label="${starValueLabel(right)}"></button>
      <span class="star-pick-glyph" aria-hidden="true">★</span>
    </span>`;
  }).join("");
  return `<div class="star-picker" data-star-picker>
    <p class="meta" data-star-label>${starValueLabel(0)}</p>
    <div class="star-picker-row" role="radiogroup" aria-label="Estrellas">${stars}</div>
    <input type="hidden" name="stars" value="" />
  </div>`;
}

function paintStarPicker(root, value) {
  const score = value ? clampStarValue(value) : 0;
  root.querySelectorAll(".star-pick").forEach((node) => {
    node.dataset.fill = starFillOf(Number(node.dataset.star), score);
  });
  const label = root.querySelector("[data-star-label]");
  if (label) label.textContent = starValueLabel(score);
  const input = root.querySelector('input[name="stars"]');
  if (input) input.value = score || "";
}

function bindStarPicker(form) {
  const root = form.querySelector("[data-star-picker]");
  const comment = form.querySelector("[data-review-comment]");
  if (!root) return;
  root.querySelectorAll("[data-stars]").forEach((button) => {
    button.addEventListener("click", () => {
      paintStarPicker(root, button.dataset.stars);
      if (comment) comment.hidden = false;
    });
  });
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
