<?php
/**
 * contact.php
 * Receives the portfolio contact form (AJAX POST from script.js)
 * and emails it to you using PHPMailer + Gmail SMTP.
 *
 * WHY PHPMailer INSTEAD OF mail():
 * PHP's built-in mail() needs a local mail server (sendmail/Postfix) which
 * XAMPP/WAMP/Laragon do NOT set up by default — that's why you got
 * "Message could not be sent." PHPMailer connects directly to Gmail's SMTP
 * server instead, so it works on localhost AND on live hosting.
 *
 * ---- ONE-TIME SETUP (5 minutes) ----
 * 1. Use a Gmail account (create a free throwaway one if you don't want to
 *    use your main account for this).
 * 2. Turn on 2-Step Verification on that Google account:
 *    https://myaccount.google.com/security
 * 3. Create an "App Password":
 *    https://myaccount.google.com/apppasswords
 *    -> App: Mail, Device: Other ("Portfolio Site") -> Generate
 *    Google gives you a 16-character password like: abcd efgh ijkl mnop
 * 4. Your real values already live in config.php, sitting next to this file.
 *    Moving here from elsewhere? Copy config.example.php -> config.php and
 *    fill in your own Gmail + App Password there instead of editing this file.
 * 5. Done — no other code changes needed.
 */

require __DIR__ . '/PHPMailer/src/Exception.php';
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');

// ---- CONFIGURE THIS ----
// Real values now live in config.php (gitignored) so the App Password never
// ends up in a public repo. First run? Copy config.example.php -> config.php.
require __DIR__ . '/config.php';

// Set to true temporarily while troubleshooting "Could not authenticate" —
// it prints Gmail's exact SMTP conversation into the error response so you
// can see precisely what it's rejecting. Set back to false once it works.
const DEBUG_MODE = false;

// 1. Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

// 2. Collect + sanitize input
$name    = trim(filter_input(INPUT_POST, 'name', FILTER_UNSAFE_RAW) ?? '');
$email   = trim(filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL) ?? '');
$message = trim(filter_input(INPUT_POST, 'message', FILTER_UNSAFE_RAW) ?? '');

$name    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// 3. Validate
if ($name === '' || $email === '' || $message === '') {
    echo json_encode(['success' => false, 'error' => 'Please fill in every field correctly.']);
    exit;
}

// 4. Send via PHPMailer + Gmail SMTP
$mail = new PHPMailer(true);

$debugLog = '';

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USERNAME;
    $mail->Password   = SMTP_PASSWORD;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    if (DEBUG_MODE) {
        $mail->SMTPDebug = 2; // print client <-> server SMTP conversation
        $mail->Debugoutput = function ($str) use (&$debugLog) {
            $debugLog .= $str . "\n";
        };
    }

    // Sender / recipient
    $mail->setFrom(SMTP_USERNAME, 'Portfolio Contact Form');
    $mail->addAddress(TO_EMAIL, TO_NAME);
    $mail->addReplyTo($email, $name); // hitting "Reply" replies to the visitor

    // Content
    $mail->isHTML(false);
    $mail->Subject = "New portfolio message from {$name}";
    $mail->Body    = "Name: {$name}\nEmail: {$email}\n\nMessage:\n{$message}";

    $mail->send();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $errorMsg = 'Message could not be sent. Mailer error: ' . $mail->ErrorInfo;
    if (DEBUG_MODE) {
        $errorMsg .= "\n\n--- SMTP DEBUG LOG ---\n" . $debugLog;
    }
    echo json_encode([
        'success' => false,
        'error'   => $errorMsg
    ]);
}
