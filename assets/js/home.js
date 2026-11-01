/* ============================================================
   1. NAV — scroll state + mobile toggle
   ============================================================ */
const siteNav = document.getElementById('siteNav');
const navPill = document.getElementById('navPill');
const navToggle = document.getElementById('navToggle');

window.addEventListener('scroll', () => {
  siteNav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navPill.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
navPill.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navPill.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}));

// Active-section highlight for the pill nav
const sectionsForNav = ['about','craft','madhubani','handmade','partner','contact']
  .map(id => document.getElementById(id)).filter(Boolean);
const navLinkMap = {};
navPill.querySelectorAll('a').forEach(a => {
  const id = a.getAttribute('href').replace('#','');
  navLinkMap[id] = a;
});
const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      Object.values(navLinkMap).forEach(link => link.classList.remove('active'));
      const link = navLinkMap[e.target.id];
      if (link) link.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
sectionsForNav.forEach(s => activeObserver.observe(s));

/* ============================================================
   2. REVEAL ON SCROLL
   ============================================================ */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

/* ============================================================
   2b. FLOATING 3D ELEMENTS — parallax on scroll (desktop only)
   ============================================================ */
const floatEls = Array.from(document.querySelectorAll('.float-el'));

function updateFloatParallax() {
  const scrollY = window.scrollY;
  floatEls.forEach(el => {
    const speed = parseFloat(el.dataset.speed || '0.15');
    const offset = scrollY * speed;
    el.style.transform = `translate3d(0, ${-offset}px, 0)`;
  });
}

let floatTicking = false;
if (floatEls.length && window.innerWidth > 860) {
  window.addEventListener('scroll', () => {
    if (!floatTicking) {
      requestAnimationFrame(() => { updateFloatParallax(); floatTicking = false; });
      floatTicking = true;
    }
  }, { passive: true });
  updateFloatParallax();
}

/* ============================================================
   3. "WHAT IS PROJECT HUNAR" — pill-to-banner scroll scrub
   Desktop only. On mobile (<=860px), the sticky/tall stage
   dominates scroll (was 260vh — the "over scroll" issue), so
   we bail early and just enable native video controls; CSS
   overrides handle layout so it renders as a plain video block.
   ============================================================ */
const processStage = document.getElementById('processStage');
const processPill = document.getElementById('processPill');
const labelLeft = document.getElementById('labelLeft');
const labelRight = document.getElementById('labelRight');
const processHint = document.getElementById('processHint');
const hunarVideo = document.getElementById('hunarVideo');

const IS_MOBILE_STAGE = () => window.innerWidth <= 860;
const PILL_MIN = { w: 230, h: 100 };
const PILL_RADIUS = { min: 100, max: 28 };

// Browsers only autoplay muted video, so sound is switched on by an explicit click
const soundBtn = document.getElementById('soundBtn');
if (soundBtn && hunarVideo) {
  soundBtn.addEventListener('click', () => {
    const turnOn = hunarVideo.muted;
    if (turnOn) hunarVideo.currentTime = 0;
    hunarVideo.muted = !turnOn;
    hunarVideo.volume = 1;
    hunarVideo.play().catch(() => {});
    soundBtn.textContent = turnOn ? '🔇 Mute' : '🔊 Tap for sound';
    soundBtn.setAttribute('aria-pressed', String(turnOn));
  });
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function lerp(a, b, t) { return a + (b - a) * t; }

function updateProcessStage() {
  if (!processStage || !processPill) return;
  if (IS_MOBILE_STAGE()) {
    // Mobile: layout handled by CSS media query; just show controls
    if (hunarVideo && !hunarVideo.hasAttribute('controls')) {
      hunarVideo.setAttribute('controls', '');
    }
    if (soundBtn) soundBtn.classList.add('show');
    return;
  }
  const rect = processStage.getBoundingClientRect();
  const vh = window.innerHeight;
  const scrollableDistance = rect.height - vh;
  let progress = scrollableDistance > 0 ? (-rect.top) / scrollableDistance : 0;
  progress = Math.min(Math.max(progress, 0), 1);
  const eased = easeOutCubic(progress);

  // Final frame matches the video's 16:9 ratio so nothing (incl. burned-in captions) is cropped
  const maxH = Math.min(vh * 0.8, window.innerWidth * 0.92 * 9 / 16, 675);
  const maxW = maxH * 16 / 9;

  const width = lerp(PILL_MIN.w, maxW, eased);
  const height = lerp(PILL_MIN.h, maxH, eased);
  const radius = lerp(PILL_RADIUS.min, PILL_RADIUS.max, eased);

  processPill.style.width = width + 'px';
  processPill.style.height = height + 'px';
  processPill.style.borderRadius = radius + 'px';

  const labelFade = 1 - Math.min(progress / 0.18, 1);
  const labelShift = progress * 36;
  if (labelLeft) {
    labelLeft.style.opacity = labelFade;
    labelLeft.style.transform = `translateX(${-labelShift}px)`;
  }
  if (labelRight) {
    labelRight.style.opacity = labelFade;
    labelRight.style.transform = `translateX(${labelShift}px)`;
  }
  if (processHint) processHint.style.opacity = progress > 0.06 ? '0' : '.7';

  if (hunarVideo) {
    if (progress > 0.45) hunarVideo.setAttribute('controls', '');
    else hunarVideo.removeAttribute('controls');
    if (soundBtn) soundBtn.classList.toggle('show', progress > 0.3);
    if (progress > 0.04 && hunarVideo.paused) hunarVideo.play().catch(() => {});
  }
}

let stageTicking = false;
window.addEventListener('scroll', () => {
  if (!stageTicking) {
    requestAnimationFrame(() => { updateProcessStage(); stageTicking = false; });
    stageTicking = true;
  }
}, { passive: true });
window.addEventListener('resize', updateProcessStage);
updateProcessStage();

/* ============================================================
   3c. PATTERN DIVIDER CHIP SCROLLERS
   ============================================================ */
function buildChips(paths) {
  const doubled = [...paths, ...paths];
  return doubled.map(src => `<div class="chip"><img src="${src}" alt="" loading="lazy"></div>`).join('');
}

const chipSet1 = [
  "Images/elements/thread-spool.png",
  "assets/img/products/madhubani/madhubani-art-on-saree.webp",
  "Images/elements/needle-thread.png",
  "assets/img/products/madhubani/madhubani-art-on-table-lamp.webp",
  "assets/img/products/madhubani/madhubani-art-on-wall-board.webp",
  "assets/img/products/madhubani/madhubani-art-on-pen-stand.webp",
  "Images/Moubani painting/Hand creafted/elephant.jpeg"
];
const chipSet2 = [
  "Images/Hand creafted /Crochet Sunflower in a pot.png",
  "Images/elements/needle-thread.png",
  "Images/Hand creafted /Quilted Peach Floral tote Bag.png",
  "Images/Hand creafted /Bright Orange hooded puffer jacket.png",
  "Images/elements/thread-spool.png",
  "Images/Hand creafted /Crochet Purple Tulip in a Pot.png",
  "Images/Moubani painting/Hand creafted/elephant.jpeg"
];
const chipSet3 = [
  "assets/img/products/madhubani/madhubani-art-on-saree-variant.webp",
  "Images/Hand creafted /Quilted sage green floral cosmetic pouch.png",
  "Images/elements/thread-spool.png",
   "Images/Moubani painting/Hand creafted/elephant.jpeg",
  "assets/img/products/madhubani/madhubani-art-on-mobile-cover.webp",
  "Images/Hand creafted /Crochet Sunflower in a pot.png",
  "Images/Hand creafted /sage green floral bolster cushion.png",
  "Images/elements/needle-thread.png"
];

const chipTrack1 = document.getElementById('chipTrack1');
const chipTrack2 = document.getElementById('chipTrack2');
const chipTrack3 = document.getElementById('chipTrack3');
if (chipTrack1) chipTrack1.innerHTML = buildChips(chipSet1);
if (chipTrack2) chipTrack2.innerHTML = buildChips(chipSet2);
if (chipTrack3) chipTrack3.innerHTML = buildChips(chipSet3);

function buildSlides(items, collection) {
  return items.map((it, i) => `
    <div class="swiper-slide">
      <article class="peek-card glow-card" data-lb-open data-collection="${collection}" data-idx="${i}">
        <div class="peek-card-inner">
          <div class="peek-media"><img src="${it.src}" alt="${altOf(it)}" loading="lazy"></div>
          <div class="peek-foot">
            <div>
              <h4>${it.label}</h4>
              <span class="peek-tag">Made to order</span>
            </div>
            <span class="peek-arrow">→</span>
          </div>
        </div>
      </article>
    </div>
  `).join('');
}

document.querySelector('#madhubani-swiper .swiper-wrapper').innerHTML = buildSlides(madhubaniItems, 'madhubani');
document.querySelector('#handmade-swiper .swiper-wrapper').innerHTML = buildSlides(handmadeItems, 'handmade');

/* ============================================================
   4b. SHOWCASE BANNER — build 3 shuffled rows of product images
   Each row is a distinct shuffle of the combined showcaseItems,
   doubled so the CSS translateX(0 -> -50%) loops seamlessly.
   Every item stays wired to the lightbox — data-idx points into
   showcaseItems (the full list), not the shuffled/rendered order,
   so prev/next in the lightbox walks the whole range in a
   consistent order regardless of which row was clicked.
   ============================================================ */
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildShowcaseRow(items) {
  const doubled = [...items, ...items];
  return doubled.map(it => {
    const idx = showcaseItems.findIndex(x => x.src === it.src);
    return `
      <div class="showcase-item" data-lb-open data-collection="showcase" data-idx="${idx}" title="${it.label}">
        <img src="${it.src}" alt="${altOf(it)}" loading="lazy">
        <div class="s-cap">${it.label}</div>
      </div>
    `;
  }).join('');
}

const showcaseRowEls = [
  document.getElementById('showcaseRow1'),
  document.getElementById('showcaseRow2'),
  document.getElementById('showcaseRow3'),
];
showcaseRowEls.forEach(row => {
  if (row) row.innerHTML = buildShowcaseRow(shuffleArray(showcaseItems));
});

/* ============================================================
   5. SWIPER INITIALISATION — autoplay + safe click (preventClicks
   off so a tap on a card always reaches the lightbox handler,
   even at the tail-end of a small drag).
   ============================================================ */
function initProductSwiper(rootId, controlKey) {
  return new Swiper(`#${rootId} .swiper`, {
    slidesPerView: 1.15,
    spaceBetween: 18,
    loop: true,
    grabCursor: true,
    watchOverflow: true,
    preventClicks: false,
    preventClicksPropagation: false,
    keyboard: { enabled: true, onlyInViewport: true },
    autoplay: {
      delay: 3800,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    navigation: {
      nextEl: `[data-slider="${controlKey}"][data-dir="next"]`,
      prevEl: `[data-slider="${controlKey}"][data-dir="prev"]`,
    },
    pagination: {
      el: `#${rootId} .swiper-pagination`,
      clickable: true,
      dynamicBullets: true,
      dynamicMainBullets: 4,
    },
    breakpoints: {
      560:  { slidesPerView: 1.6, spaceBetween: 20 },
      760:  { slidesPerView: 2.3, spaceBetween: 22 },
      1024: { slidesPerView: 3.2, spaceBetween: 26 },
      1280: { slidesPerView: 3.6, spaceBetween: 28 },
      1500: { slidesPerView: 4.2, spaceBetween: 30 },
    },
  });
}

function whenSwiperReady(cb) {
  if (typeof Swiper !== 'undefined') return cb();
  const t = setInterval(() => {
    if (typeof Swiper !== 'undefined') { clearInterval(t); cb(); }
  }, 40);
}

bindLightboxCards();
whenSwiperReady(() => {
  const s1 = initProductSwiper('madhubani-swiper', 'madhubani');
  const s2 = initProductSwiper('handmade-swiper',  'handmade');
  bindLightboxCards();
  s1.on('slideChangeTransitionEnd', bindLightboxCards);
  s2.on('slideChangeTransitionEnd', bindLightboxCards);
});

/* ============================================================
   7. PARALLAX BREAK SECTION
   Splits the headline into <span class="word"> pieces so each
   can stagger-fade in when the section enters view. Background
   image translates at a fraction of scroll speed for depth.
   ============================================================ */
document.querySelectorAll('[data-split-words]').forEach(h => {
  // Preserve any inline <span class="accent"> already in the markup
  // by walking child nodes instead of blowing away innerHTML.
  const frag = document.createDocumentFragment();
  Array.from(h.childNodes).forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.split(/(\s+)/);
      words.forEach(w => {
        if (/^\s+$/.test(w)) {
          frag.appendChild(document.createTextNode(w));
        } else if (w.length) {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = w;
          frag.appendChild(span);
        }
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Existing inline element (like .accent) — treat whole element as one "word"
      node.classList.add('word');
      frag.appendChild(node);
    }
  });
  h.innerHTML = '';
  h.appendChild(frag);
  // Stagger each word
  h.querySelectorAll('.word').forEach((w, i) => {
    w.style.transitionDelay = (0.25 + i * 0.11) + 's';
  });
});

const parallaxBreak = document.getElementById('parallaxBreak');
const parallaxBreakBg = document.getElementById('parallaxBreakBg');

if (parallaxBreak) {
  const breakObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) parallaxBreak.classList.add('in'); });
  }, { threshold: 0.25 });
  breakObserver.observe(parallaxBreak);
}

function updateParallaxBreak() {
  if (!parallaxBreak || !parallaxBreakBg) return;
  const rect = parallaxBreak.getBoundingClientRect();
  const vh = window.innerHeight;
  // Only animate when in/near viewport
  if (rect.bottom < -100 || rect.top > vh + 100) return;
  // Progress: 0 when section top hits bottom of viewport, 1 when section bottom hits top
  const total = rect.height + vh;
  const p = 1 - ((rect.top + rect.height) / total);
  const offset = (p - 0.5) * 120; // -60 to +60px drift
  parallaxBreakBg.style.transform = `translate3d(0, ${offset}px, 0)`;
}

let breakTicking = false;
window.addEventListener('scroll', () => {
  if (!breakTicking) {
    requestAnimationFrame(() => { updateParallaxBreak(); breakTicking = false; });
    breakTicking = true;
  }
}, { passive: true });
window.addEventListener('resize', updateParallaxBreak);
updateParallaxBreak();

/* ============================================================
   7b. PARTNER CARD STACK — stagger-in as each enters view
   ============================================================ */
const partnerCards = document.querySelectorAll('.partner-stack .feature-card');
if (partnerCards.length) {
  const partnerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        partnerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  partnerCards.forEach((card, i) => {
    card.style.transitionDelay = (i * 0.08) + 's';
    partnerObserver.observe(card);
  });
}

/* ============================================================
   7c. LENIS SMOOTH SCROLL
   Butter-smooth page scroll — replaces the native scroll motion
   with an interpolated one. Anchor links (#about etc.) route
   through lenis.scrollTo so they animate consistently.
   Respects prefers-reduced-motion (bails out to native scroll).
   ============================================================ */
(function initLenis() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || typeof Lenis === 'undefined') return;

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false, // native touch scroll on mobile (better UX)
  });
  window.__lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Route in-page anchor links through Lenis for smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80, duration: 1.3 });
    });
  });
})();

/* ============================================================
   9. PIXELATED CURSOR TRAIL (scoped to parallax break)
   Ported from the Framer PixelatedCursorTrail component:
   a chain of N pixel squares follows the cursor with spring
   physics — first pixel springs toward the mouse, each next
   pixel springs toward the one ahead of it. Only active while
   the mouse is inside the parallax break section; the stitch
   cursor above yields to this one in the same zone.
   ============================================================ */
(function initPixelTrail() {
  const section = document.getElementById('parallaxBreak');
  if (!section) return;
  const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isTouch || prefersReduced) return;

  // Config — mirroring the Framer defaults, tuned to the section's palette
  const PIXEL_COUNT = 28;
  const PIXEL_SIZE = 9;
  const SPACING = 14;
  const STIFFNESS = 0.22;
  const DAMPING = 0.55;
  const COLOR = { r: 199, g: 154, b: 60 }; // gold, reads against the dark bg
  const FADE_IN = 0.09;
  const FADE_OUT = 0.035;

  const canvas = document.createElement('canvas');
  canvas.className = 'pixel-trail-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  section.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function sizeCanvas() {
    const rect = section.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);

  let cursorX = -1000, cursorY = -1000;
  let inside = false;
  let activity = 0;
  let rafId = null;

  const trail = Array.from({ length: PIXEL_COUNT }, () => ({
    x: -1000, y: -1000, vx: 0, vy: 0
  }));

  function updateCursor(e) {
    const rect = section.getBoundingClientRect();
    cursorX = e.clientX - rect.left;
    cursorY = e.clientY - rect.top;
  }

  section.addEventListener('mouseenter', (e) => {
    inside = true;
    window.__inPixelTrailZone = true;
    updateCursor(e);
    // Seed the trail at cursor on first entry so it doesn't snake in from off-screen
    if (trail[0].x < -500) {
      trail.forEach(p => { p.x = cursorX; p.y = cursorY; p.vx = 0; p.vy = 0; });
    }
    if (!rafId) rafId = requestAnimationFrame(animate);
  });
  section.addEventListener('mouseleave', () => {
    inside = false;
    window.__inPixelTrailZone = false;
  });
  section.addEventListener('mousemove', (e) => { if (inside) updateCursor(e); });

  function animate() {
    // Activity fade — brings trail in quickly on entry, decays slowly on exit
    const target = inside ? 1 : 0;
    if (activity < target) activity = Math.min(target, activity + FADE_IN);
    else if (activity > target) activity = Math.max(target, activity - FADE_OUT);

    // Spring physics — first pixel to cursor, each next to the one ahead
    const head = trail[0];
    if (head) {
      head.vx += (cursorX - head.x) * STIFFNESS;
      head.vy += (cursorY - head.y) * STIFFNESS;
      head.vx *= DAMPING;
      head.vy *= DAMPING;
      head.x += head.vx;
      head.y += head.vy;
    }
    for (let i = 1; i < trail.length; i++) {
      const prev = trail[i - 1], curr = trail[i];
      const dx = prev.x - curr.x, dy = prev.y - curr.y;
      const dist = Math.hypot(dx, dy);
      curr.vx += dx * STIFFNESS;
      curr.vy += dy * STIFFNESS;
      curr.vx *= DAMPING;
      curr.vy *= DAMPING;
      curr.x += curr.vx;
      curr.y += curr.vy;
      if (dist > SPACING) {
        const ratio = (dist - SPACING) / dist * 0.5;
        curr.x += dx * ratio;
        curr.y += dy * ratio;
      }
    }

    // Draw
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    if (activity > 0.008) {
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const progress = i / PIXEL_COUNT;
        const opacity = (1 - progress) * activity;
        const size = PIXEL_SIZE * (1 - progress * 0.55);
        if (opacity < 0.02) continue;
        ctx.fillStyle = `rgba(${COLOR.r}, ${COLOR.g}, ${COLOR.b}, ${opacity})`;
        // Snap to whole pixels for that crisp "pixelated" look
        const sz = Math.max(1, Math.round(size));
        ctx.fillRect(Math.round(p.x - sz / 2), Math.round(p.y - sz / 2), sz, sz);
      }
    }

    if (inside || activity > 0.008) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }
})();

/* Latest arrivals - horizontal scroller arrows */
(function () {
  const grid = document.getElementById('latestGrid');
  if (!grid) return;
  const step = dir => grid.scrollBy({ left: dir * Math.max(240, grid.clientWidth * 0.8), behavior: 'smooth' });
  document.getElementById('latestPrev').addEventListener('click', () => step(-1));
  document.getElementById('latestNext').addEventListener('click', () => step(1));
})();
