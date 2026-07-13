/* =========================================================
   Hamza Sheikh — Portfolio Interactions
   Cursor, scroll reveals, animated rings/bars, typewriter.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

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

    const hoverables = document.querySelectorAll('a, button, .project-card, .expertise-card, .tag, .tools-strip .tag, input, textarea');
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

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
      try { localStorage.setItem('theme', isDark ? 'light' : 'dark'); } catch (e) {}
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

  /* ---------- Chatbot widget ---------- */
  const chatWidget = document.getElementById('chatbot-widget');
  const chatToggle = document.getElementById('chatbot-toggle');
  const chatMinimize = document.getElementById('chatbot-minimize');
  const chatMessages = document.getElementById('chatbot-messages');
  const chatForm = document.getElementById('chatbot-form');
  const chatInput = document.getElementById('chatbot-input');

  if (chatWidget && chatToggle && chatForm) {
    let chatHistory = [];
    let sending = false;

    const openChat = () => chatWidget.classList.add('open');
    const closeChat = () => chatWidget.classList.remove('open');

    chatToggle.addEventListener('click', () => {
      chatWidget.classList.contains('open') ? closeChat() : openChat();
    });
    if (chatMinimize) chatMinimize.addEventListener('click', closeChat);

    function addMessage(text, role) {
      const div = document.createElement('div');
      div.className = 'chatbot-msg ' + role;
      div.textContent = text; // textContent only: never render visitor/AI text as HTML
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return div;
    }

    function addTyping() {
      const div = document.createElement('div');
      div.className = 'chatbot-msg bot typing';
      div.innerHTML = '<span></span><span></span><span></span>';
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return div;
    }

    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text || sending) return;

      addMessage(text, 'user');
      chatHistory.push({ role: 'user', content: text });
      chatInput.value = '';
      sending = true;

      const typingEl = addTyping();

      try {
        const res = await fetch('/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: chatHistory })
        });

        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error('bad response');
        }

        typingEl.remove();

        if (data.reply) {
          addMessage(data.reply, 'bot');
          chatHistory.push({ role: 'assistant', content: data.reply });
        } else {
          addMessage(data.error || 'Something went wrong. Please try again.', 'error');
        }
      } catch (err) {
        typingEl.remove();
        addMessage('Could not reach the server. If this is running from a local file:// path, deploy it to Vercel first.', 'error');
      } finally {
        sending = false;
      }
    });
  }

  /* ---------- Contact form -> contact.php ---------- */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('cf-submit');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      formStatus.textContent = '';
      formStatus.className = 'form-status';
      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';

      try {
        const formData = new FormData(contactForm);
        const payload = Object.fromEntries(formData.entries());

        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // api/contact.js always returns JSON, even on validation errors —
        // but guard against something serving an HTML error page instead.
        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error('Server did not return a valid response.');
        }

        if (data.success) {
          formStatus.textContent = "Thanks — your message is on its way. I'll reply within a day or two.";
          formStatus.className = 'form-status success';
          contactForm.reset();
        } else {
          formStatus.textContent = data.error || 'Something went wrong. Please try again.';
          formStatus.className = 'form-status error';
        }
      } catch (err) {
        formStatus.textContent = 'Could not reach the server. If this is running from a local file:// path, deploy it to Vercel first.';
        formStatus.className = 'form-status error';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
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

});
