// Main JS file for V2

document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const dropdownItems = document.querySelectorAll('.has-dropdown');

    // Mobile menu toggle
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Mobile dropdown toggle
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        
        link.addEventListener('click', (e) => {
            // Only prevent default on mobile
            if (window.innerWidth <= 992) {
                e.preventDefault();
                item.classList.toggle('open');
                
                // Close other dropdowns
                dropdownItems.forEach(other => {
                    if (other !== item) {
                        other.classList.remove('open');
                    }
                });
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !menuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
            menuBtn.classList.remove('active');
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            navLinks.classList.remove('active');
            menuBtn.classList.remove('active');
            dropdownItems.forEach(item => item.classList.remove('open'));
        }
    });

    // =============================================
    // Booking Modal Integration
    // =============================================
    const bookingModal = document.getElementById('booking-modal');
    const bookingIframe = document.getElementById('booking-iframe');
    const bookingClose = document.querySelector('.booking-close');
    const bookingTriggers = document.querySelectorAll('[data-booking-trigger]');

    // Open booking modal
    function openBookingModal() {
        // Calculate scrollbar width BEFORE hiding it
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
        
        // Set the iframe source (served from root /stratosphere/)
        bookingIframe.src = '/v2/booking/index.html';
        
        // Show the modal
        bookingModal.classList.add('active');
        document.body.classList.add('booking-open');
        
        // Close mobile menu if open
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuBtn.classList.remove('active');
        }
    }

    // Close booking modal
    function closeBookingModal() {
        bookingModal.classList.remove('active');
        document.body.classList.remove('booking-open');
        
        // Clear scrollbar width compensation
        document.documentElement.style.removeProperty('--scrollbar-width');
        
        // Clear iframe after transition
        setTimeout(() => {
            bookingIframe.src = '';
        }, 400);
    }

    // Attach click handlers to booking triggers
    bookingTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openBookingModal();
        });
    });

    // Close button handler
    if (bookingClose) {
        bookingClose.addEventListener('click', closeBookingModal);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bookingModal.classList.contains('active')) {
            closeBookingModal();
        }
    });

    // Listen for messages from the booking iframe (for future close-from-within functionality)
    window.addEventListener('message', (e) => {
        if (e.data === 'closeBookingModal') {
            closeBookingModal();
        }
    });
});
