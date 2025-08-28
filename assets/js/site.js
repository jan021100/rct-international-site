import { onUserChanged } from "/assets/js/firebase.js";

/* -------- auth UI toggles -------- */
onUserChanged((user) => {
  const signedOutEls = document.querySelectorAll("[data-when='signed-out']");
  const signedInEls  = document.querySelectorAll("[data-when='signed-in']");
  signedOutEls.forEach(e => e.classList.toggle("hidden", !!user));
  signedInEls.forEach(e => e.classList.toggle("hidden", !user));
});

/* -------- theme toggle (temporarily disabled) -------- */
(function themeToggleSetup(){
  const docEl = document.documentElement;

  // Force light mode and clear any saved preference
  docEl.classList.remove('dark');
  docEl.dataset.theme = 'light';
  try { localStorage.removeItem('theme'); } catch {}

  // Make any theme toggle button inert/disabled (header is injected, so do this repeatedly a bit)
  const disableToggles = () => {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('disabled', 'true');
      btn.setAttribute('aria-disabled', 'true');
      btn.classList.add('opacity-60','cursor-not-allowed');
      const label = btn.querySelector('[data-theme-label]');
      if (label) label.textContent = 'Light';
      btn.title = 'Dark mode coming soon';
    });
  };
  disableToggles();
  // Header is injected later → try a few times
  const tries = [100, 300, 800];
  tries.forEach(t => setTimeout(disableToggles, t));

  // Swallow clicks on any remaining toggle (no theme switching)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    // Optional: brief visual feedback
    btn.classList.add('ring-1','ring-neutral-300');
    setTimeout(() => btn.classList.remove('ring-1','ring-neutral-300'), 150);
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

/* -------- lightweight signup popover (top-right) -------- */
(function signupPopover(){
  // Show only on full reloads (not when navigating between pages)
  function isReload(){
    const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    return nav ? nav.type === 'reload' : (performance.navigation && performance.navigation.type === 1);
  }

  const EXCLUDED_PATHS = [
    '/login.html','/account.html','/spolekjoin.html','/evjoin.html'
  ];
  function skipThisPage(){
    const p = location.pathname.toLowerCase();
    return EXCLUDED_PATHS.some(x => p.endsWith(x));
  }

  // Build popover UI
  function build(){
    const host = document.createElement('div');
    host.id = 'signup-popover-host';
    host.className = 'fixed inset-0 z-[60] pointer-events-none'; // full-screen layer, but click-through

    // panel wrapper (pointer events enabled only on panel)
    host.innerHTML = `
      <div class="absolute top-[84px] right-4 md:right-6 pointer-events-auto">
        <div class="max-w-xs rounded-2xl border border-neutral-300/60 bg-white shadow-soft dark:bg-neutral-950 dark:border-neutral-700">
          <div class="px-4 py-3 flex items-start gap-3">
            <div class="mt-[2px]">
              <!-- small icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z"/>
              </svg>
            </div>
            <div class="text-sm">
              <div class="font-semibold">Create an account</div>
              <p class="mt-1 opacity-80">
                For athletes who already train with us or plan to join our activities.
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <a href="/login.html" class="px-3 py-1.5 rounded-lg border text-sm">Sign in</a>
                <a href="/login.html#create" class="px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-sm dark:bg-base-50 dark:text-neutral-900 hover:opacity-90">Create account</a>
              </div>
            </div>
            <button id="signup-popover-close" class="ml-auto -mr-1 -mt-1 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-lg leading-none" aria-label="Close">×</button>
          </div>
        </div>
      </div>
    `;
    return host;
  }

  function show(){
    if (document.getElementById('signup-popover-host')) return;
    const pop = build();
    document.body.appendChild(pop);
    pop.querySelector('#signup-popover-close')?.addEventListener('click', () => {
      pop.remove(); // will reappear on next full reload
    });
  }

  try {
    if (skipThisPage()) return;
    // Only show on *reload* and only if signed out
    onUserChanged(user => {
      if (!user && isReload()) {
        // small delay so header finishes rendering
        setTimeout(show, 250);
      }
    });
  } catch (_) {/* never block the page */}
})();