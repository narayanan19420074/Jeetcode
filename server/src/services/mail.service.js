import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Public base URL for links inside emails. On Render, RENDER_EXTERNAL_URL is set automatically.
export const appUrl = () =>
  (env.APP_URL || env.RENDER_EXTERNAL_URL || env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/+$/, '');

export const mailConfigured = () => !!(env.BREVO_API_KEY && env.MAIL_FROM_EMAIL);

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function layout(title, bodyHtml, buttonText, url) {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2933">
<div style="max-width:480px;margin:24px auto;background:#fff;border-radius:12px;padding:28px">
<h2 style="margin:0 0 16px;font-size:20px">${esc(title)}</h2>
${bodyHtml}
<p style="margin:24px 0"><a href="${esc(url)}" style="background:#1a73e8;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;display:inline-block">${esc(buttonText)}</a></p>
<p style="font-size:12px;color:#6b7280;word-break:break-all">If the button does not work, copy and paste this link into your browser:<br>${esc(url)}</p>
</div></body></html>`;
}

/**
 * Sends one email through Brevo's HTTP API. Returns true when sent.
 * With no BREVO_API_KEY/MAIL_FROM_EMAIL it logs the message (with the link) and returns false,
 * so the flow still works in development.
 */
export async function sendMail({ to, subject, html, text, devLink }) {
  if (!mailConfigured()) {
    logger.warn(`[mail] Email not configured, not sent. To: ${to} | Subject: ${subject}${devLink ? ` | Link: ${devLink}` : ''}`);
    return false;
  }
  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: env.MAIL_FROM_NAME, email: env.MAIL_FROM_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      },
      { headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' }, timeout: 10000 }
    );
    return true;
  } catch (err) {
    logger.error(`[mail] Brevo send failed for ${to}: ${err?.response?.data?.message || err.message}`);
    return false;
  }
}

export function sendVerificationEmail(user, token) {
  const url = `${appUrl()}/verify-email?token=${token}`;
  return sendMail({
    to: user.email,
    subject: 'Verify your JeetCode email',
    html: layout('Verify your email', `<p>Hi ${esc(user.name)}, please confirm the email address for your JeetCode account. This link is valid for 24 hours.</p>`, 'Verify email', url),
    text: `Hi ${user.name}, verify your JeetCode email (valid 24 hours): ${url}`,
    devLink: url,
  });
}

export function sendPasswordResetEmail(user, token) {
  const url = `${appUrl()}/reset-password?token=${token}`;
  return sendMail({
    to: user.email,
    subject: 'Reset your JeetCode password',
    html: layout(
      'Reset your password',
      `<p>Hi ${esc(user.name)}, we received a request to reset your JeetCode password. This link is valid for 30 minutes.</p><p>If you did not request this, you can ignore this email. Your password will not change.</p>`,
      'Reset password',
      url
    ),
    text: `Hi ${user.name}, reset your JeetCode password (valid 30 minutes): ${url}\nIf you did not ask for this, ignore this email.`,
    devLink: url,
  });
}
