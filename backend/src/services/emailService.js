import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an interview summary email after a mock interview is completed.
 * @param {object} params
 * @param {string} params.to
 * @param {string} params.candidateName
 * @param {number} params.overallScore
 * @param {object} params.feedback
 * @param {string} params.sessionId
 */
export const sendInterviewSummaryEmail = async ({ to, candidateName, overallScore, feedback, sessionId }) => {
  const dashboardLink = `${process.env.FRONTEND_URL}/reports/${sessionId}`;

  const suggestionsList = (feedback.improvement_suggestions || [])
    .slice(0, 3)
    .map((s) => `<li style="margin-bottom:6px;">${escapeHtml(s)}</li>`)
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">InterviewAce AI</h1>
        <p style="color: #E0E7FF; margin: 4px 0 0;">Mock Interview Summary</p>
      </div>
      <div style="border: 1px solid #E5E7EB; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <p>Hi ${escapeHtml(candidateName)},</p>
        <p>You've completed a mock interview session. Here's a quick summary of your performance:</p>

        <div style="background: #F3F4F6; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px; color: #6B7280;">Overall Score</p>
          <p style="margin: 4px 0 0; font-size: 36px; font-weight: bold; color: #4F46E5;">${overallScore}/100</p>
        </div>

        <h3 style="margin-bottom: 8px;">Key Feedback</h3>
        <ul style="padding-left: 20px; color: #374151;">
          ${suggestionsList}
        </ul>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${dashboardLink}" style="background: #4F46E5; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            View Full Report
          </a>
        </div>

        <p style="font-size: 12px; color: #9CA3AF;">Keep practicing to improve your scores. You're making progress!</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Your Mock Interview Results: ${overallScore}/100`,
    html,
  });
};

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
