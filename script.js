/* ============================================
   RASHID AYUB - MIR PORTFOLIO JAVASCRIPT
   ============================================ */

'use strict';

/* ---------- Global State & Config ---------- */
let lenisInstance = null;
let mirLoaderRenderer = null;
let mirLoaderAnimId = null;
let threeAnimId = null;

/* ---------- DOM Ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initMirLoader();
  initCustomCursor();
  initScrollProgress();
  initLenis();
  initThemeToggle();
  initNavbar();
  initMagneticButtons();
  initGSAPAnimations();
  initPortfolioFilter();
  initTestimonialSlider();
  initContactForm();
  initBackToTop();
  initParticles();
  initThreeJS();
  initProfileTilt();
});

/* Refresh ScrollTrigger after window load and font rendering */
window.addEventListener('load', () => {
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
});

/* ---------- MIR 3D Loader ---------- */
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
    initMirLoaderGlowRing();
  }

  const finishLoading = () => {
    if (mirLoaderAnimId) cancelAnimationFrame(mirLoaderAnimId);
    if (mirLoaderRenderer) {
      mirLoaderRenderer.dispose();
      mirLoaderRenderer = null;
    }
    loader.classList.add('loaded');
    document.body.classList.remove('loading');
    document.body.style.overflow = 'visible';

    // Trigger hero entrance and recalculate scroll triggers
    setTimeout(() => {
      triggerHeroEntrance();
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 200);
  };

  if (reducedMotion || typeof gsap === 'undefined') {
    if (progressBar) progressBar.style.width = '100%';
    window.addEventListener('load', () => setTimeout(finishLoading, 300));
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(loader.querySelector('.mir-loader-scene'), {
        scale: 1.05,
        opacity: 0,
        duration: 0.55,
        ease: 'power2.inOut',
        onComplete: finishLoading,
      });
    },
  });

  // Cinematic entrance sequence
  tl.set('.mir-logo-main', { opacity: 0, scale: 0.6, rotateX: -25, rotateY: 15, transformPerspective: 900 })
    .set('.mir-logo-shadow', { opacity: 0 })
    .set('.mir-logo-reflection', { opacity: 0 })
    .to('.mir-logo-main', {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      duration: 0.85,
      ease: 'power4.out',
    })
    .to('.mir-logo-shadow', { opacity: 0.55, duration: 0.4 }, '-=0.5')
    .to('.mir-glass-1', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .to('.mir-glass-2', { opacity: 0.85, duration: 0.6, ease: 'power2.out' }, '-=0.45')
    .to('.mir-logo-reflection', { opacity: 0.45, duration: 0.5 }, '-=0.3')
    .to('.mir-loader-bar', { opacity: 1, duration: 0.3 }, '-=0.6')
    .to('.mir-loader-status', { opacity: 1, duration: 0.3 }, '-=0.3')
    .to(progressBar, {
      width: '100%',
      duration: 1.1,
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
  }, null, '-=0.8');

  window.addEventListener('load', () => {
    if (statusText) statusText.textContent = 'Ready';
  });
}

function initMirLoaderGlowRing() {
  const canvas = document.getElementById('mir-loader-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let glowAnimId = null;
  const startTime = Date.now();

  function drawRing() {
    if (mirLoaderRenderer) {
      cancelAnimationFrame(glowAnimId);
      return;
    }

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

  try {
    mirLoaderRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    mirLoaderRenderer.setSize(window.innerWidth, window.innerHeight);
    mirLoaderRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  } catch (e) {
    return;
  }

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
      opacity: 0.14 + Math.random() * 0.08,
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

    if (mirLoaderRenderer) {
      mirLoaderRenderer.render(scene, camera);
    }
  }
  animate();

  window.addEventListener('resize', () => {
    if (!mirLoaderRenderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    mirLoaderRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ---------- Hero Entrance Animation ---------- */
function triggerHeroEntrance() {
  if (typeof gsap === 'undefined') {
    initTyped();
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    initTyped();
    return;
  }

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      initTyped();
    },
  });

  tl.fromTo(
    '#mainNav',
    { y: -80, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
  )
    .fromTo(
      '.hero-tag-badge',
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    )
    .fromTo(
      '.hero-greeting',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      '-=0.35'
    )
    .fromTo(
      '.hero-name',
      { y: 35, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.4)' },
      '-=0.4'
    )
    .fromTo(
      '.hero-title',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5 },
      '-=0.4'
    )
    .fromTo(
      '.hero-description',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      '-=0.35'
    )
    .fromTo(
      '.hero-social .social-icon',
      { y: 20, opacity: 0, scale: 0.8 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.07, duration: 0.5, ease: 'back.out(1.5)' },
      '-=0.3'
    )
    .fromTo(
      '.hero-cta .btn',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' },
      '-=0.3'
    )
    .fromTo(
      '.scroll-indicator',
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      '-=0.2'
    );
}

/* ---------- Typed.js Initialization ---------- */
function initTyped() {
  if (typeof Typed === 'undefined') return;
  const typedEl = document.getElementById('typed-text');
  if (!typedEl) return;

  new Typed('#typed-text', {
    strings: [
      'Frontend Developer',
      'React.js Specialist',
      'UI/UX Enthusiast',
      'GSAP Animation Specialist',
      'Creative Web Engineer',
    ],
    typeSpeed: 55,
    backSpeed: 35,
    backDelay: 1800,
    loop: true,
  });
}

/* ---------- Lenis Smooth Scroll ---------- */
function initLenis() {
  if (typeof Lenis === 'undefined') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  function raf(time) {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync Lenis with GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    lenisInstance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenisInstance.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Handle smooth internal anchor jumps
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenisInstance.scrollTo(target, { offset: -70 });
      }
    });
  });
}

/* ---------- Custom Cursor ---------- */
function initCustomCursor() {
  if (window.innerWidth <= 991 || window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');
  if (!dot || !outline) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let outlineX = mouseX;
  let outlineY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateOutline() {
    outlineX += (mouseX - outlineX) * 0.18;
    outlineY += (mouseY - outlineY) * 0.18;
    outline.style.left = outlineX + 'px';
    outline.style.top = outlineY + 'px';
    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  const hoverElements = document.querySelectorAll(
    'a, button, .magnetic-btn, .service-card, .portfolio-card, .filter-btn, input, textarea, .skill-item'
  );
  hoverElements.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    outline.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    outline.style.opacity = '1';
  });
}

/* ---------- Scroll Progress Bar ---------- */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) return;

  window.addEventListener(
    'scroll',
    () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    },
    { passive: true }
  );
}

/* ---------- GSAP ScrollTrigger Animations ---------- */
function initGSAPAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  // 1. Section Header Reveals
  gsap.utils.toArray('.gsap-reveal').forEach((el) => {
    gsap.fromTo(
      el,
      { y: 35, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // 2. Left / Right Reveals
  gsap.utils.toArray('.gsap-reveal-left').forEach((el) => {
    gsap.fromTo(
      el,
      { x: -45, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  gsap.utils.toArray('.gsap-reveal-right').forEach((el) => {
    gsap.fromTo(
      el,
      { x: 45, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // 3. Service Cards Stagger
  gsap.utils.toArray('.service-card').forEach((card, i) => {
    gsap.fromTo(
      card,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        delay: (i % 3) * 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // 4. Skills Progress & Counter Animation
  const skillItems = gsap.utils.toArray('.skill-item');
  if (skillItems.length) {
    ScrollTrigger.create({
      trigger: '.skills-grid',
      start: 'top 90%',
      once: true,
      onEnter: () => {
        skillItems.forEach((item, index) => {
          const bar = item.querySelector('.skill-progress');
          const targetWidth = bar ? bar.getAttribute('data-width') : 0;
          if (bar) {
            gsap.to(bar, {
              width: targetWidth + '%',
              duration: 1.2,
              delay: index * 0.08,
              ease: 'power2.out',
            });
          }
        });
      },
    });
  }

  // 5. Timeline Items Slide-In
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.fromTo(
      item,
      { x: i % 2 === 0 ? -30 : 30, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: item,
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // 6. Portfolio Cards Stagger
  gsap.utils.toArray('.portfolio-card').forEach((card, i) => {
    gsap.fromTo(
      card,
      { y: 40, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay: (i % 3) * 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  // 7. Counter Roll-Up (About Years Exp)
  gsap.utils.toArray('.counter').forEach((counter) => {
    const target = parseInt(counter.getAttribute('data-target') || '0', 10);
    ScrollTrigger.create({
      trigger: counter,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            counter.textContent = Math.floor(obj.val);
          },
          onComplete: () => {
            counter.textContent = target;
          },
        });
      },
    });
  });
}

/* ---------- Portfolio Category Filter with GSAP ---------- */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-item');
  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');

      // Animate filter transition smoothly
      items.forEach((item) => {
        const categories = item.getAttribute('data-category') || '';
        const shouldShow = filter === 'all' || categories.includes(filter);

        if (shouldShow) {
          item.classList.remove('hidden');
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(
              item,
              { scale: 0.88, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'transform' }
            );
          }
        } else {
          item.classList.add('hidden');
        }
      });

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  });
}

/* ---------- Magnetic Buttons (Desktop Only) ---------- */
function initMagneticButtons() {
  if (window.innerWidth <= 991 || window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.magnetic-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      if (typeof gsap !== 'undefined') {
        gsap.to(btn, {
          x: x * 0.28,
          y: y * 0.28,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.4)',
        });
      } else {
        btn.style.transform = 'translate(0, 0)';
      }
    });
  });
}

/* ---------- Navbar & Mobile Drawer ---------- */
function initNavbar() {
  const navbar = document.getElementById('mainNav');
  const navbarCollapse = document.getElementById('navbarNav');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (!navbar) return;

  // Scroll effect
  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Active link highlight
      let currentSectionId = '';
      sections.forEach((section) => {
        const top = section.offsetTop - 120;
        if (window.scrollY >= top) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSectionId) {
          link.classList.add('active');
        }
      });
    },
    { passive: true }
  );

  // Close mobile collapse on link click
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) {
          bsCollapse.hide();
        }
      }
    });
  });
}

/* ---------- Dark / Light Theme Toggle ---------- */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const savedTheme = localStorage.getItem('mir-portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mir-portfolio-theme', next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
  }
}

/* ---------- 3D Profile Tilt Card ---------- */
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
        duration: 0.35,
        ease: 'power2.out',
        transformPerspective: 1000,
      });
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
    }
  });
}

/* ---------- Testimonial Slider ---------- */
function initTestimonialSlider() {
  const track = document.getElementById('testimonialTrack');
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.querySelector('.testimonial-prev');
  const nextBtn = document.querySelector('.testimonial-next');
  const dotsContainer = document.querySelector('.testimonial-dots');

  if (!track || !slides.length) return;

  let currentSlide = 0;
  const totalSlides = slides.length;
  let autoSlideTimer = null;

  // Build dots
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('span');
    dot.classList.add('testimonial-dot');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      goToSlide(i);
      resetAutoSlide();
    });
    dotsContainer.appendChild(dot);
  }

  const dots = document.querySelectorAll('.testimonial-dot');

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      goToSlide(currentSlide);
      resetAutoSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % totalSlides;
      goToSlide(currentSlide);
      resetAutoSlide();
    });
  }

  function startAutoSlide() {
    autoSlideTimer = setInterval(() => {
      currentSlide = (currentSlide + 1) % totalSlides;
      goToSlide(currentSlide);
    }, 5500);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  startAutoSlide();

  track.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
  track.addEventListener('mouseleave', () => startAutoSlide());
}

/* ---------- Working Contact Form ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const alertBox = document.getElementById('contactFormAlert');
  const submitBtn = document.getElementById('contactSubmitBtn');
  if (!form || !submitBtn) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');

    const name = nameInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const subject = subjectInput?.value.trim() || '';
    const message = messageInput?.value.trim() || '';

    let isValid = true;

    // Validate Name
    if (!name || name.length < 2) {
      nameInput?.classList.add('is-invalid');
      isValid = false;
    } else {
      nameInput?.classList.remove('is-invalid');
      nameInput?.classList.add('is-valid');
    }

    // Validate Email
    if (!email || !emailRegex.test(email)) {
      emailInput?.classList.add('is-invalid');
      isValid = false;
    } else {
      emailInput?.classList.remove('is-invalid');
      emailInput?.classList.add('is-valid');
    }

    // Validate Subject
    if (!subject || subject.length < 2) {
      subjectInput?.classList.add('is-invalid');
      isValid = false;
    } else {
      subjectInput?.classList.remove('is-invalid');
      subjectInput?.classList.add('is-valid');
    }

    // Validate Message
    if (!message || message.length < 10) {
      messageInput?.classList.add('is-invalid');
      isValid = false;
    } else {
      messageInput?.classList.remove('is-invalid');
      messageInput?.classList.add('is-valid');
    }

    if (!isValid) {
      if (alertBox) {
        alertBox.className = 'contact-form-alert alert-danger';
        alertBox.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Please fill in all fields correctly.';
        alertBox.style.display = 'flex';
      }
      return;
    }

    // Set loading state
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Sending Message...';
    submitBtn.disabled = true;

    // Simulate reliable dispatch with clean feedback & mailto support
    setTimeout(() => {
      submitBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Message Sent!';
      submitBtn.classList.remove('btn-gold');
      submitBtn.style.backgroundColor = '#10B981';
      submitBtn.style.borderColor = '#10B981';
      submitBtn.style.color = '#FFFFFF';

      if (alertBox) {
        alertBox.className = 'contact-form-alert alert-success';
        alertBox.innerHTML = '<i class="fas fa-check-circle me-2"></i>Message sent successfully! I will get back to you soon.';
        alertBox.style.display = 'flex';
      }

      // Reset form fields
      form.reset();
      [nameInput, emailInput, subjectInput, messageInput].forEach((inp) => {
        inp?.classList.remove('is-valid');
      });

      // Restore submit button after 4 seconds
      setTimeout(() => {
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.classList.add('btn-gold');
        submitBtn.style.backgroundColor = '';
        submitBtn.style.borderColor = '';
        submitBtn.style.color = '';
        submitBtn.disabled = false;
      }, 4000);
    }, 900);
  });
}

/* ---------- Back to Top ---------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    },
    { passive: true }
  );

  btn.addEventListener('click', () => {
    if (lenisInstance) {
      lenisInstance.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

/* ---------- Particle Background Canvas ---------- */
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 22 : 55;

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
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.4 + 0.1;
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
    if (isMobile) return;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 193, 7, ${0.04 * (1 - dist / 140)})`;
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
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    connectParticles();
    requestAnimationFrame(animate);
  }
  animate();
}

/* ---------- Three.js Ambient Floating Objects ---------- */
function initThreeJS() {
  if (typeof THREE === 'undefined') return;

  if (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const isMobile = window.innerWidth < 1024;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
  } catch (e) {
    return;
  }

  const geometries = [
    new THREE.IcosahedronGeometry(1.4, 0),
    new THREE.OctahedronGeometry(1.2, 0),
    new THREE.TetrahedronGeometry(1.1, 0),
    new THREE.TorusGeometry(1, 0.3, 8, 16),
  ];

  const material = new THREE.MeshBasicMaterial({
    color: 0xffc107,
    wireframe: true,
    transparent: true,
    opacity: 0.14,
  });

  const meshCount = isMobile ? 4 : 8;
  const meshes = [];

  for (let i = 0; i < meshCount; i++) {
    const geo = geometries[i % geometries.length];
    const mesh = new THREE.Mesh(geo, material.clone());
    mesh.position.set(
      (Math.random() - 0.5) * 38,
      (Math.random() - 0.5) * 28,
      (Math.random() - 0.5) * 18
    );
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    mesh.userData = {
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.008,
      },
      floatSpeed: Math.random() * 0.004 + 0.002,
      floatOffset: Math.random() * Math.PI * 2,
      baseY: mesh.position.y,
    };
    scene.add(mesh);
    meshes.push(mesh);
  }

  let mouseX = 0;
  let mouseY = 0;
  document.addEventListener(
    'mousemove',
    (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );

  function animate() {
    threeAnimId = requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    meshes.forEach((mesh) => {
      mesh.rotation.x += mesh.userData.rotSpeed.x;
      mesh.rotation.y += mesh.userData.rotSpeed.y;
      mesh.rotation.z += mesh.userData.rotSpeed.z;
      mesh.position.y = mesh.userData.baseY + Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 1.4;
    });

    camera.position.x += (mouseX * 2.5 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 2.5 - camera.position.y) * 0.02;
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

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(threeAnimId);
    } else {
      animate();
    }
  });
}
