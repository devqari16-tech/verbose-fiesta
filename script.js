
// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Back to top button functionality
const backToTopButton = document.querySelector('.back-to-top');

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide back to top button based on scroll position
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
});

// Navbar background change on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = 'linear-gradient(135deg, rgba(0, 17, 34, 0.95) 0%, rgba(0, 51, 102, 0.95) 50%, rgba(0, 102, 204, 0.95) 100%)';
        navbar.style.backdropFilter = 'blur(15px)';
        navbar.style.borderBottom = '2px solid rgba(0, 153, 255, 0.8)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, #001122 0%, #003366 50%, #0066cc 100%)';
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.borderBottom = '2px solid #0066cc';
    }
});

// Form submission handler
const contactForm = document.querySelector('.modern-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission
        
        const submitBtn = this.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        const formData = new FormData(this);
        
        // Show loading state
        submitBtn.innerHTML = '<span>Sending...</span><i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
        
        // Submit to Formspree using fetch
        fetch('https://formspree.io/f/mqayanjl', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Show success message
                alert('Thank you for your message! We will get back to you soon.');
                // Reset form
                this.reset();
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Sorry, there was an error sending your message. Please try again or call us directly.');
        })
        .finally(() => {
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    });
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Add fade-in class to elements that should animate
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .service-card, .location-item, .contact-item');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// Call button functionality - Enhanced to handle all service buttons
document.querySelectorAll('.btn-primary, .cta-btn, .btn-emergency').forEach(button => {
    const buttonText = button.textContent.toLowerCase();
    
    // Check if button contains call-related text or service-related text
    if (buttonText.includes('call') || 
        buttonText.includes('emergency') || 
        buttonText.includes('now') || 
        buttonText.includes('contact') || 
        buttonText.includes('reach') || 
        buttonText.includes('help')) {
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'tel:+16478194452';
        });
        
        // Add cursor pointer to make it clear it's clickable
        button.style.cursor = 'pointer';
    }
});

// Service area location highlighting
document.querySelectorAll('.location-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.05)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Responsive image loading
function loadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', loadImages);

// Additional service button handlers - ensure all service buttons work
document.addEventListener('DOMContentLoaded', function() {
    // Handle all service buttons that should trigger phone calls
    const serviceButtons = document.querySelectorAll('.service-content .btn-primary');
    
    serviceButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Make the call
            window.location.href = 'tel:+16478194452';
        });
        
        // Visual feedback
        button.style.cursor = 'pointer';
        button.title = 'Call AFG555TOWING Emergency Line: (647) 819-4452';
    });
    
    // Also handle the main navigation call button
    const navCallBtn = document.querySelector('.nav-cta .cta-btn');
    if (navCallBtn) {
        navCallBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'tel:+16478194452';
        });
    }
    
    // Handle hero section buttons
    const heroButtons = document.querySelectorAll('.hero-buttons .btn-primary, .hero-buttons .btn-secondary');
    heroButtons.forEach(button => {
        if (button.textContent.toLowerCase().includes('call')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'tel:+16478194452';
            });
        } else if (button.textContent.toLowerCase().includes('view') || button.textContent.toLowerCase().includes('services')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector('#services').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        }
    });
});

// Add smooth transitions for mobile menu
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            left: -100%;
            top: 80px;
            flex-direction: column;
            background-color: #2c4f6b;
            width: 100%;
            text-align: center;
            transition: 0.3s;
            box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
            padding: 20px 0;
        }

        .nav-menu.active {
            left: 0;
        }

        .nav-menu li {
            margin: 15px 0;
        }

        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }

        .hamburger.active span:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }

        .hamburger.active span:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }
    }
`;
document.head.appendChild(style);
