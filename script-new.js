/**
 * SCROLL-BASED ANIMATIONS & PARALLAX
 * Handles all animations, parallax effects, and interactive elements
 */

class ScrollAnimations {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.observerOptions
    );
    
    this.init();
  }

  init() {
    this.observeElements();
    this.setupHeaderScroll();
    this.setupParallax();
    this.setupSmoothScroll();
  }

  // Observe elements for animation triggers
  observeElements() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => {
      this.observer.observe(el);
    });
  }

  // Handle intersection for animations
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'slideInUp 0.8s ease forwards';
        const delay = entry.target.dataset.delay;
        if (delay) {
          entry.target.style.animationDelay = delay;
        }
      }
    });
  }

  // Header scroll effect
  setupHeaderScroll() {
    const header = document.getElementById('header');
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScrollY = scrollY;
    }, { passive: true });
  }

  // Parallax effect
  setupParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');

    window.addEventListener('scroll', () => {
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.speed) || 0.5;
        const yPos = window.scrollY * speed;
        el.style.transform = `translateY(${yPos}px)`;
      });
    }, { passive: true });
  }

  // Smooth scroll for anchor links
  setupSmoothScroll() {
    const smoothScrollLinks = document.querySelectorAll('.scroll-link');
    
    smoothScrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
}

// Scroll Progress Indicator
class ScrollProgress {
  constructor() {
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => {
      this.updateScrollProgress();
    }, { passive: true });
  }

  updateScrollProgress() {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height);
    
    // You can use this for a progress bar if needed
    document.documentElement.style.setProperty('--scroll-percentage', (scrolled * 100) + '%');
  }
}

// Active nav link based on scroll position
class ActiveNavLink {
  constructor() {
    this.sections = document.querySelectorAll('section[id]');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => {
      this.updateActiveLink();
    }, { passive: true });
  }

  updateActiveLink() {
    let current = '';

    this.sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (window.scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    this.navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      
      if (href === `#${current}`) {
        link.classList.add('active');
      }
    });
  }
}

// Counter Animation for Stats (if added)
class CounterAnimation {
  constructor() {
    this.counters = document.querySelectorAll('.counter');
    this.counterOptions = {
      threshold: 0.5
    };
    
    this.counterObserver = new IntersectionObserver(
      (entries) => this.handleCounterIntersection(entries),
      this.counterOptions
    );

    this.observeCounters();
  }

  observeCounters() {
    this.counters.forEach(counter => {
      this.counterObserver.observe(counter);
    });
  }

  handleCounterIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.animateCounter(entry.target);
        this.counterObserver.unobserve(entry.target);
      }
    });
  }

  animateCounter(counter) {
    const target = parseInt(counter.dataset.target);
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const updateCounter = () => {
      current += increment;
      
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };

    updateCounter();
  }
}

// Video Play Pause on Scroll
class VideoScroller {
  constructor() {
    this.videos = document.querySelectorAll('video');
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => {
      this.checkVideos();
    }, { passive: true });
  }

  checkVideos() {
    this.videos.forEach(video => {
      const rect = video.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible && video.paused && !video.muted) {
        // Optional: could auto-play videos when in view
      } else if (!isVisible && !video.paused) {
        video.pause();
      }
    });
  }
}

// Mobile Menu Toggle (if header nav becomes mobile menu)
class MobileMenu {
  constructor() {
    this.navMenu = document.querySelector('.nav-menu');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.init();
  }

  init() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.closeMenu();
      });
    });
  }

  closeMenu() {
    // For mobile implementations
    if (this.navMenu) {
      this.navMenu.classList.remove('active');
    }
  }
}

// Tooltip Enhancement
class TooltipManager {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('mouseenter', (e) => {
      if (e.target.hasAttribute('data-tooltip')) {
        this.showTooltip(e.target);
      }
    }, true);
  }

  showTooltip(element) {
    const tooltip = element.getAttribute('data-tooltip');
    // Tooltip implementation if needed
  }
}

// Initialize all components on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize scroll animations
  new ScrollAnimations();
  
  // Initialize scroll progress
  new ScrollProgress();
  
  // Initialize active nav links
  new ActiveNavLink();
  
  // Initialize counter animations if present
  if (document.querySelectorAll('.counter').length > 0) {
    new CounterAnimation();
  }
  
  // Initialize video scroller
  new VideoScroller();
  
  // Initialize mobile menu
  new MobileMenu();
  
  // Log initialization
  console.log('✅ Project Hunar - Scroll animations initialized');
});

/**
 * UTILITY FUNCTIONS
 */

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for performance
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Smooth scroll polyfill for older browsers
if (!window.scrollBehavior) {
  Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
    value: function(arg) {
      arg = arg || {};
      const isSmooth = arg.behavior === 'smooth';
      
      if (isSmooth) {
        const element = this;
        const targetY = element.offsetTop;
        const currentY = window.scrollY;
        const distance = targetY - currentY;
        const duration = 1000;
        const startTime = performance.now();

        const easeInOutQuad = (t) => {
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        };

        const scroll = (currentTime) => {
          const elapsedTime = currentTime - startTime;
          const run = easeInOutQuad(elapsedTime / duration);
          
          if (elapsedTime < duration) {
            window.scrollTo(0, currentY + distance * run);
            requestAnimationFrame(scroll);
          } else {
            window.scrollTo(0, targetY);
          }
        };

        requestAnimationFrame(scroll);
      } else {
        window.scrollTo(this.offsetLeft, this.offsetTop);
      }
    }
  });
}

// Add fade in animation to images
window.addEventListener('load', () => {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.onload = () => {
        img.style.opacity = '1';
      };
    }
  });
}, { passive: true });
