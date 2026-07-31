/* -----------------------------------------
  Ship's Log Widget
  Rotates through a pool of pre-written space facts / mission-log
  entries with a typewriter reveal. No network calls.
 ---------------------------------------- */

(function () {
  const root = document.getElementById("ship-log");
  const toggle = document.getElementById("ship-log-toggle");
  const panel = document.getElementById("ship-log-panel");
  const entryEl = document.getElementById("ship-log-entry");
  const stardateEl = document.getElementById("ship-log-stardate");
  const nextBtn = document.getElementById("ship-log-next");

  if (!root || !toggle || !panel || !entryEl || !nextBtn) return;
  if (typeof SHIP_LOG_ENTRIES === "undefined" || !SHIP_LOG_ENTRIES.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ROTATE_MS = 14000;
  const TYPE_MS = 16;

  let deck = [];
  let deckIndex = 0;
  let typeTimer = null;
  let rotateTimer = null;

  function reshuffle() {
    deck = SHIP_LOG_ENTRIES.slice();
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    deckIndex = 0;
  }

  function stardate() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    const value = (now.getFullYear() - 2000) * 365.25 + dayOfYear + now.getHours() / 24;
    return value.toFixed(1);
  }

  function typeText(text) {
    clearTimeout(typeTimer);
    entryEl.textContent = "";

    if (prefersReducedMotion) {
      entryEl.textContent = text;
      return;
    }

    let i = 0;
    const step = () => {
      i += 1;
      entryEl.textContent = text.slice(0, i);
      if (i < text.length) {
        typeTimer = setTimeout(step, TYPE_MS);
      }
    };
    step();
  }

  function showNext() {
    if (deckIndex >= deck.length) reshuffle();
    const text = deck[deckIndex];
    deckIndex += 1;
    stardateEl.textContent = `STARDATE ${stardate()}`;
    typeText(text);
  }

  function scheduleRotation() {
    clearInterval(rotateTimer);
    rotateTimer = setInterval(() => {
      if (!panel.hidden) showNext();
    }, ROTATE_MS);
  }

  nextBtn.addEventListener("click", () => {
    showNext();
    scheduleRotation();
  });

  toggle.addEventListener("click", () => {
    const collapsed = panel.hidden;
    panel.hidden = !collapsed;
    toggle.setAttribute("aria-expanded", String(collapsed));
    root.classList.toggle("ship-log--open", collapsed);
    try {
      localStorage.setItem("shipLogCollapsed", collapsed ? "0" : "1");
    } catch (e) {
      /* localStorage unavailable, ignore */
    }
  });

  let startCollapsed = false;
  try {
    startCollapsed = localStorage.getItem("shipLogCollapsed") === "1";
  } catch (e) {
    /* localStorage unavailable, ignore */
  }

  if (startCollapsed) {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  } else {
    root.classList.add("ship-log--open");
    toggle.setAttribute("aria-expanded", "true");
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(rotateTimer);
    else scheduleRotation();
  });

  reshuffle();
  showNext();
  scheduleRotation();
})();
