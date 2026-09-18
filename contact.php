<?php
/**
 * Contact form handler for Shiddivinayak Electricals.
 * Production-ready email sending for deployment.
 *
 * IMPORTANT:
 * 1. Install PHPMailer on the live server with Composer:
 *    composer require phpmailer/phpmailer
 * 2. Update the SMTP settings below with your host's email credentials.
 * 3. Use a valid domain email address in FROM and REPLY-TO fields.
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$site_name = "Shiddivinayak Electricals";
$to_email = "shiddivinayak.electronics@gmail.com";

// Gmail SMTP settings for your email address.
// IMPORTANT: use a Google App Password, not your normal Gmail password.
$smtp_config = [
    'host' => 'smtp.gmail.com',
    'username' => 'shiddivinayak.electronics@gmail.com',
    'password' => 'YOUR_GMAIL_APP_PASSWORD',
    'secure' => 'tls',
    'port' => 587,
    'from_email' => 'shiddivinayak.electronics@gmail.com',
    'from_name' => 'Shiddivinayak Electricals',
];

// Only accept POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: contact.html");
    exit;
}

// Simple honeypot spam trap (hidden field named "website" in the form)
if (!empty($_POST['website'])) {
    header("Location: thank-you.html");
    exit;
}

function clean($value) {
    return htmlspecialchars(trim($value ?? ''), ENT_QUOTES, 'UTF-8');
}

$name    = clean($_POST['name'] ?? '');
$phone   = clean($_POST['phone'] ?? '');
$subject = clean($_POST['subject'] ?? 'General Enquiry');
$message = clean($_POST['message'] ?? '');

$errors = [];
if ($name === '')    $errors[] = "Name is required.";
if ($phone === '')   $errors[] = "Phone number is required.";
if ($message === '') $errors[] = "Message is required.";

if (!empty($errors)) {
    header("Location: contact.html?error=" . urlencode(implode(' ', $errors)));
    exit;
}

$email_subject = "New Enquiry: $subject — from $name";
$email_body = "You have a new enquiry from the Shiddivinayak Electricals website.\n\n"
    . "Name: $name\n"
    . "Phone: $phone\n"
    . "Enquiry Type: $subject\n\n"
    . "Message:\n$message\n\n"
    . "-----\nSent automatically from the contact form on your website.";

$sent = false;

if (!class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
    require __DIR__ . '/vendor/autoload.php';
}

if (class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = $smtp_config['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $smtp_config['username'];
        $mail->Password = $smtp_config['password'];
        $mail->SMTPSecure = $smtp_config['secure'];
        $mail->Port = $smtp_config['port'];
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($smtp_config['from_email'], $smtp_config['from_name']);
        $mail->addReplyTo($smtp_config['from_email'], $smtp_config['from_name']);
        $mail->addAddress($to_email, $site_name);
        $mail->Subject = $email_subject;
        $mail->Body = $email_body;
        $mail->AltBody = strip_tags($email_body);

        $sent = $mail->send();
    } catch (Exception $e) {
        $sent = false;
    }
}

if (!$sent) {
    $headers = "From: " . $smtp_config['from_name'] . " <" . $smtp_config['from_email'] . ">\r\n";
    $headers .= "Reply-To: " . $smtp_config['from_email'] . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    $sent = @mail($to_email, $email_subject, $email_body, $headers);
}

if ($sent) {
    header("Location: thank-you.html");
} else {
    header("Location: contact.html?error=" . urlencode("Something went wrong sending your message. Please try again later or call us directly."));
}
exit;
