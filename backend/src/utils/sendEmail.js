const nodemailer = require('nodemailer');

/**
 * Sends a visually styled OTP email to a user.
 * Falls back to logging to console if SMTP configuration is not found.
 * 
 * @param {string} email - Destination email address
 * @param {string} otp - The generated OTP code
 * @param {string} username - The user's username
 * @returns {Promise<{success: boolean, mode: string, messageId?: string, error?: string}>}
 */
const sendOTPEmail = async (email, otp, username) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  // Fallback if SMTP settings are missing
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('\n==================================================');
    console.log(`[Dev Mode] SMTP credentials are not configured in .env.`);
    console.log(`To: ${email}`);
    console.log(`Username: ${username}`);
    console.log(`OTP Code: ${otp}`);
    console.log('==================================================\n');
    return { success: true, mode: 'dev', otp };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10) || 587,
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // visual layout designed for modern email clients
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>ConnectSphere Verification Code</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    body, table, td, a { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    table, td { mso-table-rspace: 0pt; mso-table-lspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    body {
      background-color: #f4f5f7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f5f7;
      padding: 40px 10px;
    }
    .card {
      max-width: 500px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    .header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      padding: 35px 30px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .logo span {
      color: #a5b4fc;
    }
    .body-content {
      padding: 40px 30px;
      color: #1f2937;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 12px;
      color: #111827;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #4b5563;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .otp-container {
      background-color: #f5f7ff;
      border: 1px dashed #6366f1;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 800;
      color: #4f46e5;
      letter-spacing: 6px;
      margin: 0;
    }
    .expiry-note {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 10px;
      margin-bottom: 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid #f3f4f6;
    }
    .footer-text {
      font-size: 12px;
      color: #9ca3af;
      line-height: 1.5;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1 class="logo">Connect<span>Sphere</span></h1>
      </div>
      <div class="body-content">
        <h2 class="greeting">Hello, ${username || 'Learner'}!</h2>
        <p class="text">
          Thank you for joining ConnectSphere Community Learning. To complete your verification, please use the following One-Time Password (OTP):
        </p>
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
          <p class="expiry-note">This code is valid for 15 minutes.</p>
        </div>
        <p class="text">
          If you did not request this code, you can safely ignore this email.
        </p>
      </div>
      <div class="footer">
        <p class="footer-text">
          ConnectSphere Community Learning Platform<br>
          Building knowledge together.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: EMAIL_FROM || `"ConnectSphere" <no-reply@connectsphere.com>`,
      to: email,
      subject: `ConnectSphere Verification Code: ${otp}`,
      text: `Hello ${username || 'Learner'},\n\nYour One-Time Password (OTP) for verification is: ${otp}\n\nThis code is valid for 15 minutes.\n\nBest regards,\nConnectSphere Team`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Email sent successfully to ${email}: ${info.messageId}`);
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error(`[Nodemailer Error] Failed to send email to ${email}:`, error);
    return { success: false, mode: 'smtp-error', error: error.message };
  }
};

/**
 * Sends a visually styled password reset email to a user.
 * Falls back to logging to console if SMTP configuration is not found.
 * 
 * @param {string} email - Destination email address
 * @param {string} password - The generated temporary password
 * @param {string} username - The user's username
 * @returns {Promise<{success: boolean, mode: string, messageId?: string, error?: string}>}
 */
const sendPasswordResetEmail = async (email, password, username) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  // Fallback if SMTP settings are missing
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('\n==================================================');
    console.log(`[Dev Mode] SMTP credentials are not configured in .env.`);
    console.log(`To: ${email}`);
    console.log(`Username: ${username}`);
    console.log(`New Password: ${password}`);
    console.log('==================================================\n');
    return { success: true, mode: 'dev', password };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10) || 587,
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>ConnectSphere Password Reset</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    body, table, td, a { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    table, td { mso-table-rspace: 0pt; mso-table-lspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    body {
      background-color: #f4f5f7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f5f7;
      padding: 40px 10px;
    }
    .card {
      max-width: 500px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    .header {
      background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
      padding: 35px 30px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .logo span {
      color: #fecdd3;
    }
    .body-content {
      padding: 40px 30px;
      color: #1f2937;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 12px;
      color: #111827;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #4b5563;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .password-container {
      background-color: #fff1f2;
      border: 1px dashed #f43f5e;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .password-text {
      font-size: 28px;
      font-weight: 800;
      color: #e11d48;
      letter-spacing: 1px;
      margin: 0;
    }
    .warning-note {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 10px;
      margin-bottom: 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid #f3f4f6;
    }
    .footer-text {
      font-size: 12px;
      color: #9ca3af;
      line-height: 1.5;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1 class="logo">Connect<span>Sphere</span></h1>
      </div>
      <div class="body-content">
        <h2 class="greeting">Hello, ${username || 'Learner'}!</h2>
        <p class="text">
          We received a request to reset your password. Below is your new temporary password. Please log in with this password and change it immediately inside your profile settings:
        </p>
        <div class="password-container">
          <div class="password-text">${password}</div>
          <p class="warning-note">Please change this password after logging in.</p>
        </div>
        <p class="text">
          If you did not request a password reset, please contact support immediately or change your password to keep your account secure.
        </p>
      </div>
      <div class="footer">
        <p class="footer-text">
          ConnectSphere Community Learning Platform<br>
          Building knowledge together.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: EMAIL_FROM || `"ConnectSphere" <no-reply@connectsphere.com>`,
      to: email,
      subject: `ConnectSphere Password Reset`,
      text: `Hello ${username || 'Learner'},\n\nYour new temporary password is: ${password}\n\nPlease change it after logging in.\n\nBest regards,\nConnectSphere Team`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Password reset email sent successfully to ${email}: ${info.messageId}`);
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error(`[Nodemailer Error] Failed to send password reset email to ${email}:`, error);
    return { success: false, mode: 'smtp-error', error: error.message };
  }
};

/**
 * Sends a visually styled Login Verification OTP email to a user.
 * Falls back to logging to console if SMTP configuration is not found.
 * 
 * @param {string} email - Destination email address
 * @param {string} otp - The generated OTP code
 * @param {string} username - The user's username
 * @returns {Promise<{success: boolean, mode: string, messageId?: string, error?: string}>}
 */
const sendLoginOTPEmail = async (email, otp, username) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  // Fallback if SMTP settings are missing
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('\n==================================================');
    console.log(`[Dev Mode] SMTP credentials are not configured in .env.`);
    console.log(`To: ${email}`);
    console.log(`Username: ${username}`);
    console.log(`Login Verification OTP Code: ${otp}`);
    console.log('==================================================\n');
    return { success: true, mode: 'dev', otp };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10) || 587,
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>ConnectSphere Login Verification</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    body, table, td, a { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
    table, td { mso-table-rspace: 0pt; mso-table-lspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    body {
      background-color: #f4f5f7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f5f7;
      padding: 40px 10px;
    }
    .card {
      max-width: 500px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%);
      padding: 35px 30px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .logo span {
      color: #c7d2fe;
    }
    .body-content {
      padding: 40px 30px;
      color: #1f2937;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 12px;
      color: #111827;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #4b5563;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .otp-container {
      background-color: #f5f7ff;
      border: 1px dashed #4f46e5;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 800;
      color: #4f46e5;
      letter-spacing: 6px;
      margin: 0;
    }
    .expiry-note {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 10px;
      margin-bottom: 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid #f3f4f6;
    }
    .footer-text {
      font-size: 12px;
      color: #9ca3af;
      line-height: 1.5;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1 class="logo">Connect<span>Sphere</span></h1>
      </div>
      <div class="body-content">
        <h2 class="greeting">Hello, ${username || 'Learner'}!</h2>
        <p class="text">
          We detected a login attempt to your ConnectSphere account via Google Chrome. For your security, please use the following One-Time Password (OTP) to complete your login:
        </p>
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
          <p class="expiry-note">This code is valid for 15 minutes.</p>
        </div>
        <p class="text">
          If you did not initiate this login, please secure your account immediately.
        </p>
      </div>
      <div class="footer">
        <p class="footer-text">
          ConnectSphere Community Learning Platform<br>
          Building knowledge together.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: EMAIL_FROM || `"ConnectSphere" <no-reply@connectsphere.com>`,
      to: email,
      subject: `ConnectSphere Login Verification Code: ${otp}`,
      text: `Hello ${username || 'Learner'},\n\nYour One-Time Password (OTP) for login verification is: ${otp}\n\nThis code is valid for 15 minutes.\n\nBest regards,\nConnectSphere Team`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] Login OTP email sent successfully to ${email}: ${info.messageId}`);
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error(`[Nodemailer Error] Failed to send login OTP email to ${email}:`, error);
    return { success: false, mode: 'smtp-error', error: error.message };
  }
};

module.exports = { sendOTPEmail, sendPasswordResetEmail, sendLoginOTPEmail };
