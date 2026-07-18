/**
 * api/chatbot.js
 * Vercel Serverless Function — backend for the portfolio chat widget.
 * Uses Google's Gemini API (free tier, no credit card needed).
 *
 * ---- ONE-TIME SETUP ----
 * 1. Go to https://aistudio.google.com/apikey
 * 2. Sign in with a Google account, click "Create API key" (no card needed).
 * 3. In the Vercel dashboard: your project -> Settings -> Environment
 *    Variables -> add GEMINI_API_KEY with that key as the value.
 * 4. Redeploy (Vercel only picks up env vars on a new build).
 *
 * ---- WHY THIS EXISTS SERVER-SIDE ----
 * The Gemini API must be called with a secret API key. Calling it directly
 * from the browser would expose that key to anyone who opens dev tools.
 * This function holds the key server-side (as a Vercel env variable) and
 * the browser only ever talks to /api/chatbot, never to Google directly.
 *
 * ---- COST NOTE ----
 * Gemini 2.5 Flash's free tier (as of 2026) allows a generous number of
 * free requests per day with no credit card on file. There's still a
 * simple per-request message-count cap below so one visitor can't send
 * an enormous conversation in one go.
 */

const MODEL = 'gemini-2.5-flash';
const MAX_HISTORY_MESSAGES = 12; // how many recent turns we send to Gemini for context

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

module.exports = async (req, res) => {
  // 1. Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Invalid request method.' });
    return;
  }

  // 2. Friendly message if the key hasn't been set up yet
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(200).json({
      error: "The chat assistant isn't configured yet — add GEMINI_API_KEY in your Vercel project's Environment Variables to turn it on."
    });
    return;
  }

  // 3. Read + validate input
  const body = req.body || {};
  const rawHistory = Array.isArray(body.messages) ? body.messages : [];

  if (rawHistory.length === 0) {
    res.status(200).json({ error: 'No message received.' });
    return;
  }

  // Keep only the last N turns, and only well-formed {role, content} pairs
  // with a sane length cap per message (defends against giant paste-bombs).
  const trimmed = rawHistory.slice(-MAX_HISTORY_MESSAGES);
  const cleanHistory = [];
  for (const m of trimmed) {
    if (!m || !m.role || typeof m.content !== 'string') continue;
    if (m.role !== 'user' && m.role !== 'assistant') continue;
    cleanHistory.push({ role: m.role, content: m.content.slice(0, 2000) });
  }

  if (cleanHistory.length === 0) {
    res.status(200).json({ error: 'No valid message received.' });
    return;
  }

  // Gemini uses "user" / "model" roles (not "assistant"), and a
  // `contents` array instead of Anthropic-style `messages`.
  const contents = cleanHistory.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // 4. Call the Gemini API server-side
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { maxOutputTokens: 300 },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const apiMsg = data?.error?.message || 'Unknown error from the AI service.';
      res.status(200).json({ error: apiMsg });
      return;
    }

    const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';

    if (!reply) {
      res.status(200).json({ error: 'The AI service returned an empty response.' });
      return;
    }

    res.status(200).json({ reply });
  } catch (err) {
    res.status(200).json({ error: 'Could not reach the AI service: ' + err.message });
  }
};
