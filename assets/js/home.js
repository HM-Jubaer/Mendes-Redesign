/* Mendes home — motion + interactions
   Ported from the reference teardowns:
   - Denox: ScrollSmoother (smooth .5), char-split headings (x:50, back.out, .02 stagger, "top 90%"),
            curtain image reveal, process "scroll-back" scrub, sticky nav > 50px, scroll-top.
   - Dentcure: 1.2s fade-up with stepped delays, footer title underline drawn on scroll.
   - Smilico: counters on view, slideshow crossfade timing. */
(function () {
  const motion = document.documentElement.classList.contains('js-motion');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  if (window.lucide) lucide.createIcons();

  /* ---------- Design preview: point the WordPress slugs at the static pages built so far ---------- */
  const BUILT = ['meet-dr-paul-m-mendes', 'meet-dr-charles-h-mendes', 'meet-the-team', 'what-sets-us-apart', 'office-visits', 'financial-information', 'before-and-after', 'testimonials', 'dental-faqs', 'office-location', 'appointment-request', 'blog', 'cosmetic-dentistry', 'teeth-whitening', 'veneers', 'bonding', 'bridges', 'crowns', 'implants', 'dentures', 'gum-disease', 'extractions', 'fillings', 'root-canals', 'digital-x-rays', 'emergency-dental-care'];
  $$('a[href^="/"]').forEach((a) => {
    const slug = a.getAttribute('href').slice(1).split('#')[0];
    if (slug === 'home') a.setAttribute('href', 'home.html');
    else if (BUILT.includes(slug)) a.setAttribute('href', `${slug}.html`);
  });

  /* ---------- Preloader (fades over .6s) ---------- */
  const pre = $('.preloader');
  const hidePre = () => pre && pre.classList.add('done');
  window.addEventListener('load', hidePre);
  setTimeout(hidePre, 2500);

  /* ---------- Mobile off-canvas: cloned from the desktop menu ---------- */
  const ocMenu = $('#ocMenu'), oc = $('#oc'), ocOpen = $('#ocOpen');
  $$('.menu > li').forEach((li) => {
    const a = li.querySelector(':scope > a');
    const sub = li.querySelector(':scope > .dd');
    const item = document.createElement('li');
    const label = a.textContent.trim();
    item.innerHTML = `<div class="oc-row"><a href="${a.getAttribute('href')}">${label}</a>${sub ? `<button aria-label="Show ${label} pages" aria-expanded="false"><i data-lucide="chevron-down"></i></button>` : ''}</div>`;
    if (sub) {
      const wrap = document.createElement('div');
      wrap.className = 'oc-sub';
      wrap.innerHTML = `<ul>${$$('a', sub).map((s) => `<li><a href="${s.getAttribute('href')}">${s.textContent}</a></li>`).join('')}</ul>`;
      item.appendChild(wrap);
      item.querySelector('button').addEventListener('click', (e) => {
        const open = item.classList.toggle('open');
        e.currentTarget.setAttribute('aria-expanded', open);
      });
    }
    ocMenu.appendChild(item);
  });
  if (window.lucide) lucide.createIcons();
  const setOc = (open) => {
    oc.classList.toggle('open', open);
    oc.setAttribute('aria-hidden', !open);
    ocOpen.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  ocOpen.addEventListener('click', () => setOc(true));
  $$('[data-oc-close]').forEach((el) => el.addEventListener('click', () => setOc(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setOc(false));

  /* ---------- Hero slideshow (5 slides, 5.5s, 1.2s crossfade) ---------- */
  const slides = $$('#slides figure'), dots = $('.slide-dots');
  let cur = 0, timer;
  if (slides.length) slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Show slide ${i + 1}`);
    if (!i) b.classList.add('on');
    b.addEventListener('click', () => { go(i); play(); });
    dots.appendChild(b);
  });
  const go = (i) => {
    slides[cur].classList.remove('on'); dots.children[cur].classList.remove('on');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('on'); dots.children[cur].classList.add('on');
  };
  const play = () => { clearInterval(timer); if (motion && slides.length) timer = setInterval(() => go(cur + 1), 5500); };
  play();

  /* ---------- Before/after compare sliders (range input drives --pos) ---------- */
  $$('[data-ba]').forEach((ba) => {
    const r = ba.querySelector('input');
    const set = () => ba.style.setProperty('--pos', r.value + '%');
    r.addEventListener('input', set);
    set();
  });

  /* ---------- FAQ accordion (one open at a time) ---------- */
  $$('.acc-q').forEach((q) => q.addEventListener('click', () => {
    const item = q.closest('.acc-item'), open = !item.classList.contains('open');
    $$('.acc-item.open', item.parentElement).forEach((i) => {
      i.classList.remove('open');
      i.querySelector('.acc-q').setAttribute('aria-expanded', 'false');
    });
    if (open) { item.classList.add('open'); q.setAttribute('aria-expanded', 'true'); }
    if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 400);
  }));

  /* ---------- Design preview forms: confirm on the button instead of posting ---------- */
  $$('form[data-demo]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = f.querySelector('[type=submit]');
    if (btn) btn.innerHTML = 'Request sent — we’ll call you shortly';
  }));

  /* ---------- Sticky nav (Denox: > 50px, slide-down .7s) + scroll-top ---------- */
  const navWrap = $('#navWrap'), toTop = $('#scrollTop');
  const onScroll = (y) => {
    navWrap.classList.toggle('fixed', y > 50 && innerWidth > 0);
    toTop.classList.toggle('on', y > 100);
  };

  /* ---------- No-GSAP / reduced-motion fallback ---------- */
  const hasGsap = window.gsap && window.ScrollTrigger;
  if (!motion || !hasGsap) {
    document.documentElement.classList.remove('js-motion');
    addEventListener('scroll', () => onScroll(scrollY), { passive: true });
    onScroll(scrollY);
    toTop.addEventListener('click', () => scrollTo({ top: 0 }));
    $$('[data-top]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0 }); }));
    $$('.ft h4').forEach((h) => h.classList.add('drawn'));
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

  /* Smooth scrolling with inertia (Denox ScrollSmoother) */
  const smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper', content: '#smooth-content',
    smooth: 0.5, effects: true, smoothTouch: 0.1, ignoreMobileResize: true,
  });
  document.documentElement.classList.add('has-smooth');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => onScroll(self.scroll()) });
  onScroll(0);
  toTop.addEventListener('click', () => smoother.scrollTo(0, true));
  $$('[data-top]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); smoother.scrollTo(0, true); }));

  /* Fade-up entrances (Dentcure/WOW: 30px rise, 1.2s, stepped delays) */
  $$('[data-fade]').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.2, ease: 'power2.out',
      delay: parseFloat(el.dataset.delay || 0),
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });

  /* Character-split headings (Denox .ani-text-1, exact values) */
  document.fonts.ready.then(() => {
    $$('.split').forEach((el) => {
      const split = new SplitText(el, { type: 'lines,words,chars', linesClass: 'split-line' });
      gsap.set(el, { perspective: 400 });
      gsap.set(split.chars, { opacity: 0, x: 50 });
      gsap.to(split.chars, {
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        x: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)', stagger: 0.02,
      });
    });
    ScrollTrigger.refresh();
  });

  /* Image curtain reveal (Denox .reveal; scale 1.3 settle per teardown note) */
  $$('.img-reveal').forEach((box) => {
    const img = box.querySelector('img');
    const tl = gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 88%', once: true } });
    tl.set(box, { autoAlpha: 1 })
      .from(box, { xPercent: -100, duration: 1, ease: 'power2.out' })
      .from(img, { xPercent: 100, scale: 1.3, duration: 1, ease: 'power2.out' }, '<');
  });

  /* Counters: eased tween instead of Denox's stepped countTo */
  $$('.count').forEach((el) => {
    const to = +el.dataset.to, o = { v: 0 };
    el.textContent = '0';
    gsap.to(o, {
      v: to, duration: 2.2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: () => (el.textContent = Math.round(o.v)),
    });
  });

  /* Footer title underline draws in (Dentcure .line-shape, 1s) */
  $$('.ft h4').forEach((h) => ScrollTrigger.create({ trigger: h, start: 'top bottom-=100', once: true, onEnter: () => h.classList.add('drawn') }));

  /* Desktop-only scroll set pieces */
  gsap.matchMedia().add('(min-width: 992px)', () => {
    /* "What sets us apart" cards scroll back into line (Denox process: 300/100/300) */
    if ($('#apart .sb-item')) gsap.fromTo('.sb-item', { y: (i) => [300, 100, 300][i] }, {
      y: 0, ease: 'none',
      scrollTrigger: { trigger: '#apart', start: 'top center', end: 'bottom 95%', scrub: true },
    });
    /* Gentle parallax on the welcome mosaic and the doctors' arches */
    if ($('.welcome .mosaic')) {
      gsap.to('.mosaic .m1', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.welcome', scrub: true } });
      gsap.to('.mosaic .m2', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.welcome', scrub: true } });
    }
    if ($('.doctors .arch')) gsap.to('.arch:nth-child(2) .frame', { y: -40, ease: 'none', scrollTrigger: { trigger: '.doctors', scrub: true } });
  });
})();
