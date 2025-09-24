import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.resolve(__dirname, '../assets/js/main.js');
const mainScript = readFileSync(scriptPath, 'utf-8');

const createLocalStorageMock = () => {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    }
  };
};

const createMatchMedia = (initialMatches = false) => {
  const listeners = new Set();
  const mediaQueryList = {
    matches: initialMatches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (_event, handler) => {
      listeners.add(handler);
    },
    removeEventListener: (_event, handler) => {
      listeners.delete(handler);
    },
    addListener: (handler) => {
      listeners.add(handler);
    },
    removeListener: (handler) => {
      listeners.delete(handler);
    },
    dispatchChange: (value) => {
      mediaQueryList.matches = value;
      listeners.forEach((handler) => handler({ matches: value }));
      if (typeof mediaQueryList.onchange === 'function') {
        mediaQueryList.onchange({ matches: value });
      }
    }
  };

  return () => mediaQueryList;
};

const mountDom = ({ prefersDark = false } = {}) => {
  const dom = new JSDOM(
    `<!DOCTYPE html>
     <html lang="en">
       <body>
         <header data-nav>
           <div class="header-inner">
             <button class="nav-toggle" data-nav-toggle aria-expanded="false" aria-controls="primary-nav" type="button">
               <span class="nav-toggle__line"></span>
               <span class="nav-toggle__line"></span>
               <span class="nav-toggle__line"></span>
               <span class="sr-only">Toggle navigation</span>
             </button>
             <nav id="primary-nav">
               <a href="#home">Home</a>
             </nav>
           </div>
         </header>
         <main>
           <button class="btn" data-theme-toggle aria-pressed="false">
             <span class="theme-toggle__icon"></span>
             <span class="theme-toggle__label"></span>
           </button>
           <span data-year></span>
         </main>
         <button id="back-to-top"></button>
       </body>
     </html>`,
    {
      url: 'https://example.com',
      pretendToBeVisual: true
    }
  );

  const { window } = dom;
  const { document } = window;

  global.window = window;
  global.document = document;
  global.navigator = window.navigator;
  global.HTMLElement = window.HTMLElement;
  global.Node = window.Node;
  global.MutationObserver = window.MutationObserver;

  Object.defineProperty(window, 'matchMedia', {
    value: createMatchMedia(prefersDark),
    configurable: true
  });

  Object.defineProperty(window, 'localStorage', {
    value: createLocalStorageMock(),
    configurable: true
  });

  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  window.PerformanceObserver = class {
    observe() {}
    disconnect() {}
  };

  Object.defineProperty(window.navigator, 'serviceWorker', {
    value: {
      register: () => Promise.resolve({ addEventListener: () => {} })
    },
    configurable: true
  });

  window.scrollTo = () => {};

  window.eval(mainScript);

  const cleanup = () => {
    dom.window.close();
    delete global.window;
    delete global.document;
    delete global.navigator;
    delete global.HTMLElement;
    delete global.Node;
    delete global.MutationObserver;
  };

  return { window, document, cleanup };
};

describe('Site interactions', () => {
  it('toggles between dark and light themes', () => {
    const { window, document, cleanup } = mountDom();

    try {
      const body = document.body;
      const themeToggle = document.querySelector('[data-theme-toggle]');

      expect(body.classList.contains('theme-light')).toBe(true);
      expect(themeToggle.getAttribute('aria-pressed')).toBe('false');

      themeToggle.dispatchEvent(new window.Event('click', { bubbles: true }));
      expect(body.classList.contains('theme-dark')).toBe(true);
      expect(body.classList.contains('theme-light')).toBe(false);
      expect(themeToggle.getAttribute('aria-pressed')).toBe('true');

      themeToggle.dispatchEvent(new window.Event('click', { bubbles: true }));
      expect(body.classList.contains('theme-light')).toBe(true);
      expect(body.classList.contains('theme-dark')).toBe(false);
      expect(themeToggle.getAttribute('aria-pressed')).toBe('false');
    } finally {
      cleanup();
    }
  });

  it('updates nav toggle icon state when menu opens and closes', () => {
    const { window, document, cleanup } = mountDom();

    try {
      const navToggle = document.querySelector('[data-nav-toggle]');
      const nav = document.getElementById('primary-nav');

      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        configurable: true,
        writable: true
      });

      expect(nav.classList.contains('is-open')).toBe(false);
      expect(navToggle.classList.contains('is-active')).toBe(false);
      expect(document.body.classList.contains('nav-open')).toBe(false);

      navToggle.dispatchEvent(new window.Event('click', { bubbles: true }));
      expect(nav.classList.contains('is-open')).toBe(true);
      expect(navToggle.classList.contains('is-active')).toBe(true);
      expect(navToggle.getAttribute('aria-expanded')).toBe('true');
      expect(document.body.classList.contains('nav-open')).toBe(true);

      navToggle.dispatchEvent(new window.Event('click', { bubbles: true }));
      expect(nav.classList.contains('is-open')).toBe(false);
      expect(navToggle.classList.contains('is-active')).toBe(false);
      expect(navToggle.getAttribute('aria-expanded')).toBe('false');
      expect(document.body.classList.contains('nav-open')).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('closes mobile navigation when clicking outside the menu', () => {
    const { window, document, cleanup } = mountDom();

    try {
      const navToggle = document.querySelector('[data-nav-toggle]');
      const nav = document.getElementById('primary-nav');

      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        configurable: true,
        writable: true
      });

      navToggle.dispatchEvent(new window.Event('click', { bubbles: true }));
      expect(nav.classList.contains('is-open')).toBe(true);
      expect(document.body.classList.contains('nav-open')).toBe(true);

      document.body.dispatchEvent(new window.Event('click', { bubbles: true }));

      expect(nav.classList.contains('is-open')).toBe(false);
      expect(document.body.classList.contains('nav-open')).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('resets mobile navigation state when resizing to desktop', () => {
    const { window, document, cleanup } = mountDom();

    try {
      const navToggle = document.querySelector('[data-nav-toggle]');
      const nav = document.getElementById('primary-nav');

      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        configurable: true,
        writable: true
      });

      navToggle.dispatchEvent(new window.Event('click', { bubbles: true }));
      expect(nav.classList.contains('is-open')).toBe(true);
      expect(document.body.classList.contains('nav-open')).toBe(true);

      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        configurable: true,
        writable: true
      });

      window.dispatchEvent(new window.Event('resize'));

      expect(nav.classList.contains('is-open')).toBe(false);
      expect(document.body.classList.contains('nav-open')).toBe(false);
      expect(navToggle.getAttribute('aria-expanded')).toBe('false');
    } finally {
      cleanup();
    }
  });
});
