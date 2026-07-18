<?php
/**
 * chatbot.php
 * Backend for the portfolio chat widget. Receives the visitor's message +
 * short conversation history, calls the Google Gemini API server-side (so
 * your API key never reaches the browser), and returns the reply as JSON.
 *
 * ---- ONE-TIME SETUP ----
 * 1. Get a free API key at https://aistudio.google.com/apikey (no credit
 *    card needed).
 * 2. Paste it into GEMINI_API_KEY in config.php.
 * 3. That's it. The widget checks for the placeholder key and shows a
 *    friendly "not configured yet" message until you add a real one.
 *
 * ---- WHY THIS EXISTS SERVER-SIDE ----
 * The Gemini API must be called with a secret API key. Calling it directly
 * from the browser would expose that key to anyone who opens dev tools.
 * This file holds the key server-side and the browser only ever talks to
 * chatbot.php, never to Google directly.
 *
 * ---- COST NOTE ----
 * Gemini's free tier (2.5 Flash) allows a generous number of free
 * requests per day with no credit card on file. There's still a simple
 * per-visitor session cap below (MAX_MESSAGES_PER_SESSION) so one visitor
 * can't send an unreasonable number of messages in one sitting.
 */

header('Content-Type: application/json');
require __DIR__ . '/config.php';

const MODEL = 'gemini-flash-latest';
const MAX_MESSAGES_PER_SESSION = 20;
const MAX_HISTORY_MESSAGES = 12; // how many recent turns we send back to Gemini for context

const SYSTEM_PROMPT = <<<PROMPT
You are the assistant on Ahmed Ali's portfolio website. You help visitors
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
  site. For freelance/gig work specifically, Ahmed is also available on
  Fiverr: https://www.fiverr.com/itsahmedali21

Rules:
- Only state facts about Ahmed from the list above. If asked something you
  don't know (exact rates, availability dates, education, phone number,
  etc.), say you don't have that detail and point to the Contact form or
  WhatsApp button instead of guessing.
- If asked whether Ahmed is available for freelance/gig work, mention the
  Fiverr link above (as a full URL, not shortened) in addition to the
  Contact form / WhatsApp.
- When mentioning any project or profile link, always write it as the
  full URL exactly as given above (e.g. https://devicesarena.com), never
  as vague text like "his website" with no link.
- Keep answers short: 2-4 sentences unless the visitor clearly wants more.
- You can answer general, publicly-known questions about frontend dev,
  Webflow, SEO, or AI-assisted coding as concepts — just don't attribute
  invented specifics to Ahmed personally.
- Stay focused on Ahmed's work and how to reach him. For unrelated
  questions, a brief answer is fine, then steer back.
- Never invent client names, testimonials, prices, or availability.
PROMPT;

// 1. Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Invalid request method.']);
    exit;
}

// 2. Friendly message if the key hasn't been set up yet
if (!defined('GEMINI_API_KEY') || GEMINI_API_KEY === '' || GEMINI_API_KEY === 'PASTE_YOUR_NEW_API_KEY_HERE') {
    echo json_encode([
        'error' => "The chat assistant isn't configured yet — add a real GEMINI_API_KEY in config.php to turn it on."
    ]);
    exit;
}

// 3. Very small per-visitor rate limit, so one visitor can't run up a big bill
session_start();
if (!isset($_SESSION['chat_count'])) {
    $_SESSION['chat_count'] = 0;
}
if ($_SESSION['chat_count'] >= MAX_MESSAGES_PER_SESSION) {
    echo json_encode([
        'error' => "That's a lot of questions! Please use the Contact form or WhatsApp button for anything further."
    ]);
    exit;
}

// 4. Read + validate input
$input = json_decode(file_get_contents('php://input'), true);
$history = is_array($input['messages'] ?? null) ? $input['messages'] : [];

if (empty($history)) {
    echo json_encode(['error' => 'No message received.']);
    exit;
}

// Keep only the last N turns, and only well-formed {role, content} pairs
// with a sane length cap per message (defends against giant paste-bombs).
$history = array_slice($history, -MAX_HISTORY_MESSAGES);
$cleanHistory = [];
foreach ($history as $m) {
    if (!isset($m['role'], $m['content'])) continue;
    if (!in_array($m['role'], ['user', 'assistant'], true)) continue;
    $content = mb_substr((string) $m['content'], 0, 2000);
    $cleanHistory[] = ['role' => $m['role'], 'content' => $content];
}
if (empty($cleanHistory)) {
    echo json_encode(['error' => 'No valid message received.']);
    exit;
}

$_SESSION['chat_count']++;

// Gemini uses "user" / "model" roles (not "assistant"), and a `contents`
// array of {role, parts:[{text}]} instead of Anthropic-style messages.
$contents = array_map(function ($m) {
    return [
        'role' => $m['role'] === 'assistant' ? 'model' : 'user',
        'parts' => [['text' => $m['content']]],
    ];
}, $cleanHistory);

// 5. Call the Gemini API server-side
$payload = json_encode([
    'contents' => $contents,
    'systemInstruction' => ['parts' => [['text' => SYSTEM_PROMPT]]],
    'generationConfig' => [
        'maxOutputTokens' => 512,
        'thinkingConfig' => ['thinkingBudget' => 0],
    ],
]);

$url = 'https://generativelanguage.googleapis.com/v1beta/models/' . MODEL . ':generateContent?key=' . GEMINI_API_KEY;

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false) {
    echo json_encode(['error' => 'Could not reach the AI service: ' . $curlError]);
    exit;
}

$data = json_decode($response, true);

if ($httpCode !== 200) {
    if ($httpCode === 429) {
        echo json_encode([
            'error' => "The chat assistant is a bit busy right now (too many messages at once). Please wait a moment and try again."
        ]);
        exit;
    }
    // Log the real error server-side for debugging, but never show Google's
    // raw internal error text to visitors.
    error_log('Gemini API error (' . $httpCode . '): ' . ($data['error']['message'] ?? $response));
    echo json_encode([
        'error' => "The chat assistant hit a temporary problem. Please try again in a moment, or use the Contact form / WhatsApp button."
    ]);
    exit;
}

$reply = '';
foreach (($data['candidates'][0]['content']['parts'] ?? []) as $part) {
    $reply .= $part['text'] ?? '';
}

if ($reply === '') {
    echo json_encode(['error' => 'The AI service returned an empty response.']);
    exit;
}

echo json_encode(['reply' => $reply]);