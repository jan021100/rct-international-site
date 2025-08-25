import { onUserChanged } from "/assets/js/firebase.js";

onUserChanged((user) => {
  const signedOutEls = document.querySelectorAll("[data-when='signed-out']");
  const signedInEls  = document.querySelectorAll("[data-when='signed-in']");
  signedOutEls.forEach(e => e.classList.toggle("hidden", !!user));
  signedInEls.forEach(e => e.classList.toggle("hidden", !user));
});

(function themeToggleSetup(){
  const docEl = document.documentElement;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(theme, persist = true){
    if (theme === 'dark') docEl.classList.add('dark');
    else docEl.classList.remove('dark');
    docEl.dataset.theme = theme;
    if (persist) localStorage.setItem('theme', theme);

    // Update any labels
    document.querySelectorAll('[data-theme-label]').forEach(el => {
      el.textContent = theme === 'dark' ? 'Dark' : 'Light';
    });

    // Keep button aria state in sync
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
    });
  }

  // Follow system changes only if user hasn’t chosen
  mq.addEventListener?.('change', e => {
    const saved = localStorage.getItem('theme');
    if (!saved) applyTheme(e.matches ? 'dark' : 'light', false);
  });

  // Init from saved or system
  (function initFromState(){
    const saved = localStorage.getItem('theme');
    const current = saved || (mq.matches ? 'dark' : 'light');
    applyTheme(current, false);
  })();

  // Toggle (delegated so it works after header injection)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    const isDark = docEl.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark', true);
  });
})();

// Mobile menu toggle
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#mobile-menu-btn');
  if (btn) {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
  }
});

document.addEventListener('click', (e) => {
  if (e.target.id === 'close-banner') {
    document.getElementById('beta-banner')?.remove();
  }
});