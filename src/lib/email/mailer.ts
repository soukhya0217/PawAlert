import nodemailer, { type Transporter } from "nodemailer";
import connectDB from "../db/connect";
import EmailLog from "../db/models/EmailLog";
import { generateEmailHtml, EmailTemplateData } from "./templates";

export interface SendEmailOptions {
  to: string;
  recipientName?: string;
  template: string;
  data: EmailTemplateData;
  subjectOverride?: string;
}

// In-memory cache to debounce frequent duplicate emails (e.g. repeated login requests within 2 minutes)
const emailDebounceMap = new Map<string, number>();

let cachedTransporter: Transporter | null = null;

function sanitizeEmailUser(email?: string): string | undefined {
  if (!email) return undefined;
  let clean = email.trim();
  if (clean.endsWith("gmail@gmail.com")) {
    clean = clean.replace(/gmail@gmail\.com$/i, "@gmail.com");
  }
  return clean;
}

/**
 * Creates or retrieves the singleton Nodemailer Gmail SMTP transporter.
 */
export function getMailTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;

  const rawUser = process.env.EMAIL_USER;
  const emailUser = sanitizeEmailUser(rawUser);
  const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : undefined;

  if (!emailUser || !emailPass) {
    console.warn(
      "[PawAlert Mailer] EMAIL_USER or EMAIL_PASS is not configured in .env.local. Emails will run in simulated preview mode."
    );
    return null;
  }

  try {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return cachedTransporter;
  } catch (err) {
    console.error("[PawAlert Mailer] Error instantiating Nodemailer transporter:", err);
    return null;
  }
}

/**
 * Universal email dispatcher: formats HTML via templates, sends via Gmail SMTP,
 * logs into MongoDB EmailLog, and NEVER throws (completely non-blocking).
 */
export async function sendEmail(options: SendEmailOptions) {
  const { to, recipientName = "Guardian", template, data, subjectOverride } = options;
  const { subject: defaultSubject, html } = generateEmailHtml(template, {
    ...data,
    recipientName,
  });

  const subject = subjectOverride || defaultSubject;
  let status: "SENT" | "MOCKED" | "FAILED" = "MOCKED";
  let errorMsg: string | undefined = undefined;
  let providerMessageId: string | undefined = undefined;

  const transporter = getMailTransporter();
  const rawUser = process.env.EMAIL_USER;
  const emailUser = sanitizeEmailUser(rawUser);
  const emailFrom = process.env.EMAIL_FROM || (emailUser ? `"PawAlert Dispatch" <${emailUser}>` : '"PawAlert Dispatch" <alerts@pawalert.org>');

  if (transporter && emailUser) {
    try {
      const info = await transporter.sendMail({
        from: emailFrom,
        to,
        subject,
        html,
      });

      status = "SENT";
      providerMessageId = info.messageId;
      console.log(`[PawAlert Mailer] Email sent successfully to ${to} (Subject: "${subject}", MessageID: ${providerMessageId})`);
    } catch (err: any) {
      status = "FAILED";
      errorMsg = err?.message || String(err);
      console.error(`[PawAlert Mailer] Gmail SMTP error sending to ${to}:`, err);
    }
  } else {
    // Development / Preview mode
    status = "MOCKED";
    providerMessageId = `preview_smtp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log(`[PawAlert Mailer Preview] Template "${template}" delivered to "${to}". Subject: "${subject}"`);
  }

  // Persist delivery log in MongoDB (non-blocking)
  try {
    await connectDB();
    await EmailLog.create({
      recipientEmail: to,
      recipientName,
      subject,
      templateName: template,
      payload: data,
      status,
      providerMessageId,
      error: errorMsg,
      sentAt: new Date(),
    });
  } catch (dbErr) {
    console.error("[PawAlert Mailer] Could not persist email log to MongoDB:", dbErr);
  }

  return { success: status !== "FAILED", status, providerMessageId, error: errorMsg };
}

// ----------------------------------------------------------------------
// Dedicated High-Level Notification Functions
// ----------------------------------------------------------------------

/**
 * 1. User Registration Welcome Email
 */
export async function sendWelcomeEmail(to: string, fullName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return sendEmail({
    to,
    recipientName: fullName,
    template: "WELCOME",
    data: {
      recipientName: fullName,
      actionUrl: `${appUrl}/user/dashboard`,
    },
  });
}

/**
 * 2. User Login Notification Email (Debounced: max 1 per 2 minutes per user)
 */
export async function sendLoginEmail(to: string, fullName: string) {
  const now = Date.now();
  const lastSent = emailDebounceMap.get(to) || 0;
  // If sent within the last 120 seconds, skip duplicate
  if (now - lastSent < 120000) {
    console.log(`[PawAlert Mailer] Skipping duplicate login email for ${to} (debounced).`);
    return { success: true, status: "DEBOUNCED" };
  }

  emailDebounceMap.set(to, now);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const loginFormatted = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  return sendEmail({
    to,
    recipientName: fullName,
    template: "LOGIN_NOTIFICATION",
    data: {
      recipientName: fullName,
      loginTime: loginFormatted,
      actionUrl: `${appUrl}/forgot-password`,
    },
  });
}

/**
 * 3. Animal Report Submission Email (Sent to Reporter)
 */
export async function sendReportSubmittedEmail(params: {
  to: string;
  reporterName: string;
  incidentId: string;
  animalCategory: string;
  conditionDescription: string;
  locationAddress: string;
  submissionDate?: string;
  reportStatus?: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return sendEmail({
    to: params.to,
    recipientName: params.reporterName,
    template: "REPORT_SUBMITTED",
    data: {
      recipientName: params.reporterName,
      incidentId: params.incidentId,
      animalCategory: params.animalCategory,
      conditionDescription: params.conditionDescription,
      locationAddress: params.locationAddress,
      submissionDate: params.submissionDate,
      status: params.reportStatus || "REPORTED",
      actionUrl: `${appUrl}/track/${params.incidentId}`,
    },
  });
}

/**
 * 4. Admin New Distress Report Alert (Sent to ADMIN_EMAIL)
 */
export async function sendAdminNewReportNotification(params: {
  incidentId: string;
  animalCategory: string;
  conditionDescription: string;
  locationAddress: string;
  priority: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  submissionDate?: string;
}) {
  const rawAdmin = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const adminEmail = sanitizeEmailUser(rawAdmin) || "soukhyahegde02@gmail.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return sendEmail({
    to: adminEmail,
    recipientName: "PawAlert Dispatch Admin",
    template: "ADMIN_NEW_REPORT",
    data: {
      recipientName: "PawAlert Dispatch Admin",
      incidentId: params.incidentId,
      animalCategory: params.animalCategory,
      conditionDescription: params.conditionDescription,
      locationAddress: params.locationAddress,
      priority: params.priority,
      reporterName: params.reporterName,
      reporterEmail: params.reporterEmail,
      reporterPhone: params.reporterPhone,
      submissionDate: params.submissionDate,
      actionUrl: `${appUrl}/admin/incidents`,
    },
  });
}

/**
 * 5. Report Status Update Notification (Sent to Reporter)
 */
export async function sendStatusUpdateNotification(params: {
  to: string;
  recipientName: string;
  incidentId: string;
  animalCategory?: string;
  previousStatus: string;
  newStatus: string;
  adminRemarks?: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return sendEmail({
    to: params.to,
    recipientName: params.recipientName,
    template: "STATUS_UPDATE",
    data: {
      recipientName: params.recipientName,
      incidentId: params.incidentId,
      animalCategory: params.animalCategory,
      previousStatus: params.previousStatus,
      newStatus: params.newStatus,
      adminRemarks: params.adminRemarks,
      actionUrl: `${appUrl}/track/${params.incidentId}`,
    },
  });
}
