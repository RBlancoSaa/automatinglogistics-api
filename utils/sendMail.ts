import nodemailer from 'nodemailer';

export default async function sendMail({ subject, tekst, attachments }: {
  subject: string,
  tekst: string,
  attachments: { filename: string, path: string }[]
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: `"Automation Logistics" <${process.env.FROM_EMAIL}>`,
    to: process.env.TO_EMAIL,
    subject,
    text: tekst,
    attachments
  });
}
