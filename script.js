/* ============================================
   RASHID AYUB - PREMIUM PORTFOLIO SCRIPTS
   ============================================ */

'use strict';

/* ---------- DOM Ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.overflow = 'hidden';
  initLoader();
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

/* ---------- MIR 3D Page Loader ---------- */
let mirLoaderRenderer = null;
let mirLoaderAnimId = null;

function initLoader() {
  const loader = document.getElementById('page-loader');
  const progressBar = document.querySelector('.mir-loader-progress');
  const percentEl = document.querySelector('.mir-loader-percent');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!loader) return;

  initMirLoaderScene();

  const finishLoader = (() => {
    let done = false;
    return () => {
      if (done) return;
      done = true;
      document.body.style.overflow = '';
      loader.classList.add('loaded');

      if (mirLoaderAnimId) cancelAnimationFrame(mirLoaderAnimId);
      if (mirLoaderRenderer) {
        mirLoaderRenderer.dispose();
        mirLoaderRenderer = null;
      }

      if (typeof gsap !== 'undefined') {
        gsap.to(loader, {
          opacity: 0,
          scale: 1.05,
          duration: reducedMotion ? 0.2 : 0.9,
          ease: 'power3.inOut',
          onComplete: () => {
            loader.style.visibility = 'hidden';
          },
        });
      } else {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
      }
    };
  })();

  const tryFinishLoader = (() => {
    let animDone = false;
    let pageLoaded = document.readyState === 'complete';
    return (from) => {
      if (from === 'anim') animDone = true;
      if (from === 'load') pageLoaded = true;
      if (animDone && pageLoaded) finishLoader();
    };
  })();

  window.addEventListener('load', () => tryFinishLoader('load'), { once: true });
  if (document.readyState === 'complete') tryFinishLoader('load');

  if (typeof gsap !== 'undefined' && progressBar) {
    const tl = gsap.timeline({
      onComplete: () => tryFinishLoader('anim'),
    });

    tl.from('.mir-glass-layer', {
      opacity: 0,
      y: 30,
      stagger: 0.12,
      duration: reducedMotion ? 0.1 : 0.8,
      ease: 'power3.out',
    })
    .from('.mir-logo-scene', {
      opacity: 0,
      scale: 0.85,
      rotateX: 25,
      duration: reducedMotion ? 0.1 : 1,
      ease: 'power3.out',
    }, '-=0.4')
    .to('.mir-logo-shine', {
      x: '240%',
      duration: reducedMotion ? 0.1 : 1.2,
      ease: 'power2.inOut',
    }, '-=0.6')
    .to('.mir-logo-main', {
      backgroundPosition: '200% center',
      duration: reducedMotion ? 0.1 : 1.5,
      ease: 'none',
    }, '-=1')
    .to(progressBar, {
      width: '100%',
      duration: reducedMotion ? 0.2 : 1.8,
      ease: 'power2.inOut',
      onUpdate: function () {
        if (percentEl) {
          const p = Math.round(this.progress() * 100);
          percentEl.textContent = p;
        }
      },
    }, '-=1.2');

    if (!reducedMotion) {
      gsap.to('.mir-logo-scene', {
        y: -8,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => tryFinishLoader('anim'), reducedMotion ? 300 : 1800);
    }, { once: true });
  }
}

function initMirLoaderScene() {
  if (typeof THREE === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('mir-loader-canvas');
  if (!canvas) return;

  const isMobile = window.innerWidth <= 768;
  const particleCount = isMobile ? 40 : 80;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b1120, 0.035);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 18;

  mirLoaderRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
  mirLoaderRenderer.setSize(window.innerWidth, window.innerHeight);
  mirLoaderRenderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  const goldLight = new THREE.PointLight(0xffc107, 1.2, 50);
  goldLight.position.set(5, 5, 10);
  const tealLight = new THREE.PointLight(0x14b8a6, 0.6, 40);
  tealLight.position.set(-8, -4, 8);
  scene.add(ambient, goldLight, tealLight);

  const shapes = [];
  const geos = [
    new THREE.IcosahedronGeometry(0.6, 0),
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.TorusGeometry(0.45, 0.12, 8, 20),
  ];

  for (let i = 0; i < (isMobile ? 5 : 10); i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffc107,
      metalness: 0.85,
      roughness: 0.15,
      transparent: true,
      opacity: 0.35,
      wireframe: i % 2 === 0,
    });
    const mesh = new THREE.Mesh(geos[i % geos.length], mat);
    mesh.position.set((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 10);
    mesh.userData = {
      rx: (Math.random() - 0.5) * 0.012,
      ry: (Math.random() - 0.5) * 0.012,
      float: Math.random() * Math.PI * 2,
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 40;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ color: 0xffc107, size: 0.06, transparent: true, opacity: 0.6 })
  );
  scene.add(particles);

  let mouseX = 0;
  let mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const animate = () => {
    mirLoaderAnimId = requestAnimationFrame(animate);
    const t = Date.now() * 0.001;

    shapes.forEach((mesh) => {
      mesh.rotation.x += mesh.userData.rx;
      mesh.rotation.y += mesh.userData.ry;
      mesh.position.y += Math.sin(t + mesh.userData.float) * 0.004;
    });

    particles.rotation.y = t * 0.05;
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    mirLoaderRenderer.render(scene, camera);
  };
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    mirLoaderRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ---------- 3D Profile Card Tilt ---------- */
function initProfileTilt() {
  const card = document.getElementById('profileCard3d');
  if (!card || window.innerWidth <= 991) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const inner = card.querySelector('.profile-card-inner');
  const glow = card.querySelector('.profile-card-glow');
  if (!inner) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 16;
    const rotateX = (0.5 - y) * 16;

    inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    if (glow) {
      glow.style.setProperty('--glow-x', `${x * 100}%`);
      glow.style.setProperty('--glow-y', `${y * 100}%`);
    }
  });

  card.addEventListener('mouseleave', () => {
    inner.style.transform = 'rotateX(0) rotateY(0)';
  });
}

/* ---------- Custom Cursor ---------- */
function initCustomCursor() {
  if (window.innerWidth <= 991) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

  if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
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

/* ---------- GSAP Animations ---------- */
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Hero text reveal
  gsap.from('.hero-greeting', {
    y: 60,
    opacity: 0,
    duration: 1,
    delay: 2.5,
    ease: 'power3.out',
  });

  gsap.from('.hero-name', {
    y: 80,
    opacity: 0,
    duration: 1.2,
    delay: 2.7,
    ease: 'power3.out',
  });

  gsap.from('.hero-description', {
    y: 40,
    opacity: 0,
    duration: 1,
    delay: 3.2,
    ease: 'power3.out',
  });

  gsap.from('.hero-social .social-icon', {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    delay: 3.5,
    ease: 'power3.out',
  });

  gsap.from('.hero-cta .btn', {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.15,
    delay: 3.8,
    ease: 'power3.out',
  });

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
      delay: i * 0.1,
      ease: 'power3.out',
    });
  });

  // About image zoom
  gsap.from('.about-image-wrapper', {
    scrollTrigger: {
      trigger: '.about-image-wrapper',
      start: 'top 80%',
    },
    scale: 0.8,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
  });
}

/* ---------- Typed.js Effect ---------- */
function initTyped() {
  if (typeof Typed === 'undefined') return;

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
    startDelay: 3000,
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
        const categories = item.getAttribute('data-category');
        if (filter === 'all' || categories.includes(filter)) {
          item.classList.remove('hidden');
          item.style.animation = 'fadeIn 0.5s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

/* ---------- Testimonial Slider ---------- */
function initTestimonialSlider() {
  const track = document.getElementById('testimonialTrack');
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.querySelector('.testimonial-prev');
  const nextBtn = document.querySelector('.testimonial-next');
  const dotsContainer = document.querySelector('.testimonial-dots');

  if (!track || !slides.length || !dotsContainer) return;

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

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      goToSlide(currentSlide);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % totalSlides;
      goToSlide(currentSlide);
    });
  }

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

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
    btn.disabled = true;

    // Simulate form submission
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-check me-2"></i>Message Sent!';
      btn.style.background = '#10B981';
      form.reset();

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }, 1500);
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

  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }

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

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 193, 7, ${0.05 * (1 - distance / 150)})`;
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
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    connectParticles();
    requestAnimationFrame(animate);
  }
  animate();
}

/* ---------- Three.js Floating Objects ---------- */
function initThreeJS() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create floating geometric shapes
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

  const meshes = [];
  for (let i = 0; i < 8; i++) {
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
    };
    scene.add(mesh);
    meshes.push(mesh);
  }

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    meshes.forEach(mesh => {
      mesh.rotation.x += mesh.userData.rotSpeed.x;
      mesh.rotation.y += mesh.userData.rotSpeed.y;
      mesh.rotation.z += mesh.userData.rotSpeed.z;
      mesh.position.y += Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 0.01;
    });

    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ---------- Fade In Keyframe (for portfolio filter) ---------- */
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(style);
