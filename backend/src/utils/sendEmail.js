const nodemailer = require('nodemailer');

/**
 * Helper: Sends email via Resend HTTP API.
 */
const sendViaResendAPI = async (toEmail, subject, htmlContent, textContent, toName) => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "no-reply@connectsphere.com";

  const payload = {
    from: fromEmail,
    to: toEmail,
    subject: subject,
    html: htmlContent,
    text: textContent
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'connectsphere/1.0'
    },
    body: JSON.stringify(payload)
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.message || `Resend API error: ${response.status}`);
  }
  return responseData;
};

/**
 * Helper: Sends email via Brevo HTTP API.
 */
const sendViaBrevoAPI = async (toEmail, subject, htmlContent, textContent, toName) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "no-reply@connectsphere.com";
  
  let senderName = "ConnectSphere";
  let senderEmail = fromEmail;
  if (fromEmail.includes("<")) {
    const parts = fromEmail.split("<");
    senderName = parts[0].trim().replace(/"/g, "");
    senderEmail = parts[1].replace(">", "").trim();
  }

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail, name: toName || "User" }],
    subject: subject,
    htmlContent: htmlContent,
    textContent: textContent
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.message || `Brevo API error: ${response.status}`);
  }
  return responseData;
};

/**
 * Sends a simplified OTP email to a user.
 */
const sendOTPEmail = async (email, otp, username) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, BREVO_API_KEY, RESEND_API_KEY } = process.env;
  const subject = `ConnectSphere Verification Code: ${otp}`;
  const text = `Your ConnectSphere verification code is: ${otp}\n\nThis code is valid for 15 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4f46e5;">ConnectSphere Verification</h2>
      <p>Hello <strong>${username || 'Learner'}</strong>,</p>
      <p>Your verification code is: <strong style="font-size: 24px; color: #4f46e5; letter-spacing: 2px;">${otp}</strong></p>
      <p>This code is valid for 15 minutes.</p>
    </div>
  `;

  // 1. Try Resend API if key is present
  if (RESEND_API_KEY) {
    try {
      const result = await sendViaResendAPI(email, subject, html, text, username);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Resend API] Verification OTP email sent successfully to ${email}`);
      }
      return { success: true, mode: 'resend-api', messageId: result.id };
    } catch (apiError) {
      console.error(`[Resend API Error] Failed to send email to ${email}, trying fallback:`, apiError.message);
      if (!BREVO_API_KEY && (!SMTP_HOST || !SMTP_USER || !SMTP_PASS)) {
        return { success: false, mode: 'resend-error', error: apiError.message };
      }
    }
  }

  // 2. Try Brevo API if key is present
  if (BREVO_API_KEY) {
    try {
      const result = await sendViaBrevoAPI(email, subject, html, text, username);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Brevo API] Verification OTP email sent successfully to ${email}`);
      }
      return { success: true, mode: 'api', messageId: result.messageId };
    } catch (apiError) {
      console.error(`[Brevo API Error] Failed to send email to ${email}, trying SMTP fallback:`, apiError.message);
      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return { success: false, mode: 'api-error', error: apiError.message };
      }
    }
  }

  // 2. Dev mode fallback if SMTP credentials are missing
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n==================================================');
      console.log(`[Dev Mode] SMTP/API credentials are not configured.`);
      console.log(`To: ${email}`);
      console.log(`Username: ${username}`);
      console.log(`OTP Code: ${otp}`);
      console.log('==================================================\n');
    }
    return { success: true, mode: 'dev', otp };
  }

  // 3. Try Nodemailer SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10) || 587,
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const mailOptions = {
      from: EMAIL_FROM || `"ConnectSphere" <no-reply@connectsphere.com>`,
      to: email,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Nodemailer] Email sent successfully to ${email}: ${info.messageId}`);
    }
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error(`[Nodemailer Error] Failed to send email to ${email}:`, error);
    return { success: false, mode: 'smtp-error', error: error.message };
  }
};

/**
 * Sends a simplified password reset email to a user.
 */
const sendPasswordResetEmail = async (email, password, username) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, BREVO_API_KEY, RESEND_API_KEY } = process.env;
  const subject = `ConnectSphere Password Reset`;
  const text = `Your temporary password is: ${password}\n\nPlease change it after logging in.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #e11d48;">ConnectSphere Password Reset</h2>
      <p>Hello <strong>${username || 'Learner'}</strong>,</p>
      <p>Your temporary password is: <strong style="font-size: 20px; color: #e11d48;">${password}</strong></p>
      <p>Please change this password immediately after logging in.</p>
    </div>
  `;

  // 1. Try Resend API if key is present
  if (RESEND_API_KEY) {
    try {
      const result = await sendViaResendAPI(email, subject, html, text, username);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Resend API] Password reset email sent successfully to ${email}`);
      }
      return { success: true, mode: 'resend-api', messageId: result.id };
    } catch (apiError) {
      console.error(`[Resend API Error] Failed to send password reset email, trying fallback:`, apiError.message);
      if (!BREVO_API_KEY && (!SMTP_HOST || !SMTP_USER || !SMTP_PASS)) {
        return { success: false, mode: 'resend-error', error: apiError.message };
      }
    }
  }

  // 2. Try Brevo API if key is present
  if (BREVO_API_KEY) {
    try {
      const result = await sendViaBrevoAPI(email, subject, html, text, username);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Brevo API] Password reset email sent successfully to ${email}`);
      }
      return { success: true, mode: 'api', messageId: result.messageId };
    } catch (apiError) {
      console.error(`[Brevo API Error] Failed to send password reset email, trying SMTP fallback:`, apiError.message);
      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return { success: false, mode: 'api-error', error: apiError.message };
      }
    }
  }

  // 2. Dev mode fallback if SMTP credentials are missing
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n==================================================');
      console.log(`[Dev Mode] SMTP/API credentials are not configured.`);
      console.log(`To: ${email}`);
      console.log(`Username: ${username}`);
      console.log(`New Password: ${password}`);
      console.log('==================================================\n');
    }
    return { success: true, mode: 'dev', password };
  }

  // 3. Try Nodemailer SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10) || 587,
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const mailOptions = {
      from: EMAIL_FROM || `"ConnectSphere" <no-reply@connectsphere.com>`,
      to: email,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Nodemailer] Password reset email sent successfully to ${email}: ${info.messageId}`);
    }
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error(`[Nodemailer Error] Failed to send password reset email to ${email}:`, error);
    return { success: false, mode: 'smtp-error', error: error.message };
  }
};

/**
 * Sends a simplified Login Verification OTP email to a user.
 */
const sendLoginOTPEmail = async (email, otp, username) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, BREVO_API_KEY, RESEND_API_KEY } = process.env;
  const subject = `ConnectSphere Login Verification Code: ${otp}`;
  const text = `Your login verification code is: ${otp}\n\nThis code is valid for 15 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4f46e5;">ConnectSphere Login Verification</h2>
      <p>Hello <strong>${username || 'Learner'}</strong>,</p>
      <p>Your login verification code is: <strong style="font-size: 24px; color: #4f46e5; letter-spacing: 2px;">${otp}</strong></p>
      <p>This code is valid for 15 minutes.</p>
    </div>
  `;

  // 1. Try Resend API if key is present
  if (RESEND_API_KEY) {
    try {
      const result = await sendViaResendAPI(email, subject, html, text, username);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Resend API] Login OTP email sent successfully to ${email}`);
      }
      return { success: true, mode: 'resend-api', messageId: result.id };
    } catch (apiError) {
      console.error(`[Resend API Error] Failed to send login OTP email, trying fallback:`, apiError.message);
      if (!BREVO_API_KEY && (!SMTP_HOST || !SMTP_USER || !SMTP_PASS)) {
        return { success: false, mode: 'resend-error', error: apiError.message };
      }
    }
  }

  // 2. Try Brevo API if key is present
  if (BREVO_API_KEY) {
    try {
      const result = await sendViaBrevoAPI(email, subject, html, text, username);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Brevo API] Login OTP email sent successfully to ${email}`);
      }
      return { success: true, mode: 'api', messageId: result.messageId };
    } catch (apiError) {
      console.error(`[Brevo API Error] Failed to send login OTP email, trying SMTP fallback:`, apiError.message);
      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return { success: false, mode: 'api-error', error: apiError.message };
      }
    }
  }

  // 2. Dev mode fallback if SMTP credentials are missing
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n==================================================');
      console.log(`[Dev Mode] SMTP/API credentials are not configured.`);
      console.log(`To: ${email}`);
      console.log(`Username: ${username}`);
      console.log(`Login Verification OTP Code: ${otp}`);
      console.log('==================================================\n');
    }
    return { success: true, mode: 'dev', otp };
  }

  // 3. Try Nodemailer SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10) || 587,
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const mailOptions = {
      from: EMAIL_FROM || `"ConnectSphere" <no-reply@connectsphere.com>`,
      to: email,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Nodemailer] Login OTP email sent successfully to ${email}: ${info.messageId}`);
    }
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error(`[Nodemailer Error] Failed to send login OTP email to ${email}:`, error);
    return { success: false, mode: 'smtp-error', error: error.message };
  }
};

/**
 * Sends a simplified subscription invoice email to a user.
 */
const sendSubscriptionInvoiceEmail = async (email, username, planName, amount, invoiceId) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, BREVO_API_KEY, RESEND_API_KEY } = process.env;
  const subject = `ConnectSphere Invoice - ${planName} Subscription`;
  const text = `Hi ${username},\n\nThank you for subscribing to our ${planName} Plan. Here are your subscription details:\n\nInvoice ID: ${invoiceId}\nPlan: ${planName}\nAmount Paid: ₹${amount}.00\n\nBest regards,\nConnectSphere Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px;">
      <h2 style="color: #4f46e5; border-bottom: 2px solid #eee; padding-bottom: 10px;">ConnectSphere Invoice</h2>
      <p>Hi <strong>${username}</strong>,</p>
      <p>Thank you for subscribing to the <strong>${planName} Plan</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr><th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Invoice ID</th><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${invoiceId}</td></tr>
        <tr><th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Plan Name</th><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${planName}</td></tr>
        <tr><th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd; color: #888;">Amount Paid</th><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: #4f46e5;">₹${amount}.00</td></tr>
      </table>
      <p>Keep learning and sharing knowledge!</p>
    </div>
  `;

  // 1. Try Resend API if key is present
  if (RESEND_API_KEY) {
    try {
      const result = await sendViaResendAPI(email, subject, html, text, username);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Resend API] Subscription invoice email sent successfully to ${email}`);
      }
      return { success: true, mode: 'resend-api', messageId: result.id };
    } catch (apiError) {
      console.error(`[Resend API Error] Failed to send subscription invoice email, trying fallback:`, apiError.message);
      if (!BREVO_API_KEY && (!SMTP_HOST || !SMTP_USER || !SMTP_PASS)) {
        return { success: false, mode: 'resend-error', error: apiError.message };
      }
    }
  }

  // 2. Try Brevo API if key is present
  if (BREVO_API_KEY) {
    try {
      const result = await sendViaBrevoAPI(email, subject, html, text, username);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Brevo API] Subscription invoice email sent successfully to ${email}`);
      }
      return { success: true, mode: 'api', messageId: result.messageId };
    } catch (apiError) {
      console.error(`[Brevo API Error] Failed to send subscription invoice email, trying SMTP fallback:`, apiError.message);
      if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return { success: false, mode: 'api-error', error: apiError.message };
      }
    }
  }

  // 2. Dev mode fallback if SMTP credentials are missing
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n==================================================');
      console.log(`[Dev Mode] SMTP/API credentials are not configured.`);
      console.log(`To: ${email}`);
      console.log(`Username: ${username}`);
      console.log(`Plan: ${planName}`);
      console.log(`Amount: ₹${amount}`);
      console.log(`Invoice ID: ${invoiceId}`);
      console.log('==================================================\n');
    }
    return { success: true, mode: 'dev' };
  }

  // 3. Try Nodemailer SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10) || 587,
      secure: parseInt(SMTP_PORT, 10) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const mailOptions = {
      from: EMAIL_FROM || `"ConnectSphere" <no-reply@connectsphere.com>`,
      to: email,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Nodemailer] Subscription invoice email sent successfully to ${email}: ${info.messageId}`);
    }
    return { success: true, mode: 'smtp', messageId: info.messageId };
  } catch (error) {
    console.error(`[Nodemailer Error] Failed to send subscription invoice email to ${email}:`, error);
    return { success: false, mode: 'smtp-error', error: error.message };
  }
};

module.exports = { sendOTPEmail, sendPasswordResetEmail, sendLoginOTPEmail, sendSubscriptionInvoiceEmail };
