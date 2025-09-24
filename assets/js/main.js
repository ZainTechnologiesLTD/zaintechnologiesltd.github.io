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
    toggle?.classList.remove('is-active');
  };

  toggle?.addEventListener('click', () => {
    const isOpen = nav?.classList.toggle('is-open');
    const expanded = Boolean(isOpen);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.classList.toggle('is-active', expanded);
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

      // Enhanced form submission with analytics and database storage
      const contactForm = document.querySelector('.contact-form');
      if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const submitBtn = contactForm.querySelector('.btn--submit');
          const originalText = submitBtn.textContent;
          
          // Show loading state
          submitBtn.textContent = 'Sending...';
          submitBtn.disabled = true;
          
          // Track form submission attempt
          trackEvent('form_submit_attempt', 'engagement');
          
          // Collect form data
          const formData = new FormData(contactForm);
          const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            company: formData.get('company'),
            position: formData.get('position'),
            interest: formData.get('interest'),
            budget: formData.get('budget'),
            timeline: formData.get('timeline'),
            message: formData.get('message'),
            consent: formData.get('consent') === 'on',
            newsletter: formData.get('newsletter') === 'on',
            source: 'contact_form'
          };
          
          // Save to database if available
          let contactId = null;
          if (window.zainDB && window.zainDB.isReady()) {
            try {
              contactId = await window.zainDB.saveContact(contactData);
              console.log('Contact saved to database:', contactId);
            } catch (error) {
              console.error('Failed to save contact:', error);
            }
          }
          
          // Simulate API call (replace with actual endpoint)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Show success state
          submitBtn.textContent = 'Message Sent!';
          submitBtn.style.background = 'var(--green-500)';
          
          // Track successful submission
          trackEvent('form_submit_success', 'conversion', {
            contactId: contactId,
            hasPhone: !!contactData.phone,
            hasCompany: !!contactData.company,
            budget: contactData.budget,
            timeline: contactData.timeline
          });
          
          // Reset form after delay
          setTimeout(() => {
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
          }, 3000);
        });
      }  // Legacy form fallback
  form?.addEventListener('submit', (event) => {
    if (event.target.id !== 'contact-form') {
      event.preventDefault();
      form.reset();
      if (!form.contains(successMessage)) {
        form.appendChild(successMessage);
      }
      successMessage.focus?.();
    }
  });

  // Enhanced FAQ functionality
  const initFAQ = () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const summary = item.querySelector('summary');
      if (summary) {
        summary.addEventListener('click', (e) => {
          // Close other FAQ items for better UX
          faqItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.open) {
              otherItem.open = false;
            }
          });
        });
      }
    });
  };

  // Smooth scroll for anchor links
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  };

  // Intersection Observer for animations
  const initScrollAnimations = () => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.card, .testimonial, .faq-item, .product-showcase').forEach(el => {
      observer.observe(el);
    });
  };

  // Enhanced loading performance
  const initLazyLoading = () => {
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    } else {
      // Fallback for older browsers
      const script = document.createElement('script');
      script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
      document.head.appendChild(script);
    }
  };

  // Service Worker Registration
  const initServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('SW registered: ', registration);
            
            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Show update available notification
                  showUpdateNotification();
                }
              });
            });
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  };

  // Show update notification
  const showUpdateNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <p>A new version is available!</p>
        <button class="btn btn--primary btn--sm" onclick="window.location.reload()">Update Now</button>
        <button class="btn btn--ghost btn--sm" onclick="this.parentElement.parentElement.remove()">Later</button>
      </div>
    `;
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  };

  // Initialize enhanced features
  initFAQ();
  initSmoothScroll();
  initScrollAnimations();
  initLazyLoading();
  initServiceWorker();

  // Performance metrics (optional)
  if ('PerformanceObserver' in window) {
    const perfObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
      });
    });
    
    try {
      perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Silently handle unsupported metrics
    }
  }

  // Back to Top Button
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    // Smooth scroll to top
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
})();
