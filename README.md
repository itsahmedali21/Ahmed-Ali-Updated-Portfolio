# Ahmed Ali — Portfolio

A light/dark-themed portfolio for a Frontend Developer / Webflow Expert /
SEO Specialist / Vibe Coder — with a real contact form and an optional AI
chat widget.

## File structure

```
index.html            → all page content + SEO meta tags + structured data
css/style.css          → theme (incl. dark mode), layout, animations
js/main.js              → cursor, reveals, contact form + chat widget logic
contact.php             → handles the contact form, sends you an email
chatbot.php             → backend for the "Ask about Ahmed" chat widget
config.php              → real Gmail App Password + Anthropic API key (gitignored)
config.example.php      → safe template for config.php
PHPMailer/              → email library contact.php depends on (already included)
assets/ahmed-ali-resume.pdf → starter resume, linked from the "Download CV" buttons
build_resume.py         → regenerates the resume PDF if you edit its content
.gitignore              → keeps config.php out of git
robots.txt / sitemap.xml → SEO basics
```

## ⚠️ Important: this needs a PHP host

`contact.php` and `chatbot.php` only run on a server that executes PHP.
**Netlify, Vercel, and GitHub Pages do not run PHP** — both features would
silently fail there. Use a host like InfinityFree (same as your Exam
Portal), Hostinger, or any shared hosting with PHP support. Upload the
whole folder, `PHPMailer/` included.

## Setting up the contact form

1. `config.php` already has your real Gmail address and App Password (from
   the file you sent). `contact.php` reads them from there.
2. Upload the entire folder to your PHP host, keeping `contact.php`,
   `config.php`, and `PHPMailer/` next to `index.html`.
3. Submitting the form POSTs to `contact.php` and emails you directly.
4. If it stops working ("Could not authenticate"), set `DEBUG_MODE` to
   `true` in `contact.php` temporarily to see Gmail's exact SMTP error,
   then set it back to `false`.

## Setting up the "Ask about Ahmed" chat widget

The chat bubble (bottom-left) answers visitor questions about your skills,
projects, and how to get in touch — powered by the real Claude API.

1. Get a key at **https://console.anthropic.com → API Keys**.
2. Paste it into `ANTHROPIC_API_KEY` in `config.php`.
3. That's it — no key yet, and the widget just replies with a friendly
   "not configured" message instead of breaking.

**Be honest with yourself about scope and cost:**
- This is **not** a general "answers absolutely anything perfectly" bot —
  no AI can promise that, and I haven't tried to fake it. The system
  prompt (top of `chatbot.php`) keeps it scoped to your real skills and
  the 4 real projects, and tells it to say "I don't know, use the contact
  form" for anything about you it isn't told (your real rates, education,
  phone number, etc.) rather than guessing.
- It uses **Claude Haiku** (Anthropic's cheapest current model) to keep
  per-message cost low, and there's a **20-message-per-visitor-session cap**
  built in so one visitor can't rack up a large bill by accident. Keep an
  eye on usage at console.anthropic.com — it's pay-as-you-go, not free.
- Want the bot to know more (real rates, availability, a real testimonial)?
  Edit the `SYSTEM_PROMPT` constant near the top of `chatbot.php`.

## Keeping secrets safe

`config.php` has real credentials in it, so it's listed in `.gitignore`.
If you ever push this project to GitHub:

- `git add .` skips `config.php` automatically.
- Anyone cloning fresh should copy `config.example.php` → `config.php` and
  fill in their own values.
- If a secret ever does leak, just revoke/regenerate it — Gmail App
  Passwords at https://myaccount.google.com/apppasswords, API keys at
  console.anthropic.com.

## The two new floating buttons

- **WhatsApp (bottom-right):** currently points at a placeholder number
  (`923001234567`). Find `wa.me` in `index.html` and swap in your real
  WhatsApp number (international format, digits only, e.g. `92XXXXXXXXXX`).
- **Chat bubble (bottom-left):** see setup above.

## Download CV

`assets/ahmed-ali-resume.pdf` is a real one-page resume already filled in
with everything true I know about you (skills, your 4 real projects). Two
things to personalize:
- [ ] **Education** — currently a placeholder bracket.
- [ ] **Contact details** — same placeholders as the rest of the site.
- To edit the wording and regenerate: edit `build_resume.py`, then run
  `pip install reportlab && python3 build_resume.py`.

## Before you publish — still replace these

- [ ] Your real domain: find & replace **"ahmedali.dev"** in `index.html`,
      `robots.txt`, and `sitemap.xml` once you have one.
- [ ] Social links: GitHub / LinkedIn / Webflow — in **Contact**, the
      **footer**, and the JSON-LD block in `<head>`.
- [ ] The 2 quotes in **Testimonials** — replace with real feedback (or
      remove the section until you have some).
- [ ] Skill percentages — adjust to your actual proficiency.
- [ ] A real Open Graph image at `assets/og-image.png` (1200×630), then
      update the `og:image` / `twitter:image` tags in `<head>`.

## Why the SEO extras are in here

Since SEO is one of your skills, the site practices what it preaches:
semantic HTML5, meta description + canonical + Open Graph/Twitter tags,
JSON-LD `Person` structured data, `robots.txt` + `sitemap.xml`, and no
render-blocking JS beyond Google Fonts.

## Deploying

- **InfinityFree** — free, and you already have an account for the Exam Portal.
- **Hostinger / any shared PHP hosting** — upload via FTP or File Manager.
- Once live, update `ahmedali.dev` references to your real domain, then
  resubmit `sitemap.xml` in Google Search Console.
