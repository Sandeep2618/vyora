export interface SendWelcomeEmailOptions {
  to: string;
  name?: string;
  businessName?: string;
}

export interface SendStaffInviteEmailOptions {
  to: string;
  name: string;
  businessName: string;
  businessId?: string;
  inviterName?: string;
  role: string;
  tempPassword?: string;
  loginUrl?: string;
}

export interface SendPasswordResetEmailOptions {
  to: string;
  name?: string;
  otp: string;
}

export class MailService {
  private static get welcomeApiKey(): string {
    return process.env.RESEND_WELCOME_API_KEY || process.env.RESEND_API_KEY || '';
  }

  private static get inviteApiKey(): string {
    return process.env.RESEND_INVITE_API_KEY || process.env.RESEND_API_KEY || '';
  }

  private static get fromEmail(): string {
    return process.env.RESEND_FROM_EMAIL || 'Vyora <onboarding@resend.dev>';
  }

  private static get appUrl(): string {
    return process.env.APP_WEB_URL || 'https://vyora-mauve.vercel.app';
  }

  private static get loginUrl(): string {
    return process.env.APP_LOGIN_URL || 'https://vyora-mauve.vercel.app/login';
  }

  /**
   * Send Welcome Email when a user installs/opens the app or registers for the first time.
   */
  static async sendWelcomeEmail(options: SendWelcomeEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    const { to, name = 'Valued Partner', businessName } = options;
    if (!to || !to.includes('@') || to.endsWith('@vyora.in')) {
      console.warn(`[MailService] Skipping welcome email for synthetic or invalid address: ${to}`);
      return { success: false, error: 'Invalid or dummy recipient email' };
    }

    const subject = `Welcome to Vyora — Your All-in-One Business Billing & GST Platform`;
    const html = this.buildWelcomeTemplate({ name, businessName, appUrl: this.appUrl });

    return this.sendWithResend(this.welcomeApiKey, {
      from: this.fromEmail,
      to,
      subject,
      html,
    });
  }

  /**
   * Send Staff Invitation Email when an owner adds staff or invites a member.
   */
  static async sendStaffInviteEmail(
    options: SendStaffInviteEmailOptions,
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const {
      to,
      name,
      businessName,
      inviterName = 'The Business Owner',
      role,
      tempPassword,
      loginUrl = this.loginUrl,
    } = options;

    if (!to || !to.includes('@') || to.endsWith('@vyora.in')) {
      console.warn(`[MailService] Skipping staff invite email for synthetic or invalid address: ${to}`);
      return { success: false, error: 'Invalid or dummy recipient email' };
    }

    const formattedRole =
      role === 'OWNER'
        ? 'Business Owner'
        : role === 'ADMIN'
        ? 'Store Manager (Admin)'
        : 'Billing Counter Staff';

    const targetLoginUrl =
      options.loginUrl ||
      `${this.loginUrl}?inviteBiz=${encodeURIComponent(options.businessId || '')}&email=${encodeURIComponent(to)}`;
    const appDeepLink = `vyora://invite?biz=${encodeURIComponent(options.businessId || '')}&email=${encodeURIComponent(to)}`;

    const subject = `You've been invited to join ${businessName} on Vyora`;
    const html = this.buildInviteTemplate({
      name,
      businessName,
      inviterName,
      role: formattedRole,
      tempPassword,
      email: to,
      loginUrl: targetLoginUrl,
      appDeepLink,
    });

    return this.sendWithResend(this.inviteApiKey, {
      from: this.fromEmail,
      to,
      subject,
      html,
    });
  }

  /**
   * Send Password Reset OTP Email
   */
  static async sendPasswordResetEmail(
    options: SendPasswordResetEmailOptions,
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const { to, name = 'User', otp } = options;
    if (!to || !to.includes('@') || to.endsWith('@vyora.in')) {
      console.warn(`[MailService] Skipping password reset email for invalid address: ${to}`);
      return { success: false, error: 'Invalid recipient email' };
    }

    const subject = `Your Vyora Password Reset Code: ${otp}`;
    const html = this.buildPasswordResetTemplate({ name, otp });

    return this.sendWithResend(this.welcomeApiKey, {
      from: this.fromEmail,
      to,
      subject,
      html,
    });
  }

  private static async sendWithResend(
    apiKey: string,
    payload: { from: string; to: string; subject: string; html: string },
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      if (!apiKey) {
        console.warn(
          `[MailService] Skipping email dispatch to ${payload.to}: RESEND API key is not configured in environment.`,
        );
        return { success: false, error: 'Resend API key not configured' };
      }

      console.log(`[MailService] Dispatching email via Resend to ${payload.to}: "${payload.subject}"`);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: payload.from,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(
          `[MailService] Resend API error (${response.status}): ${JSON.stringify(data)}`,
        );
        return {
          success: false,
          error: (data as any)?.message || `HTTP ${response.status}`,
        };
      }

      console.log(`[MailService] Email successfully dispatched via Resend. Message ID: ${(data as any)?.id}`);
      return { success: true, id: (data as any)?.id };
    } catch (err: any) {
      console.error(`[MailService] Exception while calling Resend API: ${err?.message || err}`);
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  private static buildWelcomeTemplate(params: { name: string; businessName?: string; appUrl: string }): string {
    const greeting = params.name ? `Hi ${this.escapeHtml(params.name)},` : 'Hello,';
    const bizMention = params.businessName
      ? ` for <strong>${this.escapeHtml(params.businessName)}</strong>`
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Vyora</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F8F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#123B3A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F4F8F7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,118,110,0.08);border:1px solid #D7E5E2;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #0F766E 0%, #123B3A 100%);padding:36px 32px;text-align:center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);padding:10px 20px;border-radius:12px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.25);">
                      <span style="font-size:24px;font-weight:900;letter-spacing:1px;color:#FFFFFF;text-transform:uppercase;">VYORA</span>
                    </div>
                    <h1 style="color:#FFFFFF;font-size:22px;font-weight:700;margin:8px 0 0;line-height:1.3;">Welcome to Modern GST Billing & Inventory</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="font-size:16px;line-height:1.6;color:#123B3A;margin:0 0 16px;">
                ${greeting}
              </p>
              <p style="font-size:15px;line-height:1.6;color:#566B69;margin:0 0 24px;">
                Thank you for setting up your business workspace${bizMention}! Vyora gives you complete command over counter sales billing, inventory tracking, GST compliance, and debtor party ledgers.
              </p>

              <!-- Feature Highlights Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F4F8F7;border-radius:12px;border:1px solid #D7E5E2;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px;">
                    <div style="font-size:13px;font-weight:700;text-transform:uppercase;color:#0F766E;letter-spacing:0.5px;margin-bottom:12px;">What you can do right away:</div>
                    
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="24" valign="top" style="padding-bottom:10px;color:#0F766E;font-size:16px;">✓</td>
                        <td style="padding-bottom:10px;font-size:14px;color:#123B3A;line-height:1.4;">
                          <strong>Fast 30-Second GST Invoices:</strong> Create GST and non-GST bills with automated tax calculations and WhatsApp sharing.
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top" style="padding-bottom:10px;color:#0F766E;font-size:16px;">✓</td>
                        <td style="padding-bottom:10px;font-size:14px;color:#123B3A;line-height:1.4;">
                          <strong>Live Stock Tracking:</strong> Receive low stock warnings and manage inward purchases seamlessly.
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top" style="padding-bottom:10px;color:#0F766E;font-size:16px;">✓</td>
                        <td style="padding-bottom:10px;font-size:14px;color:#123B3A;line-height:1.4;">
                          <strong>Instant UPI QR & Ledger:</strong> Print Bharat UPI dynamic QR codes on bills to collect dues faster.
                        </td>
                      </tr>
                      <tr>
                        <td width="24" valign="top" style="color:#0F766E;font-size:16px;">✓</td>
                        <td style="font-size:14px;color:#123B3A;line-height:1.4;">
                          <strong>Multi-Device Sync:</strong> Access your business anywhere from the Web Dashboard or Android/iOS Mobile App.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${params.appUrl}" target="_blank" style="display:inline-block;background-color:#0F766E;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;box-shadow:0 4px 14px rgba(15,118,110,0.3);letter-spacing:0.2px;">
                      Launch Vyora Workspace →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;line-height:1.5;color:#566B69;margin:0;">
                Need help getting started or importing your items? Our support team is ready on WhatsApp or email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F4F8F7;border-top:1px solid #D7E5E2;padding:24px 32px;text-align:center;">
              <p style="font-size:12px;color:#566B69;margin:0 0 6px;">
                <strong>Vyora Billing & Inventory Platform</strong>
              </p>
              <p style="font-size:12px;color:#566B69;margin:0 0 6px;">
                Ahmedabad, Gujarat, India • WhatsApp Support: +91 83199 69143 • Email: sandeep26062004@gmail.com
              </p>
              <p style="font-size:11px;color:#94A3B8;margin:8px 0 0;">
                You received this email because you registered or installed the Vyora billing app.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private static buildInviteTemplate(params: {
    name: string;
    businessName: string;
    inviterName: string;
    role: string;
    email: string;
    loginUrl: string;
    appDeepLink?: string;
    tempPassword?: string;
  }): string {
    const greeting = params.name ? `Hi ${this.escapeHtml(params.name)},` : 'Hello,';

    const tempPasswordRow = params.tempPassword
      ? `<tr>
          <td style="padding:8px 0;font-size:13px;color:#566B69;">Temporary Password:</td>
          <td style="padding:8px 0;font-size:13px;font-weight:700;color:#0F766E;text-align:right;font-family:monospace;">
            ${this.escapeHtml(params.tempPassword)}
          </td>
        </tr>`
      : '';

    const mobileDeepLinkButton = params.appDeepLink
      ? `<div style="margin-top:14px;text-align:center;">
          <a href="${params.appDeepLink}" style="display:inline-block;padding:10px 20px;border-radius:8px;background:#E6F4F2;color:#0F766E;font-size:13px;font-weight:700;text-decoration:none;border:1px solid #D7E5E2;">
            📱 Open directly in Vyora Mobile App →
          </a>
        </div>`
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vyora Workspace Invitation</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F8F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#123B3A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F4F8F7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,118,110,0.08);border:1px solid #D7E5E2;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #0F766E 0%, #123B3A 100%);padding:36px 32px;text-align:center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);padding:10px 20px;border-radius:12px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.25);">
                      <span style="font-size:24px;font-weight:900;letter-spacing:1px;color:#FFFFFF;text-transform:uppercase;">VYORA</span>
                    </div>
                    <h1 style="color:#FFFFFF;font-size:22px;font-weight:700;margin:8px 0 0;line-height:1.3;">Staff Workspace Invitation</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="font-size:16px;line-height:1.6;color:#123B3A;margin:0 0 16px;">
                ${greeting}
              </p>
              <p style="font-size:15px;line-height:1.6;color:#566B69;margin:0 0 24px;">
                <strong>${this.escapeHtml(params.inviterName)}</strong> has invited you to join their business workspace on Vyora.
              </p>

              <!-- Invitation Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F4F8F7;border-radius:12px;border:1px solid #D7E5E2;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:8px 0;font-size:13px;color:#566B69;border-bottom:1px solid #D7E5E2;">Business:</td>
                        <td style="padding:8px 0;font-size:13px;font-weight:700;color:#123B3A;text-align:right;border-bottom:1px solid #D7E5E2;">
                          ${this.escapeHtml(params.businessName)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:13px;color:#566B69;border-bottom:1px solid #D7E5E2;">Assigned Role:</td>
                        <td style="padding:8px 0;font-size:13px;font-weight:700;color:#0F766E;text-align:right;border-bottom:1px solid #D7E5E2;">
                          ${this.escapeHtml(params.role)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:13px;color:#566B69;${params.tempPassword ? 'border-bottom:1px solid #D7E5E2;' : ''}">Your Login Email:</td>
                        <td style="padding:8px 0;font-size:13px;font-weight:600;color:#123B3A;text-align:right;${params.tempPassword ? 'border-bottom:1px solid #D7E5E2;' : ''}">
                          ${this.escapeHtml(params.email)}
                        </td>
                      </tr>
                      ${tempPasswordRow}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td align="center">
                    <a href="${params.loginUrl}" target="_blank" style="display:inline-block;background-color:#0F766E;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:14px 34px;border-radius:10px;box-shadow:0 4px 14px rgba(15,118,110,0.3);letter-spacing:0.2px;">
                      Accept Invitation &amp; Log In →
                    </a>
                  </td>
                </tr>
              </table>

              ${mobileDeepLinkButton}

              <p style="font-size:13px;line-height:1.5;color:#566B69;margin:18px 0 0;text-align:center;">
                Click the button above to go straight to our login page (${this.escapeHtml(params.loginUrl)}).
                ${params.tempPassword ? 'For your security, please update your temporary password after logging in.' : 'Use your existing password to log in.'}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F4F8F7;border-top:1px solid #D7E5E2;padding:24px 32px;text-align:center;">
              <p style="font-size:12px;color:#566B69;margin:0 0 6px;">
                <strong>Vyora Billing & Inventory Platform</strong>
              </p>
              <p style="font-size:12px;color:#566B69;margin:0 0 6px;">
                Ahmedabad, Gujarat, India • WhatsApp Support: +91 83199 69143 • Email: sandeep26062004@gmail.com
              </p>
              <p style="font-size:11px;color:#94A3B8;margin:8px 0 0;">
                If you were not expecting this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private static buildPasswordResetTemplate(params: { name: string; otp: string }): string {
    const greeting = params.name ? `Hi ${this.escapeHtml(params.name)},` : 'Hello,';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F8F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#123B3A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F4F8F7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:540px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(15,118,110,0.08);border:1px solid #D7E5E2;">
          <tr>
            <td style="background:#0F766E;padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#FFFFFF;font-size:24px;font-weight:700;letter-spacing:0.5px;">Vyora Cloud</h1>
              <p style="margin:4px 0 0 0;color:#E6F4F2;font-size:13px;">Security & Password Recovery</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#123B3A;">${greeting}</p>
              <p style="margin:0 0 20px;font-size:14px;color:#566B69;line-height:1.6;">
                We received a request to reset the password for your Vyora account. Use the 6-digit verification code below to complete the reset:
              </p>
              <div style="text-align:center;margin:28px 0;padding:20px;background:#E6F4F2;border-radius:12px;border:1.5px dashed #0F766E;">
                <span style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0F766E;font-family:monospace;">${params.otp}</span>
              </div>
              <p style="margin:0 0 12px;font-size:13px;color:#566B69;line-height:1.5;">
                ⏱️ <strong>This code is valid for 15 minutes.</strong> Never share this code with anyone.
              </p>
              <p style="margin:0 0 24px;font-size:12px;color:#8CA4A0;line-height:1.5;">
                If you did not request this password reset, please ignore this email or review your account security.
              </p>
              <hr style="border:none;border-top:1px solid #D7E5E2;margin:24px 0;" />
              <p style="margin:0;font-size:11px;color:#8CA4A0;text-align:center;">
                © 2026 Vyora Cloud Technologies. Secure Multi-Tenant GST & Billing Infrastructure.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
