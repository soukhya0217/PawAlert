export interface EmailTemplateData {
  recipientName: string;
  actionUrl?: string;
  incidentId?: string;
  animalCategory?: string;
  conditionDescription?: string;
  locationAddress?: string;
  submissionDate?: string;
  loginTime?: string;
  previousStatus?: string;
  newStatus?: string;
  adminRemarks?: string;
  priority?: string;
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  volunteerName?: string;
  customMessage?: string;
  token?: string;
  amount?: number;
  receiptNumber?: string;
  status?: string;
}

const BRAND_HEADER = `
  <div style="background: linear-gradient(135deg, #1E1B4B 0%, #2D1B69 50%, #FF7A00 100%); padding: 36px 24px; text-align: center; border-radius: 20px 20px 0 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
      <tr>
        <td style="background: #FFF9F0; border: 3px solid #1E1B4B; border-radius: 9999px; padding: 10px 24px; box-shadow: 0 4px 0 #1E1B4B;">
          <span style="font-size: 22px; font-weight: 900; color: #1E1B4B; letter-spacing: -0.5px; font-family: 'Segoe UI', Roboto, sans-serif;">
            🐾 Paw<span style="color: #FF7A00;">Alert</span>
          </span>
        </td>
      </tr>
    </table>
    <p style="color: #FFF9F0; font-size: 13px; font-weight: 700; margin: 14px 0 0 0; letter-spacing: 0.5px; text-transform: uppercase; font-family: 'Segoe UI', Roboto, sans-serif;">
      Because Every Paw Matters • 24/7 Animal Rescue Dispatch
    </p>
  </div>
`;

const BRAND_FOOTER = `
  <div style="background: #FFF1DC; padding: 26px 24px; text-align: center; border-radius: 0 0 20px 20px; border-top: 2px solid #1E1B4B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <p style="margin: 0 0 8px 0; color: #1E1B4B; font-size: 13px; font-weight: 800;">
      PawAlert Emergency Animal Rescue Network
    </p>
    <p style="margin: 0 0 14px 0; color: #4B4668; font-size: 12px; line-height: 1.5;">
      Together, we protect community animals, coordinate rapid emergency response, and ensure every injured animal finds healing.
    </p>
    <div style="font-size: 11px; color: #6B6580;">
      <a href="https://pawalert.org" style="color: #FF7A00; text-decoration: none; font-weight: 700; margin: 0 8px;">Sanctuary Portal</a> •
      <a href="mailto:soukhyahegde02gmail@gmail.com" style="color: #FF7A00; text-decoration: none; font-weight: 700; margin: 0 8px;">Contact Support</a> •
      <a href="#" style="color: #6B6580; text-decoration: none; margin: 0 8px;">Notification Settings</a>
    </div>
    <p style="margin: 14px 0 0 0; font-size: 10px; color: #9A94AA;">
      &copy; ${new Date().getFullYear()} PawAlert Dispatch Network. All rights reserved.
    </p>
  </div>
`;

function wrapTemplate(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #FFF9F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 3px solid #1E1B4B; box-shadow: 0 10px 0 #1E1B4B; overflow: hidden;">
    ${BRAND_HEADER}
    <div style="padding: 36px 32px; color: #1E1B4B; line-height: 1.6; font-size: 14px;">
      ${bodyContent}
    </div>
    ${BRAND_FOOTER}
  </div>
</body>
</html>`;
}

// Format human-friendly statuses
export function formatFriendlyStatus(status?: string): string {
  if (!status) return "Pending Dispatch";
  switch (status.toUpperCase()) {
    case "REPORTED":
      return "Pending";
    case "VERIFICATION_PENDING":
    case "UNDER_REVIEW":
      return "Under Review";
    case "VERIFIED":
      return "Verified";
    case "VOLUNTEER_ASSIGNED":
    case "ASSIGNED":
      return "Assigned";
    case "VOLUNTEER_EN_ROUTE":
    case "VOLUNTEER_REACHED":
    case "RESCUE_IN_PROGRESS":
    case "IN_PROGRESS":
      return "In Progress";
    case "ANIMAL_RESCUED":
      return "Animal Rescued";
    case "TREATMENT_STARTED":
      return "In Treatment";
    case "RECOVERY_MONITORING":
      return "In Recovery";
    case "RESOLVED":
      return "Resolved";
    case "REJECTED":
    case "UNABLE_TO_COMPLETE":
      return "Rejected";
    default:
      return status.replace(/_/g, " ");
  }
}

export function generateEmailHtml(
  templateName: string,
  data: EmailTemplateData
): { subject: string; html: string } {
  const recipient = data.recipientName || "Animal Guardian";
  const nowFormatted = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  switch (templateName) {
    // -------------------------------------------------------------
    // 1. USER REGISTRATION EMAIL
    // -------------------------------------------------------------
    case "WELCOME":
      return {
        subject: "Welcome to PawAlert – Together for Animal Welfare!",
        html: wrapTemplate(
          "Welcome to PawAlert",
          `
          <h2 style="color: #1E1B4B; margin-top: 0; font-size: 22px; font-weight: 800;">
            Welcome to the PawAlert Family, ${recipient}! 🐾
          </h2>
          <p style="font-size: 15px; color: #373356;">
            Thank you for joining <strong>PawAlert</strong>! You are now part of a dedicated community of animal lovers, first responders, and veterinarians working tirelessly to give every distressed animal a voice.
          </p>
          
          <div style="background: #FFF9F0; border: 2px solid #1E1B4B; border-radius: 14px; padding: 20px; margin: 24px 0; box-shadow: 0 4px 0 #1E1B4B;">
            <p style="margin: 0 0 10px 0; color: #FF7A00; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
              🌟 How PawAlert Works:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #1E1B4B; font-size: 13px; line-height: 1.8;">
              <li><strong>Spot & Report:</strong> Log injured or abandoned animals in under 30 seconds with 1-click GPS.</li>
              <li><strong>Instant Dispatch:</strong> Our system coordinates nearby verified volunteers and rescue squads.</li>
              <li><strong>Track Milestones:</strong> Follow live updates from rescue to medical recovery.</li>
              <li><strong>Sanctuary & Adoptions:</strong> Support community feeding points and help rescued pets find forever homes.</li>
            </ul>
          </div>

          <p style="text-align: center; margin: 32px 0 16px 0;">
            <a href="${data.actionUrl || "http://localhost:3000/user/dashboard"}" 
               style="background: linear-gradient(135deg, #FF7A00 0%, #F97316 100%); color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: 800; font-size: 14px; display: inline-block; border: 2px solid #1E1B4B; box-shadow: 0 4px 0 #1E1B4B;">
              Explore Guardian Dashboard →
            </a>
          </p>
          <p style="font-size: 12px; text-align: center; color: #6B6580; margin: 0;">
            Every life matters. Every alert counts.
          </p>
          `
        ),
      };

    // -------------------------------------------------------------
    // 2. USER LOGIN EMAIL
    // -------------------------------------------------------------
    case "LOGIN_NOTIFICATION":
      return {
        subject: "PawAlert – Successful Login Notification",
        html: wrapTemplate(
          "Login Notification",
          `
          <h2 style="color: #1E1B4B; margin-top: 0; font-size: 20px; font-weight: 800;">
            Hello, ${recipient}! 👋
          </h2>
          <p style="font-size: 14px; color: #373356;">
            You have successfully logged in to your <strong>PawAlert</strong> account.
          </p>

          <div style="background: #FFF1DC; border: 2px solid #1E1B4B; border-radius: 14px; padding: 18px; margin: 22px 0; box-shadow: 0 4px 0 #1E1B4B;">
            <table role="presentation" cellpadding="4" cellspacing="0" style="width: 100%; font-size: 13px; color: #1E1B4B;">
              <tr>
                <td style="font-weight: 700; width: 38%;">Account:</td>
                <td>${recipient}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Login Timestamp:</td>
                <td><strong style="color: #FF7A00;">${data.loginTime || nowFormatted}</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Status:</td>
                <td><span style="display: inline-block; background: #10B981; color: white; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 11px;">Active Session</span></td>
              </tr>
            </table>
          </div>

          <div style="background: #F8F9FA; border-left: 4px solid #1E1B4B; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #555;">
            <strong>Security Notice:</strong> If this login was authorized by you, no action is needed. If you did not log in, please 
            <a href="${data.actionUrl || "http://localhost:3000/forgot-password"}" style="color: #EF4444; font-weight: 700; text-decoration: underline;">reset your password immediately</a> to secure your account.
          </div>
          `
        ),
      };

    // -------------------------------------------------------------
    // 3. ANIMAL REPORT SUBMISSION EMAIL (Reporter)
    // -------------------------------------------------------------
    case "REPORT_SUBMITTED":
    case "INCIDENT_REPORTED":
      return {
        subject: "Your Animal Report Has Been Successfully Submitted – PawAlert",
        html: wrapTemplate(
          "Animal Report Received",
          `
          <h2 style="color: #1E1B4B; margin-top: 0; font-size: 22px; font-weight: 800;">
            Thank You for Being Their Voice, ${recipient}! 🐾
          </h2>
          <p style="font-size: 14px; color: #373356;">
            Your emergency animal report has been received and registered into our central dispatch grid. Nearby verified rescue squads and partner veterinarians are being mobilized.
          </p>

          <div style="background: #FFF9F0; border: 2px solid #1E1B4B; border-radius: 16px; padding: 22px; margin: 24px 0; box-shadow: 0 5px 0 #1E1B4B;">
            <div style="border-bottom: 2px solid #1E1B4B; padding-bottom: 10px; margin-bottom: 12px;">
              <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6B6580;">Tracking Identifier</span>
              <div style="font-size: 20px; font-weight: 900; color: #FF7A00; font-family: monospace;">
                #${data.incidentId || "PA-2026-PENDING"}
              </div>
            </div>

            <table role="presentation" cellpadding="5" cellspacing="0" style="width: 100%; font-size: 13px; color: #1E1B4B;">
              <tr>
                <td style="font-weight: 700; width: 35%;">Animal Category:</td>
                <td><strong>${data.animalCategory || "Animal in Need"}</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Reported Condition:</td>
                <td>${data.conditionDescription || "Physical distress or emergency"}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Location Pin:</td>
                <td>📍 ${data.locationAddress || "GPS Coordinates Pinpointed"}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Date & Time:</td>
                <td>${data.submissionDate || nowFormatted}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Initial Status:</td>
                <td>
                  <span style="background: #FFB703; color: #1E1B4B; border: 1.5px solid #1E1B4B; padding: 2px 10px; border-radius: 8px; font-weight: 800; font-size: 11px;">
                    ${formatFriendlyStatus(data.status || "REPORTED")}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <p style="text-align: center; margin: 30px 0 16px 0;">
            <a href="${data.actionUrl || `http://localhost:3000/track/${data.incidentId}`}" 
               style="background: linear-gradient(135deg, #FF7A00 0%, #F97316 100%); color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: 800; font-size: 14px; display: inline-block; border: 2px solid #1E1B4B; box-shadow: 0 4px 0 #1E1B4B;">
              Track Live Rescue Progress →
            </a>
          </p>

          <p style="font-size: 13px; color: #4B4668; text-align: center;">
            Thank you for caring and acting quickly. You may receive automated notifications as rescuers mobilize.
          </p>
          `
        ),
      };

    // -------------------------------------------------------------
    // 4. ADMIN NOTIFICATION EMAIL
    // -------------------------------------------------------------
    case "ADMIN_NEW_REPORT":
      const isCritical = data.priority === "CRITICAL";
      return {
        subject: `🚨 New Animal Distress Report Submitted: Case #${data.incidentId || "PA-2026"}`,
        html: wrapTemplate(
          "Admin Emergency Alert",
          `
          <div style="background: ${isCritical ? "#EF4444" : "#FF7A00"}; color: white; padding: 8px 16px; border-radius: 8px; font-weight: 800; font-size: 12px; display: inline-block; margin-bottom: 16px; text-transform: uppercase;">
            ${isCritical ? "⚠️ CRITICAL PRIORITY DISPATCH" : "📢 NEW INCOMING ALERT"}
          </div>

          <h2 style="color: #1E1B4B; margin-top: 0; font-size: 22px; font-weight: 800;">
            New Rescue Incident Logged: #${data.incidentId}
          </h2>
          <p style="font-size: 14px; color: #373356;">
            An urgent animal distress report has just been submitted and requires administrative review or volunteer dispatch.
          </p>

          <div style="background: #FFF9F0; border: 2px solid #1E1B4B; border-radius: 16px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 0 #1E1B4B;">
            <table role="presentation" cellpadding="5" cellspacing="0" style="width: 100%; font-size: 13px; color: #1E1B4B;">
              <tr>
                <td style="font-weight: 700; width: 35%;">Report ID:</td>
                <td><strong style="color: #FF7A00; font-family: monospace;">#${data.incidentId}</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Priority Level:</td>
                <td>
                  <span style="background: ${isCritical ? "#EF4444" : "#FFB703"}; color: ${isCritical ? "white" : "#1E1B4B"}; padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 11px;">
                    ${data.priority || "HIGH"}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Animal Category:</td>
                <td><strong>${data.animalCategory || "Unspecified"}</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Condition:</td>
                <td>${data.conditionDescription || "Distress report"}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Location:</td>
                <td>📍 ${data.locationAddress || "Pinpointed on Map"}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Reporter:</td>
                <td>${data.reporterName || "Anonymous Guardian"} ${data.reporterPhone ? `(${data.reporterPhone})` : ""}</td>
              </tr>
              ${data.reporterEmail ? `
              <tr>
                <td style="font-weight: 700;">Reporter Email:</td>
                <td>${data.reporterEmail}</td>
              </tr>` : ""}
              <tr>
                <td style="font-weight: 700;">Submitted At:</td>
                <td>${data.submissionDate || nowFormatted}</td>
              </tr>
            </table>
          </div>

          <p style="text-align: center; margin: 30px 0 10px 0;">
            <a href="${data.actionUrl || "http://localhost:3000/admin/incidents"}" 
               style="background: #1E1B4B; color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: 800; font-size: 14px; display: inline-block; border: 2px solid #1E1B4B; box-shadow: 0 4px 0 #FF7A00;">
              Open Admin Dispatch Dashboard →
            </a>
          </p>
          `
        ),
      };

    // -------------------------------------------------------------
    // 5. REPORT STATUS UPDATE EMAIL
    // -------------------------------------------------------------
    case "STATUS_UPDATE":
      const friendlyPrev = formatFriendlyStatus(data.previousStatus);
      const friendlyNew = formatFriendlyStatus(data.newStatus);
      return {
        subject: "PawAlert – Your Animal Report Status Has Been Updated",
        html: wrapTemplate(
          "Report Status Updated",
          `
          <h2 style="color: #1E1B4B; margin-top: 0; font-size: 22px; font-weight: 800;">
            Rescue Progress Update, ${recipient}! 🐾
          </h2>
          <p style="font-size: 14px; color: #373356;">
            There is a new update regarding your animal distress report <strong>#${data.incidentId}</strong>.
          </p>

          <div style="background: #FFF9F0; border: 2px solid #1E1B4B; border-radius: 16px; padding: 22px; margin: 22px 0; box-shadow: 0 5px 0 #1E1B4B;">
            <table role="presentation" cellpadding="5" cellspacing="0" style="width: 100%; font-size: 13px; color: #1E1B4B;">
              <tr>
                <td style="font-weight: 700; width: 35%;">Report ID:</td>
                <td><strong style="color: #FF7A00; font-family: monospace;">#${data.incidentId}</strong></td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Animal Category:</td>
                <td>${data.animalCategory || "Animal"}</td>
              </tr>
              <tr>
                <td style="font-weight: 700;">Previous Status:</td>
                <td><span style="color: #6B6580; text-decoration: line-through;">${friendlyPrev}</span></td>
              </tr>
              <tr>
                <td style="font-weight: 700;">New Status:</td>
                <td>
                  <span style="background: #10B981; color: white; padding: 3px 10px; border-radius: 8px; font-weight: 800; font-size: 12px; display: inline-block;">
                    ${friendlyNew}
                  </span>
                </td>
              </tr>
              ${data.adminRemarks ? `
              <tr>
                <td style="font-weight: 700; vertical-align: top;">Admin Remarks:</td>
                <td style="background: #FFF1DC; padding: 8px 12px; border-radius: 8px; font-style: italic; border: 1px solid #1E1B4B;">
                  "${data.adminRemarks}"
                </td>
              </tr>` : ""}
            </table>
          </div>

          <p style="text-align: center; margin: 30px 0 16px 0;">
            <a href="${data.actionUrl || `http://localhost:3000/track/${data.incidentId}`}" 
               style="background: linear-gradient(135deg, #FF7A00 0%, #F97316 100%); color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: 800; font-size: 14px; display: inline-block; border: 2px solid #1E1B4B; box-shadow: 0 4px 0 #1E1B4B;">
              View Updated Report Details →
            </a>
          </p>

          <p style="font-size: 12px; color: #6B6580; text-align: center;">
            Thank you for being part of our rescue network.
          </p>
          `
        ),
      };

    // -------------------------------------------------------------
    // Backward Compatibility Templates
    // -------------------------------------------------------------
    case "PASSWORD_RESET":
      return {
        subject: "Reset Your PawAlert Password",
        html: wrapTemplate(
          "Password Reset",
          `
          <h2 style="color: #1E1B4B; margin-top: 0; font-size: 20px; font-weight: 800;">
            Password Reset Request
          </h2>
          <p style="font-size: 14px; color: #373356;">
            Hi ${recipient}, we received a request to reset your PawAlert password.
          </p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${data.actionUrl || "http://localhost:3000/reset-password"}" 
               style="background: #FF7A00; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 9999px; font-weight: 800; display: inline-block; border: 2px solid #1E1B4B; box-shadow: 0 4px 0 #1E1B4B;">
              Reset Password
            </a>
          </p>
          <p style="font-size: 12px; color: #6B6580;">
            This link is valid for 1 hour. If you did not make this request, your account remains secure and no action is required.
          </p>
          `
        ),
      };

    case "DONATION_CONFIRMATION":
      return {
        subject: `Receipt #${data.receiptNumber || "REC-001"}: Thank You for Your Compassion! 🐾`,
        html: wrapTemplate(
          "Donation Receipt",
          `
          <h2 style="color: #1E1B4B; margin-top: 0; font-size: 20px; font-weight: 800;">
            Thank You for Empowering Rescues! 💖
          </h2>
          <p style="font-size: 14px; color: #373356;">
            Dear ${recipient}, your donation of <strong>₹${data.amount || 500}</strong> directly funds emergency surgeries, medications, and ambulance fuel.
          </p>
          <div style="background: #FFF9F0; border: 2px dashed #1E1B4B; border-radius: 12px; padding: 18px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Receipt Number:</strong> ${data.receiptNumber || "REC-2026-0001"}</p>
            <p style="margin: 4px 0;"><strong>Amount:</strong> ₹${data.amount || 500}</p>
            <p style="margin: 4px 0;"><strong>Eligible Tax Exemption:</strong> 80G Certificate</p>
          </div>
          `
        ),
      };

    default:
      return {
        subject: `Update from PawAlert: ${data.incidentId || "Notification"}`,
        html: wrapTemplate(
          "PawAlert Notification",
          `
          <h2 style="color: #1E1B4B; margin-top: 0; font-size: 20px; font-weight: 800;">
            Hello, ${recipient}
          </h2>
          <p style="font-size: 14px; color: #373356;">
            ${data.customMessage || "You have a new update regarding an animal welfare alert in your area."}
          </p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.actionUrl || "http://localhost:3000"}" 
               style="background: #FF7A00; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 9999px; font-weight: 800; display: inline-block; border: 2px solid #1E1B4B; box-shadow: 0 4px 0 #1E1B4B;">
              Open PawAlert →
            </a>
          </p>
          `
        ),
      };
  }
}
