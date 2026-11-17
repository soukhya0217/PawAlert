export interface EmailTemplateData {
  recipientName: string;
  actionUrl?: string;
  incidentId?: string;
  animalCategory?: string;
  locationAddress?: string;
  volunteerName?: string;
  customMessage?: string;
  token?: string;
  amount?: number;
  receiptNumber?: string;
  petName?: string;
  status?: string;
}

const BRAND_HEADER = `
  <div style="background: linear-gradient(135deg, #F75C2E 0%, #FF8E6E 50%, #8656DF 100%); padding: 32px 24px; text-align: center; border-radius: 16px 16px 0 0;">
    <div style="display: inline-block; background: #ffffff; padding: 10px 18px; border-radius: 9999px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <span style="font-size: 22px; font-weight: 800; color: #F75C2E; letter-spacing: -0.5px;">🐾 POWER ALERT</span>
    </div>
    <p style="color: #ffffff; font-size: 13px; font-weight: 600; margin: 0; letter-spacing: 0.5px; text-transform: uppercase;">Every Life Matters. Every Alert Counts.</p>
  </div>
`;

const BRAND_FOOTER = `
  <div style="background: #FAF7F2; padding: 24px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #E8E0D2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <p style="margin: 0 0 8px 0; color: #7D2411; font-size: 13px; font-weight: 600;">POWER ALERT Emergency Animal Rescue Network</p>
    <p style="margin: 0 0 12px 0; color: #887; font-size: 11px;">Dedicated to 24/7 rescue, veterinary care, daily feeding, and loving adoptions.</p>
    <div style="font-size: 11px; color: #999;">
      <a href="#" style="color: #F75C2E; text-decoration: none; margin: 0 8px;">Help Center</a> |
      <a href="#" style="color: #F75C2E; text-decoration: none; margin: 0 8px;">Rescue Protocol</a> |
      <a href="#" style="color: #F75C2E; text-decoration: none; margin: 0 8px;">Notification Settings</a>
    </div>
  </div>
`;

function wrapTemplate(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #F4EFE6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); overflow: hidden;">
    ${BRAND_HEADER}
    <div style="padding: 32px 28px; color: #2E2420; line-height: 1.6;">
      ${bodyContent}
    </div>
    ${BRAND_FOOTER}
  </div>
</body>
</html>
  `;
}

export function generateEmailHtml(templateName: string, data: EmailTemplateData): { subject: string; html: string } {
  const recipient = data.recipientName || "Friend";

  switch (templateName) {
    case "WELCOME":
      return {
        subject: "Welcome to POWER ALERT! Together, We Save Lives 🐾",
        html: wrapTemplate(
          "Welcome to POWER ALERT",
          `
          <h2 style="color: #F75C2E; margin-top: 0;">Welcome aboard, ${recipient}!</h2>
          <p>Thank you for joining <strong>POWER ALERT</strong>. Your registration empowers our community-wide guardian network to reach injured, abandoned, and distressed animals faster than ever.</p>
          <div style="background: #FFF7F4; border-left: 4px solid #F75C2E; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #7D2411; font-weight: 600;">What you can do right now:</p>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #554;">
              <li>Report animals in distress with 1-click GPS location</li>
              <li>Track live rescue updates and veterinary progress</li>
              <li>Apply to become a Verified Rescue or Medical Volunteer</li>
              <li>Support feeding zones or adopt rescued companions</li>
            </ul>
          </div>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl || '#'}" style="background: #F75C2E; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: 700; display: inline-block;">Open Your Dashboard</a>
          </p>
          `
        ),
      };

    case "EMAIL_VERIFICATION":
      return {
        subject: "Verify Your POWER ALERT Account",
        html: wrapTemplate(
          "Verify Your Email",
          `
          <h2 style="color: #8656DF; margin-top: 0;">Verify Your Email Address</h2>
          <p>Hi ${recipient}, please confirm your email address to activate your full reporting and volunteer capabilities.</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${data.actionUrl || '#'}" style="background: #8656DF; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 9999px; font-weight: 700; display: inline-block;">Verify Email Now</a>
          </p>
          <p style="font-size: 13px; color: #777;">If you did not sign up for POWER ALERT, you can safely disregard this message.</p>
          `
        ),
      };

    case "PASSWORD_RESET":
      return {
        subject: "Reset Your POWER ALERT Password",
        html: wrapTemplate(
          "Password Reset",
          `
          <h2 style="color: #F75C2E; margin-top: 0;">Password Reset Request</h2>
          <p>Hi ${recipient}, we received a request to reset the password for your account.</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${data.actionUrl || '#'}" style="background: #F75C2E; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 9999px; font-weight: 700; display: inline-block;">Reset Password</a>
          </p>
          <p style="font-size: 12px; color: #888;">This link will expire in 1 hour. If you did not make this request, your account is secure and you can ignore this email.</p>
          `
        ),
      };

    case "INCIDENT_REPORTED":
      return {
        subject: `🚨 Alert Received: ${data.animalCategory || "Animal"} Case #${data.incidentId}`,
        html: wrapTemplate(
          "Incident Report Submitted",
          `
          <h2 style="color: #F75C2E; margin-top: 0;">Rescue Alert Dispatched: #${data.incidentId}</h2>
          <p>Thank you ${recipient}, your report has been successfully registered and broadcasted to nearby emergency volunteers and partnering NGOs.</p>
          <div style="background: #FAF7F2; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid #E8E0D2;">
            <p style="margin: 4px 0;"><strong>Incident ID:</strong> <span style="color: #F75C2E; font-weight: 700;">${data.incidentId}</span></p>
            <p style="margin: 4px 0;"><strong>Animal Category:</strong> ${data.animalCategory || "Emergency Case"}</p>
            <p style="margin: 4px 0;"><strong>Reported Location:</strong> ${data.locationAddress || "GPS Coordinates Pinpointed"}</p>
          </div>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl || '#'}" style="background: #F75C2E; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: 700; display: inline-block;">Track Live Rescue Status</a>
          </p>
          `
        ),
      };

    case "VOLUNTEER_ASSIGNED":
      return {
        subject: `Volunteer Assigned: Case #${data.incidentId} is Being Rescued!`,
        html: wrapTemplate(
          "Volunteer Assigned",
          `
          <h2 style="color: #2FA372; margin-top: 0;">A Rescuer Took Responsibility! 🐾</h2>
          <p>Great news, ${recipient}! Rescuer <strong>${data.volunteerName || "A Verified Volunteer"}</strong> has officially accepted responsibility for case <strong>#${data.incidentId}</strong> and is mobilizing to the scene.</p>
          <div style="background: #EAF8F2; border-left: 4px solid #2FA372; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1E7552; font-weight: 600;">Status: Volunteer En Route to Site</p>
            <p style="margin: 6px 0 0 0; color: #333; font-size: 13px;">Estimated arrival coordinates have been shared with the field coordinator.</p>
          </div>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl || '#'}" style="background: #2FA372; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: 700; display: inline-block;">View Live Timeline</a>
          </p>
          `
        ),
      };

    case "ANIMAL_RESCUED":
      return {
        subject: `🎉 Animal Safely Rescued! Case #${data.incidentId}`,
        html: wrapTemplate(
          "Animal Safely Rescued",
          `
          <h2 style="color: #2FA372; margin-top: 0;">Safe and Sound! 💖</h2>
          <p>Hi ${recipient}, we are overjoyed to report that the animal from case <strong>#${data.incidentId}</strong> has been secured by the rescue team and is receiving immediate care.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl || '#'}" style="background: #2FA372; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: 700; display: inline-block;">See Rescue Proof & Updates</a>
          </p>
          `
        ),
      };

    case "CASE_RESOLVED":
      return {
        subject: `✅ Case Resolved: #${data.incidentId} - Mission Accomplished!`,
        html: wrapTemplate(
          "Case Resolved",
          `
          <h2 style="color: #2FA372; margin-top: 0;">Case Completed with Care</h2>
          <p>Hi ${recipient}, incident <strong>#${data.incidentId}</strong> has reached a successful resolution. Medical treatments, recovery monitoring, or shelter placement have been documented.</p>
          <p>Thank you for being the eyes and heart of animal welfare.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl || '#'}" style="background: #F75C2E; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: 700; display: inline-block;">Review Case Archive</a>
          </p>
          `
        ),
      };

    case "DONATION_CONFIRMATION":
      return {
        subject: `Receipt #${data.receiptNumber || 'REC-001'}: Thank You for Your Compassion! 🐾`,
        html: wrapTemplate(
          "Donation Receipt",
          `
          <h2 style="color: #F75C2E; margin-top: 0;">Thank You for Your Generosity!</h2>
          <p>Dear ${recipient}, your contribution of <strong>₹${data.amount || 500}</strong> directly fuels emergency veterinary surgeries, food rations, and ambulance rescues.</p>
          <div style="background: #FAF7F2; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px dashed #E8E0D2;">
            <p style="margin: 4px 0;"><strong>Official Receipt No:</strong> ${data.receiptNumber || "REC-2026-0001"}</p>
            <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${data.amount || 500}</p>
            <p style="margin: 4px 0;"><strong>Tax Exemption:</strong> Eligible under 80G</p>
          </div>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl || '#'}" style="background: #F75C2E; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: 700; display: inline-block;">Download Tax Receipt</a>
          </p>
          `
        ),
      };

    default:
      return {
        subject: `Update from POWER ALERT: ${data.incidentId || "Important Notice"}`,
        html: wrapTemplate(
          "POWER ALERT Notification",
          `
          <h2 style="color: #F75C2E; margin-top: 0;">Notification for ${recipient}</h2>
          <p>${data.customMessage || "You have an important update regarding an animal welfare alert in your area."}</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl || '#'}" style="background: #F75C2E; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: 700; display: inline-block;">Open POWER ALERT</a>
          </p>
          `
        ),
      };
  }
}
