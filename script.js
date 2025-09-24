// Website JavaScript Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeServiceTabs();
    initializeContactForm();
    initializeScrollAnimations();
    initializeTechEcosystem();
    initializeScrollToTop();
    
    console.log('Zain Technologies Ltd. website loaded successfully');
});

// Navigation functionality
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
    
    // Navbar scroll effect
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (navbar) {
            if (currentScrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
            
            // Hide/show navbar on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 500) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Active nav link highlighting
    const sections = document.querySelectorAll('section[id]');
    
    function highlightActiveSection() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.getBoundingClientRect().top + scrollY - 100;
            const sectionId = section.getAttribute('id');
            const correspondingNavLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-menu a').forEach(link => {
                    link.classList.remove('active');
                });
                if (correspondingNavLink) {
                    correspondingNavLink.classList.add('active');
                }
            }
        });
    }
    
    window.addEventListener('scroll', highlightActiveSection);
}

// Service tabs functionality
function initializeServiceTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (tabButtons.length === 0 || tabPanes.length === 0) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) {
                targetPane.classList.add('active');
                
                // Trigger animation for service cards
                const serviceCards = targetPane.querySelectorAll('.service-card');
                serviceCards.forEach((card, index) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.6s ease-out';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        });
    });
    
    // Auto-rotate tabs (optional)
    let currentTabIndex = 0;
    const autoRotateInterval = 10000; // 10 seconds
    
    function rotateTab() {
        if (tabButtons.length > 1) {
            currentTabIndex = (currentTabIndex + 1) % tabButtons.length;
            tabButtons[currentTabIndex].click();
        }
    }
    
    // Uncomment to enable auto-rotation
    // setInterval(rotateTab, autoRotateInterval);
}

// Contact form functionality
function initializeContactForm() {
    const form = document.getElementById('businessInquiryForm');
    if (!form) return;
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.innerHTML : '';
    
    // Form validation
    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });
        
        // Validate email format
        const emailField = form.querySelector('input[type="email"]');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                isValid = false;
                emailField.classList.add('error');
            } else {
                emailField.classList.remove('error');
            }
        }
        
        // Validate at least one service is selected
        const serviceCheckboxes = form.querySelectorAll('input[name="services[]"]');
        const isServiceSelected = Array.from(serviceCheckboxes).some(checkbox => checkbox.checked);
        if (!isServiceSelected) {
            isValid = false;
            const checkboxGroup = form.querySelector('.checkbox-group');
            if (checkboxGroup) {
                checkboxGroup.classList.add('error');
            }
        } else {
            const checkboxGroup = form.querySelector('.checkbox-group');
            if (checkboxGroup) {
                checkboxGroup.classList.remove('error');
            }
        }
        
        return isValid;
    }
    
    // Real-time validation
    form.addEventListener('input', () => {
        const field = event.target;
        if (field.hasAttribute('required')) {
            if (field.value.trim()) {
                field.classList.remove('error');
            }
        }
        
        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(field.value)) {
                field.classList.remove('error');
            }
        }
    });
    
    // Service selection validation
    const serviceCheckboxes = form.querySelectorAll('input[name="services[]"]');
    serviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const isServiceSelected = Array.from(serviceCheckboxes).some(cb => cb.checked);
            const checkboxGroup = form.querySelector('.checkbox-group');
            if (isServiceSelected && checkboxGroup) {
                checkboxGroup.classList.remove('error');
            }
        });
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }
        
        // Show loading state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        }
        
        try {
            // Collect form data
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                if (key === 'services[]') {
                    if (!data.services) data.services = [];
                    data.services.push(value);
                } else {
                    data[key] = value;
                }
            }
            
            // Here you would typically send the data to your backend
            // For now, we'll simulate a successful submission
            await simulateFormSubmission(data);
            
            showNotification('Thank you! Your business inquiry has been submitted successfully. We will contact you within 24 hours.', 'success');
            form.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('There was an error submitting your inquiry. Please try again or contact us directly.', 'error');
        } finally {
            // Restore button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        }
    });
    
    // Simulate form submission (replace with actual API call)
    function simulateFormSubmission(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure
                if (Math.random() > 0.1) { // 90% success rate
                    resolve(data);
                } else {
                    reject(new Error('Network error'));
                }
            }, 2000);
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        padding: 1rem;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        border-radius: 0.75rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        font-family: 'Inter', sans-serif;
        font-size: 0.875rem;
        line-height: 1.5;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        margin-left: auto;
        border-radius: 0.25rem;
        transition: background-color 0.15s ease-in-out;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Scroll animations
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .service-card, .solution-card, .about-card, .leader-card, .governance-item');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Stagger animation for cards in grids
                const parent = entry.target.parentElement;
                if (parent && (parent.classList.contains('service-grid') || 
                              parent.classList.contains('solutions-grid') || 
                              parent.classList.contains('about-grid'))) {
                    const siblings = Array.from(parent.children);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                }
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        element.classList.add('animate-on-scroll');
        observer.observe(element);
    });
    
    // Parallax effect for hero background
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Number counter animation
    function animateCounters() {
        const counters = document.querySelectorAll('.stat h3');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent.replace(/\D/g, ''));
            const suffix = counter.textContent.replace(/[\d.]/g, '');
            let current = 0;
            const increment = target / 100;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current) + suffix;
            }, 20);
        });
    }
    
    // Trigger counter animation when hero stats are in view
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        });
        
        statsObserver.observe(heroStats);
    }
}

// Tech ecosystem interactive functionality
function initializeTechEcosystem() {
    const techNodes = document.querySelectorAll('.tech-node');
    const centralHub = document.querySelector('.central-hub');
    
    techNodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            // Highlight connected elements
            const service = node.getAttribute('data-service');
            if (service && centralHub) {
                centralHub.style.transform = 'translate(-50%, -50%) scale(1.1)';
                centralHub.style.boxShadow = '0 25px 50px -12px rgba(79, 70, 229, 0.4)';
            }
            
            // Show service info (you can expand this)
            showServiceTooltip(node, service);
        });
        
        node.addEventListener('mouseleave', () => {
            if (centralHub) {
                centralHub.style.transform = 'translate(-50%, -50%) scale(1)';
                centralHub.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }
            hideServiceTooltip();
        });
        
        node.addEventListener('click', () => {
            // Navigate to corresponding service section
            const service = node.getAttribute('data-service');
            if (service) {
                const serviceSection = document.getElementById('services');
                if (serviceSection) {
                    serviceSection.scrollIntoView({ behavior: 'smooth' });
                    
                    // Activate corresponding tab
                    setTimeout(() => {
                        const tabButton = document.querySelector(`[data-tab="${service}"]`) || 
                                         document.querySelector('[data-tab="cybersecurity"]');
                        if (tabButton) {
                            tabButton.click();
                        }
                    }, 500);
                }
            }
        });
    });
}

// Service tooltip functionality
function showServiceTooltip(element, service) {
    const tooltip = document.getElementById('service-tooltip') || createServiceTooltip();
    
    const serviceInfo = {
        cybersecurity: {
            title: 'Cybersecurity Solutions',
            description: '24/7 SOC operations, threat detection, and security compliance'
        },
        ai: {
            title: 'AI & Machine Learning',
            description: 'Business intelligence, process automation, and custom AI solutions'
        },
        healthcare: {
            title: 'Healthcare Technology',
            description: 'HIPAA-compliant HMS, telemedicine, and clinical decision support'
        },
        cloud: {
            title: 'Cloud Solutions',
            description: 'Cloud migration, architecture design, and optimization services'
        },
        devops: {
            title: 'DevOps & CI/CD',
            description: 'Continuous integration, deployment pipelines, and automation'
        },
        networking: {
            title: 'Network Solutions',
            description: 'Enterprise networking, security, and infrastructure design'
        },
        analytics: {
            title: 'Data Analytics',
            description: 'Business intelligence, reporting, and predictive analytics'
        }
    };
    
    const info = serviceInfo[service] || serviceInfo.cybersecurity;
    tooltip.innerHTML = `
        <div class="tooltip-content">
            <h4>${info.title}</h4>
            <p>${info.description}</p>
        </div>
    `;
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width / 2) + 'px';
    tooltip.style.top = (rect.bottom + 10) + 'px';
    tooltip.style.opacity = '1';
    tooltip.style.transform = 'translateX(-50%) translateY(0)';
}

function hideServiceTooltip() {
    const tooltip = document.getElementById('service-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateX(-50%) translateY(-10px)';
    }
}

function createServiceTooltip() {
    const tooltip = document.createElement('div');
    tooltip.id = 'service-tooltip';
    tooltip.style.cssText = `
        position: fixed;
        z-index: 10000;
        background: rgba(31, 41, 55, 0.95);
        backdrop-filter: blur(10px);
        color: white;
        padding: 1rem;
        border-radius: 0.75rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        max-width: 250px;
        opacity: 0;
        transform: translateX(-50%) translateY(-10px);
        transition: all 0.3s ease-out;
        font-family: 'Inter', sans-serif;
        font-size: 0.875rem;
        line-height: 1.5;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    return tooltip;
}

// Scroll to top functionality
function initializeScrollToTop() {
    // Create scroll to top button
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollButton.className = 'scroll-to-top';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 3rem;
        height: 3rem;
        background: linear-gradient(135deg, #4F46E5, #06B6D4);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        opacity: 0;
        transform: translateY(100px);
        transition: all 0.3s ease-out;
        z-index: 1000;
        font-size: 1rem;
    `;
    
    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    scrollButton.addEventListener('mouseenter', () => {
        scrollButton.style.transform = 'translateY(0) scale(1.1)';
    });
    
    scrollButton.addEventListener('mouseleave', () => {
        scrollButton.style.transform = 'translateY(0) scale(1)';
    });
    
    document.body.appendChild(scrollButton);
    
    // Show/hide scroll button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            scrollButton.style.opacity = '1';
            scrollButton.style.transform = 'translateY(0)';
        } else {
            scrollButton.style.opacity = '0';
            scrollButton.style.transform = 'translateY(100px)';
        }
    });
}

// Performance optimization
function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Preload critical resources
    const criticalResources = [
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = resource;
        document.head.appendChild(link);
    });
}

// Call performance optimization
optimizePerformance();

// Utility functions
const utils = {
    // Debounce function for performance
    debounce: function(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },
    
    // Throttle function for scroll events
    throttle: function(func, limit) {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    },
    
    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // You could send error reports to your analytics service here
});

// Service Worker registration for PWA (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Export functions for external use (if needed)
window.ZainTech = {
    showNotification,
    utils
};