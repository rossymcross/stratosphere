/**
 * Stratosphere Social v2 - Main JavaScript
 * Handles navigation, animations, and interactive elements
 */

(function() {
    'use strict';

    // =========================================
    // DOM ELEMENTS
    // =========================================
    const elements = {
        header: document.querySelector('.site-header'),
        mobileToggle: document.querySelector('.mobile-menu-toggle'),
        navMenu: document.querySelector('.nav-menu'),
        dropdownItems: document.querySelectorAll('.has-dropdown'),
        hero: document.querySelector('.hero'),
        scrollIndicator: document.querySelector('.hero-scroll-indicator')
    };

    // =========================================
    // MOBILE NAVIGATION
    // =========================================
    function initMobileNav() {
        if (!elements.mobileToggle || !elements.navMenu) return;

        elements.mobileToggle.addEventListener('click', toggleMobileMenu);

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.navMenu.classList.contains('is-open')) {
                closeMobileMenu();
            }
        });

        // Handle dropdown toggles on mobile
        elements.dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    e.preventDefault();
                    item.classList.toggle('is-open');
                }
            });
        });
    }

    function toggleMobileMenu() {
        const isOpen = elements.navMenu.classList.toggle('is-open');
        elements.mobileToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        
        // Animate hamburger
        elements.mobileToggle.classList.toggle('is-active', isOpen);
    }

    function closeMobileMenu() {
        elements.navMenu.classList.remove('is-open');
        elements.mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        elements.mobileToggle.classList.remove('is-active');
    }

    // =========================================
    // HEADER SCROLL BEHAVIOR
    // =========================================
    function initHeaderScroll() {
        if (!elements.header) return;

        let lastScroll = 0;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleHeaderScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    function handleHeaderScroll() {
        const currentScroll = window.pageYOffset;
        
        // Add background on scroll
        if (currentScroll > 50) {
            elements.header.classList.add('is-scrolled');
        } else {
            elements.header.classList.remove('is-scrolled');
        }
    }

    // =========================================
    // SCROLL INDICATOR
    // =========================================
    function initScrollIndicator() {
        if (!elements.scrollIndicator) return;

        // Hide scroll indicator after scrolling
        let hidden = false;
        window.addEventListener('scroll', () => {
            if (!hidden && window.pageYOffset > 100) {
                elements.scrollIndicator.style.opacity = '0';
                hidden = true;
            }
        });

        // Click to scroll
        elements.scrollIndicator.addEventListener('click', () => {
            const target = document.querySelector('#explore');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // =========================================
    // OPEN STATUS
    // =========================================
    function updateOpenStatus() {
        const statusElement = document.querySelector('.info-status');
        if (!statusElement) return;

        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();

        // Hours: Mon-Thu 11am-10pm, Fri-Sat 11am-12am, Sun 11am-10pm
        let isOpen = false;

        if (day >= 1 && day <= 4) {
            // Monday - Thursday
            isOpen = hour >= 11 && hour < 22;
        } else if (day === 5 || day === 6) {
            // Friday - Saturday
            isOpen = hour >= 11 || hour < 1; // Open until midnight
        } else {
            // Sunday
            isOpen = hour >= 11 && hour < 22;
        }

        const statusText = statusElement.querySelector('.status-text');
        const statusDot = statusElement.querySelector('.status-dot');

        if (isOpen) {
            statusElement.classList.add('info-status--open');
            statusElement.classList.remove('info-status--closed');
            if (statusText) statusText.textContent = 'Open Now';
        } else {
            statusElement.classList.remove('info-status--open');
            statusElement.classList.add('info-status--closed');
            if (statusText) statusText.textContent = 'Closed';
            if (statusDot) statusDot.style.background = '#EF4444';
        }
    }

    // =========================================
    // INTERSECTION OBSERVER FOR ANIMATIONS
    // =========================================
    function initScrollAnimations() {
        // Use CSS-only animations via intersection observer
        // Elements start visible but animate on scroll for enhanced UX
        if (!('IntersectionObserver' in window)) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation - but don't hide them initially
        const animatedElements = document.querySelectorAll(
            '.highlight-card, .feature-package, .info-item, .utility-item'
        );

        animatedElements.forEach((el) => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    // Add visible class styles dynamically
    function addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .animate-on-scroll {
                opacity: 0.3;
                transform: translateY(20px);
                transition: opacity 0.5s ease, transform 0.5s ease;
            }
            .animate-on-scroll.is-visible {
                opacity: 1;
                transform: translateY(0);
            }
            /* Ensure content is visible for users with reduced motion preference */
            @media (prefers-reduced-motion: reduce) {
                .animate-on-scroll {
                    opacity: 1;
                    transform: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // =========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // =========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerHeight = elements.header ? elements.header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    if (elements.navMenu.classList.contains('is-open')) {
                        closeMobileMenu();
                    }
                }
            });
        });
    }

    // =========================================
    // KEYBOARD NAVIGATION FOR DROPDOWNS
    // =========================================
    function initKeyboardNav() {
        elements.dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            const dropdown = item.querySelector('.dropdown-menu');
            
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.classList.toggle('is-focused');
                }
                
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const firstLink = dropdown.querySelector('a');
                    if (firstLink) firstLink.focus();
                }
            });

            dropdown.querySelectorAll('a').forEach((dropLink, index, arr) => {
                dropLink.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        if (arr[index + 1]) arr[index + 1].focus();
                    }
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        if (arr[index - 1]) arr[index - 1].focus();
                        else link.focus();
                    }
                    if (e.key === 'Escape') {
                        link.focus();
                        item.classList.remove('is-focused');
                    }
                });
            });
        });
    }

    // =========================================
    // VIDEO AUTOPLAY HANDLING
    // =========================================
    function initVideoAutoplay() {
        const video = document.querySelector('.hero-video');
        if (!video) return;

        // Ensure video plays (handle autoplay policies)
        video.play().catch(() => {
            // Autoplay was prevented, that's fine - we have a poster image
            console.log('Video autoplay prevented by browser policy');
        });

        // Pause video when not visible (performance)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.25 });

        observer.observe(video);
    }

    // =========================================
    // INITIALIZE
    // =========================================
    function init() {
        addAnimationStyles();
        initMobileNav();
        initHeaderScroll();
        initScrollIndicator();
        updateOpenStatus();
        initScrollAnimations();
        initSmoothScroll();
        initKeyboardNav();
        initVideoAutoplay();

        // Update open status every minute
        setInterval(updateOpenStatus, 60000);
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

