import { animate, stagger } from "https://cdn.jsdelivr.net/npm/motion@12.23.24/+esm";

const EASE_OUT = [0.23, 1, 0.32, 1];
const EASE_DRAWER = [0.32, 0.72, 0, 1];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function nodesOf(selector, root = document) {
  return [...root.querySelectorAll(selector)].filter((node) => !node.closest(".leaflet-container"));
}

function rise(targets, delayStep = 0.045, duration = 0.42) {
  if (reduced || !targets.length) return;
  animate(
    targets,
    { opacity: [0, 1], y: [14, 0] },
    { duration, ease: EASE_OUT, delay: stagger(delayStep) },
  );
}

function bootPage() {
  if (reduced) return;
  const done = document.querySelector(".auth-card.is-done");
  if (done) {
    animate(
      done,
      { opacity: [0, 1], scale: [0.96, 1], y: [10, 0] },
      { type: "spring", bounce: 0.32, duration: 0.62 },
    );
  } else {
    rise(nodesOf(".ticket, .auth-card, .store-hero-copy, .mp-card, .sell-copy"));
  }
  rise(nodesOf(".chip"), 0.028, 0.3);
  rise(
    nodesOf(
      ".place-card, .reco-card, .service-card, .notice, .only-card, .ops-stat, .quote, .plan-card, .compare-wrap",
    ),
    0.04,
    0.4,
  );
}

function watchDrawer() {
  const drawer = document.getElementById("drawer");
  if (!drawer) return;
  const observer = new MutationObserver(() => {
    if (drawer.hidden || reduced) return;
    animate(drawer, { opacity: [0, 1], y: [20, 0] }, { duration: 0.38, ease: EASE_DRAWER });
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

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("motion-on");
  bootPage();
  watchDrawer();
  watchPick();
  watchBell();
});
