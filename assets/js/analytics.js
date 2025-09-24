// Analytics and Performance Monitoring for Zain Technologies Ltd.
// Enhanced tracking and performance monitoring

class ZainAnalytics {
  constructor() {
    this.initTime = Date.now();
    this.interactions = [];
    this.performance = {};
    
    this.init();
  }

  init() {
    this.trackPageLoad();
    this.trackUserInteractions();
    this.trackFormEngagement();
    this.trackScrollDepth();
    this.monitorPerformance();
  }

  trackPageLoad() {
    // Core Web Vitals tracking
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.performance.lcp = lastEntry.startTime;
        this.sendMetric('lcp', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];
        this.performance.fid = firstInput.processingStart - firstInput.startTime;
        this.sendMetric('fid', this.performance.fid);
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.performance.cls = clsValue;
        this.sendMetric('cls', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }

    // Page timing metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        this.performance.loadTime = navigation.loadEventEnd - navigation.fetchStart;
        this.performance.domReady = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        
        this.sendMetric('page_load_time', this.performance.loadTime);
        this.sendMetric('dom_ready_time', this.performance.domReady);
      }, 0);
    });
  }

  trackUserInteractions() {
    // Button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('button, .btn, [role="button"]')) {
        this.trackEvent('button_click', {
          element: e.target.textContent.trim(),
          location: this.getElementLocation(e.target)
        });
      }
    });

    // Navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href]')) {
        const href = e.target.getAttribute('href');
        this.trackEvent('navigation_click', {
          destination: href,
          text: e.target.textContent.trim(),
          external: !href.startsWith('/') && !href.startsWith('#')
        });
      }
    });

    // Theme toggle usage
    const themeToggle = document.querySelector('[data-theme-toggle]');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('theme-dark');
        this.trackEvent('theme_toggle', { theme: isDark ? 'light' : 'dark' });
      });
    }
  }

  trackFormEngagement() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const formId = form.id || 'unknown_form';
      let startTime = null;
      let fieldInteractions = {};

      // Form start
      form.addEventListener('focusin', () => {
        if (!startTime) {
          startTime = Date.now();
          this.trackEvent('form_start', { form_id: formId });
        }
      });

      // Field interactions
      form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('focus', () => {
          const fieldName = field.name || field.id;
          fieldInteractions[fieldName] = Date.now();
        });

        field.addEventListener('blur', () => {
          const fieldName = field.name || field.id;
          if (fieldInteractions[fieldName]) {
            const timeSpent = Date.now() - fieldInteractions[fieldName];
            this.trackEvent('field_interaction', {
              form_id: formId,
              field: fieldName,
              time_spent: timeSpent,
              filled: !!field.value
            });
          }
        });
      });

      // Form submission
      form.addEventListener('submit', () => {
        const timeSpent = startTime ? Date.now() - startTime : 0;
        this.trackEvent('form_submit', {
          form_id: formId,
          time_spent: timeSpent,
          fields_filled: Object.keys(fieldInteractions).length
        });
      });
    });
  }

  trackScrollDepth() {
    let maxScroll = 0;
    let scrollTimer = null;

    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      
      scrollTimer = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent;
          
          // Track milestone percentages
          const milestones = [25, 50, 75, 90, 100];
          const milestone = milestones.find(m => scrollPercent >= m && maxScroll < m);
          
          if (milestone) {
            this.trackEvent('scroll_depth', { percentage: milestone });
          }
        }
      }, 250);
    });
  }

  monitorPerformance() {
    // Memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.performance.memory = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        };
      }, 30000);
    }

    // Network connection
    if ('connection' in navigator) {
      const connection = navigator.connection;
      this.performance.connection = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    }

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('page_visibility', {
        visible: !document.hidden,
        timestamp: Date.now()
      });
    });
  }

  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties: {
        ...properties,
        timestamp: Date.now(),
        page: window.location.pathname,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };

    this.interactions.push(event);

    // Send to analytics service (replace with your preferred analytics)
    this.sendToAnalytics(event);
  }

  sendMetric(name, value) {
    // Send performance metrics
    console.log(`Performance Metric - ${name}: ${value}`);
    
    // Example: Send to Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', name, {
        custom_parameter: value,
        event_category: 'Performance'
      });
    }
  }

  sendToAnalytics(event) {
    // Console logging for development
    console.log('Analytics Event:', event);

    // Example: Send to Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', event.name, event.properties);
    }

    // Example: Send to custom analytics endpoint
    if (this.shouldSendToServer()) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(() => {
        // Silently handle errors
      });
    }
  }

  shouldSendToServer() {
    // Only send every 10th event to avoid spam
    return this.interactions.length % 10 === 0;
  }

  getElementLocation(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      selector: this.getSelector(element)
    };
  }

  getSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  // Public API for manual tracking
  track(eventName, properties) {
    this.trackEvent(eventName, properties);
  }

  // Export data for debugging
  exportData() {
    return {
      performance: this.performance,
      interactions: this.interactions,
      session_duration: Date.now() - this.initTime
    };
  }
}

// Initialize analytics when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.zainAnalytics = new ZainAnalytics();
  });
} else {
  window.zainAnalytics = new ZainAnalytics();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZainAnalytics;
}