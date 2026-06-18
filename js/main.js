(function () {
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const bubble = document.getElementById('nav-bubble');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  let activeLink = document.querySelector('.nav-link.active');

  function updateBubble(link) {
    if (!link) {
      if (bubble) bubble.style.opacity = '0';
      return;
    }
    if (!bubble) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    bubble.style.left = (navRect.left <= 0 ? 0 : linkRect.left - navRect.left) + 'px';
    bubble.style.top = (linkRect.top - navRect.top) + 'px';
    bubble.style.width = linkRect.width + 'px';
    bubble.style.height = linkRect.height + 'px';
    bubble.style.opacity = '1';
  }

  // Set up hover event listeners on each nav link
  navLinks.forEach(function (link) {
    link.addEventListener('mouseenter', function () {
      updateBubble(link);
    });
  });

  // Slide back to the active link when the cursor leaves the nav area
  if (nav) {
    nav.addEventListener('mouseleave', function () {
      activeLink = document.querySelector('.nav-link.active');
      updateBubble(activeLink);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      // Immediately highlight the clicked link and position bubble
      navLinks.forEach(function (l) {
        l.classList.remove('active');
      });
      this.classList.add('active');
      activeLink = this;
      updateBubble(activeLink);

      target.scrollIntoView({ behavior: 'smooth' });
      closeMobileMenu();
    });
  });

  function closeMobileMenu() {
    nav.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      // Brief timeout to let layout coordinates settle during mobile menu slide transition
      setTimeout(function () {
        activeLink = document.querySelector('.nav-link.active');
        updateBubble(activeLink);
      }, 50);
    }
  });

  const observerOptions = {
    root: null,
    rootMargin: '-' + getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim() + ' 0px -50% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        let newActive = null;
        navLinks.forEach(function (link) {
          const isActive = link.getAttribute('href') === '#' + id;
          link.classList.toggle('active', isActive);
          if (isActive) {
            newActive = link;
          }
        });
        if (newActive) {
          activeLink = newActive;
          if (nav && !nav.matches(':hover')) {
            updateBubble(activeLink);
          }
        }
      }
    });
  }, observerOptions);

  sections.forEach(function (section) {
    observer.observe(section);
  });

  window.addEventListener('scroll', function () {
    header.style.background = window.scrollY > 50
      ? 'linear-gradient(to bottom, rgba(17, 17, 17, 0.6), transparent)'
      : 'transparent';
  });

  window.addEventListener('resize', function () {
    activeLink = document.querySelector('.nav-link.active');
    updateBubble(activeLink);
  });

  // Initialize the bubble's position
  function initBubble() {
    activeLink = document.querySelector('.nav-link.active');
    updateBubble(activeLink);
  }

  // Initialize on load and with tiny fallback delays to handle font load or slow rendering
  window.addEventListener('load', initBubble);
  initBubble();
  setTimeout(initBubble, 100);
  setTimeout(initBubble, 500);
})();

/* ===== Projects Showcase Slider ===== */
(function () {
  var slides = document.querySelectorAll('.showcase-slide');
  var dots = document.querySelectorAll('.showcase-dot');
  var prevBtn = document.getElementById('showcase-prev');
  var nextBtn = document.getElementById('showcase-next');
  var currentEl = document.getElementById('showcase-current');
  var totalEl = document.getElementById('showcase-total');
  var container = document.getElementById('showcase-container');

  if (!slides.length || !nextBtn) return;

  var current = 0;
  var total = slides.length;
  var isAnimating = false;

  // Zero-pad number
  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  // Update counter display
  function updateCounter() {
    if (currentEl) currentEl.textContent = pad(current + 1);
    if (totalEl) totalEl.textContent = pad(total);
  }

  // Update dot indicators
  function updateDots() {
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  // Go to a specific slide with direction-based animations
  function goToSlide(index, direction) {
    if (isAnimating || index === current) return;
    isAnimating = true;

    var prev = current;
    current = index;

    // Auto-determine direction if not explicitly provided (e.g., from dots)
    if (!direction) {
      direction = index > prev ? 'next' : 'prev';
    }

    if (direction === 'next') {
      // Old slide exits to the left
      slides[prev].classList.remove('active');
      slides[prev].classList.add('exit-left');

      // New slide enters from the right (clean class states first)
      slides[current].classList.remove('exit-left', 'exit-right', 'enter-left');
      slides[current].classList.add('active');

      setTimeout(function () {
        slides[prev].classList.remove('exit-left');
        isAnimating = false;
      }, 550);
    } else {
      // Old slide exits to the right
      slides[prev].classList.remove('active');
      slides[prev].classList.add('exit-right');

      // New slide enters from the left
      slides[current].classList.remove('exit-left', 'exit-right');
      slides[current].classList.add('enter-left');

      // Force reflow to ensure the starting position is registered
      slides[current].offsetHeight;

      slides[current].classList.add('active');
      slides[current].classList.remove('enter-left');

      setTimeout(function () {
        slides[prev].classList.remove('exit-right');
        isAnimating = false;
      }, 550);
    }

    updateCounter();
    updateDots();
  }

  // Next slide
  function nextSlide() {
    var next = (current + 1) % total;
    goToSlide(next, 'next');
  }

  // Previous slide
  function prevSlide() {
    var prev = (current - 1 + total) % total;
    goToSlide(prev, 'prev');
  }

  // Arrow clicks
  nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) {
    prevBtn.addEventListener('click', prevSlide);
  }

  // Dot clicks
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = parseInt(this.getAttribute('data-dot'), 10);
      goToSlide(index);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    // Only respond if the showcase section is somewhat visible
    if (!container) return;
    var rect = container.getBoundingClientRect();
    var inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowRight') {
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
    }
  });

  // Initialize
  updateCounter();
})();
