/* Catalogue page: nav + category filtering over the pre-rendered product cards.
   Cards are real HTML (crawlable); JS only shows/hides them and feeds the lightbox. */
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
  const cards = [...document.querySelectorAll('.cat-card')];
  const countEl = document.getElementById('catCount');
  const bySrc = new Map(showcaseItems.map(it => [it.src, it]));
  const slugOf = c => c.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function apply(cat) {
    catalogueItems.length = 0;
    cards.forEach(card => {
      const show = cat === 'All' || card.dataset.cat === cat;
      card.hidden = !show;
      if (show) {
        card.dataset.idx = catalogueItems.length;
        catalogueItems.push(bySrc.get(card.dataset.src));
      }
    });
    chips.forEach(ch => {
      const on = ch.dataset.cat === cat;
      ch.classList.toggle('active', on);
      ch.setAttribute('aria-pressed', on);
    });
    countEl.textContent = catalogueItems.length + (catalogueItems.length === 1 ? ' product' : ' products');
  }

  chips.forEach(ch => ch.addEventListener('click', () => {
    apply(ch.dataset.cat);
    const h = ch.dataset.cat === 'All' ? location.pathname + location.search : '#' + slugOf(ch.dataset.cat);
    history.replaceState(null, '', h);
  }));

  const wanted = chips.find(ch => '#' + slugOf(ch.dataset.cat) === location.hash);
  apply(wanted ? wanted.dataset.cat : 'All');
  bindLightboxCards();
})();
