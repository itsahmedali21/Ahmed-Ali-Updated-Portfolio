/* =========================================================
   AI Portfolio Guide
   A rule-based conversational widget. No external API/key
   required — intent is matched against keywords and quick
   reply buttons, then answered from js/data.js. Structured
   so a real LLM call could later replace `answerFor()` with
   a fetch to a serverless endpoint without touching the UI.
   ========================================================= */
(function(){
  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  const intents = [
    { id: 'projects', label: '🚀 See projects', keywords: ['project', 'work', 'portfolio', 'built', 'built', 'apps'] },
    { id: 'skills', label: '🧠 Explore skills', keywords: ['skill', 'stack', 'tech', 'know', 'expertise', 'good at'] },
    { id: 'experience', label: '💼 Experience', keywords: ['experience', 'years', 'background', 'about', 'who'] },
    { id: 'hire', label: '🤝 Hire / Contact', keywords: ['hire', 'contact', 'email', 'available', 'freelance', 'quote', 'price'] },
    { id: 'resume', label: '📄 Get a resume', keywords: ['resume', 'cv'] }
  ];

  function matchIntent(text){
    const t = text.toLowerCase();
    for (const intent of intents) {
      if (intent.keywords.some(k => t.includes(k))) return intent.id;
    }
    return null;
  }

  function answerFor(intentId){
    switch (intentId) {
      case 'projects': {
        const names = DATA.projects.map(p => p.name).join(', ');
        return {
          text: `Ahmed has shipped ${DATA.projects.length} projects across pure code, Webflow, and vibe-coded builds — including ${names}. Want me to jump you to the Projects section?`,
          target: '#projects'
        };
      }
      case 'skills': {
        const cats = [...new Set(DATA.skills.map(s => s.category))].join(', ');
        return {
          text: `The skill set spans ${cats}. There's an interactive Skill Map below — click any skill to see the exact projects and experience behind it.`,
          target: '#skills'
        };
      }
      case 'experience': {
        return {
          text: `Ahmed Ali is a frontend developer based in ${DATA.profile.location} with ${DATA.profile.experienceYears} years across dev, Webflow, SEO, and AI-assisted builds — ${DATA.profile.projectsShipped} projects shipped so far.`,
          target: '#about'
        };
      }
      case 'hire': {
        return {
          text: `Ahmed is available for freelance work. The fastest way to reach him is the contact form below, or WhatsApp via the floating button in the corner.`,
          target: '#contact'
        };
      }
      case 'resume': {
        return {
          text: `There's an AI Resume Generator further down the page — pick a target role (Frontend, Full-Stack, UI/UX, AI Engineer, or SEO) and it'll build a tailored resume from this portfolio's real data.`,
          target: '#resume-generator'
        };
      }
      default:
        return {
          text: `I can point you to projects, skills, experience, or how to get in touch — which one?`,
          target: null
        };
    }
  }

  function buildWidget(){
    const root = document.createElement('div');
    root.id = 'ai-guide';
    root.innerHTML = `
      <button id="ai-guide-toggle" aria-expanded="false" aria-controls="ai-guide-panel" aria-label="Open AI portfolio guide">
        <span class="ai-guide-toggle-icon">✦</span>
        <span class="ai-guide-toggle-label">Ask the guide</span>
      </button>
      <div id="ai-guide-panel" class="glass-panel" role="dialog" aria-label="AI portfolio guide" hidden>
        <div class="ai-guide-head">
          <div>
            <div class="ai-guide-title">Portfolio Guide</div>
            <div class="ai-guide-sub">Rule-based, on-page — no data leaves your browser</div>
          </div>
          <button id="ai-guide-close" aria-label="Close guide">×</button>
        </div>
        <div id="ai-guide-log" class="ai-guide-log" aria-live="polite"></div>
        <div id="ai-guide-quick" class="ai-guide-quick"></div>
        <form id="ai-guide-form" class="ai-guide-form">
          <input id="ai-guide-input" type="text" placeholder="Ask about projects, skills, experience..." aria-label="Message the guide">
          <button type="submit" aria-label="Send">→</button>
        </form>
      </div>`;
    document.body.appendChild(root);
    return root;
  }

  function addMessage(log, text, who){
    const bubble = document.createElement('div');
    bubble.className = 'ai-guide-msg ' + (who === 'user' ? 'from-user' : 'from-guide');
    bubble.textContent = text;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  }

  function renderQuickReplies(container, log, onDone){
    container.innerHTML = '';
    intents.forEach(intent => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ai-guide-chip';
      btn.textContent = intent.label;
      btn.addEventListener('click', () => {
        addMessage(log, intent.label.replace(/^\S+\s/, ''), 'user');
        respond(intent.id, log);
        if (window.trackEvent) window.trackEvent('ai_guide_intent', { intent: intent.id });
      });
      container.appendChild(btn);
    });
  }

  function respond(intentId, log){
    const { text, target } = answerFor(intentId);
    setTimeout(() => {
      addMessage(log, text, 'guide');
      if (target) {
        const jumpBtn = document.createElement('button');
        jumpBtn.type = 'button';
        jumpBtn.className = 'ai-guide-jump';
        jumpBtn.textContent = 'Take me there →';
        jumpBtn.addEventListener('click', () => {
          document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
          document.getElementById('ai-guide-panel').hidden = true;
          document.getElementById('ai-guide-toggle').setAttribute('aria-expanded', 'false');
        });
        log.appendChild(jumpBtn);
        log.scrollTop = log.scrollHeight;
      }
    }, 350);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const root = buildWidget();
    const toggle = root.querySelector('#ai-guide-toggle');
    const panel = root.querySelector('#ai-guide-panel');
    const closeBtn = root.querySelector('#ai-guide-close');
    const log = root.querySelector('#ai-guide-log');
    const quick = root.querySelector('#ai-guide-quick');
    const form = root.querySelector('#ai-guide-form');
    const input = root.querySelector('#ai-guide-input');
    let greeted = false;

    function open(){
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      if (!greeted) {
        greeted = true;
        addMessage(log, `Hi, I'm Ahmed's portfolio guide 👋 What are you looking for today?`, 'guide');
        renderQuickReplies(quick, log);
      }
      input.focus();
      if (window.trackEvent) window.trackEvent('ai_guide_opened', {});
    }
    function close(){
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => panel.hidden ? open() : close());
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      addMessage(log, val, 'user');
      const intentId = matchIntent(val);
      respond(intentId, log);
      if (window.trackEvent) window.trackEvent('ai_guide_message', { matched: intentId || 'none' });
      input.value = '';
    });
  });
})();
