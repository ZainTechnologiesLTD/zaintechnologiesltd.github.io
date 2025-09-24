/**
 * Zain Technologies Ltd - Enterprise JavaScript Framework
 * Interactive functionality for comprehensive technology solutions website
 * Licensed under Companies Act 1994, Bangladesh
 */

'use strict';

// ===============================================
// Global Configuration & State Management
// ===============================================

const ZainTech = {
    config: {
        animationDuration: 300,
        scrollOffset: 80,
        debounceDelay: 100,
        apiEndpoints: {
            contact: '/api/contact',
            newsletter: '/api/newsletter'
        }
    },
    
    state: {
        isLoading: false,
        currentSection: 'home',
        mobileMenuOpen: false,
        scrollPosition: 0,
        formSubmissions: new Map()
    },
    
    cache: {
        elements: new Map(),
        observers: new Map()
    }
};

// ===============================================
// Utility Functions
// ===============================================

const Utils = {
    // Debounce function for performance optimization
    debounce(func, wait = 100) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function for scroll events
    throttle(func, limit = 16) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Get element with caching
    getElement(selector) {
        if (!ZainTech.cache.elements.has(selector)) {
            ZainTech.cache.elements.set(selector, document.querySelector(selector));
        }
        return ZainTech.cache.elements.get(selector);
    },
    
    // Get elements with caching
    getElements(selector) {
        if (!ZainTech.cache.elements.has(selector + '_all')) {
            ZainTech.cache.elements.set(selector + '_all', document.querySelectorAll(selector));
        }
        return ZainTech.cache.elements.get(selector + '_all');
    },
    
    // Smooth scroll to element
    smoothScrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? Utils.getElement(target) : target;
        if (element) {
            const targetPosition = element.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    },
    
    // Check if element is in viewport
    isInViewport(element, threshold = 0.1) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        return (
            rect.top >= 0 && 
            rect.top <= viewportHeight * (1 + threshold) &&
            rect.bottom >= viewportHeight * threshold
        );
    },
    
    // Format numbers with animation
    animateCounter(element, target, duration = 2000) {
        const start = parseInt(element.textContent) || 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    },
    
    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Show notification
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
};

// ===============================================
// Navigation System
// ===============================================

class NavigationManager {
    constructor() {
        this.navbar = Utils.getElement('#navbar');
        this.navLinks = Utils.getElements('.nav-link');
        this.mobileToggle = Utils.getElement('#mobile-toggle');
        this.navMenu = Utils.getElement('#nav-menu');
        
        this.init();
    }
    
    init() {
        this.setupScrollEffect();
        this.setupActiveSection();
        this.setupMobileMenu();
        this.setupSmoothScroll();
    }
    
    setupScrollEffect() {
        const handleScroll = Utils.throttle(() => {
            const scrolled = window.scrollY > 50;
            this.navbar.classList.toggle('scrolled', scrolled);
            ZainTech.state.scrollPosition = window.scrollY;
        }, 16);
        
        window.addEventListener('scroll', handleScroll);
    }
    
    setupActiveSection() {
        const sections = Utils.getElements('section[id]');
        
        const updateActiveSection = Utils.throttle(() => {
            let currentSection = '';
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + window.scrollY;
                const sectionHeight = rect.height;
                
                if (window.scrollY >= sectionTop - 100 && 
                    window.scrollY < sectionTop + sectionHeight - 100) {
                    currentSection = section.id;
                }
            });
            
            if (currentSection && currentSection !== ZainTech.state.currentSection) {
                ZainTech.state.currentSection = currentSection;
                this.updateActiveNavLink(currentSection);
            }
        }, 100);
        
        window.addEventListener('scroll', updateActiveSection);
    }
    
    updateActiveNavLink(sectionId) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
    
    setupMobileMenu() {
        if (!this.mobileToggle || !this.navMenu) return;
        
        this.mobileToggle.addEventListener('click', () => {
            ZainTech.state.mobileMenuOpen = !ZainTech.state.mobileMenuOpen;
            this.navMenu.classList.toggle('active', ZainTech.state.mobileMenuOpen);
            this.mobileToggle.classList.toggle('active', ZainTech.state.mobileMenuOpen);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = ZainTech.state.mobileMenuOpen ? 'hidden' : '';
        });
        
        // Close mobile menu when clicking nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (ZainTech.state.mobileMenuOpen) {
                    ZainTech.state.mobileMenuOpen = false;
                    this.navMenu.classList.remove('active');
                    this.mobileToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (ZainTech.state.mobileMenuOpen && 
                !this.navMenu.contains(e.target) && 
                !this.mobileToggle.contains(e.target)) {
                ZainTech.state.mobileMenuOpen = false;
                this.navMenu.classList.remove('active');
                this.mobileToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    setupSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const target = Utils.getElement(targetId);
                
                if (target) {
                    Utils.smoothScrollTo(target, ZainTech.config.scrollOffset);
                    
                    // Update URL without triggering scroll
                    if (history.pushState) {
                        history.pushState(null, null, targetId);
                    }
                }
            });
        });
    }
}

// ===============================================
// Animation & Intersection Observer System
// ===============================================

class AnimationManager {
    constructor() {
        this.observers = new Map();
        this.animatedElements = new Set();
        this.init();
    }
    
    init() {
        this.setupFadeInAnimations();
        this.setupCounterAnimations();
        this.setupParallaxEffects();
    }
    
    setupFadeInAnimations() {
        const elements = Utils.getElements('.fade-in, .service-card, .solution-item, .portfolio-item, .feature-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    entry.target.classList.add('visible');
                    this.animatedElements.add(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        elements.forEach(element => {
            element.classList.add('fade-in');
            observer.observe(element);
        });
        
        this.observers.set('fadeIn', observer);
    }
    
    setupCounterAnimations() {
        const counters = Utils.getElements('.stat-number[data-target]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    const target = parseInt(entry.target.dataset.target);
                    Utils.animateCounter(entry.target, target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        counters.forEach(counter => {
            observer.observe(counter);
        });
        
        this.observers.set('counters', observer);
    }
    
    setupParallaxEffects() {
        const parallaxElements = Utils.getElements('.hero-particles');
        
        const handleScroll = Utils.throttle(() => {
            const scrollTop = window.scrollY;
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }, 16);
        
        window.addEventListener('scroll', handleScroll);
    }
}

// ===============================================
// Portfolio Filter System
// ===============================================

class PortfolioManager {
    constructor() {
        this.filterButtons = Utils.getElements('.filter-btn');
        this.portfolioItems = Utils.getElements('.portfolio-item');
        this.init();
    }
    
    init() {
        this.setupFilters();
    }
    
    setupFilters() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active filter button
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter portfolio items
                const filter = button.dataset.filter;
                this.filterItems(filter);
            });
        });
    }
    
    filterItems(filter) {
        this.portfolioItems.forEach(item => {
            const category = item.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                item.style.display = 'block';
                item.classList.add('fade-in', 'visible');
            } else {
                item.style.display = 'none';
                item.classList.remove('visible');
            }
        });
        
        // Animate visible items
        setTimeout(() => {
            this.portfolioItems.forEach(item => {
                if (item.style.display !== 'none') {
                    item.classList.add('visible');
                }
            });
        }, 50);
    }
}

// ===============================================
// Form Management System
// ===============================================

class FormManager {
    constructor() {
        this.contactForm = Utils.getElement('#contactForm');
        this.init();
    }
    
    init() {
        if (this.contactForm) {
            this.setupFormValidation();
            this.setupFormSubmission();
        }
    }
    
    setupFormValidation() {
        const inputs = this.contactForm.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type || field.tagName.toLowerCase();
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (field.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (fieldType === 'email' && value && !Utils.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
        
        // Phone validation (basic)
        if (fieldType === 'tel' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        
        // Show/hide error
        this.showFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    }
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        if (message) {
            field.classList.add('error');
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = message;
            field.parentNode.appendChild(errorElement);
        } else {
            field.classList.remove('error');
        }
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    setupFormSubmission() {
        this.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (ZainTech.state.isLoading) return;
            
            // Validate all fields
            const inputs = this.contactForm.querySelectorAll('input, textarea, select');
            let isFormValid = true;
            
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isFormValid = false;
                }
            });
            
            if (!isFormValid) {
                Utils.showNotification('Please correct the errors in the form', 'error');
                return;
            }
            
            // Submit form
            await this.submitForm();
        });
    }
    
    async submitForm() {
        const submitButton = this.contactForm.querySelector('.form-submit');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        ZainTech.state.isLoading = true;
        submitButton.innerHTML = '<span>Sending...</span>';
        submitButton.disabled = true;
        this.contactForm.classList.add('loading');
        
        try {
            // Collect form data
            const formData = new FormData(this.contactForm);
            const data = Object.fromEntries(formData.entries());
            
            // Add timestamp and form ID
            data.timestamp = new Date().toISOString();
            data.formId = 'contact-form';
            
            // Simulate API call (replace with actual endpoint)
            await this.simulateAPICall(data);
            
            // Success handling
            Utils.showNotification('Thank you! Your message has been sent successfully. We will get back to you soon.', 'success', 8000);
            this.contactForm.reset();
            
            // Track submission
            ZainTech.state.formSubmissions.set(Date.now(), data);
            
        } catch (error) {
            console.error('Form submission error:', error);
            Utils.showNotification('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
        } finally {
            // Reset loading state
            ZainTech.state.isLoading = false;
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            this.contactForm.classList.remove('loading');
        }
    }
    
    async simulateAPICall(data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Log form data for development
        console.log('Form submission:', data);
        
        // In production, this would be:
        // const response = await fetch(ZainTech.config.apiEndpoints.contact, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        // return response.json();
        
        return { success: true, message: 'Form submitted successfully' };
    }
}

// ===============================================
// Scroll to Top Functionality
// ===============================================

class ScrollManager {
    constructor() {
        this.scrollTopButton = Utils.getElement('#scrollToTop');
        this.init();
    }
    
    init() {
        this.setupScrollToTop();
        this.setupScrollIndicator();
    }
    
    setupScrollToTop() {
        if (!this.scrollTopButton) return;
        
        // Show/hide scroll to top button
        const handleScroll = Utils.throttle(() => {
            const shouldShow = window.scrollY > 300;
            this.scrollTopButton.classList.toggle('visible', shouldShow);
        }, 100);
        
        window.addEventListener('scroll', handleScroll);
        
        // Scroll to top functionality
        this.scrollTopButton.addEventListener('click', () => {
            Utils.smoothScrollTo(document.body, 0);
        });
    }
    
    setupScrollIndicator() {
        const scrollIndicator = Utils.getElement('.scroll-indicator');
        
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                const aboutSection = Utils.getElement('#about');
                if (aboutSection) {
                    Utils.smoothScrollTo(aboutSection, ZainTech.config.scrollOffset);
                }
            });
        }
    }
}

// ===============================================
// Performance & Analytics
// ===============================================

class PerformanceManager {
    constructor() {
        this.metrics = {
            loadTime: 0,
            interactionTime: 0,
            scrollDepth: 0,
            engagementTime: Date.now()
        };
        
        this.init();
    }
    
    init() {
        this.measureLoadTime();
        this.trackScrollDepth();
        this.trackEngagement();
    }
    
    measureLoadTime() {
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now();
            console.log(`Page load time: ${this.metrics.loadTime.toFixed(2)}ms`);
        });
    }
    
    trackScrollDepth() {
        const handleScroll = Utils.throttle(() => {
            const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
            this.metrics.scrollDepth = Math.max(this.metrics.scrollDepth, scrollPercent);
        }, 250);
        
        window.addEventListener('scroll', handleScroll);
    }
    
    trackEngagement() {
        // Track time spent on page
        window.addEventListener('beforeunload', () => {
            this.metrics.engagementTime = Date.now() - this.metrics.engagementTime;
            console.log('Engagement metrics:', this.metrics);
        });
    }
}

// ===============================================
// Error Handling & Logging
// ===============================================

class ErrorManager {
    constructor() {
        this.errors = [];
        this.init();
    }
    
    init() {
        // Global error handler
        window.addEventListener('error', (e) => {
            this.logError({
                type: 'JavaScript Error',
                message: e.message,
                filename: e.filename,
                line: e.lineno,
                column: e.colno,
                timestamp: new Date().toISOString()
            });
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            this.logError({
                type: 'Unhandled Promise Rejection',
                message: e.reason,
                timestamp: new Date().toISOString()
            });
        });
    }
    
    logError(error) {
        this.errors.push(error);
        console.error('Error logged:', error);
        
        // In production, send to error tracking service
        // this.sendErrorToService(error);
    }
}

// ===============================================
// Accessibility Enhancements
// ===============================================

class AccessibilityManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupARIA();
    }
    
    setupKeyboardNavigation() {
        // Escape key handler for modal/menu closing
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (ZainTech.state.mobileMenuOpen) {
                    const nav = new NavigationManager();
                    // Close mobile menu logic would be handled here
                }
            }
        });
        
        // Tab trap for mobile menu
        const navMenu = Utils.getElement('#nav-menu');
        if (navMenu) {
            navMenu.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && ZainTech.state.mobileMenuOpen) {
                    const focusableElements = navMenu.querySelectorAll('a, button');
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];
                    
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
    }
    
    setupFocusManagement() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-blue);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content landmark
        const main = document.querySelector('main') || document.querySelector('#home');
        if (main) {
            main.id = 'main-content';
            main.setAttribute('role', 'main');
        }
    }
    
    setupARIA() {
        // Add ARIA labels to interactive elements
        const buttons = Utils.getElements('button:not([aria-label])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                button.setAttribute('aria-label', 'Button');
            }
        });
        
        // Add ARIA expanded to mobile toggle
        const mobileToggle = Utils.getElement('#mobile-toggle');
        if (mobileToggle) {
            mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    }
}

// ===============================================
// Notification System Styles (Dynamic CSS)
// ===============================================

function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border-left: 4px solid var(--primary-blue);
            z-index: 10000;
            max-width: 400px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            animation: slideIn 0.3s ease forwards;
        }
        
        .notification-success { border-left-color: #10B981; }
        .notification-error { border-left-color: #EF4444; }
        .notification-info { border-left-color: var(--primary-blue); }
        
        .notification-content {
            display: flex;
            align-items: center;
            padding: 16px;
            gap: 12px;
        }
        
        .notification-icon {
            font-weight: bold;
            font-size: 18px;
        }
        
        .notification-success .notification-icon { color: #10B981; }
        .notification-error .notification-icon { color: #EF4444; }
        .notification-info .notification-icon { color: var(--primary-blue); }
        
        .notification-message {
            flex: 1;
            color: var(--gray-700);
            line-height: 1.4;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: var(--gray-400);
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-close:hover {
            color: var(--gray-600);
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        
        .field-error {
            color: #EF4444;
            font-size: 0.875rem;
            margin-top: 4px;
        }
        
        .form-group input.error,
        .form-group textarea.error,
        .form-group select.error {
            border-color: #EF4444;
        }
        
        .skip-link:focus {
            top: 6px !important;
        }
    `;
    
    document.head.appendChild(style);
}

// ===============================================
// Initialize Application
// ===============================================

class ZainTechApp {
    constructor() {
        this.managers = {};
        this.isInitialized = false;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Add dynamic styles
            addNotificationStyles();
            
            // Initialize managers
            this.managers.navigation = new NavigationManager();
            this.managers.animation = new AnimationManager();
            this.managers.portfolio = new PortfolioManager();
            this.managers.form = new FormManager();
            this.managers.scroll = new ScrollManager();
            this.managers.performance = new PerformanceManager();
            this.managers.error = new ErrorManager();
            this.managers.accessibility = new AccessibilityManager();
            
            this.isInitialized = true;
            
            console.log('Zain Technologies Ltd website initialized successfully');
            
            // Show welcome message in console
            console.log(`
%c🚀 Zain Technologies Ltd
%cComplete Technology Solutions Platform
%cLicensed under Companies Act 1994, Bangladesh
            `, 
            'color: #2D41B8; font-size: 16px; font-weight: bold;',
            'color: #368BFF; font-size: 14px;',
            'color: #64748b; font-size: 12px;'
            );
            
        } catch (error) {
            console.error('Failed to initialize Zain Tech application:', error);
            if (this.managers.error) {
                this.managers.error.logError({
                    type: 'Initialization Error',
                    message: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }
    
    // Public API methods
    showNotification(message, type, duration) {
        return Utils.showNotification(message, type, duration);
    }
    
    scrollTo(target) {
        return Utils.smoothScrollTo(target, ZainTech.config.scrollOffset);
    }
    
    getState() {
        return { ...ZainTech.state };
    }
}

// ===============================================
// DOM Ready & Application Bootstrap
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize application
    window.ZainTechApp = new ZainTechApp();
    window.ZainTechApp.init();
    
    // Expose utility functions globally for debugging
    if (process?.env?.NODE_ENV === 'development') {
        window.ZainTech = ZainTech;
        window.Utils = Utils;
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // Pause non-critical animations/processes
        console.log('Page hidden - pausing non-critical processes');
    } else {
        // Resume processes
        console.log('Page visible - resuming processes');
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ZainTechApp, Utils, ZainTech };
}