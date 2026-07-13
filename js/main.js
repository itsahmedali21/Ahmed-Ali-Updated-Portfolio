/* =========================================================
   Ahmed Ali — Portfolio Interactions
   Cursor, scroll reveals, animated rings/bars, typewriter.
   ========================================================= */

/* ---------- Theme (dark/light) — runs immediately, before paint, to avoid a flash ---------- */
(function initTheme(){
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
})();

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Theme toggle buttons (desktop + mobile menu) ---------- */
  const themeToggles = [document.getElementById('theme-toggle'), document.getElementById('theme-toggle-mobile')]
    .filter(Boolean);
  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  });

  /* ---------- Custom cursor (dot + lagging ring) ---------- */
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  let hasMouse = matchMedia('(hover:hover)').matches;

  if (hasMouse && dot && ring) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    (function animateRing(){
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    })();

    const hoverables = document.querySelectorAll('a, button, .project-card, .expertise-card, .tag, .tools-strip .tag, .hex-item, .skill-node, input, textarea');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (hasMouse) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ---------- Mobile hamburger menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  /* ---------- Typewriter role cycling ---------- */
  const roleEl = document.getElementById('typed-role');
  const roles = ['Frontend Developer', 'Webflow Expert', 'SEO Specialist', 'Vibe Coder'];
  if (roleEl) {
    let roleIndex = 0, charIndex = 0, deleting = false;

    function tick(){
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1400);
          return;
        }
      } else {
        charIndex--;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 45 : 65);
    }
    tick();
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- Skill bar fill ---------- */
  const bars = document.querySelectorAll('.bar-fill');
  const barIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width + '%';
        barIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => barIO.observe(b));

  /* ---------- Lighthouse-style rings ---------- */
  const rings = document.querySelectorAll('.ring-fill');
  const ringIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const circle = entry.target;
        const radius = parseFloat(circle.getAttribute('r'));
        const circumference = 2 * Math.PI * radius;
        const value = parseFloat(circle.dataset.value);
        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;
        requestAnimationFrame(() => {
          const offset = circumference - (value / 100) * circumference;
          circle.style.strokeDashoffset = `${offset}`;
        });
        ringIO.unobserve(circle);
      }
    });
  }, { threshold: 0.4 });
  rings.forEach(r => ringIO.observe(r));

  /* ---------- Sparkline draw-in ---------- */
  const spark = document.querySelector('.spark-path');
  const sparkIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const path = entry.target;
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        requestAnimationFrame(() => {
          path.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.22,.9,.3,1)';
          path.style.strokeDashoffset = '0';
        });
        sparkIO.unobserve(path);
      }
    });
  }, { threshold: 0.4 });
  if (spark) sparkIO.observe(spark);

  /* ---------- Count-up number ---------- */
  const counters = document.querySelectorAll('[data-count-to]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.countTo);
        const suffix = el.dataset.suffix || '';
        const duration = 1300;
        const start = performance.now();

        function step(now){
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        countIO.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => countIO.observe(c));

  /* ---------- Contact form: sends to /api/contact (Vercel serverless function), which emails you.
     Falls back to a pre-filled mailto: link if the API can't be reached, so the visitor
     always has a working way to send their message. ---------- */
  const contactForm = document.getElementById('contact-form');
  const formNote = document.getElementById('form-note');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      formNote.classList.remove('is-error');
      formNote.innerHTML = 'Sending...';

      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());

      function mailtoFallback(reason){
        formNote.classList.add('is-error');
        const subject = encodeURIComponent(`Portfolio message from ${payload.name || 'a visitor'}`);
        const body = encodeURIComponent(`${payload.message || ''}\n\n— ${payload.name || ''} (${payload.email || ''})`);
        const mailto = `mailto:ahmed.ali@email.com?subject=${subject}&body=${body}`;
        formNote.innerHTML = `${reason} <a href="${mailto}">Click here to send it by email instead</a> — your message has been kept in the form.`;
      }

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) { mailtoFallback('Could not reach the contact server.'); return; }

        const data = await res.json();
        if (data.success) {
          formNote.textContent = "Thanks — your message has been sent. I'll reply within a day or two.";
          contactForm.reset();
        } else {
          mailtoFallback(data.error || 'Something went wrong sending that.');
        }
      } catch (err) {
        mailtoFallback('Could not send automatically (this page may not be running on a live server).');
      } finally {
        btn.disabled = false;
      }
    });
  }

});
