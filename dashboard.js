'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCounters();
  initSkillBars();
  initNavHighlight();
  initEntranceAnimations();
});

function initMobileMenu() {
  const btn = document.getElementById('dashMenuBtn');
  const sidebar = document.getElementById('dashSidebar');
  if (!btn || !sidebar) return;

  btn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  document.querySelectorAll('.dash-nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 991) sidebar.classList.remove('open');
    });
  });
}

function initCounters() {
  document.querySelectorAll('.dash-stat-value[data-count]').forEach((el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (Number.isNaN(target)) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = target;
      return;
    }

    if (typeof gsap !== 'undefined') {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.5,
        ease: 'power2.out',
        delay: 0.3,
        onUpdate: () => {
          el.textContent = Math.round(obj.val);
        },
      });
    } else {
      el.textContent = target;
    }
  });
}

function initSkillBars() {
  const bars = document.querySelectorAll('.dash-skill-bar span');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      const width = bar.style.width;
      if (reduced) {
        bar.style.width = width;
      } else {
        bar.style.width = '0';
        requestAnimationFrame(() => {
          bar.style.width = width;
        });
      }
      observer.unobserve(bar);
    });
  }, { threshold: 0.3 });

  bars.forEach((bar) => observer.observe(bar));
}

function initNavHighlight() {
  const links = document.querySelectorAll('.dash-nav-link[href^="#"]');
  const sections = document.querySelectorAll('.dash-section[id]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      links.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach((section) => observer.observe(section));
}

function initEntranceAnimations() {
  if (typeof gsap === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.from('.dash-header', { y: 24, opacity: 0, duration: 0.8, ease: 'power3.out' });
  gsap.from('.dash-stat-card', {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    delay: 0.2,
    ease: 'power3.out',
  });
  gsap.from('.dash-panel', {
    y: 40,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    delay: 0.4,
    ease: 'power3.out',
  });
}
