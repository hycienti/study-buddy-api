import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';


@Injectable()
export class EmailService {

    private resend: Resend;

    constructor() {
        const apiKey = (process.env.RESEND_API_KEY || '').trim();
        this.resend = new Resend(apiKey);
    }

    async sendEmail(to: string, subject: string, body: string) {
        return await this.resend.emails.send({
            // from: 'Studybuddy <tech@zentry.com.ng>',
            from: 'Studybuddy <onboarding@resend.dev>',
            to,
            subject,
            html: body,
        });
    }

    sendVerificationEmail(to: string, token: string) {
        const verificationUrl = `https://yourdomain.com/verify?token=${token}`;
        const subject = 'Verify your email';
        const body = this.generateBaseTemplate(`
        <tr>
            <td style="padding: 40px 30px; background-color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                <td style="padding-bottom: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                    Hello,
                </td>
                </tr>
                <tr>
                <td style="padding-bottom: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                    Thank you for signing up! To complete your registration, please verify your email address.
                </td>
                </tr>
                <tr>
                <td style="padding-bottom: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                    Your verification token is: <strong>${token}</strong>
                </td>
                </tr>
                <tr>
                <td style="padding-bottom: 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                    Please verify your email by clicking the button below:
                </td>
                </tr>
                <tr>
                <td style="text-align: center; padding: 20px 0;">
                    <a href="${verificationUrl}" style="background-color: #3498db; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
                </td>
                </tr>
                <tr>
                <td style="padding-top: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                    If you did not sign up, please ignore this email.
                </td>
                </tr>
                <tr>
                <td style="padding-top: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                    Thank you!
                </td>
                </tr>
            </table>
            </td>
        </tr>
        `);
        return this.sendEmail(to, subject, body);
    }

    sendPasswordResetEmail(to: string, token: string) {
        const subject = 'Reset your password';
        const verificationUrl = `https://ladx.io/auth/reset-password/${token}`;
        const body = this.generateBaseTemplate(`
        <tr>
            <td style="padding: 40px 30px; background-color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding-bottom: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hello,
                    </td>
                </tr>
                <tr>
                    <td style="padding-bottom: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        You requested to reset your password.
                    </td>
                </tr>
                <tr>
                    <td style="padding-bottom: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Please use the following token to reset your password:
                    </td>
                </tr>
                 <td style="text-align: center; padding: 20px 0;">
                    <a href="${verificationUrl}" style="background-color: #3498db; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
                </td>
                <tr>
                    <td style="padding: 20px 0; text-align: center;">
                        <span style="display: inline-block; background-color: #f1c40f; color: #2c3e50; padding: 12px 25px; border-radius: 5px; font-size: 18px; font-weight: bold; letter-spacing: 2px;">
                            ${token}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td style="padding-top: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        If you did not request this, please ignore this email.
                    </td>
                </tr>
                <tr>
                    <td style="padding-top: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Thank you!
                    </td>
                </tr>
            </table>
            </td>
        </tr>
        `);
        return this.sendEmail(to, subject, body);
    }

    sendWelcomeEmail(to: string) {
        const subject = 'Welcome to our service';
        const body = this.generateBaseTemplate(`
        <tr>
            <td style="padding: 40px 30px; background-color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
            <td style="padding-bottom: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello,
            </td>
            </tr>
            <tr>
            <td style="padding-bottom: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for signing up! We're excited to have you on board.
            </td>
            </tr>
            <tr>
            <td style="padding-top: 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you!
            </td>
            </tr>
            </table>
            </td>
        </tr>
        `);
        return this.sendEmail(to, subject, body);
    }
    sendAccountDeletionEmail(to: string) {
        const subject = 'Account deletion confirmation';
        const body = '<p>Your account has been deleted.</p>';
        return this.sendEmail(to, subject, body);
    }
    sendAccountUpdateEmail(to: string) {
        const subject = 'Account update confirmation';
        const body = '<p>Your account has been updated.</p>';
        return this.sendEmail(to, subject, body);
    }
    sendPasswordChangeEmail(to: string) {
        const subject = 'Password change confirmation';
        const body = '<p>Your password has been changed.</p>';
        return this.sendEmail(to, subject, body);
    }
    sendTwoFactorAuthEmail(to: string) {
        const subject = 'Two-factor authentication code';
        const body = '<p>Your two-factor authentication code is 123456.</p>';
        return this.sendEmail(to, subject, body);
    }
    sendEmailChangeEmail(to: string) {
        const subject = 'Email change confirmation';
        const body = '<p>Your email address has been changed.</p>';
        return this.sendEmail(to, subject, body);
    }
    sendSubscriptionEmail(to: string) {
        const subject = 'Subscription confirmation';
        const body = '<p>Your subscription has been confirmed.</p>';
        return this.sendEmail(to, subject, body);
    }
    sendUnsubscriptionEmail(to: string) {
        const subject = 'Unsubscription confirmation';
        const body = '<p>You have been unsubscribed.</p>';
        return this.sendEmail(to, subject, body);
    }

    generateBaseTemplate(body: string) {
        return `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f6f6;">
    <!-- Main Container -->
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <tr>
            <td style="padding: 30px 20px; background-color: #2c3e50; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Study Buddy</h1>
            </td>
        </tr>

        <!-- Content Section -->
        ${body}

        <!-- Footer -->
        <tr>
            <td style="padding: 30px 20px; background-color: #ecf0f1; text-align: center;">
                <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">
                    © 2025 Studybuddy. All rights reserved.
                </p>
                <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">
                    123 Business Street, City, Country
                </p>
                <p style="color: #666666; font-size: 12px; margin: 0;">
                    <a href="#" style="color: #3498db; text-decoration: none;">Unsubscribe</a> |
                    <a href="#" style="color: #3498db; text-decoration: none;">View in Browser</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
        `
    }
}
