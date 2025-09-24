// Custom Interactive JavaScript - Zain Technologies
// Modern web interactions and animations

class ZainTechnologies {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.initAnimations();
        this.initScrollEffects();
        this.initParticleSystem();
        this.initThemeSystem();
        this.initInteractiveElements();
    }

    init() {
        console.log('🚀 Zain Technologies - Innovation Redefined');
        
        // Set up viewport variables
        this.setViewportVariables();
        window.addEventListener('resize', () => this.setViewportVariables());
        
        // Initialize cursor effects
        this.initCustomCursor();
        
        // Preload animations
        this.preloadAnimations();
    }

    setViewportVariables() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    setupEventListeners() {
        // Smooth scroll for navigation links
        document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update active nav link
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });

        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                menuToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Form submission
        const contactForm = document.querySelector('.form-container');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Service cards hover effects
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mouseenter', () => this.animateServiceCard(card, 'enter'));
            card.addEventListener('mouseleave', () => this.animateServiceCard(card, 'leave'));
        });

        // Portfolio items click
        document.querySelectorAll('.portfolio-item').forEach(item => {
            item.addEventListener('click', () => this.showProjectModal(item));
        });

        // Interactive buttons
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => this.createRippleEffect(e));
        });
    }

    initAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Animate children with stagger
                    const children = entry.target.querySelectorAll('.service-card, .portfolio-item, .highlight-item, .visual-card');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('animate-in');
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.services-section, .about-section, .portfolio-section, .contact-section').forEach(section => {
            this.observer.observe(section);
        });
    }

    initScrollEffects() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollEffects();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    updateScrollEffects() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // Parallax effect for hero shapes
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.1;
            const yPos = -(scrollY * speed);
            shape.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });

        // Update navigation background opacity
        const nav = document.querySelector('.nav-container');
        const opacity = Math.min(scrollY / 100, 0.95);
        nav.style.background = `rgba(26, 31, 58, ${opacity})`;

        // Show/hide scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.style.opacity = scrollY > 100 ? '0' : '1';
        }

        // Active navigation link based on scroll position
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    initParticleSystem() {
        // Create floating particles in hero section
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        const particleCount = 20;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(99, 102, 241, 0.5);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1;
            `;
            
            // Random initial position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            heroSection.appendChild(particle);
            particles.push({
                element: particle,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1
            });
        }

        // Animate particles
        const animateParticles = () => {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around screen
                if (particle.x > window.innerWidth) particle.x = 0;
                if (particle.x < 0) particle.x = window.innerWidth;
                if (particle.y > window.innerHeight) particle.y = 0;
                if (particle.y < 0) particle.y = window.innerHeight;
                
                particle.element.style.left = particle.x + 'px';
                particle.element.style.top = particle.y + 'px';
                particle.element.style.width = particle.size + 'px';
                particle.element.style.height = particle.size + 'px';
            });
            
            requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }

    initThemeSystem() {
        // Dynamic theme based on time and user preference
        const hour = new Date().getHours();
        let theme = 'dark'; // Default theme
        
        // Auto theme based on time (keeping it dark for tech feel)
        if (hour >= 6 && hour < 18) {
            document.documentElement.setAttribute('data-theme', 'dark-day');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark-night');
        }

        // Add theme toggle functionality
        const createThemeToggle = () => {
            const themeToggle = document.createElement('button');
            themeToggle.innerHTML = '🌓';
            themeToggle.className = 'theme-toggle';
            themeToggle.style.cssText = `
                position: fixed;
                top: 50%;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--bg-glass);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
                font-size: 20px;
                cursor: pointer;
                z-index: 1000;
                backdrop-filter: blur(20px);
                transition: all 0.3s ease;
                transform: translateY(-50%);
            `;
            
            document.body.appendChild(themeToggle);
            
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark-day' ? 'dark-night' : 'dark-day';
                document.documentElement.setAttribute('data-theme', newTheme);
                
                // Add click animation
                themeToggle.style.transform = 'translateY(-50%) scale(0.9)';
                setTimeout(() => {
                    themeToggle.style.transform = 'translateY(-50%) scale(1)';
                }, 150);
            });
        };
        
        createThemeToggle();
    }

    initCustomCursor() {
        // Create custom cursor for desktop
        if (window.innerWidth > 768) {
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            cursor.style.cssText = `
                position: fixed;
                width: 20px;
                height: 20px;
                background: var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                mix-blend-mode: difference;
                transition: transform 0.1s ease;
                transform: translate(-50%, -50%);
            `;
            
            document.body.appendChild(cursor);
            
            document.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
            
            // Cursor interactions
            document.querySelectorAll('a, button, .service-card, .portfolio-item').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursor.style.transform = 'translate(-50%, -50%) scale(2)';
                    cursor.style.background = 'var(--accent-color)';
                });
                
                el.addEventListener('mouseleave', () => {
                    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                    cursor.style.background = 'var(--primary-color)';
                });
            });
        }
    }

    initInteractiveElements() {
        // Add interactive glow effects
        document.querySelectorAll('.service-card, .portfolio-item, .visual-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');
                
                // Add glow effect
                const glow = `radial-gradient(200px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.1), transparent)`;
                card.style.background = `${glow}, var(--bg-card)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.background = 'var(--bg-card)';
            });
        });

        // Typewriter effect for hero title
        this.initTypewriter();
        
        // Counter animation for stats
        this.initCounters();
        
        // Loading animations
        this.initLoadingAnimations();
    }

    initTypewriter() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;
        
        const originalText = heroTitle.innerHTML;
        heroTitle.innerHTML = '';
        
        let i = 0;
        const typeSpeed = 50;
        
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.innerHTML = originalText.slice(0, i + 1);
                i++;
                setTimeout(typeWriter, typeSpeed);
            }
        };
        
        // Start typewriter after page load
        setTimeout(typeWriter, 1000);
    }

    initCounters() {
        const counters = document.querySelectorAll('.stat-number, .metric-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent.replace(/\D/g, ''));
            let current = 0;
            const increment = target / 100;
            const suffix = counter.textContent.replace(/\d/g, '');
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current) + suffix;
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + suffix;
                }
            };
            
            // Trigger when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }

    initLoadingAnimations() {
        // Add loading state to buttons
        document.querySelectorAll('.service-btn, .form-submit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.classList.contains('loading')) return;
                
                btn.classList.add('loading');
                const originalText = btn.textContent;
                btn.textContent = 'Loading...';
                
                setTimeout(() => {
                    btn.classList.remove('loading');
                    btn.textContent = originalText;
                }, 2000);
            });
        });
    }

    preloadAnimations() {
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            .animate-in {
                opacity: 1;
                transform: translateY(0);
                transition: all 0.6s ease;
            }
            
            .services-section:not(.animate-in),
            .about-section:not(.animate-in),
            .portfolio-section:not(.animate-in),
            .contact-section:not(.animate-in) {
                opacity: 0;
                transform: translateY(50px);
            }
            
            .service-card:not(.animate-in),
            .portfolio-item:not(.animate-in),
            .highlight-item:not(.animate-in),
            .visual-card:not(.animate-in) {
                opacity: 0;
                transform: translateY(30px);
            }
            
            @media (prefers-reduced-motion: reduce) {
                .animate-in,
                .service-card,
                .portfolio-item,
                .highlight-item,
                .visual-card {
                    opacity: 1;
                    transform: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    animateServiceCard(card, action) {
        if (action === 'enter') {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            
            // Animate icon
            const icon = card.querySelector('.icon-shape');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
            
            // Animate features
            const features = card.querySelectorAll('.service-features li');
            features.forEach((feature, index) => {
                setTimeout(() => {
                    feature.style.transform = 'translateX(5px)';
                    feature.style.color = 'var(--text-primary)';
                }, index * 50);
            });
        } else {
            card.style.transform = '';
            
            const icon = card.querySelector('.icon-shape');
            if (icon) {
                icon.style.transform = '';
            }
            
            const features = card.querySelectorAll('.service-features li');
            features.forEach(feature => {
                feature.style.transform = '';
                feature.style.color = '';
            });
        }
    }

    showProjectModal(item) {
        // Create modal for project details
        const modal = document.createElement('div');
        modal.className = 'project-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(20px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: var(--bg-card);
            border-radius: var(--radius-xl);
            padding: var(--space-xl);
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transform: translateY(50px);
            transition: all 0.3s ease;
        `;
        
        const category = item.querySelector('.project-category').textContent;
        const title = item.querySelector('h3').textContent;
        const description = item.querySelector('p').textContent;
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-lg);">
                <div>
                    <div style="color: var(--primary-color); font-size: var(--font-size-sm); font-weight: 600; margin-bottom: var(--space-xs);">${category}</div>
                    <h2 style="font-size: var(--font-size-2xl); margin: 0;">${title}</h2>
                </div>
                <button class="modal-close" style="background: none; border: none; font-size: 24px; color: var(--text-muted); cursor: pointer;">×</button>
            </div>
            <p style="color: var(--text-secondary); margin-bottom: var(--space-lg); line-height: 1.6;">${description}</p>
            <div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
                <button style="background: var(--gradient-primary); color: var(--text-primary); border: none; padding: var(--space-sm) var(--space-md); border-radius: var(--radius-lg); font-weight: 600; cursor: pointer;">View Project</button>
                <button style="background: transparent; color: var(--primary-color); border: 1px solid var(--primary-color); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-lg); font-weight: 600; cursor: pointer;">Source Code</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
        }, 10);
        
        // Close modal
        const closeModal = () => {
            modal.style.opacity = '0';
            modalContent.style.transform = 'translateY(50px)';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        modalContent.querySelector('.modal-close').addEventListener('click', closeModal);
        
        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    createRippleEffect(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        // Add ripple animation
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('.form-submit');
        
        // Show loading state
        submitBtn.classList.add('loading');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending...</span><div class="animate-spin">⟳</div>';
        
        // Simulate form submission
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = '<span>Message Sent!</span><div>✓</div>';
            submitBtn.style.background = 'var(--success-color)';
            
            // Show success message
            this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            
            // Reset form
            form.reset();
            
            // Reset button after delay
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
            }, 3000);
        }, 2000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-glass);
            backdrop-filter: blur(20px);
            color: var(--text-primary);
            padding: var(--space-md) var(--space-lg);
            border-radius: var(--radius-lg);
            border: 1px solid ${type === 'success' ? 'var(--success-color)' : 'rgba(255, 255, 255, 0.1)'};
            z-index: 10000;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
            box-shadow: var(--shadow-xl);
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ZainTechnologies();
});

// Performance optimization
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed
        });
    });
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZainTechnologies;
}