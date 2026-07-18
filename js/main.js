/**
 * main.js — Ahmed Ali portfolio
 * Everything the page needs, in one file, so nothing gets lost between edits:
 *   1. Theme toggle (dark/light)
 *   2. Mobile hamburger menu
 *   3. Typed hero role text
 *   4. Reveal-on-scroll for .reveal elements
 *   5. Progress rings / skill bars / count-up numbers
 *   6. Contact form -> contact.php (AJAX, no page reload)
 *   7. Local rule-based chatbot (no API, no backend)
 */

document.addEventListener('DOMContentLoaded', function () {



  
  // -----------------------------------------------------------
  // 1. THEME TOGGLE
  // -----------------------------------------------------------
  (function themeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      const root = document.documentElement;
      const isDark = root.getAttribute('data-theme') === 'dark';
      if (isDark) {
        root.removeAttribute('data-theme');
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
      } else {
        root.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('theme', 'dark'); } catch (e) {}
      }
    });
  })();

  // -----------------------------------------------------------
  // 2. MOBILE HAMBURGER MENU
  // -----------------------------------------------------------
  (function mobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    if (!hamburger || !menu) return;

    hamburger.addEventListener('click', function () {
      const isOpen = menu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  })();

  // -----------------------------------------------------------
  // 3. TYPED HERO ROLE TEXT
  // -----------------------------------------------------------
  (function typedRole() {
    const el = document.getElementById('typed-role');
    if (!el) return;

    const roles = [
      'Frontend Developer',
      'Webflow Expert',
      'SEO Specialist',
      'Vibe Coder'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = roles[roleIndex];

      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1400); // pause at full word
          return;
        }
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }

      setTimeout(tick, deleting ? 40 : 80);
    }

    tick();
  })();

  // -----------------------------------------------------------
  // 4. REVEAL-ON-SCROLL (with safety fallback so content
  //    NEVER stays permanently invisible even if something else fails)
  // -----------------------------------------------------------
  (function revealOnScroll() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    function show(el) {
      el.classList.add('in-view', 'visible', 'active', 'show');
      el.style.opacity = '1';
      el.style.transform = 'none';
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            show(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      items.forEach(function (el) { observer.observe(el); });
    } else {
      items.forEach(show);
    }

    // Safety net: if for any reason an element never triggers
    // (unsupported browser, layout edge case), force it visible
    // after 2.5s so the page can never end up permanently blank.
    setTimeout(function () {
      items.forEach(show);
    }, 2500);
  })();

  // -----------------------------------------------------------
  // 5a. PROGRESS RINGS (hero audit card)
  // -----------------------------------------------------------
  (function animateRings() {
    const rings = document.querySelectorAll('.ring-fill');
    rings.forEach(function (ring) {
      const value = parseFloat(ring.getAttribute('data-value')) || 0;
      const radius = parseFloat(ring.getAttribute('r')) || 34;
      const circumference = 2 * Math.PI * radius;
      ring.style.strokeDasharray = circumference.toFixed(2);
      ring.style.strokeDashoffset = circumference.toFixed(2);
      // animate shortly after paint
      requestAnimationFrame(function () {
        setTimeout(function () {
          ring.style.transition = 'stroke-dashoffset 1.1s ease';
          ring.style.strokeDashoffset = (circumference * (1 - value / 100)).toFixed(2);
        }, 150);
      });
    });
  })();

  // -----------------------------------------------------------
  // 5b. SKILL BARS
  // -----------------------------------------------------------
  (function animateSkillBars() {
    const bars = document.querySelectorAll('.bar-fill');
    if (!bars.length) return;

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const width = bar.getAttribute('data-width') || 0;
          bar.style.transition = 'width 1s ease';
          bar.style.width = width + '%';
          obs.unobserve(bar);
        }
      });
    }, { threshold: 0.2 });

    bars.forEach(function (bar) {
      bar.style.width = '0%';
      observer.observe(bar);
    });
  })();

  // -----------------------------------------------------------
  // 5c. COUNT-UP NUMBERS
  // -----------------------------------------------------------
  (function countUp() {
    const counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-count-to')) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1200;
        const start = performance.now();

        function frame(now) {
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = Math.round(progress * target) + suffix;
          if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
        obs.unobserve(el);
      });
    }, { threshold: 0.3 });

    counters.forEach(function (el) { observer.observe(el); });
  })();

// -----------------------------------------------------------
  // 6. CONTACT FORM -> /api/contact (Vercel serverless function, AJAX)
  // -----------------------------------------------------------
  (function contactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    const submitBtn = document.getElementById('cf-submit');
    if (!form || !status) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('cf-name').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const message = document.getElementById('cf-message').value.trim();

      if (!name || !email || !message) {
        status.textContent = 'Please fill in every field.';
        status.className = 'form-status error';
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      status.textContent = 'Sending your message…';
      status.className = 'form-status';

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, message: message })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            status.textContent = "Thanks! Your message has been sent — I'll reply within a day or two.";
            status.className = 'form-status success';
            form.reset();
          } else {
            status.textContent = data.error || 'Something went wrong. Please try again or use WhatsApp.';
            status.className = 'form-status error';
          }
        })
        .catch(function () {
          status.textContent = 'Could not reach the server. Please try again or use WhatsApp.';
          status.className = 'form-status error';
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
          }
        });
    });
  })();

  // -----------------------------------------------------------
  // 7. LOCAL RULE-BASED CHATBOT (no API, no backend)
  // -----------------------------------------------------------
  (function chatbot() {
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const messages = document.getElementById('chatbot-messages');
    const toggle = document.getElementById('chatbot-toggle');
    const panel = document.getElementById('chatbot-panel');
    const minimize = document.getElementById('chatbot-minimize');
    const widget = document.getElementById('chatbot-widget');
    if (!form || !input || !messages) return;

    const FACTS = {
      intro: "I'm Ahmed's portfolio assistant. Ask me about his skills, his projects, or how to reach him!",
      about: "I'm Ahmed's portfolio assistant. Ask me about his skills, his projects, or how to reach him!",
      skills: "Ahmed works across four areas: Frontend (HTML5, CSS3, JavaScript, React), Webflow (CMS, Custom Interactions, Client Handoff), SEO (Technical SEO, On-Page SEO, Core Web Vitals, Keyword Research), and Vibe Coding (AI-assisted development with Claude, Cursor, rapid prototyping).",
      projects: "Ahmed has 4 real projects: DevicesArena (full-stack phone review platform), Muse AI (a Webflow SaaS landing page), Umrah Tours (a Webflow travel agency site with SEO work), and an Exam Portal (full-stack, vibe-coded, with a live leaderboard). Ask me about any one by name for more detail!",
      devicesarena: "DevicesArena (devicesarena.com) is a full-stack smartphone review and comparison platform Ahmed hand-coded end to end — device database, spec compare tool, custom auth, and a live news section.",
      museai: "Muse AI (muse-ai-ahmed.webflow.io) is an AI SaaS landing page built entirely in Webflow, with animated stat counters and pricing tables.",
      umrahtours: "Umrah Tours (umrah-tours.webflow.io) is a travel-agency site for Umrah packages, built in Webflow with on-page SEO across every page.",
      examportal: "The Exam Portal (exam-portal.infinityfreeapp.com) is a full-stack exam portal with student login and a live leaderboard powered by its own PHP API — vibe-coded from idea to a deployed app.",
      contact: "Best way to reach Ahmed is the Contact form on this page, or the WhatsApp button in the bottom-right corner. He usually replies within a day or two.",
      rates: "I don't have exact rates or availability dates — please use the Contact form or WhatsApp button and Ahmed will get back to you directly.",
      fallback: "I'm not sure about that one. I can tell you about Ahmed's skills, his projects, or how to get in touch — or use the Contact form / WhatsApp button for anything specific."
    };

    const INTENTS = [
      { keywords: ['hello', 'hi', 'hey', 'salam', 'assalam'], reply: FACTS.intro },
      { keywords: ['devicesarena', 'device arena', 'phone review', 'smartphone'], reply: FACTS.devicesarena },
      { keywords: ['muse ai', 'museai', 'saas landing'], reply: FACTS.museai },
      { keywords: ['umrah', 'travel agency', 'pilgrimage'], reply: FACTS.umrahtours },
      { keywords: ['exam portal', 'leaderboard', 'exam'], reply: FACTS.examportal },
      { keywords: ['project', 'portfolio', 'work', 'built'], reply: FACTS.projects },
      { keywords: ['skill', 'tech', 'stack', 'react', 'webflow', 'seo', 'vibe cod'], reply: FACTS.skills },
      { keywords: ['rate', 'price', 'cost', 'charge', 'budget'], reply: FACTS.rates },
      { keywords: ['contact', 'reach', 'hire', 'email', 'whatsapp', 'talk'], reply: FACTS.contact },
      { keywords: ['thank'], reply: "You're welcome! Anything else you'd like to know about Ahmed?" }
    ];

    function getReply(message) {
      const text = message.toLowerCase();
      for (let i = 0; i < INTENTS.length; i++) {
        if (INTENTS[i].keywords.some(function (k) { return text.includes(k); })) {
          return INTENTS[i].reply;
        }
      }
      return FACTS.fallback;
    }

    function addMessage(text, sender) {
      const el = document.createElement('div');
      el.className = 'chatbot-msg ' + (sender === 'user' ? 'user' : 'bot');
      el.textContent = text;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      addMessage(value, 'user');
      input.value = '';
      setTimeout(function () { addMessage(getReply(value), 'bot'); }, 300);
    });

    if (toggle && widget) {
      toggle.addEventListener('click', function () {
        widget.classList.toggle('open');
      });
    }
    if (minimize && widget) {
      minimize.addEventListener('click', function () {
        widget.classList.remove('open');
      });
    }
  })();

});
