import { Resend } from 'resend';
import User, { IUser } from '../models/User';

// Resend client - falls back to console log in development
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM || 'QuantWealth AI <noreply@quantwealth.ai>';

export class OTPService {
  private static generateOTP(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private static getExpiryTime(): Date {
    // OTP valid for 10 minutes
    return new Date(Date.now() + 10 * 60 * 1000);
  }

  static async generateAndSendEmailOTP(user: IUser): Promise<void> {
    const otp = this.generateOTP();
    const expiresAt = this.getExpiryTime();

    // Save OTP to user
    user.otp = {
      code: otp,
      expiresAt,
      type: 'email'
    };
    await user.save();

    // In development without API key, just log to console
    if (!resend) {
      console.log(`\n📧 [DEV MODE] OTP Email would be sent to: ${user.email}`);
      console.log(`🔑 OTP Code: ${otp}`);
      console.log(`⏰ Expires at: ${expiresAt.toISOString()}\n`);
      return;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - QuantWealth AI</title>
      </head>
      <body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,-apple-system,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#12121a;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
                    <h1 style="color:white;font-size:24px;font-weight:700;margin:0;letter-spacing:-0.5px;">QuantWealth AI</h1>
                    <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:8px 0 0;">AI-Powered Trading Platform</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px 32px;">
                    <h2 style="color:#ffffff;font-size:20px;font-weight:600;margin:0 0 12px;">Verify Your Email</h2>
                    <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 28px;">Hello ${user.firstName}, use the code below to verify your email address. It expires in 10 minutes.</p>
                    <!-- OTP Box -->
                    <div style="background:#1a1a25;border:1px solid rgba(99,102,241,0.4);border-radius:12px;padding:28px;text-align:center;margin:0 0 28px;">
                      <p style="color:#71717a;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Your Verification Code</p>
                      <div style="color:#6366f1;font-size:40px;font-weight:700;letter-spacing:12px;font-family:monospace;">${otp}</div>
                    </div>
                    <p style="color:#52525b;font-size:13px;line-height:1.6;margin:0;">If you did not request this code, please ignore this email. Never share this code with anyone.</p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                    <p style="color:#52525b;font-size:12px;margin:0;">© 2024 QuantWealth AI Technologies Pvt. Ltd. · Mumbai, India</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email,
      subject: `${otp} is your QuantWealth AI verification code`,
      html: emailHtml
    });
  }

  static async generateAndSendPhoneOTP(user: IUser): Promise<void> {
    const otp = this.generateOTP();
    const expiresAt = this.getExpiryTime();

    // Save OTP to user
    user.otp = {
      code: otp,
      expiresAt,
      type: 'phone'
    };
    await user.save();

    // Note: For SMS, you'd integrate with Twilio or other SMS provider
    // This is a placeholder for SMS integration
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = require('twilio');
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      await client.messages.create({
        body: `Your QuantWealth AI verification code is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phoneNumber!
      });
    } else {
      // For development, just log the OTP
      console.log(`📱 SMS OTP for ${user.phoneNumber}: ${otp}`);
    }
  }

  static async verifyOTP(userId: string, otp: string, type: 'email' | 'phone'): Promise<boolean> {
    const user = await User.findById(userId);
    
    if (!user || !user.otp) {
      return false;
    }

    if (user.otp.code !== otp || user.otp.type !== type) {
      return false;
    }

    if (new Date() > user.otp.expiresAt!) {
      return false;
    }

    // OTP verified - update user status
    if (type === 'email') {
      user.isEmailVerified = true;
    } else {
      user.isPhoneVerified = true;
    }

    // Clear OTP
    user.otp = undefined;
    await user.save();

    return true;
  }

  static async resendOTP(userId: string, type: 'email' | 'phone'): Promise<void> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (type === 'email') {
      await this.generateAndSendEmailOTP(user);
    } else {
      if (!user.phoneNumber) {
        throw new Error('Phone number not registered');
      }
      await this.generateAndSendPhoneOTP(user);
    }
  }
}
