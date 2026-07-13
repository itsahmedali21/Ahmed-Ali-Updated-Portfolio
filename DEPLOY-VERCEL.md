# Deploying to Vercel

This project is now split into two parts:

- **Static site** (`index.html`, `css/`, `js/`, `robots.txt`, `sitemap.xml`) —
  Vercel serves these directly, no configuration needed.
- **Contact form backend** (`api/contact.js`) — a Node.js serverless
  function that replaces `contact.php` (Vercel doesn't run PHP).

## 1. Push this folder to GitHub

Vercel deploys from a Git repository.

```bash
git init
git add .
git commit -m "Initial portfolio"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

## 2. Import the project into Vercel

1. Go to https://vercel.com/new
2. Import the GitHub repo you just pushed
3. Framework Preset: **Other** (it's a plain static site + one serverless
   function — Vercel will detect `api/contact.js` automatically)
4. Don't deploy yet — first add the environment variables below.

## 3. Add environment variables (before deploying)

In the Vercel project → **Settings → Environment Variables**, add these
three (apply to Production, Preview, and Development):

| Name           | Value                                              |
|----------------|-----------------------------------------------------|
| `SMTP_USERNAME`| Your Gmail address (e.g. `itsahmedali21@gmail.com`) |
| `SMTP_PASSWORD`| Your 16-character Gmail **App Password**            |
| `TO_EMAIL`     | The email address you want messages delivered to    |

This is the same Gmail App Password you already generated for the PHP
version — no need to make a new one.

**Never commit these values into your code or GitHub repo.** Environment
variables are how you keep them private on Vercel.

## 4. Deploy

Click **Deploy**. Vercel will:
- Serve `index.html` and friends as your static site
- Turn `api/contact.js` into a live endpoint at `https://your-site.vercel.app/api/contact`

## 5. Test the contact form

Open your live Vercel URL, go to the Contact section, and send yourself a
test message. Check your inbox (and spam folder) for it.

## Updating environment variables later

If you ever change your Gmail password or App Password, update the
variable in **Settings → Environment Variables**, then trigger a new
deployment (Vercel doesn't apply env var changes to already-built
deployments — redeploy from the Deployments tab, or push a new commit).

## 6. Enable Visitor Journey Analytics (optional, needs a Redis store)

The portfolio tracks anonymous, cookie-free analytics (page views,
most-viewed projects/sections, most-clicked skills, average session
duration, average scroll depth) via `js/analytics.js` →
`api/analytics.js` → a small Redis store. The site works completely
fine without this — the panel in Developer Mode will just say the
store isn't connected yet.

Note: Vercel's own "KV" product was discontinued — Storage → Create
Database no longer lists it directly. Its replacements are **Upstash**
and **Redis** (Redis Cloud's official integration), both under
"Marketplace Database Providers" in that same dialog. **The code
supports either one automatically** — it detects which env vars are
present and uses the matching client, so it doesn't matter which you
picked.

To turn it on:

1. Vercel project → **Storage** tab → **Create Database** → choose
   **Upstash** or **Redis** (either works, no code changes needed
   either way).
2. **Connect it to this project** — the integration automatically
   injects the right environment variables:
   - Upstash → `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or
     `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`)
   - Redis (Redis Cloud) → a connection string env var named after
     your database, e.g. `REDIS_URL` or `<yourdb>_REDIS_URL`
   Nothing to copy/paste manually either way.
3. Run `npm install` locally (pulls in both `@upstash/redis` and
   `redis`, already listed in `package.json`) and commit the updated
   `package-lock.json`.
4. Redeploy — Vercel only picks up new env vars on a fresh deployment.
5. On the live site, visit the site a couple of times to generate some
   data, then toggle **Developer Mode** near the Projects section —
   the "Analytics" panel will populate with real numbers.

No personal data, IPs, or cookies are stored — only aggregate counters.

## Local testing (optional)

To test the serverless function locally before deploying:

```bash
npm install -g vercel
npm install
vercel dev
```

This runs both the static site and `/api/contact` locally, using a `.env`
file for the same three variables (create `.env` in the project root,
gitignored, with `SMTP_USERNAME=...`, `SMTP_PASSWORD=...`, `TO_EMAIL=...`).
