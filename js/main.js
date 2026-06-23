/* CLEAR TONE HEARING SOLUTIONS — Vanilla JS Premium Behaviors
   Loading screen, dark mode, scroll progress, smooth nav, reveal, parallax,
   counters, testimonials carousel, FAQ accordion, service filter,
   appointment modal, floating WhatsApp/Call, back-to-top.
*/

(function(){
  'use strict';

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // ---------------------------
  // Loading screen
  // ---------------------------
  const loader = $('#cths-loader');
  const hideLoader = () => {
    if (!loader) return;
    loader.setAttribute('aria-hidden','true');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(hideLoader, 260);
    });
  } else {
    hideLoader();
  }

  // ---------------------------
  // Dark mode toggle (persistent)
  // ---------------------------
  const themeKey = 'cths-theme';
  const root = document.documentElement;
  const themeToggle = $('#cths-theme-toggle');

  function applyTheme(theme){
    if (theme === 'dark') root.setAttribute('data-theme','dark');
    else root.removeAttribute('data-theme');
  }

  function initTheme(){
    const saved = localStorage.getItem(themeKey);
    if (saved === 'dark') applyTheme('dark');
    else applyTheme('light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      localStorage.setItem(themeKey, next);
      applyTheme(next);
      themeToggle.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    });
  }

  initTheme();

  // ---------------------------
  // Scroll progress indicator
  // ---------------------------
  const progress = $('#cths-progress');
  function onProgress(){
    if (!progress) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight <= 0 ? 0 : Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    progress.style.width = pct + '%';
  }
  window.addEventListener('scroll', onProgress, {passive:true});
  onProgress();

  // ---------------------------
  // Back to top
  // ---------------------------
  const backTop = $('#cths-backtop');
  function onBackTop(){
    if (!backTop) return;
    backTop.style.display = window.scrollY > 700 ? 'grid' : 'none';
  }
  window.addEventListener('scroll', onBackTop, {passive:true});
  onBackTop();
  if (backTop) {
    backTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }

  // ---------------------------
  // Smooth navigation + active states
  // ---------------------------
  function normalizePath(p){
    return p.replace(/\?.*$/,'').replace(/#.*$/,'').replace(/\/+$/,'').toLowerCase();
  }

  const current = normalizePath(location.pathname);

  // Highlight active nav links (data-page)
  $$('.cths-nav-link[data-page]').forEach(a => {
    const page = normalizePath(a.getAttribute('href') || '');
    if (current.endsWith(page) || page.endsWith(current)) a.setAttribute('aria-current','page');
  });

  // Smooth anchor navigation for same-page hashes
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;

    const href = a.getAttribute('href');
    if (!href) return;

    // Appointment buttons handle their own actions.
    if (a.getAttribute('data-appointment') === 'open') return;

    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });

  // ---------------------------
  // Scroll reveal (GSAP-style feel)
  // ---------------------------
  const revealEls = $$('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    }, {threshold: 0.14, rootMargin: '0px 0px -10% 0px'});

    revealEls.forEach(el => {
      const type = el.getAttribute('data-reveal');
      if (!type) return;
      el.setAttribute('data-reveal', type);
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ---------------------------
  // Parallax
  // ---------------------------
  const parallaxEls = $$('.cths-parallax');
  if (parallaxEls.length) {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          const vh = window.innerHeight;
          parallaxEls.forEach(wrap => {
            const bg = $('.parallax-bg', wrap);
            if (!bg) return;
            const rect = wrap.getBoundingClientRect();
            const center = rect.top + rect.height/2;
            const dist = (center - vh/2) / vh;
            const move = Math.round(dist * 26);
            bg.style.transform = `translate3d(0, ${move}px, 0)`;
          });
          ticking = false;
        });
      }, {passive:true});
    }
  }

  // ---------------------------
  // Animated counters (run ONCE) 
  // ---------------------------
  const counterEls = $$('.cths-counter[data-to]');

  function animateCounter(el){
    if (!el) return;
    // run only once
    if (el.dataset.counted === 'true') return;

    const to = Number(el.getAttribute('data-to')) || 0;
    const duration = Number(el.getAttribute('data-duration')) || 1100;
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.textContent = prefix + to + suffix;
      el.dataset.counted = 'true';
      return;
    }

    const start = 0;
    const startTime = performance.now();

    function tick(now){
      if (el.dataset.counted === 'true') return;
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const val = Math.round(start + (to - start) * eased);
      el.textContent = prefix + val + suffix;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        // ensure final value + mark as completed
        el.textContent = prefix + to + suffix;
        el.dataset.counted = 'true';
      }
    }

    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const ioC = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // guard: run once
          if (entry.target.dataset.counted === 'true') {
            ioC.unobserve(entry.target);
            return;
          }
          animateCounter(entry.target);
          ioC.unobserve(entry.target);
        }
      });
    }, {threshold: 0.25});

    counterEls.forEach(el => {
      if (el.dataset.counted === 'true') return;
      ioC.observe(el);
    });
  } else {
    counterEls.forEach(el => animateCounter(el));
  }


  // ---------------------------
  // FAQ accordion
  // ---------------------------
  $$('.cths-acc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.cths-acc-item');
      if (!item) return;
      const panel = $('.cths-acc-panel', item);
      if (!panel) return;

      const isOpen = item.getAttribute('data-open') === 'true';
      // close siblings
      $$('.cths-acc-item[data-open="true"]').forEach(openItem => {
        openItem.setAttribute('data-open','false');
        const p = $('.cths-acc-panel', openItem);
        if (p) p.style.maxHeight = '0px';
      });

      if (!isOpen) {
        item.setAttribute('data-open','true');
        const content = $('.cths-acc-content', item);
        const h = content ? content.scrollHeight : 160;
        panel.style.maxHeight = h + 'px';
      } else {
        item.setAttribute('data-open','false');
        panel.style.maxHeight = '0px';
      }
    });
  });

  // ---------------------------
  // Testimonials carousel (simple)
  // ---------------------------
  const carousel = $('#cths-testimonials');
  if (carousel) {
    const track = $('.carousel-track', carousel);
    const prev = $('#cths-test-prev');
    const next = $('#cths-test-next');

    let index = 0;

    function getStep(){
      const isWide = window.innerWidth >= 900;
      return isWide ? 1 : 0; // we still slide per card; layout handles width
    }

    function slide(dir){
      if (!track) return;
      const items = $$('.test-card', track);
      if (!items.length) return;

      const card = items[0];
      const stepPx = card.getBoundingClientRect().width + 12; // gap

      index = Math.max(0, Math.min(items.length - 1, index + dir));
      track.scrollTo({left: index * stepPx, behavior:'smooth'});
    }

    if (prev) prev.addEventListener('click', (e) => {e.preventDefault(); slide(-1);});
    if (next) next.addEventListener('click', (e) => {e.preventDefault(); slide(1);});

    // initial
    track.scrollLeft = 0;
  }

  // ---------------------------
  // Services filter
  // ---------------------------
  const pillsWrap = $('#cths-service-pills');
  const cardsWrap = $('#cths-service-grid');

  if (pillsWrap && cardsWrap) {
    const pillBtns = $$('.cths-pill', pillsWrap);
    const cards = $$('.cths-service-card', cardsWrap);

    function applyFilter(key){
      cards.forEach(card => {
        const tags = (card.getAttribute('data-tags') || '').toLowerCase();
        const match = key === 'all' ? true : tags.includes(key);
        card.style.display = match ? '' : 'none';
      });
    }

    pillBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        pillBtns.forEach(b => b.setAttribute('aria-pressed','false'));
        btn.setAttribute('aria-pressed','true');
        applyFilter(btn.getAttribute('data-filter') || 'all');
      });
    });

    // init
    const active = pillBtns.find(b => b.getAttribute('aria-pressed') === 'true');
    applyFilter(active ? (active.getAttribute('data-filter') || 'all') : 'all');
  }

  // ---------------------------
  // Appointment modal
  // ---------------------------
  const modal = $('#cths-modal');
  const backdrop = $('#cths-modal-backdrop');
  const openers = $$('[data-appointment="open"]');
  const closers = $$('.cths-modal-close, [data-modal-close="true"]');

  function setModalOpen(isOpen){
    if (isOpen) {
      modal.setAttribute('aria-hidden','false');
      backdrop.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';

      const first = $('input, select, textarea, button', modal);
      if (first) first.focus();
    } else {
      modal.setAttribute('aria-hidden','true');
      backdrop.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
    }
  }

  openers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setModalOpen(true);
    });
  });

  closers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setModalOpen(false);
    });
  });

  if (backdrop) {
    backdrop.addEventListener('click', () => setModalOpen(false));
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const isOpen = modal && modal.getAttribute('aria-hidden') === 'false';
      if (isOpen) setModalOpen(false);
    }
  });

  // ---------------------------
  // Mobile drawer (optional)
  // ---------------------------
  const drawer = $('#cths-drawer');
  const burger = $('#cths-burger');
  const drawerClose = $('#cths-drawer-close');

  if (drawer && burger) {
    burger.addEventListener('click', () => drawer.setAttribute('aria-hidden','false'));
  }
  if (drawerClose && drawer) {
    drawerClose.addEventListener('click', () => drawer.setAttribute('aria-hidden','true'));
  }
  if (drawer) {
    const back = $('.drawer-back', drawer);
    if (back) back.addEventListener('click', () => drawer.setAttribute('aria-hidden','true'));
  }

  // ---------------------------
  // Form UX (front-end only)
  // ---------------------------
  const form = $('#cths-appointment-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = $('#cths-appointment-submit');
      const status = $('#cths-appointment-status');
      if (btn) btn.disabled = true;

      const name = $('#cths-field-name')?.value?.trim() || 'there';
      const msg = `Thanks, ${name}! Your appointment request is ready to be processed.`;
      if (status) status.textContent = msg;

      // simulate
      setTimeout(() => {
        if (btn) btn.disabled = false;
        if (status) status.textContent = msg;
      }, 650);
    });
  }

})();

