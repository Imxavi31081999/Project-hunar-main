/* ============================================================
   6. LIGHTBOX — direct binding (reliable on mobile & Swiper
   clones) plus a delegation fallback. Close/nav bound directly
   to their buttons. ESC + arrow keys.
   ============================================================ */
const collectionMap = { madhubani: madhubaniItems, handmade: handmadeItems, showcase: showcaseItems, catalogue: catalogueItems };
const collectionLabel = { madhubani: 'Madhubani Collection', handmade: 'Quilted & Handmade Collection', showcase: 'The Full Range', catalogue: 'Catalogue' };

const lightbox      = document.getElementById('lightbox');
const lbImage       = document.getElementById('lbImage');
const lbTag         = document.getElementById('lbTag');
const lbTitle       = document.getElementById('lbTitle');
const lbIndex       = document.getElementById('lbIndex');
const lbTotal       = document.getElementById('lbTotal');
let lbCurrentSet    = [];
let lbCurrentIdx    = 0;
let lbCurrentCollection = '';

function openLightbox(collection, idx) {
  if (!lightbox) return;
  lbCurrentCollection = collection;
  lbCurrentSet = collectionMap[collection] || [];
  lbCurrentIdx = idx;
  renderLightbox();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lb-open');
}
function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lb-open');
}
function renderLightbox() {
  const item = lbCurrentSet[lbCurrentIdx];
  if (!item) return;
  lbImage.src = item.src;
  lbImage.alt = item.label;
  lbTitle.textContent = item.label;
  lbTag.textContent = collectionLabel[lbCurrentCollection] || 'Collection';
  lbIndex.textContent = lbCurrentIdx + 1;
  lbTotal.textContent = lbCurrentSet.length;
}
function lbStep(dir) {
  if (!lbCurrentSet.length) return;
  lbCurrentIdx = (lbCurrentIdx + dir + lbCurrentSet.length) % lbCurrentSet.length;
  renderLightbox();
}

// Direct binding — the reliable path (guarded against re-binds
// after Swiper clones or slide changes).
function bindLightboxCards() {
  document.querySelectorAll('[data-lb-open]').forEach(el => {
    if (el._lbBound) return;
    el._lbBound = true;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(el.dataset.collection, parseInt(el.dataset.idx, 10) || 0);
    });
  });
}

document.querySelectorAll('[data-lb-close]').forEach(el => {
  el.addEventListener('click', (e) => { e.preventDefault(); closeLightbox(); });
});
document.querySelectorAll('[data-lb-nav]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    lbStep(el.dataset.lbNav === 'next' ? 1 : -1);
  });
});
document.addEventListener('keydown', (e) => {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowRight') lbStep(1);
  else if (e.key === 'ArrowLeft')  lbStep(-1);
});

