/* Project Hunar enquiry: floating button + popup + inline form on enquiry.html */
(function () {
  // Paste your Google Apps Script web-app URL here (see tools/lead-apps-script.gs).
  // While empty, the enquiry opens as a prefilled WhatsApp message instead (no photos).
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxZA2K1YPwUmtlsbI9mTMpA3IZUo9cQ1UvVQ1fZn6I7-mMyIkqsjQj1DarJrqFFkBwz/exec';
  var WHATSAPP = '917982799527';
  var MAX_FILES = 4, MAX_DIM = 1400;

  var FORM = '' +
    '<div class="enq-thanks" hidden><h3>Thank you for your enquiry!</h3>' +
    '<p>Our team will call you shortly with the bulk price, sampling cost and measurements.</p>' +
    '<p class="enq-mailnote">A confirmation with photos of our work is on its way to your email.</p>' +
    '<p><b>Project Hunar</b> is an initiative by <b>Anubhav NGO</b>, handmade by women artisans. ' +
    '<a href="https://projecthunar.in/" target="_blank" rel="noopener">projecthunar.in</a></p>' +
    '<button type="button" class="btn btn-ghost enq-again">Send another enquiry</button></div>' +
    '<div class="enq-grid">' +
    '<div class="enq-info"><h3>What we take care of</h3><ul>' +
    '<li><strong>Minimum order: 25 pieces</strong>Per product.</li>' +
    '<li><strong>Bulk price</strong>Quoted by us once we know your requirement.</li>' +
    '<li><strong>Sampling</strong>Sample available; cost shared by our team.</li>' +
    // '<li><strong>Measurements &amp; product photos</strong>Provided by us.</li>' +
    '</ul></div>' +
    '<form class="enq-form" novalidate>' +
    '<label>Your name<input name="name" required autocomplete="name"></label>' +
    '<div class="enq-row"><label>City<input name="city" required autocomplete="address-level2"></label>' +
    '<label>Mobile number<input name="mobile" type="tel" inputmode="numeric" required autocomplete="tel" placeholder="10-digit number"></label></div>' +
    '<label>Email <small>(we will send photos of our work)</small><input name="email" type="email" autocomplete="email" placeholder="you@example.com"></label>' +
    '<label>Fabric<select name="fabric_source" required><option value="">Select</option>' +
    '<option>I will provide the fabric</option><option>Please source the fabric</option></select></label>' +
    '<label>Fabric material<input name="fabric_material" placeholder="e.g. cotton, silk, canvas"></label>' +
    '<label>I need a quote for<select name="quote_for" required><option value="">Select</option>' +
    '<option>Sample cost</option><option>Bulk order price</option><option>Both sample and bulk</option></select></label>' +
    '<label class="enq-qty">Number of pieces <small>(minimum 25 per product)</small><input name="quantity" type="number" inputmode="numeric" min="25" step="1" required placeholder="e.g. 50"></label>' +
    '<label>Timeline<select name="timeline" required><option value="">When do you need it?</option>' +
    '<option>Within 2 weeks</option><option>2 to 4 weeks</option><option>1 to 2 months</option><option>Flexible</option></select></label>' +
    '<fieldset class="enq-photos"><legend>Reference photos <small>(optional: upload or add a link)</small></legend>' +
    '<label>Upload photos <small>(up to 4)</small><input name="photos" type="file" accept="image/*" multiple></label>' +
    '<div class="enq-thumbs"></div>' +
    '<label>Or paste links <small>(Google Drive, Instagram, Pinterest... separate several with a comma)</small><textarea name="photo_link" rows="2" placeholder="https://drive.google.com/..., https://instagram.com/..."></textarea></label></fieldset>' +
    '<input class="enq-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<button type="submit" class="btn btn-primary">Send enquiry</button>' +
    '<p class="enq-msg" role="status"></p></form></div>';

  function readImage(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve({ name: file.name.replace(/\.[^.]+$/, '') + '.jpg', mime: 'image/jpeg', data: c.toDataURL('image/jpeg', 0.8).split(',')[1] });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('bad image')); };
      img.src = url;
    });
  }

  function wire(root) {
    var form = root.querySelector('.enq-form'), msg = root.querySelector('.enq-msg');
    var btn = form.querySelector('button[type=submit]'), fileIn = form.photos, thumbs = root.querySelector('.enq-thumbs');
    function say(t, ok) { msg.textContent = t; msg.className = 'enq-msg ' + (ok ? 'ok' : 'err'); }

    root.querySelector('.enq-again').addEventListener('click', function () {
      root.querySelector('.enq-thanks').hidden = true;
      root.querySelector('.enq-grid').hidden = false;
    });

    fileIn.addEventListener('change', function () {
      thumbs.innerHTML = '';
      var files = [].slice.call(fileIn.files);
      if (files.length > MAX_FILES) { say('Please choose up to ' + MAX_FILES + ' photos.', false); fileIn.value = ''; return; }
      say('', true);
      files.forEach(function (f) { var i = document.createElement('img'); i.alt = ''; i.src = URL.createObjectURL(f); thumbs.appendChild(i); });
    });

    function normMobile(v) { return String(v || '').replace(/[\s+\-]/g, '').replace(/^91(?=\d{10}$)/, ''); }
    function splitLinks(v) { return String(v || '').split(/[\s,;]+/).filter(Boolean); }
    var rules = {
      name: function (v) { return v.trim() ? '' : 'Please enter your name.'; },
      city: function (v) { return v.trim() ? '' : 'Please enter your city.'; },
      mobile: function (v) { return /^[6-9]\d{9}$/.test(normMobile(v)) ? '' : 'Enter a valid 10-digit mobile number (starts with 6, 7, 8 or 9).'; },
      email: function (v) { return !v.trim() || /^\S+@\S+\.\S+$/.test(v.trim()) ? '' : 'Please check your email address.'; },
      quote_for: function (v) { return v ? '' : 'Please tell us what you need a quote for.'; },
      quantity: function (v) {
        if (form.quote_for.value === 'Sample cost') return '';
        var t = String(v).trim();
        if (!t) return 'Please enter how many pieces you need.';
        if (!/^\d+$/.test(t)) return 'Enter a whole number, for example 50.';
        if (+t < 25) return 'Our minimum order is 25 pieces.';
        return +t > 100000 ? 'Please enter a smaller number or call us.' : '';
      },
      fabric_source: function (v) { return v ? '' : 'Please choose an option.'; },
      timeline: function (v) { return v ? '' : 'Please choose a timeline.'; },
      photo_link: function (v) {
        var l = splitLinks(v);
        if (l.length > 6) return 'Please add up to 6 links.';
        var bad = l.filter(function (u) { return !/^https?:\/\/\S+\.\S+/i.test(u); })[0];
        return bad ? 'Each link must start with https:// (check: ' + bad.slice(0, 40) + ')' : '';
      }
    };
    var errEls = {};
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n], span = document.createElement('span');
      span.className = 'enq-err'; span.id = 'enqerr-' + n + '-' + Math.random().toString(36).slice(2, 7);
      span.setAttribute('role', 'alert'); f.parentNode.appendChild(span);
      f.setAttribute('aria-describedby', span.id);
      if (f.required) f.setAttribute('aria-required', 'true');
      errEls[n] = span;
    });
    function check(n) {
      var f = form.elements[n], m = rules[n](f.value);
      errEls[n].textContent = m;
      if (m) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid');
      f.classList.toggle('is-valid', !m && !!f.value.trim());
      return m;
    }
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n];
      f.addEventListener('blur', function () { check(n); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid')) check(n); });
      f.addEventListener('change', function () { check(n); });
    });
    var qtyRow = form.querySelector('.enq-qty');
    function syncQty() {
      var sampleOnly = form.quote_for.value === 'Sample cost';
      qtyRow.hidden = sampleOnly; form.quantity.required = !sampleOnly;
      if (sampleOnly) { errEls.quantity.textContent = ''; form.quantity.removeAttribute('aria-invalid'); }
    }
    form.quote_for.addEventListener('change', syncQty); syncQty();
    form.mobile.addEventListener('input', function () {
      var p = form.mobile.value.replace(/[^\d+\s\-]/g, '');
      if (p !== form.mobile.value) form.mobile.value = p;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      if (d.get('website')) return;
      var firstBad = null;
      Object.keys(rules).forEach(function (n) { if (check(n) && !firstBad) firstBad = n; });
      if (firstBad) { say('Please fix the highlighted fields.', false); form.elements[firstBad].focus(); return; }
      say('', true);
      var mobile = normMobile(d.get('mobile'));
      var email = String(d.get('email') || '').trim();
      var link = splitLinks(d.get('photo_link')).join(' | ');
      var data = {
        photo_link: link,
        name: String(d.get('name')).trim(), city: String(d.get('city')).trim(), mobile: mobile, email: email,
        fabric_source: d.get('fabric_source'), fabric_material: String(d.get('fabric_material') || '').trim(),
        quote_for: d.get('quote_for'),
        quantity: d.get('quote_for') === 'Sample cost' ? '' : parseInt(d.get('quantity'), 10), timeline: d.get('timeline'), page: location.href, time: new Date().toISOString(), files: []
      };

      if (!ENDPOINT) {
        var text = 'Hello Project Hunar, I would like a bulk order enquiry.\nName: ' + data.name + '\nCity: ' + data.city +
          '\nMobile: ' + data.mobile + (email ? '\nEmail: ' + email : '') + '\nFabric: ' + data.fabric_source +
          (data.fabric_material ? ' (' + data.fabric_material + ')' : '') + '\nQuote for: ' + data.quote_for + (data.quantity ? '\nPieces: ' + data.quantity : '') + '\nTimeline: ' + data.timeline + (link ? '\nPhotos: ' + link : '');
        window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        say('Thank you! Please send the WhatsApp message that just opened. You can share your photos there.', true);
        return;
      }

      btn.disabled = true; say('Sending...', true);
      Promise.all([].slice.call(fileIn.files).map(readImage)).then(function (files) {
        data.files = files;
        return fetch(ENDPOINT, { method: 'POST', body: JSON.stringify(data) });
      }).then(function () {
        form.reset(); thumbs.innerHTML = '';
        Object.keys(errEls).forEach(function (n) { errEls[n].textContent = ''; form.elements[n].removeAttribute('aria-invalid'); form.elements[n].classList.remove('is-valid'); });
        say('', true);
        root.querySelector('.enq-grid').hidden = true;
        root.querySelector('.enq-thanks').hidden = false;
        root.querySelector('.enq-thanks .enq-mailnote').hidden = !email;
        if (typeof fbq === 'function') fbq('track', 'Lead');
      }).catch(function () { say('Could not send. Please call +91 79827 99527.', false); })
        .then(function () { btn.disabled = false; });
    });
  }

  function ready(fn) { document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn(); }

  ready(function () {
    var inline = document.getElementById('enquiryMount');
    if (inline) { inline.innerHTML = FORM; wire(inline); }

    // Enquiry opens the separate page (enquiry.html), no popup.
    if (!inline) {
      var fab = document.createElement('a');
      fab.href = 'enquiry.html'; fab.className = 'enq-fab';
      fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><path d="M4 5h16v11H8l-4 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><span>Enquiry</span>';
      document.body.appendChild(fab);
    }
  });
})();
