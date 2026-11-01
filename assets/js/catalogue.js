/* Catalogue page: nav + shop filtering (category, search, sort) over the
   pre-rendered product cards. Cards are real HTML (crawlable); JS only
   shows/hides/reorders them and feeds the lightbox. */
(function () {
  const siteNav = document.getElementById('siteNav');
  const navPill = document.getElementById('navPill');
  const navToggle = document.getElementById('navToggle');
  const onScroll = () => siteNav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  navToggle.addEventListener('click', () => {
    const open = navPill.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });

  const chips = [...document.querySelectorAll('.cat-chip')];
  const grid = document.getElementById('catGrid');
  const cards = [...grid.querySelectorAll('.cat-card')];
  const countEl = document.getElementById('catCount');
  const emptyEl = document.getElementById('catEmpty');
  const searchEl = document.getElementById('catSearch');
  const sortEl = document.getElementById('catSort');
  const sidebar = document.getElementById('shopSidebar');
  const backdrop = document.getElementById('sideBackdrop');
  const bySrc = new Map(showcaseItems.map(it => [it.src, it]));
  const slugOf = c => c.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const moreBtn = document.getElementById('viewMore');
  const PAGE = 12;
  let shown = PAGE;
  let activeCat = 'All';

  function render() {
    const q = searchEl.value.trim().toLowerCase();
    const mode = sortEl.value;
    const sorted = cards.slice().sort((a, b) => {
      if (mode === 'az') return a.dataset.name.localeCompare(b.dataset.name);
      if (mode === 'za') return b.dataset.name.localeCompare(a.dataset.name);
      return a.dataset.order - b.dataset.order;
    });
    sorted.forEach(c => grid.appendChild(c));
    catalogueItems.length = 0;
    sorted.forEach(card => {
      const hay = card.dataset.name + ' ' + card.dataset.cat.toLowerCase();
      const match = (activeCat === 'All' || card.dataset.cat === activeCat) && (!q || hay.includes(q));
      if (match) {
        card.dataset.idx = catalogueItems.length;
        catalogueItems.push(bySrc.get(card.dataset.src));
      }
      card.hidden = !match || catalogueItems.length > shown;
    });
    chips.forEach(ch => {
      const on = ch.dataset.cat === activeCat;
      ch.classList.toggle('active', on);
      ch.setAttribute('aria-pressed', on);
    });
    const n = catalogueItems.length;
    const showing = Math.min(n, shown);
    countEl.textContent = n > showing ? 'Showing ' + showing + ' of ' + n + ' products' : n + (n === 1 ? ' product' : ' products');
    moreBtn.hidden = n <= shown;
    moreBtn.textContent = 'View more (' + (n - shown) + ' remaining)';
    emptyEl.hidden = n > 0;
  }

  function setSidebar(open) {
    sidebar.classList.toggle('open', open);
    backdrop.classList.toggle('open', open);
  }

  chips.forEach(ch => ch.addEventListener('click', () => {
    activeCat = ch.dataset.cat;
    shown = PAGE;
    render();
    const h = activeCat === 'All' ? location.pathname + location.search : '#' + slugOf(activeCat);
    history.replaceState(null, '', h);
    setSidebar(false);
    if (window.innerWidth <= 900) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  searchEl.addEventListener('input', () => { shown = PAGE; render(); });
  sortEl.addEventListener('change', () => { shown = PAGE; render(); });
  moreBtn.addEventListener('click', () => { shown += PAGE; render(); });
  document.getElementById('filterBtn').addEventListener('click', () => setSidebar(true));
  document.getElementById('sideClose').addEventListener('click', () => setSidebar(false));
  backdrop.addEventListener('click', () => setSidebar(false));

  // WhatsApp link on a card must not open the lightbox
  grid.querySelectorAll('.cat-enquire').forEach(a => a.addEventListener('click', e => e.stopPropagation()));

  const wanted = chips.find(ch => '#' + slugOf(ch.dataset.cat) === location.hash);
  if (wanted) activeCat = wanted.dataset.cat;
  render();
  bindLightboxCards();
})();
