(function () {
  var list = document.getElementById('faqList');
  if (!list) return;
  var items = list.querySelectorAll('.faq-item');
  items.forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    btn.addEventListener('click', function () {
      var open = item.getAttribute('data-open') === 'true';
      items.forEach(function (o) {
        o.setAttribute('data-open', 'false');
        o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      item.setAttribute('data-open', String(!open));
      btn.setAttribute('aria-expanded', String(!open));
    });
  });
})();
