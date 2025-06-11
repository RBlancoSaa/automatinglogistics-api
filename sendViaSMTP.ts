import nodemailer from 'nodemailer';
import fs from 'fs';

interface SendMailProps {
  to: string;
  subject: string;
  attachments: {
    filename: string;
    path: string;
  }[];
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export default async function sendViaSMTP({ to, subject, attachments }: SendMailProps) {
  const info = await transporter.sendMail({
    from: `"Easytrip Automator" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    text: 'Automatisch gegenereerd .easy-bestand (inclusief PDF) door Automation Logistics',
    attachments
  });

  console.log(`📧 E-mail verzonden naar ${to}: ${info.messageId}`);
}
