(() => {
  const header = document.querySelector('[data-nav]');
  const nav = document.getElementById('primary-nav');
  const toggle = document.querySelector('[data-nav-toggle]');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const themeIcon = themeToggle?.querySelector('.theme-toggle__icon');
  const themeLabel = themeToggle?.querySelector('.theme-toggle__label');
  const yearEl = document.querySelectorAll('[data-year]');
  const form = document.querySelector('form');
  const successMessage = document.createElement('p');
  successMessage.className = 'form-success';
  successMessage.textContent = 'Thank you — our team will reply within two business days.';
  successMessage.setAttribute('tabindex', '-1');

  const themeKey = 'ztl-theme-preference';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const getStoredTheme = () => {
    try {
      return localStorage.getItem(themeKey);
    } catch (error) {
      return null;
    }
  };

  const setStoredTheme = (value) => {
    try {
      localStorage.setItem(themeKey, value);
    } catch (error) {
      /* no-op in private mode */
    }
  };

  const clearStoredTheme = () => {
    try {
      localStorage.removeItem(themeKey);
    } catch (error) {
      /* no-op */
    }
  };

  let manualTheme = false;

  const applyTheme = (mode, { persist = false } = {}) => {
    const normalized = mode === 'dark' ? 'dark' : 'light';
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${normalized}`);

    if (themeToggle) {
      const switchTo = normalized === 'dark' ? 'light' : 'dark';
      themeToggle.setAttribute('aria-pressed', normalized === 'dark' ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', `Switch to ${switchTo} mode`);
      themeToggle.setAttribute('title', `Switch to ${switchTo} mode`);
    }

    if (themeLabel) {
      themeLabel.textContent = normalized === 'dark' ? 'Light mode' : 'Dark mode';
    }

    if (themeIcon) {
      themeIcon.textContent = normalized === 'dark' ? '🌞' : '🌗';
    }

    if (persist) {
      setStoredTheme(normalized);
      manualTheme = true;
    }
  };

  const storedTheme = getStoredTheme();
  manualTheme = Boolean(storedTheme);
  const initialTheme = storedTheme ?? (prefersDark.matches ? 'dark' : 'light');
  applyTheme(initialTheme);

  const closeNav = () => {
    nav?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
  };

  toggle?.addEventListener('click', () => {
    const isOpen = nav?.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        closeNav();
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNav();
    }
  });

  themeToggle?.addEventListener('click', () => {
    const next = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
    applyTheme(next, { persist: true });
  });

  themeToggle?.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    clearStoredTheme();
    manualTheme = false;
    applyTheme(prefersDark.matches ? 'dark' : 'light');
  });

  prefersDark.addEventListener('change', (event) => {
    if (!manualTheme) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });

  if (header) {
    let lastScroll = window.scrollY;
    window.addEventListener('scroll', () => {
      const current = window.scrollY;
      if (current > lastScroll && current > 120) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastScroll = current;
    });
  }

  const year = String(new Date().getFullYear());
  yearEl.forEach((el) => {
    el.textContent = year;
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    form.reset();
    if (!form.contains(successMessage)) {
      form.appendChild(successMessage);
    }
    successMessage.focus?.();
  });
})();
