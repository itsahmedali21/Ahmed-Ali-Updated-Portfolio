/**
 * api/contact.js
 * Vercel serverless function — Node.js equivalent of contact.php.
 * Vercel does not execute PHP, so this replaces contact.php + PHPMailer +
 * config.php for the live site. contact.php itself is left untouched in
 * case you ever host this on a PHP server elsewhere.
 *
 * ---- ONE-TIME SETUP ----
 * In your Vercel project: Settings → Environment Variables, add:
 *   SMTP_USERNAME = itsahmedali21@gmail.com   (the Gmail from config.php)
 *   SMTP_PASSWORD = the 16-character Gmail App Password from config.php
 *   TO_EMAIL      = itsahmedali21@gmail.com   (where messages should land)
 * Redeploy after adding them (Vercel only picks up env vars on a new build).
 *
 * Do NOT put these in a committed file — env vars keep them out of git,
 * same reason config.php was gitignored.
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
