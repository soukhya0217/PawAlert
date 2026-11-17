import connectDB from "../db/connect";
import EmailLog from "../db/models/EmailLog";
import { generateEmailHtml, EmailTemplateData } from "./templates";

export interface SendEmailOptions {
  to: string;
  recipientName?: string;
  template: string;
  data: EmailTemplateData;
}

export async function sendEmail(options: SendEmailOptions) {
  const { to, recipientName = "User", template, data } = options;
  const { subject, html } = generateEmailHtml(template, { ...data, recipientName });

  let status: "SENT" | "MOCKED" | "FAILED" = "MOCKED";
  let errorMsg: string | undefined = undefined;
  let providerMessageId: string | undefined = undefined;

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey && resendApiKey !== "re_dummy_token") {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendApiKey);

      const response = await resend.emails.send({
        from: process.env.EMAIL_FROM || "POWER ALERT <alerts@poweralert.org>",
        to: [to],
        subject,
        html,
      });

      if (response.error) {
        status = "FAILED";
        errorMsg = response.error.message;
        console.error("Resend delivery failed:", response.error);
      } else {
        status = "SENT";
        providerMessageId = response.data?.id;
        console.log(`Email successfully delivered via Resend to ${to} (id: ${providerMessageId})`);
      }
    } catch (err: any) {
      status = "FAILED";
      errorMsg = err?.message || "Unknown email error";
      console.error("Resend unexpected error:", err);
    }
  } else {
    // Development / Demo Mode: Simulated instant delivery
    status = "MOCKED";
    providerMessageId = `mock_msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log(`[Email Simulator] Template '${template}' delivered to '${to}'. Subject: '${subject}'`);
  }

  // Persist delivery log in MongoDB
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
    console.error("Could not write email log to database:", dbErr);
  }

  return { success: status !== "FAILED", status, providerMessageId, error: errorMsg };
}
