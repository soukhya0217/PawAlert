import nodemailer, { type Transporter } from "nodemailer";
import connectDB from "../db/connect";
import EmailLog from "../db/models/EmailLog";
import User from "../db/models/User";
import { generateEmailHtml, EmailTemplateData } from "./templates";

export interface SendEmailOptions {
  to: string;
  bcc?: string | string[];
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
 * Supports SMTP_USER / SMTP_PASS and legacy EMAIL_USER / EMAIL_PASS.
 */
export function getMailTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;

  const rawUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const emailUser = sanitizeEmailUser(rawUser);
  const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const emailPass = rawPass ? rawPass.replace(/\s+/g, "") : undefined;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 587;

  if (!emailUser || !emailPass) {
    console.warn(
      "[PawAlert Mailer] SMTP_USER/EMAIL_USER or SMTP_PASS/EMAIL_PASS is not configured in .env.local. Emails will run in simulated preview mode."
    );
    return null;
  }

  try {
    const isGmail = smtpHost.includes("gmail") || emailUser.toLowerCase().includes("@gmail.com");

    const transportConfig: any = isGmail
      ? {
          service: "gmail",
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        }
      : {
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          requireTLS: smtpPort === 587,
          auth: {
            user: emailUser,
            pass: emailPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        };

    cachedTransporter = nodemailer.createTransport(transportConfig);

    console.log(`[PawAlert Mailer] Configured Nodemailer SMTP transporter (${emailUser} via ${isGmail ? "Gmail Service" : smtpHost})`);
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
  const { to, bcc, recipientName = "Guardian", template, data, subjectOverride } = options;
  const { subject: defaultSubject, html } = generateEmailHtml(template, {
    ...data,
    recipientName,
  });

  const subject = subjectOverride || defaultSubject;
  // Generate clean plain-text fallback
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  let status: "SENT" | "MOCKED" | "FAILED" = "MOCKED";
  let errorMsg: string | undefined = undefined;
  let providerMessageId: string | undefined = undefined;

  const transporter = getMailTransporter();
  const rawUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const emailUser = sanitizeEmailUser(rawUser);
  const emailFrom =
    process.env.EMAIL_FROM ||
    (emailUser ? `"PawAlert Emergency Dispatch" <${emailUser}>` : '"PawAlert Dispatch" <alerts@pawalert.org>');

  if (transporter && emailUser) {
    try {
      const mailOptions: any = {
        from: emailFrom,
        to,
        subject,
        html,
        text,
      };

      if (bcc) {
        mailOptions.bcc = bcc;
      }

      const info = await transporter.sendMail(mailOptions);

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
 * Automatically sent to registered email address upon successful registration.
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
 * 2. User Login Notification Email
 * Automatically sent upon successful login (debounced: max 1 per 2 minutes).
 */
export async function sendLoginEmail(to: string, fullName: string) {
  const now = Date.now();
  const lastSent = emailDebounceMap.get(to) || 0;
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
 * 3. Animal Report Submission Email (Sent to Original Reporter)
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
  const rawAdmin = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER;
  const adminEmail = sanitizeEmailUser(rawAdmin) || "pawalertforeverypaw@gmail.com";
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

/**
 * 6. Community Broadcast: New Animal Rescue Case
 * Automatically sends notifications to all registered users and volunteers via BCC
 * ensuring recipient emails are never exposed to one another.
 */
export async function sendNewCaseBroadcastEmail(incident: any) {
  try {
    await connectDB();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const rawUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const emailFrom = sanitizeEmailUser(rawUser) || "pawalertforeverypaw@gmail.com";

    // Query all registered users with valid emails
    const users = await User.find({
      email: { $exists: true, $ne: "" },
    }).select("email");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allEmails = Array.from(
      new Set(
        users
          .map((u) => u.email?.toLowerCase().trim())
          .filter((e): e is string => Boolean(e && emailRegex.test(e)))
      )
    );

    if (allEmails.length === 0) {
      console.log("[PawAlert Mailer] No registered users found for new case broadcast.");
      return { success: true, count: 0 };
    }

    // Chunk into BCC batches of 40 to avoid provider SMTP limits
    const BATCH_SIZE = 40;
    const batches: string[][] = [];
    for (let i = 0; i < allEmails.length; i += BATCH_SIZE) {
      batches.push(allEmails.slice(i, i + BATCH_SIZE));
    }

    console.log(`[PawAlert Mailer] Broadcasting new case #${incident.incidentId} to ${allEmails.length} recipients across ${batches.length} batch(es)...`);

    for (const batch of batches) {
      await sendEmail({
        to: emailFrom, // From address as To, recipients in BCC protects privacy
        bcc: batch,
        recipientName: "Animal Guardian Community",
        template: "NEW_CASE_ALERT",
        data: {
          recipientName: "Animal Guardian Community",
          incidentId: incident.incidentId,
          animalCategory: incident.animalCategory,
          conditionDescription: incident.conditionDescription,
          locationAddress: incident.location?.address || incident.location?.landmark || "Field Location",
          status: incident.status,
          actionUrl: `${appUrl}/track/${incident.incidentId}`,
        },
      });
    }

    return { success: true, count: allEmails.length };
  } catch (err: any) {
    console.error("[PawAlert Mailer] Error broadcasting new case notification:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 7. Community Broadcast: Case Resolved Notification
 * Automatically sends notification to all registered users and volunteers when a case is resolved.
 */
export async function sendCaseResolvedBroadcastEmail(incident: any) {
  try {
    await connectDB();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const rawUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const emailFrom = sanitizeEmailUser(rawUser) || "pawalertforeverypaw@gmail.com";

    const users = await User.find({
      email: { $exists: true, $ne: "" },
    }).select("email");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allEmails = Array.from(
      new Set(
        users
          .map((u) => u.email?.toLowerCase().trim())
          .filter((e): e is string => Boolean(e && emailRegex.test(e)))
      )
    );

    if (allEmails.length === 0) {
      console.log("[PawAlert Mailer] No registered users found for resolved case broadcast.");
      return { success: true, count: 0 };
    }

    const BATCH_SIZE = 40;
    const batches: string[][] = [];
    for (let i = 0; i < allEmails.length; i += BATCH_SIZE) {
      batches.push(allEmails.slice(i, i + BATCH_SIZE));
    }

    console.log(`[PawAlert Mailer] Broadcasting resolved case #${incident.incidentId} to ${allEmails.length} recipients across ${batches.length} batch(es)...`);

    for (const batch of batches) {
      await sendEmail({
        to: emailFrom,
        bcc: batch,
        recipientName: "Animal Guardian Community",
        template: "CASE_RESOLVED_ALERT",
        data: {
          recipientName: "Animal Guardian Community",
          incidentId: incident.incidentId,
          animalCategory: incident.animalCategory,
          conditionDescription: incident.conditionDescription,
          locationAddress: incident.location?.address || "Field Location",
          status: "RESOLVED",
          adminRemarks: incident.resolutionNotes,
          actionUrl: `${appUrl}/track/${incident.incidentId}`,
        },
      });
    }

    return { success: true, count: allEmails.length };
  } catch (err: any) {
    console.error("[PawAlert Mailer] Error broadcasting case resolved notification:", err);
    return { success: false, error: err.message };
  }
}
