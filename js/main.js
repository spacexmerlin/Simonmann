// Mobile-Navigation
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const pill = document.querySelector(".nav-pill");
  if (toggle && pill) {
    toggle.addEventListener("click", () => {
      pill.classList.toggle("open");
      toggle.textContent = pill.classList.contains("open") ? "✕" : "☰";
    });
  }

  // Aktiven Nav-Link markieren (für ggf. noch verlinkte Einzelseiten)
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .nav-plain a, .nav-mobile-panel a").forEach((link) => {
    if (link.getAttribute("href") === current) link.classList.add("active");
  });

  initScrollSpy();

  // Newsletter-Formulare: einfache Bestätigung im Frontend.
  // Für echten Versand ans Formular-"action" einen Anbieter (z.B. Brevo, Mailchimp, CleverReach) eintragen.
  document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const success = form.querySelector(".form-success");
      if (success) success.classList.add("visible");
      form.reset();
    });
  });

  // Mobile-Overlay-Navigation (rahmenlose Landing-Page-Nav)
  const plainToggle = document.querySelector(".nav-toggle-plain");
  const mobilePanel = document.querySelector(".nav-mobile-panel");
  if (plainToggle && mobilePanel) {
    plainToggle.addEventListener("click", () => {
      const isOpen = mobilePanel.classList.toggle("open");
      plainToggle.textContent = isOpen ? "✕" : "☰";
    });
    mobilePanel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobilePanel.classList.remove("open");
        plainToggle.textContent = "☰";
      });
    });
  }

  initParallax();
  initTextEmerge();
  initSwipeStack();
});

// Swipe-Stack (Foto-Kartenstapel bei Kontakt): oberste Karte ziehen, bei
// genug Schwung wandert sie nach hinten, sonst federt sie zurück.
function initSwipeStack() {
  const stack = document.querySelector(".swipe-stack");
  if (!stack) return;
  const cards = Array.from(stack.querySelectorAll(".swipe-card"));
  if (!cards.length) return;

  let order = cards.map((_, i) => i);

  const TILT_START = 0;
  const TILT_END = 0;
  const X_FAN = 0;
  const Y_STACK = 0;
  const SCALE_STEP = 0;
  const THRESHOLD = 80;

  function render(dragOffset, dragging) {
    dragOffset = dragOffset || { x: 0, y: 0 };
    order.forEach((cardIdx, pos) => {
      const el = cards[cardIdx];
      const t = order.length > 1 ? pos / (order.length - 1) : 0;
      const rotate = TILT_START + t * (TILT_END - TILT_START);
      const x = pos === 0 ? dragOffset.x : t * X_FAN;
      const y = (pos === 0 ? dragOffset.y : 0) - pos * Y_STACK;
      const scale = 1 - pos * SCALE_STEP;
      el.style.zIndex = order.length - pos;
      el.style.transition = pos === 0 && dragging ? "none" : "transform 0.45s cubic-bezier(.22,1,.36,1)";
      el.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
      el.style.cursor = pos === 0 ? "grab" : "default";
    });
  }
  render();

  let dragging = false;
  let startX = 0, startY = 0, curX = 0, curY = 0;

  function topEl() {
    return cards[order[0]];
  }

  stack.addEventListener("dragstart", (e) => e.preventDefault());

  stack.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".swipe-card") !== topEl()) return;
    e.preventDefault();
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    topEl().setPointerCapture(e.pointerId);
    topEl().style.cursor = "grabbing";
  });

  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    e.preventDefault();
    curX = e.clientX - startX;
    curY = e.clientY - startY;
    render({ x: curX, y: curY }, true);
  });

  window.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    const dist = Math.hypot(curX, curY);
    if (dist > THRESHOLD) order.push(order.shift());
    curX = 0;
    curY = 0;
    render();
  });
}

// "Text Emerge": Wörter erscheinen einzeln (Blur + Scale) beim Reinscrollen.
// Reines CSS/JS, keine externe Abhängigkeit (kein CDN, das blockiert werden könnte).
function initTextEmerge() {
  const bioText = document.querySelector(".bio-text");
  if (!bioText) return;
  const paragraphs = bioText.querySelectorAll("p");
  if (!paragraphs.length) return;

  let wordIndex = 0;
  paragraphs.forEach((p) => {
    const words = p.textContent.trim().split(/\s+/).filter(Boolean);
    p.innerHTML = words
      .map((word) => {
        const delay = (wordIndex++ * 0.03).toFixed(2);
        return `<span class="word" style="--word-delay:${delay}s">${word}</span>`;
      })
      .join(" ");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        bioText.classList.add("emerge-active");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0 }
  );
  observer.observe(bioText);
}

// One-Pager: Nav-Link der Sektion markieren, die gerade im Viewport ist.
function initScrollSpy() {
  const sections = document.querySelectorAll("main > section[id]");
  const navLinks = document.querySelectorAll(".nav-plain a, .nav-mobile-panel a");
  if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

// Parallax: Hintergrund-Layer bewegen sich langsamer als der Scroll.
function initParallax() {
  const layers = document.querySelectorAll(".parallax-bg");
  if (!layers.length) return;

  let ticking = false;

  function update() {
    layers.forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 0.2;
      const rect = el.parentElement.getBoundingClientRect();
      el.style.transform = `translateY(${rect.top * speed}px)`;
    });
    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  document.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();
}

const MONTHS_DE = [
  "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
];

const WEEKDAYS_DE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function formatShowDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return { day: d.getDate(), month: MONTHS_DE[d.getMonth()], weekday: WEEKDAYS_DE[d.getDay()] };
}

function buildShowRow(show) {
  const { day, month, weekday } = formatShowDate(show.date);
  const status = show.soldOut
    ? `<span class="show-status">Ausverkauft</span>`
    : show.ticketUrl
      ? `<a class="btn btn-primary" href="${show.ticketUrl}" target="_blank" rel="noopener">Tickets <span class="btn-arrow">→</span></a>`
      : `<span class="show-status">Demnächst</span>`;
  const time = show.time ? ` · ${show.time}` : "";

  return `
    <div class="show-row">
      <div class="show-date"><span class="day">${day}.</span><span class="month">${weekday} ${month}</span></div>
      <div class="show-info">
        <div class="city">${show.city}</div>
        <div class="venue">${show.venue}${time}</div>
      </div>
      ${status}
    </div>`;
}

function getUpcomingShows() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return SHOWS
    .filter((s) => new Date(s.date + "T00:00:00") >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getPastShows() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return SHOWS
    .filter((s) => new Date(s.date + "T00:00:00") < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderShowList(target, shows, emptyText) {
  const el = document.querySelector(target);
  if (!el) return;
  el.innerHTML = shows.length
    ? shows.map(buildShowRow).join("")
    : `<div class="empty-state">${emptyText}</div>`;
}
