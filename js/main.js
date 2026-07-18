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
  // 7. AI CHATBOT — real Claude API, via chatbot.php on the server
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

    // Keep a running history so the AI has context across turns.
    // (chatbot.php also trims this server-side, but we cap it here too.)
    let history = [];

    // Escapes HTML first (so nothing can inject markup), then wraps any
    // URL-looking text in a real, clickable, safe <a> tag.
    function linkify(text) {
      const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const urlRegex = /(https?:\/\/[^\s<]+)|(\b[a-zA-Z0-9-]+\.(?:com|io|dev|net|org|app)(?:\/[^\s<]*)?\b)/g;
      return escaped.replace(urlRegex, function (match) {
        // Peel off trailing punctuation (: . , ; ! ? " ' etc.) that belongs
        // to the sentence, not the URL — e.g. "(https://site.com):" should
        // link only "https://site.com" and leave "):" as plain text after it.
        let url = match;
        let trailing = '';
        while (url.length > 0) {
          const lastChar = url[url.length - 1];
          if (lastChar === ')') {
            // Only strip a trailing ")" if it's unmatched inside this URL
            // (so URLs that legitimately end in a balanced paren still work).
            const opens = (url.match(/\(/g) || []).length;
            const closes = (url.match(/\)/g) || []).length;
            if (closes <= opens) break;
            trailing = lastChar + trailing;
            url = url.slice(0, -1);
          } else if (/[.,:;!?'"\]]/.test(lastChar)) {
            trailing = lastChar + trailing;
            url = url.slice(0, -1);
          } else {
            break;
          }
        }
        const href = /^https?:\/\//i.test(url) ? url : 'https://' + url;
        return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + url + '</a>' + trailing;
      });
    }

    // Scrolls just enough so the new message's TOP lands at the top of the
    // visible chat window, instead of jumping straight to the very bottom.
    // This way a long reply starts where it should, and the user can scroll
    // further down themselves if they want to read the rest.
    function scrollToMessageStart(el) {
      const targetTop = el.offsetTop - messages.offsetTop;
      const maxScroll = messages.scrollHeight - messages.clientHeight;
      messages.scrollTop = Math.min(targetTop, maxScroll);
    }

    function addMessage(text, sender) {
      const el = document.createElement('div');
      el.className = 'chatbot-msg ' + (sender === 'user' ? 'user' : sender === 'error' ? 'bot error' : 'bot');
      if (sender === 'user') {
        el.textContent = text; // user's own text never needs to be clickable
      } else {
        el.innerHTML = linkify(text);
      }
      messages.appendChild(el);
      scrollToMessageStart(el);
      return el;
    }

    function addTyping() {
      const el = document.createElement('div');
      el.className = 'chatbot-msg bot typing';
      el.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(el);
      scrollToMessageStart(el);
      return el;
    }

    const submitBtn = form.querySelector('button[type="submit"]');

    async function sendToAI(userText) {
      history.push({ role: 'user', content: userText });
      history = history.slice(-12); // keep last 12 turns, matches server cap

      // Lock the input while we wait, so a visitor can't fire off several
      // requests before the first reply even arrives (this alone can burn
      // through the free-tier per-minute limit in seconds).
      input.disabled = true;
      if (submitBtn) submitBtn.disabled = true;

      const typingEl = addTyping();
      let data;
      try {
        const res = await fetch('/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history })
        });
        data = await res.json();
      } catch (err) {
        typingEl.remove();
        addMessage("Couldn't reach the chat service right now — please try again in a moment.", 'error');
        input.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
        input.focus();
        return;
      }

      typingEl.remove();

      if (data.error) {
        addMessage(data.error, 'error');
        input.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
        input.focus();
        return;
      }

      addMessage(data.reply, 'bot');
      history.push({ role: 'assistant', content: data.reply });
      input.disabled = false;
      if (submitBtn) submitBtn.disabled = false;
      input.focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const value = input.value.trim();
      if (!value || input.disabled) return;
      addMessage(value, 'user');
      input.value = '';
      sendToAI(value);
    });

    if (toggle && widget) {
      toggle.addEventListener('click', function () {
        widget.classList.toggle('open');
        if (widget.classList.contains('open') && messages.lastElementChild) {
          scrollToMessageStart(messages.lastElementChild);
        }
      });
    }
    if (minimize && widget) {
      minimize.addEventListener('click', function () {
        widget.classList.remove('open');
      });
    }
  })();

});