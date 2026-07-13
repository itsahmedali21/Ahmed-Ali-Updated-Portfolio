/**
 * api/chatbot.js
 * Vercel serverless function — Node.js equivalent of chatbot.php.
 * Vercel does not execute PHP, so this replaces chatbot.php for the live
 * site. chatbot.php itself is left untouched in case you ever host this on
 * a PHP server elsewhere.
 *
 * ---- ONE-TIME SETUP ----
 * In your Vercel project: Settings → Environment Variables, add:
 *   ANTHROPIC_API_KEY = your real key from https://console.anthropic.com
 * Redeploy after adding it. Until it's set, this returns the same friendly
 * "not configured yet" message the PHP version showed.
 *
 * ---- RATE LIMITING ----
 * chatbot.php used a PHP session to cap messages per visitor. Serverless
 * functions have no server-side session, so this uses a lightweight cookie
 * counter instead — same goal (stop one visitor running up a big bill),
 * same limit (20 messages), no database needed.
 */

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 300;
const MAX_MESSAGES_PER_SESSION = 20;
const MAX_HISTORY_MESSAGES = 12;

const SYSTEM_PROMPT = `You are the assistant on Ahmed Ali's portfolio website. You help visitors
learn about Ahmed and figure out if he's a good fit for their project.

Real facts about Ahmed — use only these, never invent anything beyond them:
- Frontend Developer, Webflow Expert, SEO Specialist, and Vibe Coder
  (AI-assisted development), based in Pakistan, available for freelance work.
- Skills: Frontend (HTML5, CSS3, JavaScript, React); Webflow (Webflow CMS,
  Custom Interactions, Client Handoff); SEO (Technical SEO, On-Page SEO,
  Core Web Vitals, Keyword Research); Vibe Coding (Claude, Cursor, Rapid
  Prototyping).
- Real projects:
  1. DevicesArena (devicesarena.com) — full-stack smartphone review and
     comparison platform: device database, spec compare tool, custom auth,
     live news section. Hand-coded end to end.
  2. Muse AI (muse-ai-ahmed.webflow.io) — AI SaaS landing page built
     entirely in Webflow, with animated stats and pricing tables.
  3. Umrah Tours (umrah-tours.webflow.io) — travel-agency site for Umrah
     packages; Webflow build plus on-page SEO across every page.
  4. Exam Portal (exam-portal.infinityfreeapp.com) — full-stack exam portal
     with student login and a live leaderboard via its own PHP API,
     vibe-coded with AI-assisted tools.
- To get in touch for real: the Contact form or WhatsApp button on this
  site.

Rules:
- Only state facts about Ahmed from the list above. If asked something you
  don't know (exact rates, availability dates, education, phone number,
  etc.), say you don't have that detail and point to the Contact form or
  WhatsApp button instead of guessing.
- Keep answers short: 2-4 sentences unless the visitor clearly wants more.
- You can answer general, publicly-known questions about frontend dev,
  Webflow, SEO, or AI-assisted coding as concepts — just don't attribute
  invented specifics to Ahmed personally.
- Stay focused on Ahmed's work and how to reach him. For unrelated
  questions, a brief answer is fine, then steer back.
- Never invent client names, testimonials, prices, or availability.`;

function getChatCount(req){
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/(?:^|;\s*)chat_count=(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Invalid request method.' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-REPLACE-ME') {
    res.status(200).json({
      error: "The chat assistant isn't configured yet — add a real ANTHROPIC_API_KEY in Vercel's environment variables to turn it on."
    });
    return;
  }

  const chatCount = getChatCount(req);
  if (chatCount >= MAX_MESSAGES_PER_SESSION) {
    res.status(200).json({
      error: "That's a lot of questions! Please use the Contact form or WhatsApp button for anything further."
    });
    return;
  }

  const { messages } = req.body || {};
  const history = Array.isArray(messages) ? messages : [];
  if (!history.length) {
    res.status(200).json({ error: 'No message received.' });
    return;
  }

  const cleanHistory = history
    .slice(-MAX_HISTORY_MESSAGES)
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  if (!cleanHistory.length) {
    res.status(200).json({ error: 'No valid message received.' });
    return;
  }

  // Cookie-based counter: extends for 1 day, mirrors chatbot.php's per-session cap.
  res.setHeader('Set-Cookie', `chat_count=${chatCount + 1}; Path=/; Max-Age=86400; SameSite=Lax`);

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: cleanHistory,
      }),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      res.status(200).json({ error: data?.error?.message || 'Unknown error from the AI service.' });
      return;
    }

    const reply = (data.content || [])
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    if (!reply) {
      res.status(200).json({ error: 'The AI service returned an empty response.' });
      return;
    }

    res.status(200).json({ reply });
  } catch (err) {
    res.status(200).json({ error: 'Could not reach the AI service: ' + err.message });
  }
};
