/* ============================================
   RASHID AYUB - PREMIUM PORTFOLIO SCRIPTS
   ============================================ */

'use strict';

/* ---------- DOM Ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initMirLoader();
  initCustomCursor();
  initScrollProgress();
  initLenis();
  initAOS();
  initGSAP();
  initTyped();
  initNavbar();
  initThemeToggle();
  initMagneticButtons();
  initCounters();
  initSkillBars();
  initPortfolioFilter();
  initTestimonialSlider();
  initContactForm();
  initBackToTop();
  initParticles();
  initThreeJS();
  initActiveNavLink();
  initProfileTilt();
});

/* ---------- MIR 3D Loader ---------- */
let mirLoaderRenderer = null;
let mirLoaderAnimId = null;

// Stores the actual timestamp when loader finishes, so hero animations are
// always relative to that moment regardless of network speed.
let loaderFinishedAt = null;

function initMirLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  document.body.classList.add('loading');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progressBar = loader.querySelector('.mir-loader-progress');
  const progressWrap = loader.querySelector('.mir-loader-bar');
  const statusText = loader.querySelector('.mir-loader-status');

  if (!reducedMotion) {
    initMirLoaderThreeJS();
    // Enhanced canvas glow ring behind MIR text
    initMirLoaderGlowRing();
  }

  const finishLoading = () => {
    if (mirLoaderAnimId) cancelAnimationFrame(mirLoaderAnimId);
    if (mirLoaderRenderer) {
      mirLoaderRenderer.dispose();
      mirLoaderRenderer = null;
    }
    loaderFinishedAt = performance.now();
    loader.classList.add('loaded');
    document.body.classList.remove('loading');
    document.body.style.overflow = 'visible';
    // Trigger hero entrance now that loader is gone
    triggerHeroEntrance();
  };

  if (reducedMotion || typeof gsap === 'undefined') {
    if (progressBar) progressBar.style.width = '100%';
    window.addEventListener('load', () => setTimeout(finishLoading, 300));
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(loader.querySelector('.mir-loader-scene'), {
        scale: 1.08,
        opacity: 0,
        duration: 0.65,
        ease: 'power2.inOut',
        onComplete: finishLoading,
      });
    },
  });

  // Cinematic entrance: letters slam in with depth
  tl.set('.mir-logo-main', { opacity: 0, scale: 0.55, rotateX: -30, rotateY: 15, transformPerspective: 900 })
    .set('.mir-logo-shadow', { opacity: 0 })
    .set('.mir-logo-reflection', { opacity: 0 })
    .to('.mir-logo-main', {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      duration: 0.9,
      ease: 'power4.out',
    })
    .to('.mir-logo-shadow', { opacity: 0.55, duration: 0.5 }, '-=0.6')
    .to('.mir-glass-1', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.45')
    .to('.mir-glass-2', { opacity: 0.85, duration: 0.7, ease: 'power2.out' }, '-=0.5')
    .to('.mir-logo-reflection', { opacity: 0.45, duration: 0.6 }, '-=0.35')
    // shimmer sweep
    .to('.mir-logo-main', {
      backgroundPosition: '200% center',
      duration: 1.0,
      ease: 'power1.inOut',
    }, '-=0.2')
    // subtle float
    .to('.mir-logo-main', {
      y: -6,
      duration: 0.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1,
    }, '-=0.6')
    .to('.mir-loader-bar', { opacity: 1, duration: 0.35 }, '-=0.7')
    .to('.mir-loader-status', { opacity: 1, duration: 0.35 }, '-=0.3')
    .to(progressBar, {
      width: '100%',
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (progressWrap && progressWrap.offsetWidth) {
          const pct = Math.round((parseFloat(getComputedStyle(progressBar).width) / progressWrap.offsetWidth) * 100);
          progressWrap.setAttribute('aria-valuenow', Math.min(pct, 100));
        }
      },
    }, '-=0.15');

  const statusMessages = ['Initializing Experience', 'Loading Assets', 'Preparing Interface'];
  let msgIndex = 0;
  tl.call(() => {
    if (statusText && msgIndex < statusMessages.length - 1) {
      msgIndex += 1;
      statusText.textContent = statusMessages[msgIndex];
    }
  }, null, '-=0.9');

  window.addEventListener('load', () => {
    if (statusText) statusText.textContent = 'Ready';
  });
}

/* Subtle canvas-drawn glow ring that pulses behind the MIR text */
function initMirLoaderGlowRing() {
  const canvas = document.getElementById('mir-loader-canvas');
  if (!canvas) return;

  // Only draw the ring — Three.js handles 3D; this is a 2D overlay
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let glowAnimId = null;
  const startTime = Date.now();

  function drawRing() {
    // mir-loader-canvas is already used by Three.js (WebGL context).
    // If THREE already claimed it we bail silently.
    if (mirLoaderRenderer) { cancelAnimationFrame(glowAnimId); return; }

    const w = canvas.width || window.innerWidth;
    const h = canvas.height || window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const t = (Date.now() - startTime) * 0.001;
    const r = Math.min(w, h) * 0.22 + Math.sin(t * 1.2) * 6;

    ctx.clearRect(0, 0, w, h);
    const grd = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
    const alpha = 0.18 + Math.sin(t * 1.8) * 0.06;
    grd.addColorStop(0, `rgba(255,193,7,${alpha})`);
    grd.addColorStop(0.5, `rgba(255,193,7,${alpha * 0.4})`);
    grd.addColorStop(1, 'rgba(255,193,7,0)');

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    glowAnimId = requestAnimationFrame(drawRing);
  }

  // Only start if Three.js hasn't taken the canvas yet
  setTimeout(() => {
    if (!mirLoaderRenderer) drawRing();
  }, 50);
}

function initMirLoaderThreeJS() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('mir-loader-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 8;

  mirLoaderRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  mirLoaderRenderer.setSize(window.innerWidth, window.innerHeight);
  mirLoaderRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const shapes = [];
  const geos = [
    new THREE.IcosahedronGeometry(0.35, 0),
    new THREE.OctahedronGeometry(0.3, 0),
    new THREE.TorusGeometry(0.25, 0.08, 8, 16),
  ];

  for (let i = 0; i < 6; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffc107,
      wireframe: true,
      transparent: true,
      opacity: 0.12 + Math.random() * 0.08,
    });
    const mesh = new THREE.Mesh(geos[i % geos.length], mat);
    const angle = (i / 6) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * 3.5, Math.sin(angle) * 2, (Math.random() - 0.5) * 2);
    mesh.userData = {
      rotX: (Math.random() - 0.5) * 0.015,
      rotY: (Math.random() - 0.5) * 0.015,
      floatOffset: Math.random() * Math.PI * 2,
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  const startTime = Date.now();

  function animate() {
    mirLoaderAnimId = requestAnimationFrame(animate);
    const t = (Date.now() - startTime) * 0.001;

    shapes.forEach((mesh) => {
      mesh.rotation.x += mesh.userData.rotX;
      mesh.rotation.y += mesh.userData.rotY;
      mesh.position.y += Math.sin(t + mesh.userData.floatOffset) * 0.002;
    });

    camera.position.x = Math.sin(t * 0.3) * 0.3;
    camera.lookAt(0, 0, 0);

    mirLoaderRenderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    if (!mirLoaderRenderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    mirLoaderRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ---------- Profile 3D Tilt ---------- */
function initProfileTilt() {
  const card = document.getElementById('profileTiltCard');
  const frame = card?.querySelector('.profile-glass-frame');
  const glow = card?.querySelector('.profile-glow');
  if (!card || !frame || window.innerWidth <= 991) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const rotateX = y * -12;
    const rotateY = x * 12;

    if (typeof gsap !== 'undefined') {
      gsap.to(frame, {
        rotateX,
        rotateY,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 1000,
      });
    } else {
      frame.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    if (glow) {
      glow.style.left = `${(x + 0.5) * 100}%`;
      glow.style.top = `${(y + 0.5) * 100}%`;
    }
  });

  card.addEventListener('mouseleave', () => {
    if (typeof gsap !== 'undefined') {
      gsap.to(frame, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: 'power2.out',
        transformPerspective: 1000,
      });
    } else {
      frame.style.transform = '';
    }
  });
}

/* ---------- Custom Cursor ---------- */
function initCustomCursor() {
  if (window.innerWidth <= 991) return;

  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');
  if (!dot || !outline) return;

  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateOutline() {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;
    outline.style.left = outlineX + 'px';
    outline.style.top = outlineY + 'px';
    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  const hoverElements = document.querySelectorAll('a, button, .magnetic-btn, .service-card, .portfolio-card, .filter-btn, input, textarea');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ---------- Scroll Progress ---------- */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = progress + '%';
  });
}

/* ---------- Lenis Smooth Scroll ---------- */
let lenis;

function initLenis() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Connect Lenis to GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Smooth anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        lenis.scrollTo(target, { offset: -80 });
      }
    });
  });
}

/* ---------- AOS Initialization ---------- */
function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80,
    disable: 'mobile',
  });
}

/* ---------- Hero Entrance (called by loader on finish) ---------- */
function triggerHeroEntrance() {
  if (typeof gsap === 'undefined') return;

  // Set elements invisible upfront so no FOUC
  gsap.set([
    '.hero-greeting',
    '.hero-name',
    '.hero-title',
    '.hero-description',
    '.hero-social .social-icon',
    '.hero-cta .btn',
    '.scroll-indicator',
  ], { autoAlpha: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('.hero-greeting', { autoAlpha: 1, y: 0, duration: 0.7, fromVars: { y: 50 } })
    .from('.hero-name', { y: 70, autoAlpha: 0, duration: 0.8 }, '-=0.35')
    .from('.hero-title', { y: 30, autoAlpha: 0, duration: 0.6 }, '-=0.45')
    .from('.hero-description', { y: 30, autoAlpha: 0, duration: 0.6 }, '-=0.4')
    .from('.hero-social .social-icon', { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.5 }, '-=0.35')
    .from('.hero-cta .btn', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.5 }, '-=0.3')
    .from('.scroll-indicator', { y: 10, autoAlpha: 0, duration: 0.5 }, '-=0.2');
}

/* ---------- GSAP Animations ---------- */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Pre-hide hero elements so they don't flash before loader exits
  gsap.set([
    '.hero-greeting',
    '.hero-name',
    '.hero-title',
    '.hero-description',
    '.hero-social .social-icon',
    '.hero-cta .btn',
    '.scroll-indicator',
  ], { autoAlpha: 0 });

  // Section title animations
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    });
  });

  // Service cards stagger
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
      },
      y: 60,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.08,
      ease: 'power3.out',
    });
  });

  // About image zoom
  gsap.from('.about-image-wrapper', {
    scrollTrigger: {
      trigger: '.about-image-wrapper',
      start: 'top 80%',
    },
    scale: 0.85,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
  });

  // Timeline items slide in
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: { trigger: item, start: 'top 90%' },
      x: i % 2 === 0 ? -40 : 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    });
  });

  // Portfolio cards
  gsap.utils.toArray('.portfolio-card').forEach((card) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 92%' },
      scale: 0.9,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  });
}

/* ---------- Typed.js Effect ---------- */
function initTyped() {
  if (typeof Typed === 'undefined') return;

  // Start typing only after hero entrance begins; we use a small fixed delay
  // since triggerHeroEntrance plays ~1.8s of animation before the title is visible.
  new Typed('#typed-text', {
    strings: [
      'Frontend Developer',
      'React Developer',
      'UI/UX Enthusiast',
      'Creative Coder',
    ],
    typeSpeed: 60,
    backSpeed: 40,
    backDelay: 2000,
    loop: true,
    startDelay: 800,   // short — loader is already done by the time Typed initialises
  });
}

/* ---------- Navbar Scroll Effect ---------- */
function initNavbar() {
  const navbar = document.getElementById('mainNav');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Close mobile menu on link click
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });
}

/* ---------- Active Nav Link ---------- */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });
}

/* ---------- Dark/Light Theme Toggle ---------- */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

/* ---------- Magnetic Buttons ---------- */
function initMagneticButtons() {
  if (window.innerWidth <= 991) return;

  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

/* ---------- Counter Animation ---------- */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            counter.textContent = target;
            clearInterval(timer);
          } else {
            counter.textContent = Math.floor(current);
          }
        }, 30);
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/* ---------- Skill Progress Bars ---------- */
function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-progress');
  if (!skillBars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(bar => observer.observe(bar));
}

/* ---------- Portfolio Filter ---------- */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const categories = item.getAttribute('data-category') || '';
        const visible = filter === 'all' || categories.includes(filter);

        if (visible) {
          item.classList.remove('hidden');
          // Re-trigger CSS animation cleanly
          item.classList.remove('filter-show');
          void item.offsetWidth; // reflow
          item.classList.add('filter-show');
        } else {
          item.classList.add('hidden');
          item.classList.remove('filter-show');
        }
      });
    });
  });
}

/* ---------- Fade In Keyframe for portfolio filter (CSS class driven) ---------- */
(function injectFilterStyles() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes filterFadeIn {
      from { opacity: 0; transform: scale(0.92) translateY(10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .portfolio-item.filter-show {
      animation: filterFadeIn 0.4s ease forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9); }
      to   { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(s);
}());
function initTestimonialSlider() {
  const track = document.getElementById('testimonialTrack');
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.querySelector('.testimonial-prev');
  const nextBtn = document.querySelector('.testimonial-next');
  const dotsContainer = document.querySelector('.testimonial-dots');

  if (!track || !slides.length) return;

  let currentSlide = 0;
  const totalSlides = slides.length;

  // Create dots
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('span');
    dot.classList.add('testimonial-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  const dots = document.querySelectorAll('.testimonial-dot');

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  }

  prevBtn.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(currentSlide);
  });

  nextBtn.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % totalSlides;
    goToSlide(currentSlide);
  });

  // Auto slide
  setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    goToSlide(currentSlide);
  }, 5000);
}

/* ---------- Contact Form ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;

    const name    = document.getElementById('contactName')?.value.trim();
    const email   = document.getElementById('contactEmail')?.value.trim();
    const subject = document.getElementById('contactSubject')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();

    if (!name || !email || !subject || !message) return;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
    btn.disabled = true;

    const showSuccess = () => {
      btn.innerHTML = '<i class="fas fa-check me-2"></i>Message Sent!';
      btn.style.background = '#10B981';
      form.reset();
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    };

    const showError = (msg = 'Something went wrong. Please try again.') => {
      btn.innerHTML = '<i class="fas fa-times me-2"></i>Failed';
      btn.style.background = '#EF4444';
      btn.disabled = false;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
      }, 3000);
      console.warn('[Contact]', msg);
    };

    // Client-side contact action (open mailto fallback)
    const mailto = `mailto:rashid.ayub@email.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    window.location.href = mailto;
    showSuccess();
  });
}

/* ---------- Back to Top ---------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

/* ---------- Particle Background ---------- */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 768;
  // Fewer particles on mobile for performance
  const particleCount = isMobile ? 25 : 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 193, 7, ${this.opacity})`;
      ctx.fill();
    }
  }

  const particles = Array.from({ length: particleCount }, () => new Particle());

  function connectParticles() {
    if (isMobile) return; // Skip line drawing on mobile
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 193, 7, ${0.05 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
  }
  animate();
}

/* ---------- Three.js Floating Objects ---------- */
function initThreeJS() {
  if (typeof THREE === 'undefined') return;

  // Disable on mobile and when reduced-motion is requested
  if (window.innerWidth < 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const isMobile = window.innerWidth < 1024;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Cap pixel ratio for performance — max 1.5 on desktop, 1 on lower-end
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));

  const geometries = [
    new THREE.IcosahedronGeometry(1.5, 0),
    new THREE.OctahedronGeometry(1.2, 0),
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.TorusGeometry(1, 0.3, 8, 16),
  ];

  const material = new THREE.MeshBasicMaterial({
    color: 0xFFC107,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });

  const meshCount = isMobile ? 4 : 8;
  const meshes = [];

  for (let i = 0; i < meshCount; i++) {
    const geo = geometries[i % geometries.length];
    const mesh = new THREE.Mesh(geo, material.clone());
    mesh.position.set(
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 20
    );
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    mesh.userData = {
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      },
      floatSpeed: Math.random() * 0.005 + 0.002,
      floatOffset: Math.random() * Math.PI * 2,
      baseY: 0, // set after positioning
    };
    mesh.userData.baseY = mesh.position.y;
    scene.add(mesh);
    meshes.push(mesh);
  }

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let threeAnimId;
  function animate() {
    threeAnimId = requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    meshes.forEach(mesh => {
      mesh.rotation.x += mesh.userData.rotSpeed.x;
      mesh.rotation.y += mesh.userData.rotSpeed.y;
      mesh.rotation.z += mesh.userData.rotSpeed.z;
      // Float around base position instead of drifting infinitely
      mesh.position.y = mesh.userData.baseY + Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 1.5;
    });

    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 200);
  });

  // Dispose when page hides (tab switch) to save memory
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(threeAnimId);
    } else {
      animate();
    }
  });
}

