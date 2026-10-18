/* Mendes Home V2 — interactions ported from Dentia "Homepage 2"
   (WOW entrances, header .smaller / .scroll-down, side panel, mobile menu,
   counters, Owl-style centre carousel, back-to-top). No dependencies besides lucide. */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const anim = document.documentElement.classList.contains('js-anim');

  if (window.lucide) lucide.createIcons();

  /* fx-slide buttons: hover copy comes from the label */
  $$('.fx').forEach((b) => (b.dataset.hover = b.textContent.trim()));

  /* Preloader — fades over .5s on load */
  const pl = $('.pl');
  const done = () => pl && pl.classList.add('done');
  addEventListener('load', done);
  setTimeout(done, 2500);

  /* ---------- Header: .smaller as soon as the page scrolls, hides on scroll down past 80px ---------- */
  const hd = $('#hd'), btt = $('#btt'), desk = matchMedia('(min-width:1200px)');
  let last = 0;
  const onScroll = () => {
    const y = scrollY;
    hd.classList.toggle('smaller', desk.matches && y > 0);
    if (y > last && y > 80) hd.classList.add('scroll-down');
    else if (y < last) hd.classList.remove('scroll-down');
    last = y;
    btt.classList.toggle('show', y > 100);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const toTop = (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: anim ? 'smooth' : 'auto' }); };
  $$('[data-top]').forEach((a) => a.addEventListener('click', toTop));

  /* ---------- Side panel (desktop burger) / mobile menu ---------- */
  const sp = $('#sp'), spBg = $('#spBg'), burger = $('#burger'), mm = $('#mm');
  const setSp = (open) => {
    sp.classList.toggle('open', open); spBg.classList.toggle('open', open);
    sp.setAttribute('aria-hidden', !open); burger.setAttribute('aria-expanded', open);
  };
  const setMm = (open) => { mm.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; };
  burger.addEventListener('click', () => (desk.matches ? setSp(!sp.classList.contains('open')) : setMm(!mm.classList.contains('open'))));
  $('#spClose').addEventListener('click', () => setSp(false));
  spBg.addEventListener('click', () => setSp(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { setSp(false); setMm(false); } });
  desk.addEventListener('change', () => { setSp(false); setMm(false); });

  /* Mobile menu is cloned from the desktop menu so the two never drift apart */
  const list = $('#mmList');
  $$('#menu > li').forEach((li) => {
    const a = li.querySelector(':scope > a'), sub = li.querySelector(':scope > ul');
    const item = document.createElement('li');
    item.innerHTML = `<div class="row"><a href="${a.getAttribute('href')}">${a.textContent.trim()}</a>${sub ? '<button aria-expanded="false" aria-label="Show pages"><i data-lucide="plus"></i></button>' : ''}</div>`;
    if (sub) {
      const box = document.createElement('div');
      box.className = 'sm';
      box.innerHTML = `<ul>${$$('a', sub).map((s) => `<li><a href="${s.getAttribute('href')}">${s.textContent}</a></li>`).join('')}</ul>`;
      item.appendChild(box);
      item.querySelector('button').addEventListener('click', (e) => {
        const open = item.classList.toggle('open');
        box.style.height = open ? box.scrollHeight + 'px' : '0';
        e.currentTarget.setAttribute('aria-expanded', open);
      });
    }
    list.appendChild(item);
  });
  if (window.lucide) lucide.createIcons();

  /* ---------- Entrances (WOW offset 0, animate.css names, data-delay in s) ---------- */
  if (anim && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.style.animationDelay = (el.dataset.delay || 0) + 's';
      el.classList.add('animated', el.dataset.anim);
      io.unobserve(el);
    }), { rootMargin: '0px' });
    $$('[data-anim]').forEach((el) => io.observe(el));
  }

  /* ---------- Counters: start together when the row appears ---------- */
  const row = $('.cnt-row');
  const run = () => $$('[data-to]', row).forEach((el) => {
    const to = +el.dataset.to, dur = 3000, t0 = performance.now();
    const tick = (t) => { const k = Math.min((t - t0) / dur, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  if (anim) {
    $$('[data-to]', row).forEach((el) => (el.textContent = '0'));
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { run(); o.disconnect(); } }).observe(row);
  }

  /* ---------- Quote carousel (Owl: margin 25, 1/2/3/4 per view, dots, drag, 250ms) ---------- */
  const qc = $('#qc'), track = $('.qc-track', qc), cards = $$('.qc-card', track), dots = $('#qcDots');
  let page = 0, per = 4, pages = 1;
  const perView = () => (innerWidth >= 1200 ? 4 : innerWidth >= 992 ? 3 : innerWidth >= 600 ? 2 : 1);
  const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
  const go = (p) => {
    page = Math.max(0, Math.min(p, pages - 1));
    const idx = Math.min(page * per, cards.length - per);
    track.style.transform = `translateX(${-idx * step()}px)`;
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === page));
  };
  const build = () => {
    per = perView(); pages = Math.ceil(cards.length / per);
    dots.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Slide ${i + 1}`);
      b.addEventListener('click', () => go(i));
      dots.appendChild(b);
    }
    go(Math.min(page, pages - 1));
  };
  build();
  addEventListener('resize', build);
  let x0 = null;
  qc.addEventListener('pointerdown', (e) => { x0 = e.clientX; qc.classList.add('drag'); });
  addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0; x0 = null; qc.classList.remove('drag');
    if (Math.abs(dx) > 40) go(page + (dx < 0 ? 1 : -1));
  });
})();
