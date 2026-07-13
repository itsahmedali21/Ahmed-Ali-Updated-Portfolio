/**
 * api/contact.js
 * Vercel serverless function — receives the portfolio contact form and
 * emails it to you using Nodemailer + Gmail SMTP.
 *
 * This is the Vercel-compatible replacement for contact.php (Vercel does
 * not run PHP). Same idea, same Gmail App Password approach, just Node.js.
 *
 * ---- ONE-TIME SETUP ----
 * 1. In your Vercel project: Settings → Environment Variables, add:
 *      SMTP_USERNAME = your Gmail address
 *      SMTP_PASSWORD = your 16-character Gmail App Password (no quotes)
 *      TO_EMAIL       = the address you want messages delivered to
 *    (You already generated an App Password earlier for contact.php —
 *    the same one works here.)
 * 2. Redeploy after adding the env vars (Vercel only picks them up on a
 *    new deployment).
 *
 * Do NOT hardcode the password here — env vars keep it out of your git repo.
 */

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Invalid request method.' });
    return;
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    res.status(200).json({ success: false, error: 'Please fill in every field correctly.' });
    return;
  }

  // Very basic email sanity check (mirrors the PHP version's validation)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    res.status(200).json({ success: false, error: 'Please enter a valid email address.' });
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS on port 587
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${process.env.SMTP_USERNAME}>`,
      to: process.env.TO_EMAIL,
      replyTo: `"${name}" <${email}>`,
      subject: `New portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(200).json({
      success: false,
      error: 'Message could not be sent. Mailer error: ' + err.message,
    });
  }
};
