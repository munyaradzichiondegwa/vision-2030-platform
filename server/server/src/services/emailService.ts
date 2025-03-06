import nodemailer from "nodemailer";
import environmentConfig from "../config/environment";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: environmentConfig.SMTP_HOST,
      port: environmentConfig.SMTP_PORT,
      secure: true,
      auth: {
        user: environmentConfig.SMTP_USER,
        pass: environmentConfig.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, verificationToken: string) {
    const verificationLink = `${environmentConfig.CLIENT_URL}/verify-email?token=${verificationToken}`;

    await this.transporter.sendMail({
      from: '"Your App" <noreply@yourapp.com>',
      to: email,
      subject: "Verify Your Email",
      html: `
        <h1>Verify Your Email</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}">Verify Email</a>
      `,
    });
  }
}

export default new EmailService();
