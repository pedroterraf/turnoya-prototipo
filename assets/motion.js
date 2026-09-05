import { animate, stagger } from "https://cdn.jsdelivr.net/npm/motion@12.23.24/+esm";

const EASE_OUT = [0.23, 1, 0.32, 1];
const EASE_ENTER = [0.16, 1, 0.3, 1];
const EASE_DRAWER = [0.32, 0.72, 0, 1];
const ROUTE_LEAVE_MS = 220;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function nodesOf(selector, root = document) {
  return [...root.querySelectorAll(selector)].filter((node) => !node.closest(".leaflet-container"));
}

function markPlayed(targets) {
  targets.forEach((node) => {
    node.dataset.motionPlayed = "1";
  });
}

function rise(targets, delayStep = 0.045, duration = 0.42) {
  if (reduced || !targets.length) return;
  markPlayed(targets);
  animate(
    targets,
    { opacity: [0, 1], y: [14, 0] },
    { duration, ease: EASE_OUT, delay: stagger(delayStep) },
  );
}

function bump(el) {
  if (!el) return "";
  const stamp = String((Number(el.dataset.motionStamp) || 0) + 1);
  el.dataset.motionStamp = stamp;
  return stamp;
}

async function exit(el, keyframes, options) {
  if (!el || reduced) return;
  el.classList.add("is-exiting");
  el.dataset.motion = "exit";
  try {
    await animate(el, keyframes, options);
  } finally {
    el.classList.remove("is-exiting");
    delete el.dataset.motion;
  }
}

async function hide(el, keyframes, options) {
  if (!el || el.hidden) return;
  if (reduced) {
    el.hidden = true;
    return;
  }
  const stamp = bump(el);
  await exit(el, keyframes, options);
  if (el.dataset.motionStamp !== stamp) return;
  el.hidden = true;
  el.style.opacity = "";
  el.style.transform = "";
  el.style.filter = "";
}

async function show(el, keyframes, options) {
  if (!el) return;
  bump(el);
  el.hidden = false;
  el.classList.remove("is-exiting");
  if (reduced) return;
  await animate(el, keyframes, options);
}

function bootPage() {
  if (reduced) return;
  const done = document.querySelector(".auth-card.is-done");
  if (done) {
    markPlayed([done]);
    animate(
      done,
      { opacity: [0, 1], scale: [0.96, 1], y: [10, 0] },
      { type: "spring", bounce: 0.32, duration: 0.62 },
    );
  } else {
    rise(
      nodesOf(
        ".ticket, .auth-card, .store-hero-copy, .mp-card, .sell-copy, .ficha-hero, .turno-head, .page-head, .bo-head, .profile-card",
      ),
    );
  }
  rise(nodesOf(".chip"), 0.028, 0.3);
  rise(
    nodesOf(
      ".place-card, .reco-card, .service-card, .notice, .only-card, .ops-stat, .quote, .plan-card, .compare-wrap, .turno-card, .agenda-card, .pick-card, .bo-svc-card, .caja-panel, .ops-card, .ficha-wa",
    ),
    0.04,
    0.4,
  );
}

function watchDrawer() {
  const drawer = document.getElementById("drawer");
  if (!drawer) return;
  const observer = new MutationObserver(() => {
    if (drawer.hidden || reduced || drawer.dataset.motion === "exit") return;
    animate(drawer, { opacity: [0, 1], y: [22, 0] }, { duration: 0.38, ease: EASE_DRAWER });
  });
  observer.observe(drawer, { attributes: true, attributeFilter: ["hidden"] });
}

function watchPick() {
  const root = document.getElementById("calendar") || document.querySelector(".tg");
  if (!root) return;
  const observer = new MutationObserver(() => {
    const pick = root.querySelector(".tg-event.is-pick");
    if (!pick || reduced || pick.dataset.motionPlayed) return;
    pick.dataset.motionPlayed = "1";
    animate(pick, { scale: [0.96, 1], opacity: [0.7, 1] }, { duration: 0.22, ease: EASE_OUT });
  });
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
}

function watchBell() {
  const badge = document.querySelector(".nav-unread");
  if (!badge || reduced) return;
  animate(badge, { scale: [0.7, 1] }, { type: "spring", bounce: 0.45, duration: 0.45 });
}

function watchLateCards() {
  const host = document.querySelector(".turno-list, .notice-list");
  if (!host) return;
  const selector = ".turno-card, .notice";
  const observer = new MutationObserver((records) => {
    const fresh = [];
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches(selector)) fresh.push(node);
        fresh.push(...nodesOf(selector, node));
      });
    });
    const unique = [...new Set(fresh)].filter((node) => !node.dataset.motionPlayed);
    if (unique.length) rise(unique, 0.04, 0.36);
  });
  observer.observe(host, { childList: true, subtree: true });
}

function playTourIn(tour) {
  if (reduced || tour.dataset.motionPlayed) return;
  tour.dataset.motionPlayed = "1";
  const card = tour.querySelector(".app-tour-card");
  animate(tour, { opacity: [0, 1] }, { duration: 0.28, ease: EASE_OUT });
  if (card) {
    animate(card, { opacity: [0, 1], y: [16, 0] }, { duration: 0.4, ease: EASE_ENTER });
  }
}

function watchTour() {
  const existing = document.querySelector(".app-tour");
  if (existing) playTourIn(existing);
  const observer = new MutationObserver(() => {
    const tour = document.querySelector(".app-tour");
    if (tour) playTourIn(tour);
  });
  observer.observe(document.body, { childList: true });
}

function sameDocument(url) {
  return url.origin === location.origin && url.pathname === location.pathname && url.search === location.search;
}

function shouldAnimateRoute(event, anchor) {
  if (!anchor || event.defaultPrevented) return false;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.closest(".leaflet-container")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
    return false;
  }
  let url;
  try {
    url = new URL(anchor.href, location.href);
  } catch {
    return false;
  }
  if (url.origin !== location.origin) return false;
  if (sameDocument(url)) return false;
  return true;
}

function supportsMpaViewTransitions() {
  if (typeof document.startViewTransition !== "function") return false;
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync("@view-transition { navigation: auto; }");
    return sheet.cssRules.length > 0;
  } catch {
    return false;
  }
}

function bindRoutes() {
  if (reduced || supportsMpaViewTransitions()) return;
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[href]");
    if (!shouldAnimateRoute(event, anchor)) return;
    event.preventDefault();
    document.documentElement.classList.add("is-leaving");
    window.setTimeout(() => {
      location.href = anchor.href;
    }, ROUTE_LEAVE_MS);
  });
  window.addEventListener("pageshow", () => {
    document.documentElement.classList.remove("is-leaving");
  });
}

window.turnoyaMotion = {
  show,
  hide,
  exit,
  bump,
  reduced,
  easeOut: EASE_OUT,
  easeEnter: EASE_ENTER,
  easeDrawer: EASE_DRAWER,
};

function start() {
  document.documentElement.classList.add("motion-on");
  bootPage();
  watchDrawer();
  watchPick();
  watchBell();
  watchLateCards();
  watchTour();
  bindRoutes();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
