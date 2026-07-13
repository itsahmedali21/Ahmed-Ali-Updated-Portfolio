/**
 * chatbot-local.js
 * A fully self-contained, rule-based chatbot for Ahmed's portfolio.
 * No API key, no backend, no network call — everything runs in the browser.
 *
 * HOW IT WORKS
 * Every visitor message is lower-cased and checked against a list of
 * "intents" (topic + keywords + reply). The first intent whose keywords
 * match wins. If nothing matches, a fallback reply is shown.
 *
 * HOW TO USE
 * 1. Save this file as js/chatbot-local.js in your project.
 * 2. In index.html, add this line right before </body> (after main.js,
 *    or instead of any old fetch-based chatbot code in main.js):
 *      <script src="js/chatbot-local.js"></script>
 * 3. If your existing js/main.js already has code that submits the
 *    #chatbot-form to chatbot.php, delete/comment that part out — this
 *    file replaces it entirely (it attaches its own submit listener).
 */

(function () {
  // ---------------------------------------------------------------
  // 1. FACTS ABOUT AHMED — edit this section to update what the bot knows
  // ---------------------------------------------------------------
  const FACTS = {
    intro:
      "I'm Ahmed's portfolio assistant. Ask me about his skills, his projects, or how to reach him!",
    skills:
      "Ahmed works across four areas: Frontend (HTML5, CSS3, JavaScript, React), " +
      "Webflow (CMS, Custom Interactions, Client Handoff), SEO (Technical SEO, " +
      "On-Page SEO, Core Web Vitals, Keyword Research), and Vibe Coding " +
      "(AI-assisted development with Claude, Cursor, rapid prototyping).",
    projects:
      "Ahmed has 4 real projects: DevicesArena (full-stack phone review platform), " +
      "Muse AI (a Webflow SaaS landing page), Umrah Tours (a Webflow travel agency " +
      "site with SEO work), and an Exam Portal (full-stack, vibe-coded, with a live " +
      "leaderboard). Ask me about any one by name for more detail!",
    devicesarena:
      "DevicesArena (devicesarena.com) is a full-stack smartphone review and " +
      "comparison platform Ahmed hand-coded end to end — device database, spec " +
      "compare tool, custom auth, and a live news section.",
    museai:
      "Muse AI (muse-ai-ahmed.webflow.io) is an AI SaaS landing page built entirely " +
      "in Webflow, with animated stat counters and pricing tables.",
    umrahtours:
      "Umrah Tours (umrah-tours.webflow.io) is a travel-agency site for Umrah " +
      "packages, built in Webflow with on-page SEO across every page.",
    examportal:
      "The Exam Portal (exam-portal.infinityfreeapp.com) is a full-stack exam " +
      "portal with student login and a live leaderboard powered by its own PHP " +
      "API — vibe-coded from idea to a deployed app.",
    contact:
      "Best way to reach Ahmed is the Contact form on this page, or the WhatsApp " +
      "button in the bottom-right corner. He usually replies within a day or two.",
    rates:
      "I don't have exact rates or availability dates — please use the Contact " +
      "form or WhatsApp button and Ahmed will get back to you directly.",
    fallback:
      "I'm not sure about that one. I can tell you about Ahmed's skills, his " +
      "projects, or how to get in touch — or use the Contact form / WhatsApp " +
      "button for anything specific.",
  };

  // ---------------------------------------------------------------
  // 2. INTENTS — order matters, first match wins. Add more freely.
  // ---------------------------------------------------------------
  const INTENTS = [
    { keywords: ["hello", "hi", "hey", "salam", "assalam"], reply: FACTS.intro },
    { keywords: ["devicesarena", "device arena", "phone review", "smartphone"], reply: FACTS.devicesarena },
    { keywords: ["muse ai", "museai", "saas landing"], reply: FACTS.museai },
    { keywords: ["umrah", "travel agency", "pilgrimage"], reply: FACTS.umrahtours },
    { keywords: ["exam portal", "leaderboard", "exam"], reply: FACTS.examportal },
    { keywords: ["project", "portfolio", "work", "built"], reply: FACTS.projects },
    { keywords: ["skill", "tech", "stack", "react", "webflow", "seo", "vibe cod"], reply: FACTS.skills },
    { keywords: ["rate", "price", "cost", "charge", "budget"], reply: FACTS.rates },
    { keywords: ["contact", "reach", "hire", "email", "whatsapp", "talk"], reply: FACTS.contact },
    { keywords: ["thank"], reply: "You're welcome! Anything else you'd like to know about Ahmed?" },
  ];

  function getReply(message) {
    const text = message.toLowerCase();
    for (const intent of INTENTS) {
      if (intent.keywords.some((k) => text.includes(k))) {
        return intent.reply;
      }
    }
    return FACTS.fallback;
  }

  // ---------------------------------------------------------------
  // 3. WIRE UP TO THE EXISTING WIDGET MARKUP (from index.html)
  // ---------------------------------------------------------------
  function init() {
    const form = document.getElementById("chatbot-form");
    const input = document.getElementById("chatbot-input");
    const messages = document.getElementById("chatbot-messages");
    const toggle = document.getElementById("chatbot-toggle");
    const panel = document.getElementById("chatbot-panel");
    const minimize = document.getElementById("chatbot-minimize");

    if (!form || !input || !messages) return; // widget not on this page

    function addMessage(text, sender) {
      const el = document.createElement("div");
      el.className = "chatbot-msg " + (sender === "user" ? "user" : "bot");
      el.textContent = text;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const value = input.value.trim();
      if (!value) return;

      addMessage(value, "user");
      input.value = "";

      // tiny delay so it feels like a real reply, not an instant echo
      setTimeout(function () {
        addMessage(getReply(value), "bot");
      }, 300);
    });

    // Open/close behavior (only wired if toggle/panel exist and aren't
    // already handled elsewhere — safe to remove this block if main.js
    // already does this)
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }
    if (minimize && panel) {
      minimize.addEventListener("click", function () {
        panel.classList.remove("open");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();