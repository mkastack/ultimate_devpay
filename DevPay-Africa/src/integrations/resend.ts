import { toast } from "sonner";

// Retrieve Resend API Key from environment or fallback
const RESEND_API_KEY = 
  (typeof process !== "undefined" ? process.env.RESEND_API_KEY : "") ||
  (typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_RESEND_API_KEY : "") ||
  "re_GYNfXyGi_BaGuVD7ryhUHFRa5QZ1nuD1m";
const RESEND_API_URL = "https://api.resend.com/emails";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

// Base HTTP Sender
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  console.log(`[Resend Email Service] Sending email to: ${to} | Subject: "${subject}"`);
  
  if (!RESEND_API_KEY) {
    console.warn("[Resend Warning] No RESEND_API_KEY configured. Logging email body to console.");
    return { success: true, mock: true };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "DevPay Africa <hello@devpay.africa>",
        reply_to: "support@devpay.africa",
        to: [to],
        subject,
        html
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend API Error: ${errText}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Resend Error] Failed to dispatch transactional email:", err);
    return { success: false, error: err.message };
  }
}

// ==========================================
// DEVELOPER-FRIENDLY TRANSACTIONAL TEMPLATES
// ==========================================

/**
 * 1. Send Welcome Email
 */
export async function sendWelcomeEmail(email: string, fullName: string) {
  const subject = "Welcome to DevPay Africa! 🚀 Hired locally, paid globally.";
  const html = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="background-image: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; border-radius: 12px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">DevPay Africa</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Secure Escrow Payments for African Tech Talent</p>
      </div>
      <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
        <h2 style="font-size: 20px; font-weight: 700; margin-top: 0;">Welcome, ${fullName}!</h2>
        <p>We are absolutely thrilled to welcome you to DevPay Africa. Our mission is to connect top African developers with premier global projects and protect every agreement with secure escrow-guaranteed payments.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #7c3aed;">What is next?</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569;">
            <li style="margin-bottom: 6px;">Complete your professional developer profile</li>
            <li style="margin-bottom: 6px;">Verify your Mobile Money (MoMo) or Local Bank payment details</li>
            <li style="margin-bottom: 6px;">Browse active jobs and submit direct project proposals</li>
          </ul>
        </div>

        <a href="https://devpay.africa/login" style="display: inline-block; background-image: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; text-align: center;">Go to Workspace</a>
        
        <p style="margin-top: 30px; font-size: 13px; color: #64748b; border-t: 1px solid #f1f5f9; padding-top: 15px;">
          Have questions? Reply directly to this email or read our developer guides in the wallet dashboard.
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * 2. Send Job Match Alert Email
 */
export async function sendJobAlertEmail(email: string, devName: string, jobTitle: string, jobId: string) {
  const subject = `New Job Match: "${jobTitle}" on DevPay Africa 🚀`;
  const html = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="background-color: #7c3aed; color: white; padding: 20px; border-radius: 12px; font-weight: bold;">
        New Project Match Alert
      </div>
      <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
        <p>Hello ${devName},</p>
        <p>A new high-paying freelance project has been posted that matches your skills and background experience. Apply today to secure the contract!</p>
        
        <div style="border: 1px solid #7c3aed; background-color: #f5f3ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin: 0; font-size: 18px; color: #1e293b;">${jobTitle}</h3>
          <p style="font-size: 13px; color: #7c3aed; font-weight: bold; margin: 5px 0 0 0;">💰 Escrow Guaranteed Payout</p>
        </div>

        <a href="https://devpay.africa/jobs/${jobId}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Details & Apply</a>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * 3. Send Payment Escrow Confirmation Email
 */
export async function sendPaymentConfirmationEmail(email: string, name: string, amount: number, txId: string) {
  const subject = `Payment Confirmed: $${amount.toFixed(2)} Escrow Deposited 🔒`;
  const html = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 12px; font-weight: bold; text-align: center;">
        🔒 Escrow Payment Confirmed
      </div>
      <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
        <p>Hello ${name},</p>
        <p>This is to confirm that the client has successfully funded and deposited the milestone amount into our secure escrow vault. Work is officially authorized to begin!</p>
        
        <table style="width: 100%; font-size: 14px; margin: 20px 0; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Escrow Amount</td><td style="padding: 10px 0; font-weight: bold; text-align: right;">$${amount.toFixed(2)}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Transaction ID</td><td style="padding: 10px 0; font-family: monospace; font-size: 12px; text-align: right;">${txId}</td></tr>
          <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; color: #64748b;">Status</td><td style="padding: 10px 0; color: #10b981; font-weight: bold; text-align: right;">Secured in Escrow</td></tr>
        </table>

        <a href="https://devpay.africa/wallet" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Wallet Details</a>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * 4. Send Dispute Notification Email
 */
export async function sendDisputeNotificationEmail(email: string, name: string, jobTitle: string, reason: string) {
  const subject = `⚠️ Dispute Notification: "${jobTitle}"`;
  const html = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="background-color: #ef4444; color: white; padding: 20px; border-radius: 12px; font-weight: bold; text-align: center;">
        ⚠️ Contract Escrow Dispute Opened
      </div>
      <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
        <p>Hello ${name},</p>
        <p>A formal dispute has been submitted for a milestone payment under the contract for: <strong>"${jobTitle}"</strong>.</p>
        
        <div style="border: 1px solid #ef4444; background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px;">
          <strong>Dispute Reason:</strong> ${reason}
        </div>

        <p>Our dispute resolution team will review all submitted milestone deliverables and communication history. The dispute will be mediated and resolved within 48 hours.</p>

        <a href="https://devpay.africa/wallet" style="display: inline-block; background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Disputes Portal</a>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}
