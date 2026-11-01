document.addEventListener('click', function (e) {
  var a = e.target.closest('a');
  if (!a || typeof fbq !== 'function') return;
  var h = a.href || '';
  if (/^tel:|wa\.me|whatsapp|^mailto:|instagram\.com|m\.me/.test(h)) {
    fbq('track', 'Contact', { content_name: h.split(':')[0] });
  }
});
document.addEventListener('submit', function () {
  if (typeof fbq === 'function') fbq('track', 'Lead');
});
