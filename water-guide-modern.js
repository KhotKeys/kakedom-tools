// Water Usage Guide - Modern UI with Advanced Animations

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize modern UI elements
    initializeModernUI();
    setupScrollAnimations();
    setupInteractiveElements();
    setupProgressBar();
    
    function initializeModernUI() {
        // Add loading animation to all sections
        const sections = document.querySelectorAll('.section, .method-card, .conservation-item, .tip-item');
        sections.forEach((section, index) => {
            section.classList.add('loading');
            section.style.animationDelay = `${index * 0.1}s`;
        });
        
        // Add floating elements to header
        const header = document.querySelector('.guide-header');
        if (header) {
            const floatingContainer = document.createElement('div');
            floatingContainer.className = 'floating-elements';
            
            for (let i = 0; i < 3; i++) {
                const element = document.createElement('div');
                element.className = 'floating-element';
                floatingContainer.appendChild(element);
            }
            
            header.appendChild(floatingContainer);
        }
        
        // Add modern icons to TOC links
        const tocLinks = document.querySelectorAll('.toc a');
        const icons = ['fa-seedling', 'fa-tint', 'fa-leaf', 'fa-sun', 'fa-chart-line', 'fa-lightbulb'];
        
        tocLinks.forEach((link, index) => {
            if (!link.querySelector('i')) {
                const icon = document.createElement('i');
                icon.className = `fas ${icons[index] || 'fa-circle'}`;
                link.insertBefore(icon, link.firstChild);
            }
        });
        
        // Add icons to section headers
        const sectionHeaders = document.querySelectorAll('.section h2');
        const sectionIcons = ['fa-eye', 'fa-magic', 'fa-recycle', 'fa-thermometer-half', 'fa-desktop', 'fa-star'];
        
        sectionHeaders.forEach((header, index) => {
            if (!header.querySelector('i')) {
                const icon = document.createElement('i');
                icon.className = `fas ${sectionIcons[index] || 'fa-leaf'}`;
                header.insertBefore(icon, header.firstChild);
            }
        });
    }
    
    function setupScrollAnimations() {
        // Intersection Observer for reveal animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add staggered animation delay for grid items
                    if (entry.target.closest('.method-grid, .conservation-grid, .tips-grid')) {
                        const siblings = Array.from(entry.target.parentElement.children);
                        const index = siblings.indexOf(entry.target);
                        entry.target.style.animationDelay = `${index * 0.1}s`;
                    }
                    
                    entry.target.classList.add('animate-in');
                    
                    // Add special effects for cards
                    if (entry.target.classList.contains('method-card')) {
                        setTimeout(() => {
                            entry.target.style.transform = 'translateY(0) scale(1)';
                        }, 200);
                    }
                }
            });
        }, observerOptions);
        
        // Observe all animatable elements
        document.querySelectorAll('.section, .method-card, .conservation-item, .tip-item, .table-card').forEach(el => {
            observer.observe(el);
        });
        
        // Parallax effect for header
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const header = document.querySelector('.guide-header');
            if (header) {
                header.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    }
    
    function setupInteractiveElements() {
        // Handle external links with analytics (optional)
        const tocLinks = document.querySelectorAll('.toc a[target="_blank"]');
        const cardLinks = document.querySelectorAll('.card-link[target="_blank"]');
        
        // Add click tracking for external links
        [...tocLinks, ...cardLinks].forEach(link => {
            link.addEventListener('click', function(e) {
                // Add visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // Optional: Track link clicks
                console.log('External link clicked:', this.href);
            });
        });
        
        // Add welcome message for better UX
        const welcomeMessage = document.createElement('div');
        welcomeMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(27, 94, 32, 0.95);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-size: 14px;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.4s ease;
            max-width: 300px;
            box-shadow: 0 8px 25px rgba(27, 94, 32, 0.3);
        `;
        welcomeMessage.innerHTML = `
            <strong>💡 Tip:</strong> Click any topic to access expert resources. Links open in new tabs so you can easily return here.
        `;
        document.body.appendChild(welcomeMessage);
        
        // Show welcome message after page loads
        setTimeout(() => {
            welcomeMessage.style.opacity = '1';
            welcomeMessage.style.transform = 'translateY(0)';
        }, 2000);
        
        // Hide welcome message after 8 seconds
        setTimeout(() => {
            welcomeMessage.style.opacity = '0';
            welcomeMessage.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                welcomeMessage.remove();
            }, 400);
        }, 8000);
        
        // Method cards hover effects
        const methodCards = document.querySelectorAll('.method-card');
        methodCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-12px) scale(1.02)';
                this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                
                // Add glow effect
                this.style.boxShadow = '0 20px 40px rgba(0, 200, 150, 0.25)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 8px 30px rgba(0, 200, 150, 0.15)';
            });
        });
        
        // Table row hover animations
        const tableRows = document.querySelectorAll('.water-table tbody tr');
        tableRows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.02)';
                this.style.boxShadow = '0 4px 20px rgba(0, 200, 150, 0.1)';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            });
        });
        
        // Conservation items interactive effects
        const conservationItems = document.querySelectorAll('.conservation-item, .tip-item');
        conservationItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                const icon = this.querySelector('i, .icon');
                if (icon) {
                    icon.style.transform = 'scale(1.2) rotate(5deg)';
                    icon.style.transition = 'all 0.3s ease';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                const icon = this.querySelector('i, .icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }
    
    function setupProgressBar() {
        // Create and add progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
        
        // Update progress on scroll
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    }
    
    // Enhanced back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopBtn);
    
    backToTopBtn.addEventListener('click', function() {
        smoothScrollTo(0, 800);
    });
    
    // Show/hide back to top button with animation
    function toggleBackToTop() {
        if (window.pageYOffset > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
    
    window.addEventListener('scroll', toggleBackToTop);
    
    // Mobile table responsiveness
    function handleTableResponsiveness() {
        const table = document.querySelector('.water-table');
        const mobileCards = document.querySelector('.mobile-table-cards');
        
        if (window.innerWidth <= 768) {
            if (table && mobileCards && !mobileCards.children.length) {
                createMobileTableCards();
            }
        }
    }
    
    function createMobileTableCards() {
        const table = document.querySelector('.water-table');
        const mobileContainer = document.querySelector('.mobile-table-cards');
        
        if (!table || !mobileContainer) return;
        
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        
        mobileContainer.innerHTML = '';
        
        rows.forEach((row, index) => {
            const cells = Array.from(row.querySelectorAll('td'));
            const card = document.createElement('div');
            card.className = 'table-card';
            card.style.animationDelay = `${index * 0.1}s`;
            
            cells.forEach((cell, cellIndex) => {
                const cardRow = document.createElement('div');
                cardRow.className = 'card-row';
                
                const label = document.createElement('div');
                label.className = 'card-label';
                label.textContent = headers[cellIndex];
                
                const value = document.createElement('div');
                value.className = 'card-value';
                value.textContent = cell.textContent;
                
                cardRow.appendChild(label);
                cardRow.appendChild(value);
                card.appendChild(cardRow);
            });
            
            mobileContainer.appendChild(card);
        });
    }
    
    // Smooth scroll utility function
    function smoothScrollTo(targetPosition, duration) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        function easeInOutCubic(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        }
        
        requestAnimationFrame(animation);
    }
    
    // Initialize responsive handling
    handleTableResponsiveness();
    window.addEventListener('resize', handleTableResponsiveness);
    
    // Add CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(40px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Mobile Navigation Toggle (from index.html)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
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
    }
    
    // Initialize everything
    updateActiveLink();
    toggleBackToTop();
    
    // Add performance optimization
    let ticking = false;
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    function updateScrollEffects() {
        toggleBackToTop();
        ticking = false;
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Add touch support for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', e => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - show back to top earlier
                if (window.pageYOffset > 200) {
                    backToTopBtn.classList.add('show');
                }
            }
        }
    }
});

// Export utilities for potential external use
window.waterGuideUtils = {
    smoothScrollTo: function(target, duration = 800) {
        const targetPosition = typeof target === 'number' ? target : 
                            document.querySelector(target)?.offsetTop - 120 || 0;
        smoothScrollTo(targetPosition, duration);
    },
    
    highlightSection: function(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.animation = 'pulse 1s ease-out';
        }
    }
};