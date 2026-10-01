/* Mendes Family Dentistry — shared interactions */
(function () {
  if (window.lucide) lucide.createIcons();

  // Sticky header state
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile menu
  var menu = document.querySelector('.mobile-menu');
  document.querySelectorAll('[data-menu-open]').forEach(function (b) {
    b.addEventListener('click', function () { menu && menu.classList.add('open'); });
  });
  document.querySelectorAll('[data-menu-close], .mobile-menu a').forEach(function (b) {
    b.addEventListener('click', function () { menu && menu.classList.remove('open'); });
  });

  // Reveal on scroll
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // Seamless marquee: duplicate track content once
  document.querySelectorAll('.marquee-track').forEach(function (t) {
    t.innerHTML += t.innerHTML;
  });

  // Accordion
  document.querySelectorAll('.acc-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.acc-item');
      var open = item.classList.contains('open');
      item.parentElement.querySelectorAll('.acc-item.open').forEach(function (i) {
        i.classList.remove('open');
        i.querySelector('.acc-q').setAttribute('aria-expanded', 'false');
      });
      if (!open) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
    });
  });

  // Simple scroll carousels: <div data-carousel="id"> + buttons [data-prev="id"] / [data-next="id"]
  document.querySelectorAll('[data-carousel]').forEach(function (track) {
    var id = track.getAttribute('data-carousel');
    var step = function () {
      var card = track.firstElementChild;
      return card ? card.getBoundingClientRect().width + 24 : 300;
    };
    var counter = document.querySelector('[data-count-for="' + id + '"]');
    var update = function () {
      if (!counter) return;
      var i = Math.round(track.scrollLeft / step()) + 1;
      var n = track.children.length;
      counter.textContent = String(Math.min(i, n)).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    };
    document.querySelectorAll('[data-prev="' + id + '"]').forEach(function (b) {
      b.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    });
    document.querySelectorAll('[data-next="' + id + '"]').forEach(function (b) {
      b.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    });
    track.addEventListener('scroll', update, { passive: true });
    update();
  });

  // Count-up numbers: <span data-countup="40">0</span>
  var nums = document.querySelectorAll('[data-countup]');
  if ('IntersectionObserver' in window && nums.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = parseFloat(el.getAttribute('data-countup')), t0 = null;
        var tick = function (ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 1400, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { co.observe(n); });
  }

  // Demo-only forms: don't navigate away
  document.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('[type=submit]');
      if (btn) { btn.dataset.label = btn.dataset.label || btn.innerHTML; btn.innerHTML = 'Request sent — we’ll call you shortly'; }
    });
  });
})();
