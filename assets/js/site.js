import { onUserChanged } from "/assets/js/firebase.js";

/* -------- auth UI toggles -------- */
onUserChanged((user) => {
  const signedOutEls = document.querySelectorAll("[data-when='signed-out']");
  const signedInEls  = document.querySelectorAll("[data-when='signed-in']");
  signedOutEls.forEach(e => e.classList.toggle("hidden", !!user));
  signedInEls.forEach(e => e.classList.toggle("hidden", !user));
});

/* -------- theme toggle -------- */
(function themeToggleSetup(){
  const docEl = document.documentElement;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(theme, persist = true){
    if (theme === 'dark') docEl.classList.add('dark');
    else docEl.classList.remove('dark');
    docEl.dataset.theme = theme;
    if (persist) localStorage.setItem('theme', theme);

    document.querySelectorAll('[data-theme-label]').forEach(el => {
      el.textContent = theme === 'dark' ? 'Dark' : 'Light';
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
    });
  }

  mq.addEventListener?.('change', e => {
    const saved = localStorage.getItem('theme');
    if (!saved) applyTheme(e.matches ? 'dark' : 'light', false);
  });

  (function initFromState(){
    const saved = localStorage.getItem('theme');
    const current = saved || (mq.matches ? 'dark' : 'light');
    applyTheme(current, false);
  })();

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    const isDark = docEl.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark', true);
  });
})();

/* -------- header behaviors (delegated so header.html can be injected) -------- */

// Mobile menu toggle
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#mobile-menu-btn');
  if (!btn) return;
  const mm = document.getElementById('mobile-menu');
  if (!mm) return;
  mm.classList.toggle('hidden');
  const expanded = !mm.classList.contains('hidden');
  btn.setAttribute('aria-expanded', String(expanded));
});

// Close beta banner
document.addEventListener('click', (e) => {
  if (e.target.id === 'close-banner') {
    document.getElementById('beta-banner')?.remove();
  }
});

// Language dropdown
document.addEventListener('click', (e) => {
  const toggle = e.target.closest('#lang-toggle');
  const menu = document.getElementById('lang-menu');

  if (toggle) {
    menu?.classList.toggle('hidden');
    toggle.setAttribute('aria-expanded', String(!menu.classList.contains('hidden')));
    return;
  }

  // click outside -> close
  if (menu && !menu.classList.contains('hidden')) {
    const inside = e.target.closest('#lang-menu');
    if (!inside) {
      menu.classList.add('hidden');
      const t = document.getElementById('lang-toggle');
      t?.setAttribute('aria-expanded', 'false');
    }
  }
});